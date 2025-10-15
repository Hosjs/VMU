<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\SettlementResource;
use App\Models\Settlement;
use App\Models\Order;
use App\Models\Invoice;
use App\Models\Provider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class SettlementController extends Controller
{
    /**
     * Danh sách quyết toán
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');
        $status = $request->get('status');
        $paymentStatus = $request->get('payment_status');
        $providerId = $request->get('provider_id');
        $type = $request->get('type');
        $dateFrom = $request->get('date_from');
        $dateTo = $request->get('date_to');

        $query = Settlement::with([
            'order.customer',
            'invoice',
            'provider',
            'creator',
            'approver',
            'accountant'
        ]);

        // Search
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('settlement_number', 'like', "%{$search}%")
                  ->orWhere('provider_name', 'like', "%{$search}%")
                  ->orWhereHas('order', function($q) use ($search) {
                      $q->where('order_number', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by status
        if ($status) {
            $query->where('status', $status);
        }

        // Filter by payment status
        if ($paymentStatus) {
            $query->where('payment_status', $paymentStatus);
        }

        // Filter by provider
        if ($providerId) {
            $query->where('provider_id', $providerId);
        }

        // Filter by type
        if ($type) {
            $query->where('type', $type);
        }

        // Filter by date range
        if ($dateFrom && $dateTo) {
            $query->whereBetween('created_at', [$dateFrom, $dateTo]);
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $settlements = $query->paginate($perPage);

        return SettlementResource::collection($settlements);
    }

    /**
     * Xem chi tiết quyết toán
     */
    public function show($id)
    {
        $settlement = Settlement::with([
            'order.customer',
            'order.orderItems',
            'invoice',
            'provider',
            'creator',
            'approver',
            'accountant',
            'settlementPayments'
        ])->findOrFail($id);

        return new SettlementResource($settlement);
    }

    /**
     * Tạo phiếu quyết toán mới
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|exists:orders,id',
            'invoice_id' => 'nullable|exists:invoices,id',
            'provider_id' => 'required|exists:providers,id',
            'type' => 'required|in:service,product,mixed',
            'work_description' => 'required|string',
            'work_start_date' => 'nullable|date',
            'work_completion_date' => 'nullable|date',
            'settlement_subtotal' => 'required|numeric|min:0',
            'settlement_tax_percent' => 'nullable|numeric|min:0|max:100',
            'commission_percent' => 'nullable|numeric|min:0|max:100',
            'deduction_amount' => 'nullable|numeric|min:0',
            'payment_method' => 'nullable|in:cash,transfer,check',
            'payment_due_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'provider_notes' => 'nullable|string',
            'attachment_urls' => 'nullable|string',
            'work_evidence_urls' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Generate settlement number
            $year = date('Y');
            $month = date('m');
            $lastSettlement = Settlement::whereYear('created_at', $year)
                ->whereMonth('created_at', $month)
                ->orderBy('id', 'desc')
                ->first();

            $sequence = $lastSettlement ? (int)substr($lastSettlement->settlement_number, -4) + 1 : 1;
            $settlementNumber = 'ST-' . $year . $month . '-' . str_pad($sequence, 4, '0', STR_PAD_LEFT);

            // Get provider info
            $provider = Provider::findOrFail($request->provider_id);
            $order = Order::findOrFail($request->order_id);

            // Calculate amounts
            $settlementTaxPercent = $request->settlement_tax_percent ?? 10;
            $settlementTaxAmount = $request->settlement_subtotal * ($settlementTaxPercent / 100);
            $settlementTotal = $request->settlement_subtotal + $settlementTaxAmount;

            $commissionPercent = $request->commission_percent ?? $provider->commission_rate ?? 0;
            $commissionAmount = $settlementTotal * ($commissionPercent / 100);
            $deductionAmount = $request->deduction_amount ?? 0;
            $finalPayment = $settlementTotal - $commissionAmount - $deductionAmount;

            // Calculate profit
            $customerQuotedTotal = $order->quote_total;
            $profitMargin = $customerQuotedTotal - $settlementTotal;
            $profitPercent = $customerQuotedTotal > 0 ? ($profitMargin / $customerQuotedTotal) * 100 : 0;

            $data = array_merge($request->all(), [
                'settlement_number' => $settlementNumber,
                'provider_name' => $provider->name,
                'provider_code' => $provider->code,
                'provider_contact' => $provider->contact_person,
                'provider_phone' => $provider->phone,
                'provider_email' => $provider->email,
                'provider_address' => $provider->address,
                'provider_tax_code' => $provider->tax_code,
                'provider_bank_account' => $provider->bank_account,
                'settlement_tax_amount' => $settlementTaxAmount,
                'settlement_tax_percent' => $settlementTaxPercent,
                'settlement_total' => $settlementTotal,
                'commission_amount' => $commissionAmount,
                'commission_percent' => $commissionPercent,
                'final_payment' => $finalPayment,
                'customer_quoted_total' => $customerQuotedTotal,
                'profit_margin' => $profitMargin,
                'profit_percent' => $profitPercent,
                'status' => 'draft',
                'payment_status' => 'unpaid',
                'paid_amount' => 0,
                'created_by' => $request->user()->id,
            ]);

            $settlement = Settlement::create($data);

            DB::commit();

            $settlement->load(['order', 'provider', 'creator']);

            return response()->json([
                'success' => true,
                'message' => 'Settlement created successfully',
                'data' => new SettlementResource($settlement),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create settlement: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cập nhật quyết toán
     */
    public function update(Request $request, $id)
    {
        $settlement = Settlement::findOrFail($id);

        // Only allow update if not approved yet
        if (in_array($settlement->status, ['approved', 'paid', 'completed'])) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot update approved or paid settlement'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'work_description' => 'nullable|string',
            'work_start_date' => 'nullable|date',
            'work_completion_date' => 'nullable|date',
            'settlement_subtotal' => 'nullable|numeric|min:0',
            'settlement_tax_percent' => 'nullable|numeric|min:0|max:100',
            'commission_percent' => 'nullable|numeric|min:0|max:100',
            'deduction_amount' => 'nullable|numeric|min:0',
            'payment_method' => 'nullable|in:cash,transfer,check',
            'payment_due_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'provider_notes' => 'nullable|string',
            'attachment_urls' => 'nullable|string',
            'work_evidence_urls' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Recalculate if subtotal changed
            if ($request->has('settlement_subtotal')) {
                $settlementTaxPercent = $request->settlement_tax_percent ?? $settlement->settlement_tax_percent;
                $settlementTaxAmount = $request->settlement_subtotal * ($settlementTaxPercent / 100);
                $settlementTotal = $request->settlement_subtotal + $settlementTaxAmount;

                $commissionPercent = $request->commission_percent ?? $settlement->commission_percent;
                $commissionAmount = $settlementTotal * ($commissionPercent / 100);
                $deductionAmount = $request->deduction_amount ?? $settlement->deduction_amount;
                $finalPayment = $settlementTotal - $commissionAmount - $deductionAmount;

                $profitMargin = $settlement->customer_quoted_total - $settlementTotal;
                $profitPercent = $settlement->customer_quoted_total > 0
                    ? ($profitMargin / $settlement->customer_quoted_total) * 100
                    : 0;

                $request->merge([
                    'settlement_tax_amount' => $settlementTaxAmount,
                    'settlement_total' => $settlementTotal,
                    'commission_amount' => $commissionAmount,
                    'final_payment' => $finalPayment,
                    'profit_margin' => $profitMargin,
                    'profit_percent' => $profitPercent,
                ]);
            }

            $settlement->update($request->all());
            $settlement->load(['order', 'provider']);

            return response()->json([
                'success' => true,
                'message' => 'Settlement updated successfully',
                'data' => new SettlementResource($settlement),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update settlement: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Phê duyệt quyết toán
     */
    public function approve(Request $request, $id)
    {
        $settlement = Settlement::findOrFail($id);

        if ($settlement->status !== 'pending_approval') {
            return response()->json([
                'success' => false,
                'message' => 'Only pending settlements can be approved'
            ], 403);
        }

        try {
            $settlement->update([
                'status' => 'approved',
                'approved_by' => $request->user()->id,
                'approved_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Settlement approved successfully',
                'data' => new SettlementResource($settlement),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to approve settlement: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xóa quyết toán
     */
    public function destroy($id)
    {
        try {
            $settlement = Settlement::findOrFail($id);

            // Only allow deletion if status is draft
            if ($settlement->status !== 'draft') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only draft settlements can be deleted'
                ], 403);
            }

            $settlement->delete();

            return response()->json([
                'success' => true,
                'message' => 'Settlement deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete settlement: ' . $e->getMessage()
            ], 500);
        }
    }
}

