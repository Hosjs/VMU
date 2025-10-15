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
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Tên danh mục: Dầu máy, Lốp xe, Động cơ, Phanh...
            $table->string('code')->unique(); // Mã danh mục: OIL, TIRE, ENGINE, BRAKE
            $table->string('slug')->unique(); // URL-friendly name
            $table->text('description')->nullable(); // Mô tả danh mục
            $table->string('image')->nullable(); // Hình ảnh danh mục
            $table->unsignedBigInteger('parent_id')->nullable(); // Danh mục cha (phân cấp)
            $table->integer('sort_order')->default(0); // Thứ tự sắp xếp
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // CHỈ quản lý PHỤ TÙNG/SẢN PHẨM, KHÔNG có type
            $table->index('is_active');
            $table->index(['parent_id', 'sort_order']);
            $table->index('code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
