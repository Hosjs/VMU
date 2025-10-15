<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PartnerVehicleHandoverResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'handover_number' => $this->handover_number,
            'handover_type' => $this->handover_type,
            'status' => $this->status,

            // Relations
            'order' => new OrderResource($this->whenLoaded('order')),
            'vehicle' => new VehicleResource($this->whenLoaded('vehicle')),
            'provider' => new ProviderResource($this->whenLoaded('provider')),

            // Delivery Info
            'delivered_by' => new UserResource($this->whenLoaded('deliverer')),
            'delivered_by_name' => $this->delivered_by_name,
            'delivered_by_phone' => $this->delivered_by_phone,

            // Receiver Info
            'received_by_technician' => new UserResource($this->whenLoaded('receiverTechnician')),
            'received_by_name' => $this->received_by_name,
            'received_by_phone' => $this->received_by_phone,
            'received_by_position' => $this->received_by_position,
            'technician_license_number' => $this->technician_license_number,

            // Vehicle Condition
            'mileage' => (int) $this->mileage,
            'fuel_level' => (float) $this->fuel_level,
            'vehicle_condition' => $this->vehicle_condition,
            'included_items' => $this->included_items ? explode('|', $this->included_items) : [],
            'vehicle_documents' => $this->vehicle_documents ? explode('|', $this->vehicle_documents) : [],

            // Work Description
            'work_description' => $this->work_description,
            'special_instructions' => $this->special_instructions,
            'expected_completion' => $this->expected_completion?->format('Y-m-d H:i:s'),

            // Images
            'handover_image_urls' => $this->handover_image_urls ? explode('|', $this->handover_image_urls) : [],
            'damage_image_urls' => $this->damage_image_urls ? explode('|', $this->damage_image_urls) : [],

            // Signatures & Acknowledgment
            'delivered_by_signature' => $this->delivered_by_signature,
            'received_by_signature' => $this->received_by_signature,
            'is_acknowledged' => (bool) $this->is_acknowledged,
            'acknowledged_at' => $this->acknowledged_at?->format('Y-m-d H:i:s'),

            // Notes
            'delivery_notes' => $this->delivery_notes,
            'receive_notes' => $this->receive_notes,
            'admin_notes' => $this->admin_notes,

            // Dates
            'handover_date' => $this->handover_date?->format('Y-m-d H:i:s'),
            'planned_return_date' => $this->planned_return_date?->format('Y-m-d H:i:s'),

            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}

