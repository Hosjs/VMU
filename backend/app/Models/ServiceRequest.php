<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'customer_name',
        'customer_phone',
        'customer_email',
        'customer_address',
        'customer_id',
        'vehicle_brand',
        'vehicle_model',
        'vehicle_name',
        'license_plate',
        'vehicle_year',
        'description',
        'preferred_date',
        'status',
        'assigned_to',
        'admin_handler',
        'selected_provider_id',
        'contacted_at',
        'scheduled_at',
        'admin_notes',
        'attachment_urls',
        'priority',
    ];

    protected $casts = [
        'preferred_date' => 'datetime',
        'contacted_at' => 'datetime',
        'scheduled_at' => 'datetime',
        'vehicle_year' => 'integer',
    ];

    // =====================
    // RELATIONSHIPS
    // =====================

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function adminHandler()
    {
        return $this->belongsTo(User::class, 'admin_handler');
    }

    public function selectedProvider()
    {
        return $this->belongsTo(Provider::class, 'selected_provider_id');
    }

    public function serviceRequestServices()
    {
        return $this->hasMany(ServiceRequestService::class);
    }

    public function services()
    {
        return $this->belongsToMany(Service::class, 'service_request_services')
            ->withPivot('description', 'priority', 'quantity', 'estimated_price', 'notes')
            ->withTimestamps();
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    // =====================
    // ACCESSORS
    // =====================

    public function getAttachmentUrlsArrayAttribute()
    {
        return $this->attachment_urls ? explode('|', $this->attachment_urls) : [];
    }

    // =====================
    // SCOPES
    // =====================

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    public function scopeHighPriority($query)
    {
        return $query->whereIn('priority', ['high', 'urgent']);
    }
}
