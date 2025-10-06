<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceRequestService extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_request_id',
        'service_id',
        'description',
        'priority',
        'quantity',
        'estimated_price',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'estimated_price' => 'decimal:2',
    ];

    // =====================
    // RELATIONSHIPS
    // =====================

    public function serviceRequest()
    {
        return $this->belongsTo(ServiceRequest::class);
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}
