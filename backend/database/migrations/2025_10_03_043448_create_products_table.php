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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Tên sản phẩm
            $table->string('code')->unique(); // Mã sản phẩm
            $table->string('sku')->unique(); // SKU
            $table->text('description')->nullable(); // Mô tả sản phẩm
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->foreignId('primary_warehouse_id')->nullable()->constrained('warehouses')->onDelete('set null');

            // Giá báo cho khách hàng
            $table->decimal('quote_price', 15, 2)->default(0); // Giá báo cho khách
            // Giá quyết toán với đối tác
            $table->decimal('settlement_price', 15, 2)->default(0); // Giá thanh toán cho đối tác

            $table->string('unit')->default('cái'); // Đơn vị tính
            $table->json('images')->nullable(); // Hình ảnh sản phẩm
            $table->text('specifications')->nullable(); // Thông số kỹ thuật

            // Hệ thống kho mới
            $table->boolean('is_stockable')->default(true);
            $table->boolean('track_by_serial')->default(false);
            $table->boolean('track_by_batch')->default(false);
            $table->integer('shelf_life_days')->nullable();
            $table->boolean('auto_transfer_enabled')->default(true);
            $table->integer('transfer_threshold')->default(5);
            $table->boolean('track_stock')->default(true); // Có theo dõi tồn kho không

            // Bảo hành
            $table->boolean('has_warranty')->default(false);
            $table->integer('warranty_months')->default(0); // Số tháng bảo hành

            // Thông tin nhà cung cấp
            $table->string('supplier_name')->nullable();
            $table->string('supplier_code')->nullable();

            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['category_id', 'is_active']);
            $table->index(['code', 'sku']);
            $table->index(['primary_warehouse_id', 'is_stockable']);
            $table->index(['track_by_serial', 'track_by_batch']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
