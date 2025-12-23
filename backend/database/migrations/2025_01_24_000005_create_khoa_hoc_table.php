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
        Schema::create('khoa_hoc', function (Blueprint $table) {
            $table->integer('id')->primary();
            $table->string('ma_khoa_hoc', 20)->unique();
            $table->year('nam_hoc');
            $table->integer('hoc_ky')->checkBetween(1, 3);
            $table->integer('dot')->checkBetween(1, 5);
            $table->date('ngay_bat_dau')->nullable();
            $table->date('ngay_ket_thuc')->nullable();
            $table->text('ghi_chu')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('khoa_hoc');
    }
};
