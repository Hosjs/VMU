<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Xóa cột so_luong_hoc_vien vì trùng ý nghĩa với si_so (sĩ số)
     */
    public function up(): void
    {
        Schema::table('teaching_payments', function (Blueprint $table) {
            // Xóa cột so_luong_hoc_vien nếu tồn tại (trùng với si_so)
            if (Schema::hasColumn('teaching_payments', 'so_luong_hoc_vien')) {
                $table->dropColumn('so_luong_hoc_vien');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('teaching_payments', function (Blueprint $table) {
            // Khôi phục cột nếu cần rollback
            $table->integer('so_luong_hoc_vien')->nullable()->after('so_luong_bai_tap')->comment('Số lượng học viên (đã xóa - trùng với si_so)');
        });
    }
};

