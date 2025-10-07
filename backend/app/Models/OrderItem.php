<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'item_type',
        'service_id',
        'product_id',
        'item_name',
        'item_code',
        'item_description',
        'quantity',
        'unit',
        'quote_unit_price',
        'quote_total_price',
        'settlement_unit_price',
        'settlement_total_price',
        'discount_amount',
        'discount_percent',
        'status',
        'assigned_technician',
        'partner_technician_id',
        'partner_technician_name',
        'start_time',
        'completion_time',
        'actual_duration',
        'has_warranty',
        'warranty_months',
        'warranty_start_date',
        'warranty_end_date',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'quote_unit_price' => 'decimal:2',
        'quote_total_price' => 'decimal:2',
        'settlement_unit_price' => 'decimal:2',
        'settlement_total_price' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'discount_percent' => 'decimal:2',
        'start_time' => 'datetime',
        'completion_time' => 'datetime',
        'actual_duration' => 'integer',
        'has_warranty' => 'boolean',
        'warranty_months' => 'integer',
        'warranty_start_date' => 'date',
        'warranty_end_date' => 'date',
    ];

    // =====================
    // RELATIONSHIPS
    // =====================

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function assignedTechnician()
    {
        return $this->belongsTo(User::class, 'assigned_technician');
    }

    public function warranty()
    {
        return $this->hasOne(Warranty::class);
    }

    // =====================
    // ACCESSORS
    // =====================

    public function getProfitAttribute()
    {
        return $this->quote_total_price - $this->settlement_total_price;
    }

    // =====================
    // SCOPES
    // =====================

    public function scopeServices($query)
    {
        return $query->where('item_type', 'service');
    }

    public function scopeProducts($query)
    {
        return $query->where('item_type', 'product');
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeWithWarranty($query)
    {
        return $query->where('has_warranty', true);
    }
}
