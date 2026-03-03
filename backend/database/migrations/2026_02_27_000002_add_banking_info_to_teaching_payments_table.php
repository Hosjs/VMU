<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Thêm các trường thông tin ngân hàng và đơn vị vào bảng thanh toán
     */
    public function up(): void
    {
        Schema::table('teaching_payments', function (Blueprint $table) {
            // Thông tin đơn vị và thuế
            $table->string('don_vi', 255)->nullable()->after('lecturer_id')->comment('Đơn vị/Khoa');
            $table->string('ma_so_thue_tncn', 50)->nullable()->after('don_vi')->comment('Mã số thuế TNCN');

            // Thông tin ngân hàng
            $table->string('so_tai_khoan', 50)->nullable()->after('ma_so_thue_tncn')->comment('Số tài khoản ngân hàng');
            $table->string('tai_ngan_hang', 100)->nullable()->after('so_tai_khoan')->comment('Tại ngân hàng');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('teaching_payments', function (Blueprint $table) {
            $table->dropColumn([
                'don_vi',
                'ma_so_thue_tncn',
                'so_tai_khoan',
                'tai_ngan_hang',
            ]);
        });
    }
};

