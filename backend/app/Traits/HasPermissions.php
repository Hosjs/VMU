<?php

namespace App\Traits;

use App\Services\PermissionRegistry;

/**
 * Trait HasPermissions
 * Cung cấp helper methods để kiểm tra permissions
 * Sử dụng trong Controllers để kiểm tra quyền động
 */
trait HasPermissions
{
    /**
     * Kiểm tra user hiện tại có permission không
     */
    protected function userHasPermission(string $permission): bool
    {
        $user = auth()->user();
        return $user && $user->hasPermission($permission);
    }

    /**
     * Kiểm tra user có bất kỳ permission nào
     */
    protected function userHasAnyPermission(array $permissions): bool
    {
        $user = auth()->user();
        return $user && $user->hasAnyPermission($permissions);
    }

    /**
     * Kiểm tra user có tất cả permissions
     */
    protected function userHasAllPermissions(array $permissions): bool
    {
        $user = auth()->user();
        return $user && $user->hasAllPermissions($permissions);
    }

    /**
     * Abort nếu không có permission
     */
    protected function authorizePermission(string $permission, string $message = null): void
    {
        if (!$this->userHasPermission($permission)) {
            abort(403, $message ?? 'Bạn không có quyền thực hiện hành động này.');
        }
    }

    /**
     * Abort nếu không có bất kỳ permission nào
     */
    protected function authorizeAnyPermission(array $permissions, string $message = null): void
    {
        if (!$this->userHasAnyPermission($permissions)) {
            abort(403, $message ?? 'Bạn không có quyền thực hiện hành động này.');
        }
    }

    /**
     * Lọc query dựa trên permissions
     * - Nếu có manage_all => return query không đổi
     * - Nếu chỉ có manage_own => filter theo user_id
     */
    protected function scopeByPermission($query, string $manageAllPermission, string $manageOwnPermission, string $userIdColumn = 'user_id')
    {
        $user = auth()->user();

        // Admin hoặc có quyền manage_all
        if ($user->hasPermission($manageAllPermission)) {
            return $query;
        }

        // Chỉ có quyền manage_own
        if ($user->hasPermission($manageOwnPermission)) {
            return $query->where($userIdColumn, $user->id);
        }

        // Không có quyền nào => return empty
        return $query->whereRaw('1 = 0');
    }
}

