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
        if (!Schema::hasTable('lecturers')) {
            return;
        }

        Schema::table('lecturers', function (Blueprint $table) {
            if (!Schema::hasColumn('lecturers', 'don_vi')) {
                $table->string('don_vi', 255)->nullable()->after('maNganh');
            }
            if (!Schema::hasColumn('lecturers', 'ma_so_thue_tncn')) {
                $table->string('ma_so_thue_tncn', 50)->nullable()->after('don_vi');
            }
            if (!Schema::hasColumn('lecturers', 'so_tai_khoan')) {
                $table->string('so_tai_khoan', 50)->nullable()->after('ma_so_thue_tncn');
            }
            if (!Schema::hasColumn('lecturers', 'tai_ngan_hang')) {
                $table->string('tai_ngan_hang', 255)->nullable()->after('so_tai_khoan');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasTable('lecturers')) {
            return;
        }

        Schema::table('lecturers', function (Blueprint $table) {
            $columns = [];

            foreach (['don_vi', 'ma_so_thue_tncn', 'so_tai_khoan', 'tai_ngan_hang'] as $column) {
                if (Schema::hasColumn('lecturers', $column)) {
                    $columns[] = $column;
                }
            }

            if (!empty($columns)) {
                $table->dropColumn($columns);
            }
        });
    }
};

