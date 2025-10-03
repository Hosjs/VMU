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
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');

            // Loại item
            $table->enum('item_type', ['service', 'product']); // Dịch vụ hay sản phẩm
            $table->foreignId('service_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->nullable()->constrained()->onDelete('cascade');

            // Thông tin item (lưu snapshot tại thời điểm đặt hàng)
            $table->string('item_name'); // Tên dịch vụ/sản phẩm
            $table->string('item_code'); // Mã dịch vụ/sản phẩm
            $table->text('item_description')->nullable();

            // Số lượng và giá
            $table->decimal('quantity', 8, 2)->default(1); // Số lượng
            $table->string('unit')->default('lần'); // Đơn vị

            // Giá báo cho khách
            $table->decimal('quote_unit_price', 15, 2); // Đơn giá báo cho khách
            $table->decimal('quote_total_price', 15, 2); // Thành tiền báo cho khách

            // Giá quyết toán với đối tác
            $table->decimal('settlement_unit_price', 15, 2); // Đơn giá thanh toán đối tác
            $table->decimal('settlement_total_price', 15, 2); // Thành tiền thanh toán đối tác

            // Giảm giá cho item này
            $table->decimal('discount_amount', 15, 2)->default(0);
            $table->decimal('discount_percent', 5, 2)->default(0);

            // Trạng thái thực hiện
            $table->enum('status', ['pending', 'in_progress', 'completed', 'cancelled'])->default('pending');
            $table->foreignId('assigned_technician')->nullable()->constrained('users')->onDelete('set null');

            // Thời gian thực hiện
            $table->datetime('start_time')->nullable();
            $table->datetime('completion_time')->nullable();
            $table->integer('actual_duration')->nullable(); // Thời gian thực tế (phút)

            // Bảo hành
            $table->boolean('has_warranty')->default(false);
            $table->integer('warranty_months')->default(0);
            $table->date('warranty_start_date')->nullable();
            $table->date('warranty_end_date')->nullable();

            $table->text('notes')->nullable(); // Ghi chú cho item
            $table->timestamps();

            $table->index(['order_id', 'item_type']);
            $table->index(['service_id', 'status']);
            $table->index(['product_id', 'status']);
            $table->index('assigned_technician');
            $table->index('warranty_end_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
