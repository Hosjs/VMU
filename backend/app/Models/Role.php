<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use HasFactory;

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

    public function users()
    {
        return $this->hasManyThrough(
            User::class,
            UserRole::class,
            'role_id',
            'id',
            'id',
            'user_id'
        )->where('user_roles.is_active', true);
    }

    public function userRoles()
    {
        return $this->hasMany(UserRole::class);
    }
}
