<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Tạo bảng teaching_sessions để quản lý từng buổi học cụ thể
     * Mỗi teaching_assignment (khóa học) sẽ có nhiều teaching_sessions (buổi học)
     */
    public function up(): void
    {
        Schema::create('teaching_sessions', function (Blueprint $table) {
            $table->id();

            // Foreign keys defined in Model
            $table->unsignedBigInteger('teaching_assignment_id')
                ->comment('ID khóa học cha');

            // Session details - có thể override từ parent
            $table->unsignedBigInteger('lecturer_id')
                ->nullable()
                ->comment('Giảng viên (có thể khác với parent nếu thay giảng viên)');

            // Date and time
            $table->date('session_date')->comment('Ngày học cụ thể');
            $table->time('start_time')->comment('Giờ bắt đầu');
            $table->time('end_time')->comment('Giờ kết thúc');
            $table->string('room', 50)->nullable()->comment('Phòng học');

            // Session metadata
            $table->integer('session_number')->default(1)->comment('Buổi thứ mấy trong khóa');
            $table->enum('status', [
                'scheduled',    // Đã lên lịch
                'in_progress',  // Đang diễn ra
                'completed',    // Đã hoàn thành
                'cancelled',    // Đã hủy
                'rescheduled',  // Đã đổi lịch
            ])->default('scheduled');

            // Additional info
            $table->text('notes')->nullable()->comment('Ghi chú (nội dung bài giảng, bài tập,...)');
            $table->text('cancellation_reason')->nullable()->comment('Lý do hủy/đổi lịch');

            // Tracking
            $table->timestamp('actual_start_time')->nullable()->comment('Thời gian bắt đầu thực tế');
            $table->timestamp('actual_end_time')->nullable()->comment('Thời gian kết thúc thực tế');

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('session_date');
            $table->index('status');
            $table->index(['teaching_assignment_id', 'session_number']);
            $table->index(['lecturer_id', 'session_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teaching_sessions');
    }
};
