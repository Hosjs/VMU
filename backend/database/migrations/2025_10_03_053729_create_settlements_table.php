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
        Schema::create('settlements', function (Blueprint $table) {
            $table->id();
            $table->string('settlement_number')->unique(); // Số phiếu quyết toán
            $table->unsignedBigInteger('order_id');
            $table->unsignedBigInteger('invoice_id')->nullable();
            $table->unsignedBigInteger('provider_id')->nullable();

            // Thông tin đơn vị nhận sửa chữa/cung cấp
            $table->string('provider_name'); // Tên đơn vị
            $table->string('provider_code')->nullable(); // Mã đơn vị
            $table->string('provider_contact')->nullable(); // Người liên hệ
            $table->string('provider_phone')->nullable(); // SĐT đơn vị
            $table->string('provider_email')->nullable(); // Email đơn vị
            $table->text('provider_address')->nullable(); // Địa chỉ đơn vị
            $table->string('provider_tax_code')->nullable(); // Mã số thuế
            $table->string('provider_bank_account')->nullable(); // Tài khoản ngân hàng

            // Thông tin công việc
            $table->enum('type', ['service', 'product', 'mixed']); // Loại quyết toán
            $table->text('work_description')->nullable(); // Mô tả công việc
            $table->date('work_start_date')->nullable(); // Ngày bắt đầu
            $table->date('work_completion_date')->nullable(); // Ngày hoàn thành

            // Tài chính (GIÁ QUYẾT TOÁN VỚI ĐỐI TÁC)
            $table->decimal('settlement_subtotal', 15, 2); // Tổng tiền trước thuế
            $table->decimal('settlement_tax_amount', 15, 2)->default(0); // Thuế VAT
            $table->decimal('settlement_tax_percent', 5, 2)->default(10); // % thuế
            $table->decimal('settlement_total', 15, 2); // Tổng tiền quyết toán

            // Phí và khấu trừ
            $table->decimal('commission_amount', 15, 2)->default(0); // Hoa hồng cho gara
            $table->decimal('commission_percent', 5, 2)->default(0); // % hoa hồng
            $table->decimal('deduction_amount', 15, 2)->default(0); // Các khoản khấu trừ khác
            $table->decimal('final_payment', 15, 2); // Số tiền thực trả

            // So sánh với giá báo khách
            $table->decimal('customer_quoted_total', 15, 2)->nullable(); // Tổng giá báo khách
            $table->decimal('profit_margin', 15, 2)->nullable(); // Chênh lệch lợi nhuận
            $table->decimal('profit_percent', 5, 2)->nullable(); // % lợi nhuận

            // Trạng thái quyết toán
            $table->enum('status', ['draft', 'pending_approval', 'approved', 'paid', 'completed', 'disputed'])->default('draft');

            // Thông tin thanh toán
            $table->enum('payment_status', ['unpaid', 'partial', 'paid'])->default('unpaid');
            $table->decimal('paid_amount', 15, 2)->default(0);
            $table->enum('payment_method', ['cash', 'transfer', 'check'])->nullable();
            $table->date('payment_due_date')->nullable();
            $table->date('payment_date')->nullable();

            // Người xử lý
            $table->unsignedBigInteger('created_by');
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->unsignedBigInteger('accountant_id')->nullable();
            $table->datetime('approved_at')->nullable();

            // Ghi chú và tài liệu - thay JSON bằng text
            $table->text('notes')->nullable(); // Ghi chú nội bộ
            $table->text('provider_notes')->nullable(); // Ghi chú từ đối tác
            $table->text('attachment_urls')->nullable(); // URL hóa đơn, chứng từ, ngăn cách bởi |
            $table->text('work_evidence_urls')->nullable(); // URL bằng chứng hoàn thành, ngăn cách bởi |

            $table->timestamps();

            $table->index(['order_id', 'status']);
            $table->index(['provider_id', 'status']);
            $table->index(['payment_status', 'payment_due_date']);
            $table->index(['type', 'status']);
            $table->index('settlement_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settlements');
    }
};
