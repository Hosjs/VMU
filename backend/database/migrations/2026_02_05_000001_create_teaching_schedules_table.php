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
        Schema::create('teaching_schedules', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('major_id')->comment('ID ngành học');
            $table->integer('khoa_hoc_id')->comment('ID kỳ học');
            $table->string('semester_code', 50)->comment('Mã kỳ học: VD QLKT 2025.2.1');
            $table->integer('stt')->comment('Số thứ tự');
            $table->string('ten_hoc_phan', 255)->comment('Tên học phần');
            $table->integer('so_tin_chi')->comment('Số tín chỉ');
            $table->string('can_bo_giang_day', 500)->comment('Cán bộ giảng dạy (có thể nhiều người)');
            $table->string('tuan', 100)->nullable()->comment('Tuần học (VD: Tuần 46, 47, 48, 49/2025)');
            $table->string('ngay', 255)->nullable()->comment('Ngày học cụ thể');
            $table->text('ghi_chu')->nullable()->comment('Ghi chú');
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('major_id');
            $table->index('khoa_hoc_id');
            $table->index('semester_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teaching_schedules');
    }
};
