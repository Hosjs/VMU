<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Bảng pivot quản lý quan hệ nhiều-nhiều giữa service_requests và services
     */
    public function up(): void
    {
        Schema::create('service_request_services', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('service_request_id'); // Quan hệ được định nghĩa trong Model
            $table->unsignedBigInteger('service_id'); // Quan hệ được định nghĩa trong Model

            // Thông tin bổ sung cho từng dịch vụ trong yêu cầu
            $table->text('description')->nullable(); // Mô tả chi tiết cho dịch vụ này
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal'); // Mức độ ưu tiên
            $table->integer('quantity')->default(1); // Số lượng (nếu cần)
            $table->decimal('estimated_price', 15, 2)->nullable(); // Giá ước tính (nếu có)
            $table->text('notes')->nullable(); // Ghi chú riêng cho dịch vụ này

            $table->timestamps();

            // Unique constraint: mỗi service chỉ xuất hiện 1 lần trong 1 service_request
            $table->unique(['service_request_id', 'service_id']);

            $table->index('service_request_id');
            $table->index('service_id');
            $table->index('priority');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_request_services');
    }
};

