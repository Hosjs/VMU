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
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('warehouse_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');

            // Loại giao dịch
            $table->enum('type', ['in', 'out', 'transfer_in', 'transfer_out', 'adjustment', 'return']);
            // in: nhập kho, out: xuất kho, transfer_in/out: chuyển kho, adjustment: điều chỉnh, return: trả hàng

            // Số lượng và giá trị
            $table->integer('quantity'); // Số lượng (âm nếu xuất, dương nếu nhập)
            $table->decimal('unit_cost', 15, 2)->default(0); // Đơn giá
            $table->decimal('total_cost', 15, 2)->default(0); // Thành tiền

            // Tồn kho sau giao dịch
            $table->integer('stock_after')->default(0); // Tồn kho sau khi thực hiện

            // Liên kết với các bảng khác
            $table->foreignId('order_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('stock_transfer_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('invoice_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('direct_sale_id')->nullable()->constrained()->onDelete('set null');

            // Thông tin giao dịch
            $table->string('reference_number')->nullable(); // Số chứng từ liên quan
            $table->enum('movement_reason', [
                'sale', 'purchase', 'transfer', 'return', 'damage',
                'expired', 'theft', 'adjustment', 'direct_sale', 'service_use'
            ]);
            // sale: bán hàng, purchase: mua hàng, transfer: chuyển kho, return: trả hàng,
            // damage: hư hỏng, expired: hết hạn, theft: mất trộm, adjustment: điều chỉnh,
            // direct_sale: bán trực tiếp tại Việt Nga, service_use: sử dụng cho dịch vụ

            // Thông tin thuế
            $table->boolean('is_taxable')->default(true);
            $table->decimal('tax_amount', 15, 2)->default(0);
            $table->decimal('tax_rate', 5, 2)->default(0);

            // Người thực hiện
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->datetime('movement_date'); // Thời gian thực hiện giao dịch

            $table->text('notes')->nullable();
            $table->json('metadata')->nullable(); // Dữ liệu bổ sung (batch number, serial number, etc.)

            $table->timestamps();

            $table->index(['warehouse_id', 'product_id', 'movement_date']);
            $table->index(['type', 'movement_reason']);
            $table->index('order_id');
            $table->index('stock_transfer_id');
            $table->index(['movement_date', 'created_by']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};
