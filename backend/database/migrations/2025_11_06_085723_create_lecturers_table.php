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
        // Kiểm tra nếu bảng đã tồn tại thì bỏ qua (vì đã tạo trực tiếp trong DB)
        if (Schema::hasTable('lecturers')) {
            return;
        }

        Schema::create('lecturers', function (Blueprint $table) {
            $table->id();
            $table->string('hoTen');
            $table->string('trinhDoChuyenMon')->nullable();
            $table->string('hocHam')->nullable();
            $table->unsignedBigInteger('maNganh')->nullable();
            $table->text('ghiChu')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Foreign key
            $table->foreign('maNganh')->references('id')->on('majors')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lecturers');
    }
};
