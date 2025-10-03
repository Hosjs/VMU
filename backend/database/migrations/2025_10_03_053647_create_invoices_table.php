<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique(); // Số hóa đơn
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('customer_id')->constrained()->onDelete('cascade');
            $table->foreignId('vehicle_id')->nullable()->constrained()->onDelete('set null');

            // QUAN TRỌNG: Kiểm soát nguồn xuất và quyền truy cập
            $table->enum('issuer', ['thang_truong', 'viet_nga'])->default('thang_truong'); // Ai xuất hóa đơn
            $table->boolean('admin_only_access')->default(false); // Chỉ admin được xem/sửa
            $table->foreignId('issuing_warehouse_id')->nullable()->constrained('warehouses')->onDelete('set null'); // Kho xuất hóa đơn

            // Thông tin cơ bản
            $table->date('invoice_date'); // Ngày lập hóa đơn
            $table->date('due_date')->nullable(); // Ngày hạn thanh toán

            // Thông tin khách hàng tại thời điểm lập hóa đơn
            $table->string('customer_name');
            $table->string('customer_phone');
            $table->string('customer_email')->nullable();
            $table->text('customer_address')->nullable();
            $table->string('customer_tax_code')->nullable(); // Mã số thuế khách hàng

            // Thông tin xe
            $table->string('vehicle_info')->nullable(); // Thông tin xe (brand + model + license)

            // Tổng tiền (GIÁ BÁO CHO KHÁCH)
            $table->decimal('subtotal', 15, 2); // Tổng tiền trước thuế và giảm giá
            $table->decimal('discount_amount', 15, 2)->default(0); // Giảm giá
            $table->decimal('discount_percent', 5, 2)->default(0); // % giảm giá
            $table->decimal('tax_amount', 15, 2)->default(0); // Tiền thuế VAT
            $table->decimal('tax_percent', 5, 2)->default(10); // % thuế VAT
            $table->decimal('total_amount', 15, 2); // Tổng tiền cuối cùng

            // CHI PHÍ THỰC TẾ (CHỈ ADMIN XEM ĐƯỢC)
            $table->decimal('actual_cost', 15, 2)->nullable(); // Chi phí thực tế
            $table->decimal('actual_profit', 15, 2)->nullable(); // Lợi nhuận thực tế
            $table->decimal('partner_settlement_cost', 15, 2)->default(0); // Chi phí quyết toán với gara liên kết

            // Trạng thái hóa đơn
            $table->enum('status', ['draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled'])->default('draft');

            // Thông tin thanh toán
            $table->decimal('paid_amount', 15, 2)->default(0); // Số tiền đã thanh toán
            $table->decimal('remaining_amount', 15, 2)->default(0); // Số tiền còn lại
            $table->enum('payment_status', ['unpaid', 'partial', 'paid', 'overpaid'])->default('unpaid');

            // Người tạo và xử lý
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->datetime('approved_at')->nullable();

            // Ghi chú
            $table->text('notes')->nullable(); // Ghi chú nội bộ
            $table->text('customer_notes')->nullable(); // Ghi chú cho khách hàng
            $table->text('terms_conditions')->nullable(); // Điều khoản và điều kiện

            // File đính kèm
            $table->json('attachments')->nullable(); // File hóa đơn PDF, hình ảnh

            $table->timestamps();

            $table->index(['customer_id', 'status']);
            $table->index(['invoice_date', 'status']);
            $table->index(['due_date', 'payment_status']);
            $table->index('invoice_number');
            $table->index(['issuer', 'admin_only_access']); // Để filter theo quyền
            $table->index(['issuing_warehouse_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
