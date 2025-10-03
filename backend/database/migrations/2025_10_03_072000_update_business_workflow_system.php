<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Cập nhật hệ thống theo nghiệp vụ mới:
     * - Khách gửi yêu cầu → Admin xử lý
     * - Admin tìm gara liên kết → Gara báo giá cho Thắng Trường
     * - Thắng Trường thanh toán cho gara (quyết toán)
     * - Admin báo giá cho khách → Hóa đơn từ Thắng Trường hoặc Việt Nga
     * - Hóa đơn từ Việt Nga chỉ admin xem được
     */
    public function up(): void
    {
        // 1. Cập nhật service_requests để rõ ràng hơn về luồng xử lý
        Schema::table('service_requests', function (Blueprint $table) {
            // Thêm trạng thái xử lý chi tiết
            $table->enum('processing_stage', [
                'customer_submitted',     // Khách gửi yêu cầu
                'admin_reviewing',        // Admin đang xem xét
                'finding_partner',        // Tìm gara liên kết
                'partner_quoting',        // Gara liên kết đang báo giá
                'admin_pricing',          // Admin đang định giá cho khách
                'customer_approving',     // Chờ khách duyệt
                'work_assigned',          // Đã giao việc
                'parts_sourcing',         // Đang tìm nguồn phụ tùng
                'work_in_progress',       // Đang thực hiện
                'settlement_pending',     // Chờ quyết toán
                'completed'               // Hoàn thành
            ])->default('customer_submitted')->after('status');

            // Admin phụ trách xử lý
            $table->foreignId('admin_handler')->nullable()->constrained('users')->onDelete('set null')->after('assigned_to');

            // Gara liên kết được chọn
            $table->foreignId('selected_provider_id')->nullable()->constrained('providers')->onDelete('set null')->after('admin_handler');

            // Thời gian xử lý các giai đoạn
            $table->datetime('admin_reviewed_at')->nullable()->after('contacted_at');
            $table->datetime('partner_found_at')->nullable()->after('admin_reviewed_at');
            $table->datetime('partner_quoted_at')->nullable()->after('partner_found_at');
            $table->datetime('customer_quoted_at')->nullable()->after('partner_quoted_at');
        });

        // 2. Tạo bảng quotation_requests để quản lý yêu cầu báo giá với gara liên kết
        Schema::create('quotation_requests', function (Blueprint $table) {
            $table->id();
            $table->string('request_number')->unique(); // Số yêu cầu báo giá: YC-YYYYMMDD-001

            $table->foreignId('service_request_id')->constrained()->onDelete('cascade');
            $table->foreignId('provider_id')->constrained()->onDelete('cascade');
            $table->foreignId('admin_id')->constrained('users')->onDelete('cascade');

            // Thông tin yêu cầu
            $table->json('required_services'); // Danh sách dịch vụ cần
            $table->json('required_parts')->nullable(); // Danh sách phụ tùng cần
            $table->text('work_description'); // Mô tả công việc
            $table->text('special_requirements')->nullable(); // Yêu cầu đặc biệt

            // Thời gian
            $table->datetime('requested_at'); // Thời gian yêu cầu
            $table->datetime('deadline')->nullable(); // Hạn báo giá
            $table->datetime('responded_at')->nullable(); // Thời gian gara phản hồi

            // Trạng thái
            $table->enum('status', ['sent', 'received', 'quoted', 'accepted', 'rejected', 'expired'])->default('sent');

            $table->text('admin_notes')->nullable();
            $table->json('attachments')->nullable(); // Hình ảnh, tài liệu

            $table->timestamps();

            $table->index(['service_request_id', 'status']);
            $table->index(['provider_id', 'status']);
            $table->index(['admin_id', 'status']);
            $table->index(['requested_at', 'status']);
            $table->index(['deadline', 'status']);
        });

        // 3. Tạo bảng partner_quotations để lưu báo giá từ gara liên kết
        Schema::create('partner_quotations', function (Blueprint $table) {
            $table->id();
            $table->string('quotation_number')->unique(); // Số báo giá: BG-[MaGara]-YYYYMMDD-001

            $table->foreignId('quotation_request_id')->constrained()->onDelete('cascade');
            $table->foreignId('provider_id')->constrained()->onDelete('cascade');

            // Chi tiết báo giá (GIÁ QUYẾT TOÁN VỚI THẮNG TRƯỜNG)
            $table->decimal('service_cost', 15, 2)->default(0); // Chi phí dịch vụ
            $table->decimal('parts_cost', 15, 2)->default(0); // Chi phí phụ tùng
            $table->decimal('labor_cost', 15, 2)->default(0); // Chi phí nhân công
            $table->decimal('other_costs', 15, 2)->default(0); // Chi phí khác
            $table->decimal('total_cost', 15, 2); // Tổng chi phí (CHỈ ADMIN XEM)

            // Thông tin phụ tùng
            $table->json('parts_breakdown')->nullable(); // Chi tiết phụ tùng
            $table->enum('parts_source', ['partner_stock', 'need_from_viet_nga', 'external_purchase'])->nullable();
            // partner_stock: gara có sẵn, need_from_viet_nga: cần từ Việt Nga, external_purchase: mua ngoài

            // Thời gian thực hiện
            $table->integer('estimated_hours')->nullable(); // Số giờ ước tính
            $table->datetime('estimated_completion')->nullable(); // Thời gian hoàn thành dự kiến

            // Điều khoản
            $table->text('terms_conditions')->nullable();
            $table->integer('warranty_months')->default(0); // Bảo hành (tháng)

            // Trạng thái
            $table->enum('status', ['draft', 'submitted', 'under_review', 'accepted', 'rejected'])->default('draft');

            // Kiểm soát quyền truy cập - CHỈ ADMIN XEM GIÁ THỰC
            $table->boolean('admin_only_pricing')->default(true); // Chỉ admin xem giá quyết toán

            // Người xử lý
            $table->string('provider_contact_person')->nullable();
            $table->datetime('submitted_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->datetime('reviewed_at')->nullable();

            $table->text('provider_notes')->nullable();
            $table->text('admin_notes')->nullable();
            $table->json('attachments')->nullable();

            $table->timestamps();

            $table->index(['quotation_request_id', 'status']);
            $table->index(['provider_id', 'status']);
            $table->index('parts_source');
            $table->index(['submitted_at', 'status']);
            $table->index(['admin_only_pricing', 'status']); // Để filter theo quyền
        });

        // 4. Tạo bảng parts_transfer_requests để quản lý chuyển phụ tùng từ Việt Nga
        Schema::create('parts_transfer_requests', function (Blueprint $table) {
            $table->id();
            $table->string('transfer_number')->unique(); // Số phiếu chuyển: CK-YYYYMMDD-001

            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('partner_quotation_id')->constrained()->onDelete('cascade');
            $table->foreignId('from_warehouse_id')->constrained('warehouses')->onDelete('cascade'); // Kho Việt Nga
            $table->foreignId('to_provider_id')->constrained('providers')->onDelete('cascade'); // Gara liên kết

            // Thông tin chuyển
            $table->json('parts_list'); // Danh sách phụ tùng cần chuyển (CHỈ ADMIN XEM GIÁ)
            $table->decimal('total_value', 15, 2); // Tổng giá trị (CHỈ ADMIN XEM)
            $table->enum('transfer_type', ['direct_to_partner', 'via_thang_truong'])->default('via_thang_truong');

            // Kiểm soát quyền truy cập
            $table->boolean('admin_only_access')->default(true); // Chỉ admin xem được

            // Trạng thái
            $table->enum('status', ['requested', 'approved', 'prepared', 'shipped', 'received', 'completed'])->default('requested');

            // Thời gian
            $table->datetime('requested_at');
            $table->datetime('approved_at')->nullable();
            $table->datetime('shipped_at')->nullable();
            $table->datetime('received_at')->nullable();

            // Người xử lý
            $table->foreignId('requested_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('shipped_by')->nullable()->constrained('users')->onDelete('set null');

            $table->text('notes')->nullable();
            $table->json('shipping_info')->nullable(); // Thông tin vận chuyển

            $table->timestamps();

            $table->index(['order_id', 'status']);
            $table->index(['from_warehouse_id', 'status']);
            $table->index(['to_provider_id', 'status']);
            $table->index(['requested_at', 'status']);
            $table->index(['admin_only_access', 'status']); // Để filter theo quyền
        });

        // 5. Cập nhật orders để liên kết với quotation và phân biệt nguồn phụ tùng
        Schema::table('orders', function (Blueprint $table) {
            // Liên kết với quotation
            $table->foreignId('partner_quotation_id')->nullable()->constrained()->onDelete('set null')->after('service_request_id');

            // Phân biệt ai xuất hóa đơn
            $table->enum('invoice_issuer', ['thang_truong', 'viet_nga'])->default('thang_truong')->after('type');

            // Quản lý phụ tùng
            $table->enum('parts_fulfillment', ['no_parts', 'from_viet_nga', 'from_partner', 'mixed'])->default('no_parts')->after('invoice_issuer');

            // Chi phí quyết toán với gara liên kết (CHỈ ADMIN THẤY)
            $table->decimal('partner_settlement_cost', 15, 2)->default(0)->after('final_amount');
            $table->decimal('thang_truong_profit', 15, 2)->default(0)->after('partner_settlement_cost'); // Lợi nhuận Thắng Trường

            // Kiểm soát quyền truy cập
            $table->boolean('admin_controlled')->default(false)->after('thang_truong_profit');
            // true: chỉ admin kiểm soát, false: nhân viên có thể xem một số thông tin
        });

        // 6. Cập nhật settlements để rõ ràng về quyết toán với gara liên kết
        Schema::table('settlements', function (Blueprint $table) {
            // Liên kết với quotation
            $table->foreignId('partner_quotation_id')->nullable()->constrained()->onDelete('set null')->after('provider_id');

            // Phân loại quyết toán
            $table->enum('settlement_with', ['thang_truong_partner', 'viet_nga_partner', 'internal'])->after('type');
            // thang_truong_partner: Thắng Trường quyết toán với gara liên kết
            // viet_nga_partner: Việt Nga quyết toán với gara liên kết (CHỈ ADMIN XEM)
            // internal: quyết toán nội bộ

            // Chi phí chuyển phụ tùng (nếu có) - CHỈ ADMIN XEM
            $table->decimal('parts_transfer_cost', 15, 2)->default(0)->after('final_payment');

            // Tổng chi phí thực tế - CHỈ ADMIN XEM
            $table->decimal('total_actual_cost', 15, 2)->default(0)->after('parts_transfer_cost');

            // So sánh với giá khách trả
            $table->decimal('customer_payment_amount', 15, 2)->nullable()->after('profit_percent');
            $table->decimal('net_profit_after_settlement', 15, 2)->default(0)->after('customer_payment_amount');

            // Kiểm soát quyền truy cập
            $table->boolean('admin_only_access')->default(false)->after('net_profit_after_settlement');
            // true khi settlement_with = 'viet_nga_partner'
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Xóa các bảng mới tạo
        Schema::dropIfExists('parts_transfer_requests');
        Schema::dropIfExists('partner_quotations');
        Schema::dropIfExists('quotation_requests');

        // Xóa các cột đã thêm
        Schema::table('settlements', function (Blueprint $table) {
            $table->dropForeign(['partner_quotation_id']);
            $table->dropColumn([
                'partner_quotation_id', 'settlement_with', 'parts_transfer_cost',
                'total_actual_cost', 'customer_payment_amount', 'net_profit_after_settlement',
                'admin_only_access'
            ]);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['partner_quotation_id']);
            $table->dropColumn([
                'partner_quotation_id', 'invoice_issuer', 'parts_fulfillment',
                'partner_settlement_cost', 'thang_truong_profit', 'admin_controlled'
            ]);
        });

        Schema::table('service_requests', function (Blueprint $table) {
            $table->dropForeign(['admin_handler']);
            $table->dropForeign(['selected_provider_id']);
            $table->dropColumn([
                'processing_stage', 'admin_handler', 'selected_provider_id',
                'admin_reviewed_at', 'partner_found_at', 'partner_quoted_at', 'customer_quoted_at'
            ]);
        });
    }
};
