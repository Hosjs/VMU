<?php

namespace App\QueryScopes;

use Illuminate\Database\Eloquent\Builder;

trait WarehouseScopes
{
    /**
     * Scope: Active warehouses
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: Filter by type
     */
    public function scopeType(Builder $query, string $type): Builder
    {
        return $query->where('type', $type);
    }

    /**
     * Scope: Main warehouse
     */
    public function scopeMain(Builder $query): Builder
    {
        return $query->where('is_main_warehouse', true);
    }

    /**
     * Scope: Partner warehouses
     */
    public function scopePartner(Builder $query): Builder
    {
        return $query->where('type', 'partner');
    }

    /**
     * Scope: Warehouses that can receive transfers
     */
    public function scopeCanReceive(Builder $query): Builder
    {
        return $query->where('can_receive_transfers', true)
            ->where('is_active', true);
    }

    /**
     * Scope: Warehouses that can send transfers
     */
    public function scopeCanSend(Builder $query): Builder
    {
        return $query->where('can_send_transfers', true)
            ->where('is_active', true);
    }

    /**
     * Scope: Filter by provider
     */
    public function scopeByProvider(Builder $query, int $providerId): Builder
    {
        return $query->where('provider_id', $providerId);
    }

    /**
     * Scope: Filter by location
     */
    public function scopeByLocation(Builder $query, ?string $province = null, ?string $district = null): Builder
    {
        if ($province) {
            $query->where('province', 'like', "%{$province}%");
        }

        if ($district) {
            $query->where('district', 'like', "%{$district}%");
        }

        return $query;
    }

    /**
     * Scope: Search by code or name
     */
    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->where(function ($q) use ($search) {
            $q->where('code', 'like', "%{$search}%")
              ->orWhere('name', 'like', "%{$search}%")
              ->orWhere('address', 'like', "%{$search}%");
        });
    }

    /**
     * Scope: With stock statistics
     */
    public function scopeWithStockStats(Builder $query): Builder
    {
        return $query->withCount('stocks')
            ->withSum('stocks', 'total_value')
            ->withSum('stocks', 'available_quantity');
    }

    /**
     * Scope: Warehouses with low stock products
     */
    public function scopeWithLowStock(Builder $query): Builder
    {
        return $query->whereHas('stocks', function ($stockQuery) {
            $stockQuery->whereColumn('available_quantity', '<=', 'min_stock')
                ->where('available_quantity', '>', 0);
        });
    }

    /**
     * Scope: Warehouses with out of stock products
     */
    public function scopeWithOutOfStock(Builder $query): Builder
    {
        return $query->whereHas('stocks', function ($stockQuery) {
            $stockQuery->where('available_quantity', 0);
        });
    }

    /**
     * Scope: By priority order
     */
    public function scopeByPriority(Builder $query): Builder
    {
        return $query->orderBy('priority_order', 'asc');
    }

    /**
     * Scope: With manager
     */
    public function scopeWithManager(Builder $query): Builder
    {
        return $query->with('manager:id,name,employee_code,phone');
    }
}

