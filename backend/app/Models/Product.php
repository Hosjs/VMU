<?php

namespace App\Models;

use App\QueryScopes\ProductScopes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory, ProductScopes;

    protected $fillable = [
        'name',
        'code',
        'sku',
        'description',
        'category_id',
        'primary_warehouse_id',
        'vehicle_brand_id',
        'vehicle_model_id',
        'compatible_years',
        'is_universal',
        'cost_price',
        'suggested_price',
        'unit',
        'main_image',
        'gallery_images',
        'specifications',
        'is_stockable',
        'track_by_serial',
        'track_by_batch',
        'shelf_life_days',
        'track_stock',
        'has_warranty',
        'warranty_months',
        'supplier_id',
        'supplier_code',
        'min_stock_level',
        'max_stock_level',
        'reorder_point',
        'is_active',
    ];

    protected $casts = [
        'cost_price' => 'decimal:2',
        'suggested_price' => 'decimal:2',
        'is_universal' => 'boolean',
        'is_stockable' => 'boolean',
        'track_by_serial' => 'boolean',
        'track_by_batch' => 'boolean',
        'shelf_life_days' => 'integer',
        'track_stock' => 'boolean',
        'has_warranty' => 'boolean',
        'warranty_months' => 'integer',
        'min_stock_level' => 'integer',
        'max_stock_level' => 'integer',
        'reorder_point' => 'integer',
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

    public function vehicleBrand()
    {
        return $this->belongsTo(VehicleBrand::class);
    }

    public function vehicleModel()
    {
        return $this->belongsTo(VehicleModel::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Provider::class, 'supplier_id');
    }

    public function warehouseStocks()
    {
        return $this->hasMany(WarehouseStock::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }

    public function stockTransferItems()
    {
        return $this->hasMany(StockTransferItem::class);
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
}
