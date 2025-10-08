<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Order;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Service;

class DashboardController extends Controller
{
    /**
     * Tổng quan dashboard cho Admin - Using Eloquent only (no DB::raw)
     */
    public function overview(Request $request)
    {
        $dateFrom = $request->get('date_from', now()->startOfMonth());
        $dateTo = $request->get('date_to', now()->endOfMonth());

        // Orders statistics - Using Eloquent query builder
        $ordersBase = Order::whereBetween('created_at', [$dateFrom, $dateTo]);
        $ordersPaidBase = Order::whereBetween('created_at', [$dateFrom, $dateTo])->where('payment_status', 'paid');

        $ordersStats = [
            'total' => (clone $ordersBase)->count(),
            'pending' => (clone $ordersBase)->where('status', 'pending')->count(),
            'in_progress' => (clone $ordersBase)->where('status', 'in_progress')->count(),
            'completed' => (clone $ordersBase)->where('status', 'completed')->count(),
            'total_revenue' => (clone $ordersPaidBase)->sum('final_amount') ?? 0,
            'total_profit' => (clone $ordersPaidBase)->sum('quote_total') - (clone $ordersPaidBase)->sum('settlement_total'),
        ];

        // Payments statistics - Using Eloquent query builder
        $paymentsBase = Payment::whereBetween('payment_date', [$dateFrom, $dateTo]);
        $paymentsCompletedBase = Payment::whereBetween('payment_date', [$dateFrom, $dateTo])->where('status', 'completed');

        $paymentsStats = [
            'total' => (clone $paymentsBase)->count(),
            'paid' => (clone $paymentsCompletedBase)->count(),
            'pending' => (clone $paymentsBase)->where('status', 'pending')->count(),
            'total_amount' => (clone $paymentsCompletedBase)->sum('amount') ?? 0,
        ];

        // Customers statistics - Using Eloquent with relationships
        $customersStats = [
            'total' => Customer::count(),
            'new_this_month' => Customer::whereBetween('created_at', [$dateFrom, $dateTo])->count(),
            'active' => Customer::has('orders')->count(),
        ];

        // Inventory statistics - Using Eloquent with scopes
        $inventoryStats = [
            'total_products' => Product::active()->count(),
            'low_stock_count' => Product::lowStock()->count(),
            'out_of_stock_count' => Product::outOfStock()->count(),
        ];

        // Recent orders - single query with relationships
        $recentOrders = Order::with(['customer:id,name', 'vehicle.brand:id,name'])
            ->select('id', 'order_number', 'customer_id', 'vehicle_id', 'status', 'final_amount', 'created_at')
            ->latest()
            ->limit(10)
            ->get()
            ->map(function($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'customer_name' => $order->customer?->name ?? 'N/A',
                    'status' => $order->status,
                    'final_amount' => $order->final_amount,
                    'created_at' => $order->created_at,
                ];
            });

        // Recent payments - single query with relationships
        $recentPayments = Payment::with(['customer:id,name', 'invoice:id,invoice_number'])
            ->select('id', 'customer_id', 'invoice_id', 'amount', 'payment_method', 'status', 'payment_date', 'created_at')
            ->where('status', 'completed')
            ->latest('payment_date')
            ->limit(10)
            ->get()
            ->map(function($payment) {
                return [
                    'id' => $payment->id,
                    'invoice_number' => $payment->invoice?->invoice_number ?? 'N/A',
                    'customer_name' => $payment->customer?->name ?? 'N/A',
                    'amount' => $payment->amount,
                    'payment_method' => $payment->payment_method,
                    'created_at' => $payment->created_at,
                ];
            });

        // Revenue trend - Using Eloquent groupBy with collection
        $startDate = now()->subDays(6)->startOfDay();
        $endDate = now()->endOfDay();

        $revenueData = Order::where('payment_status', 'paid')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get(['created_at', 'final_amount'])
            ->groupBy(function($order) {
                return $order->created_at->format('Y-m-d');
            })
            ->map(function($dayOrders, $date) {
                return [
                    'date' => $date,
                    'revenue' => $dayOrders->sum('final_amount'),
                    'orders' => $dayOrders->count(),
                ];
            })
            ->values()
            ->toArray();

