# 🔐 HỆ THỐNG PERMISSION-BASED ACCESS CONTROL - HOÀN CHỈNH

## 📋 TỔNG QUAN

Hệ thống đã được **chuẩn hóa hoàn toàn** sang **Permission-Based Access Control (PBAC)** kết hợp với Role-Based Access Control (RBAC).

### ✅ Ưu điểm của hệ thống mới:

1. **Linh hoạt**: Phân quyền chi tiết theo từng action cụ thể
2. **Dễ bảo trì**: Tập trung quản lý permissions tại một nơi
3. **Mở rộng**: Dễ dàng thêm permissions mới
4. **Kết hợp Role**: Giữ lại khả năng kiểm tra role khi cần
5. **Custom Permissions**: User có thể có quyền riêng override role

---

## 🏗️ KIẾN TRÚC HỆ THỐNG

### Backend (Laravel)

```
backend/
├── app/
│   ├── Services/
│   │   └── PermissionRegistry.php          # Quản lý tập trung permissions
│   ├── Traits/
│   │   └── HasPermissions.php              # Helper methods cho Controllers
│   ├── Http/
│   │   ├── Middleware/
│   │   │   └── CheckPermission.php         # Middleware kiểm tra permissions
│   │   └── Controllers/
│   │       └── Api/Admin/
│   │           └── BadgeController.php     # Đã cập nhật dùng permissions
│   └── Models/
│       ├── User.php                        # hasPermission(), hasAnyPermission()
│       └── Role.php                        # Lưu permissions dạng JSON
└── routes/
    └── api.php                             # Routes được bảo vệ bởi middleware
```

### Frontend (React)

```
frontend/app/
├── contexts/
│   └── PermissionContext.tsx               # Context cung cấp permissions
├── components/
│   └── permissions/
│       ├── Can.tsx                         # Component điều kiện hiển thị
│       ├── Cannot.tsx                      # Component ngược lại
│       ├── PermissionGate.tsx              # Bảo vệ routes
│       ├── PermissionSelector.tsx          # UI chọn permissions
│       └── index.ts                        # Export tất cả
├── hooks/
│   └── usePermissions.ts                   # Hook sử dụng permissions
└── utils/
    └── permissions.ts                      # Helper functions
```

---

## 🔧 BACKEND - SỬ DỤNG

### 1. PermissionRegistry Service

**File:** `backend/app/Services/PermissionRegistry.php`

Quản lý tập trung tất cả permissions trong hệ thống.

```php
use App\Services\PermissionRegistry;

// Lấy tất cả permissions
$permissions = PermissionRegistry::getAllPermissions();

// Lấy permissions của role
$managerPerms = PermissionRegistry::getPermissionsByRole('manager');

// Expand wildcard
$expanded = PermissionRegistry::expandWildcardPermissions(['users.*']);
// => ['users.view', 'users.create', 'users.edit', 'users.delete', 'users.activate']

// Validate permission
$isValid = PermissionRegistry::isValidPermission('users.view'); // true
```

**Permissions định nghĩa:**

```php
public const PERMISSIONS = [
    'users.view' => 'Xem danh sách người dùng',
    'users.create' => 'Tạo người dùng mới',
    'users.edit' => 'Chỉnh sửa người dùng',
    'users.delete' => 'Xóa người dùng',
    'orders.manage_all' => 'Quản lý tất cả đơn hàng',
    'orders.manage_own' => 'Quản lý đơn hàng được giao',
    // ... và nhiều permissions khác
];
```

**Role Permissions mặc định:**

```php
public const ROLE_PERMISSIONS = [
    'admin' => ['*'], // Tất cả quyền
    'manager' => [
        'dashboard.*',
        'orders.*',
        'customers.*',
        'users.view',
        // ...
    ],
    'accountant' => [
        'invoices.*',
        'payments.*',
        'settlements.*',
        // ...
    ],
    // ...
];
```

### 2. HasPermissions Trait

**File:** `backend/app/Traits/HasPermissions.php`

