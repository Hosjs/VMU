<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_rates', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255)->comment('Tên đơn giá');
            $table->string('subject_type', 100)->nullable()->comment('Loại môn: Quản lý, Dự học kinh tế, Pháp tiền...');
            $table->string('education_level', 50)->nullable()->comment('Trình độ: VCB, TC...');
            $table->string('semester_code', 50)->nullable()->comment('Học kỳ áp dụng');
            $table->decimal('theory_rate', 15, 2)->default(0)->comment('Đơn giá giảng dạy lý thuyết (VND/giờ)');
            $table->decimal('practical_rate', 15, 2)->default(0)->comment('Đơn giá thực hành (VND/giờ)');
            $table->decimal('insurance_rate', 5, 2)->default(0)->comment('Tỉ lệ bảo hiểm (%)');
            $table->text('description')->nullable()->comment('Mô tả');
            $table->boolean('is_active')->default(true)->comment('Trạng thái');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes (FKs defined in Model)
            $table->index(['subject_type', 'education_level', 'is_active']);
            $table->index('semester_code');
            $table->index('created_by');
            $table->index('updated_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_rates');
    }
};

