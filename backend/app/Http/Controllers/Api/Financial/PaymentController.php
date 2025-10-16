<?php

namespace App\Http\Controllers\Api\Financial;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Traits\HasPermissions;
use Illuminate\Http\Request;

/**
 * Payment Management Controller
 *
 * Quản lý thanh toán - Nghiệp vụ tài chính
 * Permissions: payments.*
 */
class PaymentController extends Controller
{
    use HasPermissions;

    /**
     * Danh sách thanh toán
     * Permission: payments.view
     */
    public function index(Request $request)
    {
        $this->authorizePermission('payments.view');

        $perPage = $request->input('per_page', 20);
        $status = $request->input('status');

        $query = Payment::with(['invoice', 'receivedBy']);

        if ($status) {
            $query->where('status', $status);
        }

        $payments = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $payments
        ]);
    }

    /**
     * Chi tiết thanh toán
     */
    public function show($id)
    {
        $this->authorizePermission('payments.view');

        $payment = Payment::with(['invoice.order', 'receivedBy'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $payment
        ]);
    }

    /**
     * Xác nhận thanh toán
     * Permission: payments.confirm
     */
    public function confirm(Request $request, $id)
    {
        $this->authorizePermission('payments.confirm');

        $payment = Payment::findOrFail($id);
        $payment->update([
            'status' => 'confirmed',
            'confirmed_by' => auth()->id(),
            'confirmed_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Xác nhận thanh toán thành công',
            'data' => $payment
        ]);
    }

    /**
     * Hủy thanh toán
     * Permission: payments.edit
     */
    public function cancel(Request $request, $id)
    {
        $this->authorizePermission('payments.edit');

        $payment = Payment::findOrFail($id);
        $payment->update([
            'status' => 'cancelled',
            'cancel_reason' => $request->reason
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Hủy thanh toán thành công'
        ]);
    }

    /**
     * Thống kê thanh toán
     */
    public function statistics()
    {
        $this->authorizePermission('payments.view');

        $total = Payment::where('status', 'confirmed')->sum('amount');
        $pending = Payment::where('status', 'pending')->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total_received' => $total,
                'pending_count' => $pending
            ]
        ]);
    }
}
