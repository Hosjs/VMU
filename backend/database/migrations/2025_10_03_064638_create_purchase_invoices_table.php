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
        // Đổi tên thành simple_purchase_orders - chỉ để quyết toán với gara liên kết
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id();
            $table->string('purchase_order_number')->unique(); // Số đơn mua hàng nội bộ

            // Gara liên kết cung cấp hàng
            $table->foreignId('provider_id')->constrained()->onDelete('cascade');
            $table->foreignId('supplier_warehouse_id')->constrained('warehouses')->onDelete('cascade');

            // Liên kết với đơn hàng gốc
            $table->foreignId('order_id')->nullable()->constrained()->onDelete('set null');

            // Thông tin đơn giản cho quyết toán
            $table->decimal('total_amount', 15, 2); // Tổng tiền quyết toán với gara liên kết
            $table->text('items_summary'); // Tóm tắt hàng hóa

            // Trạng thái đơn giản
            $table->enum('status', ['pending', 'confirmed', 'completed', 'settled'])->default('pending');

            // Người xử lý
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');

            $table->date('order_date');
            $table->datetime('approved_at')->nullable();

            $table->text('notes')->nullable();

            $table->timestamps();

            $table->index(['provider_id', 'status']);
            $table->index(['order_date', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_orders');
    }
};
