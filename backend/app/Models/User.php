<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

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
        ];
    }

    // Relationships
    public function role()
    {
        return $this->hasOneThrough(
            \App\Models\Role::class,
            \App\Models\UserRole::class,
            'user_id',
            'id',
            'id',
            'role_id'
        );
    }

    public function userRole()
    {
        return $this->hasOne(\App\Models\UserRole::class);
    }

    public function assignedServiceRequests()
    {
        return $this->hasMany(\App\Models\ServiceRequest::class, 'assigned_to');
    }

    public function salesOrders()
    {
        return $this->hasMany(\App\Models\Order::class, 'salesperson_id');
    }

    public function technicianOrders()
    {
        return $this->hasMany(\App\Models\Order::class, 'technician_id');
    }

    public function accountantOrders()
    {
        return $this->hasMany(\App\Models\Order::class, 'accountant_id');
    }

    public function inspections()
    {
        return $this->hasMany(\App\Models\VehicleInspection::class, 'inspector_id');
    }

    public function notifications()
    {
        return $this->hasMany(\App\Models\Notification::class);
    }
}
