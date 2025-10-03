<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PartnerPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'payment_number',
        'quotation_id',
        'provider_id',
        'service_amount',
        'parts_amount',
        'commission_amount',
        'total_amount',
        'payment_method',
        'status',
        'bank_name',
        'account_number',
        'account_holder',
        'transaction_reference',
        'payment_date',
        'processed_at',
        'processed_by',
        'notes',
        'attachments'
    ];

    protected $casts = [
        'service_amount' => 'decimal:2',
        'parts_amount' => 'decimal:2',
        'commission_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'payment_date' => 'date',
        'processed_at' => 'datetime',
        'attachments' => 'array'
    ];

    // Relationships
    public function quotation(): BelongsTo
    {
        return $this->belongsTo(PartnerServiceQuotation::class, 'quotation_id');
    }

    public function provider(): BelongsTo
    {
        return $this->belongsTo(Provider::class);
    }

    public function processor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeByProvider($query, $providerId)
    {
        return $query->where('provider_id', $providerId);
    }

    public function scopeByPaymentMethod($query, $method)
    {
        return $query->where('payment_method', $method);
    }

    // Accessors
    public function getIsCompletedAttribute(): bool
    {
        return $this->status === 'completed';
    }

    public function getIsPendingAttribute(): bool
    {
        return $this->status === 'pending';
    }

    public function getFormattedTotalAttribute(): string
    {
        return number_format($this->total_amount, 0, '.', ',') . ' VNĐ';
    }

    // Methods
    public function process($userId): bool
    {
        if ($this->status !== 'pending') {
            return false;
        }

        $this->update([
            'status' => 'processing',
            'processed_by' => $userId,
            'processed_at' => now()
        ]);

        return true;
    }

    public function complete(): bool
    {
        if (!in_array($this->status, ['pending', 'processing'])) {
            return false;
        }

        $this->update([
            'status' => 'completed',
            'processed_at' => now()
        ]);

        // Cập nhật trạng thái quotation
        $this->quotation->markAsPaid();

        return true;
    }

    public function cancel($reason = null): bool
    {
        if ($this->status === 'completed') {
            return false;
        }

        $notes = $this->notes;
        if ($reason) {
            $notes .= "\nLý do hủy: " . $reason;
        }

        $this->update([
            'status' => 'cancelled',
            'notes' => $notes
        ]);

        return true;
    }

    public function generatePaymentNumber(): string
    {
        $prefix = 'TT-' . $this->provider->code . '-';
        $date = now()->format('Ymd');
        $sequence = static::whereDate('created_at', now())->count() + 1;

        return $prefix . $date . '-' . str_pad($sequence, 3, '0', STR_PAD_LEFT);
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->payment_number)) {
                $model->payment_number = $model->generatePaymentNumber();
            }
        });
    }
}
