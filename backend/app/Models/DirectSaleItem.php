<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DirectSaleItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'direct_sale_id',
        'product_id',
        'product_name',
        'product_code',
        'product_sku',
        'product_description',
        'quantity',
        'unit',
        'unit_price',
        'line_total',
        'discount_amount',
        'unit_cost',
        'total_cost',
        'line_profit',
        'profit_margin',
        'tax_rate',
        'tax_amount',
        'is_tax_exempt',
        'warehouse_location',
        'batch_number',
        'serial_number',
        'expiry_date',
        'has_warranty',
        'warranty_months',
        'warranty_start_date',
        'warranty_end_date',
        'status',
        'picked_by',
        'picked_at',
        'notes',
        'customer_notes',
        'stock_movement_id',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'line_total' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'unit_cost' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'line_profit' => 'decimal:2',
        'profit_margin' => 'decimal:2',
        'tax_rate' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'is_tax_exempt' => 'boolean',
        'expiry_date' => 'date',
        'has_warranty' => 'boolean',
        'warranty_months' => 'integer',
        'warranty_start_date' => 'date',
        'warranty_end_date' => 'date',
        'picked_at' => 'datetime',
    ];

    // =====================
    // RELATIONSHIPS
    // =====================

    public function directSale()
    {
        return $this->belongsTo(DirectSale::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function picker()
    {
        return $this->belongsTo(User::class, 'picked_by');
    }

    public function stockMovement()
    {
        return $this->belongsTo(StockMovement::class);
    }

    // =====================
    // SCOPES
    // =====================

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeWithWarranty($query)
    {
        return $query->where('has_warranty', true);
    }

    public function scopePicked($query)
    {
        return $query->whereNotNull('picked_at');
    }
}

