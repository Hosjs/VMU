<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'phone',
        'email',
        'address',
        'birth_date',
        'gender',
        'user_id',
        'insurance_company',
        'insurance_number',
        'insurance_expiry',
        'notes',
        'preferences',
        'is_active',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'insurance_expiry' => 'date',
        'is_active' => 'boolean',
    ];

    // =====================
    // RELATIONSHIPS
    // =====================

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function vehicles()
    {
        return $this->hasMany(Vehicle::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function warranties()
    {
        return $this->hasMany(Warranty::class);
    }

    public function vehicleInspections()
    {
        return $this->hasMany(VehicleInspection::class);
    }

    public function directSales()
    {
        return $this->hasMany(DirectSale::class);
    }

    // =====================
    // ACCESSORS
    // =====================

    public function getPreferencesArrayAttribute()
    {
        if (!$this->preferences) return [];

        $items = explode('|', $this->preferences);
        $result = [];
        foreach ($items as $item) {
            $parts = explode('=', $item, 2);
            if (count($parts) === 2) {
                $result[$parts[0]] = $parts[1];
            }
        }
        return $result;
    }

    // =====================
    // SCOPES
    // =====================

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeHasInsurance($query)
    {
        return $query->whereNotNull('insurance_company');
    }

    public function scopeInsuranceExpiring($query, $days = 30)
    {
        return $query->whereBetween('insurance_expiry', [
            now(),
            now()->addDays($days)
        ]);
    }
}
