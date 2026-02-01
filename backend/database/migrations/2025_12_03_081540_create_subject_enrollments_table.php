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
        Schema::create('subject_enrollments', function (Blueprint $table) {
            $table->id();
            $table->string('maHV');
            $table->unsignedBigInteger('subject_id');
            $table->unsignedBigInteger('major_id');
            $table->integer('namHoc');
            $table->string('hocKy')->nullable();
            $table->enum('trangThai', ['DangHoc', 'DaHoanThanh', 'Huy'])->default('DangHoc');
            $table->timestamps();
            $table->softDeletes();

            // Indexes (FKs defined in Model)
            $table->index('maHV');
            $table->index('subject_id');
            $table->index('major_id');
            $table->unique(['maHV', 'subject_id', 'namHoc']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subject_enrollments');
    }
};
