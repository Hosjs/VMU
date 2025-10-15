<?php

namespace App\Models;

use App\QueryScopes\OrderScopes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory, OrderScopes;

    protected $fillable = [
        'order_number',
        'customer_id',
        'vehicle_id',
        'service_request_id',
        'type',
        'status',
        'quote_total',
        'settlement_total',
        'discount',
        'tax_amount',
        'final_amount',
        'payment_status',
        'payment_method',
        'paid_amount',
        'salesperson_id',
        'technician_id',
        'accountant_id',
        'partner_provider_id',
        'partner_coordinator_id',
        'partner_coordinator_name',
        'partner_coordinator_phone',
        'quote_date',
        'confirmed_date',
        'start_date',
        'completion_date',
        'delivery_date',
        'partner_handover_date',
        'partner_return_date',
        'notes',
        'attachment_urls',
    ];

    protected $casts = [
        'quote_total' => 'decimal:2',
        'settlement_total' => 'decimal:2',
        'discount' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'final_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'quote_date' => 'datetime',
        'confirmed_date' => 'datetime',
        'start_date' => 'datetime',
        'completion_date' => 'datetime',
        'delivery_date' => 'datetime',
        'partner_handover_date' => 'datetime',
        'partner_return_date' => 'datetime',
    ];

    // =====================
    // RELATIONSHIPS
    // =====================

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function serviceRequest()
    {
        return $this->belongsTo(ServiceRequest::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function salesperson()
    {
        return $this->belongsTo(User::class, 'salesperson_id');
    }

    public function technician()
    {
        return $this->belongsTo(User::class, 'technician_id');
    }

    public function accountant()
    {
        return $this->belongsTo(User::class, 'accountant_id');
    }

    public function partnerProvider()
    {
        return $this->belongsTo(Provider::class, 'partner_provider_id');
    }

    public function partnerCoordinator()
    {
        return $this->belongsTo(User::class, 'partner_coordinator_id');
    }

    public function vehicleHandovers()
    {
        return $this->hasMany(PartnerVehicleHandover::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function settlements()
    {
        return $this->hasMany(Settlement::class);
    }

    public function inspections()
    {
        return $this->hasMany(VehicleInspection::class);
    }

    public function stockTransfers()
    {
        return $this->hasMany(StockTransfer::class);
    }
}
