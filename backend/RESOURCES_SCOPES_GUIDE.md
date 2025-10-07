# API Resources & Query Scopes Documentation

## Tổng Quan

Hệ thống đã được tổ chức với:
- **19 API Resources** để transform dữ liệu response
- **11 Query Scopes** để tối ưu hóa truy vấn database

## API Resources

### Cấu Trúc Thư Mục
```
app/Http/Resources/
├── OrderResource.php
├── OrderItemResource.php
├── CustomerResource.php
├── VehicleResource.php
├── VehicleBrandResource.php
├── VehicleModelResource.php
├── ProductResource.php
├── ServiceResource.php
├── InvoiceResource.php
├── PaymentResource.php
├── WarehouseResource.php
├── WarehouseStockResource.php
├── ProviderResource.php
├── SettlementResource.php
├── SettlementPaymentResource.php
├── UserResource.php
├── RoleResource.php
├── CategoryResource.php
└── ServiceRequestResource.php
```

### Sử Dụng Resources

#### 1. Single Resource
```php
use App\Http\Resources\OrderResource;

public function show(Order $order)
{
    // Load relations trước khi transform
    $order->load(['customer', 'vehicle', 'orderItems']);
    
    return new OrderResource($order);
}
```

#### 2. Collection Resource
```php
use App\Http\Resources\OrderResource;

public function index()
{
    $orders = Order::with(['customer', 'vehicle'])
        ->paginate(20);
    
    return OrderResource::collection($orders);
}
```

#### 3. Với Pagination
```php
public function index()
{
    $orders = Order::withCommonRelations()
        ->status(['confirmed', 'in_progress'])
        ->paginate(20);
    
    return OrderResource::collection($orders);
}
```

### Đặc Điểm Resources

#### 1. Role-Based Data (Admin Only Fields)
Một số fields chỉ hiển thị cho Admin:
```php
// OrderResource - Profit margin chỉ admin xem
'profit_margin' => $this->when(
    $request->user()?->role?->name === 'admin',
    (float) ($this->quote_total - $this->settlement_total)
),

// ProductResource - Settlement price chỉ admin xem
'settlement_price' => $this->when($isAdmin, (float) $this->settlement_price),
```

#### 2. Conditional Relations
Relations chỉ load khi được eager load:
```php
'customer' => new CustomerResource($this->whenLoaded('customer')),
'orderItems' => OrderItemResource::collection($this->whenLoaded('orderItems')),
```

#### 3. Computed Fields
Các trường tự động tính toán:
```php
// VehicleResource
'insurance_status' => $this->insurance_expiry ? 
    ($this->insurance_expiry->isFuture() ? 'active' : 'expired') : 'none',
'days_until_insurance_expiry' => $this->insurance_expiry?->diffInDays(now(), false),
```

#### 4. Array Transformations
Chuyển đổi string thành array:
```php
'attachment_urls' => $this->attachment_urls ? explode('|', $this->attachment_urls) : [],
'gallery_images' => $this->gallery_images ? explode('|', $this->gallery_images) : [],
```

## Query Scopes

### Cấu Trúc Thư Mục
```
app/QueryScopes/
├── OrderScopes.php
├── CustomerScopes.php
├── VehicleScopes.php
├── ProductScopes.php
├── InvoiceScopes.php
├── WarehouseScopes.php
├── SettlementScopes.php
├── ProviderScopes.php
├── ServiceRequestScopes.php
├── StockTransferScopes.php
└── UserScopes.php
```

### Cách Sử Dụng Scopes

#### 1. Thêm Trait vào Model
```php
namespace App\Models;

use App\QueryScopes\OrderScopes;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use OrderScopes;
    
    // ... model code
}
```

#### 2. Sử Dụng Scopes

##### Basic Filtering
```php
// Filter by status
$orders = Order::status('completed')->get();

// Multiple statuses
$orders = Order::status(['confirmed', 'in_progress'])->get();

// Chaining scopes
$orders = Order::status('confirmed')
    ->paymentStatus('unpaid')
    ->forCustomer($customerId)
    ->recent(30)
    ->get();
```

##### Date Range Queries
```php
// Orders created in date range
$orders = Order::createdBetween('2024-01-01', '2024-12-31')->get();

// Orders by month
$orders = Order::byMonth(2024, 10)->get();

// Recent orders (last 30 days)
$orders = Order::recent(30)->get();
```

