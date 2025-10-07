<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'phone' => $this->phone,
            'email' => $this->email,
            'address' => $this->address,
            'birth_date' => $this->birth_date?->format('Y-m-d'),
            'gender' => $this->gender,

            // Insurance Info
            'insurance_company' => $this->insurance_company,
            'insurance_number' => $this->insurance_number,
            'insurance_expiry' => $this->insurance_expiry?->format('Y-m-d'),
            'insurance_status' => $this->insurance_expiry ?
                ($this->insurance_expiry->isFuture() ? 'active' : 'expired') : 'none',

            // Relations
            'vehicles' => VehicleResource::collection($this->whenLoaded('vehicles')),
            'active_vehicles' => VehicleResource::collection(
                $this->whenLoaded('activeVehicles')
            ),

            // Statistics
            'total_vehicles' => $this->whenCounted('vehicles'),
            'total_orders' => $this->whenCounted('orders'),
            'total_spent' => $this->when(
                isset($this->orders_sum_final_amount),
                (float) $this->orders_sum_final_amount
            ),
            'last_visit_date' => $this->when(
                isset($this->orders_max_created_at),
                $this->orders_max_created_at?->format('Y-m-d H:i:s')
            ),

            // Preferences & Notes
            'preferences' => $this->preferences,
            'notes' => $this->notes,
            'is_active' => (bool) $this->is_active,

            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
