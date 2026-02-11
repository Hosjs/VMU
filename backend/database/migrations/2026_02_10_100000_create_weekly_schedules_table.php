<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Table: weekly_schedules
     * Purpose: Quản lý lịch học theo tuần (VD: Tuần 4)
     */
    public function up(): void
    {
        Schema::create('weekly_schedules', function (Blueprint $table) {
            $table->id();
            $table->integer('stt')->comment('Thứ tự');
            $table->string('week_number', 20)->comment('Tuần học (VD: Tuần 4, Tuần 5)');
            $table->unsignedBigInteger('class_id')->comment('ID lớp học');
            $table->unsignedBigInteger('subject_id')->nullable()->comment('ID học phần');
            $table->string('subject_name', 255)->nullable()->comment('Tên học phần (manual input)');
            $table->unsignedBigInteger('lecturer_id')->nullable()->comment('ID giảng viên');
            $table->string('lecturer_name', 255)->nullable()->comment('Tên giảng viên (manual input)');
            $table->string('time_slot', 255)->nullable()->comment('Thời gian (VD: Thứ 2, 7h-9h)');
            $table->string('room', 100)->nullable()->comment('Phòng học (VD: P201, H.A1)');
            $table->text('ghi_chu')->nullable()->comment('Ghi chú');
            $table->timestamps();
            $table->softDeletes();

            // Indexes for performance
            $table->index('week_number');
            $table->index('class_id');
            $table->index('subject_id');
            $table->index('lecturer_id');

            // Note: Foreign keys should be defined in Model relationships for flexibility
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('weekly_schedules');
    }
};
