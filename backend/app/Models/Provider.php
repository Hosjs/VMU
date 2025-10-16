<?php

namespace App\Models;

use App\QueryScopes\ProviderScopes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Provider extends Model
{
    use HasFactory, ProviderScopes, SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'business_name',
        'tax_code',
        'provider_type',
        'contact_person',
        'phone',
        'email',
        'address',
        'website',
        'bank_name',
        'bank_account',
        'bank_branch',
        'service_types',
        'specializations',
        'commission_rate',
        'payment_terms',
        'credit_limit',
        'payment_method',
        'rating',
        'completed_orders',
        'average_completion_time',
        'status',
        'contract_start',
        'contract_end',
        'notes',
        'attachment_urls',
        'managed_by',
    ];

    protected $casts = [
        'commission_rate' => 'decimal:2',
        'payment_terms' => 'integer',
        'credit_limit' => 'decimal:2',
        'rating' => 'decimal:2',
        'completed_orders' => 'integer',
        'average_completion_time' => 'decimal:2',
        'contract_start' => 'date',
        'contract_end' => 'date',
    ];

    // =====================
    // RELATIONSHIPS
    // =====================

    public function manager()
    {
        return $this->belongsTo(User::class, 'managed_by');
    }

    public function warehouses()
    {
        return $this->hasMany(Warehouse::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class, 'partner_provider_id');
    }

    public function settlements()
    {
        return $this->hasMany(Settlement::class);
    }

    public function pendingSettlements()
    {
        return $this->hasMany(Settlement::class)->whereIn('payment_status', ['unpaid', 'partial']);
    }

    public function serviceRequests()
    {
        return $this->hasMany(ServiceRequest::class, 'selected_provider_id');
    }

    public function vehicleHandovers()
    {
        return $this->hasMany(PartnerVehicleHandover::class);
    }

    // =====================
    // ACCESSORS
    // =====================

    public function getServiceTypesArrayAttribute()
    {
        return $this->service_types ? explode(',', $this->service_types) : [];
    }

    public function getSpecializationsArrayAttribute()
    {
        return $this->specializations ? explode(',', $this->specializations) : [];
    }

    public function getAttachmentUrlsArrayAttribute()
    {
        return $this->attachment_urls ? explode('|', $this->attachment_urls) : [];
    }

    // =====================
    // SCOPES
    // =====================

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeHighRated($query, $minRating = 8)
    {
        return $query->where('rating', '>=', $minRating);
    }
}
