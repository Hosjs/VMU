<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Warranty extends Model
{
    use HasFactory;

    protected $fillable = [
        'warranty_number',
        'order_id',
        'order_item_id',
        'customer_id',
        'vehicle_id',
        'type',
        'item_name',
        'item_code',
        'start_date',
        'end_date',
        'warranty_months',
        'warranty_terms',
        'covered_issues',
        'excluded_issues',
        'status',
        'usage_count',
        'max_usage',
        'notes',
        'attachment_urls',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'warranty_months' => 'integer',
        'usage_count' => 'integer',
        'max_usage' => 'integer',
    ];

    // =====================
    // RELATIONSHIPS
    // =====================

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function orderItem()
    {
        return $this->belongsTo(OrderItem::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    // =====================
    // ACCESSORS
    // =====================

    public function getCoveredIssuesArrayAttribute()
    {
        return $this->covered_issues ? explode('|', $this->covered_issues) : [];
    }

    public function getExcludedIssuesArrayAttribute()
    {
        return $this->excluded_issues ? explode('|', $this->excluded_issues) : [];
    }

    public function getAttachmentUrlsArrayAttribute()
    {
        return $this->attachment_urls ? explode('|', $this->attachment_urls) : [];
    }

    public function getIsExpiredAttribute()
    {
        return $this->end_date < now();
    }

    public function getIsActiveAttribute()
    {
        return $this->status === 'active' && !$this->is_expired;
    }

    public function getRemainingUsageAttribute()
    {
        return $this->max_usage ? ($this->max_usage - $this->usage_count) : null;
    }

    // =====================
    // SCOPES
    // =====================

    public function scopeActive($query)
    {
        return $query->where('status', 'active')
            ->where('end_date', '>=', now());
    }

    public function scopeExpired($query)
    {
        return $query->where('end_date', '<', now());
    }

    public function scopeExpiringSoon($query, $days = 30)
    {
        return $query->where('status', 'active')
            ->whereBetween('end_date', [now(), now()->addDays($days)]);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }
}

