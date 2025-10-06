<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockMovement extends Model
{
    use HasFactory;

    protected $fillable = [
        'warehouse_id',
        'product_id',
        'type',
        'quantity',
        'unit_cost',
        'total_cost',
        'stock_after',
        'order_id',
        'stock_transfer_id',
        'invoice_id',
        'direct_sale_id',
        'reference_number',
        'movement_reason',
        'is_taxable',
        'tax_amount',
        'tax_rate',
        'created_by',
        'movement_date',
        'notes',
        'batch_number',
        'serial_numbers',
        'expiry_date',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_cost' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'stock_after' => 'integer',
        'is_taxable' => 'boolean',
        'tax_amount' => 'decimal:2',
        'tax_rate' => 'decimal:2',
        'movement_date' => 'datetime',
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

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function stockTransfer()
    {
        return $this->belongsTo(StockTransfer::class);
    }

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    public function directSale()
    {
        return $this->belongsTo(DirectSale::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // =====================
    // ACCESSORS
    // =====================

    public function getSerialNumbersArrayAttribute()
    {
        return $this->serial_numbers ? explode(',', $this->serial_numbers) : [];
    }

    public function getIsInboundAttribute()
    {
        return in_array($this->type, ['in', 'transfer_in', 'return']);
    }

    public function getIsOutboundAttribute()
    {
        return in_array($this->type, ['out', 'transfer_out']);
    }

    // =====================
    // SCOPES
    // =====================

    public function scopeInbound($query)
    {
        return $query->whereIn('type', ['in', 'transfer_in', 'return']);
    }

    public function scopeOutbound($query)
    {
        return $query->whereIn('type', ['out', 'transfer_out']);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByReason($query, $reason)
    {
        return $query->where('movement_reason', $reason);
    }

    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('movement_date', [$startDate, $endDate]);
    }
}

