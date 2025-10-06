<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PartnerVehicleHandover extends Model
{
    use HasFactory;

    protected $fillable = [
        'handover_number',
        'order_id',
        'vehicle_id',
        'provider_id',
        'handover_type',
        'delivered_by',
        'delivered_by_name',
        'delivered_by_phone',
        'received_by_technician',
        'received_by_name',
        'received_by_phone',
        'received_by_position',
        'technician_license_number',
        'mileage',
        'fuel_level',
        'vehicle_condition',
        'included_items',
        'vehicle_documents',
        'work_description',
        'special_instructions',
        'expected_completion',
        'handover_image_urls',
        'damage_image_urls',
        'delivered_by_signature',
        'received_by_signature',
        'is_acknowledged',
        'acknowledged_at',
        'delivery_notes',
        'receive_notes',
        'admin_notes',
        'status',
        'handover_date',
        'planned_return_date',
    ];

    protected $casts = [
        'mileage' => 'integer',
        'fuel_level' => 'decimal:1',
        'expected_completion' => 'datetime',
        'is_acknowledged' => 'boolean',
        'acknowledged_at' => 'datetime',
        'handover_date' => 'datetime',
        'planned_return_date' => 'datetime',
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

    public function provider()
    {
        return $this->belongsTo(Provider::class);
    }

    public function deliverer()
    {
        return $this->belongsTo(User::class, 'delivered_by');
    }

    public function receiverTechnician()
    {
        return $this->belongsTo(User::class, 'received_by_technician');
    }

    // =====================
    // ACCESSORS
    // =====================

    public function getIncludedItemsArrayAttribute()
    {
        return $this->included_items ? explode('|', $this->included_items) : [];
    }

    public function getVehicleDocumentsArrayAttribute()
    {
        return $this->vehicle_documents ? explode('|', $this->vehicle_documents) : [];
    }

    public function getHandoverImageUrlsArrayAttribute()
    {
        return $this->handover_image_urls ? explode('|', $this->handover_image_urls) : [];
    }

    public function getDamageImageUrlsArrayAttribute()
    {
        return $this->damage_image_urls ? explode('|', $this->damage_image_urls) : [];
    }

    public function getIsOverdueAttribute()
    {
        return $this->expected_completion &&
               $this->expected_completion < now() &&
               !in_array($this->status, ['completed', 'disputed']);
    }

    // =====================
    // SCOPES
    // =====================

    public function scopeDeliveryType($query)
    {
        return $query->where('handover_type', 'delivery');
    }

    public function scopeReturnType($query)
    {
        return $query->where('handover_type', 'return');
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeAcknowledged($query)
    {
        return $query->where('is_acknowledged', true);
    }

    public function scopePendingAcknowledgment($query)
    {
        return $query->where('is_acknowledged', false)
            ->where('status', 'pending');
    }

    public function scopeOverdue($query)
    {
        return $query->where('expected_completion', '<', now())
            ->whereNotIn('status', ['completed', 'disputed']);
    }
}

