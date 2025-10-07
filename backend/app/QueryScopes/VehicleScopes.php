<?php

namespace App\QueryScopes;

use Illuminate\Database\Eloquent\Builder;

trait VehicleScopes
{
    /**
     * Scope: Active vehicles
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: Search by license plate, VIN, or engine number
     */
    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->where(function ($q) use ($search) {
            $q->where('license_plate', 'like', "%{$search}%")
              ->orWhere('vin', 'like', "%{$search}%")
              ->orWhere('engine_number', 'like', "%{$search}%");
        });
    }

    /**
     * Scope: Filter by brand
     */
    public function scopeByBrand(Builder $query, int $brandId): Builder
    {
        return $query->where('brand_id', $brandId);
    }

    /**
     * Scope: Filter by model
     */
    public function scopeByModel(Builder $query, int $modelId): Builder
    {
        return $query->where('model_id', $modelId);
    }

    /**
     * Scope: Filter by customer
     */
    public function scopeForCustomer(Builder $query, int $customerId): Builder
    {
        return $query->where('customer_id', $customerId);
    }

    /**
     * Scope: Filter by year range
     */
    public function scopeYearBetween(Builder $query, int $fromYear, int $toYear): Builder
    {
        return $query->whereBetween('year', [$fromYear, $toYear]);
    }

    /**
     * Scope: Vehicles with active insurance
     */
    public function scopeInsuranceActive(Builder $query): Builder
    {
        return $query->whereNotNull('insurance_expiry')
            ->where('insurance_expiry', '>', now());
    }

    /**
     * Scope: Vehicles with expiring insurance
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
     * Scope: Vehicles with expired insurance
     */
    public function scopeInsuranceExpired(Builder $query): Builder
    {
        return $query->whereNotNull('insurance_expiry')
            ->where('insurance_expiry', '<', now());
    }

    /**
     * Scope: Vehicles with valid registration
     */
    public function scopeRegistrationValid(Builder $query): Builder
    {
        return $query->whereNotNull('registration_expiry')
            ->where('registration_expiry', '>', now());
    }

    /**
     * Scope: Vehicles with expiring registration
     */
    public function scopeRegistrationExpiringSoon(Builder $query, int $days = 30): Builder
    {
        return $query->whereNotNull('registration_expiry')
            ->whereBetween('registration_expiry', [
                now(),
                now()->addDays($days)
            ]);
    }

    /**
     * Scope: Vehicles with expired registration
     */
    public function scopeRegistrationExpired(Builder $query): Builder
    {
        return $query->whereNotNull('registration_expiry')
            ->where('registration_expiry', '<', now());
    }

    /**
     * Scope: Vehicles due for maintenance
     */
    public function scopeMaintenanceDue(Builder $query): Builder
    {
        return $query->whereNotNull('next_maintenance')
            ->where('next_maintenance', '<=', now());
    }

    /**
     * Scope: Vehicles with upcoming maintenance
     */
    public function scopeMaintenanceUpcoming(Builder $query, int $days = 7): Builder
    {
        return $query->whereNotNull('next_maintenance')
            ->whereBetween('next_maintenance', [
                now(),
                now()->addDays($days)
            ]);
    }

    /**
     * Scope: High mileage vehicles
     */
    public function scopeHighMileage(Builder $query, int $threshold = 100000): Builder
    {
        return $query->where('mileage', '>=', $threshold);
    }

    /**
     * Scope: Filter by color
     */
    public function scopeColor(Builder $query, string $color): Builder
    {
        return $query->where('color', 'like', "%{$color}%");
    }

    /**
     * Scope: With order count
     */
    public function scopeWithOrderCount(Builder $query): Builder
    {
        return $query->withCount('orders');
    }

    /**
     * Scope: With common relations
     */
    public function scopeWithCommonRelations(Builder $query): Builder
    {
        return $query->with([
            'customer:id,name,phone',
            'brand:id,name,logo',
            'model:id,name,type',
        ]);
    }

    /**
     * Scope: Vehicles needing attention (any expiry or maintenance due)
     */
    public function scopeNeedingAttention(Builder $query, int $days = 30): Builder
    {
        $futureDate = now()->addDays($days);

        return $query->where(function ($q) use ($futureDate) {
            $q->where(function ($q1) use ($futureDate) {
                $q1->whereNotNull('insurance_expiry')
                   ->where('insurance_expiry', '<=', $futureDate);
            })
            ->orWhere(function ($q2) use ($futureDate) {
                $q2->whereNotNull('registration_expiry')
                   ->where('registration_expiry', '<=', $futureDate);
            })
            ->orWhere(function ($q3) use ($futureDate) {
                $q3->whereNotNull('next_maintenance')
                   ->where('next_maintenance', '<=', $futureDate);
            });
        });
    }

    /**
     * Scope: Vehicles by brand and model
     */
    public function scopeByBrandAndModel(Builder $query, int $brandId, ?int $modelId = null): Builder
    {
        $query->where('brand_id', $brandId);

        if ($modelId) {
            $query->where('model_id', $modelId);
        }

        return $query;
    }
}
