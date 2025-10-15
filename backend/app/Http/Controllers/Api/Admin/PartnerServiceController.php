<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\PartnerServiceQuotation;
use App\Models\PartnerPayment;
use App\Models\ServiceRequest;
use App\Models\Provider;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class PartnerServiceController extends Controller
{
    /**
     * Tạo báo giá từ gara liên kết
     */
    public function createQuotation(Request $request): JsonResponse
    {
        $request->validate([
            'service_request_id' => 'required|exists:service_requests,id',
            'provider_id' => 'required|exists:providers,id',
            'quotation_type' => 'required|in:service_only,service_with_parts,parts_only',
            'service_cost' => 'required|numeric|min:0',
            'parts_cost' => 'required|numeric|min:0',
            'commission_rate' => 'numeric|min:0|max:100',
            'parts_list' => 'nullable|array',
            'notes' => 'nullable|string'
        ]);

        DB::beginTransaction();
        try {
            $quotation = PartnerServiceQuotation::create([
                'service_request_id' => $request->service_request_id,
                'provider_id' => $request->provider_id,
                'quotation_type' => $request->quotation_type,
                'service_cost' => $request->service_cost,
                'parts_cost' => $request->parts_cost,
                'total_cost' => $request->service_cost + $request->parts_cost,
                'commission_rate' => $request->commission_rate ?? 0,
                'viet_nga_pays_directly' => true,
                'status' => 'draft',
                'created_by' => Auth::id(),
                'parts_list' => $request->parts_list,
                'notes' => $request->notes
            ]);

            // Tính hoa hồng
            $quotation->calculateCommission();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Tạo báo giá thành công',
                'data' => $quotation->load(['serviceRequest', 'provider', 'creator'])
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi tạo báo giá: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Duyệt báo giá
     */
    public function approveQuotation(Request $request, $id): JsonResponse
    {
        $quotation = PartnerServiceQuotation::findOrFail($id);

        if ($quotation->status !== 'sent') {
            return response()->json([
                'success' => false,
                'message' => 'Chỉ có thể duyệt báo giá ở trạng thái "sent"'
            ], 400);
        }

        $quotation->approve(Auth::id());

        return response()->json([
            'success' => true,
            'message' => 'Duyệt báo giá thành công',
            'data' => $quotation->fresh()
        ]);
    }

    /**
     * Tạo thanh toán cho gara liên kết
     */
    public function createPayment(Request $request): JsonResponse
    {
        $request->validate([
            'quotation_id' => 'required|exists:partner_service_quotations,id',
            'payment_method' => 'required|in:bank_transfer,cash,check',
            'payment_date' => 'required|date',
            'bank_name' => 'required_if:payment_method,bank_transfer',
            'account_number' => 'required_if:payment_method,bank_transfer',
            'account_holder' => 'required_if:payment_method,bank_transfer',
            'notes' => 'nullable|string'
        ]);

        $quotation = PartnerServiceQuotation::findOrFail($request->quotation_id);

        if ($quotation->status !== 'executed') {
            return response()->json([
                'success' => false,
                'message' => 'Chỉ có thể tạo thanh toán cho báo giá đã thực hiện'
            ], 400);
        }

        // Kiểm tra đã có thanh toán chưa
        if ($quotation->payment) {
            return response()->json([
                'success' => false,
                'message' => 'Báo giá này đã có thanh toán'
            ], 400);
        }

        DB::beginTransaction();
        try {
            $payment = PartnerPayment::create([
                'quotation_id' => $quotation->id,
                'provider_id' => $quotation->provider_id,
                'service_amount' => $quotation->service_cost,
                'parts_amount' => $quotation->parts_cost,
                'commission_amount' => $quotation->commission_amount,
                'total_amount' => $quotation->total_cost + $quotation->commission_amount,
                'payment_method' => $request->payment_method,
                'payment_date' => $request->payment_date,
                'bank_name' => $request->bank_name,
                'account_number' => $request->account_number,
                'account_holder' => $request->account_holder,
                'notes' => $request->notes,
                'status' => 'pending'
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Tạo thanh toán thành công',
                'data' => $payment->load(['quotation', 'provider'])
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi tạo thanh toán: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xử lý thanh toán
     */
    public function processPayment(Request $request, $id): JsonResponse
    {
        $request->validate([
            'transaction_reference' => 'nullable|string',
            'notes' => 'nullable|string'
        ]);

        $payment = PartnerPayment::findOrFail($id);

        if (!$payment->process(Auth::id())) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xử lý thanh toán này'
            ], 400);
        }

        // Cập nhật thông tin giao dịch
        $payment->update([
            'transaction_reference' => $request->transaction_reference,
            'notes' => $payment->notes . "\n" . $request->notes
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Xử lý thanh toán thành công',
            'data' => $payment->fresh()
        ]);
    }

    /**
     * Hoàn thành thanh toán
     */
    public function completePayment($id): JsonResponse
    {
        $payment = PartnerPayment::findOrFail($id);

        if (!$payment->complete()) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể hoàn thành thanh toán này'
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'Hoàn thành thanh toán thành công',
            'data' => $payment->fresh()
        ]);
    }

    /**
     * Lấy danh sách báo giá theo gara liên kết
     */
    public function getQuotationsByProvider($providerId): JsonResponse
    {
        $quotations = PartnerServiceQuotation::with(['serviceRequest', 'creator', 'approver'])
            ->byProvider($providerId)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $quotations
        ]);
    }

    /**
     * Lấy danh sách thanh toán theo gara liên kết
     */
    public function getPaymentsByProvider($providerId): JsonResponse
    {
        $payments = PartnerPayment::with(['quotation.serviceRequest', 'processor'])
            ->byProvider($providerId)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $payments
        ]);
    }

    /**
     * Báo cáo tổng hợp chi phí gara liên kết
     */
    public function getPartnerCostReport(Request $request): JsonResponse
    {
        $request->validate([
            'from_date' => 'required|date',
            'to_date' => 'required|date|after_or_equal:from_date',
            'provider_id' => 'nullable|exists:providers,id'
        ]);

        $query = PartnerPayment::with(['provider', 'quotation.serviceRequest'])
            ->whereBetween('payment_date', [$request->from_date, $request->to_date])
            ->where('status', 'completed');

        if ($request->provider_id) {
            $query->where('provider_id', $request->provider_id);
        }

        $payments = $query->get();

        $summary = [
            'total_payments' => $payments->count(),
            'total_service_cost' => $payments->sum('service_amount'),
            'total_parts_cost' => $payments->sum('parts_amount'),
            'total_commission' => $payments->sum('commission_amount'),
            'total_amount' => $payments->sum('total_amount'),
            'by_provider' => $payments->groupBy('provider.name')->map(function ($group) {
                return [
                    'payments_count' => $group->count(),
                    'service_cost' => $group->sum('service_amount'),
                    'parts_cost' => $group->sum('parts_amount'),
                    'commission' => $group->sum('commission_amount'),
                    'total' => $group->sum('total_amount')
                ];
            })
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'summary' => $summary,
                'payments' => $payments
            ]
        ]);
    }
}
