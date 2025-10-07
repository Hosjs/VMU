<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WarehouseStockResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isAdmin = $request->user()?->role?->name === 'admin';

        return [
            'id' => $this->id,

            // Warehouse relationship
            'warehouse' => $this->when(
                $this->relationLoaded('warehouse'),
                function () {
                    /** @var \App\Http\Resources\WarehouseResource $resource */
                    $resource = WarehouseResource::class;
                    return new $resource($this->warehouse);
                }
            ),

            // Product relationship
            'product' => $this->when(
                $this->relationLoaded('product'),
                function () {
                    /** @var \App\Http\Resources\ProductResource $resource */
                    $resource = ProductResource::class;
                    return new $resource($this->product);
                }
            ),

            // Quantities
            'quantity' => (int) $this->quantity,
            'reserved_quantity' => (int) $this->reserved_quantity,
            'available_quantity' => (int) $this->available_quantity,

            // Value (Admin Only)
            'unit_cost' => $this->when($isAdmin, (float) $this->unit_cost),
            'total_value' => $this->when($isAdmin, (float) $this->total_value),

            // Stock Levels
            'min_stock' => (int) $this->min_stock,
            'max_stock' => (int) $this->max_stock,
            'reorder_point' => (int) $this->reorder_point,
            'economic_order_quantity' => (int) $this->economic_order_quantity,

            // Stock Status
            'stock_status' => $this->getStockStatus(),
            'needs_reorder' => $this->available_quantity <= $this->reorder_point,
            'is_low_stock' => $this->available_quantity <= $this->min_stock,
            'is_out_of_stock' => $this->available_quantity <= 0,

            // Location
            'location_code' => $this->location_code,
            'shelf' => $this->shelf,
            'row' => $this->row,
            'position' => $this->position,
            'full_location' => $this->getFullLocation(),

            // Movement Info
            'last_movement_date' => $this->last_movement_date?->format('Y-m-d H:i:s'),
            'last_stocktake_date' => $this->last_stocktake_date?->format('Y-m-d H:i:s'),
            'movement_count' => (int) $this->movement_count,

            // Flags
            'is_locked' => (bool) $this->is_locked,
            'is_damaged' => (bool) $this->is_damaged,
            'is_expired' => (bool) $this->is_expired,
            'expiry_date' => $this->expiry_date?->format('Y-m-d'),

            'notes' => $this->notes,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }

    protected function getStockStatus(): string
    {
        if ($this->is_expired) return 'expired';
        if ($this->is_damaged) return 'damaged';
        if ($this->is_locked) return 'locked';
        if ($this->available_quantity <= 0) return 'out_of_stock';
        if ($this->available_quantity <= $this->min_stock) return 'low_stock';
        if ($this->available_quantity <= $this->reorder_point) return 'reorder_needed';
        if ($this->available_quantity >= $this->max_stock) return 'overstocked';

        return 'normal';
    }

    protected function getFullLocation(): ?string
    {
        if (!$this->location_code && !$this->shelf && !$this->row && !$this->position) {
            return null;
        }

        $parts = array_filter([
            $this->location_code,
            $this->shelf ? "Shelf: {$this->shelf}" : null,
            $this->row ? "Row: {$this->row}" : null,
            $this->position ? "Pos: {$this->position}" : null,
        ]);

        return implode(' | ', $parts);
    }
}
