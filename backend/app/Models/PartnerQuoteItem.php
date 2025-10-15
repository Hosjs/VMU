<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PartnerQuoteItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'partner_quote_id',
        'item_type',
        'service_id',
        'product_id',
        'item_name',
        'item_code',
        'description',
        'quantity',
        'unit',
        'partner_unit_price',
        'partner_total_price',
        'partner_discount',
        'customer_unit_price',
        'customer_total_price',
        'customer_discount',
        'profit_amount',
        'profit_percent',
        'has_warranty',
        'warranty_months',
        'estimated_duration_minutes',
        'partner_notes',
        'internal_notes',
        'is_approved',
        'is_required',
        'provided_by_partner',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'partner_unit_price' => 'decimal:2',
        'partner_total_price' => 'decimal:2',
        'partner_discount' => 'decimal:2',
        'customer_unit_price' => 'decimal:2',
        'customer_total_price' => 'decimal:2',
        'customer_discount' => 'decimal:2',
        'profit_amount' => 'decimal:2',
        'profit_percent' => 'decimal:2',
        'warranty_months' => 'integer',
        'estimated_duration_minutes' => 'integer',
        'has_warranty' => 'boolean',
        'is_approved' => 'boolean',
        'is_required' => 'boolean',
        'provided_by_partner' => 'boolean',
    ];

    // Relationships
    public function partnerQuote()
    {
        return $this->belongsTo(PartnerQuote::class);
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    // Scopes
    public function scopeServices($query)
    {
        return $query->where('item_type', 'service');
    }

    public function scopeProducts($query)
    {
        return $query->where('item_type', 'product');
    }

    public function scopeApproved($query)
    {
        return $query->where('is_approved', true);
    }

    public function scopeRequired($query)
    {
        return $query->where('is_required', true);
    }

    public function scopeProvidedByPartner($query)
    {
        return $query->where('provided_by_partner', true);
    }

    // Helper methods
    public function calculateProfit()
    {
        $this->profit_amount = $this->customer_total_price - $this->partner_total_price;

        if ($this->partner_total_price > 0) {
            $this->profit_percent = ($this->profit_amount / $this->partner_total_price) * 100;
        } else {
            $this->profit_percent = 0;
        }

        $this->save();
    }

    public function updateCustomerPrice($unitPrice)
    {
        $this->customer_unit_price = $unitPrice;
        $this->customer_total_price = $unitPrice * $this->quantity - $this->customer_discount;
        $this->calculateProfit();
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PartnerQuote extends Model
{
    use HasFactory;

    protected $fillable = [
        'quote_number',
        'service_request_id',
        'order_id',
        'provider_id',
        'vehicle_id',
        'provider_name',
        'provider_code',
        'provider_contact_person',
        'provider_phone',
        'provider_email',
        'requested_by',
        'quoted_by_partner',
        'quoted_by_partner_name',
        'request_date',
        'quote_date',
        'quote_valid_until',
        'customer_quote_date',
        'work_description',
        'special_requirements',
        'estimated_duration_hours',
        'status',
        'priority',
    ];

    protected $casts = [
        'request_date' => 'datetime',
        'quote_date' => 'datetime',
        'quote_valid_until' => 'datetime',
        'customer_quote_date' => 'datetime',
        'estimated_duration_hours' => 'integer',
    ];

    // Relationships
    public function serviceRequest()
    {
        return $this->belongsTo(ServiceRequest::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function provider()
    {
        return $this->belongsTo(Provider::class);
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function requestedBy()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function quotedByPartner()
    {
        return $this->belongsTo(User::class, 'quoted_by_partner');
    }

    public function items()
    {
        return $this->hasMany(PartnerQuoteItem::class);
    }

    // Scopes
    public function scopeByProvider($query, $providerId)
    {
        return $query->where('provider_id', $providerId);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeQuoted($query)
    {
        return $query->where('status', 'quoted');
    }

    public function scopeAccepted($query)
    {
        return $query->where('status', 'accepted');
    }

    public function scopeExpiringSoon($query, $days = 7)
    {
        return $query->whereNotNull('quote_valid_until')
                    ->where('quote_valid_until', '<=', now()->addDays($days))
                    ->where('quote_valid_until', '>=', now());
    }

    // Helper methods
    public function getTotalPartnerPrice()
    {
        return $this->items->sum('partner_total_price');
    }

    public function getTotalCustomerPrice()
    {
        return $this->items->sum('customer_total_price');
    }

    public function getTotalProfit()
    {
        return $this->getTotalCustomerPrice() - $this->getTotalPartnerPrice();
    }

    public function getProfitMargin()
    {
        $partnerTotal = $this->getTotalPartnerPrice();
        if ($partnerTotal <= 0) return 0;

        return ($this->getTotalProfit() / $partnerTotal) * 100;
    }
}

