<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * NOTE: Bảng này để audit trail - theo dõi lịch sử thay đổi role
     * User hiện tại được xác định qua users.role_id
     */
    public function up(): void
    {
        Schema::create('user_roles', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('role_id');
            $table->timestamp('assigned_at')->useCurrent();
            $table->unsignedBigInteger('assigned_by')->nullable(); // Admin nào assign
            $table->boolean('is_active')->default(true); // Role hiện tại hay lịch sử
            $table->timestamps();

            // Indexes
            $table->index(['user_id', 'is_active']); // Tìm role hiện tại của user
            $table->index(['role_id', 'is_active']); // Tìm users có role cụ thể
            $table->index('assigned_at'); // Sắp xếp theo thời gian
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
