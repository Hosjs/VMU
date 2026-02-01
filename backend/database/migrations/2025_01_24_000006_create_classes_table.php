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
        Schema::create('classes', function (Blueprint $table) {
            $table->id();
            $table->string('class_name', 255);
            $table->string('maTrinhDoDaoTao', 10);
            $table->unsignedBigInteger('major_id');
            $table->integer('khoaHoc_id');
            $table->unsignedBigInteger('lecurer_id')->nullable();
            $table->enum('trangThai', ['DangHoc', 'DaTotNghiep', 'GiaiThe'])->default('DangHoc');
            $table->timestamps();
            $table->softDeletes();
            $table->unsignedBigInteger('createdBy')->nullable();

            // ✅ Foreign keys are now defined in Model relationships
            // No FK constraints in migration = easier maintenance & better performance

            // Indexes only (for query performance)
            $table->index('major_id');
            $table->index('khoaHoc_id');
            $table->index('trangThai');
            $table->index('maTrinhDoDaoTao');
            $table->index('lecurer_id');
            $table->index('createdBy');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('classes');
    }
};

