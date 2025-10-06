<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VehicleModel extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'brand_id',
        'type',
        'year_start',
        'year_end',
        'engine_type',
        'fuel_type',
        'image_urls',
        'description',
        'is_active',
    ];

    protected $casts = [
        'year_start' => 'integer',
        'year_end' => 'integer',
        'is_active' => 'boolean',
    ];

    // =====================
    // RELATIONSHIPS
    // =====================

    public function brand()
    {
        return $this->belongsTo(VehicleBrand::class, 'brand_id');
    }

    public function vehicles()
    {
        return $this->hasMany(Vehicle::class, 'model_id');
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
        return $this->brand->name . ' ' . $this->name;
    }

    // =====================
    // SCOPES
    // =====================

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }
}
