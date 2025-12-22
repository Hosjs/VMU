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
        Schema::create('lecturer_payments', function (Blueprint $table) {
            $table->id();

            // Thông tin giảng viên và lớp
            $table->foreignId('lecturer_id')->constrained('lecturers')->onDelete('cascade')->comment('ID giảng viên');
            $table->foreignId('teaching_assignment_id')->nullable()->constrained('teaching_assignments')->onDelete('set null')->comment('ID lịch giảng dạy');
            $table->unsignedBigInteger('lop_id')->nullable()->comment('ID lớp');

            // Thông tin học kỳ và môn học
            $table->string('semester_code', 50)->comment('Mã học kỳ: VD QLVT 2024.1.2');
            $table->string('subject_code', 50)->nullable()->comment('Mã học phần');
            $table->string('subject_name', 255)->comment('Tên môn học');
            $table->string('education_level', 50)->nullable()->comment('Trình độ: VCB, TC...');
            $table->integer('credits')->default(0)->comment('Số tín chỉ');
            $table->string('class_name', 100)->nullable()->comment('Tên lớp');
            $table->integer('student_count')->default(0)->comment('Số học viên');

            // Thời gian giảng dạy
            $table->date('start_date')->comment('Từ ngày');
            $table->date('end_date')->comment('Đến ngày');
            $table->date('completion_date')->nullable()->comment('Ngày hết hạn');

            // Giờ giảng dạy (Đơn giá đầu kỳ và cuối kỳ)
            $table->decimal('teaching_hours_start', 8, 2)->default(0)->comment('Lý thuyết - Đơn giá đầu kỳ (giờ)');
            $table->decimal('teaching_hours_end', 8, 2)->default(0)->comment('Lý thuyết - Đơn giá cuối kỳ (giờ)');
            $table->decimal('practical_hours', 8, 2)->default(0)->comment('Thực hành (giờ)');

            // Số lượng lượt học
            $table->integer('theory_sessions')->default(0)->comment('Số lượng lượt học - Lý thuyết');
            $table->integer('practical_sessions')->default(0)->comment('Số lượng lượt học - Thực hành');
            $table->integer('total_sessions')->default(0)->comment('Tổng số lượng lượt học');

            // Tính toán thanh toán
            $table->decimal('hourly_rate', 15, 2)->default(0)->comment('Đơn giá/giờ (VND)');
            $table->decimal('total_amount', 15, 2)->default(0)->comment('Thành tiền (VND)');
            $table->decimal('insurance_rate', 5, 2)->default(0)->comment('Tỉ lệ bảo hiểm (%)');
            $table->decimal('insurance_amount', 15, 2)->default(0)->comment('Số tiền bảo hiểm (VND)');
            $table->decimal('net_amount', 15, 2)->default(0)->comment('Thực nhận (VND)');

            // Trạng thái thanh toán
            $table->enum('payment_status', ['pending', 'approved', 'paid', 'rejected'])->default('pending')->comment('Trạng thái thanh toán');
            $table->date('payment_date')->nullable()->comment('Ngày thanh toán');
            $table->string('payment_method', 100)->nullable()->comment('Phương thức thanh toán');
            $table->string('bank_account', 100)->nullable()->comment('Số tài khoản');
            $table->string('bank_name', 255)->nullable()->comment('Tên ngân hàng');

            // Ghi chú
            $table->text('notes')->nullable()->comment('Ghi chú');
            $table->text('rejection_reason')->nullable()->comment('Lý do từ chối');

            // Audit fields
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['lecturer_id', 'semester_code', 'payment_status']);
            $table->index(['payment_status', 'payment_date']);
            $table->index('semester_code');

            // Foreign keys
            $table->foreign('lop_id')->references('id')->on('lop')->onDelete('set null');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lecturer_payments');
    }
};

