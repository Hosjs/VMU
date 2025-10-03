<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class QuotationRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'request_number',
        'service_request_id',
        'provider_id',
        'admin_id',
        'required_services',
        'required_parts',
        'work_description',
        'special_requirements',
        'requested_at',
        'deadline',
        'responded_at',
        'status',
        'admin_notes',
        'attachments'
    ];

    protected $casts = [
        'required_services' => 'array',
        'required_parts' => 'array',
        'requested_at' => 'datetime',
        'deadline' => 'datetime',
        'responded_at' => 'datetime',
        'attachments' => 'array'
    ];

    // Relationships
    public function serviceRequest(): BelongsTo
    {
        return $this->belongsTo(ServiceRequest::class);
    }

    public function provider(): BelongsTo
    {
        return $this->belongsTo(Provider::class);
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function partnerQuotation(): HasOne
    {
        return $this->hasOne(PartnerQuotation::class);
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'sent');
    }

    public function scopeResponded($query)
    {
        return $query->whereIn('status', ['quoted', 'accepted', 'rejected']);
    }

    public function scopeExpired($query)
    {
        return $query->where('status', 'expired')
                    ->orWhere(function($q) {
                        $q->where('deadline', '<', now())
                          ->whereIn('status', ['sent', 'received']);
                    });
    }

    // Accessors
    public function getIsExpiredAttribute(): bool
    {
        return $this->deadline && $this->deadline->isPast() &&
               in_array($this->status, ['sent', 'received']);
    }

    public function getFormattedRequiredServicesAttribute(): string
    {
        if (!$this->required_services) return '';
        return implode(', ', $this->required_services);
    }

    // Methods
    public function markAsReceived(): bool
    {
        if ($this->status !== 'sent') {
            return false;
        }

        return $this->update([
            'status' => 'received',
            'responded_at' => now()
        ]);
    }

    public function markAsQuoted(): bool
    {
        if (!in_array($this->status, ['received', 'sent'])) {
            return false;
        }

        return $this->update([
            'status' => 'quoted',
            'responded_at' => now()
        ]);
    }

    public function accept(): bool
    {
        if ($this->status !== 'quoted') {
            return false;
        }

        return $this->update(['status' => 'accepted']);
    }

    public function reject($reason = null): bool
    {
        if (!in_array($this->status, ['quoted', 'received'])) {
            return false;
        }

        $notes = $this->admin_notes;
        if ($reason) {
            $notes .= "\nLý do từ chối: " . $reason;
        }

        return $this->update([
            'status' => 'rejected',
            'admin_notes' => $notes
        ]);
    }

    public function checkExpiration(): void
    {
        if ($this->is_expired && in_array($this->status, ['sent', 'received'])) {
            $this->update(['status' => 'expired']);
        }
    }
}
