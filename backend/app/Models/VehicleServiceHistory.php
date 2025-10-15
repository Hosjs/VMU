<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VehicleServiceHistory extends Model
{
    use HasFactory;

    protected $table = 'vehicle_service_history';

    protected $fillable = [
        'history_number',
        'vehicle_id',
        'customer_id',
        'order_id',
        'order_item_id',
        'type',
        'service_id',
        'product_id',
        'item_name',
        'item_code',
        'description',
        'quantity',
        'unit',
        'quote_unit_price',
        'quote_total_price',
        'settlement_unit_price',
        'settlement_total_price',
        'actual_paid',
        'provider_id',
        'provider_name',
        'technician_id',
        'technician_name',
        'mileage_at_service',
        'service_date',
        'service_start',
        'service_end',
        'has_warranty',
        'warranty_months',
        'warranty_start_date',
        'warranty_end_date',
        'warranty_id',
        'warranty_status',
        'is_maintenance',
        'next_maintenance_mileage',
        'next_maintenance_date',
        'customer_rating',
        'customer_feedback',
        'before_image_urls',
        'after_image_urls',
        'document_urls',
        'technician_notes',
        'internal_notes',
        'status',
    ];

    protected $casts = [
        'service_date' => 'date',
        'service_start' => 'datetime',
        'service_end' => 'datetime',
        'warranty_start_date' => 'date',
        'warranty_end_date' => 'date',
        'next_maintenance_date' => 'date',
        'quantity' => 'decimal:2',
        'quote_unit_price' => 'decimal:2',
        'quote_total_price' => 'decimal:2',
        'settlement_unit_price' => 'decimal:2',
        'settlement_total_price' => 'decimal:2',
        'actual_paid' => 'decimal:2',
        'mileage_at_service' => 'integer',
        'next_maintenance_mileage' => 'integer',
        'warranty_months' => 'integer',
        'customer_rating' => 'integer',
        'has_warranty' => 'boolean',
        'is_maintenance' => 'boolean',
    ];

    // Relationships
    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function orderItem()
    {
        return $this->belongsTo(OrderItem::class);
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function provider()
    {
        return $this->belongsTo(Provider::class);
    }

    public function technician()
    {
        return $this->belongsTo(User::class, 'technician_id');
    }

    public function warranty()
    {
        return $this->belongsTo(Warranty::class);
    }

    // Helper methods
    public function getBeforeImagesAttribute()
    {
        return $this->before_image_urls ? explode('|', $this->before_image_urls) : [];
    }

    public function getAfterImagesAttribute()
    {
        return $this->after_image_urls ? explode('|', $this->after_image_urls) : [];
    }

    public function getDocumentsAttribute()
    {
        return $this->document_urls ? explode('|', $this->document_urls) : [];
    }

    // Scopes
    public function scopeByVehicle($query, $vehicleId)
    {
        return $query->where('vehicle_id', $vehicleId);
    }

    public function scopeByCustomer($query, $customerId)
    {
        return $query->where('customer_id', $customerId);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeWithWarranty($query)
    {
        return $query->where('has_warranty', true)
                    ->where('warranty_status', 'active');
    }

    public function scopeMaintenance($query)
    {
        return $query->where('is_maintenance', true);
    }

    public function scopeUpcomingMaintenance($query)
    {
        return $query->where('is_maintenance', true)
                    ->whereNotNull('next_maintenance_date')
                    ->where('next_maintenance_date', '<=', now()->addDays(30));
    }
}

