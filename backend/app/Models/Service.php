<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'category_id',
        'quote_price',
        'settlement_price',
        'unit',
        'estimated_time',
        'main_image',
        'gallery_images',
        'notes',
        'has_warranty',
        'warranty_months',
        'is_active',
    ];

    protected $casts = [
        'quote_price' => 'decimal:2',
        'settlement_price' => 'decimal:2',
        'estimated_time' => 'integer',
        'has_warranty' => 'boolean',
        'warranty_months' => 'integer',
        'is_active' => 'boolean',
    ];

    // =====================
    // RELATIONSHIPS
    // =====================

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function serviceRequestServices()
    {
        return $this->hasMany(ServiceRequestService::class);
    }

    public function serviceRequests()
    {
        return $this->belongsToMany(ServiceRequest::class, 'service_request_services')
            ->withPivot('description', 'priority', 'quantity', 'estimated_price', 'notes')
            ->withTimestamps();
    }

    // =====================
    // ACCESSORS
    // =====================

    public function getGalleryImagesArrayAttribute()
    {
        return $this->gallery_images ? explode('|', $this->gallery_images) : [];
    }

    // =====================
    // SCOPES
    // =====================

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeWithWarranty($query)
    {
        return $query->where('has_warranty', true);
    }
}
