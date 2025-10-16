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

    protected $casts = [
        'permissions' => 'array', // Cast JSON to array automatically
        'is_active' => 'boolean',
    ];

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
    // HELPER METHODS
    // =====================

    /**
     * Kiểm tra role có permission cụ thể không
     */
    public function hasPermission(string $permission): bool
    {
        if ($this->name === 'admin') {
            return true;
        }

        if (!$this->permissions || !is_array($this->permissions)) {
            return false;
        }

        // Check exact match
        if (in_array($permission, $this->permissions)) {
            return true;
        }

        // Check wildcard
        $parts = explode('.', $permission);
        if (count($parts) === 2) {
            $wildcardPermission = $parts[0] . '.*';
            if (in_array($wildcardPermission, $this->permissions)) {
                return true;
            }
        }

        return false;
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
