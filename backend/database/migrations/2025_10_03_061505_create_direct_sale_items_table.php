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
            $table->unsignedBigInteger('direct_sale_id');
            $table->unsignedBigInteger('product_id');

            // Thông tin sản phẩm (snapshot tại thời điểm bán)
            $table->string('product_name');
            $table->string('product_code');
            $table->string('product_sku');
            $table->text('product_description')->nullable();

            // Số lượng và đơn vị
            $table->integer('quantity');
            $table->string('unit');

            // Giá bán - THÔNG TIN NHẠY CẢM
            $table->decimal('unit_price', 15, 2);
            $table->decimal('line_total', 15, 2);
            $table->decimal('discount_amount', 15, 2)->default(0);

            // Giá vốn - CHỈ ADMIN XEM
            $table->decimal('unit_cost', 15, 2);
            $table->decimal('total_cost', 15, 2);
            $table->decimal('line_profit', 15, 2);
            $table->decimal('profit_margin', 5, 2);

            // Thuế
            $table->decimal('tax_rate', 5, 2)->default(10);
            $table->decimal('tax_amount', 15, 2)->default(0);
            $table->boolean('is_tax_exempt')->default(false);

            // Thông tin kho
            $table->string('warehouse_location')->nullable();
            $table->string('batch_number')->nullable();
            $table->string('serial_number')->nullable();
            $table->date('expiry_date')->nullable();

            // Bảo hành (nếu có)
            $table->boolean('has_warranty')->default(false);
            $table->integer('warranty_months')->default(0);
            $table->date('warranty_start_date')->nullable();
            $table->date('warranty_end_date')->nullable();

            // Trạng thái và xử lý
            $table->enum('status', ['pending', 'picked', 'packed', 'delivered', 'returned'])->default('pending');
            $table->unsignedBigInteger('picked_by')->nullable();
            $table->datetime('picked_at')->nullable();

            // Ghi chú
            $table->text('notes')->nullable();
            $table->text('customer_notes')->nullable();

            // Theo dõi xuất kho
            $table->unsignedBigInteger('stock_movement_id')->nullable();

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
