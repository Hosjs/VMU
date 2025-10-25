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
        Schema::create('hoc_vien', function (Blueprint $table) {
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
            $table->foreign('maTrinhDoDaoTao')->references('maTrinhDoDaoTao')->on('trinh_do_dao_tao')->onDelete('restrict');
            $table->foreign('maNganh')->references('maNganh')->on('nganh_hoc')->onDelete('restrict');
            $table->foreign('idLop')->references('id')->on('lop')->onDelete('set null');
            $table->foreign('createdBy')->references('id')->on('users')->onDelete('set null');

            // Indexes
            $table->index('maTrinhDoDaoTao');
            $table->index('maNganh');
            $table->index('namVaoTruong');
            $table->index('trangThai');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hoc_vien');
    }
};

