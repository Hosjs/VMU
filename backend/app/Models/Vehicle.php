<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'brand_id',
        'model_id',
        'license_plate',
        'vin',
        'engine_number',
        'year',
        'color',
        'mileage',
        'insurance_company',
        'insurance_number',
        'insurance_expiry',
        'registration_number',
        'registration_expiry',
        'last_maintenance',
        'next_maintenance',
        'maintenance_interval',
        'image_urls',
        'notes',
        'is_active',
    ];

    protected $casts = [
        'year' => 'integer',
        'mileage' => 'integer',
        'insurance_expiry' => 'date',
        'registration_expiry' => 'date',
        'last_maintenance' => 'date',
        'next_maintenance' => 'date',
        'maintenance_interval' => 'integer',
        'is_active' => 'boolean',
    ];

    // =====================
    // RELATIONSHIPS
    // =====================

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function brand()
    {
        return $this->belongsTo(VehicleBrand::class, 'brand_id');
    }

    public function model()
    {
        return $this->belongsTo(VehicleModel::class, 'model_id');
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function inspections()
    {
        return $this->hasMany(VehicleInspection::class);
    }

    public function warranties()
    {
        return $this->hasMany(Warranty::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    public function handovers()
    {
        return $this->hasMany(PartnerVehicleHandover::class);
    }

    // =====================
    // ACCESSORS
    // =====================

    public function getImageUrlsArrayAttribute()
    {
        return $this->image_urls ? explode('|', $this->image_urls) : [];
    }

    public function getFullNameAttribute()
    {
        return $this->brand->name . ' ' . $this->model->name . ' (' . $this->license_plate . ')';
    }

    public function getNeedsMaintenanceAttribute()
    {
        return $this->next_maintenance && $this->next_maintenance <= now()->addDays(7);
    }

    // =====================
    // SCOPES
    // =====================

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeMaintenanceDue($query, $days = 7)
    {
        return $query->whereBetween('next_maintenance', [
            now(),
            now()->addDays($days)
        ]);
    }

    public function scopeInsuranceExpiring($query, $days = 30)
    {
        return $query->whereBetween('insurance_expiry', [
            now(),
            now()->addDays($days)
        ]);
    }

    public function scopeRegistrationExpiring($query, $days = 30)
    {
        return $query->whereBetween('registration_expiry', [
            now(),
            now()->addDays($days)
        ]);
    }
}
