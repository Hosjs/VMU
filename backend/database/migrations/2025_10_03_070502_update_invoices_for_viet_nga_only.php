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
        Schema::table('invoices', function (Blueprint $table) {
            // Thêm trường để xác định nguồn xuất hóa đơn
            $table->foreignId('issuing_warehouse_id')->after('vehicle_id')->constrained('warehouses')->onDelete('cascade'); // Kho xuất hóa đơn (luôn là Việt Nga)
            $table->enum('invoice_type', ['direct_sale', 'service_order', 'product_order'])->after('issuing_warehouse_id'); // Loại hóa đơn

            // Thêm trường để phân biệt khách hàng
            $table->enum('customer_type', ['end_customer', 'partner_garage', 'thang_truong'])->after('invoice_type');
            // end_customer: khách cuối, partner_garage: gara liên kết, thang_truong: chính Thắng Trường

            // Trường để liên kết với đơn mua hàng từ gara liên kết (nếu có)
            $table->foreignId('purchase_order_id')->nullable()->after('customer_type')->constrained()->onDelete('set null');

            // Ghi chú về xuất từ Việt Nga
            $table->boolean('issued_from_viet_nga')->default(true)->after('purchase_order_id'); // Luôn true
            $table->text('viet_nga_notes')->nullable()->after('issued_from_viet_nga'); // Ghi chú từ Việt Nga

            $table->index(['issuing_warehouse_id', 'status']);
            $table->index(['customer_type', 'invoice_type']);
            $table->index('purchase_order_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropForeign(['issuing_warehouse_id']);
            $table->dropForeign(['purchase_order_id']);
            $table->dropIndex(['issuing_warehouse_id', 'status']);
            $table->dropIndex(['customer_type', 'invoice_type']);
            $table->dropIndex(['purchase_order_id']);

            $table->dropColumn([
                'issuing_warehouse_id', 'invoice_type', 'customer_type',
                'purchase_order_id', 'issued_from_viet_nga', 'viet_nga_notes'
            ]);
        });
    }
};
