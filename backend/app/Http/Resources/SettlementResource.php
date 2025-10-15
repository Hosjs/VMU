<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SettlementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isAdmin = $request->user()?->role?->name === 'admin';

        return [
            'id' => $this->id,
            'settlement_number' => $this->settlement_number,
            'type' => $this->type,
            'status' => $this->status,
            'payment_status' => $this->payment_status,

            // Relations
            'order' => new OrderResource($this->whenLoaded('order')),
            'invoice' => new InvoiceResource($this->whenLoaded('invoice')),
            'provider' => new ProviderResource($this->whenLoaded('provider')),

            // Provider Info (Snapshot)
            'provider_name' => $this->provider_name,
            'provider_code' => $this->provider_code,
            'provider_contact' => $this->provider_contact,
            'provider_phone' => $this->provider_phone,
            'provider_email' => $this->provider_email,
            'provider_address' => $this->provider_address,
            'provider_tax_code' => $this->provider_tax_code,
            'provider_bank_account' => $this->when($isAdmin, $this->provider_bank_account),

            // Work Info
            'work_description' => $this->work_description,
            'work_start_date' => $this->work_start_date?->format('Y-m-d'),
            'work_completion_date' => $this->work_completion_date?->format('Y-m-d'),

            // Financial (Settlement with Partner)
            'settlement_subtotal' => (float) $this->settlement_subtotal,
            'settlement_tax_amount' => (float) $this->settlement_tax_amount,
            'settlement_tax_percent' => (float) $this->settlement_tax_percent,
            'settlement_total' => (float) $this->settlement_total,

            // Fees & Deductions
            'commission_amount' => (float) $this->commission_amount,
            'commission_percent' => (float) $this->commission_percent,
            'deduction_amount' => (float) $this->deduction_amount,
            'final_payment' => (float) $this->final_payment,

            // Profit Analysis (Admin Only)
            'customer_quoted_total' => $this->when($isAdmin, (float) $this->customer_quoted_total),
            'profit_margin' => $this->when($isAdmin, (float) $this->profit_margin),
            'profit_percent' => $this->when($isAdmin, (float) $this->profit_percent),

            // Payment Info
            'paid_amount' => (float) $this->paid_amount,
            'remaining_amount' => (float) ($this->final_payment - $this->paid_amount),
            'payment_method' => $this->payment_method,
            'payment_due_date' => $this->payment_due_date?->format('Y-m-d'),
            'payment_date' => $this->payment_date?->format('Y-m-d'),
            'days_until_due' => $this->payment_due_date ? $this->payment_due_date->diffInDays(now(), false) : null,
            'is_overdue' => $this->payment_due_date ? $this->payment_due_date->isPast() && $this->payment_status !== 'paid' : false,

            // Staff
            'creator' => new UserResource($this->whenLoaded('creator')),
            'approver' => new UserResource($this->whenLoaded('approver')),
            'accountant' => new UserResource($this->whenLoaded('accountant')),
            'approved_at' => $this->approved_at?->format('Y-m-d H:i:s'),

            // Payments
            'settlement_payments' => SettlementPaymentResource::collection($this->whenLoaded('settlementPayments')),
            'payments_count' => $this->whenCounted('settlementPayments'),

            // Notes & Documents
            'notes' => $this->notes,
            'provider_notes' => $this->provider_notes,
            'attachment_urls' => $this->attachment_urls ? explode('|', $this->attachment_urls) : [],
            'work_evidence_urls' => $this->work_evidence_urls ? explode('|', $this->work_evidence_urls) : [],

            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}

