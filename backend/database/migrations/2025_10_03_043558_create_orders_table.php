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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique(); // Số đơn hàng
            $table->foreignId('customer_id')->constrained()->onDelete('cascade');
            $table->foreignId('vehicle_id')->nullable()->constrained()->onDelete('set null');

            // Liên kết với service request (nếu có)
            $table->foreignId('service_request_id')->nullable()->constrained()->onDelete('set null');

            // Thông tin đơn hàng
            $table->enum('type', ['service', 'product', 'mixed']); // Loại đơn hàng
            $table->enum('status', [
                'draft', 'quoted', 'confirmed', 'in_progress', 'completed',
                'delivered', 'paid', 'cancelled'
            ])->default('draft');

            // Tài chính
            $table->decimal('quote_total', 15, 2)->default(0); // Tổng báo giá cho khách
            $table->decimal('settlement_total', 15, 2)->default(0); // Tổng thanh toán cho đối tác
            $table->decimal('discount', 15, 2)->default(0); // Giảm giá
            $table->decimal('tax_amount', 15, 2)->default(0); // Thuế
            $table->decimal('final_amount', 15, 2)->default(0); // Số tiền cuối cùng khách trả

            // Thông tin thanh toán
            $table->enum('payment_status', ['pending', 'partial', 'paid', 'refunded'])->default('pending');
            $table->enum('payment_method', ['cash', 'transfer', 'card', 'installment'])->nullable();
            $table->decimal('paid_amount', 15, 2)->default(0);

            // Thông tin nhân viên
            $table->foreignId('salesperson_id')->nullable()->constrained('users')->onDelete('set null'); // Nhân viên bán hàng
            $table->foreignId('technician_id')->nullable()->constrained('users')->onDelete('set null'); // Thợ kỹ thuật
            $table->foreignId('accountant_id')->nullable()->constrained('users')->onDelete('set null'); // Kế toán xử lý

            // Thời gian
            $table->datetime('quote_date')->nullable(); // Ngày báo giá
            $table->datetime('confirmed_date')->nullable(); // Ngày xác nhận
            $table->datetime('start_date')->nullable(); // Ngày bắt đầu làm
            $table->datetime('completion_date')->nullable(); // Ngày hoàn thành
            $table->datetime('delivery_date')->nullable(); // Ngày giao xe

            $table->text('notes')->nullable(); // Ghi chú
            $table->json('attachments')->nullable(); // File đính kèm

            $table->timestamps();

            $table->index(['customer_id', 'status']);
            $table->index(['order_number', 'status']);
            $table->index(['type', 'status']);
            $table->index('payment_status');
            $table->index(['salesperson_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
