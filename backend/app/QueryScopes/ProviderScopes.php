<?php

namespace App\QueryScopes;

use Illuminate\Database\Eloquent\Builder;

trait ProviderScopes
{
    /**
     * Scope: Active providers
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope: Filter by status
     */
    public function scopeStatus(Builder $query, string|array $status): Builder
    {
        return is_array($status)
            ? $query->whereIn('status', $status)
            : $query->where('status', $status);
    }

    /**
     * Scope: Search by code, name, or contact
     */
    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->where(function ($q) use ($search) {
            $q->where('code', 'like', "%{$search}%")
              ->orWhere('name', 'like', "%{$search}%")
              ->orWhere('business_name', 'like', "%{$search}%")
              ->orWhere('phone', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%")
              ->orWhere('contact_person', 'like', "%{$search}%");
        });
    }

    /**
     * Scope: Filter by service type
     */
    public function scopeByServiceType(Builder $query, string $serviceType): Builder
    {
        return $query->where('service_types', 'like', "%{$serviceType}%");
    }

    /**
     * Scope: Filter by specialization
     */
    public function scopeBySpecialization(Builder $query, string $specialization): Builder
    {
        return $query->where('specializations', 'like', "%{$specialization}%");
    }

    /**
     * Scope: High rated providers
     */
    public function scopeHighRated(Builder $query, float $minRating = 4.0): Builder
    {
        return $query->where('rating', '>=', $minRating)
            ->where('status', 'active');
    }

    /**
     * Scope: Providers by rating range
     */
    public function scopeRatingRange(Builder $query, float $min, float $max): Builder
    {
        return $query->whereBetween('rating', [$min, $max]);
    }

    /**
     * Scope: Providers with completed orders
     */
    public function scopeWithCompletedOrders(Builder $query, int $minOrders = 1): Builder
    {
        return $query->where('completed_orders', '>=', $minOrders);
    }

    /**
     * Scope: Fast completion providers
     */
    public function scopeFastCompletion(Builder $query, float $maxHours = 48): Builder
    {
        return $query->where('average_completion_time', '<=', $maxHours)
            ->where('completed_orders', '>', 0);
    }

    /**
     * Scope: Providers with active contracts
     */
    public function scopeWithActiveContract(Builder $query): Builder
    {
        return $query->whereNotNull('contract_start')
            ->whereNotNull('contract_end')
            ->where('contract_start', '<=', now())
            ->where('contract_end', '>=', now());
    }

    /**
     * Scope: Providers with expiring contracts
     */
    public function scopeContractExpiringSoon(Builder $query, int $days = 30): Builder
    {
        return $query->whereNotNull('contract_end')
            ->whereBetween('contract_end', [now(), now()->addDays($days)]);
    }

    /**
     * Scope: Providers with expired contracts
     */
    public function scopeContractExpired(Builder $query): Builder
    {
        return $query->whereNotNull('contract_end')
            ->where('contract_end', '<', now());
    }

    /**
     * Scope: Blacklisted providers
     */
    public function scopeBlacklisted(Builder $query): Builder
    {
        return $query->where('status', 'blacklisted');
    }

    /**
     * Scope: Suspended providers
     */
    public function scopeSuspended(Builder $query): Builder
    {
        return $query->where('status', 'suspended');
    }

    /**
     * Scope: With pending settlements
     */
    public function scopeWithPendingSettlements(Builder $query): Builder
    {
        return $query->whereHas('settlements', function ($settlementQuery) {
            $settlementQuery->whereIn('payment_status', ['unpaid', 'partial']);
        });
    }

    /**
     * Scope: With overdue settlements
     */
    public function scopeWithOverdueSettlements(Builder $query): Builder
    {
        return $query->whereHas('settlements', function ($settlementQuery) {
            $settlementQuery->where('payment_due_date', '<', now())
                ->whereIn('payment_status', ['unpaid', 'partial']);
        });
    }

    /**
     * Scope: Providers by commission rate range
     */
    public function scopeCommissionRange(Builder $query, float $min, float $max): Builder
    {
        return $query->whereBetween('commission_rate', [$min, $max]);
    }

    /**
     * Scope: Providers by payment method
     */
    public function scopeByPaymentMethod(Builder $query, string $method): Builder
    {
        return $query->where('payment_method', $method);
    }

    /**
     * Scope: With statistics
     */
    public function scopeWithStats(Builder $query): Builder
    {
        return $query->withCount('orders')
            ->withCount(['settlements' => function ($settlementQuery) {
                $settlementQuery->whereIn('payment_status', ['unpaid', 'partial']);
            }])
            ->withSum('settlements', 'final_payment');
    }

    /**
     * Scope: Managed by user
     */
    public function scopeManagedBy(Builder $query, int $managerId): Builder
    {
        return $query->where('managed_by', $managerId);
    }

    /**
     * Scope: With common relations
     */
    public function scopeWithCommonRelations(Builder $query): Builder
    {
        return $query->with([
            'manager:id,name,employee_code,phone',
        ]);
    }
}
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
     * Scope: Search by name, code, or SKU
     */
    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('code', 'like', "%{$search}%")
              ->orWhere('sku', 'like', "%{$search}%");
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
     * Scope: Low stock products (across all warehouses)
     */
    public function scopeLowStock(Builder $query): Builder
    {
        return $query->whereHas('warehouseStocks', function ($stockQuery) {
            $stockQuery->whereColumn('available_quantity', '<=', 'min_stock')
                ->where('available_quantity', '>', 0);
        });
    }

    /**
     * Scope: Out of stock products
     */
    public function scopeOutOfStock(Builder $query): Builder
    {
        return $query->whereDoesntHave('warehouseStocks', function ($stockQuery) {
            $stockQuery->where('available_quantity', '>', 0);
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
     * Scope: High profit margin products (Admin only)
     */
    public function scopeHighProfitMargin(Builder $query, float $percentage = 30): Builder
    {
        return $query->whereRaw('((quote_price - settlement_price) / quote_price * 100) >= ?', [$percentage]);
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