Sử dụng trong Controllers để kiểm tra quyền.

```php
use App\Traits\HasPermissions;

class OrderController extends Controller
{
    use HasPermissions;

    public function index()
    {
        // Kiểm tra quyền
        $this->authorizePermission('orders.view');

        // Lọc dữ liệu theo quyền
        $query = Order::query();
        $query = $this->scopeByPermission(
            $query,
            'orders.manage_all',  // Quyền xem tất cả
            'orders.manage_own',  // Quyền xem của mình
            'salesperson_id'      // Column để filter
        );

        return $query->paginate(20);
    }

    public function destroy($id)
    {
        // Kiểm tra nhiều quyền
        $this->authorizeAnyPermission(['orders.delete', 'orders.manage_all']);

        $order = Order::findOrFail($id);
        $order->delete();

        return response()->json(['success' => true]);
    }
}
```

**Helper methods:**

- `userHasPermission($permission)` - Kiểm tra permission
- `userHasAnyPermission($permissions)` - Có ít nhất 1 permission
- `userHasAllPermissions($permissions)` - Có tất cả permissions
- `authorizePermission($permission)` - Abort 403 nếu không có quyền
- `authorizeAnyPermission($permissions)` - Abort 403 nếu không có bất kỳ quyền nào
- `scopeByPermission($query, $manageAll, $manageOwn, $column)` - Lọc query theo quyền

### 3. Routes với Permission Middleware

**File:** `backend/routes/api.php`

```php
// Bảo vệ single route
Route::get('/users', [UserController::class, 'index'])
    ->middleware('permission:users.view');

// Bảo vệ nhiều routes
Route::middleware('permission:users.view')->group(function () {
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{id}', [UserController::class, 'show']);
});

// OR logic - có 1 trong các permissions
Route::post('/orders/{id}/update', [OrderController::class, 'update'])
    ->middleware('permission:orders.edit,orders.manage_all');
```

### 4. User Model Methods

**File:** `backend/app/Models/User.php`

```php
$user = Auth::user();

// Kiểm tra permission cụ thể
$user->hasPermission('users.view'); // true/false
$user->hasPermission('orders.*');   // wildcard support

// Kiểm tra nhiều permissions
$user->hasAnyPermission(['users.view', 'users.create']);
$user->hasAllPermissions(['orders.view', 'orders.edit']);

// Lấy tất cả permissions
$permissions = $user->getAllPermissions();

// Kiểm tra role (backward compatible)
$user->hasRole('admin');
$user->hasAnyRole(['admin', 'manager']);
```

---

## 🎨 FRONTEND - SỬ DỤNG

### 1. Setup PermissionProvider

**File:** `frontend/app/root.tsx`

```tsx
import { PermissionProvider } from '~/components/permissions';

export default function App() {
  return (
    <AuthProvider>
      <PermissionProvider>
        {/* Your app */}
      </PermissionProvider>
    </AuthProvider>
  );
}
```

### 2. usePermissions Hook

```tsx
import { usePermissions } from '~/components/permissions';

function MyComponent() {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessModule,
    isAdmin,
    user
  } = usePermissions();

  // Kiểm tra permission
  if (hasPermission('users.create')) {
    // Show create button
  }

  // Kiểm tra nhiều permissions
  if (hasAnyPermission(['users.edit', 'users.delete'])) {
    // Show actions
  }

  // Kiểm tra role
  if (isAdmin()) {
    // Admin only features
  }

  // Kiểm tra module access
  if (canAccessModule('orders')) {
    // Show orders menu
  }

  return <div>...</div>;
}
```

### 3. Can Component - Điều kiện hiển thị

