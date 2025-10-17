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
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');

        // ✅ 1 query duy nhất với eager loading tối ưu
        $query = Order::query()
            ->with(['customer:id,name,phone', 'vehicle:id,license_plate,brand,model',
                   'salesperson:id,name', 'technician:id,name'])
            ->withCount('items');

        // Scope by permission
        $query = $this->scopeByPermission(
            $query,
            'orders.manage_all',
            'orders.manage_own',
            'salesperson_id'
        );

        // Search - tối ưu với whereHas
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhereHas('customer', fn($q) => $q->where('name', 'like', "%{$search}%"));
            });
        }

        // Filters
        $query->when($status, fn($q) => $q->where('status', $status))
              ->when($type, fn($q) => $q->where('type', $type));

        // Sort
        $query->orderBy($sortBy, $sortDirection);

        // ✅ Trả về trực tiếp Laravel pagination
        return $query->paginate($perPage);
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

