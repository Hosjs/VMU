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
        Schema::create('direct_sale_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('direct_sale_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');

            // Thông tin sản phẩm (snapshot tại thời điểm bán)
            $table->string('product_name');
            $table->string('product_code');
            $table->string('product_sku');
            $table->text('product_description')->nullable();

            // Số lượng và đơn vị
            $table->integer('quantity');
            $table->string('unit');

            // Giá bán - THÔNG TIN NHẠY CẢM
            $table->decimal('unit_price', 15, 2); // Giá bán đơn vị
            $table->decimal('line_total', 15, 2); // Thành tiền
            $table->decimal('discount_amount', 15, 2)->default(0); // Giảm giá cho dòng này

            // Giá vốn - CHỈ ADMIN XEM
            $table->decimal('unit_cost', 15, 2); // Giá vốn đơn vị
            $table->decimal('total_cost', 15, 2); // Tổng giá vốn
            $table->decimal('line_profit', 15, 2); // Lợi nhuận dòng
            $table->decimal('profit_margin', 5, 2); // % lợi nhuận

            // Thuế
            $table->decimal('tax_rate', 5, 2)->default(10); // % thuế VAT
            $table->decimal('tax_amount', 15, 2)->default(0); // Tiền thuế
            $table->boolean('is_tax_exempt')->default(false); // Miễn thuế

            // Thông tin kho
            $table->string('warehouse_location')->nullable(); // Vị trí lấy hàng trong kho
            $table->string('batch_number')->nullable(); // Số lô
            $table->string('serial_number')->nullable(); // Số serial
            $table->date('expiry_date')->nullable(); // Hạn sử dụng

            // Bảo hành (nếu có)
            $table->boolean('has_warranty')->default(false);
            $table->integer('warranty_months')->default(0);
            $table->date('warranty_start_date')->nullable();
            $table->date('warranty_end_date')->nullable();

            // Trạng thái và xử lý
            $table->enum('status', ['pending', 'picked', 'packed', 'delivered', 'returned'])->default('pending');
            $table->foreignId('picked_by')->nullable()->constrained('users')->onDelete('set null');
            $table->datetime('picked_at')->nullable();

            // Ghi chú
            $table->text('notes')->nullable();
            $table->text('customer_notes')->nullable(); // Ghi chú cho khách hàng

            // Theo dõi xuất kho
            $table->foreignId('stock_movement_id')->nullable()->constrained()->onDelete('set null');

            $table->timestamps();

            $table->index(['direct_sale_id', 'status']);
            $table->index(['product_id', 'picked_at']);
            $table->index('batch_number');
            $table->index('serial_number');
            $table->index('warranty_end_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('direct_sale_items');
    }
};
