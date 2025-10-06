<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WarehouseStock extends Model
{
    use HasFactory;

    protected $fillable = [
        'warehouse_id',
        'product_id',
        'quantity',
        'reserved_quantity',
        'available_quantity',
        'unit_cost',
        'total_value',
        'min_stock',
        'max_stock',
        'reorder_point',
        'economic_order_quantity',
        'location_code',
        'shelf',
        'row',
        'position',
        'last_movement_date',
        'last_stocktake_date',
        'movement_count',
        'is_locked',
        'is_damaged',
        'is_expired',
        'expiry_date',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'reserved_quantity' => 'integer',
        'available_quantity' => 'integer',
        'unit_cost' => 'decimal:2',
        'total_value' => 'decimal:2',
        'min_stock' => 'integer',
        'max_stock' => 'integer',
        'reorder_point' => 'integer',
        'economic_order_quantity' => 'integer',
        'last_movement_date' => 'datetime',
        'last_stocktake_date' => 'datetime',
        'movement_count' => 'integer',
        'is_locked' => 'boolean',
        'is_damaged' => 'boolean',
        'is_expired' => 'boolean',
        'expiry_date' => 'date',
    ];

    // =====================
    // RELATIONSHIPS
    // =====================

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    // =====================
    // ACCESSORS
    // =====================

    public function getNeedsReorderAttribute()
    {
        return $this->quantity <= $this->reorder_point;
    }

    public function getIsLowStockAttribute()
    {
        return $this->quantity <= $this->min_stock;
    }

    public function getIsOverstockedAttribute()
    {
        return $this->quantity >= $this->max_stock;
    }

    // =====================
    // SCOPES
    // =====================

    public function scopeLowStock($query)
    {
        return $query->whereRaw('quantity <= min_stock');
    }

    public function scopeNeedsReorder($query)
    {
        return $query->whereRaw('quantity <= reorder_point');
    }

    public function scopeAvailable($query)
    {
        return $query->where('is_locked', false)
            ->where('is_damaged', false)
            ->where('is_expired', false);
    }

    public function scopeExpiringSoon($query, $days = 30)
    {
        return $query->whereBetween('expiry_date', [
            now(),
            now()->addDays($days)
        ]);
    }
}

