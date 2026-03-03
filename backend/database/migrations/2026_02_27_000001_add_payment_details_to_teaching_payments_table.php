<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Thêm các trường chi tiết cho bảng thanh toán tiền giảng dạy
     * dựa trên template Excel payment form
     */
    public function up(): void
    {
        Schema::table('teaching_payments', function (Blueprint $table) {
            // Thời gian giảng dạy
            $table->date('tu_ngay')->nullable()->after('can_bo_giang_day')->comment('Từ ngày');
            $table->date('den_ngay')->nullable()->after('tu_ngay')->comment('Đến ngày');
            $table->date('ngay_thi')->nullable()->after('den_ngay')->comment('Ngày thi');

            // Đơn giá/01 đết
            $table->decimal('don_gia_ly_thuyet', 12, 2)->nullable()->after('ngay_thi')->comment('Đơn giá lý thuyết (VNĐ)');
            $table->decimal('don_gia_thuc_hanh', 12, 2)->nullable()->after('don_gia_ly_thuyet')->comment('Đơn giá thực hành/thảo luận (VNĐ)');

            // Phân bổ số tiết/học phần
            $table->decimal('so_tiet_ly_thuyet', 8, 2)->nullable()->after('don_gia_thuc_hanh')->comment('Số tiết lý thuyết');
            $table->decimal('so_tiet_thao_luan', 8, 2)->nullable()->after('so_tiet_ly_thuyet')->comment('Số tiết thảo luận');
            $table->decimal('so_tiet_bai_tap_lon', 8, 2)->nullable()->after('so_tiet_thao_luan')->comment('Số tiết bài tập lớn/tiểu luận');

            // Số lượng
            $table->integer('so_luong_bai_tap')->nullable()->after('so_tiet_bai_tap_lon')->comment('Số lượng bài tập');
            $table->integer('so_luong_hoc_vien')->nullable()->after('so_luong_bai_tap')->comment('Số lượng học viên');
            $table->integer('so_luong_bai_thi')->nullable()->after('so_luong_hoc_vien')->comment('Số lượng bài thi');

            // Hệ số ra đề, chấm thi
            $table->decimal('he_so_ra_de_cham_thi', 8, 2)->nullable()->after('he_so')->comment('Hệ số ra đề, chấm thi');

            // Phụ trách lớp
            $table->string('phu_trach_lop', 255)->nullable()->after('ghi_chu')->comment('Phụ trách lớp');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('teaching_payments', function (Blueprint $table) {
            $table->dropColumn([
                'tu_ngay',
                'den_ngay',
                'ngay_thi',
                'don_gia_ly_thuyet',
                'don_gia_thuc_hanh',
                'so_tiet_ly_thuyet',
                'so_tiet_thao_luan',
                'so_tiet_bai_tap_lon',
                'so_luong_bai_tap',
                'so_luong_hoc_vien',
                'so_luong_bai_thi',
                'he_so_ra_de_cham_thi',
                'phu_trach_lop',
            ]);
        });
    }
};

