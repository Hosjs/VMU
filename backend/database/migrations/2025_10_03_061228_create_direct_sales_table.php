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
            $table->string('sale_number')->unique();
            $table->unsignedBigInteger('warehouse_id'); // Phải là kho Việt Nga

            // Thông tin khách hàng (có thể là khách lẻ)
            $table->unsignedBigInteger('customer_id')->nullable();
            $table->string('customer_name');
            $table->string('customer_phone')->nullable();
            $table->string('customer_id_number')->nullable();
            $table->text('customer_address')->nullable();

            // Phân loại bán hàng
            $table->enum('sale_type', ['retail', 'wholesale', 'employee', 'internal']);
            // retail: bán lẻ, wholesale: bán sỉ, employee: bán cho nhân viên, internal: sử dụng nội bộ

            // Tài chính - CHỈ ADMIN ĐƯỢC XEM
            $table->decimal('subtotal', 15, 2);
            $table->decimal('discount_amount', 15, 2)->default(0);
            $table->decimal('discount_percent', 5, 2)->default(0);
            $table->decimal('tax_amount', 15, 2)->default(0);
            $table->decimal('total_amount', 15, 2);

            // Chi phí và lợi nhuận - THÔNG TIN NHẠY CẢM
            $table->decimal('total_cost', 15, 2);
            $table->decimal('gross_profit', 15, 2);
            $table->decimal('profit_margin', 5, 2);

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
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->datetime('approved_at')->nullable();
            $table->text('approval_notes')->nullable();

            // Nhân viên xử lý
            $table->unsignedBigInteger('salesperson_id');
            $table->unsignedBigInteger('created_by');

            // Thời gian
            $table->datetime('sale_date'); // Ngày bán
            $table->datetime('delivery_date')->nullable(); // Ngày giao (nếu có)

            // Ghi chú
            $table->text('notes')->nullable(); // Ghi chú nội bộ
            $table->text('customer_notes')->nullable(); // Ghi chú cho khách
            $table->text('internal_memo')->nullable(); // Memo nội bộ (chỉ admin)

            // Tài liệu - thay JSON bằng text
            $table->text('attachment_urls')->nullable(); // URL hóa đơn, biên lai, ngăn cách bởi |

            $table->timestamps();

            // Indexes với focus on security và performance
            $table->index(['warehouse_id', 'sale_date']);
            $table->index(['visibility_level', 'is_confidential']);
            $table->index(['salesperson_id', 'sale_date']);
            $table->index(['customer_id', 'sale_date']);
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
