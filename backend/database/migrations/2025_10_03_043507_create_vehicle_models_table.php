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
        Schema::create('vehicle_models', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Tên dòng xe
            $table->string('slug'); // URL-friendly name
            $table->unsignedBigInteger('brand_id');
            $table->string('type')->nullable(); // Loại xe: sedan, suv, hatchback, etc.
            $table->integer('year_start')->nullable(); // Năm bắt đầu sản xuất
            $table->integer('year_end')->nullable(); // Năm kết thúc sản xuất
            $table->string('engine_type')->nullable(); // Loại động cơ
            $table->string('fuel_type')->nullable(); // Loại nhiên liệu
            $table->text('image_urls')->nullable(); // Thay JSON bằng text
            $table->text('description')->nullable(); // Mô tả
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['brand_id', 'is_active']);
            $table->index(['type', 'is_active']);
            $table->unique(['brand_id', 'slug']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicle_models');
    }
};
