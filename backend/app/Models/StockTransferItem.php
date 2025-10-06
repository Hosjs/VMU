<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockTransferItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'stock_transfer_id',
        'product_id',
        'requested_quantity',
        'sent_quantity',
        'received_quantity',
        'damaged_quantity',
        'unit_cost',
        'total_cost',
        'product_name',
        'product_code',
        'product_sku',
        'from_location',
        'to_location',
        'status',
        'batch_number',
        'serial_number',
        'expiry_date',
        'packing_notes',
        'packed_by',
        'received_by',
        'packed_at',
        'received_at',
        'notes',
        'quality_check_result',
        'quality_check_notes',
    ];

    protected $casts = [
        'requested_quantity' => 'integer',
        'sent_quantity' => 'integer',
        'received_quantity' => 'integer',
        'damaged_quantity' => 'integer',
        'unit_cost' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'expiry_date' => 'date',
        'packed_at' => 'datetime',
        'received_at' => 'datetime',
    ];

    // =====================
    // RELATIONSHIPS
    // =====================

    public function stockTransfer()
    {
        return $this->belongsTo(StockTransfer::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function packer()
    {
        return $this->belongsTo(User::class, 'packed_by');
    }

    public function receiverUser()
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    // =====================
    // ACCESSORS
    // =====================

    public function getVarianceAttribute()
    {
        return $this->sent_quantity - $this->received_quantity;
    }

    public function getHasDamageAttribute()
    {
        return $this->damaged_quantity > 0;
    }

    // =====================
    // SCOPES
    // =====================

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeWithDamage($query)
    {
        return $query->where('damaged_quantity', '>', 0);
    }

    public function scopeWithVariance($query)
    {
        return $query->whereRaw('sent_quantity != received_quantity');
    }
}

