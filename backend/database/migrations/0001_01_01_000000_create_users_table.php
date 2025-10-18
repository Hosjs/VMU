<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * HỆ THỐNG PHÂN QUYỀN:
     * - role_id: Vai trò của user (foreign key đến roles table - xử lý ở Model)
     * - custom_permissions: Quyền bổ sung riêng ngoài quyền của role
     *   Format JSON: {"module_name": ["action1", "action2"], ...}
     *   VD: {"products": ["edit", "delete"], "reports": ["export"]}
     *
     * => Quyền cuối cùng = Quyền mặc định của Role + Custom Permissions
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone')->nullable(); // Số điện thoại
            $table->string('avatar')->nullable(); // Ảnh đại diện
            $table->date('birth_date')->nullable(); // Ngày sinh
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->text('address')->nullable(); // Địa chỉ

            // Employee fields
            $table->string('employee_code')->nullable()->unique(); // Mã nhân viên
            $table->string('position')->nullable(); // Chức vụ
            $table->string('department')->nullable(); // Phòng ban
            $table->date('hire_date')->nullable(); // Ngày vào làm
            $table->decimal('salary', 15, 2)->nullable(); // Lương

            // Role & Permissions (Role-based + Custom Permissions)
            $table->unsignedBigInteger('role_id')->nullable(); // FK to roles table (xử lý ở Model)
            $table->json('custom_permissions')->nullable(); // Quyền bổ sung ngoài role: {"products": ["edit", "delete"], "reports": ["export"]}

            // Status & Security
            $table->boolean('is_active')->default(true); // Trạng thái hoạt động
            $table->text('notes')->nullable(); // Ghi chú
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();

            // Indexes for performance (không dùng foreign key - xử lý ở Model)
            $table->index('email');
            $table->index('phone');
            $table->index('employee_code');
            $table->index('role_id');
            $table->index(['is_active', 'position']);
            $table->index('deleted_at');
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
