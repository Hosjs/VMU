<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VehicleInspection extends Model
{
    use HasFactory;

    protected $fillable = [
        'inspection_number',
        'order_id',
        'vehicle_id',
        'customer_id',
        'type',
        'inspector_id',
        'customer_representative_id',
        'mileage',
        'fuel_level',
        'exterior_condition',
        'exterior_damages',
        'interior_condition',
        'interior_damages',
        'functional_checks',
        'functional_issues',
        'personal_items',
        'vehicle_accessories',
        'image_urls',
        'video_urls',
        'inspector_notes',
        'customer_notes',
        'customer_acknowledged',
        'customer_acknowledged_at',
        'customer_signature',
        'inspector_signature',
        'status',
        'inspection_date',
    ];

    protected $casts = [
        'mileage' => 'integer',
        'fuel_level' => 'decimal:1',
        'customer_acknowledged' => 'boolean',
        'customer_acknowledged_at' => 'datetime',
        'inspection_date' => 'datetime',
    ];

    // =====================
    // RELATIONSHIPS
    // =====================

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function inspector()
    {
        return $this->belongsTo(User::class, 'inspector_id');
    }

    public function customerRepresentative()
    {
        return $this->belongsTo(User::class, 'customer_representative_id');
    }

    // =====================
    // ACCESSORS
    // =====================

    public function getImageUrlsArrayAttribute()
    {
        return $this->image_urls ? explode('|', $this->image_urls) : [];
    }

    public function getVideoUrlsArrayAttribute()
    {
        return $this->video_urls ? explode('|', $this->video_urls) : [];
    }

    public function getPersonalItemsArrayAttribute()
    {
        return $this->personal_items ? explode('|', $this->personal_items) : [];
    }

    // =====================
    // SCOPES
    // =====================

    public function scopeReceiveType($query)
    {
        return $query->where('type', 'receive');
    }

    public function scopeReturnType($query)
    {
        return $query->where('type', 'return');
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeAcknowledged($query)
    {
        return $query->where('customer_acknowledged', true);
    }

    public function scopePendingAcknowledgment($query)
    {
        return $query->where('customer_acknowledged', false)
            ->where('status', 'pending_approval');
    }
}

