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
        Schema::create('students', function (Blueprint $table) {
            $table->string('maHV', 20)->primary();
            $table->string('hoDem', 100);
            $table->string('ten', 50);
            $table->date('ngaySinh');
            $table->string('gioiTinh', 10);
            $table->string('soGiayToTuyThan', 20);
            $table->string('dienThoai', 20)->unique();
            $table->string('email', 100)->unique();
            $table->string('quocTich', 50)->nullable();
            $table->string('danToc', 50)->nullable();
            $table->string('tonGiao', 50)->nullable();
            $table->string('maTrinhDoDaoTao', 10);
            $table->string('maNganh', 10);
            $table->enum('trangThai', ['DangHoc', 'BaoLuu', 'DaTotNghiep', 'ThoiHoc'])->default('DangHoc');
            $table->dateTime('ngayNhapHoc');
            $table->integer('namVaoTruong');
            $table->unsignedBigInteger('idLop')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->unsignedBigInteger('createdBy')->nullable();

            // Foreign keys
            $table->foreign('maTrinhDoDaoTao', 'hoc_vien_matrinhdodaotao_foreign')
                ->references('maTrinhDoDaoTao')
                ->on('trinh_do_dao_tao')
                ->onDelete('restrict');

            $table->foreign('maNganh', 'hoc_vien_manganh_foreign')
                ->references('maNganh')
                ->on('majors')
                ->onDelete('restrict');

            $table->foreign('idLop', 'hoc_vien_idlop_foreign')
                ->references('id')
                ->on('classes')
                ->onDelete('set null');

            $table->foreign('createdBy', 'hoc_vien_createdby_foreign')
                ->references('id')
                ->on('users')
                ->onDelete('set null');

            // Indexes
            $table->index('maTrinhDoDaoTao', 'hoc_vien_matrinhdodaotao_index');
            $table->index('maNganh', 'hoc_vien_manganh_index');
            $table->index('namVaoTruong', 'hoc_vien_namvaotruong_index');
            $table->index('trangThai', 'hoc_vien_trangthai_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }

};
