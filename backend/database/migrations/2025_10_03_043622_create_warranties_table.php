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
        Schema::create('warranties', function (Blueprint $table) {
            $table->id();
            $table->string('warranty_number')->unique(); // Số bảo hành
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('order_item_id')->constrained()->onDelete('cascade');
            $table->foreignId('customer_id')->constrained()->onDelete('cascade');
            $table->foreignId('vehicle_id')->nullable()->constrained()->onDelete('set null');

            // Thông tin bảo hành
            $table->enum('type', ['service', 'product']); // Loại bảo hành
            $table->string('item_name'); // Tên dịch vụ/sản phẩm được bảo hành
            $table->string('item_code'); // Mã dịch vụ/sản phẩm

            // Thời hạn bảo hành
            $table->date('start_date'); // Ngày bắt đầu bảo hành
            $table->date('end_date'); // Ngày hết hạn bảo hành
            $table->integer('warranty_months'); // Số tháng bảo hành

            // Điều kiện bảo hành
            $table->text('warranty_terms')->nullable(); // Điều kiện bảo hành
            $table->json('covered_issues')->nullable(); // Các vấn đề được bảo hành
            $table->json('excluded_issues')->nullable(); // Các vấn đề không được bảo hành

            // Trạng thái
            $table->enum('status', ['active', 'expired', 'used', 'cancelled'])->default('active');

            // Thông tin sử dụng bảo hành
            $table->integer('usage_count')->default(0); // Số lần đã sử dụng
            $table->integer('max_usage')->nullable(); // Số lần tối đa có thể sử dụng

            $table->text('notes')->nullable(); // Ghi chú
            $table->json('attachments')->nullable(); // File đính kèm (giấy tờ bảo hành)

            $table->timestamps();

            $table->index(['customer_id', 'status']);
            $table->index(['vehicle_id', 'status']);
            $table->index(['end_date', 'status']); // Để nhắc nhở sắp hết hạn
            $table->index('warranty_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('warranties');
    }
};
