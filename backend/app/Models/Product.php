<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'sku',
        'description',
        'category_id',
        'primary_warehouse_id',
        'quote_price',
        'settlement_price',
        'unit',
        'main_image',
        'gallery_images',
        'specifications',
        'is_stockable',
        'track_by_serial',
        'track_by_batch',
        'shelf_life_days',
        'auto_transfer_enabled',
        'transfer_threshold',
        'track_stock',
        'has_warranty',
        'warranty_months',
        'supplier_name',
        'supplier_code',
        'is_active',
    ];

    protected $casts = [
        'quote_price' => 'decimal:2',
        'settlement_price' => 'decimal:2',
        'is_stockable' => 'boolean',
        'track_by_serial' => 'boolean',
        'track_by_batch' => 'boolean',
        'shelf_life_days' => 'integer',
        'auto_transfer_enabled' => 'boolean',
        'transfer_threshold' => 'integer',
        'track_stock' => 'boolean',
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

    public function primaryWarehouse()
    {
        return $this->belongsTo(Warehouse::class, 'primary_warehouse_id');
    }

    public function warehouseStocks()
    {
        return $this->hasMany(WarehouseStock::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function stockTransferItems()
    {
        return $this->hasMany(StockTransferItem::class);
    }

    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }

    public function directSaleItems()
    {
        return $this->hasMany(DirectSaleItem::class);
    }

    // =====================
    // ACCESSORS
    // =====================

    public function getGalleryImagesArrayAttribute()
    {
        return $this->gallery_images ? explode('|', $this->gallery_images) : [];
    }

    public function getTotalStockAttribute()
    {
        return $this->warehouseStocks()->sum('quantity');
    }

    public function getTotalAvailableStockAttribute()
    {
        return $this->warehouseStocks()->sum('available_quantity');
    }

    // =====================
    // SCOPES
    // =====================

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeStockable($query)
    {
        return $query->where('is_stockable', true);
    }

    public function scopeLowStock($query)
    {
        return $query->whereHas('warehouseStocks', function($q) {
            $q->whereRaw('quantity <= min_stock');
        });
    }
}
