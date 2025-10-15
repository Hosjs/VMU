<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PartnerQuoteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'quote_number' => $this->quote_number,

            // Provider information
            'provider_name' => $this->provider_name,
            'provider_code' => $this->provider_code,
            'provider_contact_person' => $this->provider_contact_person,
            'provider_phone' => $this->provider_phone,
            'provider_email' => $this->provider_email,

            // Request information
            'work_description' => $this->work_description,
            'special_requirements' => $this->special_requirements,
            'estimated_duration_hours' => $this->estimated_duration_hours,

            // Dates
            'request_date' => $this->request_date,
            'quote_date' => $this->quote_date,
            'quote_valid_until' => $this->quote_valid_until,
            'customer_quote_date' => $this->customer_quote_date,

            // Status
            'status' => $this->status,
            'priority' => $this->priority,

            // Calculated totals
            'total_partner_price' => $this->getTotalPartnerPrice(),
            'total_customer_price' => $this->getTotalCustomerPrice(),
            'total_profit' => $this->getTotalProfit(),
            'profit_margin' => $this->getProfitMargin(),

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            // Relationships
            'service_request' => new ServiceRequestResource($this->whenLoaded('serviceRequest')),
            'provider' => new ProviderResource($this->whenLoaded('provider')),
            'vehicle' => new VehicleResource($this->whenLoaded('vehicle')),
            'items' => PartnerQuoteItemResource::collection($this->whenLoaded('items')),
            'requested_by_user' => new UserResource($this->whenLoaded('requestedBy')),
        ];
    }
}

