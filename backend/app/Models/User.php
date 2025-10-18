<?php

namespace App\Models;

use App\QueryScopes\UserScopes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, UserScopes, SoftDeletes;

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
        'role_id', // ✅ Thêm role_id vào fillable
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
            'custom_permissions' => 'array', // JSON -> Array
        ];
    }

    // =====================
    // RELATIONSHIPS
    // =====================

    /**
     * Get the role of the user (direct relationship)
     * 1 User = 1 Role
     */
    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Get role history (audit trail)
     * Lịch sử thay đổi role
     */
    public function roleHistory()
    {
        return $this->hasMany(UserRole::class)->orderBy('assigned_at', 'desc');
    }

    /**
     * Get current role from user_roles (for backward compatibility)
     * Deprecated: Sử dụng relation role() thay thế
     */
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
    // HELPER METHODS - HỆ THỐNG PHÂN QUYỀN
    // =====================

    /**
     * Kiểm tra permission - Hỗ trợ cả 2 cú pháp
     *
     * Cách 1: can('orders.view') - Dạng string với dot notation
     * Cách 2: can('orders', 'view') - Dạng 2 tham số
     *
     * @param string $moduleOrPermission Module name hoặc full permission string
     * @param string|null $action Action name (nếu dùng cú pháp 2 tham số)
     * @return bool
     */
    public function can($moduleOrPermission, $action = null): bool
    {
        // Nếu có tham số thứ 2, gọi method hasPermission chuẩn
        if ($action !== null) {
            return $this->hasPermission($moduleOrPermission, $action);
        }

        // Nếu chỉ có 1 tham số, tách string theo dấu chấm
        if (strpos($moduleOrPermission, '.') !== false) {
            [$module, $actionPart] = explode('.', $moduleOrPermission, 2);
            return $this->hasPermission($module, $actionPart);
        }

        // Nếu không có dấu chấm, kiểm tra module access
        return $this->hasModuleAccess($moduleOrPermission);
    }

    /**
     * Kiểm tra user có permission cụ thể không
     * Quyền cuối cùng = Quyền của Role + Custom Permissions
     *
     * @param string $module Module name (vd: "users", "orders", "products")
     * @param string $action Action name (vd: "view", "create", "edit", "delete")
     * @return bool
     */
    public function hasPermission(string $module, string $action): bool
    {
        // ✅ Eager load role nếu chưa có
        if (!$this->relationLoaded('role')) {
            $this->load('role');
        }

        // Admin có tất cả quyền
        if ($this->role && $this->role->name === 'admin') {
            return true;
        }

        // 1. Kiểm tra custom_permissions của user (quyền bổ sung)
        if ($this->custom_permissions && is_array($this->custom_permissions)) {
            if (isset($this->custom_permissions[$module]) && is_array($this->custom_permissions[$module]) && in_array($action, $this->custom_permissions[$module])) {
                return true;
            }
        }

        // 2. Kiểm tra permissions từ role (quyền mặc định)
        if ($this->role && $this->role->permissions && is_array($this->role->permissions)) {
            if (isset($this->role->permissions[$module]) && is_array($this->role->permissions[$module]) && in_array($action, $this->role->permissions[$module])) {
                return true;
            }
        }

        return false;
    }

    /**
     * Lấy tất cả permissions của user (role + custom)
     *
     * @return array Format: {"module_name": ["action1", "action2"], ...}
     */
    public function getAllPermissions(): array
    {
        // ✅ Eager load role nếu chưa có
        if (!$this->relationLoaded('role')) {
            $this->load('role');
        }

        // Admin có tất cả quyền
        if ($this->role && $this->role->name === 'admin') {
            return ['*' => ['*']]; // Wildcard: tất cả module và actions
        }

        $permissions = [];

        // 1. Lấy quyền từ role
        if ($this->role && $this->role->permissions && is_array($this->role->permissions)) {
            $permissions = $this->role->permissions;
        }

        // 2. Merge với custom_permissions (quyền bổ sung)
        if ($this->custom_permissions && is_array($this->custom_permissions)) {
            foreach ($this->custom_permissions as $module => $actions) {
                if (!isset($permissions[$module])) {
                    $permissions[$module] = [];
                }
                if (is_array($actions)) {
                    $permissions[$module] = array_unique(array_merge($permissions[$module], $actions));
                }
            }
        }

        return $permissions;
    }

    /**
     * Kiểm tra user có bất kỳ permission nào trong danh sách
     *
     * @param array $permissions Mảng permission dạng ['orders.view', 'orders.edit']
     * @return bool
     */
    public function hasAnyPermission(array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if ($this->can($permission)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Kiểm tra user có tất cả permissions trong danh sách
     *
     * @param array $permissions Mảng permission dạng ['orders.view', 'orders.edit']
     * @return bool
     */
    public function hasAllPermissions(array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if (!$this->can($permission)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Kiểm tra user có role cụ thể không
     *
     * @param string $roleName Tên role (vd: 'admin', 'manager', 'staff')
     * @return bool
     */
    public function hasRole(string $roleName): bool
    {
        // Eager load role nếu chưa có
        if (!$this->relationLoaded('role')) {
            $this->load('role');
        }

        return $this->role && $this->role->name === $roleName;
    }

    /**
     * Kiểm tra user có phải admin không
     *
     * @return bool
     */
    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    /**
     * Kiểm tra user có quyền với bất kỳ action nào trong module
     *
     * @param string $module Module name
     * @return bool
     */
    public function hasModuleAccess(string $module): bool
    {
        // ✅ Eager load role nếu chưa có
        if (!$this->relationLoaded('role')) {
            $this->load('role');
        }

        // Admin có tất cả quyền
        if ($this->role && $this->role->name === 'admin') {
            return true;
        }

        // Kiểm tra custom_permissions
        if ($this->custom_permissions && is_array($this->custom_permissions)) {
            if (isset($this->custom_permissions[$module]) && !empty($this->custom_permissions[$module])) {
                return true;
            }
        }

        // Kiểm tra role permissions
        if ($this->role && $this->role->permissions && is_array($this->role->permissions)) {
            if (isset($this->role->permissions[$module]) && !empty($this->role->permissions[$module])) {
                return true;
            }
        }

        return false;
    }

    /**
     * Thêm custom permission cho user
     *
     * @param string $module Module name
     * @param string|array $actions Action(s) to add
     * @return void
     */
    public function addCustomPermission(string $module, $actions): void
    {
        $customPermissions = $this->custom_permissions ?? [];

        if (!isset($customPermissions[$module])) {
            $customPermissions[$module] = [];
        }

        $actions = is_array($actions) ? $actions : [$actions];
        $customPermissions[$module] = array_unique(array_merge($customPermissions[$module], $actions));

        $this->custom_permissions = $customPermissions;
        $this->save();
    }

    /**
     * Xóa custom permission của user
     *
     * @param string $module Module name
     * @param string|array|null $actions Action(s) to remove, null = remove all actions in module
     * @return void
     */
    public function removeCustomPermission(string $module, $actions = null): void
    {
        $customPermissions = $this->custom_permissions ?? [];

        if (!isset($customPermissions[$module])) {
            return;
        }

        if ($actions === null) {
            // Xóa toàn bộ module
            unset($customPermissions[$module]);
        } else {
            // Xóa các actions cụ thể
            $actions = is_array($actions) ? $actions : [$actions];
            $customPermissions[$module] = array_diff($customPermissions[$module], $actions);

            // Nếu không còn action nào, xóa module
            if (empty($customPermissions[$module])) {
                unset($customPermissions[$module]);
            }
        }

        $this->custom_permissions = $customPermissions;
        $this->save();
    }
}
