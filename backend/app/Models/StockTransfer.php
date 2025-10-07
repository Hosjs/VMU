<?php

namespace App\Models;

use App\QueryScopes\StockTransferScopes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockTransfer extends Model
{
    use HasFactory, StockTransferScopes;

    protected $fillable = [
        'transfer_number',
        'from_warehouse_id',
        'to_warehouse_id',
        'type',
        'reason',
        'order_id',
        'status',
        'transfer_date',
        'expected_arrival',
        'actual_arrival',
        'transport_method',
        'tracking_number',
        'is_tax_exempt',
        'tax_exemption_code',
        'tax_amount',
        'tax_notes',
        'total_cost',
        'shipping_cost',
        'insurance_cost',
        'created_by',
        'approved_by',
        'sent_by',
        'received_by',
        'approved_at',
        'sent_at',
        'received_at',
        'notes',
        'shipping_instructions',
        'attachment_urls',
    ];

    protected $casts = [
        'transfer_date' => 'date',
        'expected_arrival' => 'date',
        'actual_arrival' => 'date',
        'is_tax_exempt' => 'boolean',
        'tax_amount' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'insurance_cost' => 'decimal:2',
        'approved_at' => 'datetime',
        'sent_at' => 'datetime',
        'received_at' => 'datetime',
    ];

    // =====================
    // RELATIONSHIPS
    // =====================

    public function fromWarehouse()
    {
        return $this->belongsTo(Warehouse::class, 'from_warehouse_id');
    }

    public function toWarehouse()
    {
        return $this->belongsTo(Warehouse::class, 'to_warehouse_id');
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function items()
    {
        return $this->hasMany(StockTransferItem::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sent_by');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }

    // =====================
    // ACCESSORS
    // =====================

    public function getAttachmentUrlsArrayAttribute()
    {
        return $this->attachment_urls ? explode('|', $this->attachment_urls) : [];
    }

    public function getIsDelayedAttribute()
    {
        return $this->expected_arrival &&
               $this->expected_arrival < now() &&
               !in_array($this->status, ['received', 'completed', 'cancelled']);
    }
}
