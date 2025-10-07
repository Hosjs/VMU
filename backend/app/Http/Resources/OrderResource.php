<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'type' => $this->type,
            'status' => $this->status,
            'payment_status' => $this->payment_status,
            'payment_method' => $this->payment_method,

            // Financial Info
            'quote_total' => (float) $this->quote_total,
            'settlement_total' => (float) $this->settlement_total,
            'discount' => (float) $this->discount,
            'tax_amount' => (float) $this->tax_amount,
            'final_amount' => (float) $this->final_amount,
            'paid_amount' => (float) $this->paid_amount,
            'remaining_amount' => $this->final_amount - $this->paid_amount,

            // Profit (Admin Only)
            'profit_margin' => $this->when(
                $request->user()?->role?->name === 'admin',
                (float) ($this->quote_total - $this->settlement_total)
            ),
            'profit_percentage' => $this->when(
                $request->user()?->role?->name === 'admin',
                $this->quote_total > 0 ? round((($this->quote_total - $this->settlement_total) / $this->quote_total) * 100, 2) : 0
            ),

            // Relations
            'customer' => new CustomerResource($this->whenLoaded('customer')),
            'vehicle' => new VehicleResource($this->whenLoaded('vehicle')),
            'service_request' => new ServiceRequestResource($this->whenLoaded('serviceRequest')),
            'order_items' => OrderItemResource::collection($this->whenLoaded('orderItems')),
            'salesperson' => new UserResource($this->whenLoaded('salesperson')),
            'technician' => new UserResource($this->whenLoaded('technician')),
            'accountant' => new UserResource($this->whenLoaded('accountant')),
            'partner_provider' => new ProviderResource($this->whenLoaded('partnerProvider')),

            // Partner Info
            'partner_coordinator_name' => $this->partner_coordinator_name,
            'partner_coordinator_phone' => $this->partner_coordinator_phone,

            // Dates
            'quote_date' => $this->quote_date?->format('Y-m-d H:i:s'),
            'confirmed_date' => $this->confirmed_date?->format('Y-m-d H:i:s'),
            'start_date' => $this->start_date?->format('Y-m-d H:i:s'),
            'completion_date' => $this->completion_date?->format('Y-m-d H:i:s'),
            'delivery_date' => $this->delivery_date?->format('Y-m-d H:i:s'),
            'partner_handover_date' => $this->partner_handover_date?->format('Y-m-d H:i:s'),
            'partner_return_date' => $this->partner_return_date?->format('Y-m-d H:i:s'),

            // Statistics
            'items_count' => $this->whenCounted('orderItems'),
            'total_items' => $this->order_items_sum_quantity ?? 0,
            'pending_items' => $this->whenLoaded('orderItems', function () {
                return $this->orderItems->where('status', 'pending')->count();
            }),
            'completed_items' => $this->whenLoaded('orderItems', function () {
                return $this->orderItems->where('status', 'completed')->count();
            }),

            // Notes & Attachments
            'notes' => $this->notes,
            'attachment_urls' => $this->attachment_urls ? explode('|', $this->attachment_urls) : [],

            // Timestamps
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
