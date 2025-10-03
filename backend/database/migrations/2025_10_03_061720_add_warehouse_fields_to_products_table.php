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
        Schema::table('products', function (Blueprint $table) {
            // Drop indexes trước khi drop columns (SQLite requirement)
            $table->dropIndex(['stock_quantity']);
            $table->dropIndex(['code', 'sku']);
        });

        Schema::table('products', function (Blueprint $table) {
            // Xóa các cột quản lý tồn kho cũ vì giờ sẽ quản lý theo từng kho
            $table->dropColumn(['stock_quantity', 'min_stock']);

            // Thêm các trường mới cho hệ thống kho
            $table->foreignId('primary_warehouse_id')->nullable()->after('category_id')->constrained('warehouses')->onDelete('set null');
            $table->boolean('is_stockable')->default(true)->after('primary_warehouse_id');
            $table->boolean('track_by_serial')->default(false)->after('is_stockable');
            $table->boolean('track_by_batch')->default(false)->after('track_by_serial');
            $table->integer('shelf_life_days')->nullable()->after('track_by_batch');
            $table->boolean('auto_transfer_enabled')->default(true)->after('shelf_life_days');
            $table->integer('transfer_threshold')->default(5)->after('auto_transfer_enabled');
        });

        Schema::table('products', function (Blueprint $table) {
            // Tạo lại indexes
            $table->index(['code', 'sku']);
            $table->index(['primary_warehouse_id', 'is_stockable']);
            $table->index(['track_by_serial', 'track_by_batch']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['primary_warehouse_id']);
            $table->dropIndex(['primary_warehouse_id', 'is_stockable']);
            $table->dropIndex(['track_by_serial', 'track_by_batch']);

            $table->dropColumn([
                'primary_warehouse_id', 'is_stockable', 'track_by_serial',
                'track_by_batch', 'shelf_life_days', 'auto_transfer_enabled', 'transfer_threshold'
            ]);

            // Khôi phục các cột cũ
            $table->integer('stock_quantity')->default(0);
            $table->integer('min_stock')->default(0);
            $table->index('stock_quantity');
        });
    }
};
