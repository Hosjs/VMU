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
            $table->string('name'); // Tên danh mục
            $table->string('slug')->unique(); // URL-friendly name
            $table->text('description')->nullable(); // Mô tả danh mục
            $table->string('type')->default('service'); // service hoặc product
            $table->string('image')->nullable(); // Hình ảnh danh mục
            $table->unsignedBigInteger('parent_id')->nullable(); // Không dùng foreignId
            $table->integer('sort_order')->default(0); // Thứ tự sắp xếp
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['type', 'is_active']);
            $table->index(['parent_id', 'sort_order']);
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
