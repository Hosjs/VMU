<?php

namespace App\Models;

use App\QueryScopes\ServiceRequestScopes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ServiceRequest extends Model
{
    use HasFactory, ServiceRequestScopes, SoftDeletes;

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
        'vehicle_year' => 'integer',
        'preferred_date' => 'datetime',
        'contacted_at' => 'datetime',
        'scheduled_at' => 'datetime',
    ];

    // =====================
    // RELATIONSHIPS
    // =====================

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function assignedTo()
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

    public function serviceRequest()
    {
        return $this->belongsTo(ServiceRequest::class);
    }

    public function services()
    {
        return $this->belongsToMany(Service::class, 'service_request_services')
            ->withPivot(['description', 'priority', 'quantity', 'estimated_price', 'notes'])
            ->withTimestamps();
    }

    public function requestedServices()
    {
        return $this->hasMany(ServiceRequestService::class);
    }

    public function order()
    {
        return $this->hasOne(Order::class);
    }
}