        // Fill missing dates with zero values
        $revenueTrend = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $found = collect($revenueData)->firstWhere('date', $date);
            $revenueTrend[] = $found ?? [
                'date' => $date,
                'revenue' => 0,
                'orders' => 0,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'orders' => $ordersStats,
                'payments' => $paymentsStats,
                'customers' => $customersStats,
                'inventory' => $inventoryStats,
                'recent_orders' => $recentOrders,
                'recent_payments' => $recentPayments,
                'revenue_trend' => $revenueTrend,
            ],
        ]);
    }

    /**
     * Báo cáo doanh thu chi tiết - Using Eloquent only (no DB::raw)
     */
    public function revenueReport(Request $request)
    {
        $dateFrom = $request->get('date_from', now()->startOfMonth());
        $dateTo = $request->get('date_to', now()->endOfMonth());
        $groupBy = $request->get('group_by', 'day'); // day, week, month

        // Get all paid orders in date range
        $orders = Order::where('payment_status', 'paid')
            ->whereBetween('created_at', [$dateFrom, $dateTo])
            ->get(['created_at', 'final_amount', 'quote_total', 'settlement_total']);

        // Group by period using Collection methods
        $revenue = $orders->groupBy(function($order) use ($groupBy) {
            return match($groupBy) {
                'week' => $order->created_at->format('Y-W'),
                'month' => $order->created_at->format('Y-m'),
                default => $order->created_at->format('Y-m-d'),
            };
        })->map(function($periodOrders, $period) {
            return [
                'period' => $period,
                'total_revenue' => $periodOrders->sum('final_amount'),
                'quote_total' => $periodOrders->sum('quote_total'),
                'settlement_total' => $periodOrders->sum('settlement_total'),
                'orders_count' => $periodOrders->count(),
                'avg_order_value' => $periodOrders->avg('final_amount'),
            ];
        })->sortBy('period')->values();

        return response()->json([
            'success' => true,
            'data' => $revenue,
        ]);
    }

    /**
     * Top customers - Using Eloquent with relationships (no DB::raw)
     */
    public function topCustomers(Request $request)
    {
        $dateFrom = $request->get('date_from', now()->startOfYear());
        $dateTo = $request->get('date_to', now());
        $limit = $request->get('limit', 10);

        // Get customers with their paid orders
        $customers = Customer::with(['orders' => function($query) use ($dateFrom, $dateTo) {
            $query->where('payment_status', 'paid')
                  ->whereBetween('created_at', [$dateFrom, $dateTo])
                  ->select('id', 'customer_id', 'final_amount');
        }])
        ->get(['id', 'name', 'phone', 'email'])
        ->map(function($customer) {
            return [
                'id' => $customer->id,
                'name' => $customer->name,
                'phone' => $customer->phone,
                'email' => $customer->email,
                'orders_count' => $customer->orders->count(),
                'total_spent' => $customer->orders->sum('final_amount'),
            ];
        })
        ->filter(function($customer) {
            return $customer['orders_count'] > 0;
        })
        ->sortByDesc('total_spent')
        ->take($limit)
        ->values();

        return response()->json([
            'success' => true,
            'data' => $customers,
        ]);
    }

    /**
     * Top services - Using Eloquent with relationships (no DB::raw)
     */
    public function topServices(Request $request)
    {
        $dateFrom = $request->get('date_from', now()->startOfMonth());
        $dateTo = $request->get('date_to', now());
        $limit = $request->get('limit', 10);

        // Get services with their order items
        $services = Service::with(['orderItems' => function($query) use ($dateFrom, $dateTo) {
            $query->whereHas('order', function($orderQuery) use ($dateFrom, $dateTo) {
                $orderQuery->whereBetween('created_at', [$dateFrom, $dateTo]);
            })
            ->select('id', 'service_id', 'quantity', 'quote_total_price');
        }])
        ->get(['id', 'name', 'code'])
        ->map(function($service) {
            return [
                'id' => $service->id,
                'name' => $service->name,
                'code' => $service->code,
                'usage_count' => $service->orderItems->count(),
                'total_quantity' => $service->orderItems->sum('quantity'),
                'total_revenue' => $service->orderItems->sum('quote_total_price'),
            ];
        })
        ->filter(function($service) {
            return $service['usage_count'] > 0;
        })
        ->sortByDesc('total_revenue')
        ->take($limit)
        ->values();

        return response()->json([
            'success' => true,
            'data' => $services,
        ]);
    }

    /**
     * Top products - Using Eloquent with relationships (no DB::raw)
     */
    public function topProducts(Request $request)
    {
        $dateFrom = $request->get('date_from', now()->startOfMonth());
        $dateTo = $request->get('date_to', now());
        $limit = $request->get('limit', 10);

        // Get products with their order items
        $products = Product::with(['orderItems' => function($query) use ($dateFrom, $dateTo) {
            $query->whereHas('order', function($orderQuery) use ($dateFrom, $dateTo) {
                $orderQuery->whereBetween('created_at', [$dateFrom, $dateTo]);
            })
            ->select('id', 'product_id', 'quantity', 'quote_total_price');
        }])
        ->get(['id', 'name', 'code'])
        ->map(function($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'code' => $product->code,
                'usage_count' => $product->orderItems->count(),
                'total_quantity' => $product->orderItems->sum('quantity'),
                'total_revenue' => $product->orderItems->sum('quote_total_price'),
            ];
        })
        ->filter(function($product) {
            return $product['usage_count'] > 0;
        })
        ->sortByDesc('total_revenue')
        ->take($limit)
        ->values();

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    /**
     * Báo cáo lợi nhuận - Using Eloquent only (no DB::raw)
     */
    public function profitReport(Request $request)
    {
        $dateFrom = $request->get('date_from', now()->startOfMonth());
        $dateTo = $request->get('date_to', now());

        // Get all paid orders
        $orders = Order::where('payment_status', 'paid')
            ->whereBetween('created_at', [$dateFrom, $dateTo])
            ->get(['quote_total', 'settlement_total']);

        $totalQuote = $orders->sum('quote_total');
        $totalSettlement = $orders->sum('settlement_total');
        $grossProfit = $totalQuote - $totalSettlement;
        $ordersCount = $orders->count();

        $profitMargin = $totalQuote > 0
            ? ($grossProfit / $totalQuote) * 100
            : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'total_quote' => $totalQuote,
                'total_settlement' => $totalSettlement,
                'gross_profit' => $grossProfit,
                'profit_margin' => round($profitMargin, 2),
                'orders_count' => $ordersCount,
                'avg_profit_per_order' => $ordersCount > 0
                    ? $grossProfit / $ordersCount
                    : 0,
            ],
        ]);
    }
}
