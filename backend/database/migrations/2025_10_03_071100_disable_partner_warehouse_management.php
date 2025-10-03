<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Vô hiệu hóa các bảng quản lý kho không cần thiết
     * Chỉ giữ lại kho Việt Nga, loại bỏ quản lý kho gara liên kết
     */
    public function up(): void
    {
        // 1. Đánh dấu tất cả partner warehouses là không hoạt động
        DB::table('warehouses')
            ->where('type', 'partner')
            ->update([
                'is_active' => false,
                'is_partner_warehouse' => true,
                'deactivated_at' => now(),
                'deactivation_reason' => 'Chuyển sang mô hình thanh toán trực tiếp với gara liên kết, không cần quản lý kho'
            ]);

        // 2. Hủy tất cả stock transfers đang pending của partner warehouses
        DB::table('stock_transfers')
            ->whereIn('status', ['draft', 'pending'])
            ->where(function($query) {
                $query->whereIn('from_warehouse_id', function($subquery) {
                    $subquery->select('id')
                        ->from('warehouses')
                        ->where('type', 'partner');
                })
                ->orWhereIn('to_warehouse_id', function($subquery) {
                    $subquery->select('id')
                        ->from('warehouses')
                        ->where('type', 'partner');
                });
            })
            ->update([
                'status' => 'cancelled',
                'notes' => DB::raw("CONCAT(COALESCE(notes, ''), ' - Hủy do chuyển sang mô hình thanh toán trực tiếp')")
            ]);

        // 3. Thêm ràng buộc chỉ cho phép warehouses type = 'main' hoạt động
        Schema::table('warehouses', function (Blueprint $table) {
            // Thêm check constraint (MySQL 8.0.16+)
            if (DB::getDriverName() === 'mysql') {
                DB::statement('ALTER TABLE warehouses ADD CONSTRAINT chk_only_main_warehouse_active CHECK (
                    (type = "main" AND is_active = 1) OR
                    (type = "partner" AND is_active = 0)
                )');
            }
        });

        // 4. Cập nhật stock transfers để chỉ cho phép giữa main warehouses
        Schema::table('stock_transfers', function (Blueprint $table) {
            $table->boolean('is_internal_only')->default(true)->after('type');
            $table->text('restriction_notes')->nullable()->after('is_internal_only');
        });

        // 5. Thêm trigger hoặc business logic để ngăn chặn tạo stock transfer với partner warehouse
        DB::statement('
            CREATE TRIGGER prevent_partner_warehouse_transfers
            BEFORE INSERT ON stock_transfers
            FOR EACH ROW
            BEGIN
                DECLARE from_type VARCHAR(50);
                DECLARE to_type VARCHAR(50);

                SELECT type INTO from_type FROM warehouses WHERE id = NEW.from_warehouse_id;
                SELECT type INTO to_type FROM warehouses WHERE id = NEW.to_warehouse_id;

                IF from_type = "partner" OR to_type = "partner" THEN
                    SIGNAL SQLSTATE "45000"
                    SET MESSAGE_TEXT = "Không thể tạo chuyển kho với gara liên kết. Sử dụng hệ thống báo giá và thanh toán trực tiếp.";
                END IF;
            END
        ');

        // 6. Cập nhật direct_sales để chỉ cho phép từ main warehouse
        Schema::table('direct_sales', function (Blueprint $table) {
            $table->boolean('from_main_warehouse_only')->default(true)->after('warehouse_id');
        });

        // 7. Tạo view để chỉ hiển thị active main warehouses
        DB::statement('
            CREATE OR REPLACE VIEW active_warehouses AS
            SELECT * FROM warehouses
            WHERE type = "main" AND is_active = 1
        ');

        // 8. Cập nhật products để chỉ quản lý stock ở main warehouse
        Schema::table('products', function (Blueprint $table) {
            $table->boolean('managed_by_viet_nga_only')->default(true)->after('is_active');
            $table->text('partner_supply_notes')->nullable()->after('managed_by_viet_nga_only');
            // Ghi chú về việc gara liên kết có thể cung cấp phụ tùng này
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Xóa trigger
        DB::statement('DROP TRIGGER IF EXISTS prevent_partner_warehouse_transfers');

        // Xóa view
        DB::statement('DROP VIEW IF EXISTS active_warehouses');

        // Xóa constraint
        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE warehouses DROP CONSTRAINT IF EXISTS chk_only_main_warehouse_active');
        }

        // Khôi phục partner warehouses
        DB::table('warehouses')
            ->where('is_partner_warehouse', true)
            ->update([
                'is_active' => true,
                'deactivated_at' => null,
                'deactivation_reason' => null
            ]);

        // Xóa các cột đã thêm
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['managed_by_viet_nga_only', 'partner_supply_notes']);
        });

        Schema::table('direct_sales', function (Blueprint $table) {
            $table->dropColumn('from_main_warehouse_only');
        });

        Schema::table('stock_transfers', function (Blueprint $table) {
            $table->dropColumn(['is_internal_only', 'restriction_notes']);
        });
    }
};
