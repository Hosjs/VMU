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
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Tên khách hàng
            $table->string('phone')->unique(); // Số điện thoại (bắt buộc)
            $table->string('email')->nullable(); // Email
            $table->text('address')->nullable(); // Địa chỉ
            $table->date('birth_date')->nullable(); // Ngày sinh
            $table->enum('gender', ['male', 'female', 'other'])->nullable();

            // Liên kết với user account (nếu có đăng ký tài khoản)
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');

            // Thông tin bảo hiểm
            $table->string('insurance_company')->nullable(); // Công ty bảo hiểm
            $table->string('insurance_number')->nullable(); // Số bảo hiểm
            $table->date('insurance_expiry')->nullable(); // Ngày hết hạn bảo hiểm

            // Ghi chú và lịch sử
            $table->text('notes')->nullable(); // Ghi chú về khách hàng
            $table->json('preferences')->nullable(); // Sở thích, yêu cầu đặc biệt

            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['phone', 'is_active']);
            $table->index('email');
            $table->index('insurance_expiry'); // Để nhắc nhở
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
