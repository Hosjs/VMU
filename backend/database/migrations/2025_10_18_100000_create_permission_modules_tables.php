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
     * 1. permission_modules: Các module trong hệ thống (users, orders, products...)
     * 2. permission_actions: Các actions có thể thực hiện (view, create, edit, delete...)
     * 3. roles.permissions (JSON): Quyền mặc định của role
     *    VD: {"users": ["view", "create"], "orders": ["view"]}
     * 4. users.custom_permissions (JSON): Quyền bổ sung riêng cho user (ngoài quyền role)
     *    VD: {"products": ["edit", "delete"], "reports": ["export"]}
     *
     * => User có quyền = Quyền của Role + Custom Permissions của User
     * => Admin có thể thêm quyền riêng cho từng user ngoài quyền mặc định của role
     */
    public function up(): void
    {
        // Bảng lưu các modules trong hệ thống
        Schema::create('permission_modules', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // users, orders, invoices, products, warehouses, etc.
            $table->string('display_name'); // Người dùng, Đơn hàng, Hóa đơn
            $table->text('description')->nullable(); // Mô tả chi tiết module
            $table->string('icon')->nullable(); // Icon name (HomeIcon, UsersIcon, etc.)
            $table->integer('sort_order')->default(0); // Thứ tự hiển thị
            $table->boolean('is_active')->default(true); // Kích hoạt/Vô hiệu
            $table->timestamps();

            $table->index(['is_active', 'sort_order']);
        });

        // Bảng lưu các actions có thể thực hiện trong từng module
        Schema::create('permission_actions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('module_id'); // Liên kết đến permission_modules (xử lý ở Model)
            $table->string('action'); // view, create, edit, delete, approve, export, etc.
            $table->string('display_name'); // Xem, Tạo mới, Sửa, Xóa
            $table->text('description')->nullable(); // Mô tả chi tiết action
            $table->integer('sort_order')->default(0); // Thứ tự hiển thị
            $table->boolean('is_active')->default(true); // Kích hoạt/Vô hiệu
            $table->timestamps();

            // Unique constraint: Mỗi module chỉ có 1 action với tên cụ thể
            $table->unique(['module_id', 'action']);

            // Indexes (không dùng foreign key - xử lý ở Model)
            $table->index(['module_id', 'is_active', 'sort_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('permission_actions');
        Schema::dropIfExists('permission_modules');
    }
};
