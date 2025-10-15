<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Bảng chi tiết các dịch vụ và phụ tùng trong báo giá từ đối tác
     */
    public function up(): void
    {
        Schema::create('partner_quote_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('partner_quote_id'); // Báo giá từ đối tác

            // Loại item
            $table->enum('item_type', ['service', 'product']); // Dịch vụ hoặc phụ tùng (đặc biệt)
            $table->unsignedBigInteger('service_id')->nullable(); // Dịch vụ (nếu có trong hệ thống)
            $table->unsignedBigInteger('product_id')->nullable(); // Phụ tùng (nếu gara cung cấp đặc biệt)

            // Thông tin item
            $table->string('item_name'); // Tên dịch vụ/phụ tùng
            $table->string('item_code')->nullable(); // Mã dịch vụ/phụ tùng
            $table->text('description')->nullable(); // Mô tả chi tiết

            // Số lượng và đơn vị
            $table->decimal('quantity', 8, 2)->default(1);
            $table->string('unit')->default('lần');

            // *** GIÁ TỪ ĐỐI TÁC (settlement price) ***
            $table->decimal('partner_unit_price', 15, 2); // Giá đơn vị đối tác báo
            $table->decimal('partner_total_price', 15, 2); // Tổng giá từ đối tác
            $table->decimal('partner_discount', 15, 2)->default(0); // Giảm giá từ đối tác

            // *** GIÁ BÁO CHO KHÁCH HÀNG (quote price) - do ADMIN quyết định ***
            $table->decimal('customer_unit_price', 15, 2)->nullable(); // Giá đơn vị báo khách
            $table->decimal('customer_total_price', 15, 2)->nullable(); // Tổng giá báo khách
            $table->decimal('customer_discount', 15, 2)->default(0); // Giảm giá cho khách

            // *** CHÊNH LỆCH LỢI NHUẬN ***
            $table->decimal('profit_amount', 15, 2)->nullable(); // Lợi nhuận = customer_price - partner_price
            $table->decimal('profit_percent', 5, 2)->nullable(); // % lợi nhuận

            // Thông tin bảo hành
            $table->boolean('has_warranty')->default(false);
            $table->integer('warranty_months')->default(0);

            // Thời gian ước tính
            $table->integer('estimated_duration_minutes')->nullable(); // Thời gian ước tính (phút)

            // Ghi chú
            $table->text('partner_notes')->nullable(); // Ghi chú từ đối tác
            $table->text('internal_notes')->nullable(); // Ghi chú nội bộ

            // Trạng thái
            $table->boolean('is_approved')->default(false); // Admin đã duyệt chưa
            $table->boolean('is_required')->default(true); // Bắt buộc hay tùy chọn
            $table->boolean('provided_by_partner')->default(false); // Phụ tùng do gara cung cấp (đặc biệt)

            $table->timestamps();

            // Indexes
            $table->index(['partner_quote_id', 'item_type']);
            $table->index(['service_id', 'item_type']);
            $table->index(['product_id', 'item_type']);
            $table->index('is_approved');
            $table->index('provided_by_partner');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('partner_quote_items');
    }
};
