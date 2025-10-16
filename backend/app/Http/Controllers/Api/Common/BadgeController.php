<?php

namespace App\Http\Controllers\Api\Common;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Invoice;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Traits\HasPermissions;

/**
 * Badge Count Controller
 *
 * Đếm số lượng badge cho sidebar
 * Sử dụng permission-based thay vì role-based
 */
class BadgeController extends Controller
{
    use HasPermissions;

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

    private function getOrdersCount($user): int
    {
        if (!$user->hasPermission('orders.view')) {
            return 0;
        }

        $query = Order::query();

        if ($user->hasPermission('orders.manage_all')) {
            return $query->whereIn('status', ['draft', 'quoted', 'confirmed', 'in_progress'])->count();
        }

        if ($user->hasPermission('orders.approve')) {
            return $query->whereIn('status', ['confirmed', 'in_progress'])->count();
        }

        if ($user->hasPermission('orders.manage_own')) {
            return $query->where(function($q) use ($user) {
                    $q->where('salesperson_id', $user->id)
                      ->orWhere('technician_id', $user->id);
                })
                ->whereIn('status', ['confirmed', 'in_progress'])
                ->count();
        }

        return 0;
    }

    private function getInvoicesCount($user): int
    {
        if (!$user->hasPermission('invoices.view')) {
            return 0;
        }

        if ($user->hasAnyPermission(['invoices.approve', 'invoices.edit', 'payments.confirm'])) {
            return Invoice::whereIn('payment_status', ['pending', 'partial'])
                ->whereIn('status', ['draft', 'pending', 'sent'])
                ->count();
        }

        return 0;
    }

    private function getServiceRequestsCount($user): int
    {
        if (!$user->hasPermission('service_requests.view')) {
            return 0;
        }

        $query = ServiceRequest::query();

        if ($user->hasPermission('service_requests.manage_all')) {
            return $query->whereIn('status', ['pending', 'quoted', 'approved'])->count();
        }

        if ($user->hasPermission('service_requests.approve')) {
            return $query->whereIn('status', ['pending', 'quoted'])->count();
        }

        if ($user->hasPermission('service_requests.manage_own')) {
            return $query->where('assigned_to', $user->id)
                ->whereIn('status', ['approved', 'in_progress'])
                ->count();
        }

        return 0;
    }

    private function getWorkOrdersCount($user): int
    {
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
