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
        Schema::create('lop', function (Blueprint $table) {
            $table->id();
            $table->string('tenLop', 100);
            $table->string('maTrinhDoDaoTao', 10);
            $table->string('maNganhHoc', 10);
            $table->integer('khoaHoc');
            $table->unsignedBigInteger('idGiaoVienChuNhiem')->nullable();
            $table->enum('trangThai', ['DangHoc', 'DaTotNghiep', 'GiaiThe'])->default('DangHoc');

            $table->timestamps();
            $table->softDeletes();
            $table->unsignedBigInteger('createdBy')->nullable();

            // Foreign keys
            $table->foreign('maTrinhDoDaoTao')->references('maTrinhDoDaoTao')->on('trinh_do_dao_tao')->onDelete('restrict');
            $table->foreign('maNganhHoc')->references('maNganh')->on('nganh_hoc')->onDelete('restrict');
            $table->foreign('createdBy')->references('id')->on('users')->onDelete('set null');

            // Index
            $table->index('khoaHoc');
            $table->index('trangThai');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lop');
    }
};
