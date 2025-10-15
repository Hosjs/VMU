<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PartnerQuoteItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'item_type' => $this->item_type,
            'item_name' => $this->item_name,
            'item_code' => $this->item_code,
            'description' => $this->description,

            'quantity' => $this->quantity,
            'unit' => $this->unit,

            // Partner pricing
            'partner_unit_price' => $this->partner_unit_price,
            'partner_total_price' => $this->partner_total_price,
            'partner_discount' => $this->partner_discount,

            // Customer pricing
            'customer_unit_price' => $this->customer_unit_price,
            'customer_total_price' => $this->customer_total_price,
            'customer_discount' => $this->customer_discount,

            // Profit
            'profit_amount' => $this->profit_amount,
            'profit_percent' => $this->profit_percent,

            // Warranty
            'has_warranty' => $this->has_warranty,
            'warranty_months' => $this->warranty_months,

            'estimated_duration_minutes' => $this->estimated_duration_minutes,

            'partner_notes' => $this->partner_notes,
            'internal_notes' => $this->internal_notes,

            'is_approved' => $this->is_approved,
            'is_required' => $this->is_required,
            'provided_by_partner' => $this->provided_by_partner,

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            // Relationships
            'service' => new ServiceResource($this->whenLoaded('service')),
            'product' => new ProductResource($this->whenLoaded('product')),
        ];
    }
}
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VehicleServiceHistoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'history_number' => $this->history_number,
            'type' => $this->type,
            'item_name' => $this->item_name,
            'item_code' => $this->item_code,
            'description' => $this->description,
            'quantity' => $this->quantity,
            'unit' => $this->unit,

            // Price information
            'quote_unit_price' => $this->quote_unit_price,
            'quote_total_price' => $this->quote_total_price,
            'settlement_unit_price' => $this->settlement_unit_price,
            'settlement_total_price' => $this->settlement_total_price,
            'actual_paid' => $this->actual_paid,

            // Vehicle information
            'mileage_at_service' => $this->mileage_at_service,
            'service_date' => $this->service_date,
            'service_start' => $this->service_start,
            'service_end' => $this->service_end,

            // Warranty information
            'has_warranty' => $this->has_warranty,
            'warranty_months' => $this->warranty_months,
            'warranty_start_date' => $this->warranty_start_date,
            'warranty_end_date' => $this->warranty_end_date,
            'warranty_status' => $this->warranty_status,

            // Maintenance information
            'is_maintenance' => $this->is_maintenance,
            'next_maintenance_mileage' => $this->next_maintenance_mileage,
            'next_maintenance_date' => $this->next_maintenance_date,

            // Rating
            'customer_rating' => $this->customer_rating,
            'customer_feedback' => $this->customer_feedback,

            // Images
            'before_images' => $this->before_images,
            'after_images' => $this->after_images,
            'documents' => $this->documents,

            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            // Relationships
            'vehicle' => new VehicleResource($this->whenLoaded('vehicle')),
            'customer' => new CustomerResource($this->whenLoaded('customer')),
            'service' => new ServiceResource($this->whenLoaded('service')),
            'product' => new ProductResource($this->whenLoaded('product')),
            'provider' => new ProviderResource($this->whenLoaded('provider')),
            'technician' => new UserResource($this->whenLoaded('technician')),
        ];
    }
}