##### Complex Queries
```php
// High value unpaid orders
$orders = Order::unpaid()
    ->highValue(10000000)
    ->with(['customer', 'vehicle'])
    ->orderByDesc('final_amount')
    ->get();

// Orders with pending completion
$orders = Order::pendingCompletion()
    ->withItemsCount()
    ->orderBy('start_date')
    ->get();
```

### Ví Dụ Theo Module

#### 1. Orders
```php
use App\Models\Order;

// Dashboard: Orders cần xử lý
$pendingOrders = Order::pendingCompletion()
    ->withCommonRelations()
    ->orderBy('created_at', 'desc')
    ->limit(10)
    ->get();

// Report: Doanh thu tháng này
$monthlyRevenue = Order::byMonth(2024, 10)
    ->completed()
    ->paid()
    ->sum('final_amount');

// Search orders
$results = Order::search($searchTerm)
    ->withCommonRelations()
    ->paginate(20);
```

#### 2. Customers
```php
use App\Models\Customer;

// VIP customers (high spending)
$vipCustomers = Customer::vip(50000000)
    ->active()
    ->withOrderStats()
    ->get();

// Birthday reminders this month
$birthdays = Customer::birthdayThisMonth()
    ->active()
    ->orderBy('birth_date')
    ->get();

// Inactive customers (no orders in 6 months)
$inactiveCustomers = Customer::inactive(6)
    ->withVehicleCount()
    ->get();

// Insurance expiring soon
$expiringInsurance = Customer::insuranceExpiringSoon(30)
    ->with('vehicles')
    ->get();
```

#### 3. Vehicles
```php
use App\Models\Vehicle;

// Vehicles needing attention
$needsAttention = Vehicle::needingAttention(30)
    ->withCommonRelations()
    ->get();

// Maintenance due
$maintenanceDue = Vehicle::maintenanceDue()
    ->with(['customer', 'brand', 'model'])
    ->orderBy('next_maintenance')
    ->get();

// Registration expiring soon
$expiringRegistration = Vehicle::registrationExpiringSoon(30)
    ->active()
    ->get();
```

#### 4. Products
```php
use App\Models\Product;

// Low stock products
$lowStock = Product::lowStock()
    ->active()
    ->withStockInfo()
    ->get();

// Products needing reorder
$needReorder = Product::needReorder()
    ->withCommonRelations()
    ->get();

// Best selling products
$bestSellers = Product::bestSelling(30)
    ->active()
    ->take(10)
    ->get();

// High profit products (Admin only)
$highProfit = Product::highProfitMargin(40)
    ->active()
    ->orderByDesc('quote_price')
    ->get();
```

#### 5. Invoices
```php
use App\Models\Invoice;

// Overdue invoices
$overdueInvoices = Invoice::overdue()
    ->withCommonRelations()
    ->orderBy('due_date')
    ->get();

// Monthly revenue
$monthlyInvoices = Invoice::byMonth(2024, 10)
    ->paid()
    ->sum('total_amount');

// Pending approval
$pendingApproval = Invoice::pendingApproval()
    ->with(['creator', 'order'])
    ->get();
```

#### 6. Settlements
```php
use App\Models\Settlement;

// Overdue settlements
$overdueSettlements = Settlement::overdue()
    ->withCommonRelations()
    ->get();

// Pending approval
$pendingApproval = Settlement::pendingApproval()
    ->highValue(5000000)
    ->get();

// Provider settlements
$providerSettlements = Settlement::byProvider($providerId)
    ->unpaid()
    ->withPaymentSummary()
    ->get();
```

#### 7. Providers
```php
use App\Models\Provider;

// High rated active providers
$topProviders = Provider::active()
    ->highRated(4.5)
    ->withStats()
    ->get();

// Providers with overdue settlements
$withOverdue = Provider::withOverdueSettlements()
    ->active()
    ->get();

// Contract expiring soon
$expiringContracts = Provider::contractExpiringSoon(30)
    ->active()
    ->get();
```

#### 8. Service Requests
```php
use App\Models\ServiceRequest;

// High priority pending requests
$urgentRequests = ServiceRequest::highPriority()
    ->withCommonRelations()
    ->get();

// Overdue requests (not contacted)
$overdueRequests = ServiceRequest::overdue(24)
    ->unassigned()
    ->get();

// Assigned to me
$myRequests = ServiceRequest::assignedTo($userId)
    ->status(['contacted', 'scheduled'])
    ->get();
```

## Best Practices

### 1. Sử Dụng Eager Loading
```php
// ❌ N+1 Problem
$orders = Order::all();
foreach ($orders as $order) {
    echo $order->customer->name; // Query mỗi lần
}

// ✅ Eager Loading
$orders = Order::with('customer')->all();
foreach ($orders as $order) {
    echo $order->customer->name; // Chỉ 2 queries
}

// ✅ Với Scope
$orders = Order::withCommonRelations()->all();
```

