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
     * - permissions (JSON): Quyền mặc định của role theo module
     *   Format: {"module_name": ["action1", "action2"], ...}
     *   VD Admin: {"users": ["view", "create", "edit", "delete"], "orders": ["view", "create", "edit", "delete"]}
     *   VD Manager: {"users": ["view"], "orders": ["view", "edit"], "reports": ["view", "export"]}
     *   VD Mechanic: {"service_requests": ["view", "edit"], "vehicles": ["view"]}
     *
     * => Admin có thể thêm custom_permissions cho từng user ngoài quyền mặc định của role
     */
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // admin, manager, accountant, mechanic, employee
            $table->string('display_name'); // Admin, Quản lý, Kế toán, Thợ sửa xe, Nhân viên
            $table->text('description')->nullable(); // Mô tả vai trò
            $table->json('permissions')->nullable(); // Quyền mặc định theo module: {"users": ["view", "create"], "orders": ["view"]}
            $table->boolean('is_active')->default(true); // Trạng thái hoạt động
            $table->timestamps();

            // Indexes
            $table->index('name');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};
