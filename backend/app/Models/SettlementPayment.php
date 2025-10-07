<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SettlementPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'payment_number',
        'settlement_id',
        'provider_id',
        'amount',
        'payment_method',
        'payment_date',
        'processed_at',
        'reference_number',
        'bank_name',
        'account_number',
        'check_number',
        'status',
        'approval_status',
        'created_by',
        'approved_by',
        'processed_by',
        'approved_at',
        'approval_notes',
        'rejection_reason',
        'notes',
        'attachment_urls',
        'provider_confirmed',
        'provider_confirmed_at',
        'provider_notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'date',
        'processed_at' => 'datetime',
        'approved_at' => 'datetime',
        'provider_confirmed' => 'boolean',
        'provider_confirmed_at' => 'datetime',
    ];

    // =====================
    // RELATIONSHIPS
    // =====================

    public function settlement()
    {
        return $this->belongsTo(Settlement::class);
    }

    public function provider()
    {
        return $this->belongsTo(Provider::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function processor()
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    // =====================
    // ACCESSORS
    // =====================

    public function getAttachmentUrlsArrayAttribute()
    {
        return $this->attachment_urls ? explode('|', $this->attachment_urls) : [];
    }

    // =====================
    // SCOPES
    // =====================

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopePendingApproval($query)
    {
        return $query->where('approval_status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('approval_status', 'approved');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }
}
