<?php

namespace App\Http\Controllers\Api\Sales;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Traits\HasPermissions;
use Illuminate\Http\Request;

/**
 * Order Management Controller
 *
 * Quản lý đơn hàng - Nghiệp vụ bán hàng
 * Permissions: orders.*
 */
class OrderController extends Controller
{
    use HasPermissions;

    /**
     * Danh sách đơn hàng
     * Permission: orders.view
     * Scope: orders.manage_all (xem tất cả) hoặc orders.manage_own (chỉ xem của mình)
     */
    public function index(Request $request)
    {
        $this->authorizePermission('orders.view');

        $perPage = $request->input('per_page', 20);
        $search = $request->input('search');
        $status = $request->input('status');
        $type = $request->input('type');

        $query = Order::with(['customer', 'vehicle', 'salesperson', 'technician']);

        // Scope by permission: manage_all hoặc manage_own
        $query = $this->scopeByPermission(
            $query,
            'orders.manage_all',
            'orders.manage_own',
            'salesperson_id' // Hoặc technician_id tùy context
        );

        // Search
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
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

        $orders = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    /**
     * Chi tiết đơn hàng
     * Permission: orders.view
     */
    public function show($id)
    {
        $this->authorizePermission('orders.view');

        $order = Order::with([
            'customer',
            'vehicle',
            'items.product',
            'items.service',
            'salesperson',
            'technician',
            'accountant'
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $order
        ]);
    }

    /**
     * Cập nhật trạng thái đơn hàng
     * Permission: orders.edit hoặc orders.approve
     */
    public function updateStatus(Request $request, $id)
    {
        $this->authorizeAnyPermission(['orders.edit', 'orders.approve']);

        $order = Order::findOrFail($id);
        $order->update([
            'status' => $request->status
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật trạng thái thành công',
            'data' => $order
        ]);
    }

    /**
     * Phân công nhân viên
     * Permission: orders.assign
     */
    public function assignStaff(Request $request, $id)
    {
        $this->authorizePermission('orders.assign');

        $order = Order::findOrFail($id);
        $order->update($request->only(['salesperson_id', 'technician_id', 'accountant_id']));

        return response()->json([
            'success' => true,
            'message' => 'Phân công nhân viên thành công',
            'data' => $order->load(['salesperson', 'technician', 'accountant'])
        ]);
    }

    /**
     * Hủy đơn hàng
     * Permission: orders.cancel
     */
    public function cancel(Request $request, $id)
    {
        $this->authorizePermission('orders.cancel');

        $order = Order::findOrFail($id);
        $order->update([
            'status' => 'cancelled',
            'cancel_reason' => $request->reason
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Hủy đơn hàng thành công',
            'data' => $order
        ]);
    }

    /**
     * Thống kê đơn hàng
     */
    public function statistics()
    {
        $this->authorizePermission('orders.view');

        $query = Order::query();

        // Scope by permission
        $query = $this->scopeByPermission(
            $query,
            'orders.manage_all',
            'orders.manage_own',
            'salesperson_id'
        );

        $total = $query->count();
        $byStatus = $query->groupBy('status')->selectRaw('status, count(*) as count')->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total' => $total,
                'by_status' => $byStatus
            ]
        ]);
    }
}

