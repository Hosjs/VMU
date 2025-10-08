<?php

namespace App\QueryScopes;

use Illuminate\Database\Eloquent\Builder;

trait InvoiceScopes
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
     * Scope: Filter by issuer
     */
    public function scopeByIssuer(Builder $query, string $issuer): Builder
    {
        return $query->where('issuer', $issuer);
    }

    /**
     * Scope: Admin only invoices
     */
    public function scopeAdminOnly(Builder $query, bool $adminOnly = true): Builder
    {
        return $query->where('admin_only_access', $adminOnly);
    }

    /**
     * Scope: Filter by customer
     */
    public function scopeForCustomer(Builder $query, int $customerId): Builder
    {
        return $query->where('customer_id', $customerId);
    }

    /**
     * Scope: Filter by order
     */
    public function scopeForOrder(Builder $query, int $orderId): Builder
    {
        return $query->where('order_id', $orderId);
    }

    /**
     * Scope: Filter by warehouse
     */
    public function scopeFromWarehouse(Builder $query, int $warehouseId): Builder
    {
        return $query->where('issuing_warehouse_id', $warehouseId);
    }

    /**
     * Scope: Invoice date range
     */
    public function scopeDateRange(Builder $query, string $from, string $to): Builder
    {
        return $query->whereBetween('invoice_date', [$from, $to]);
    }

    /**
     * Scope: Due date range
     */
    public function scopeDueDateRange(Builder $query, string $from, string $to): Builder
    {
        return $query->whereBetween('due_date', [$from, $to]);
    }

    /**
     * Scope: Overdue invoices
     */
    public function scopeOverdue(Builder $query): Builder
    {
        return $query->where('due_date', '<', now())
            ->whereIn('payment_status', ['unpaid', 'partial']);
    }

    /**
     * Scope: Due soon invoices
     */
    public function scopeDueSoon(Builder $query, int $days = 7): Builder
    {
        return $query->whereBetween('due_date', [now(), now()->addDays($days)])
            ->whereIn('payment_status', ['unpaid', 'partial']);
    }

    /**
     * Scope: Unpaid invoices
     */
    public function scopeUnpaid(Builder $query): Builder
    {
        return $query->where('payment_status', 'unpaid')
            ->where('paid_amount', 0);
    }

    /**
     * Scope: Partially paid invoices
     */
    public function scopePartiallyPaid(Builder $query): Builder
    {
        return $query->where('payment_status', 'partial')
            ->where('paid_amount', '>', 0)
            ->whereColumn('paid_amount', '<', 'total_amount');
    }

    /**
     * Scope: Fully paid invoices
     */
    public function scopePaid(Builder $query): Builder
    {
        return $query->where('payment_status', 'paid')
            ->whereColumn('paid_amount', '>=', 'total_amount');
    }

    /**
     * Scope: Draft invoices
     */
    public function scopeDraft(Builder $query): Builder
    {
        return $query->where('status', 'draft');
    }

    /**
     * Scope: Sent invoices
     */
    public function scopeSent(Builder $query): Builder
    {
        return $query->whereIn('status', ['sent', 'viewed']);
    }

    /**
     * Scope: Approved invoices
     */
    public function scopeApproved(Builder $query): Builder
    {
        return $query->whereNotNull('approved_at')
            ->whereNotNull('approved_by');
    }

    /**
     * Scope: Pending approval
     */
    public function scopePendingApproval(Builder $query): Builder
    {
        return $query->whereNull('approved_at')
            ->where('status', '!=', 'draft');
    }

    /**
     * Scope: Search by invoice number or customer info
     */
    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->where(function ($q) use ($search) {
            $q->where('invoice_number', 'like', "%{$search}%")
              ->orWhere('customer_name', 'like', "%{$search}%")
              ->orWhere('customer_phone', 'like', "%{$search}%")
              ->orWhere('customer_tax_code', 'like', "%{$search}%");
        });
    }

    /**
     * Scope: With payment summary
     */
    public function scopeWithPaymentSummary(Builder $query): Builder
    {
        return $query->withCount('payments')
            ->withSum('payments', 'amount');
    }

    /**
     * Scope: High value invoices
     */
    public function scopeHighValue(Builder $query, float $threshold = 10000000): Builder
    {
        return $query->where('total_amount', '>=', $threshold);
    }

    /**
     * Scope: With profit information (Admin only) - Using Eloquent only
     */
    public function scopeWithProfit(Builder $query): Builder
    {
        // Note: Cannot calculate profit percentage in query without raw SQL
        // Better approach: Calculate in accessor or after fetching
        // Just return the query as-is, profit calculation will be done in model accessor
        return $query;
    }

    /**
     * Scope: By month
     */
    public function scopeByMonth(Builder $query, int $year, int $month): Builder
    {
        return $query->whereYear('invoice_date', $year)
            ->whereMonth('invoice_date', $month);
    }

    /**
     * Scope: By year
     */
    public function scopeByYear(Builder $query, int $year): Builder
    {
        return $query->whereYear('invoice_date', $year);
    }

    /**
     * Scope: Recent invoices
     */
    public function scopeRecent(Builder $query, int $days = 30): Builder
    {
        return $query->where('invoice_date', '>=', now()->subDays($days));
    }

    /**
     * Scope: With common relations
     */
    public function scopeWithCommonRelations(Builder $query): Builder
    {
        return $query->with([
            'customer:id,name,phone,email',
            'order:id,order_number,status',
            'creator:id,name,employee_code',
        ]);
    }
}
