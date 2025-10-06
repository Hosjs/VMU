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
            $table->unsignedBigInteger('order_id');

            // Loại item
            $table->enum('item_type', ['service', 'product']);
            $table->unsignedBigInteger('service_id')->nullable();
            $table->unsignedBigInteger('product_id')->nullable();

            // Thông tin item (lưu snapshot tại thời điểm đặt hàng)
            $table->string('item_name');
            $table->string('item_code');
            $table->text('item_description')->nullable();

            // Số lượng và giá
            $table->decimal('quantity', 8, 2)->default(1);
            $table->string('unit')->default('lần');

            // Giá báo cho khách
            $table->decimal('quote_unit_price', 15, 2);
            $table->decimal('quote_total_price', 15, 2);

            // Giá quyết toán với đối tác
            $table->decimal('settlement_unit_price', 15, 2);
            $table->decimal('settlement_total_price', 15, 2);

            // Giảm giá cho item này
            $table->decimal('discount_amount', 15, 2)->default(0);
            $table->decimal('discount_percent', 5, 2)->default(0);

            // Trạng thái thực hiện
            $table->enum('status', ['pending', 'in_progress', 'completed', 'cancelled'])->default('pending');
            $table->unsignedBigInteger('assigned_technician')->nullable(); // Xóa foreignId

            // THÊM: Kỹ thuật viên tại gara liên kết (nếu công việc được giao cho đối tác)
            $table->unsignedBigInteger('partner_technician_id')->nullable(); // ID kỹ thuật viên gara liên kết
            $table->string('partner_technician_name')->nullable(); // Tên kỹ thuật viên (backup)

            // Thời gian thực hiện
            $table->datetime('start_time')->nullable();
            $table->datetime('completion_time')->nullable();
            $table->integer('actual_duration')->nullable();

            // Bảo hành
            $table->boolean('has_warranty')->default(false);
            $table->integer('warranty_months')->default(0);
            $table->date('warranty_start_date')->nullable();
            $table->date('warranty_end_date')->nullable();

            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['order_id', 'item_type']);
            $table->index(['service_id', 'status']);
            $table->index(['product_id', 'status']);
            $table->index('assigned_technician');
            $table->index('partner_technician_id'); // Index mới
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
