<?php

namespace App\Http\Controllers\Api\Reports;

use App\Http\Controllers\Controller;
use App\Traits\HasPermissions;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Invoice;
use App\Models\Customer;

/**
 * Dashboard Controller
 *
 * Tổng quan hệ thống - Báo cáo
 * Permissions: dashboard.*
 */
class DashboardController extends Controller
{
    use HasPermissions;

    public function overview()
    {
        $this->authorizePermission('dashboard.view');

        // Scope data theo permission
        $ordersQuery = Order::query();
        $ordersQuery = $this->scopeByPermission(
            $ordersQuery,
            'orders.manage_all',
            'orders.manage_own',
            'salesperson_id'
        );

        $data = [
            'orders' => [
                'total' => $ordersQuery->count(),
                'pending' => $ordersQuery->where('status', 'pending')->count(),
                'in_progress' => $ordersQuery->where('status', 'in_progress')->count(),
            ],
            'revenue' => [
                'today' => Invoice::whereDate('created_at', today())->sum('total_amount'),
                'this_month' => Invoice::whereMonth('created_at', now()->month)->sum('total_amount'),
            ],
            'customers' => [
                'total' => Customer::count(),
                'new_this_month' => Customer::whereMonth('created_at', now()->month)->count(),
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function revenueReport(Request $request)
    {
        $this->authorizePermission('reports.financial');

        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $query = Invoice::query();

        if ($startDate) {
            $query->whereDate('created_at', '>=', $startDate);
        }
        if ($endDate) {
            $query->whereDate('created_at', '<=', $endDate);
        }

        $revenue = $query->where('status', 'paid')->sum('total_amount');

        return response()->json([
            'success' => true,
            'data' => [
                'revenue' => $revenue,
                'period' => [
                    'start' => $startDate,
                    'end' => $endDate
                ]
            ]
        ]);
    }

    public function profitReport()
    {
        $this->authorizePermission('reports.financial');

        // Logic tính lợi nhuận
        $revenue = Invoice::where('status', 'paid')->sum('total_amount');
        $cost = Order::sum('cost_amount'); // Giả sử có trường này

        return response()->json([
            'success' => true,
            'data' => [
                'revenue' => $revenue,
                'cost' => $cost,
                'profit' => $revenue - $cost
            ]
        ]);
    }

    public function topCustomers()
    {
        $this->authorizePermission('dashboard.view');

        $customers = Customer::withCount('orders')
            ->orderBy('orders_count', 'desc')
            ->take(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $customers
        ]);
    }

    public function topServices()
    {
        $this->authorizePermission('dashboard.view');

        // Logic top services
        return response()->json([
            'success' => true,
            'data' => []
        ]);
    }

    public function topProducts()
    {
        $this->authorizePermission('dashboard.view');

        // Logic top products
        return response()->json([
            'success' => true,
            'data' => []
        ]);
    }
}

