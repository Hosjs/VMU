<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Bảng lưu lịch sử dịch vụ và phụ tùng đã sử dụng cho từng xe
     * Để theo dõi bảo dưỡng, bảo hành, lịch sử giá
     */
    public function up(): void
    {
        Schema::create('vehicle_service_history', function (Blueprint $table) {
            $table->id();
            $table->string('history_number')->unique(); // Mã lịch sử: VH-YYYYMMDD-001

            // Thông tin xe và khách hàng
            $table->unsignedBigInteger('vehicle_id');
            $table->unsignedBigInteger('customer_id');
            $table->unsignedBigInteger('order_id'); // Đơn hàng liên quan
            $table->unsignedBigInteger('order_item_id')->nullable(); // Chi tiết đơn hàng

            // Loại lịch sử
            $table->enum('type', ['service', 'product']); // Dịch vụ hoặc phụ tùng
            $table->unsignedBigInteger('service_id')->nullable(); // Dịch vụ đã thực hiện
            $table->unsignedBigInteger('product_id')->nullable(); // Phụ tùng đã thay

            // Thông tin chi tiết
            $table->string('item_name'); // Tên dịch vụ/phụ tùng
            $table->string('item_code'); // Mã dịch vụ/phụ tùng
            $table->text('description')->nullable(); // Mô tả công việc đã thực hiện

            // Số lượng và đơn vị
            $table->decimal('quantity', 8, 2)->default(1);
            $table->string('unit')->default('lần');

            // Thông tin giá tại thời điểm thực hiện
            $table->decimal('quote_unit_price', 15, 2); // Giá báo khách hàng
            $table->decimal('quote_total_price', 15, 2); // Tổng giá báo khách
            $table->decimal('settlement_unit_price', 15, 2); // Giá quyết toán với đối tác
            $table->decimal('settlement_total_price', 15, 2); // Tổng quyết toán
            $table->decimal('actual_paid', 15, 2)->nullable(); // Số tiền thực tế khách đã trả

            // Thông tin đối tác thực hiện
            $table->unsignedBigInteger('provider_id')->nullable(); // Gara liên kết thực hiện
            $table->string('provider_name')->nullable(); // Tên gara (snapshot)
            $table->unsignedBigInteger('technician_id')->nullable(); // Kỹ thuật viên thực hiện
            $table->string('technician_name')->nullable(); // Tên kỹ thuật viên (snapshot)

            // Thông tin xe tại thời điểm thực hiện
            $table->integer('mileage_at_service'); // Số km tại thời điểm làm dịch vụ
            $table->date('service_date'); // Ngày thực hiện dịch vụ
            $table->datetime('service_start')->nullable(); // Thời gian bắt đầu
            $table->datetime('service_end')->nullable(); // Thời gian kết thúc

            // Bảo hành
            $table->boolean('has_warranty')->default(false);
            $table->integer('warranty_months')->default(0);
            $table->date('warranty_start_date')->nullable();
            $table->date('warranty_end_date')->nullable();
            $table->unsignedBigInteger('warranty_id')->nullable(); // Liên kết với bảng warranties
            $table->enum('warranty_status', ['active', 'expired', 'used', 'cancelled'])->nullable();

            // Thông tin bảo dưỡng định kỳ
            $table->boolean('is_maintenance')->default(false); // Có phải bảo dưỡng định kỳ không
            $table->integer('next_maintenance_mileage')->nullable(); // Số km bảo dưỡng tiếp theo
            $table->date('next_maintenance_date')->nullable(); // Ngày bảo dưỡng tiếp theo

            // Đánh giá chất lượng
            $table->integer('customer_rating')->nullable(); // Đánh giá của khách: 1-5 sao
            $table->text('customer_feedback')->nullable(); // Phản hồi của khách hàng

            // File đính kèm
            $table->text('before_image_urls')->nullable(); // Ảnh trước khi làm, ngăn cách bởi |
            $table->text('after_image_urls')->nullable(); // Ảnh sau khi làm, ngăn cách bởi |
            $table->text('document_urls')->nullable(); // Tài liệu, hóa đơn, ngăn cách bởi |

            // Ghi chú
            $table->text('technician_notes')->nullable(); // Ghi chú của kỹ thuật viên
            $table->text('internal_notes')->nullable(); // Ghi chú nội bộ

            // Trạng thái
            $table->enum('status', ['completed', 'warranty_active', 'warranty_expired', 'replaced'])->default('completed');

            $table->timestamps();

            // Indexes
            $table->index(['vehicle_id', 'service_date']);
            $table->index(['customer_id', 'service_date']);
            $table->index(['order_id', 'type']);
            $table->index(['service_id', 'service_date']);
            $table->index(['product_id', 'service_date']);
            $table->index(['provider_id', 'service_date']);
            $table->index(['warranty_status', 'warranty_end_date']);
            $table->index(['is_maintenance', 'next_maintenance_date'], 'idx_maintenance_schedule');
            $table->index('mileage_at_service');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicle_service_history');
    }
};
