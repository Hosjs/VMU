<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    /**
     * Danh sách payments
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');
        $status = $request->get('status');
        $method = $request->get('method');
        $customerId = $request->get('customer_id');
        $dateFrom = $request->get('date_from');
        $dateTo = $request->get('date_to');

        $query = Payment::with(['customer', 'order', 'invoice', 'receivedBy']);

        // Search
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('payment_code', 'like', "%{$search}%")
                  ->orWhere('reference_number', 'like', "%{$search}%")
                  ->orWhereHas('customer', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by status
        if ($status) {
            $query->where('status', $status);
        }

        // Filter by method
        if ($method) {
            $query->where('method', $method);
        }

        // Filter by customer
        if ($customerId) {
            $query->where('customer_id', $customerId);
        }

        // Filter by date range
        if ($dateFrom && $dateTo) {
            $query->whereBetween('payment_date', [$dateFrom, $dateTo]);
        }

        // Sort
        $sortBy = $request->get('sort_by', 'payment_date');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $payments = $query->paginate($perPage);

        return response()->json($payments);
    }

    /**
     * Xem chi tiết payment
     */
    public function show($id)
    {
        $payment = Payment::with([
            'customer',
            'order',
            'invoice',
            'receivedBy',
        ])->find($id);

        if (!$payment) {
            return response()->json([
                'success' => false,
                'message' => 'Payment not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $payment,
        ]);
    }

    /**
     * Xác nhận payment
     */
    public function confirm(Request $request, $id)
    {
        $payment = Payment::find($id);

        if (!$payment) {
            return response()->json([
                'success' => false,
                'message' => 'Payment not found'
            ], 404);
        }

        if ($payment->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Only pending payments can be confirmed'
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'confirmed_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = [
                'status' => 'completed',
                'received_by' => auth()->id(),
            ];

            if ($request->filled('confirmed_amount')) {
                $data['amount'] = $request->confirmed_amount;
            }

            if ($request->filled('notes')) {
                $data['notes'] = $payment->notes . "\n" . now()->format('Y-m-d H:i') . " - Confirmed: " . $request->notes;
            }

            $payment->update($data);

            // Update order payment status if needed
            if ($payment->order) {
                $totalPaid = $payment->order->payments()->where('status', 'completed')->sum('amount');

                if ($totalPaid >= $payment->order->final_amount) {
                    $payment->order->update(['payment_status' => 'paid']);
                } elseif ($totalPaid > 0) {
                    $payment->order->update(['payment_status' => 'partial']);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Payment confirmed successfully',
                'data' => $payment,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to confirm payment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Hủy payment
     */
    public function cancel(Request $request, $id)
    {
        $payment = Payment::find($id);

        if (!$payment) {
            return response()->json([
                'success' => false,
                'message' => 'Payment not found'
            ], 404);
        }

        if ($payment->status === 'completed') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot cancel completed payment. Please create a refund instead.'
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'cancel_reason' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $payment->update([
                'status' => 'cancelled',
                'notes' => $payment->notes . "\n" . now()->format('Y-m-d H:i') . " - Cancelled: " . $request->cancel_reason,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Payment cancelled successfully',
                'data' => $payment,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel payment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Thống kê payments - Using Eloquent only (no DB::raw)
     */
    public function statistics(Request $request)
    {
        $dateFrom = $request->get('date_from', now()->startOfMonth());
        $dateTo = $request->get('date_to', now()->endOfMonth());

        // Get payments by status using Collection methods
        $paymentsByStatus = Payment::whereBetween('payment_date', [$dateFrom, $dateTo])
            ->get(['status'])
            ->groupBy('status')
            ->map(function($statusPayments, $status) {
                return [
                    'status' => $status,
                    'count' => $statusPayments->count(),
                ];
            })
            ->values();

        // Get payments by method using Collection methods
        $paymentsByMethod = Payment::whereBetween('payment_date', [$dateFrom, $dateTo])
            ->get(['payment_method'])
            ->groupBy('payment_method')
            ->map(function($methodPayments, $method) {
                return [
                    'method' => $method,
                    'count' => $methodPayments->count(),
                ];
            })
            ->values();

        $stats = [
            'total' => Payment::whereBetween('payment_date', [$dateFrom, $dateTo])->count(),
            'by_status' => $paymentsByStatus,
            'by_method' => $paymentsByMethod,
            'total_amount' => Payment::whereBetween('payment_date', [$dateFrom, $dateTo])
                ->where('status', 'completed')
                ->sum('amount'),
            'pending_amount' => Payment::whereBetween('payment_date', [$dateFrom, $dateTo])
                ->where('status', 'pending')
                ->sum('amount'),
            'cash_amount' => Payment::whereBetween('payment_date', [$dateFrom, $dateTo])
                ->where('status', 'completed')
                ->where('payment_method', 'cash')
                ->sum('amount'),
            'bank_amount' => Payment::whereBetween('payment_date', [$dateFrom, $dateTo])
                ->where('status', 'completed')
                ->where('payment_method', 'bank_transfer')
                ->sum('amount'),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}

