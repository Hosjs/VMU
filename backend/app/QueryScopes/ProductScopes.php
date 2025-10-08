<?php

namespace App\QueryScopes;

use Illuminate\Database\Eloquent\Builder;

trait ProductScopes
{
    /**
     * Scope: Active products
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: Inactive products
     */
    public function scopeInactive(Builder $query): Builder
    {
        return $query->where('is_active', false);
    }

    /**
     * Scope: Search by name or code
     */
    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('code', 'like', "%{$search}%");
        });
    }

    /**
     * Scope: Filter by category
     */
    public function scopeByCategory(Builder $query, int $categoryId): Builder
    {
        return $query->where('category_id', $categoryId);
    }

    /**
     * Scope: Products with low stock
     */
    public function scopeLowStock(Builder $query): Builder
    {
        return $query->whereHas('warehouseStocks', function($q) {
            $q->whereColumn('available_quantity', '<=', 'reorder_point');
        });
    }

    /**
     * Scope: Products out of stock
     */
    public function scopeOutOfStock(Builder $query): Builder
    {
        return $query->whereHas('warehouseStocks', function($q) {
            $q->where('available_quantity', '<=', 0);
        });
    }

    /**
     * Scope: Products in stock
     */
    public function scopeInStock(Builder $query): Builder
    {
        return $query->whereHas('warehouseStocks', function($q) {
            $q->where('available_quantity', '>', 0);
        });
    }

    /**
     * Scope: With warehouse stocks
     */
    public function scopeWithStocks(Builder $query): Builder
    {
        return $query->with('warehouseStocks.warehouse');
    }

    /**
     * Scope: With category details
     */
    public function scopeWithCategory(Builder $query): Builder
    {
        return $query->with('category');
    }

    /**
     * Scope: With total available quantity
     */
    public function scopeWithTotalStock(Builder $query): Builder
    {
        return $query->withSum('warehouseStocks', 'available_quantity');
    }

    /**
     * Scope: Recent products
     */
    public function scopeRecent(Builder $query, int $limit = 10): Builder
    {
        return $query->latest()->limit($limit);
    }

    /**
     * Scope: Stockable products
     */
    public function scopeStockable(Builder $query): Builder
    {
        return $query->where('is_stockable', true);
    }

    /**
     * Scope: Products with stock tracking
     */
    public function scopeTracked(Builder $query): Builder
    {
        return $query->where('track_stock', true);
    }

    /**
     * Scope: Products tracked by serial number
     */
    public function scopeSerialTracked(Builder $query): Builder
    {
        return $query->where('track_by_serial', true);
    }

    /**
     * Scope: Products tracked by batch
     */
    public function scopeBatchTracked(Builder $query): Builder
    {
        return $query->where('track_by_batch', true);
    }

    /**
     * Scope: Products with warranty
     */
    public function scopeWithWarranty(Builder $query): Builder
    {
        return $query->where('has_warranty', true)
            ->where('warranty_months', '>', 0);
    }

    /**
     * Scope: Products with auto transfer enabled
     */
    public function scopeAutoTransferEnabled(Builder $query): Builder
    {
        return $query->where('auto_transfer_enabled', true);
    }

    /**
     * Scope: Products with stock information
     */
    public function scopeWithStockInfo(Builder $query, ?int $warehouseId = null): Builder
    {
        return $query->withSum('warehouseStocks as total_quantity', 'quantity')
            ->withSum('warehouseStocks as available_quantity', 'available_quantity')
            ->withSum('warehouseStocks as reserved_quantity', 'reserved_quantity')
            ->when($warehouseId, function ($q) use ($warehouseId) {
                $q->with(['warehouseStocks' => function ($stockQuery) use ($warehouseId) {
                    $stockQuery->where('warehouse_id', $warehouseId);
                }]);
            });
    }

    /**
     * Scope: Products needing reorder
     */
    public function scopeNeedReorder(Builder $query): Builder
    {
        return $query->whereHas('warehouseStocks', function ($stockQuery) {
            $stockQuery->whereColumn('available_quantity', '<=', 'reorder_point');
        });
    }

    /**
     * Scope: Products in specific warehouse
     */
    public function scopeInWarehouse(Builder $query, int $warehouseId, bool $availableOnly = false): Builder
    {
        return $query->whereHas('warehouseStocks', function ($stockQuery) use ($warehouseId, $availableOnly) {
            $stockQuery->where('warehouse_id', $warehouseId);

            if ($availableOnly) {
                $stockQuery->where('available_quantity', '>', 0);
            }
        });
    }

    /**
     * Scope: Products by supplier
     */
    public function scopeBySupplier(Builder $query, string $supplierCode): Builder
    {
        return $query->where('supplier_code', $supplierCode);
    }

    /**
     * Scope: Price range filter
     */
    public function scopePriceRange(Builder $query, float $min, float $max): Builder
    {
        return $query->whereBetween('quote_price', [$min, $max]);
    }

    /**
     * Scope: High profit margin products (Admin only) - Using Eloquent only
     */
    public function scopeHighProfitMargin(Builder $query, float $percentage = 30): Builder
    {
        // Filter products where quote_price > settlement_price
        return $query->whereColumn('quote_price', '>', 'settlement_price');
    }

    /**
     * Scope: Best selling products
     */
    public function scopeBestSelling(Builder $query, int $days = 30): Builder
    {
        return $query->withCount(['orderItems' => function ($orderItemQuery) use ($days) {
            $orderItemQuery->whereHas('order', function ($orderQuery) use ($days) {
                $orderQuery->where('created_at', '>=', now()->subDays($days));
            });
        }])->orderByDesc('order_items_count');
    }

    /**
     * Scope: With common relations
     */
    public function scopeWithCommonRelations(Builder $query): Builder
    {
        return $query->with([
            'category:id,name,type',
            'primaryWarehouse:id,code,name',
        ]);
    }

    /**
     * Scope: Products expiring soon
     */
    public function scopeExpiringSoon(Builder $query, int $days = 30): Builder
    {
        return $query->whereNotNull('shelf_life_days')
            ->whereHas('warehouseStocks', function ($stockQuery) use ($days) {
                $stockQuery->whereNotNull('expiry_date')
                    ->whereBetween('expiry_date', [now(), now()->addDays($days)]);
            });
    }
}

