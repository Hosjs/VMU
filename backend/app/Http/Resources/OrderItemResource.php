<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  Request  $request
     * @return array
     */
    public function toArray($request)
    {
        $isAdmin = $request->user()?->role?->name === 'admin';

        return [
            'id' => $this->id,
            'order_id' => $this->order_id,
            'item_type' => $this->item_type,
            'item_name' => $this->item_name,
            'item_code' => $this->item_code,
            'item_description' => $this->item_description,

            // Quantity & Unit
            'quantity' => (float) $this->quantity,
            'unit' => $this->unit,

            // Pricing (Customer Quote)
            'quote_unit_price' => (float) $this->quote_unit_price,
            'quote_total_price' => (float) $this->quote_total_price,

            // Pricing (Settlement - Admin Only)
            'settlement_unit_price' => $this->when($isAdmin, (float) $this->settlement_unit_price),
            'settlement_total_price' => $this->when($isAdmin, (float) $this->settlement_total_price),
            'profit' => $this->when($isAdmin, (float) ($this->quote_total_price - $this->settlement_total_price)),

            // Discount
            'discount_amount' => (float) $this->discount_amount,
            'discount_percent' => (float) $this->discount_percent,

            // Status & Assignment
            'status' => $this->status,
            'assigned_technician' => new UserResource($this->whenLoaded('assignedTechnician')),

            // Partner Technician Info
            'partner_technician_id' => $this->partner_technician_id,
            'partner_technician_name' => $this->partner_technician_name,

            // Timing
            'start_time' => $this->start_time?->format('Y-m-d H:i:s'),
            'completion_time' => $this->completion_time?->format('Y-m-d H:i:s'),
            'actual_duration' => $this->actual_duration,

            // Warranty
            'has_warranty' => (bool) $this->has_warranty,
            'warranty_months' => $this->warranty_months,
            'warranty_start_date' => $this->warranty_start_date?->format('Y-m-d'),
            'warranty_end_date' => $this->warranty_end_date?->format('Y-m-d'),

            // Relations
            'service' => new ServiceResource($this->whenLoaded('service')),
            'product' => new ProductResource($this->whenLoaded('product')),

            'notes' => $this->notes,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
