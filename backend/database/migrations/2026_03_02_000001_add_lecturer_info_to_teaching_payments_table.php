<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Thêm các trường thông tin giảng viên chi tiết vào bảng teaching_payments
     * Bao gồm: Chức danh, Họ tên, Đơn vị
     */
    public function up(): void
    {
        Schema::table('teaching_payments', function (Blueprint $table) {
            // Thông tin giảng viên chi tiết
            $table->string('chuc_danh_giang_vien', 50)->nullable()->after('lecturer_id')->comment('Chức danh giảng viên: ThS, TS');
            $table->string('ho_ten_giang_vien', 255)->nullable()->after('chuc_danh_giang_vien')->comment('Họ và tên giảng viên');

            // Di chuyển các cột đơn vị và ngân hàng ra sau (nếu chưa có)
            // Cột don_vi, ma_so_thue_tncn, so_tai_khoan, tai_ngan_hang đã có từ migration trước
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('teaching_payments', function (Blueprint $table) {
            $table->dropColumn([
                'chuc_danh_giang_vien',
                'ho_ten_giang_vien',
            ]);
        });
    }
};

