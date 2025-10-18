<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Role extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'display_name',
        'description',
        'permissions',
        'is_active',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'permissions' => 'array', // Cast JSON to array automatically
            'is_active' => 'boolean',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    // =====================
    // RELATIONSHIPS
    // =====================

    /**
     * Get all users with this role (direct relationship)
     * 1 Role = Many Users
     */
    public function users()
    {
        return $this->hasMany(User::class);
    }

    /**
     * Get active users with this role
     */
    public function activeUsers()
    {
        return $this->hasMany(User::class)->where('is_active', true);
    }

    /**
     * Get role history entries (audit trail)
     */
    public function roleHistory()
    {
        return $this->hasMany(UserRole::class);
    }

    /**
     * Get users from user_roles (for backward compatibility)
     * Deprecated: Sử dụng users() thay thế
     */
    public function userRoles()
    {
        return $this->hasMany(UserRole::class);
    }

    // =====================
    // HELPER METHODS - HỆ THỐNG PHÂN QUYỀN
    // =====================

    /**
     * Kiểm tra role có permission cụ thể không
     *
     * @param string $module Module name (vd: "users", "orders", "products")
     * @param string $action Action name (vd: "view", "create", "edit", "delete")
     * @return bool
     */
    public function hasPermission(string $module, string $action): bool
    {
        // Admin có tất cả quyền
        if ($this->name === 'admin') {
            return true;
        }

        if (!$this->permissions || !is_array($this->permissions)) {
            return false;
        }

        // Kiểm tra module và action cụ thể
        return isset($this->permissions[$module]) && in_array($action, $this->permissions[$module]);
    }

    /**
     * Kiểm tra role có quyền truy cập module
     *
     * @param string $module Module name
     * @return bool
     */
    public function hasModuleAccess(string $module): bool
    {
        // Admin có tất cả quyền
        if ($this->name === 'admin') {
            return true;
        }

        return isset($this->permissions[$module]) && !empty($this->permissions[$module]);
    }

    /**
     * Lấy tất cả actions của role trong một module
     *
     * @param string $module Module name
     * @return array
     */
    public function getModuleActions(string $module): array
    {
        if ($this->name === 'admin') {
            return ['*']; // Wildcard: tất cả actions
        }

        return $this->permissions[$module] ?? [];
    }

    /**
     * Thêm permission cho role
     *
     * @param string $module Module name
     * @param string|array $actions Action(s) to add
     * @return void
     */
    public function addPermission(string $module, $actions): void
    {
        $permissions = $this->permissions ?? [];

        if (!isset($permissions[$module])) {
            $permissions[$module] = [];
        }

        $actions = is_array($actions) ? $actions : [$actions];
        $permissions[$module] = array_unique(array_merge($permissions[$module], $actions));

        $this->permissions = $permissions;
        $this->save();
    }

    /**
     * Xóa permission của role
     *
     * @param string $module Module name
     * @param string|array|null $actions Action(s) to remove, null = remove all actions in module
     * @return void
     */
    public function removePermission(string $module, $actions = null): void
    {
        $permissions = $this->permissions ?? [];

        if (!isset($permissions[$module])) {
            return;
        }

        if ($actions === null) {
            // Xóa toàn bộ module
            unset($permissions[$module]);
        } else {
            // Xóa các actions cụ thể
            $actions = is_array($actions) ? $actions : [$actions];
            $permissions[$module] = array_diff($permissions[$module], $actions);

            // Nếu không còn action nào, xóa module
            if (empty($permissions[$module])) {
                unset($permissions[$module]);
            }
        }

        $this->permissions = $permissions;
        $this->save();
    }

    /**
     * Lấy số lượng users có role này
     */
    public function getUserCount(): int
    {
        return $this->users()->count();
    }

    /**
     * Lấy số lượng active users có role này
     */
    public function getActiveUserCount(): int
    {
        return $this->activeUsers()->count();
    }
}
