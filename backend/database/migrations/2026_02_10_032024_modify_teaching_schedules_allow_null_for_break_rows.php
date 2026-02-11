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
        Schema::table('teaching_schedules', function (Blueprint $table) {
            // Allow NULL for so_tin_chi and can_bo_giang_day to support break/holiday rows
            $table->integer('so_tin_chi')->nullable()->default(0)->comment('Số tín chỉ (0 hoặc NULL cho dòng nghỉ lễ)')->change();
            $table->string('can_bo_giang_day', 500)->nullable()->comment('Cán bộ giảng dạy (NULL cho dòng nghỉ lễ)')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('teaching_schedules', function (Blueprint $table) {
            // Revert back to NOT NULL (be careful if you have break rows in DB)
            $table->integer('so_tin_chi')->nullable(false)->comment('Số tín chỉ')->change();
            $table->string('can_bo_giang_day', 500)->nullable(false)->comment('Cán bộ giảng dạy')->change();
        });
    }
};
