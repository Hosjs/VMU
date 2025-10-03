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
        Schema::create('vehicle_brands', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // Tên hãng xe
            $table->string('slug')->unique(); // URL-friendly name
            $table->string('logo')->nullable(); // Logo hãng xe
            $table->string('country')->nullable(); // Quốc gia sản xuất
            $table->text('description')->nullable(); // Mô tả hãng xe
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicle_brands');
    }
};
