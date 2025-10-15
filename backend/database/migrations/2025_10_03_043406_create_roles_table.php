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
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // Mã role: admin, manager, accountant, mechanic, employee
            $table->string('display_name'); // Tên hiển thị: Admin, Manager, Accountant, Mechanic, Employee
            $table->text('description')->nullable(); // Mô tả quyền
            $table->json('permissions')->nullable(); // Danh sách quyền chi tiết dạng JSON
            $table->boolean('is_active')->default(true); // Trạng thái hoạt động
            $table->timestamps();
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
