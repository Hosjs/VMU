<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * Danh sách orders
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');
        $status = $request->get('status');
        $paymentStatus = $request->get('payment_status');
        $type = $request->get('type');
        $customerId = $request->get('customer_id');
        $dateFrom = $request->get('date_from');
        $dateTo = $request->get('date_to');

        $query = Order::with([
            'customer',
            'vehicle.brand',
            'vehicle.model',
            'salesperson',
            'technician',
            'orderItems'
        ]);

        // Search
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhereHas('customer', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
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

        // Filter by type
        if ($type) {
            $query->where('type', $type);
        }

        // Filter by customer
        if ($customerId) {
            $query->where('customer_id', $customerId);
        }

        // Filter by date range
        if ($dateFrom && $dateTo) {
            $query->whereBetween('created_at', [$dateFrom, $dateTo]);
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $orders = $query->paginate($perPage);

        return response()->json($orders);
    }

    /**
     * Xem chi tiết order
     */
    public function show($id)
    {
        $order = Order::with([
            'customer',
            'vehicle.brand',
            'vehicle.model',
            'serviceRequest',
            'orderItems.service',
            'orderItems.product',
            'salesperson',
            'technician',
            'accountant',
            'partnerProvider',
            'invoices',
            'payments',
        ])->find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $order,
        ]);
    }

    /**
     * Cập nhật trạng thái order
     */
    public function updateStatus(Request $request, $id)
    {
        $order = Order::find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,confirmed,in_progress,completed,cancelled,partner_processing,partner_completed',
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
            $data = ['status' => $request->status];

            // Update timestamps based on status
            switch ($request->status) {
                case 'confirmed':
                    $data['confirmed_date'] = now();
                    break;
                case 'in_progress':
                    $data['start_date'] = now();
                    break;
                case 'completed':
                case 'partner_completed':
                    $data['completion_date'] = now();
                    break;
            }

            if ($request->filled('notes')) {
                $data['notes'] = $order->notes . "\n" . now()->format('Y-m-d H:i') . " - " . $request->notes;
            }

            $order->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Order status updated successfully',
                'data' => $order,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update order status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cập nhật trạng thái thanh toán
     */
    public function updatePaymentStatus(Request $request, $id)
    {
        $order = Order::find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'payment_status' => 'required|in:unpaid,partial,paid,refunded',
            'paid_amount' => 'nullable|numeric|min:0',
            'payment_method' => 'nullable|string',
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
                'payment_status' => $request->payment_status,
            ];

            if ($request->filled('paid_amount')) {
                $data['paid_amount'] = $request->paid_amount;
            }

            if ($request->filled('payment_method')) {
                $data['payment_method'] = $request->payment_method;
            }

            $order->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Payment status updated successfully',
                'data' => $order,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update payment status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Gán nhân viên cho order
     */
    public function assignStaff(Request $request, $id)
    {
        $order = Order::find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'salesperson_id' => 'nullable|exists:users,id',
            'technician_id' => 'nullable|exists:users,id',
            'accountant_id' => 'nullable|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $order->update($request->only(['salesperson_id', 'technician_id', 'accountant_id']));

            $order->load(['salesperson', 'technician', 'accountant']);

            return response()->json([
                'success' => true,
                'message' => 'Staff assigned successfully',
                'data' => $order,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to assign staff',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Thống kê orders - Using Eloquent only (no DB::raw)
     */
    public function statistics(Request $request)
    {
        $dateFrom = $request->get('date_from', now()->startOfMonth());
        $dateTo = $request->get('date_to', now()->endOfMonth());

        // Get orders by status using Collection methods
        $ordersByStatus = Order::whereBetween('created_at', [$dateFrom, $dateTo])
            ->get(['status'])
            ->groupBy('status')
            ->map(function($statusOrders, $status) {
                return [
                    'status' => $status,
                    'count' => $statusOrders->count(),
                ];
            })
            ->values();

        // Get orders by payment status using Collection methods
        $ordersByPaymentStatus = Order::whereBetween('created_at', [$dateFrom, $dateTo])
            ->get(['payment_status'])
            ->groupBy('payment_status')
            ->map(function($paymentOrders, $paymentStatus) {
                return [
                    'payment_status' => $paymentStatus,
                    'count' => $paymentOrders->count(),
                ];
            })
            ->values();

        // Get orders by type using Collection methods
        $ordersByType = Order::whereBetween('created_at', [$dateFrom, $dateTo])
            ->get(['type'])
            ->groupBy('type')
            ->map(function($typeOrders, $type) {
                return [
                    'type' => $type,
                    'count' => $typeOrders->count(),
                ];
            })
            ->values();

        $stats = [
            'total' => Order::whereBetween('created_at', [$dateFrom, $dateTo])->count(),
            'by_status' => $ordersByStatus,
            'by_payment_status' => $ordersByPaymentStatus,
            'by_type' => $ordersByType,
            'total_revenue' => Order::whereBetween('created_at', [$dateFrom, $dateTo])
                ->where('payment_status', 'paid')
                ->sum('final_amount'),
            'pending_payment' => Order::whereBetween('created_at', [$dateFrom, $dateTo])
                ->whereIn('payment_status', ['unpaid', 'partial'])
                ->sum('final_amount'),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Hủy order
     */
    public function cancel(Request $request, $id)
    {
        $order = Order::find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);
        }

        if (in_array($order->status, ['completed', 'cancelled'])) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot cancel order with status: ' . $order->status
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
            $order->update([
                'status' => 'cancelled',
                'notes' => $order->notes . "\n" . now()->format('Y-m-d H:i') . " - Cancelled: " . $request->cancel_reason,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Order cancelled successfully',
                'data' => $order,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel order',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

