<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SettlementPaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'payment_number' => $this->payment_number,
            'amount' => (float) $this->amount,
            'payment_method' => $this->payment_method,
            'payment_date' => $this->payment_date?->format('Y-m-d'),
            'processed_at' => $this->processed_at?->format('Y-m-d H:i:s'),

            // Payment Details
            'reference_number' => $this->reference_number,
            'bank_name' => $this->bank_name,
            'account_number' => $this->account_number,
            'check_number' => $this->check_number,

            // Status
            'status' => $this->status,
            'approval_status' => $this->approval_status,

            // Relations
            'settlement' => new SettlementResource($this->whenLoaded('settlement')),
            'provider' => new ProviderResource($this->whenLoaded('provider')),

            // Staff
            'created_by_user' => new UserResource($this->whenLoaded('creator')),
            'approved_by_user' => new UserResource($this->whenLoaded('approver')),
            'processed_by_user' => new UserResource($this->whenLoaded('processor')),
            'approved_at' => $this->approved_at?->format('Y-m-d H:i:s'),

            // Approval
            'approval_notes' => $this->approval_notes,
            'rejection_reason' => $this->rejection_reason,

            // Provider Confirmation
            'provider_confirmed' => (bool) $this->provider_confirmed,
            'provider_confirmed_at' => $this->provider_confirmed_at?->format('Y-m-d H:i:s'),
            'provider_notes' => $this->provider_notes,

            'notes' => $this->notes,
            'attachment_urls' => $this->attachment_urls ? explode('|', $this->attachment_urls) : [],

            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}

