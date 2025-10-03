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
        Schema::create('stock_transfer_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_transfer_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');

            // Số lượng chuyển
            $table->integer('requested_quantity'); // Số lượng yêu cầu chuyển
            $table->integer('sent_quantity')->default(0); // Số lượng thực tế gửi
            $table->integer('received_quantity')->default(0); // Số lượng thực tế nhận
            $table->integer('damaged_quantity')->default(0); // Số lượng hư hỏng trong vận chuyển

            // Giá trị (quan trọng cho thuế)
            $table->decimal('unit_cost', 15, 2); // Giá vốn đơn vị
            $table->decimal('total_cost', 15, 2); // Tổng giá vốn

            // Thông tin sản phẩm tại thời điểm chuyển (snapshot)
            $table->string('product_name');
            $table->string('product_code');
            $table->string('product_sku');

            // Vị trí trong kho
            $table->string('from_location')->nullable(); // Vị trí tại kho gửi
            $table->string('to_location')->nullable(); // Vị trí tại kho nhận

            // Trạng thái từng item
            $table->enum('status', ['pending', 'packed', 'shipped', 'received', 'damaged', 'lost'])->default('pending');

            // Thông tin đóng gói và vận chuyển
            $table->string('batch_number')->nullable(); // Số lô
            $table->string('serial_number')->nullable(); // Số serial
            $table->date('expiry_date')->nullable(); // Hạn sử dụng
            $table->text('packing_notes')->nullable(); // Ghi chú đóng gói

            // Người xử lý
            $table->foreignId('packed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('received_by')->nullable()->constrained('users')->onDelete('set null');
            $table->datetime('packed_at')->nullable();
            $table->datetime('received_at')->nullable();

            $table->text('notes')->nullable();
            $table->json('quality_check')->nullable(); // Kết quả kiểm tra chất lượng

            $table->timestamps();

            $table->index(['stock_transfer_id', 'status']);
            $table->index(['product_id', 'status']);
            $table->index('batch_number');
            $table->index('serial_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_transfer_items');
    }
};
