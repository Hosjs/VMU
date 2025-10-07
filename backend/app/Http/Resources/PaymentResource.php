<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'payment_number' => $this->payment_number,
            'amount' => (float) $this->amount,
            'payment_method' => $this->payment_method,
            'payment_date' => $this->payment_date?->format('Y-m-d'),
            'received_at' => $this->received_at?->format('Y-m-d H:i:s'),

            // Payment Details
            'reference_number' => $this->reference_number,
            'bank_name' => $this->bank_name,
            'account_number' => $this->account_number,
            'card_last_digits' => $this->card_last_digits,
            'wallet_type' => $this->wallet_type,

            // Status
            'status' => $this->status,
            'verification_status' => $this->verification_status,

            // Relations
            'invoice' => new InvoiceResource($this->whenLoaded('invoice')),
            'order' => new OrderResource($this->whenLoaded('order')),
            'customer' => new CustomerResource($this->whenLoaded('customer')),

            // Staff
            'received_by_user' => new UserResource($this->whenLoaded('receiver')),
            'verified_by_user' => new UserResource($this->whenLoaded('verifier')),
            'verified_at' => $this->verified_at?->format('Y-m-d H:i:s'),

            // Refund
            'refund_amount' => (float) $this->refund_amount,
            'refund_date' => $this->refund_date?->format('Y-m-d'),
            'refund_reason' => $this->refund_reason,
            'refunded_by_user' => new UserResource($this->whenLoaded('refunder')),

            // Notes
            'notes' => $this->notes,
            'customer_notes' => $this->customer_notes,
            'attachment_urls' => $this->attachment_urls ? explode('|', $this->attachment_urls) : [],

            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}

