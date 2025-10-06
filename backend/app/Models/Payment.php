<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'payment_number',
        'invoice_id',
        'order_id',
        'customer_id',
        'amount',
        'payment_method',
        'payment_date',
        'received_at',
        'reference_number',
        'bank_name',
        'account_number',
        'card_last_digits',
        'wallet_type',
        'status',
        'verification_status',
        'received_by',
        'verified_by',
        'verified_at',
        'notes',
        'customer_notes',
        'attachment_urls',
        'refund_amount',
        'refund_date',
        'refund_reason',
        'refunded_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'date',
        'received_at' => 'datetime',
        'verified_at' => 'datetime',
        'refund_amount' => 'decimal:2',
        'refund_date' => 'date',
    ];

    // =====================
    // RELATIONSHIPS
    // =====================

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function refunder()
    {
        return $this->belongsTo(User::class, 'refunded_by');
    }

    // =====================
    // ACCESSORS
    // =====================

    public function getAttachmentUrlsArrayAttribute()
    {
        return $this->attachment_urls ? explode('|', $this->attachment_urls) : [];
    }

    public function getNetAmountAttribute()
    {
        return $this->amount - $this->refund_amount;
    }

    // =====================
    // SCOPES
    // =====================

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }

    public function scopeVerified($query)
    {
        return $query->where('verification_status', 'verified');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
}

