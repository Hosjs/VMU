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
        Schema::create('service_requests', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // Mã yêu cầu dịch vụ

            // Thông tin khách hàng (có thể chưa đăng ký)
            $table->string('customer_name'); // Tên khách hàng
            $table->string('customer_phone'); // Số điện thoại
            $table->string('customer_email')->nullable(); // Email
            $table->text('customer_address')->nullable(); // Địa chỉ

            // Liên kết với khách hàng đã đăng ký (nếu có)
            $table->foreignId('customer_id')->nullable()->constrained()->onDelete('set null');

            // Thông tin xe
            $table->string('vehicle_brand'); // Hãng xe
            $table->string('vehicle_model'); // Dòng xe
            $table->string('vehicle_name')->nullable(); // Tên xe cụ thể
            $table->string('license_plate')->nullable(); // Biển số
            $table->integer('vehicle_year')->nullable(); // Năm sản xuất

            // Dịch vụ yêu cầu
            $table->json('requested_services'); // Danh sách dịch vụ yêu cầu
            $table->text('description')->nullable(); // Mô tả chi tiết vấn đề
            $table->datetime('preferred_date')->nullable(); // Ngày mong muốn

            // Trạng thái xử lý
            $table->enum('status', ['pending', 'contacted', 'scheduled', 'in_progress', 'completed', 'cancelled'])
                ->default('pending');

            // Thông tin xử lý
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null'); // Nhân viên được giao
            $table->datetime('contacted_at')->nullable(); // Thời gian liên hệ
            $table->datetime('scheduled_at')->nullable(); // Thời gian hẹn
            $table->text('admin_notes')->nullable(); // Ghi chú của admin

            // Priority
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal');

            $table->timestamps();

            $table->index(['status', 'priority']);
            $table->index(['customer_phone', 'status']);
            $table->index(['assigned_to', 'status']);
            $table->index('preferred_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_requests');
    }
};
