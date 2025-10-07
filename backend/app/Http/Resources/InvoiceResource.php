<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isAdmin = $request->user()?->role?->name === 'admin';

        return [
            'id' => $this->id,
            'invoice_number' => $this->invoice_number,
            'issuer' => $this->issuer,
            'admin_only_access' => (bool) $this->admin_only_access,

            // Customer Info
            'customer' => new CustomerResource($this->whenLoaded('customer')),
            'customer_name' => $this->customer_name,
            'customer_phone' => $this->customer_phone,
            'customer_email' => $this->customer_email,
            'customer_address' => $this->customer_address,
            'customer_tax_code' => $this->customer_tax_code,

            // Vehicle & Order
            'vehicle' => new VehicleResource($this->whenLoaded('vehicle')),
            'vehicle_info' => $this->vehicle_info,
            'order' => new OrderResource($this->whenLoaded('order')),

            // Financial Info
            'subtotal' => (float) $this->subtotal,
            'discount_amount' => (float) $this->discount_amount,
            'discount_percent' => (float) $this->discount_percent,
            'tax_amount' => (float) $this->tax_amount,
            'tax_percent' => (float) $this->tax_percent,
            'total_amount' => (float) $this->total_amount,
            'paid_amount' => (float) $this->paid_amount,
            'remaining_amount' => (float) $this->remaining_amount,

            // Cost & Profit (Admin Only)
            'actual_cost' => $this->when($isAdmin, (float) $this->actual_cost),
            'actual_profit' => $this->when($isAdmin, (float) $this->actual_profit),
            'partner_settlement_cost' => $this->when($isAdmin, (float) $this->partner_settlement_cost),
            'profit_margin' => $this->when($isAdmin && $this->total_amount > 0,
                round(($this->actual_profit / $this->total_amount) * 100, 2)
            ),

            // Status
            'status' => $this->status,
            'payment_status' => $this->payment_status,

            // Dates
            'invoice_date' => $this->invoice_date?->format('Y-m-d'),
            'due_date' => $this->due_date?->format('Y-m-d'),
            'days_until_due' => $this->due_date?->diffInDays(now(), false),
            'is_overdue' => $this->due_date ? $this->due_date->isPast() : false,

            // Warehouse
            'issuing_warehouse' => new WarehouseResource($this->whenLoaded('issuingWarehouse')),

            // Staff
            'created_by_user' => new UserResource($this->whenLoaded('creator')),
            'approved_by_user' => new UserResource($this->whenLoaded('approver')),
            'approved_at' => $this->approved_at?->format('Y-m-d H:i:s'),

            // Payments
            'payments' => PaymentResource::collection($this->whenLoaded('payments')),
            'payments_count' => $this->whenCounted('payments'),

            // Notes & Documents
            'notes' => $this->notes,
            'customer_notes' => $this->customer_notes,
            'terms_conditions' => $this->terms_conditions,
            'attachment_urls' => $this->attachment_urls ? explode('|', $this->attachment_urls) : [],

            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
