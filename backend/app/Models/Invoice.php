<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_number',
        'order_id',
        'customer_id',
        'vehicle_id',
        'issuer',
        'admin_only_access',
        'issuing_warehouse_id',
        'invoice_date',
        'due_date',
        'customer_name',
        'customer_phone',
        'customer_email',
        'customer_address',
        'customer_tax_code',
        'vehicle_info',
        'subtotal',
        'discount_amount',
        'discount_percent',
        'tax_amount',
        'tax_percent',
        'total_amount',
        'actual_cost',
        'actual_profit',
        'partner_settlement_cost',
        'status',
        'paid_amount',
        'remaining_amount',
        'payment_status',
        'created_by',
        'approved_by',
        'approved_at',
        'notes',
        'customer_notes',
        'terms_conditions',
        'attachment_urls',
    ];

    protected $casts = [
        'admin_only_access' => 'boolean',
        'invoice_date' => 'date',
        'due_date' => 'date',
        'subtotal' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'discount_percent' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'tax_percent' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'actual_cost' => 'decimal:2',
        'actual_profit' => 'decimal:2',
        'partner_settlement_cost' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'remaining_amount' => 'decimal:2',
        'approved_at' => 'datetime',
    ];

    // =====================
    // RELATIONSHIPS
    // =====================

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function issuingWarehouse()
    {
        return $this->belongsTo(Warehouse::class, 'issuing_warehouse_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function settlements()
    {
        return $this->hasMany(Settlement::class);
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

    public function getIsOverdueAttribute()
    {
        return $this->due_date && $this->due_date < now() && $this->payment_status !== 'paid';
    }

    // =====================
    // SCOPES
    // =====================

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeUnpaid($query)
    {
        return $query->where('payment_status', 'unpaid');
    }

    public function scopeOverdue($query)
    {
        return $query->where('due_date', '<', now())
            ->where('payment_status', '!=', 'paid');
    }

    public function scopeAdminOnly($query)
    {
        return $query->where('admin_only_access', true);
    }

    public function scopeByIssuer($query, $issuer)
    {
        return $query->where('issuer', $issuer);
    }
}

