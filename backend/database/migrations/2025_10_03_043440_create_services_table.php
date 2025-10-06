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
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Tên dịch vụ
            $table->string('code')->unique(); // Mã dịch vụ
            $table->text('description')->nullable(); // Mô tả dịch vụ
            $table->unsignedBigInteger('category_id'); // Không dùng foreignId

            // Giá báo cho khách hàng
            $table->decimal('quote_price', 15, 2)->default(0); // Giá báo cho khách
            // Giá quyết toán với đối tác
            $table->decimal('settlement_price', 15, 2)->default(0); // Giá thanh toán cho đối tác

            $table->string('unit')->default('lần'); // Đơn vị tính
            $table->integer('estimated_time')->default(60); // Thời gian ước tính (phút)

            // Thay JSON images bằng cột đơn giản
            $table->string('main_image')->nullable(); // Ảnh chính
            $table->text('gallery_images')->nullable(); // Danh sách URL ảnh phụ, cách nhau bởi dấu |

            $table->text('notes')->nullable(); // Ghi chú

            // Bảo hành
            $table->boolean('has_warranty')->default(false);
            $table->integer('warranty_months')->default(0); // Số tháng bảo hành

            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['category_id', 'is_active']);
            $table->index('code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
