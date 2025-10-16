<?php

namespace App\Http\Controllers\Api\Financial;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Traits\HasPermissions;
use Illuminate\Http\Request;

/**
 * Invoice Management Controller
 *
 * Quản lý hóa đơn - Nghiệp vụ tài chính
 * Permissions: invoices.*
 */
class InvoiceController extends Controller
{
    use HasPermissions;

    /**
     * Danh sách hóa đơn
     * Permission: invoices.view
     */
    public function index(Request $request)
    {
        $this->authorizePermission('invoices.view');

        $perPage = $request->input('per_page', 20);
        $status = $request->input('status');
        $paymentStatus = $request->input('payment_status');

        $query = Invoice::with(['order', 'customer', 'createdBy', 'approvedBy']);

        if ($status) {
            $query->where('status', $status);
        }

        if ($paymentStatus) {
            $query->where('payment_status', $paymentStatus);
        }

        $invoices = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $invoices
        ]);
    }

    /**
     * Chi tiết hóa đơn
     */
    public function show($id)
    {
        $this->authorizePermission('invoices.view');

        $invoice = Invoice::with(['order.items', 'customer', 'payments'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $invoice
        ]);
    }

    /**
     * Cập nhật trạng thái hóa đơn
     * Permission: invoices.edit hoặc invoices.approve
     */
    public function updateStatus(Request $request, $id)
    {
        $this->authorizeAnyPermission(['invoices.edit', 'invoices.approve']);

        $invoice = Invoice::findOrFail($id);
        $invoice->update([
            'status' => $request->status,
            'approved_by' => auth()->id(),
            'approved_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật trạng thái thành công',
            'data' => $invoice
        ]);
    }

    /**
     * Hủy hóa đơn
     * Permission: invoices.cancel
     */
    public function cancel(Request $request, $id)
    {
        $this->authorizePermission('invoices.cancel');

        $invoice = Invoice::findOrFail($id);
        $invoice->update([
            'status' => 'cancelled',
            'cancel_reason' => $request->reason
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Hủy hóa đơn thành công'
        ]);
    }

    /**
     * Thống kê hóa đơn
     */
    public function statistics()
    {
        $this->authorizePermission('invoices.view');

        $total = Invoice::count();
        $totalAmount = Invoice::sum('total_amount');
        $pending = Invoice::where('payment_status', 'pending')->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total' => $total,
                'total_amount' => $totalAmount,
                'pending_payment' => $pending
            ]
        ]);
    }
}

