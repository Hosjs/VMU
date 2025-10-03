<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class PartnerQuotation extends Model
{
    use HasFactory;

    protected $fillable = [
        'quotation_number',
        'quotation_request_id',
        'provider_id',
        'service_cost',
        'parts_cost',
        'labor_cost',
        'other_costs',
        'total_cost',
        'parts_breakdown',
        'parts_source',
        'estimated_hours',
        'estimated_completion',
        'terms_conditions',
        'warranty_months',
        'status',
        'provider_contact_person',
        'submitted_at',
        'reviewed_by',
        'reviewed_at',
        'provider_notes',
        'admin_notes',
        'attachments'
    ];

    protected $casts = [
        'service_cost' => 'decimal:2',
        'parts_cost' => 'decimal:2',
        'labor_cost' => 'decimal:2',
        'other_costs' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'parts_breakdown' => 'array',
        'estimated_completion' => 'datetime',
        'submitted_at' => 'datetime',
        'reviewed_at' => 'datetime',
        'attachments' => 'array'
    ];

    // Relationships
    public function quotationRequest(): BelongsTo
    {
        return $this->belongsTo(QuotationRequest::class);
    }

    public function provider(): BelongsTo
    {
        return $this->belongsTo(Provider::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function settlements(): HasMany
    {
        return $this->hasMany(Settlement::class);
    }

    public function partsTransferRequests(): HasMany
    {
        return $this->hasMany(PartsTransferRequest::class);
    }

    // Scopes
    public function scopeSubmitted($query)
    {
        return $query->where('status', 'submitted');
    }

    public function scopeAccepted($query)
    {
        return $query->where('status', 'accepted');
    }

    public function scopeNeedingVietNgaParts($query)
    {
        return $query->where('parts_source', 'need_from_viet_nga');
    }

    public function scopeByProvider($query, $providerId)
    {
        return $query->where('provider_id', $providerId);
    }

    // Accessors
    public function getIsAcceptedAttribute(): bool
    {
        return $this->status === 'accepted';
    }

    public function getRequiresVietNgaPartsAttribute(): bool
    {
        return $this->parts_source === 'need_from_viet_nga';
    }

    public function getFormattedTotalCostAttribute(): string
    {
        return number_format($this->total_cost, 0, '.', ',') . ' VNĐ';
    }

    public function getCostBreakdownAttribute(): array
    {
        return [
            'service_cost' => $this->service_cost,
            'parts_cost' => $this->parts_cost,
            'labor_cost' => $this->labor_cost,
            'other_costs' => $this->other_costs,
            'total_cost' => $this->total_cost
        ];
    }

    // Methods
    public function submit(): bool
    {
        if ($this->status !== 'draft') {
            return false;
        }

        return $this->update([
            'status' => 'submitted',
            'submitted_at' => now()
        ]);
    }

    public function review($userId, $notes = null): bool
    {
        if ($this->status !== 'submitted') {
            return false;
        }

        return $this->update([
            'status' => 'under_review',
            'reviewed_by' => $userId,
            'reviewed_at' => now(),
            'admin_notes' => $notes
        ]);
    }

    public function accept($userId): bool
    {
        if (!in_array($this->status, ['submitted', 'under_review'])) {
            return false;
        }

        // Cập nhật quotation request
        $this->quotationRequest->markAsQuoted();
        $this->quotationRequest->accept();

        return $this->update([
            'status' => 'accepted',
            'reviewed_by' => $userId,
            'reviewed_at' => now()
        ]);
    }

    public function reject($userId, $reason = null): bool
    {
        if (!in_array($this->status, ['submitted', 'under_review'])) {
            return false;
        }

        $notes = $this->admin_notes;
        if ($reason) {
            $notes .= "\nLý do từ chối: " . $reason;
        }

        // Cập nhật quotation request
        $this->quotationRequest->reject($reason);

        return $this->update([
            'status' => 'rejected',
            'reviewed_by' => $userId,
            'reviewed_at' => now(),
            'admin_notes' => $notes
        ]);
    }

    public function calculateTotalCost(): void
    {
        $this->total_cost = $this->service_cost + $this->parts_cost +
                           $this->labor_cost + $this->other_costs;
        $this->save();
    }

    public function createOrder($customerId, $vehicleId = null): Order
    {
        $order = Order::create([
            'customer_id' => $customerId,
            'vehicle_id' => $vehicleId,
            'service_request_id' => $this->quotationRequest->service_request_id,
            'partner_quotation_id' => $this->id,
            'type' => $this->parts_cost > 0 ? 'mixed' : 'service',
            'invoice_issuer' => 'thang_truong', // Mặc định Thắng Trường xuất hóa đơn
            'parts_fulfillment' => $this->determinePartsFulfillment(),
            'settlement_total' => $this->total_cost, // Giá quyết toán với gara liên kết
            'partner_settlement_cost' => $this->total_cost,
            'status' => 'quoted'
        ]);

        return $order;
    }

    private function determinePartsFulfillment(): string
    {
        if ($this->parts_cost == 0) {
            return 'no_parts';
        }

        switch ($this->parts_source) {
            case 'need_from_viet_nga':
                return 'from_viet_nga';
            case 'partner_stock':
                return 'from_partner';
            case 'external_purchase':
                return 'from_partner';
            default:
                return 'mixed';
        }
    }

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($model) {
            $model->calculateTotalCost();
        });
    }
}