```tsx
import { Can } from '~/components/permissions';

function UsersPage() {
  return (
    <div>
      {/* Hiển thị nút tạo nếu có quyền */}
      <Can permission="users.create">
        <button onClick={handleCreate}>Tạo mới</button>
      </Can>

      {/* Kiểm tra nhiều quyền (OR) */}
      <Can permission={["users.edit", "users.delete"]}>
        <button>Actions</button>
      </Can>

      {/* Kiểm tra nhiều quyền (AND) */}
      <Can permission={["orders.view", "orders.edit"]} logic="all">
        <button>Cập nhật đơn hàng</button>
      </Can>

      {/* Với fallback */}
      <Can 
        permission="users.delete"
        fallback={<span className="text-gray-400">Không có quyền xóa</span>}
      >
        <button>Xóa</button>
      </Can>

      {/* Kiểm tra role */}
      <Can role="admin">
        <AdminPanel />
      </Can>
    </div>
  );
}
```

### 4. Cannot Component - Ngược lại

```tsx
import { Cannot } from '~/components/permissions';

function OrdersPage() {
  return (
    <div>
      {/* Hiển thị message khi KHÔNG có quyền */}
      <Cannot permission="orders.edit">
        <div className="alert alert-warning">
          Bạn chỉ có quyền xem, không thể chỉnh sửa đơn hàng
        </div>
      </Cannot>

      {/* Disable button khi không có quyền */}
      <button 
        disabled={!hasPermission('orders.approve')}
        onClick={handleApprove}
      >
        Phê duyệt
      </button>
    </div>
  );
}
```

### 5. PermissionGate - Bảo vệ Routes

```tsx
import { PermissionGate } from '~/components/permissions';

// Trong route component
export default function UsersPage() {
  return (
    <PermissionGate permission="users.view">
      <div>
        <h1>Quản lý người dùng</h1>
        {/* Page content */}
      </div>
    </PermissionGate>
  );
}

// Bảo vệ với nhiều permissions
export default function OrdersManagementPage() {
  return (
    <PermissionGate 
      permission={["orders.view", "orders.edit"]} 
      logic="all"
    >
      <OrdersManagement />
    </PermissionGate>
  );
}

// Với custom fallback
export default function AdminPage() {
  return (
    <PermissionGate 
      role="admin"
      fallback={<NoPermissionPage />}
    >
      <AdminPanel />
    </PermissionGate>
  );
}
```

### 6. PermissionSelector - UI chọn permissions

```tsx
import { PermissionSelector } from '~/components/permissions';

function RoleEditModal({ role, onSave }) {
  const [permissions, setPermissions] = useState(role.permissions);

  return (
    <div>
      <h3>Chọn quyền cho vai trò</h3>
      <PermissionSelector 
        value={permissions}
        onChange={setPermissions}
        mode="detailed"
      />
      <button onClick={() => onSave({ ...role, permissions })}>
        Lưu
      </button>
    </div>
  );
}
```

---

## 📊 DANH SÁCH PERMISSIONS

### Modules và Actions

| Module | Actions | Mô tả |
|--------|---------|-------|
| **users** | view, create, edit, delete, activate | Quản lý người dùng |
| **roles** | view, create, edit, delete | Quản lý vai trò |
| **customers** | view, create, edit, delete | Quản lý khách hàng |
| **vehicles** | view, create, edit, delete | Quản lý phương tiện |
| **products** | view, create, edit, delete | Quản lý sản phẩm |
| **services** | view, create, edit, delete | Quản lý dịch vụ |
| **categories** | view, create, edit, delete | Quản lý danh mục |
| **orders** | view, create, edit, delete, approve, cancel, assign, manage_all, manage_own | Quản lý đơn hàng |
| **invoices** | view, create, edit, delete, approve, cancel | Quản lý hóa đơn |
| **payments** | view, create, edit, delete, confirm, verify | Quản lý thanh toán |
| **settlements** | view, create, edit, delete, approve | Quản lý đối soát |
| **warehouses** | view, create, edit, delete, stocktake | Quản lý kho |
| **stocks** | view, create, edit, delete, transfer | Quản lý tồn kho |
| **providers** | view, create, edit, delete | Quản lý nhà cung cấp |
| **service_requests** | view, create, edit, delete, approve, assign, manage_all, manage_own | Yêu cầu dịch vụ |
| **reports** | view, export, financial, inventory, operations | Báo cáo |
| **dashboard** | view, overview, statistics | Dashboard |
| **settings** | view, edit, system | Cài đặt |

