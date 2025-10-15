<?php

namespace App\Models;

use App\QueryScopes\UserScopes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, UserScopes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'avatar',
        'birth_date',
        'gender',
        'address',
        'employee_code',
        'position',
        'department',
        'hire_date',
        'salary',
        'is_active',
        'notes',
        'custom_permissions',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'birth_date' => 'date',
            'hire_date' => 'date',
            'salary' => 'decimal:2',
            'is_active' => 'boolean',
            'custom_permissions' => 'array',
        ];
    }

    // =====================
    // RELATIONSHIPS
    // =====================

    public function role()
    {
        return $this->hasOneThrough(
            Role::class,
            UserRole::class,
            'user_id',
            'id',
            'id',
            'role_id'
        )->where('user_roles.is_active', true);
    }

    public function userRole()
    {
        return $this->hasOne(UserRole::class)->where('is_active', true);
    }

    public function ordersAsSalesperson()
    {
        return $this->hasMany(Order::class, 'salesperson_id');
    }

    public function ordersAsTechnician()
    {
        return $this->hasMany(Order::class, 'technician_id');
    }

    public function ordersAsAccountant()
    {
        return $this->hasMany(Order::class, 'accountant_id');
    }

    public function assignedServiceRequests()
    {
        return $this->hasMany(ServiceRequest::class, 'assigned_to');
    }

    public function managedProviders()
    {
        return $this->hasMany(Provider::class, 'managed_by');
    }

    public function managedWarehouses()
    {
        return $this->hasMany(Warehouse::class, 'manager_id');
    }

    public function createdInvoices()
    {
        return $this->hasMany(Invoice::class, 'created_by');
    }

    public function approvedInvoices()
    {
        return $this->hasMany(Invoice::class, 'approved_by');
    }

    public function receivedPayments()
    {
        return $this->hasMany(Payment::class, 'received_by');
    }

    public function createdSettlements()
    {
        return $this->hasMany(Settlement::class, 'created_by');
    }

    public function approvedSettlements()
    {
        return $this->hasMany(Settlement::class, 'approved_by');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    // =====================
    // HELPER METHODS
    // =====================

    /**
     * Kiểm tra user có permission cụ thể không
     * Hỗ trợ: role permissions, custom permissions, và wildcard
     *
     * @param string $permission Format: "resource.action" (vd: "users.view", "orders.create")
     * @return bool
     */
    public function hasPermission(string $permission): bool
    {
        // Admin có tất cả quyền
        if ($this->role && $this->role->name === 'admin') {
            return true;
        }

        // 1. Kiểm tra custom_permissions của user (override role)
        if ($this->custom_permissions && is_array($this->custom_permissions)) {
            // Check exact match
            if (in_array($permission, $this->custom_permissions)) {
                return true;
            }

            // Check wildcard: users.* cho phép users.view, users.create, etc
            $parts = explode('.', $permission);
            if (count($parts) === 2) {
                $wildcardPermission = $parts[0] . '.*';
                if (in_array($wildcardPermission, $this->custom_permissions)) {
                    return true;
                }
            }

            // Check deny permission (bắt đầu với !)
            if (in_array('!' . $permission, $this->custom_permissions)) {
                return false;
            }
        }

        // 2. Kiểm tra permissions từ role
        if ($this->role && $this->role->permissions) {
            $rolePermissions = is_string($this->role->permissions)
                ? json_decode($this->role->permissions, true)
                : $this->role->permissions;

            if (is_array($rolePermissions)) {
                // Check exact match
                if (in_array($permission, $rolePermissions)) {
                    return true;
                }

                // Check wildcard
                $parts = explode('.', $permission);
                if (count($parts) === 2) {
                    $wildcardPermission = $parts[0] . '.*';
                    if (in_array($wildcardPermission, $rolePermissions)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    /**
     * Kiểm tra user có bất kỳ permission nào trong danh sách
     */
    public function hasAnyPermission(array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if ($this->hasPermission($permission)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Kiểm tra user có tất cả permissions trong danh sách
     */
    public function hasAllPermissions(array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if (!$this->hasPermission($permission)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Lấy tất cả permissions của user (role + custom)
     */
    public function getAllPermissions(): array
    {
        $permissions = [];

        // Permissions từ role
        if ($this->role && $this->role->permissions) {
            $rolePermissions = is_string($this->role->permissions)
                ? json_decode($this->role->permissions, true)
                : $this->role->permissions;

            if (is_array($rolePermissions)) {
                $permissions = array_merge($permissions, $rolePermissions);
            }
        }

        // Custom permissions
        if ($this->custom_permissions && is_array($this->custom_permissions)) {
            $permissions = array_merge($permissions, $this->custom_permissions);
        }

        return array_unique($permissions);
    }

    /**
     * Kiểm tra user có role cụ thể
     */
    public function hasRole(string $roleName): bool
    {
        return $this->role && $this->role->name === $roleName;
    }

    /**
     * Kiểm tra user có bất kỳ role nào trong danh sách
     */
    public function hasAnyRole(array $roleNames): bool
    {
        return $this->role && in_array($this->role->name, $roleNames);
    }
}
