<?php

namespace App\QueryScopes;

use Illuminate\Database\Eloquent\Builder;

trait SettlementScopes
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
     * Scope: Filter by payment status
     */
    public function scopePaymentStatus(Builder $query, string|array $status): Builder
    {
        return is_array($status)
            ? $query->whereIn('payment_status', $status)
            : $query->where('payment_status', $status);
    }

    /**
     * Scope: Filter by type
     */
    public function scopeType(Builder $query, string $type): Builder
    {
        return $query->where('type', $type);
    }

    /**
     * Scope: Filter by provider
     */
    public function scopeByProvider(Builder $query, int $providerId): Builder
    {
        return $query->where('provider_id', $providerId);
    }

    /**
     * Scope: Filter by order
     */
    public function scopeForOrder(Builder $query, int $orderId): Builder
    {
        return $query->where('order_id', $orderId);
    }

    /**
     * Scope: Pending settlements
     */
    public function scopePending(Builder $query): Builder
    {
        return $query->whereIn('status', ['draft', 'pending_approval']);
    }

    /**
     * Scope: Approved settlements
     */
    public function scopeApproved(Builder $query): Builder
    {
        return $query->where('status', 'approved')
            ->whereNotNull('approved_at');
    }

    /**
     * Scope: Pending approval
     */
    public function scopePendingApproval(Builder $query): Builder
    {
        return $query->where('status', 'pending_approval')
            ->whereNull('approved_at');
    }

    /**
     * Scope: Unpaid settlements
     */
    public function scopeUnpaid(Builder $query): Builder
    {
        return $query->where('payment_status', 'unpaid')
            ->where('paid_amount', 0);
    }

    /**
     * Scope: Partially paid settlements
     */
    public function scopePartiallyPaid(Builder $query): Builder
    {
        return $query->where('payment_status', 'partial')
            ->where('paid_amount', '>', 0)
            ->whereColumn('paid_amount', '<', 'final_payment');
    }

    /**
     * Scope: Fully paid settlements
     */
    public function scopePaid(Builder $query): Builder
    {
        return $query->where('payment_status', 'paid')
            ->whereColumn('paid_amount', '>=', 'final_payment');
    }

    /**
     * Scope: Overdue settlements
     */
    public function scopeOverdue(Builder $query): Builder
    {
        return $query->whereNotNull('payment_due_date')
            ->where('payment_due_date', '<', now())
            ->whereIn('payment_status', ['unpaid', 'partial']);
    }

    /**
     * Scope: Due soon settlements
     */
    public function scopeDueSoon(Builder $query, int $days = 7): Builder
    {
        return $query->whereNotNull('payment_due_date')
            ->whereBetween('payment_due_date', [now(), now()->addDays($days)])
            ->whereIn('payment_status', ['unpaid', 'partial']);
    }

    /**
     * Scope: Date range by work completion
     */
    public function scopeCompletedBetween(Builder $query, string $from, string $to): Builder
    {
        return $query->whereBetween('work_completion_date', [$from, $to])
            ->whereNotNull('work_completion_date');
    }

    /**
     * Scope: Search by settlement number or provider
     */
    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->where(function ($q) use ($search) {
            $q->where('settlement_number', 'like', "%{$search}%")
              ->orWhere('provider_name', 'like', "%{$search}%")
              ->orWhere('provider_code', 'like', "%{$search}%")
              ->orWhere('provider_phone', 'like', "%{$search}%");
        });
    }

    /**
     * Scope: With payment summary
     */
    public function scopeWithPaymentSummary(Builder $query): Builder
    {
        return $query->withCount('settlementPayments')
            ->withSum('settlementPayments', 'amount');
    }

    /**
     * Scope: High value settlements
     */
    public function scopeHighValue(Builder $query, float $threshold = 10000000): Builder
    {
        return $query->where('final_payment', '>=', $threshold);
    }

    /**
     * Scope: With profit margin (Admin only)
     */
    public function scopeWithProfit(Builder $query): Builder
    {
        return $query->whereNotNull('profit_margin')
            ->whereNotNull('profit_percent');
    }

    /**
     * Scope: By month
     */
    public function scopeByMonth(Builder $query, int $year, int $month): Builder
    {
        return $query->whereYear('created_at', $year)
            ->whereMonth('created_at', $month);
    }

    /**
     * Scope: By year
     */
    public function scopeByYear(Builder $query, int $year): Builder
    {
        return $query->whereYear('created_at', $year);
    }

    /**
     * Scope: Recent settlements
     */
    public function scopeRecent(Builder $query, int $days = 30): Builder
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    /**
     * Scope: With common relations
     */
    public function scopeWithCommonRelations(Builder $query): Builder
    {
        return $query->with([
            'provider:id,code,name,phone',
            'order:id,order_number,status',
            'creator:id,name,employee_code',
            'accountant:id,name,employee_code',
        ]);
    }

    /**
     * Scope: Disputed settlements
     */
    public function scopeDisputed(Builder $query): Builder
    {
        return $query->where('status', 'disputed');
    }
}

