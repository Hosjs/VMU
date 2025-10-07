<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WarehouseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'type' => $this->type,

            // Location
            'address' => $this->address,
            'ward' => $this->ward,
            'district' => $this->district,
            'province' => $this->province,
            'postal_code' => $this->postal_code,
            'full_address' => $this->getFullAddress(),

            // Contact
            'contact_person' => $this->contact_person,
            'phone' => $this->phone,
            'email' => $this->email,

            // Settings
            'is_main_warehouse' => (bool) $this->is_main_warehouse,
            'can_receive_transfers' => (bool) $this->can_receive_transfers,
            'can_send_transfers' => (bool) $this->can_send_transfers,
            'priority_order' => $this->priority_order,
            'tax_exempt_transfers' => (bool) $this->tax_exempt_transfers,

            // Provider
            'provider' => new ProviderResource($this->whenLoaded('provider')),

            // Manager
            'manager' => new UserResource($this->whenLoaded('manager')),

            // Statistics
            'total_products' => $this->whenCounted('stocks'),
            'total_stock_value' => $this->when(
                isset($this->stocks_sum_total_value),
                (float) $this->stocks_sum_total_value
            ),
            'low_stock_products' => $this->whenLoaded('stocks', function() {
                return $this->stocks->filter(function($stock) {
                    return $stock->available_quantity <= $stock->min_stock;
                })->count();
            }),

            'last_inventory_date' => $this->last_inventory_date?->format('Y-m-d H:i:s'),
            'operating_hours' => $this->operating_hours,
            'notes' => $this->notes,
            'is_active' => (bool) $this->is_active,

            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }

    protected function getFullAddress(): string
    {
        $parts = array_filter([
            $this->address,
            $this->ward,
            $this->district,
            $this->province,
        ]);

        return implode(', ', $parts);
    }
}

