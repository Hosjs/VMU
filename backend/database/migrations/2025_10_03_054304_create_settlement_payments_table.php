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
        Schema::create('settlement_payments', function (Blueprint $table) {
            $table->id();
            $table->string('payment_number')->unique(); // Số phiếu chi
            $table->foreignId('settlement_id')->constrained()->onDelete('cascade');
            $table->foreignId('provider_id')->nullable()->constrained()->onDelete('set null');

            // Thông tin thanh toán
            $table->decimal('amount', 15, 2); // Số tiền thanh toán
            $table->enum('payment_method', ['cash', 'bank_transfer', 'check']);
            $table->date('payment_date'); // Ngày thanh toán
            $table->datetime('processed_at')->nullable(); // Thời gian xử lý

            // Thông tin chi tiết theo phương thức
            $table->string('reference_number')->nullable(); // Số tham chiếu (mã GD ngân hàng)
            $table->string('bank_name')->nullable(); // Ngân hàng thực hiện
            $table->string('account_number')->nullable(); // Số tài khoản nhận
            $table->string('check_number')->nullable(); // Số séc (nếu là séc)

            // Trạng thái
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'cancelled'])->default('pending');
            $table->enum('approval_status', ['pending', 'approved', 'rejected'])->default('pending');

            // Thông tin xử lý
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade'); // Người tạo phiếu chi
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null'); // Người phê duyệt
            $table->foreignId('processed_by')->nullable()->constrained('users')->onDelete('set null'); // Người thực hiện thanh toán

            $table->datetime('approved_at')->nullable();
            $table->text('approval_notes')->nullable(); // Ghi chú phê duyệt
            $table->text('rejection_reason')->nullable(); // Lý do từ chối

            // Ghi chú và tài liệu
            $table->text('notes')->nullable();
            $table->json('attachments')->nullable(); // Chứng từ thanh toán, ảnh chụp

            // Xác nhận từ đối tác
            $table->boolean('provider_confirmed')->default(false);
            $table->datetime('provider_confirmed_at')->nullable();
            $table->text('provider_notes')->nullable();

            $table->timestamps();

            $table->index(['settlement_id', 'status']);
            $table->index(['provider_id', 'payment_date']);
            $table->index(['payment_method', 'status']);
            $table->index('payment_number');
            $table->index(['approval_status', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settlement_payments');
    }
};
