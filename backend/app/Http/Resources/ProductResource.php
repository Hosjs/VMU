<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isAdmin = $request->user()?->role?->name === 'admin';

        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'sku' => $this->sku,
            'description' => $this->description,
            'unit' => $this->unit,

            // Pricing
            'quote_price' => (float) $this->quote_price,
            'settlement_price' => $this->when($isAdmin, (float) $this->settlement_price),
            'profit_per_unit' => $this->when($isAdmin, (float) ($this->quote_price - $this->settlement_price)),
            'profit_margin' => $this->when($isAdmin,
                $this->quote_price > 0 ? round((($this->quote_price - $this->settlement_price) / $this->quote_price) * 100, 2) : 0
            ),

            // Category
            'category' => new CategoryResource($this->whenLoaded('category')),
            'category_name' => $this->category?->name,

            // Warehouse & Stock
            'primary_warehouse' => new WarehouseResource($this->whenLoaded('primaryWarehouse')),
            'warehouse_stocks' => WarehouseStockResource::collection($this->whenLoaded('warehouseStocks')),
            'total_stock' => $this->when(
                isset($this->warehouse_stocks_sum_available_quantity),
                (int) $this->warehouse_stocks_sum_available_quantity
            ),
            'available_stock' => $this->when(
                isset($this->warehouse_stocks_sum_available_quantity),
                (int) $this->warehouse_stocks_sum_available_quantity
            ),
            'reserved_stock' => $this->when(
                isset($this->warehouse_stocks_sum_reserved_quantity),
                (int) $this->warehouse_stocks_sum_reserved_quantity
            ),

            // Stock Settings
            'is_stockable' => (bool) $this->is_stockable,
            'track_stock' => (bool) $this->track_stock,
            'track_by_serial' => (bool) $this->track_by_serial,
            'track_by_batch' => (bool) $this->track_by_batch,
            'shelf_life_days' => $this->shelf_life_days,
            'auto_transfer_enabled' => (bool) $this->auto_transfer_enabled,
            'transfer_threshold' => $this->transfer_threshold,

            // Warranty
            'has_warranty' => (bool) $this->has_warranty,
            'warranty_months' => $this->warranty_months,

            // Supplier
            'supplier_name' => $this->supplier_name,
            'supplier_code' => $this->supplier_code,

            // Images
            'main_image' => $this->main_image,
            'gallery_images' => $this->gallery_images ? explode('|', $this->gallery_images) : [],

            'specifications' => $this->specifications,
            'is_active' => (bool) $this->is_active,

            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_id' => $this->order_id,
            'item_type' => $this->item_type,
            'item_name' => $this->item_name,
            'item_code' => $this->item_code,
            'item_description' => $this->item_description,

            // Quantity & Unit
            'quantity' => (float) $this->quantity,
            'unit' => $this->unit,

            // Pricing (Customer)
            'quote_unit_price' => (float) $this->quote_unit_price,
            'quote_total_price' => (float) $this->quote_total_price,

            // Pricing (Settlement - Admin Only)
            'settlement_unit_price' => $this->when(
                $request->user()?->role?->name === 'admin',
                (float) $this->settlement_unit_price
            ),
            'settlement_total_price' => $this->when(
                $request->user()?->role?->name === 'admin',
                (float) $this->settlement_total_price
            ),
            'profit' => $this->when(
                $request->user()?->role?->name === 'admin',
                (float) ($this->quote_total_price - $this->settlement_total_price)
            ),

            // Discount
            'discount_amount' => (float) $this->discount_amount,
            'discount_percent' => (float) $this->discount_percent,

            // Status & Assignment
            'status' => $this->status,
            'assigned_technician' => new UserResource($this->whenLoaded('assignedTechnician')),
            'partner_technician_name' => $this->partner_technician_name,

            // Timing
            'start_time' => $this->start_time?->format('Y-m-d H:i:s'),
            'completion_time' => $this->completion_time?->format('Y-m-d H:i:s'),
            'actual_duration' => $this->actual_duration,

            // Warranty
            'has_warranty' => (bool) $this->has_warranty,
            'warranty_months' => $this->warranty_months,
            'warranty_start_date' => $this->warranty_start_date?->format('Y-m-d'),
            'warranty_end_date' => $this->warranty_end_date?->format('Y-m-d'),

            // Relations
            'service' => new ServiceResource($this->whenLoaded('service')),
            'product' => new ProductResource($this->whenLoaded('product')),

            'notes' => $this->notes,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
