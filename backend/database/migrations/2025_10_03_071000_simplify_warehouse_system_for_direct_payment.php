<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Đơn giản hóa hệ thống kho - chỉ quản lý kho Việt Nga
     * Khi gara liên kết có phụ tùng mà Việt Nga không có => thanh toán trực tiếp
     */
    public function up(): void
    {
        // 1. Cập nhật bảng warehouses - chỉ giữ lại kho Việt Nga
        Schema::table('warehouses', function (Blueprint $table) {
            // Thêm cột để đánh dấu warehouse sẽ bị vô hiệu hóa
            $table->boolean('is_partner_warehouse')->default(false)->after('type');
            $table->datetime('deactivated_at')->nullable()->after('is_active');
            $table->text('deactivation_reason')->nullable()->after('deactivated_at');
        });

        // 2. Tạo bảng partner_service_quotations để thay thế việc chuyển kho
        Schema::create('partner_service_quotations', function (Blueprint $table) {
            $table->id();
            $table->string('quotation_number')->unique(); // Số báo giá

            // Liên kết với service request và provider
            $table->foreignId('service_request_id')->constrained()->onDelete('cascade');
            $table->foreignId('provider_id')->constrained()->onDelete('cascade'); // Gara liên kết

            // Thông tin báo giá
            $table->enum('quotation_type', ['service_only', 'service_with_parts', 'parts_only']);
            // service_only: chỉ dịch vụ, service_with_parts: dịch vụ + phụ tùng, parts_only: chỉ phụ tùng

            // Chi phí dịch vụ
            $table->decimal('service_cost', 15, 2)->default(0); // Chi phí dịch vụ
            $table->decimal('parts_cost', 15, 2)->default(0); // Chi phí phụ tùng từ gara liên kết
            $table->decimal('total_cost', 15, 2); // Tổng chi phí

            // Thông tin thanh toán cho gara liên kết
            $table->enum('payment_method', ['transfer', 'cash', 'check'])->default('transfer');
            $table->boolean('viet_nga_pays_directly')->default(true); // Việt Nga thanh toán trực tiếp
            $table->decimal('commission_rate', 5, 2)->default(0); // % hoa hồng cho gara liên kết
            $table->decimal('commission_amount', 15, 2)->default(0); // Số tiền hoa hồng

            // Trạng thái báo giá
            $table->enum('status', ['draft', 'sent', 'approved', 'rejected', 'executed', 'paid'])->default('draft');

            // Thời gian
            $table->datetime('quoted_at')->nullable(); // Thời gian báo giá
            $table->datetime('approved_at')->nullable(); // Thời gian duyệt
            $table->datetime('executed_at')->nullable(); // Thời gian thực hiện
            $table->datetime('paid_at')->nullable(); // Thời gian thanh toán

            // Người xử lý
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');

            $table->text('notes')->nullable();
            $table->json('parts_list')->nullable(); // Danh sách phụ tùng (không cần quản lý tồn kho)

            $table->timestamps();

            $table->index(['service_request_id', 'status']);
            $table->index(['provider_id', 'status']);
            $table->index(['quotation_type', 'status']);
        });

        // 3. Tạo bảng partner_payments để quản lý thanh toán cho gara liên kết
        Schema::create('partner_payments', function (Blueprint $table) {
            $table->id();
            $table->string('payment_number')->unique(); // Số phiếu thanh toán

            $table->foreignId('quotation_id')->constrained('partner_service_quotations')->onDelete('cascade');
            $table->foreignId('provider_id')->constrained()->onDelete('cascade');

            // Thông tin thanh toán
            $table->decimal('service_amount', 15, 2)->default(0); // Tiền dịch vụ
            $table->decimal('parts_amount', 15, 2)->default(0); // Tiền phụ tùng
            $table->decimal('commission_amount', 15, 2)->default(0); // Hoa hồng
            $table->decimal('total_amount', 15, 2); // Tổng tiền thanh toán

            $table->enum('payment_method', ['bank_transfer', 'cash', 'check']);
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'cancelled'])->default('pending');

            // Thông tin ngân hàng (nếu chuyển khoản)
            $table->string('bank_name')->nullable();
            $table->string('account_number')->nullable();
            $table->string('account_holder')->nullable();
            $table->string('transaction_reference')->nullable(); // Mã giao dịch

            $table->date('payment_date'); // Ngày thanh toán
            $table->datetime('processed_at')->nullable(); // Thời gian xử lý

            $table->foreignId('processed_by')->nullable()->constrained('users')->onDelete('set null');

            $table->text('notes')->nullable();
            $table->json('attachments')->nullable(); // Chứng từ thanh toán

            $table->timestamps();

            $table->index(['provider_id', 'status']);
            $table->index(['payment_date', 'status']);
        });

        // 4. Cập nhật bảng orders để không liên kết với warehouse chuyển kho
        Schema::table('orders', function (Blueprint $table) {
            // Thêm cột để đánh dấu phụ tùng từ đâu
            $table->enum('parts_source', ['viet_nga_stock', 'partner_direct', 'mixed'])->default('viet_nga_stock')->after('total_amount');
            // viet_nga_stock: từ kho Việt Nga, partner_direct: gara liên kết cung cấp trực tiếp, mixed: hỗn hợp

            $table->foreignId('partner_quotation_id')->nullable()->after('parts_source')->constrained('partner_service_quotations')->onDelete('set null');

            // Đánh dấu không cần chuyển kho
            $table->boolean('requires_stock_transfer')->default(false)->after('partner_quotation_id');
            $table->text('fulfillment_notes')->nullable()->after('requires_stock_transfer'); // Ghi chú về cách thực hiện đơn hàng
        });

        // 5. Cập nhật bảng settlements để tính toán đúng với gara liên kết
        Schema::table('settlements', function (Blueprint $table) {
            // Chi phí thanh toán cho gara liên kết
            $table->decimal('partner_service_cost', 15, 2)->default(0)->after('total_amount');
            $table->decimal('partner_parts_cost', 15, 2)->default(0)->after('partner_service_cost');
            $table->decimal('partner_commission', 15, 2)->default(0)->after('partner_parts_cost');
            $table->decimal('net_profit_after_partner_costs', 15, 2)->default(0)->after('partner_commission');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Xóa các bảng mới tạo
        Schema::dropIfExists('partner_payments');
        Schema::dropIfExists('partner_service_quotations');

        // Xóa các cột đã thêm
        Schema::table('settlements', function (Blueprint $table) {
            $table->dropColumn([
                'partner_service_cost', 'partner_parts_cost',
                'partner_commission', 'net_profit_after_partner_costs'
            ]);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['partner_quotation_id']);
            $table->dropColumn([
                'parts_source', 'partner_quotation_id',
                'requires_stock_transfer', 'fulfillment_notes'
            ]);
        });

        Schema::table('warehouses', function (Blueprint $table) {
            $table->dropColumn([
                'is_partner_warehouse', 'deactivated_at', 'deactivation_reason'
            ]);
        });
    }
};
