<?php

namespace App\QueryScopes;

use Illuminate\Database\Eloquent\Builder;

trait CustomerScopes
{
    /**
     * Scope: Active customers
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: Search by name, phone, or email
     */
    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('phone', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%");
        });
    }

    /**
     * Scope: Customers with vehicles
     */
    public function scopeWithVehicles(Builder $query): Builder
    {
        return $query->has('vehicles');
    }

    /**
     * Scope: Customers without vehicles
     */
    public function scopeWithoutVehicles(Builder $query): Builder
    {
        return $query->doesntHave('vehicles');
    }

    /**
     * Scope: Customers with active insurance
     */
    public function scopeWithActiveInsurance(Builder $query): Builder
    {
        return $query->whereNotNull('insurance_expiry')
            ->where('insurance_expiry', '>', now());
    }

    /**
     * Scope: Customers with expiring insurance
     */
    public function scopeInsuranceExpiringSoon(Builder $query, int $days = 30): Builder
    {
        return $query->whereNotNull('insurance_expiry')
            ->whereBetween('insurance_expiry', [
                now(),
                now()->addDays($days)
            ]);
    }

    /**
     * Scope: Customers with expired insurance
     */
    public function scopeInsuranceExpired(Builder $query): Builder
    {
        return $query->whereNotNull('insurance_expiry')
            ->where('insurance_expiry', '<', now());
    }

    /**
     * Scope: With vehicle count
     */
    public function scopeWithVehicleCount(Builder $query): Builder
    {
        return $query->withCount('vehicles');
    }

    /**
     * Scope: With order statistics
     */
    public function scopeWithOrderStats(Builder $query): Builder
    {
        return $query->withCount('orders')
            ->withSum('orders', 'final_amount')
            ->withMax('orders', 'created_at');
    }

    /**
     * Scope: VIP customers (high spending) - Using Eloquent only
     * Note: This scope adds withSum to calculate total spending
     * Controller should filter results where total_spent >= threshold
     */
    public function scopeVip(Builder $query, float $threshold = 50000000): Builder
    {
        // Add sum of paid orders, controller will filter by threshold
        return $query->withSum(['orders as total_spent' => function($q) {
            $q->where('payment_status', 'paid');
        }], 'final_amount')
        ->has('orders');
    }

    /**
     * Scope: Customers with orders in date range
     */
    public function scopeWithOrdersBetween(Builder $query, string $from, string $to): Builder
    {
        return $query->whereHas('orders', function ($orderQuery) use ($from, $to) {
            $orderQuery->whereBetween('created_at', [$from, $to]);
        });
    }

    /**
     * Scope: New customers (registered recently)
     */
    public function scopeNew(Builder $query, int $days = 30): Builder
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    /**
     * Scope: Customers by gender
     */
    public function scopeGender(Builder $query, string $gender): Builder
    {
        return $query->where('gender', $gender);
    }

    /**
     * Scope: Customers with birthdays this month
     */
    public function scopeBirthdayThisMonth(Builder $query): Builder
    {
        return $query->whereMonth('birth_date', now()->month);
    }

    /**
     * Scope: Customers with upcoming birthdays
     */
    public function scopeBirthdayUpcoming(Builder $query, int $days = 7): Builder
    {
        $today = now();
        $futureDate = now()->addDays($days);

        return $query->whereNotNull('birth_date')
            ->where(function ($q) use ($today, $futureDate) {
                if ($today->month === $futureDate->month) {
                    $q->whereMonth('birth_date', $today->month)
                      ->whereDay('birth_date', '>=', $today->day)
                      ->whereDay('birth_date', '<=', $futureDate->day);
                } else {
                    $q->where(function ($q1) use ($today) {
                        $q1->whereMonth('birth_date', $today->month)
                           ->whereDay('birth_date', '>=', $today->day);
                    })->orWhere(function ($q2) use ($futureDate) {
                        $q2->whereMonth('birth_date', $futureDate->month)
                           ->whereDay('birth_date', '<=', $futureDate->day);
                    });
                }
            });
    }

    /**
     * Scope: Inactive customers (no orders recently) - Using Eloquent only
     */
    public function scopeInactive(Builder $query, int $months = 6): Builder
    {
        $cutoffDate = now()->subMonths($months);

        return $query->where(function ($q) use ($cutoffDate) {
            // Customers with no orders at all
            $q->whereDoesntHave('orders')
              // OR customers whose latest order is older than cutoff date
              ->orWhereDoesntHave('orders', function ($orderQuery) use ($cutoffDate) {
                  $orderQuery->where('created_at', '>=', $cutoffDate);
              });
        });
    }

    /**
     * Scope: With common relations
     */
    public function scopeWithCommonRelations(Builder $query): Builder
    {
        return $query->with([
            'vehicles:id,customer_id,license_plate,brand_id,model_id',
            'vehicles.brand:id,name',
            'vehicles.model:id,name',
        ]);
    }
}
