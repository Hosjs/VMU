<?php

namespace App\QueryScopes;

use Illuminate\Database\Eloquent\Builder;

trait StockTransferScopes
{
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
     * Scope: Filter by type
     */
    public function scopeType(Builder $query, string $type): Builder
    {
        return $query->where('type', $type);
    }

    /**
     * Scope: From warehouse
     */
    public function scopeFromWarehouse(Builder $query, int $warehouseId): Builder
    {
        return $query->where('from_warehouse_id', $warehouseId);
    }

    /**
     * Scope: To warehouse
     */
    public function scopeToWarehouse(Builder $query, int $warehouseId): Builder
    {
        return $query->where('to_warehouse_id', $warehouseId);
    }

    /**
     * Scope: For order
     */
    public function scopeForOrder(Builder $query, int $orderId): Builder
    {
        return $query->where('order_id', $orderId);
    }

    /**
     * Scope: Pending transfers
     */
    public function scopePending(Builder $query): Builder
    {
        return $query->whereIn('status', ['draft', 'pending']);
    }

    /**
     * Scope: In transit transfers
     */
    public function scopeInTransit(Builder $query): Builder
    {
        return $query->where('status', 'in_transit');
    }

    /**
     * Scope: Completed transfers
     */
    public function scopeCompleted(Builder $query): Builder
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope: Tax exempt transfers
     */
    public function scopeTaxExempt(Builder $query): Builder
    {
        return $query->where('is_tax_exempt', true);
    }

    /**
     * Scope: Transfers with tax
     */
    public function scopeTaxable(Builder $query): Builder
    {
        return $query->where('is_tax_exempt', false);
    }

    /**
     * Scope: Internal transfers (between company warehouses)
     */
    public function scopeInternal(Builder $query): Builder
    {
        return $query->where('type', 'internal');
    }

    /**
     * Scope: Inter-company transfers
     */
    public function scopeInterCompany(Builder $query): Builder
    {
        return $query->where('type', 'inter_company');
    }

    /**
     * Scope: Search by transfer number
     */
    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->where('transfer_number', 'like', "%{$search}%")
            ->orWhere('tracking_number', 'like', "%{$search}%");
    }

    /**
     * Scope: Transfer date range
     */
    public function scopeDateRange(Builder $query, string $from, string $to): Builder
    {
        return $query->whereBetween('transfer_date', [$from, $to]);
    }

    /**
     * Scope: Overdue transfers (expected arrival passed)
     */
    public function scopeOverdue(Builder $query): Builder
    {
        return $query->where('status', 'in_transit')
            ->whereNotNull('expected_arrival')
            ->where('expected_arrival', '<', now());
    }

    /**
     * Scope: Pending approval
     */
    public function scopePendingApproval(Builder $query): Builder
    {
        return $query->where('status', 'pending')
            ->whereNull('approved_at');
    }

    /**
     * Scope: Approved transfers
     */
    public function scopeApproved(Builder $query): Builder
    {
        return $query->whereNotNull('approved_at')
            ->whereNotNull('approved_by');
    }

    /**
     * Scope: With items count
     */
    public function scopeWithItemsCount(Builder $query): Builder
    {
        return $query->withCount('items');
    }

    /**
     * Scope: With common relations
     */
    public function scopeWithCommonRelations(Builder $query): Builder
    {
        return $query->with([
            'fromWarehouse:id,code,name',
            'toWarehouse:id,code,name',
            'creator:id,name,employee_code',
            'approver:id,name,employee_code',
        ]);
    }

    /**
     * Scope: Recent transfers
     */
    public function scopeRecent(Builder $query, int $days = 30): Builder
    {
        return $query->where('transfer_date', '>=', now()->subDays($days));
    }
}

