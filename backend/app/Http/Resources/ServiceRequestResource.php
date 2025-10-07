<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'status' => $this->status,
            'priority' => $this->priority,

            // Customer Info
            'customer_name' => $this->customer_name,
            'customer_phone' => $this->customer_phone,
            'customer_email' => $this->customer_email,
            'customer_address' => $this->customer_address,
            'customer' => new CustomerResource($this->whenLoaded('customer')),

            // Vehicle Info
            'vehicle_brand' => $this->vehicle_brand,
            'vehicle_model' => $this->vehicle_model,
            'vehicle_name' => $this->vehicle_name,
            'license_plate' => $this->license_plate,
            'vehicle_year' => $this->vehicle_year,

            // Request Details
            'description' => $this->description,
            'preferred_date' => $this->preferred_date?->format('Y-m-d H:i:s'),

            // Assignment
            'assigned_to_user' => new UserResource($this->whenLoaded('assignedTo')),
            'admin_handler_user' => new UserResource($this->whenLoaded('adminHandler')),
            'selected_provider' => new ProviderResource($this->whenLoaded('selectedProvider')),

            // Services
            'requested_services' => ServiceRequestServiceResource::collection($this->whenLoaded('requestedServices')),
            'services_count' => $this->whenCounted('requestedServices'),

            // Timestamps
            'contacted_at' => $this->contacted_at?->format('Y-m-d H:i:s'),
            'scheduled_at' => $this->scheduled_at?->format('Y-m-d H:i:s'),

            'admin_notes' => $this->admin_notes,
            'attachment_urls' => $this->attachment_urls ? explode('|', $this->attachment_urls) : [],

            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
