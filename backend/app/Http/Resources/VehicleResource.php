<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VehicleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'license_plate' => $this->license_plate,
            'vin' => $this->vin,
            'engine_number' => $this->engine_number,
            'year' => $this->year,
            'color' => $this->color,
            'mileage' => $this->mileage,

            // Relations
            'customer' => new CustomerResource($this->whenLoaded('customer')),
            'brand' => new VehicleBrandResource($this->whenLoaded('brand')),
            'model' => new VehicleModelResource($this->whenLoaded('model')),

            // Vehicle Info
            'brand_name' => $this->brand?->name,
            'model_name' => $this->model?->name,
            'full_name' => "{$this->brand?->name} {$this->model?->name} {$this->year}",

            // Insurance
            'insurance_company' => $this->insurance_company,
            'insurance_number' => $this->insurance_number,
            'insurance_expiry' => $this->insurance_expiry?->format('Y-m-d'),
            'insurance_status' => $this->insurance_expiry ?
                ($this->insurance_expiry->isFuture() ? 'active' : 'expired') : 'none',
            'days_until_insurance_expiry' => $this->insurance_expiry?->diffInDays(now(), false),

            // Registration
            'registration_number' => $this->registration_number,
            'registration_expiry' => $this->registration_expiry?->format('Y-m-d'),
            'registration_status' => $this->registration_expiry ?
                ($this->registration_expiry->isFuture() ? 'valid' : 'expired') : 'unknown',
            'days_until_registration_expiry' => $this->registration_expiry?->diffInDays(now(), false),

            // Maintenance
            'last_maintenance' => $this->last_maintenance?->format('Y-m-d'),
            'next_maintenance' => $this->next_maintenance?->format('Y-m-d'),
            'maintenance_interval' => $this->maintenance_interval,
            'maintenance_status' => $this->getMaintenanceStatus(),
            'days_until_next_maintenance' => $this->next_maintenance?->diffInDays(now(), false),

            // Statistics
            'total_orders' => $this->whenCounted('orders'),
            'total_services' => $this->when(
                isset($this->orders_count),
                $this->orders_count ?? 0
            ),

            'image_urls' => $this->image_urls ? explode('|', $this->image_urls) : [],
            'notes' => $this->notes,
            'is_active' => (bool) $this->is_active,

            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }

    protected function getMaintenanceStatus(): string
    {
        if (!$this->next_maintenance) {
            return 'not_scheduled';
        }

        $daysUntil = $this->next_maintenance->diffInDays(now(), false);

        if ($daysUntil < 0) {
            return 'overdue';
        } elseif ($daysUntil <= 7) {
            return 'due_soon';
        } else {
            return 'scheduled';
        }
    }
}
