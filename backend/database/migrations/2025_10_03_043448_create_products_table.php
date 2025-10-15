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
            $table->string('name'); // Tên phụ tùng
            $table->string('code')->unique(); // Mã sản phẩm
            $table->string('sku')->unique(); // SKU
            $table->text('description')->nullable(); // Mô tả sản phẩm
            $table->unsignedBigInteger('category_id'); // Danh mục phụ tùng
            $table->unsignedBigInteger('primary_warehouse_id')->nullable();

            // Liên kết với hãng xe và dòng xe (phụ tùng theo xe)
            $table->unsignedBigInteger('vehicle_brand_id')->nullable(); // Hãng xe tương thích
            $table->unsignedBigInteger('vehicle_model_id')->nullable(); // Dòng xe tương thích
            $table->text('compatible_years')->nullable(); // Năm xe tương thích: 2018,2019,2020
            $table->boolean('is_universal')->default(false); // Phụ tùng dùng chung cho nhiều xe

            // Giá nhập từ nhà cung cấp (sẽ cập nhật khi nhập hàng)
            $table->decimal('cost_price', 15, 2)->default(0); // Giá nhập gần nhất
            $table->decimal('suggested_price', 15, 2)->nullable(); // Giá đề xuất bán (tham khảo)

            $table->string('unit')->default('cái'); // Đơn vị tính

            // Ảnh minh họa
            $table->string('main_image')->nullable(); // Ảnh chính
            $table->text('gallery_images')->nullable(); // Danh sách URL ảnh phụ, cách nhau bởi dấu |

            $table->text('specifications')->nullable(); // Thông số kỹ thuật

            // Hệ thống kho
            $table->boolean('is_stockable')->default(true);
            $table->boolean('track_by_serial')->default(false); // Theo dõi theo số serial
            $table->boolean('track_by_batch')->default(false); // Theo dõi theo lô hàng
            $table->integer('shelf_life_days')->nullable(); // Hạn sử dụng (ngày)
            $table->boolean('track_stock')->default(true); // Có theo dõi tồn kho không

            // Bảo hành
            $table->boolean('has_warranty')->default(false);
            $table->integer('warranty_months')->default(0); // Số tháng bảo hành

            // Thông tin nhà cung cấp
            $table->unsignedBigInteger('supplier_id')->nullable(); // Nhà cung cấp chính
            $table->string('supplier_code')->nullable(); // Mã SP của nhà cung cấp

            // Ngưỡng tồn kho
            $table->integer('min_stock_level')->default(0);
            $table->integer('max_stock_level')->default(0);
            $table->integer('reorder_point')->default(0);

            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['category_id', 'is_active']);
            $table->index(['vehicle_brand_id', 'vehicle_model_id']);
            $table->index(['is_universal', 'is_active']);
            $table->index(['supplier_id', 'is_active']);
            $table->index('code');
            $table->index('sku');
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
