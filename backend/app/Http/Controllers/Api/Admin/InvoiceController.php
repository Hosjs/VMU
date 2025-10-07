<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class InvoiceController extends Controller
{
    /**
     * Danh sách invoices
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');
        $status = $request->get('status');
        $type = $request->get('type');
        $customerId = $request->get('customer_id');
        $dateFrom = $request->get('date_from');
        $dateTo = $request->get('date_to');

        $query = Invoice::with(['customer', 'order', 'issuedBy']);

        // Search
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                  ->orWhereHas('customer', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by status
        if ($status) {
            $query->where('status', $status);
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
            $query->whereBetween('invoice_date', [$dateFrom, $dateTo]);
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $invoices = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $invoices,
        ]);
    }

    /**
     * Xem chi tiết invoice
     */
    public function show($id)
    {
        $invoice = Invoice::with([
            'customer',
            'order.orderItems',
            'issuedBy',
            'issuingWarehouse',
            'payments',
        ])->find($id);

        if (!$invoice) {
            return response()->json([
                'success' => false,
                'message' => 'Invoice not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $invoice,
        ]);
    }

    /**
     * Cập nhật trạng thái invoice
     */
    public function updateStatus(Request $request, $id)
    {
        $invoice = Invoice::find($id);

        if (!$invoice) {
            return response()->json([
                'success' => false,
                'message' => 'Invoice not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:draft,issued,paid,cancelled,refunded',
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

            if ($request->status === 'paid') {
                $data['paid_date'] = now();
            }

            if ($request->filled('notes')) {
                $data['notes'] = $invoice->notes . "\n" . now()->format('Y-m-d H:i') . " - " . $request->notes;
            }

            $invoice->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Invoice status updated successfully',
                'data' => $invoice,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update invoice status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Thống kê invoices
     */
    public function statistics(Request $request)
    {
        $dateFrom = $request->get('date_from', now()->startOfMonth());
        $dateTo = $request->get('date_to', now()->endOfMonth());

        $stats = [
            'total' => Invoice::whereBetween('invoice_date', [$dateFrom, $dateTo])->count(),
            'by_status' => Invoice::whereBetween('invoice_date', [$dateFrom, $dateTo])
                ->select('status', DB::raw('COUNT(*) as count'))
                ->groupBy('status')
                ->get(),
            'by_type' => Invoice::whereBetween('invoice_date', [$dateFrom, $dateTo])
                ->select('type', DB::raw('COUNT(*) as count'))
                ->groupBy('type')
                ->get(),
            'total_amount' => Invoice::whereBetween('invoice_date', [$dateFrom, $dateTo])
                ->sum('total_amount'),
            'paid_amount' => Invoice::whereBetween('invoice_date', [$dateFrom, $dateTo])
                ->where('status', 'paid')
                ->sum('total_amount'),
            'pending_amount' => Invoice::whereBetween('invoice_date', [$dateFrom, $dateTo])
                ->whereIn('status', ['draft', 'issued'])
                ->sum('total_amount'),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Hủy invoice
     */
    public function cancel(Request $request, $id)
    {
        $invoice = Invoice::find($id);

        if (!$invoice) {
            return response()->json([
                'success' => false,
                'message' => 'Invoice not found'
            ], 404);
        }

        if (in_array($invoice->status, ['paid', 'cancelled', 'refunded'])) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot cancel invoice with status: ' . $invoice->status
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
            $invoice->update([
                'status' => 'cancelled',
                'notes' => $invoice->notes . "\n" . now()->format('Y-m-d H:i') . " - Cancelled: " . $request->cancel_reason,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Invoice cancelled successfully',
                'data' => $invoice,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel invoice',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

