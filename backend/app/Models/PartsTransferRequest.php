<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PartsTransferRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'transfer_number',
        'order_id',
        'partner_quotation_id',
        'from_warehouse_id',
        'to_provider_id',
        'parts_list',
        'total_value',
        'transfer_type',
        'status',
        'requested_at',
        'approved_at',
        'shipped_at',
        'received_at',
        'requested_by',
        'approved_by',
        'shipped_by',
        'notes',
        'shipping_info'
    ];

    protected $casts = [
        'parts_list' => 'array',
        'total_value' => 'decimal:2',
        'requested_at' => 'datetime',
        'approved_at' => 'datetime',
        'shipped_at' => 'datetime',
        'received_at' => 'datetime',
        'shipping_info' => 'array'
    ];

    // Relationships
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function partnerQuotation(): BelongsTo
    {
        return $this->belongsTo(PartnerQuotation::class);
    }

    public function fromWarehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'from_warehouse_id');
    }

    public function toProvider(): BelongsTo
    {
        return $this->belongsTo(Provider::class, 'to_provider_id');
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function shipper(): BelongsTo
    {
        return $this->belongsTo(User::class, 'shipped_by');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'requested');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeInTransit($query)
    {
        return $query->whereIn('status', ['prepared', 'shipped']);
    }

    // Methods
    public function approve($userId): bool
    {
        if ($this->status !== 'requested') {
            return false;
        }

        return $this->update([
            'status' => 'approved',
            'approved_by' => $userId,
            'approved_at' => now()
        ]);
    }

    public function ship($userId, $shippingInfo = null): bool
    {
        if (!in_array($this->status, ['approved', 'prepared'])) {
            return false;
        }

        return $this->update([
            'status' => 'shipped',
            'shipped_by' => $userId,
            'shipped_at' => now(),
            'shipping_info' => $shippingInfo
        ]);
    }

    public function receive(): bool
    {
        if ($this->status !== 'shipped') {
            return false;
        }

        return $this->update([
            'status' => 'received',
            'received_at' => now()
        ]);
    }

    public function complete(): bool
    {
        if ($this->status !== 'received') {
            return false;
        }

        return $this->update(['status' => 'completed']);
    }
}
