<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PermissionAction extends Model
{
    protected $fillable = [
        'module_id',
        'action',
        'display_name',
        'description',
        'sort_order',
        'is_active',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'sort_order' => 'integer',
            'module_id' => 'integer',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Get the module this action belongs to
     */
    public function module()
    {
        return $this->belongsTo(PermissionModule::class, 'module_id');
    }

    /**
     * Scope: Only active actions
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: Ordered by sort_order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('action');
    }
}
