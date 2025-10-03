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
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email'); // Số điện thoại
            $table->string('avatar')->nullable()->after('phone'); // Ảnh đại diện
            $table->date('birth_date')->nullable()->after('avatar'); // Ngày sinh
            $table->enum('gender', ['male', 'female', 'other'])->nullable()->after('birth_date');
            $table->text('address')->nullable()->after('gender'); // Địa chỉ
            $table->string('employee_code')->nullable()->unique()->after('address'); // Mã nhân viên
            $table->string('position')->nullable()->after('employee_code'); // Chức vụ
            $table->string('department')->nullable()->after('position'); // Phòng ban
            $table->date('hire_date')->nullable()->after('department'); // Ngày vào làm
            $table->decimal('salary', 15, 2)->nullable()->after('hire_date'); // Lương
            $table->boolean('is_active')->default(true)->after('salary'); // Trạng thái hoạt động
            $table->text('notes')->nullable()->after('is_active'); // Ghi chú

            $table->index('phone');
            $table->index('employee_code');
            $table->index(['is_active', 'position']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['phone']);
            $table->dropIndex(['employee_code']);
            $table->dropIndex(['is_active', 'position']);

            $table->dropColumn([
                'phone', 'avatar', 'birth_date', 'gender', 'address',
                'employee_code', 'position', 'department', 'hire_date',
                'salary', 'is_active', 'notes'
            ]);
        });
    }
};