### 2. Chaining Scopes
```php
// Kết hợp nhiều scopes
$orders = Order::status('in_progress')
    ->forCustomer($customerId)
    ->recent(30)
    ->withCommonRelations()
    ->orderByDesc('created_at')
    ->paginate(20);
```

### 3. Conditional Scopes
```php
$query = Order::query();

// Conditional chaining
$query->when($status, function ($q) use ($status) {
    $q->status($status);
});

$query->when($customerId, function ($q) use ($customerId) {
    $q->forCustomer($customerId);
});

$orders = $query->paginate(20);
```

### 4. Subselect Optimization
```php
// ✅ Sử dụng withSum thay vì DB::raw
$customers = Customer::withSum('orders', 'final_amount')
    ->withCount('orders')
    ->get();

// Trong scope
public function scopeWithOrderStats(Builder $query): Builder
{
    return $query->withCount('orders')
        ->withSum('orders', 'final_amount')
        ->withMax('orders', 'created_at');
}
```

### 5. Complex Filtering
```php
// Scope với multiple conditions
public function scopeNeedingAttention(Builder $query, int $days = 30): Builder
{
    $futureDate = now()->addDays($days);
    
    return $query->where(function ($q) use ($futureDate) {
        $q->where(function ($q1) use ($futureDate) {
            $q1->whereNotNull('insurance_expiry')
               ->where('insurance_expiry', '<=', $futureDate);
        })
        ->orWhere(function ($q2) use ($futureDate) {
            $q2->whereNotNull('registration_expiry')
               ->where('registration_expiry', '<=', $futureDate);
        });
    });
}
```

## Controller Examples

### OrderController
```php
namespace App\Http\Controllers\Api;

use App\Models\Order;
use App\Http\Resources\OrderResource;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::query();
        
        // Apply filters
        $query->when($request->status, fn($q) => $q->status($request->status));
        $query->when($request->customer_id, fn($q) => $q->forCustomer($request->customer_id));
        $query->when($request->payment_status, fn($q) => $q->paymentStatus($request->payment_status));
        
        // Date range
        if ($request->from_date && $request->to_date) {
            $query->createdBetween($request->from_date, $request->to_date);
        }
        
        // Search
        if ($request->search) {
            $query->search($request->search);
        }
        
        // Load relations
        $orders = $query->withCommonRelations()
            ->withItemsCount()
            ->orderByDesc('created_at')
            ->paginate($request->per_page ?? 20);
        
        return OrderResource::collection($orders);
    }
    
    public function show(Order $order)
    {
        $order->load([
            'customer',
            'vehicle.brand',
            'vehicle.model',
            'orderItems.service',
            'orderItems.product',
            'salesperson',
            'technician',
        ]);
        
        return new OrderResource($order);
    }
}
```

## Testing Scopes

```php
use Tests\TestCase;
use App\Models\Order;

class OrderScopesTest extends TestCase
{
    public function test_status_scope()
    {
        Order::factory()->create(['status' => 'completed']);
        Order::factory()->create(['status' => 'draft']);
        
        $completed = Order::status('completed')->count();
        
        $this->assertEquals(1, $completed);
    }
    
    public function test_recent_scope()
    {
        Order::factory()->create(['created_at' => now()->subDays(10)]);
        Order::factory()->create(['created_at' => now()->subDays(40)]);
        
        $recent = Order::recent(30)->count();
        
        $this->assertEquals(1, $recent);
    }
}
```

## Performance Tips

1. **Sử dụng Index**: Các scope đã được thiết kế với index trong database
2. **Eager Loading**: Luôn dùng `with()` để tránh N+1
3. **Select Specific Columns**: Chỉ select columns cần thiết
4. **Pagination**: Luôn paginate cho list lớn
5. **Cache**: Cache kết quả cho queries thường xuyên

```php
// Cache example
$topProducts = Cache::remember('top_products', 3600, function () {
    return Product::bestSelling(30)
        ->active()
        ->take(10)
        ->get();
});
```

## Tổng Kết

- ✅ 19 API Resources với role-based fields
- ✅ 11 Query Scopes traits với 200+ scope methods
- ✅ Không sử dụng DB::raw, chỉ dùng Eloquent relations
- ✅ Mỗi scope method chỉ 1 query duy nhất
- ✅ Tối ưu cho dự án lớn với cấu trúc module rõ ràng

