<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DirectSale extends Model
{
    use HasFactory;

    protected $fillable = [
        'sale_number',
        'warehouse_id',
        'customer_id',
        'customer_name',
        'customer_phone',
        'customer_id_number',
        'customer_address',
        'sale_type',
        'subtotal',
        'discount_amount',
        'discount_percent',
        'tax_amount',
        'total_amount',
        'total_cost',
        'gross_profit',
        'profit_margin',
        'payment_method',
        'payment_status',
        'paid_amount',
        'payment_due_date',
        'visibility_level',
        'is_confidential',
        'approval_status',
        'approved_by',
        'approved_at',
        'approval_notes',
        'salesperson_id',
        'created_by',
        'sale_date',
        'delivery_date',
        'notes',
        'customer_notes',
        'internal_memo',
        'attachment_urls',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'discount_percent' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'gross_profit' => 'decimal:2',
        'profit_margin' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'payment_due_date' => 'date',
        'is_confidential' => 'boolean',
        'approved_at' => 'datetime',
        'sale_date' => 'datetime',
        'delivery_date' => 'datetime',
    ];

    // =====================
    // RELATIONSHIPS
    // =====================

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function salesperson()
    {
        return $this->belongsTo(User::class, 'salesperson_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function items()
    {
        return $this->hasMany(DirectSaleItem::class);
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

    public function getRemainingAmountAttribute()
    {
        return $this->total_amount - $this->paid_amount;
    }

    // =====================
    // SCOPES
    // =====================

    public function scopeByStatus($query, $status)
    {
        return $query->where('approval_status', $status);
    }

    public function scopeApproved($query)
    {
        return $query->where('approval_status', 'approved');
    }

    public function scopeConfidential($query)
    {
        return $query->where('is_confidential', true);
    }

    public function scopeAdminOnly($query)
    {
        return $query->where('visibility_level', 'admin_only');
    }

    public function scopeUnpaid($query)
    {
        return $query->where('payment_status', '!=', 'paid');
    }
}