### Wildcard Support

- `users.*` - Tất cả quyền về users
- `orders.*` - Tất cả quyền về orders
- `*` - Tất cả quyền (Admin only)

### Special Permissions

- `orders.manage_all` - Quản lý tất cả đơn hàng
- `orders.manage_own` - Chỉ quản lý đơn hàng được giao
- `service_requests.manage_all` - Quản lý tất cả yêu cầu
- `service_requests.manage_own` - Chỉ quản lý yêu cầu được giao

---

## 🔄 MIGRATION TỪ ROLE-BASED

### Before (Role-Based) ❌

```php
// Backend Controller
if ($user->role->name === 'admin') {
    // Admin logic
}

// Frontend Component
if (user.role.name === 'admin') {
    // Show admin features
}
```

### After (Permission-Based) ✅

```php
// Backend Controller
if ($user->hasPermission('users.delete')) {
    // Delete logic
}

// Frontend Component
<Can permission="users.delete">
  <DeleteButton />
</Can>
```

---

## 🎯 BEST PRACTICES

### 1. Sử dụng permissions thay vì roles

```tsx
// ❌ Bad
if (user.role.name === 'admin' || user.role.name === 'manager') {
  // Show feature
}

// ✅ Good
<Can permission="orders.approve">
  {/* Show feature */}
</Can>
```

### 2. Đặt tên permissions rõ ràng

```php
// ✅ Good
'orders.approve'
'invoices.confirm'
'payments.verify'

// ❌ Bad
'orders.action1'
'invoices.do_something'
```

### 3. Sử dụng manage_all và manage_own

```php
// Cho phép user xem tất cả hoặc chỉ của mình
$query = $this->scopeByPermission(
    $query,
    'orders.manage_all',  // Xem tất cả
    'orders.manage_own',  // Chỉ xem của mình
    'salesperson_id'
);
```

### 4. Group permissions trong routes

```php
Route::middleware('permission:users.view')->group(function () {
    // Tất cả routes cần quyền users.view
    Route::get('/users', ...);
    Route::get('/users/{id}', ...);
});
```

---

## ✅ CHECKLIST HOÀN THÀNH

### Backend
- ✅ PermissionRegistry Service
- ✅ HasPermissions Trait
- ✅ CheckPermission Middleware
- ✅ BadgeController cập nhật dùng permissions
- ✅ Routes được bảo vệ bởi middleware
- ✅ User Model có permission methods

### Frontend
- ✅ PermissionContext
- ✅ usePermissions Hook
- ✅ Can Component
- ✅ Cannot Component
- ✅ PermissionGate Component
- ✅ PermissionSelector Component
- ✅ NoPermissionPage Component

### Documentation
- ✅ Hướng dẫn sử dụng đầy đủ
- ✅ Examples cho mỗi feature
- ✅ Migration guide
- ✅ Best practices

---

## 📝 NOTES

1. **Admin luôn có tất cả quyền** - Được check trong code
2. **Custom permissions override role permissions** - User có thể có quyền riêng
3. **Wildcard support** - Dùng `users.*` cho tất cả quyền về users
4. **Backward compatible** - Vẫn có thể check role khi cần: `user.hasRole('admin')`
5. **Performance** - Permissions được load cùng user, không cần query thêm

---

## 🚀 NEXT STEPS

1. ✅ Cập nhật tất cả controllers sử dụng HasPermissions trait
2. ✅ Cập nhật tất cả frontend pages sử dụng PermissionGate
3. ✅ Thay thế tất cả `role.name` checks bằng permissions
4. ✅ Test kỹ tất cả permissions
5. ✅ Cập nhật seeders với permissions mới

---

**Hệ thống Permission-Based đã sẵn sàng sử dụng! 🎉**

