<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Thiết lập dữ liệu mẫu và ràng buộc cho hệ thống mới
     */
    public function up(): void
    {
        // 1. Tạo warehouse mặc định cho Việt Nga và Thắng Trường (nếu chưa có)
        $vietNgaWarehouse = DB::table('warehouses')->where('code', 'VN')->first();
        if (!$vietNgaWarehouse) {
            DB::table('warehouses')->insert([
                'code' => 'VN',
                'name' => 'Kho Việt Nga',
                'type' => 'main',
                'address' => 'Kho chính Việt Nga',
                'district' => 'Quận 1',
                'province' => 'TP.HCM',
                'is_main_warehouse' => true,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        $thangTruongWarehouse = DB::table('warehouses')->where('code', 'TT')->first();
        if (!$thangTruongWarehouse) {
            DB::table('warehouses')->insert([
                'code' => 'TT',
                'name' => 'Kho Thắng Trường',
                'type' => 'main',
                'address' => 'Kho chính Thắng Trường',
                'district' => 'Quận 2',
                'province' => 'TP.HCM',
                'is_main_warehouse' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        // 2. Thêm các ràng buộc và trigger để đảm bảo tính nhất quán

        // Trigger để tự động tạo số quotation request
        DB::statement('
            CREATE TRIGGER auto_quotation_request_number
            BEFORE INSERT ON quotation_requests
            FOR EACH ROW
            BEGIN
                IF NEW.request_number IS NULL OR NEW.request_number = "" THEN
                    SET NEW.request_number = CONCAT("YC-", DATE_FORMAT(NOW(), "%Y%m%d"), "-",
                        LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(request_number, 12) AS UNSIGNED)), 0) + 1
                              FROM quotation_requests
                              WHERE DATE(created_at) = CURDATE()), 3, "0"));
                END IF;
            END
        ');

        // Trigger để tự động tạo số partner quotation
        DB::statement('
            CREATE TRIGGER auto_partner_quotation_number
            BEFORE INSERT ON partner_quotations
            FOR EACH ROW
            BEGIN
                DECLARE provider_code VARCHAR(10);
                SELECT code INTO provider_code FROM providers WHERE id = NEW.provider_id;

                IF NEW.quotation_number IS NULL OR NEW.quotation_number = "" THEN
                    SET NEW.quotation_number = CONCAT("BG-", provider_code, "-", DATE_FORMAT(NOW(), "%Y%m%d"), "-",
                        LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(quotation_number, -3) AS UNSIGNED)), 0) + 1
                              FROM partner_quotations
                              WHERE provider_id = NEW.provider_id AND DATE(created_at) = CURDATE()), 3, "0"));
                END IF;
            END
        ');

        // Trigger để tự động tạo số parts transfer
        DB::statement('
            CREATE TRIGGER auto_parts_transfer_number
            BEFORE INSERT ON parts_transfer_requests
            FOR EACH ROW
            BEGIN
                IF NEW.transfer_number IS NULL OR NEW.transfer_number = "" THEN
                    SET NEW.transfer_number = CONCAT("CK-", DATE_FORMAT(NOW(), "%Y%m%d"), "-",
                        LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transfer_number, 12) AS UNSIGNED)), 0) + 1
                              FROM parts_transfer_requests
                              WHERE DATE(created_at) = CURDATE()), 3, "0"));
                END IF;
            END
        ');

        // 3. Thêm index để tối ưu hiệu suất
        Schema::table('quotation_requests', function (Blueprint $table) {
            $table->index(['requested_at', 'status']);
            $table->index(['deadline', 'status']);
        });

        Schema::table('partner_quotations', function (Blueprint $table) {
            $table->index(['submitted_at', 'status']);
            $table->index(['parts_source', 'status']);
            $table->index('total_cost');
        });

        Schema::table('parts_transfer_requests', function (Blueprint $table) {
            $table->index(['requested_at', 'status']);
            $table->index(['transfer_type', 'status']);
            $table->index('total_value');
        });

        // 4. Tạo view để dễ dàng query dữ liệu
        DB::statement('
            CREATE OR REPLACE VIEW service_workflow_summary AS
            SELECT
                sr.id as service_request_id,
                sr.code as request_code,
                sr.customer_name,
                sr.customer_phone,
                sr.processing_stage,
                sr.status as request_status,
                p.name as provider_name,
                pq.quotation_number,
                pq.total_cost as partner_cost,
                o.order_number,
                o.final_amount as customer_amount,
                o.thang_truong_profit,
                i.invoice_number,
                i.issuer as invoice_issuer,
                s.settlement_number,
                s.settlement_with
            FROM service_requests sr
            LEFT JOIN providers p ON sr.selected_provider_id = p.id
            LEFT JOIN quotation_requests qr ON sr.id = qr.service_request_id
            LEFT JOIN partner_quotations pq ON qr.id = pq.quotation_request_id
            LEFT JOIN orders o ON sr.id = o.service_request_id
            LEFT JOIN invoices i ON o.id = i.order_id
            LEFT JOIN settlements s ON o.id = s.order_id
        ');

        // 5. Tạo view cho báo cáo tài chính
        DB::statement('
            CREATE OR REPLACE VIEW financial_summary AS
            SELECT
                DATE_FORMAT(o.created_at, "%Y-%m") as month_year,
                o.invoice_issuer,
                COUNT(*) as total_orders,
                SUM(o.final_amount) as total_customer_revenue,
                SUM(o.partner_settlement_cost) as total_partner_cost,
                SUM(o.thang_truong_profit) as total_profit,
                ROUND(AVG(o.thang_truong_profit / o.final_amount * 100), 2) as avg_profit_margin
            FROM orders o
            WHERE o.status IN ("completed", "paid")
            GROUP BY DATE_FORMAT(o.created_at, "%Y-%m"), o.invoice_issuer
        ');

        // 6. Cập nhật các service_requests hiện có để có processing_stage mặc định
        DB::table('service_requests')
            ->whereNull('processing_stage')
            ->update(['processing_stage' => 'customer_submitted']);

        // 7. Cập nhật các orders hiện có
        DB::table('orders')
            ->whereNull('invoice_issuer')
            ->update([
                'invoice_issuer' => 'thang_truong',
                'parts_fulfillment' => 'no_parts',
                'admin_controlled' => false
            ]);

        // 8. Cập nhật các invoices hiện có
        DB::table('invoices')
            ->whereNull('issuer')
            ->update([
                'issuer' => 'thang_truong',
                'admin_only_access' => false
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Xóa views
        DB::statement('DROP VIEW IF EXISTS financial_summary');
        DB::statement('DROP VIEW IF EXISTS service_workflow_summary');

        // Xóa triggers
        DB::statement('DROP TRIGGER IF EXISTS auto_parts_transfer_number');
        DB::statement('DROP TRIGGER IF EXISTS auto_partner_quotation_number');
        DB::statement('DROP TRIGGER IF EXISTS auto_quotation_request_number');

        // Không xóa dữ liệu warehouses vì có thể đang được sử dụng
    }
};
