<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

trait HasPermissions
{

    protected function userHasPermission(string $permission): bool
    {
        $user = auth()->user();
        return $user && $user->can($permission);
    }

    protected function userHasAnyPermission(array $permissions): bool
    {
        $user = auth()->user();
        return $user && $user->hasAnyPermission($permissions);
    }

    protected function userHasAllPermissions(array $permissions): bool
    {
        $user = auth()->user();
        return $user && $user->hasAllPermissions($permissions);
    }

    /**
     * Abort 403 nếu không có permission
     * ✅ Sử dụng trong controller methods
     */
    protected function authorizePermission(string $permission, string $message = null): void
    {
        if (!$this->userHasPermission($permission)) {
            abort(403, $message ?? 'Bạn không có quyền thực hiện hành động này.');
        }
    }

    protected function authorizeAnyPermission(array $permissions, string $message = null): void
    {
        if (!$this->userHasAnyPermission($permissions)) {
            abort(403, $message ?? 'Bạn không có quyền thực hiện hành động này.');
        }
    }

    protected function authorizeAllPermissions(array $permissions, string $message = null): void
    {
        if (!$this->userHasAllPermissions($permissions)) {
            abort(403, $message ?? 'Bạn không có quyền thực hiện hành động này.');
        }
    }

    protected function scopeByPermission(
        Builder $query,
        string $manageAllPermission,
        string $manageOwnPermission,
        string $userIdColumn = 'user_id',
        ?string $alternateColumn = null
    ): Builder {
        $user = auth()->user();

        // Admin hoặc có quyền manage_all => return query không filter
        if ($user->isAdmin() || $user->can($manageAllPermission)) {
            return $query;
        }

        // Chỉ có quyền manage_own => filter theo user
        if ($user->can($manageOwnPermission)) {
            if ($alternateColumn) {
                // Support nhiều column (vd: salesperson_id OR technician_id)
                return $query->where(function($q) use ($user, $userIdColumn, $alternateColumn) {
                    $q->where($userIdColumn, $user->id)
                      ->orWhere($alternateColumn, $user->id);
                });
            }
            return $query->where($userIdColumn, $user->id);
        }

        // Không có quyền nào => return empty query
        return $query->whereRaw('1 = 0'); // Always false
    }

    protected function isAdmin(): bool
    {
        $user = auth()->user();
        return $user && $user->isAdmin();
    }

    protected function hasRole(string $roleName): bool
    {
        $user = auth()->user();
        return $user && $user->hasRole($roleName);
    }

    protected function getAuthUser()
    {
        return auth()->user();
    }

    protected function userOwnsResource($resource, string $userIdColumn = 'user_id'): bool
    {
        $user = auth()->user();

        if (!$user) {
            return false;
        }

        // If admin, consider owns all resources
        if ($user->isAdmin()) {
            return true;
        }

        // Check if resource belongs to user
        if (is_object($resource)) {
            return $resource->{$userIdColumn} == $user->id;
        }

        return false;
    }

    protected function authorizeOwnership($resource, string $userIdColumn = 'user_id', string $message = null): void
    {
        if (!$this->userOwnsResource($resource, $userIdColumn)) {
            abort(403, $message ?? 'Bạn không có quyền truy cập resource này.');
        }
    }
}
