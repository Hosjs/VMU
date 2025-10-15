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
            $table->string('name'); // Tên dịch vụ (6 dịch vụ trung tâm)
            $table->string('code')->unique(); // Mã dịch vụ
            $table->text('description')->nullable(); // Mô tả dịch vụ
            $table->unsignedBigInteger('category_id'); // Danh mục dịch vụ

            $table->string('unit')->default('lần'); // Đơn vị tính
            $table->integer('estimated_time')->default(60); // Thời gian ước tính (phút)

            // Ảnh minh họa
            $table->string('main_image')->nullable(); // Ảnh chính
            $table->text('gallery_images')->nullable(); // Danh sách URL ảnh phụ, cách nhau bởi dấu |

            $table->text('notes')->nullable(); // Ghi chú về dịch vụ

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
