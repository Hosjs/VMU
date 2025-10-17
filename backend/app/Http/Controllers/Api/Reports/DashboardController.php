<?php

namespace App\Http\Controllers\Api\Reports;

use App\Http\Controllers\Controller;
use App\Traits\HasPermissions;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Invoice;
use App\Models\Customer;
use App\Models\Product;
use App\Models\WarehouseStock;
use App\Models\Service;
use Illuminate\Support\Facades\DB;

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
        // Dashboard available for all authenticated users
        // No specific permission required

        $user = auth()->user();

        // Scope data theo permission
        $ordersQuery = Order::query();

        // Only filter by user if they don't have manage_all permission
        if (!$user->hasPermission('orders.manage_all')) {
            if ($user->hasPermission('orders.manage_own')) {
                $ordersQuery->where(function($q) use ($user) {
                    $q->where('salesperson_id', $user->id)
                      ->orWhere('technician_id', $user->id);
                });
            } else {
                // If no order permissions at all, use all orders for stats
                // (everyone can see general stats)
            }
        }

        // Tính toán các thống kê
        $totalOrders = $ordersQuery->count();
        $pendingOrders = (clone $ordersQuery)->where('status', 'pending')->count();
        $inProgressOrders = (clone $ordersQuery)->where('status', 'in_progress')->count();
        $completedOrders = (clone $ordersQuery)->where('status', 'completed')->count();

        // Doanh thu từ invoices
        $invoicesQuery = Invoice::query();
        $totalRevenue = $invoicesQuery->where('status', 'paid')->sum('total_amount');
        $todayRevenue = (clone $invoicesQuery)->whereDate('created_at', today())->where('status', 'paid')->sum('total_amount');
        $thisMonthRevenue = (clone $invoicesQuery)->whereMonth('created_at', now()->month)->whereYear('created_at', now()->year)->where('status', 'paid')->sum('total_amount');

        // Lợi nhuận (từ actual_profit trong invoices)
        $totalProfit = $invoicesQuery->where('status', 'paid')->sum('actual_profit');

        // Khách hàng
        $totalCustomers = Customer::count();
        $activeCustomers = Customer::where('is_active', true)->count();
        $newThisMonth = Customer::whereMonth('created_at', now()->month)->whereYear('created_at', now()->year)->count();

        // Sản phẩm sắp hết hàng
        $lowStockProducts = Product::where('track_stock', true)
            ->where('is_active', true)
            ->whereHas('warehouseStocks', function($q) {
                $q->select('product_id', DB::raw('SUM(available_quantity) as total_stock'))
                    ->groupBy('product_id')
                    ->havingRaw('SUM(available_quantity) <= products.min_stock_level');
            })
            ->count();

        // Đơn hàng cần xử lý (pending + in_progress)
        $ordersNeedAttention = (clone $ordersQuery)
            ->whereIn('status', ['pending', 'in_progress'])
            ->count();

        $data = [
            // Tổng quan đơn hàng
            'total_orders' => $totalOrders,
            'pending_orders' => $pendingOrders,
            'in_progress_orders' => $inProgressOrders,
            'completed_orders' => $completedOrders,
            'orders_need_attention' => $ordersNeedAttention,

            // Doanh thu
            'total_revenue' => (float) $totalRevenue,
            'today_revenue' => (float) $todayRevenue,
            'this_month_revenue' => (float) $thisMonthRevenue,

            // Lợi nhuận
            'total_profit' => (float) $totalProfit,

            // Khách hàng
            'total_customers' => $totalCustomers,
            'active_customers' => $activeCustomers,
            'new_customers_this_month' => $newThisMonth,

            // Cảnh báo
            'low_stock_products' => $lowStockProducts,
        ];

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function recentOrders(Request $request)
    {
        $perPage = $request->input('per_page', 10);

        $orders = Order::with(['customer', 'vehicle', 'salesperson'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json($orders);
    }

    public function recentInvoices(Request $request)
    {
        $perPage = $request->input('per_page', 10);

        $invoices = Invoice::with(['customer', 'order'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json($invoices);
    }

    public function revenueReport(Request $request)
    {
        $this->authorizePermission('reports.financial');

        $startDate = $request->input('start_date', now()->startOfMonth());
        $endDate = $request->input('end_date', now()->endOfMonth());
        $groupBy = $request->input('group_by', 'day'); // day, week, month

        $query = Invoice::query()
            ->where('status', 'paid')
            ->whereBetween('invoice_date', [$startDate, $endDate]);

        // Group by period
        if ($groupBy === 'day') {
            $data = $query->select(
                DB::raw('DATE(invoice_date) as period'),
                DB::raw('SUM(total_amount) as revenue'),
                DB::raw('SUM(actual_profit) as profit'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('period')
            ->orderBy('period')
            ->get();
        } elseif ($groupBy === 'week') {
            $data = $query->select(
                DB::raw('YEARWEEK(invoice_date) as period'),
                DB::raw('SUM(total_amount) as revenue'),
                DB::raw('SUM(actual_profit) as profit'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('period')
            ->orderBy('period')
            ->get();
        } else { // month
            $data = $query->select(
                DB::raw('DATE_FORMAT(invoice_date, "%Y-%m") as period'),
                DB::raw('SUM(total_amount) as revenue'),
                DB::raw('SUM(actual_profit) as profit'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('period')
            ->orderBy('period')
            ->get();
        }

        $totalRevenue = $query->sum('total_amount');
        $totalProfit = $query->sum('actual_profit');

        return response()->json([
            'success' => true,
            'data' => [
                'chart_data' => $data,
                'summary' => [
                    'total_revenue' => (float) $totalRevenue,
                    'total_profit' => (float) $totalProfit,
                    'period' => [
                        'start' => $startDate,
                        'end' => $endDate
                    ]
                ]
            ]
        ]);
    }

    public function topCustomers(Request $request)
    {
        $limit = $request->input('limit', 10);

        $customers = Customer::select('customers.*')
            ->withCount('orders')
            ->withSum('invoices as total_spent', 'total_amount')
            ->orderBy('total_spent', 'desc')
            ->take($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $customers
        ]);
    }

    public function topServices(Request $request)
    {
        $limit = $request->input('limit', 10);

        $services = Service::select('services.*')
            ->withCount('serviceRequests')
            ->orderBy('service_requests_count', 'desc')
            ->take($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $services
        ]);
    }

    public function topProducts(Request $request)
    {
        $limit = $request->input('limit', 10);

        $products = Product::select('products.*')
            ->withCount('orderItems')
            ->withSum('orderItems as total_quantity', 'quantity')
            ->orderBy('total_quantity', 'desc')
            ->take($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $products
        ]);
    }
}
