<?php

namespace App\QueryScopes;

use Illuminate\Database\Eloquent\Builder;

trait UserScopes
{
    /**
     * Scope a query to only include active users.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include inactive users.
     */
    public function scopeInactive(Builder $query): Builder
    {
        return $query->where('is_active', false);
    }

    /**
     * Scope a query to filter users by role.
     */
    public function scopeByRole(Builder $query, int $roleId): Builder
    {
        return $query->where('role_id', $roleId);
    }

    /**
     * Scope a query to filter users by department.
     */
    public function scopeByDepartment(Builder $query, string $department): Builder
    {
        return $query->where('department', $department);
    }

    /**
     * Scope a query to search users by name, email, or employee code.
     */
    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%")
              ->orWhere('employee_code', 'like', "%{$search}%");
        });
    }
}

