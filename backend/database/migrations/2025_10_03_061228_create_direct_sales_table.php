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
        Schema::create('direct_sales', function (Blueprint $table) {
            $table->id();
            $table->string('sale_number')->unique(); // Số phiếu bán trực tiếp
            $table->foreignId('warehouse_id')->constrained()->onDelete('cascade'); // Phải là kho Việt Nga

            // Thông tin khách hàng (có thể là khách lẻ)
            $table->foreignId('customer_id')->nullable()->constrained()->onDelete('set null'); // Khách hàng đã đăng ký
            $table->string('customer_name'); // Tên khách (có thể khác với customer_id)
            $table->string('customer_phone')->nullable();
            $table->string('customer_id_number')->nullable(); // CCCD/CMND
            $table->text('customer_address')->nullable();

            // Phân loại bán hàng
            $table->enum('sale_type', ['retail', 'wholesale', 'employee', 'internal']);
            // retail: bán lẻ, wholesale: bán sỉ, employee: bán cho nhân viên, internal: sử dụng nội bộ

            // Tài chính - CHỈ ADMIN ĐƯỢC XEM
            $table->decimal('subtotal', 15, 2); // Tổng tiền trước thuế
            $table->decimal('discount_amount', 15, 2)->default(0); // Giảm giá
            $table->decimal('discount_percent', 5, 2)->default(0); // % giảm giá
            $table->decimal('tax_amount', 15, 2)->default(0); // Thuế VAT
            $table->decimal('total_amount', 15, 2); // Tổng tiền cuối

            // Chi phí và lợi nhuận - THÔNG TIN NHẠY CẢM
            $table->decimal('total_cost', 15, 2); // Tổng giá vốn
            $table->decimal('gross_profit', 15, 2); // Lợi nhuận gộp
            $table->decimal('profit_margin', 5, 2); // % lợi nhuận

            // Thanh toán
            $table->enum('payment_method', ['cash', 'transfer', 'card', 'credit'])->default('cash');
            $table->enum('payment_status', ['pending', 'paid', 'partial', 'credit'])->default('pending');
            $table->decimal('paid_amount', 15, 2)->default(0);
            $table->date('payment_due_date')->nullable();

            // Quyền truy cập - QUAN TRỌNG
            $table->enum('visibility_level', ['admin_only', 'manager', 'accountant']);
            // admin_only: chỉ admin xem được, manager: admin + quản lý, accountant: admin + kế toán
            $table->boolean('is_confidential')->default(true); // Đánh dấu bí mật

            // Phê duyệt
            $table->enum('approval_status', ['draft', 'pending', 'approved', 'rejected'])->default('draft');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->datetime('approved_at')->nullable();
            $table->text('approval_notes')->nullable();

            // Nhân viên xử lý
            $table->foreignId('salesperson_id')->constrained('users')->onDelete('cascade'); // Nhân viên bán
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade'); // Người tạo phiếu

            // Thời gian
            $table->datetime('sale_date'); // Ngày bán
            $table->datetime('delivery_date')->nullable(); // Ngày giao (nếu có)

            // Ghi chú
            $table->text('notes')->nullable(); // Ghi chú nội bộ
            $table->text('customer_notes')->nullable(); // Ghi chú cho khách
            $table->text('internal_memo')->nullable(); // Memo nội bộ (chỉ admin)

            // Tài liệu
            $table->json('attachments')->nullable(); // Hóa đơn, biên lai

            $table->timestamps();

            // Indexes với focus on security và performance
            $table->index(['warehouse_id', 'sale_date']);
            $table->index(['visibility_level', 'is_confidential']);
            $table->index(['salesperson_id', 'sale_date']);
            $table->index(['customer_id', 'sale_date']);
            $table->index(['approval_status', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('direct_sales');
    }
};
