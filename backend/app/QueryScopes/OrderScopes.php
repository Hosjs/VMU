<?php

namespace App\QueryScopes;

use Illuminate\Database\Eloquent\Builder;

trait OrderScopes
{
    /**
     * Scope: Search by order number or customer name
     */
    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->where(function ($q) use ($search) {
            $q->where('order_number', 'like', "%{$search}%")
              ->orWhereHas('customer', function ($customerQuery) use ($search) {
                  $customerQuery->where('name', 'like', "%{$search}%");
              });
        });
    }

    /**
     * Scope: Filter by status
     */
    public function scopeByStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    /**
     * Scope: Filter by payment status
     */
    public function scopeByPaymentStatus(Builder $query, string $paymentStatus): Builder
    {
        return $query->where('payment_status', $paymentStatus);
    }

    /**
     * Scope: Filter by type
     */
    public function scopeByType(Builder $query, string $type): Builder
    {
        return $query->where('type', $type);
    }

    /**
     * Scope: Filter by customer
     */
    public function scopeForCustomer(Builder $query, int $customerId): Builder
    {
        return $query->where('customer_id', $customerId);
    }

    /**
     * Scope: Filter by date range
     */
    public function scopeDateRange(Builder $query, string $dateFrom, string $dateTo): Builder
    {
        return $query->whereBetween('created_at', [$dateFrom, $dateTo]);
    }

    /**
     * Scope: Pending orders
     */
    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope: In progress orders
     */
    public function scopeInProgress(Builder $query): Builder
    {
        return $query->where('status', 'in_progress');
    }

    /**
     * Scope: Completed orders
     */
    public function scopeCompleted(Builder $query): Builder
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope: Cancelled orders
     */
    public function scopeCancelled(Builder $query): Builder
    {
        return $query->where('status', 'cancelled');
    }

    /**
     * Scope: Paid orders
     */
    public function scopePaid(Builder $query): Builder
    {
        return $query->where('payment_status', 'paid');
    }

    /**
     * Scope: Unpaid orders
     */
    public function scopeUnpaid(Builder $query): Builder
    {
        return $query->where('payment_status', 'unpaid');
    }

    /**
     * Scope: Partial paid orders
     */
    public function scopePartialPaid(Builder $query): Builder
    {
        return $query->where('payment_status', 'partial');
    }

    /**
     * Scope: Orders with customer details
     */
    public function scopeWithCustomer(Builder $query): Builder
    {
        return $query->with('customer');
    }

    /**
     * Scope: Orders with vehicle details
     */
    public function scopeWithVehicle(Builder $query): Builder
    {
        return $query->with('vehicle.brand');
    }

    /**
     * Scope: Orders with all relationships
     */
    public function scopeWithDetails(Builder $query): Builder
    {
        return $query->with([
            'customer',
            'vehicle.brand',
            'orderDetails.service',
            'orderDetails.product'
        ]);
    }

    /**
     * Scope: Recent orders
     */
    public function scopeRecent(Builder $query, int $limit = 10): Builder
    {
        return $query->latest()->limit($limit);
    }
}
