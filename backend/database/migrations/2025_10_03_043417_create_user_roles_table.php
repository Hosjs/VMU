<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * AUDIT TRAIL - Lịch sử thay đổi Role
     * Bảng này để theo dõi lịch sử thay đổi role của user
     * User hiện tại được xác định qua users.role_id
     */
    public function up(): void
    {
        Schema::create('user_roles', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id'); // FK to users (xử lý ở Model)
            $table->unsignedBigInteger('role_id'); // FK to roles (xử lý ở Model)
            $table->timestamp('assigned_at')->useCurrent(); // Thời điểm gán role
            $table->unsignedBigInteger('assigned_by')->nullable(); // Admin nào thực hiện
            $table->boolean('is_active')->default(true); // Role hiện tại hay lịch sử
            $table->timestamps();

            // Indexes (không dùng foreign key - xử lý ở Model)
            $table->index(['user_id', 'is_active']); // Tìm role hiện tại của user
            $table->index(['role_id', 'is_active']); // Tìm users có role cụ thể
            $table->index('assigned_at'); // Sắp xếp theo thời gian
            $table->index('assigned_by'); // Tìm ai đã gán
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_roles');
    }
};
