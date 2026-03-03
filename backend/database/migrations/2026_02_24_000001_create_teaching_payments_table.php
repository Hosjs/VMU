<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Table: teaching_payments
     * Purpose: Quản lý thanh toán tiền giảng dạy cho giảng viên
     */
    public function up(): void
    {
        Schema::create('teaching_payments', function (Blueprint $table) {
            $table->id();

            // Foreign keys
            $table->unsignedBigInteger('teaching_schedule_id')->comment('ID lịch giảng dạy');
            $table->unsignedBigInteger('major_id')->comment('ID ngành học');
            $table->integer('khoa_hoc_id')->comment('ID kỳ học');
            $table->string('semester_code', 50)->comment('Mã kỳ học');
            $table->unsignedBigInteger('lecturer_id')->nullable()->comment('ID giảng viên (nếu có)');

            // Thông tin học phần
            $table->integer('stt')->comment('Số thứ tự');
            $table->string('ten_hoc_phan', 255)->comment('Tên học phần');
            $table->integer('so_tin_chi')->default(0)->comment('Số tín chỉ');
            $table->string('can_bo_giang_day', 500)->nullable()->comment('Cán bộ giảng dạy');

            // Thông tin lớp
            $table->string('lop', 100)->nullable()->comment('Tên lớp');
            $table->string('chuyen_nganh', 255)->nullable()->comment('Chuyên ngành');

            // Thông tin học phần
            $table->integer('so_buoi')->default(0)->comment('Số buổi học');
            $table->string('hoc_phan', 100)->nullable()->comment('Loại học phần');
            $table->integer('si_so')->default(0)->comment('Sĩ số');

            // Đơn giá và tính toán
            $table->decimal('don_gia_tin_chi', 12, 2)->default(0)->comment('Đơn giá tín chỉ (VNĐ)');
            $table->decimal('so_tiet', 8, 2)->default(0)->comment('Số tiết');
            $table->decimal('he_so', 8, 2)->default(1.0)->comment('Hệ số');
            $table->decimal('thanh_tien_chua_thue', 12, 2)->default(0)->comment('Thành tiền chưa thuế (VNĐ)');
            $table->decimal('thue_thu_nhap', 12, 2)->default(0)->comment('Thuế thu nhập (VNĐ)');
            $table->decimal('thuc_nhan', 12, 2)->default(0)->comment('Thực nhận (VNĐ)');
            $table->decimal('tong_nhan', 12, 2)->default(0)->comment('Tổng nhận (VNĐ)');

            // Ghi chú
            $table->text('ghi_chu')->nullable()->comment('Ghi chú');

            // Trạng thái thanh toán
            $table->enum('trang_thai_thanh_toan', ['chua_thanh_toan', 'da_thanh_toan'])
                ->default('chua_thanh_toan')
                ->comment('Trạng thái thanh toán');
            $table->timestamp('ngay_thanh_toan')->nullable()->comment('Ngày thanh toán');
            $table->string('nguoi_thanh_toan', 255)->nullable()->comment('Người thực hiện thanh toán');

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('teaching_schedule_id');
            $table->index('major_id');
            $table->index('khoa_hoc_id');
            $table->index('semester_code');
            $table->index('lecturer_id');
            $table->index('trang_thai_thanh_toan');

            // Foreign key constraints
            $table->foreign('teaching_schedule_id')
                ->references('id')
                ->on('teaching_schedules')
                ->onDelete('cascade');

            $table->foreign('major_id')
                ->references('id')
                ->on('majors')
                ->onDelete('cascade');

            $table->foreign('lecturer_id')
                ->references('id')
                ->on('lecturers')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teaching_payments');
    }
};

