<?php

namespace App\Models;

use App\QueryScopes\VehicleScopes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vehicle extends Model
{
    use HasFactory, VehicleScopes, SoftDeletes;

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

    public function vehicleHandovers()
    {
        return $this->hasMany(PartnerVehicleHandover::class);
    }

    public function serviceHistories()
    {
        return $this->hasMany(VehicleServiceHistory::class);
    }
}
