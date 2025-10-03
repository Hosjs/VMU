<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class PartnerServiceQuotation extends Model
{
    use HasFactory;

    protected $fillable = [
        'quotation_number',
        'service_request_id',
        'provider_id',
        'quotation_type',
        'service_cost',
        'parts_cost',
        'total_cost',
        'payment_method',
        'viet_nga_pays_directly',
        'commission_rate',
        'commission_amount',
        'status',
        'quoted_at',
        'approved_at',
        'executed_at',
        'paid_at',
        'created_by',
        'approved_by',
        'notes',
        'parts_list'
    ];

    protected $casts = [
        'service_cost' => 'decimal:2',
        'parts_cost' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'commission_rate' => 'decimal:2',
        'commission_amount' => 'decimal:2',
        'viet_nga_pays_directly' => 'boolean',
        'quoted_at' => 'datetime',
        'approved_at' => 'datetime',
        'executed_at' => 'datetime',
        'paid_at' => 'datetime',
        'parts_list' => 'array'
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

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function payment(): HasOne
    {
        return $this->hasOne(PartnerPayment::class, 'quotation_id');
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'partner_quotation_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->whereIn('status', ['sent', 'approved', 'executed']);
    }

    public function scopeByProvider($query, $providerId)
    {
        return $query->where('provider_id', $providerId);
    }

    public function scopeWithParts($query)
    {
        return $query->whereIn('quotation_type', ['service_with_parts', 'parts_only']);
    }

    // Accessors & Mutators
    public function getIsApprovedAttribute(): bool
    {
        return $this->status === 'approved';
    }

    public function getIsPaidAttribute(): bool
    {
        return $this->status === 'paid';
    }

    public function getTotalWithCommissionAttribute(): float
    {
        return $this->total_cost + $this->commission_amount;
    }

    // Methods
    public function approve($userId): bool
    {
        $this->update([
            'status' => 'approved',
            'approved_by' => $userId,
            'approved_at' => now()
        ]);

        return true;
    }

    public function execute(): bool
    {
        if ($this->status !== 'approved') {
            return false;
        }

        $this->update([
            'status' => 'executed',
            'executed_at' => now()
        ]);

        return true;
    }

    public function markAsPaid(): bool
    {
        $this->update([
            'status' => 'paid',
            'paid_at' => now()
        ]);

        return true;
    }

    public function calculateCommission(): void
    {
        $this->commission_amount = ($this->total_cost * $this->commission_rate) / 100;
        $this->save();
    }

    public function generateQuotationNumber(): string
    {
        $prefix = 'BG-' . $this->provider->code . '-';
        $date = now()->format('Ymd');
        $sequence = static::whereDate('created_at', now())->count() + 1;

        return $prefix . $date . '-' . str_pad($sequence, 3, '0', STR_PAD_LEFT);
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->quotation_number)) {
                $model->quotation_number = $model->generateQuotationNumber();
            }
        });
    }
}
