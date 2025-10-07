<?php

namespace App\Models;

use App\QueryScopes\SettlementScopes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Settlement extends Model
{
    use HasFactory, SettlementScopes;

    protected $fillable = [
        'settlement_number',
        'order_id',
        'invoice_id',
        'provider_id',
        'provider_name',
        'provider_code',
        'provider_contact',
        'provider_phone',
        'provider_email',
        'provider_address',
        'provider_tax_code',
        'provider_bank_account',
        'type',
        'work_description',
        'work_start_date',
        'work_completion_date',
        'settlement_subtotal',
        'settlement_tax_amount',
        'settlement_tax_percent',
        'settlement_total',
        'commission_amount',
        'commission_percent',
        'deduction_amount',
        'final_payment',
        'customer_quoted_total',
        'profit_margin',
        'profit_percent',
        'status',
        'payment_status',
        'paid_amount',
        'payment_method',
        'payment_due_date',
        'payment_date',
        'created_by',
        'approved_by',
        'accountant_id',
        'approved_at',
        'notes',
        'provider_notes',
        'attachment_urls',
        'work_evidence_urls',
    ];

    protected $casts = [
        'work_start_date' => 'date',
        'work_completion_date' => 'date',
        'settlement_subtotal' => 'decimal:2',
        'settlement_tax_amount' => 'decimal:2',
        'settlement_tax_percent' => 'decimal:2',
        'settlement_total' => 'decimal:2',
        'commission_amount' => 'decimal:2',
        'commission_percent' => 'decimal:2',
        'deduction_amount' => 'decimal:2',
        'final_payment' => 'decimal:2',
        'customer_quoted_total' => 'decimal:2',
        'profit_margin' => 'decimal:2',
        'profit_percent' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'payment_due_date' => 'date',
        'payment_date' => 'date',
        'approved_at' => 'datetime',
    ];

    // =====================
    // RELATIONSHIPS
    // =====================

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    public function provider()
    {
        return $this->belongsTo(Provider::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function accountant()
    {
        return $this->belongsTo(User::class, 'accountant_id');
    }

    public function settlementPayments()
    {
        return $this->hasMany(SettlementPayment::class);
    }
}

