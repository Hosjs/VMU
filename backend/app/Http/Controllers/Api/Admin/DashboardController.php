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
     * Tổng quan dashboard cho Admin
     */
    public function overview(Request $request)
    {
        $dateFrom = $request->get('date_from', now()->startOfMonth());
        $dateTo = $request->get('date_to', now()->endOfMonth());

        // Orders statistics
        $ordersStats = [
            'total' => Order::whereBetween('created_at', [$dateFrom, $dateTo])->count(),
            'pending' => Order::whereBetween('created_at', [$dateFrom, $dateTo])->where('status', 'pending')->count(),
            'in_progress' => Order::whereBetween('created_at', [$dateFrom, $dateTo])->where('status', 'in_progress')->count(),
            'completed' => Order::whereBetween('created_at', [$dateFrom, $dateTo])->where('status', 'completed')->count(),
            'total_revenue' => Order::whereBetween('created_at', [$dateFrom, $dateTo])
                ->where('payment_status', 'paid')
                ->sum('final_amount'),
        ];

        // Payments statistics
        $paymentsStats = [
            'total' => Payment::whereBetween('payment_date', [$dateFrom, $dateTo])
                ->where('status', 'completed')
                ->sum('amount'),
            'by_method' => Payment::whereBetween('payment_date', [$dateFrom, $dateTo])
                ->where('status', 'completed')
                ->select('method', DB::raw('SUM(amount) as total'))
                ->groupBy('method')
                ->get(),
        ];

        // Customers statistics
        $customersStats = [
            'total' => Customer::count(),
            'new_this_period' => Customer::whereBetween('created_at', [$dateFrom, $dateTo])->count(),
            'with_orders' => Customer::has('orders')->count(),
        ];

        // Inventory statistics
        $inventoryStats = [
            'total_products' => Product::where('is_active', true)->count(),
            'low_stock' => Product::whereHas('warehouseStocks', function($q) {
                $q->whereRaw('available_quantity <= reorder_point');
            })->count(),
            'out_of_stock' => Product::whereHas('warehouseStocks', function($q) {
                $q->where('available_quantity', '<=', 0);
            })->count(),
        ];

        // Recent activities
        $recentOrders = Order::with(['customer', 'vehicle.brand'])
            ->latest()
            ->take(10)
            ->get();

        $recentPayments = Payment::with(['customer', 'order'])
            ->where('status', 'completed')
            ->latest('payment_date')
            ->take(10)
            ->get();

        // Revenue trend (last 7 days)
        $revenueTrend = Order::where('payment_status', 'paid')
            ->whereBetween('created_at', [now()->subDays(7), now()])
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(final_amount) as revenue'),
                DB::raw('COUNT(*) as orders_count')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

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
     * Báo cáo doanh thu chi tiết
     */
    public function revenueReport(Request $request)
    {
        $dateFrom = $request->get('date_from', now()->startOfMonth());
        $dateTo = $request->get('date_to', now()->endOfMonth());
        $groupBy = $request->get('group_by', 'day'); // day, week, month

        $dateFormat = match($groupBy) {
            'week' => '%Y-%u',
            'month' => '%Y-%m',
            default => '%Y-%m-%d',
        };

        $revenue = Order::where('payment_status', 'paid')
            ->whereBetween('created_at', [$dateFrom, $dateTo])
            ->select(
                DB::raw("DATE_FORMAT(created_at, '{$dateFormat}') as period"),
                DB::raw('SUM(final_amount) as total_revenue'),
                DB::raw('SUM(quote_total) as quote_total'),
                DB::raw('SUM(settlement_total) as settlement_total'),
                DB::raw('COUNT(*) as orders_count'),
                DB::raw('AVG(final_amount) as avg_order_value')
            )
            ->groupBy('period')
            ->orderBy('period')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $revenue,
        ]);
    }

    /**
     * Top customers
     */
    public function topCustomers(Request $request)
    {
        $dateFrom = $request->get('date_from', now()->startOfYear());
        $dateTo = $request->get('date_to', now());
        $limit = $request->get('limit', 10);

        $customers = Customer::select('customers.*')
            ->join('orders', 'customers.id', '=', 'orders.customer_id')
            ->whereBetween('orders.created_at', [$dateFrom, $dateTo])
            ->where('orders.payment_status', 'paid')
            ->select(
                'customers.id',
                'customers.name',
                'customers.phone',
                'customers.email',
                DB::raw('COUNT(orders.id) as orders_count'),
                DB::raw('SUM(orders.final_amount) as total_spent')
            )
            ->groupBy('customers.id', 'customers.name', 'customers.phone', 'customers.email')
            ->orderBy('total_spent', 'desc')
            ->take($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $customers,
        ]);
    }

    /**
     * Top services
     */
    public function topServices(Request $request)
    {
        $dateFrom = $request->get('date_from', now()->startOfMonth());
        $dateTo = $request->get('date_to', now());
        $limit = $request->get('limit', 10);

        $services = Service::select('services.*')
            ->join('order_items', 'services.id', '=', 'order_items.service_id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->whereBetween('orders.created_at', [$dateFrom, $dateTo])
            ->select(
                'services.id',
                'services.name',
                'services.code',
                DB::raw('COUNT(order_items.id) as usage_count'),
                DB::raw('SUM(order_items.quantity) as total_quantity'),
                DB::raw('SUM(order_items.total_price) as total_revenue')
            )
            ->groupBy('services.id', 'services.name', 'services.code')
            ->orderBy('total_revenue', 'desc')
            ->take($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $services,
        ]);
    }

    /**
     * Top products
     */
    public function topProducts(Request $request)
    {
        $dateFrom = $request->get('date_from', now()->startOfMonth());
        $dateTo = $request->get('date_to', now());
        $limit = $request->get('limit', 10);

        $products = Product::select('products.*')
            ->join('order_items', 'products.id', '=', 'order_items.product_id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->whereBetween('orders.created_at', [$dateFrom, $dateTo])
            ->select(
                'products.id',
                'products.name',
                'products.code',
                DB::raw('COUNT(order_items.id) as usage_count'),
                DB::raw('SUM(order_items.quantity) as total_quantity'),
                DB::raw('SUM(order_items.total_price) as total_revenue')
            )
            ->groupBy('products.id', 'products.name', 'products.code')
            ->orderBy('total_revenue', 'desc')
            ->take($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    /**
     * Báo cáo lợi nhuận
     */
    public function profitReport(Request $request)
    {
        $dateFrom = $request->get('date_from', now()->startOfMonth());
        $dateTo = $request->get('date_to', now());

        $orders = Order::where('payment_status', 'paid')
            ->whereBetween('created_at', [$dateFrom, $dateTo])
            ->select(
                DB::raw('SUM(quote_total) as total_quote'),
                DB::raw('SUM(settlement_total) as total_settlement'),
                DB::raw('SUM(quote_total - settlement_total) as gross_profit'),
                DB::raw('COUNT(*) as orders_count')
            )
            ->first();

        $profitMargin = $orders->total_quote > 0
            ? ($orders->gross_profit / $orders->total_quote) * 100
            : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'total_quote' => $orders->total_quote,
                'total_settlement' => $orders->total_settlement,
                'gross_profit' => $orders->gross_profit,
                'profit_margin' => round($profitMargin, 2),
                'orders_count' => $orders->orders_count,
                'avg_profit_per_order' => $orders->orders_count > 0
                    ? $orders->gross_profit / $orders->orders_count
                    : 0,
            ],
        ]);
    }
}
<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CategoryController extends Controller
{
    /**
     * Danh sách categories
     */
    public function index(Request $request)
    {
        $search = $request->get('search');
        $type = $request->get('type');
        $isActive = $request->get('is_active');

        $query = Category::withCount(['services', 'products']);

        // Search
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        // Filter by type
        if ($type) {
            $query->where('type', $type);
        }

        // Filter active
        if ($isActive !== null) {
            $query->where('is_active', $isActive == 1);
        }

        $categories = $query->orderBy('display_order')->get();

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }

    /**
     * Tạo category mới
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:categories,code',
            'type' => 'required|in:service,product,both',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:categories,id',
            'icon' => 'nullable|string|max:100',
            'image' => 'nullable|string',
            'display_order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $category = Category::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Category created successfully',
                'data' => $category,
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create category',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xem chi tiết category
     */
    public function show($id)
    {
        $category = Category::with(['services', 'products', 'children'])->find($id);

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $category,
        ]);
    }

    /**
     * Cập nhật category
     */
    public function update(Request $request, $id)
    {
        $category = Category::find($id);

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:categories,code,' . $id,
            'type' => 'required|in:service,product,both',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:categories,id',
            'icon' => 'nullable|string|max:100',
            'image' => 'nullable|string',
            'display_order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $category->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Category updated successfully',
                'data' => $category,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update category',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xóa category
     */
    public function destroy($id)
    {
        $category = Category::find($id);

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found'
            ], 404);
        }

        // Check if category has services or products
        if ($category->services()->exists() || $category->products()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete category with existing services or products'
            ], 400);
        }

        try {
            $category->delete();

            return response()->json([
                'success' => true,
                'message' => 'Category deleted successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete category',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cập nhật thứ tự hiển thị
     */
    public function updateOrder(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'categories' => 'required|array',
            'categories.*.id' => 'required|exists:categories,id',
            'categories.*.display_order' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            foreach ($request->categories as $item) {
                Category::where('id', $item['id'])->update(['display_order' => $item['display_order']]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Category order updated successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update order',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

