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
        'permissions' => 'array',
        'is_active' => 'boolean',
    ];

    // =====================
    // RELATIONSHIPS
    // =====================

    public function userRoles()
    {
        return $this->hasMany(UserRole::class);
    }

    public function users()
    {
        return $this->hasManyThrough(
            User::class,
            UserRole::class,
            'role_id',
            'id',
            'id',
            'user_id'
        );
    }
}

