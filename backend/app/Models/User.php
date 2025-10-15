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

    public function hasRole($roleName)
    {
        return $this->role && $this->role->name === $roleName;
    }

    public function isAdmin()
    {
        return $this->hasRole('admin');
    }

    public function isManager()
    {
        return $this->hasRole('manager');
    }

    public function isAccountant()
    {
        return $this->hasRole('accountant');
    }

    public function isMechanic()
    {
        return $this->hasRole('mechanic');
    }

    public function isEmployee()
    {
        return $this->hasRole('employee');
    }
}
