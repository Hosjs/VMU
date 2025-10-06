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
        Schema::create('stock_transfers', function (Blueprint $table) {
            $table->id();
            $table->string('transfer_number')->unique(); // Số phiếu chuyển kho

            // Kho gửi và kho nhận
            $table->unsignedBigInteger('from_warehouse_id');
            $table->unsignedBigInteger('to_warehouse_id');

            // Thông tin chuyển kho
            $table->enum('type', ['internal', 'inter_company']); // internal: trong cùng công ty, inter_company: giữa các đơn vị
            $table->enum('reason', ['restock', 'customer_request', 'maintenance', 'return', 'adjustment']);
            // restock: bổ sung hàng, customer_request: theo yêu cầu khách, maintenance: bảo trì, return: trả hàng

            // Liên kết với đơn hàng (nếu chuyển kho cho đơn hàng cụ thể)
            $table->unsignedBigInteger('order_id')->nullable();

            // Trạng thái chuyển kho
            $table->enum('status', ['draft', 'pending', 'in_transit', 'received', 'completed', 'cancelled'])->default('draft');

            // Thông tin vận chuyển
            $table->date('transfer_date'); // Ngày chuyển
            $table->date('expected_arrival')->nullable(); // Ngày dự kiến đến
            $table->date('actual_arrival')->nullable(); // Ngày thực tế đến
            $table->string('transport_method')->nullable(); // Phương tiện vận chuyển
            $table->string('tracking_number')->nullable(); // Mã vận đơn

            // Thông tin thuế - QUAN TRỌNG cho việc không mất thuế
            $table->boolean('is_tax_exempt')->default(true); // Miễn thuế (chuyển kho nội bộ)
            $table->string('tax_exemption_code')->nullable(); // Mã miễn thuế
            $table->decimal('tax_amount', 15, 2)->default(0); // Thuế (nếu có)
            $table->text('tax_notes')->nullable(); // Ghi chú về thuế

            // Giá trị chuyển kho
            $table->decimal('total_cost', 15, 2)->default(0); // Tổng giá vốn
            $table->decimal('shipping_cost', 15, 2)->default(0); // Chi phí vận chuyển
            $table->decimal('insurance_cost', 15, 2)->default(0); // Chi phí bảo hiểm

            // Người xử lý
            $table->unsignedBigInteger('created_by'); // Người tạo phiếu
            $table->unsignedBigInteger('approved_by')->nullable(); // Người duyệt
            $table->unsignedBigInteger('sent_by')->nullable(); // Người gửi
            $table->unsignedBigInteger('received_by')->nullable(); // Người nhận

            $table->datetime('approved_at')->nullable();
            $table->datetime('sent_at')->nullable();
            $table->datetime('received_at')->nullable();

            // Ghi chú và tài liệu - thay JSON bằng text
            $table->text('notes')->nullable();
            $table->text('shipping_instructions')->nullable(); // Hướng dẫn vận chuyển
            $table->text('attachment_urls')->nullable(); // URL phiếu xuất, phiếu nhập, ảnh, ngăn cách bởi |

            $table->timestamps();

            $table->index(['from_warehouse_id', 'status']);
            $table->index(['to_warehouse_id', 'status']);
            $table->index(['transfer_date', 'status']);
            $table->index('order_id');
            $table->index(['is_tax_exempt', 'type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_transfers');
    }
};
