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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->string('payment_number')->unique(); // Số phiếu thu
            $table->foreignId('invoice_id')->constrained()->onDelete('cascade');
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('customer_id')->constrained()->onDelete('cascade');

            // Thông tin thanh toán
            $table->decimal('amount', 15, 2); // Số tiền thanh toán
            $table->enum('payment_method', [
                'cash', 'bank_transfer', 'credit_card', 'debit_card',
                'digital_wallet', 'installment', 'check'
            ]);
            $table->date('payment_date'); // Ngày thanh toán
            $table->datetime('received_at')->nullable(); // Thời gian nhận tiền

            // Thông tin chi tiết theo phương thức
            $table->string('reference_number')->nullable(); // Số tham chiếu (mã GD ngân hàng, etc.)
            $table->string('bank_name')->nullable(); // Tên ngân hàng
            $table->string('account_number')->nullable(); // Số tài khoản
            $table->string('card_last_digits')->nullable(); // 4 số cuối thẻ
            $table->string('wallet_type')->nullable(); // Loại ví điện tử

            // Trạng thái
            $table->enum('status', ['pending', 'confirmed', 'failed', 'refunded', 'cancelled'])->default('pending');
            $table->enum('verification_status', ['unverified', 'verified', 'disputed'])->default('unverified');

            // Thông tin xử lý
            $table->foreignId('received_by')->constrained('users')->onDelete('cascade'); // Nhân viên thu tiền
            $table->foreignId('verified_by')->nullable()->constrained('users')->onDelete('set null'); // Người xác nhận
            $table->datetime('verified_at')->nullable();

            // Ghi chú và tài liệu
            $table->text('notes')->nullable(); // Ghi chú
            $table->text('customer_notes')->nullable(); // Ghi chú từ khách hàng
            $table->json('attachments')->nullable(); // Biên lai, ảnh chụp

            // Hoàn tiền (nếu có)
            $table->decimal('refund_amount', 15, 2)->default(0);
            $table->date('refund_date')->nullable();
            $table->text('refund_reason')->nullable();
            $table->foreignId('refunded_by')->nullable()->constrained('users')->onDelete('set null');

            $table->timestamps();

            $table->index(['invoice_id', 'status']);
            $table->index(['customer_id', 'payment_date']);
            $table->index(['payment_method', 'status']);
            $table->index('payment_number');
            $table->index(['received_by', 'payment_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
