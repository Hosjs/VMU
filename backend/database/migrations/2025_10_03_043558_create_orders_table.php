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
            $table->string('order_number')->unique();
            $table->unsignedBigInteger('customer_id');
            $table->unsignedBigInteger('vehicle_id')->nullable();
            $table->unsignedBigInteger('service_request_id')->nullable();

            // Thông tin đơn hàng
            $table->enum('type', ['service', 'product', 'mixed']);
            $table->enum('status', [
                'draft', 'quoted', 'confirmed', 'in_progress', 'completed',
                'delivered', 'paid', 'cancelled'
            ])->default('draft');

            // Tài chính
            $table->decimal('quote_total', 15, 2)->default(0); // Tổng báo giá cho khách
            $table->decimal('settlement_total', 15, 2)->default(0); // Tổng thanh toán cho đối tác
            $table->decimal('discount', 15, 2)->default(0);
            $table->decimal('tax_amount', 15, 2)->default(0);
            $table->decimal('final_amount', 15, 2)->default(0);

            // Thông tin thanh toán
            $table->enum('payment_status', ['pending', 'partial', 'paid', 'refunded'])->default('pending');
            $table->enum('payment_method', ['cash', 'transfer', 'card', 'installment'])->nullable();
            $table->decimal('paid_amount', 15, 2)->default(0);

            // Thông tin nhân viên
            $table->unsignedBigInteger('salesperson_id')->nullable();
            $table->unsignedBigInteger('technician_id')->nullable(); // Kỹ thuật viên chính Thắng Trường
            $table->unsignedBigInteger('accountant_id')->nullable();

            // THÊM: Thông tin gara liên kết và kỹ thuật viên phụ trách
            $table->unsignedBigInteger('partner_provider_id')->nullable(); // Gara liên kết nhận sửa
            $table->unsignedBigInteger('partner_coordinator_id')->nullable(); // Người điều phối bên gara liên kết
            $table->string('partner_coordinator_name')->nullable(); // Tên người điều phối (backup)
            $table->string('partner_coordinator_phone')->nullable(); // SĐT người điều phối

            // Thời gian
            $table->datetime('quote_date')->nullable();
            $table->datetime('confirmed_date')->nullable();
            $table->datetime('start_date')->nullable();
            $table->datetime('completion_date')->nullable();
            $table->datetime('delivery_date')->nullable();

            // THÊM: Thời gian bàn giao cho gara liên kết
            $table->datetime('partner_handover_date')->nullable(); // Ngày bàn giao cho gara liên kết
            $table->datetime('partner_return_date')->nullable(); // Ngày nhận lại từ gara liên kết

            $table->text('notes')->nullable();
            $table->text('attachment_urls')->nullable(); // Thay JSON bằng text: URL|URL|URL

            $table->timestamps();

            $table->index(['customer_id', 'status']);
            $table->index(['order_number', 'status']);
            $table->index(['type', 'status']);
            $table->index('payment_status');
            $table->index(['salesperson_id', 'status']);
            $table->index(['partner_provider_id', 'status']); // Index mới
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
