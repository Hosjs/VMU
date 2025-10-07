<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VehicleModelResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'brand' => new VehicleBrandResource($this->whenLoaded('brand')),
            'brand_name' => $this->brand?->name,
            'type' => $this->type,

            // Production Years
            'year_start' => $this->year_start,
            'year_end' => $this->year_end,
            'production_status' => $this->year_end && $this->year_end < now()->year ? 'discontinued' : 'current',

            // Technical
            'engine_type' => $this->engine_type,
            'fuel_type' => $this->fuel_type,

            'image_urls' => $this->image_urls ? explode('|', $this->image_urls) : [],
            'description' => $this->description,
            'is_active' => (bool) $this->is_active,

            // Statistics
            'vehicles_count' => $this->whenCounted('vehicles'),

            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProviderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'business_name' => $this->business_name,
            'tax_code' => $this->tax_code,

            // Contact
            'contact_person' => $this->contact_person,
            'phone' => $this->phone,
            'email' => $this->email,
            'address' => $this->address,
            'website' => $this->website,

            // Banking
            'bank_name' => $this->bank_name,
            'bank_account' => $this->bank_account,
            'bank_branch' => $this->bank_branch,

            // Services
            'service_types' => $this->service_types,
            'specializations' => $this->specializations,

            // Business Terms
            'commission_rate' => (float) $this->commission_rate,
            'payment_terms' => $this->payment_terms,
            'credit_limit' => (float) $this->credit_limit,
            'payment_method' => $this->payment_method,

            // Performance
            'rating' => (float) $this->rating,
            'completed_orders' => (int) $this->completed_orders,
            'average_completion_time' => (float) $this->average_completion_time,

            // Contract
            'contract_start' => $this->contract_start?->format('Y-m-d'),
            'contract_end' => $this->contract_end?->format('Y-m-d'),
            'contract_status' => $this->getContractStatus(),

            // Status
            'status' => $this->status,

            // Manager
            'managed_by_user' => new UserResource($this->whenLoaded('manager')),

            // Statistics
            'total_orders' => $this->whenCounted('orders'),
            'pending_settlements' => $this->whenCounted('pendingSettlements'),
            'total_settlement_amount' => $this->when(
                isset($this->settlements_sum_final_payment),
                (float) $this->settlements_sum_final_payment
            ),

            'notes' => $this->notes,
            'attachment_urls' => $this->attachment_urls ? explode('|', $this->attachment_urls) : [],

            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }

    protected function getContractStatus(): string
    {
        if (!$this->contract_start || !$this->contract_end) {
            return 'no_contract';
        }

        $now = now();
        if ($now->lt($this->contract_start)) {
            return 'pending';
        } elseif ($now->gt($this->contract_end)) {
            return 'expired';
        } else {
            $daysLeft = $now->diffInDays($this->contract_end);
            if ($daysLeft <= 30) {
                return 'expiring_soon';
            }
            return 'active';
        }
    }
}

