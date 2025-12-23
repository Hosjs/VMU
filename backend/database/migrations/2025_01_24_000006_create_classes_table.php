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
            $table->string('major_id', 10);
            $table->integer('khoaHoc_id');
            $table->unsignedBigInteger('lecurer_id')->nullable();
            $table->enum('trangThai', ['DangHoc', 'DaTotNghiep', 'GiaiThe'])->default('DangHoc');
            $table->timestamps();
            $table->softDeletes();
            $table->unsignedBigInteger('createdBy')->nullable();

            // Foreign keys
            $table->foreign('maTrinhDoDaoTao', 'lop_matrinhdodaotao_foreign')
                ->references('maTrinhDoDaoTao')
                ->on('trinh_do_dao_tao')
                ->onDelete('restrict');

            $table->foreign('major_id', 'lop_manganhhoc_foreign')
                ->references('maNganh')
                ->on('majors')
                ->onDelete('restrict');

            $table->foreign('khoaHoc_id', 'lop_khoahoc_foreign')
                ->references('id')
                ->on('khoa_hoc')
                ->onDelete('restrict');

            $table->foreign('createdBy', 'lop_createdby_foreign')
                ->references('id')
                ->on('users')
                ->onDelete('set null');

            // Indexes
            $table->index('khoaHoc_id', 'lop_khoahoc_index');
            $table->index('trangThai', 'lop_trangthai_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('classes');
    }
};

