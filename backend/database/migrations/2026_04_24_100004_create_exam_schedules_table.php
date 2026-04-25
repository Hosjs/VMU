<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exam_schedules', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('khoa_hoc_id');
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->string('subject_name', 255);
            $table->unsignedBigInteger('class_id')->nullable();
            $table->string('class_name', 100)->nullable();
            $table->dateTime('exam_start');
            $table->dateTime('exam_end');
            $table->unsignedBigInteger('room_id')->nullable();
            $table->string('room', 100)->nullable();
            $table->unsignedBigInteger('supervisor_1_id')->nullable();
            $table->unsignedBigInteger('supervisor_2_id')->nullable();
            $table->enum('exam_type', ['regular', 'retake', 'makeup'])->default('regular');
            $table->text('note')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['khoa_hoc_id', 'exam_start']);
            $table->index('subject_id');
            $table->index('class_id');

            // Same room can't host two exams with the exact same start time.
            $table->unique(['room_id', 'exam_start'], 'uniq_exam_room_time');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_schedules');
    }
};
