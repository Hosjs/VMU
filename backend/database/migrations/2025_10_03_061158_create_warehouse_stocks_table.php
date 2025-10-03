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
        Schema::create('warehouse_stocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('warehouse_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');

            // Số lượng tồn kho
            $table->integer('quantity')->default(0); // Số lượng hiện tại
            $table->integer('reserved_quantity')->default(0); // Số lượng đã được đặt trước
            $table->integer('available_quantity')->default(0); // Số lượng có thể bán

            // Giá trị tồn kho
            $table->decimal('unit_cost', 15, 2)->default(0); // Giá vốn trung bình
            $table->decimal('total_value', 15, 2)->default(0); // Tổng giá trị tồn kho

            // Mức tồn kho
            $table->integer('min_stock')->default(0); // Mức tồn kho tối thiểu
            $table->integer('max_stock')->default(0); // Mức tồn kho tối đa
            $table->integer('reorder_point')->default(0); // Điểm đặt hàng lại
            $table->integer('economic_order_quantity')->default(0); // Số lượng đặt hàng kinh tế

            // Vị trí trong kho
            $table->string('location_code')->nullable(); // Mã vị trí: A-01-01
            $table->string('shelf')->nullable(); // Kệ
            $table->string('row')->nullable(); // Hàng
            $table->string('position')->nullable(); // Vị trí

            // Thông tin cập nhật
            $table->datetime('last_movement_date')->nullable(); // Lần xuất/nhập cuối
            $table->datetime('last_stocktake_date')->nullable(); // Lần kiểm kê cuối
            $table->integer('movement_count')->default(0); // Số lần xuất nhập

            // Trạng thái đặc biệt
            $table->boolean('is_locked')->default(false); // Khóa không cho xuất nhập
            $table->boolean('is_damaged')->default(false); // Hàng hư hỏng
            $table->boolean('is_expired')->default(false); // Hàng hết hạn
            $table->date('expiry_date')->nullable(); // Ngày hết hạn

            $table->text('notes')->nullable();
            $table->timestamps();

            // Mỗi sản phẩm chỉ có 1 bản ghi trong 1 kho
            $table->unique(['warehouse_id', 'product_id']);

            $table->index(['warehouse_id', 'available_quantity']);
            $table->index(['product_id', 'quantity']);
            $table->index(['min_stock', 'quantity']); // Để cảnh báo hết hàng
            $table->index('location_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('warehouse_stocks');
    }
};
