<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Invoice;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Traits\HasPermissions;

class BadgeController extends Controller
{
    use HasPermissions;

    /**
     * Lấy số đếm cho tất cả badge trên sidebar
     * Số liệu động dựa theo permissions thực tế của user
     */
    public function getCounts(Request $request)
    {
        $user = Auth::user();

        $counts = [
            'orders' => $this->getOrdersCount($user),
            'invoices' => $this->getInvoicesCount($user),
            'service_requests' => $this->getServiceRequestsCount($user),
            'work_orders' => $this->getWorkOrdersCount($user),
            'notifications' => $user->notifications()->where('is_read', false)->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $counts,
        ]);
    }

    /**
     * Lấy số đếm cho một loại badge cụ thể
     */
    public function getCount(Request $request, $type)
    {
        $user = Auth::user();
        $count = 0;

        switch ($type) {
            case 'orders':
                $count = $this->getOrdersCount($user);
                break;

            case 'invoices':
                $count = $this->getInvoicesCount($user);
                break;

            case 'service_requests':
                $count = $this->getServiceRequestsCount($user);
                break;

            case 'work_orders':
                $count = $this->getWorkOrdersCount($user);
                break;

            case 'notifications':
                $count = $user->notifications()->where('is_read', false)->count();
                break;

            default:
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid badge type',
                ], 400);
        }

        return response()->json([
            'success' => true,
            'type' => $type,
            'count' => $count,
        ]);
    }

    /**
     * Đếm orders dựa trên permissions
     */
    private function getOrdersCount($user): int
    {
        // Không có quyền view orders
        if (!$user->hasPermission('orders.view')) {
            return 0;
        }

        $query = Order::query();

        // Có quyền manage_all => đếm tất cả orders cần xử lý
        if ($user->hasPermission('orders.manage_all')) {
            return $query->whereIn('status', ['draft', 'quoted', 'confirmed', 'in_progress'])->count();
        }

        // Có quyền approve => đếm orders cần approve
        if ($user->hasPermission('orders.approve')) {
            return $query->whereIn('status', ['confirmed', 'in_progress'])->count();
        }

        // Có quyền manage_own => đếm orders được giao
        if ($user->hasPermission('orders.manage_own')) {
            return $query->where(function($q) use ($user) {
                    $q->where('salesperson_id', $user->id)
                      ->orWhere('technician_id', $user->id);
                })
                ->whereIn('status', ['confirmed', 'in_progress'])
                ->count();
        }

        // Chỉ có quyền view => không hiển thị badge
        return 0;
    }

    /**
     * Đếm invoices dựa trên permissions
     */
    private function getInvoicesCount($user): int
    {
        // Không có quyền view invoices
        if (!$user->hasPermission('invoices.view')) {
            return 0;
        }

        // Có quyền approve hoặc manage invoices
        if ($user->hasAnyPermission(['invoices.approve', 'invoices.edit', 'payments.confirm'])) {
            return Invoice::whereIn('payment_status', ['pending', 'partial'])
                ->whereIn('status', ['draft', 'pending', 'sent'])
                ->count();
        }

        return 0;
    }

    /**
     * Đếm service requests dựa trên permissions
     */
    private function getServiceRequestsCount($user): int
    {
        // Không có quyền view service requests
        if (!$user->hasPermission('service_requests.view')) {
            return 0;
        }

        $query = ServiceRequest::query();

        // Có quyền manage_all
        if ($user->hasPermission('service_requests.manage_all')) {
            return $query->whereIn('status', ['pending', 'quoted', 'approved'])->count();
        }

        // Có quyền approve
        if ($user->hasPermission('service_requests.approve')) {
            return $query->whereIn('status', ['pending', 'quoted'])->count();
        }

        // Có quyền manage_own => đếm requests được giao
        if ($user->hasPermission('service_requests.manage_own')) {
            return $query->where('assigned_to', $user->id)
                ->whereIn('status', ['approved', 'in_progress'])
                ->count();
        }

        return 0;
    }

    /**
     * Đếm work orders (đơn hàng được giao) dựa trên permissions
     */
    private function getWorkOrdersCount($user): int
    {
        // Mechanic hoặc employee có orders được giao
        if ($user->hasPermission('orders.manage_own')) {
            return Order::where(function($query) use ($user) {
                    $query->where('technician_id', $user->id)
                          ->orWhere('salesperson_id', $user->id);
                })
                ->whereIn('status', ['confirmed', 'in_progress'])
                ->count();
        }

        return 0;
    }
}
