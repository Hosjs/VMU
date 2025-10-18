<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PermissionModule extends Model
{
    protected $fillable = [
        'name',
        'display_name',
        'description',
        'icon',
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
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    // =====================
    // RELATIONSHIPS
    // =====================

    /**
     * Get all actions for this module
     */
    public function actions()
    {
        return $this->hasMany(PermissionAction::class, 'module_id');
    }

    /**
     * Get active actions only
     */
    public function activeActions()
    {
        return $this->hasMany(PermissionAction::class, 'module_id')
            ->where('is_active', true)
            ->orderBy('sort_order');
    }

    // =====================
    // SCOPES
    // =====================

    /**
     * Scope: Only active modules
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
        return $query->orderBy('sort_order')->orderBy('name');
    }

    // =====================
    // HELPER METHODS
    // =====================

    /**
     * Lấy tất cả action names của module
     *
     * @return array
     */
    public function getActionNames(): array
    {
        return $this->activeActions()->pluck('action')->toArray();
    }

    /**
     * Lấy module với tất cả actions (cho UI)
     *
     * @return array Format: ["id" => 1, "name" => "users", "actions" => [...]]
     */
    public function toArrayWithActions(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'display_name' => $this->display_name,
            'description' => $this->description,
            'icon' => $this->icon,
            'actions' => $this->activeActions()->get()->map(function ($action) {
                return [
                    'id' => $action->id,
                    'action' => $action->action,
                    'display_name' => $action->display_name,
                    'description' => $action->description,
                ];
            })->toArray(),
        ];
    }

    /**
     * Lấy tất cả modules với actions (static method)
     *
     * @return array
     */
    public static function getAllWithActions(): array
    {
        return self::active()
            ->ordered()
            ->with('activeActions')
            ->get()
            ->map(function ($module) {
                return $module->toArrayWithActions();
            })
            ->toArray();
    }
}
