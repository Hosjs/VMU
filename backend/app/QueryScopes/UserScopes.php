<?php

namespace App\QueryScopes;

use Illuminate\Database\Eloquent\Builder;

trait UserScopes
{
    /**
     * Scope: Active users
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: Inactive users
     */
    public function scopeInactive(Builder $query): Builder
    {
        return $query->where('is_active', false);
    }

    /**
     * Scope: Search by name, email, phone, or employee code
     */
    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%")
              ->orWhere('phone', 'like', "%{$search}%")
              ->orWhere('employee_code', 'like', "%{$search}%");
        });
    }

    /**
     * Scope: Filter by role
     */
    public function scopeByRole(Builder $query, string $roleName): Builder
    {
        return $query->whereHas('role', function ($roleQuery) use ($roleName) {
            $roleQuery->where('name', $roleName);
        });
    }

    /**
     * Scope: Filter by position
     */
    public function scopeByPosition(Builder $query, string $position): Builder
    {
        return $query->where('position', 'like', "%{$position}%");
    }

    /**
     * Scope: Filter by department
     */
    public function scopeByDepartment(Builder $query, string $department): Builder
    {
        return $query->where('department', 'like', "%{$department}%");
    }

    /**
     * Scope: Admins only
     */
    public function scopeAdmins(Builder $query): Builder
    {
        return $query->whereHas('role', function ($roleQuery) {
            $roleQuery->where('name', 'admin');
        });
    }

    /**
     * Scope: Managers only
     */
    public function scopeManagers(Builder $query): Builder
    {
        return $query->whereHas('role', function ($roleQuery) {
            $roleQuery->where('name', 'manager');
        });
    }

    /**
     * Scope: Technicians only
     */
    public function scopeTechnicians(Builder $query): Builder
    {
        return $query->whereHas('role', function ($roleQuery) {
            $roleQuery->where('name', 'mechanic');
        });
    }

    /**
     * Scope: Accountants only
     */
    public function scopeAccountants(Builder $query): Builder
    {
        return $query->whereHas('role', function ($roleQuery) {
            $roleQuery->where('name', 'accountant');
        });
    }

    /**
     * Scope: Users with verified email
     */
    public function scopeEmailVerified(Builder $query): Builder
    {
        return $query->whereNotNull('email_verified_at');
    }

    /**
     * Scope: Users with unverified email
     */
    public function scopeEmailUnverified(Builder $query): Builder
    {
        return $query->whereNull('email_verified_at');
    }

    /**
     * Scope: Users hired after date
     */
    public function scopeHiredAfter(Builder $query, string $date): Builder
    {
        return $query->where('hire_date', '>=', $date);
    }

    /**
     * Scope: Users hired in year
     */
    public function scopeHiredInYear(Builder $query, int $year): Builder
    {
        return $query->whereYear('hire_date', $year);
    }

    /**
     * Scope: Long-serving employees (years of service)
     */
    public function scopeLongServing(Builder $query, int $years = 5): Builder
    {
        return $query->where('hire_date', '<=', now()->subYears($years));
    }

    /**
     * Scope: New employees (hired recently)
     */
    public function scopeNewHires(Builder $query, int $days = 90): Builder
    {
        return $query->where('hire_date', '>=', now()->subDays($days));
    }

    /**
     * Scope: Users with upcoming birthdays
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
     * Scope: With role information
     */
    public function scopeWithRole(Builder $query): Builder
    {
        return $query->with('role:id,name,display_name');
    }

    /**
     * Scope: Filter by gender
     */
    public function scopeGender(Builder $query, string $gender): Builder
    {
        return $query->where('gender', $gender);
    }
}

