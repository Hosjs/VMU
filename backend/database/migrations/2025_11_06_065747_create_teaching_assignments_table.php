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
        Schema::create('teaching_assignments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('lecturer_id'); // FK defined in Model
            $table->unsignedBigInteger('lop_id')->nullable(); // ID của bảng lop (cũ)
            $table->unsignedBigInteger('class_id')->nullable(); // ID của bảng classes
            $table->string('course_code', 255)->nullable(); // Mã học phần
            $table->string('course_name', 255); // Tên môn học
            $table->integer('credits')->default(0); // Số tín chỉ
            $table->date('start_date'); // Ngày bắt đầu
            $table->date('end_date'); // Ngày kết thúc
            $table->enum('day_of_week', ['saturday', 'sunday']); // Thứ 7 hoặc Chủ nhật
            $table->time('start_time'); // Giờ bắt đầu
            $table->time('end_time'); // Giờ kết thúc
            $table->string('room', 255)->nullable(); // Phòng học
            $table->string('class_name', 255)->nullable(); // Tên lớp
            $table->integer('student_count')->default(0); // Số lượng sinh viên
            $table->enum('status', ['scheduled', 'ongoing', 'completed', 'cancelled'])->default('scheduled');
            $table->text('notes')->nullable(); // Ghi chú
            $table->timestamps();
            $table->softDeletes();

            // Index để tìm kiếm nhanh
            $table->index(['lecturer_id', 'start_date', 'day_of_week']);
            $table->index(['status', 'start_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teaching_assignments');
    }
};
