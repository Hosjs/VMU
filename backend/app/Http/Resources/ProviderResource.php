<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProviderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isAdmin = $request->user()?->role?->name === 'admin';

        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'business_name' => $this->business_name,
            'tax_code' => $this->tax_code,
            'provider_type' => $this->provider_type,

            // Contact Info
            'contact_person' => $this->contact_person,
            'phone' => $this->phone,
            'email' => $this->email,
            'address' => $this->address,
            'website' => $this->website,

            // Banking Info (Admin Only)
            'bank_name' => $this->when($isAdmin, $this->bank_name),
            'bank_account' => $this->when($isAdmin, $this->bank_account),
            'bank_branch' => $this->when($isAdmin, $this->bank_branch),

            // Service Types (for garage partners)
            'service_types' => $this->service_types ? explode(',', $this->service_types) : [],
            'specializations' => $this->specializations ? explode(',', $this->specializations) : [],

            // Partnership Terms (Admin Only)
            'commission_rate' => $this->when($isAdmin, (float) $this->commission_rate),
            'payment_terms' => $this->payment_terms,
            'credit_limit' => $this->when($isAdmin, (float) $this->credit_limit),
            'payment_method' => $this->payment_method,

            // Performance Metrics
            'rating' => (float) $this->rating,
            'completed_orders' => (int) $this->completed_orders,
            'average_completion_time' => (float) $this->average_completion_time,

            // Status
            'status' => $this->status,
            'contract_start' => $this->contract_start?->format('Y-m-d'),
            'contract_end' => $this->contract_end?->format('Y-m-d'),
            'is_contract_active' => $this->contract_end ? $this->contract_end->isFuture() : true,

            // Manager
            'manager' => new UserResource($this->whenLoaded('manager')),

            // Relations
            'warehouses' => WarehouseResource::collection($this->whenLoaded('warehouses')),
            'warehouses_count' => $this->whenCounted('warehouses'),
            'orders_count' => $this->whenCounted('orders'),
            'pending_settlements_count' => $this->whenCounted('pendingSettlements'),

            // Notes & Attachments
            'notes' => $this->notes,
            'attachment_urls' => $this->attachment_urls ? explode('|', $this->attachment_urls) : [],

            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}

