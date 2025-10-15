# Hệ thống Permission-Based Access Control (PBAC)

## 🎯 Tổng quan

Thay vì hard-code kiểm tra role như trước:
```typescript
if (user.role.name === 'admin') { ... }
```

Bây giờ sử dụng **Permission-Based System** linh hoạt:
```typescript
if (user.hasPermission('users.delete')) { ... }
```

## 📋 Kiến trúc hệ thống

### Backend (Laravel)

#### 1. User Model - Permission Methods
**File:** `backend/app/Models/User.php`

```php
// Kiểm tra permission cụ thể
$user->hasPermission('users.view');        // true/false
$user->hasPermission('orders.create');     // true/false

// Wildcard support
$user->hasPermission('users.*');           // Có tất cả quyền về users

// Kiểm tra nhiều permissions
$user->hasAnyPermission(['users.view', 'users.create']);
$user->hasAllPermissions(['orders.view', 'orders.update']);

// Lấy tất cả permissions
$permissions = $user->getAllPermissions();

// Kiểm tra role (backward compatible)
$user->hasRole('admin');
$user->hasAnyRole(['admin', 'manager']);
```

#### 2. CheckPermission Middleware
**File:** `backend/app/Http/Middleware/CheckPermission.php`

**Sử dụng trong routes:**
```php
// Kiểm tra 1 permission
Route::get('/users', [UserController::class, 'index'])
    ->middleware('permission:users.view');

// Kiểm tra nhiều permissions (OR logic)
Route::post('/users', [UserController::class, 'store'])
    ->middleware('permission:users.create,users.manage');

// Kiểm tra nhiều permissions trong group
Route::middleware(['permission:orders.view'])->group(function () {
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
});
```

#### 3. Permission Format

Tất cả permissions theo format: `resource.action`

**Ví dụ:**
- `users.view` - Xem danh sách users
- `users.create` - Tạo user mới
- `users.update` - Cập nhật user
- `users.delete` - Xóa user
- `users.*` - Tất cả quyền về users

**Resources:**
- `users` - Quản lý người dùng
- `roles` - Quản lý vai trò
- `customers` - Quản lý khách hàng
- `products` - Quản lý sản phẩm
- `services` - Quản lý dịch vụ
- `orders` - Quản lý đơn hàng
- `invoices` - Quản lý hóa đơn
- `payments` - Quản lý thanh toán
- `warehouses` - Quản lý kho
- `providers` - Quản lý nhà cung cấp
- `reports` - Báo cáo
- `settings` - Cài đặt

**Actions:**
- `view` - Xem danh sách
- `create` - Tạo mới
- `update` - Cập nhật
- `delete` - Xóa
- `manage` - Quản lý đầy đủ
- `*` - Tất cả actions

#### 4. Role Permissions trong Database

**Table:** `roles`
```json
{
  "name": "manager",
  "permissions": [
    "users.view",
    "customers.*",
    "orders.*",
    "products.view",
    "reports.view"
  ]
}
```

#### 5. Custom Permissions cho User

**Table:** `users` - Column: `custom_permissions`
```json
{
  "custom_permissions": [
    "invoices.view",      // Thêm quyền mới
    "!orders.delete",     // Deny quyền (override role)
    "reports.*"           // Tất cả quyền về reports
  ]
}
```

**Logic:**
1. Check `custom_permissions` trước (cao nhất)
2. Nếu có `!permission` → Deny (return false)
3. Nếu không có trong custom → Check role permissions
4. Admin luôn có tất cả quyền

---

### Frontend (React + TypeScript)

#### 1. Permission Context
**File:** `frontend/app/contexts/PermissionContext.tsx`

**Setup:**
```typescript
import { PermissionProvider } from '~/contexts/PermissionContext';

// Wrap App component
function App() {
  return (
    <PermissionProvider>
      <YourApp />
    </PermissionProvider>
  );
}
```

#### 2. usePermissions Hook

```typescript
import { usePermissions } from '~/contexts/PermissionContext';

function MyComponent() {
  const { 
    permissions,           // Tất cả permissions
    role,                  // Role name
    hasPermission,         // Kiểm tra 1 permission
    hasAnyPermission,      // Kiểm tra nhiều permissions (OR)
    hasAllPermissions,     // Kiểm tra nhiều permissions (AND)
    hasRole,               // Kiểm tra role
  } = usePermissions();

  // Sử dụng
  if (hasPermission('users.delete')) {
    // Show delete button
  }

  if (hasAnyPermission(['users.create', 'users.update'])) {
    // Show edit form
  }

  if (hasRole('admin')) {
    // Show admin panel
  }

  return <div>...</div>;
}
```

#### 3. Can Component - Conditional Rendering

**File:** `frontend/app/components/permissions/Can.tsx`

```typescript
import { Can, Cannot } from '~/components/permissions';

// ✅ Kiểm tra 1 permission
<Can permission="users.view">
  <button>Xem Users</button>
</Can>

// ✅ Kiểm tra nhiều permissions (OR logic)
<Can permission={["users.create", "users.update"]}>
  <button>Quản lý Users</button>
</Can>

// ✅ Kiểm tra nhiều permissions (AND logic)
<Can permission={["orders.view", "orders.update"]} logic="all">
  <button>Cập nhật Đơn hàng</button>
</Can>

// ✅ Kiểm tra role
<Can role="admin">
  <AdminPanel />
</Can>

// ✅ Với fallback
<Can 
  permission="users.delete" 
  fallback={<span>Không có quyền</span>}
>
  <button>Xóa User</button>
</Can>

// ✅ Ngược lại - Cannot
<Cannot permission="users.delete">
  <p className="text-red-500">Bạn không có quyền xóa user</p>
</Cannot>
```

---

## 🚀 Migration từ Hard-coded Roles

### Trước (Hard-coded Role):

```typescript
// ❌ BAD: Hard-code role
function UserList() {
  const { user } = useAuth();
  
  return (
    <div>
      {user.role.name === 'admin' && (
        <button>Delete</button>
      )}
      
      {['admin', 'manager'].includes(user.role.name) && (
        <button>Edit</button>
      )}
    </div>
  );
}
```

### Sau (Permission-based):

```typescript
// ✅ GOOD: Permission-based
function UserList() {
  return (
    <div>
      <Can permission="users.delete">
        <button>Delete</button>
      </Can>
      
      <Can permission="users.update">
        <button>Edit</button>
      </Can>
    </div>
  );
}
```

---

## 📊 Ví dụ thực tế

### 1. Trang Users Management

```typescript
import { Can } from '~/components/permissions';

function UsersPage() {
  return (
    <div>
      <h1>Quản lý Users</h1>
      
      {/* Nút tạo user - Chỉ ai có quyền users.create */}
      <Can permission="users.create">
        <Button onClick={handleCreate}>Tạo User Mới</Button>
      </Can>
      
      <Table>
        {users.map(user => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td>
              {/* Nút sửa - Chỉ ai có quyền users.update */}
              <Can permission="users.update">
                <Button onClick={() => handleEdit(user)}>Sửa</Button>
              </Can>
              
              {/* Nút xóa - Chỉ ai có quyền users.delete */}
              <Can permission="users.delete">
                <Button onClick={() => handleDelete(user)}>Xóa</Button>
              </Can>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
```

### 2. Sidebar Menu Dynamic

```typescript
import { Can } from '~/components/permissions';

function Sidebar() {
  return (
    <nav>
      <Can permission="dashboard.view">
        <Link to="/dashboard">Dashboard</Link>
      </Can>
      
      <Can permission="users.view">
        <Link to="/users">Users</Link>
      </Can>
      
      <Can permission="orders.view">
        <Link to="/orders">Orders</Link>
      </Can>
      
      <Can permission="reports.view">
        <Link to="/reports">Reports</Link>
      </Can>
      
      {/* Chỉ admin mới thấy */}
      <Can role="admin">
        <Link to="/settings">Settings</Link>
      </Can>
    </nav>
  );
}
```

### 3. API Routes với Permissions

```php
// ❌ TRƯỚC: Hard-code role
Route::middleware(['auth:api'])->group(function () {
    Route::prefix('admin')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
    });
});

// ✅ SAU: Permission-based
Route::middleware(['auth:api'])->group(function () {
    // Ai có quyền users.view đều vào được
    Route::get('/users', [UserController::class, 'index'])
        ->middleware('permission:users.view');
    
    // Ai có quyền users.create đều tạo được
    Route::post('/users', [UserController::class, 'store'])
        ->middleware('permission:users.create');
    
    // Ai có quyền users.delete đều xóa được
    Route::delete('/users/{id}', [UserController::class, 'destroy'])
        ->middleware('permission:users.delete');
});
```

---

## 🔧 Quản lý Permissions

### 1. Tạo Role với Permissions

```php
Role::create([
    'name' => 'sale_manager',
    'display_name' => 'Quản lý Bán hàng',
    'permissions' => [
        'customers.*',      // Tất cả quyền về customers
        'orders.view',
        'orders.create',
        'orders.update',
        'products.view',
        'reports.view',
    ]
]);
```

### 2. Gán Custom Permissions cho User

```php
$user = User::find(1);
$user->custom_permissions = [
    'invoices.view',        // Thêm quyền xem invoice
    'reports.manage',       // Thêm quyền quản lý reports
    '!orders.delete',       // Deny quyền xóa orders (override role)
];
$user->save();
```

### 3. Kiểm tra trong Controller

```php
public function deleteUser($id) {
    // Kiểm tra permission
    if (!auth()->user()->hasPermission('users.delete')) {
        return response()->json([
            'message' => 'Bạn không có quyền xóa user'
        ], 403);
    }
    
    // Thực hiện xóa
    User::destroy($id);
}
```

---

## 🎨 Best Practices

### 1. Đặt tên Permissions rõ ràng
```
✅ GOOD: users.view, users.create, users.update, users.delete
❌ BAD: user_list, add_user, modify_user, remove_user
```

### 2. Sử dụng Wildcards hợp lý
```php
'users.*'      // Tất cả quyền về users
'reports.*'    // Tất cả quyền về reports
```

### 3. Deny Permissions với !
```php
'custom_permissions' => [
    'users.*',           // Có tất cả quyền users
    '!users.delete',     // Trừ quyền delete
]
```

### 4. Group Permissions theo Resource
```php
'permissions' => [
    // Users
    'users.view',
    'users.create',
    'users.update',
    
    // Orders
    'orders.view',
    'orders.create',
    
    // Reports
    'reports.*',
]
```

---

## 🔍 Troubleshooting

### Permission không hoạt động?

1. **Kiểm tra user đã login chưa**
```typescript
const { isLoading, permissions } = usePermissions();
console.log('Permissions:', permissions);
```

2. **Kiểm tra role có permissions chưa**
```php
$user = auth()->user();
dd($user->getAllPermissions());
```

3. **Kiểm tra middleware đã đăng ký chưa**
```php
// bootstrap/app.php
'permission' => \App\Http\Middleware\CheckPermission::class,
```

4. **Clear cache**
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

---

## 📈 Lợi ích của PBAC

### ✅ Linh hoạt
- Không cần tạo route riêng cho từng role
- Dễ dàng thêm/bớt quyền
- Custom permissions cho từng user

### ✅ Tái sử dụng
- 1 API endpoint phục vụ nhiều roles
- Không duplicate code
- DRY principle

### ✅ Bảo mật
- Kiểm tra permissions ở cả Backend và Frontend
- Fine-grained access control
- Audit trail dễ dàng

### ✅ Scalable
- Dễ dàng thêm resources mới
- Không cần refactor khi thêm role
- Support enterprise requirements

---

## 📝 Checklist Migration

- [ ] Tạo danh sách tất cả permissions cần thiết
- [ ] Update role permissions trong database
- [ ] Thêm CheckPermission middleware vào routes
- [ ] Wrap App với PermissionProvider
- [ ] Thay thế hard-coded role checks bằng `<Can>`
- [ ] Test với các roles khác nhau
- [ ] Update documentation
- [ ] Train team về permission system

---

## 🎓 Tài liệu tham khảo

- **Backend:** `backend/app/Models/User.php` - Permission methods
- **Middleware:** `backend/app/Http/Middleware/CheckPermission.php`
- **Frontend Context:** `frontend/app/contexts/PermissionContext.tsx`
- **Components:** `frontend/app/components/permissions/Can.tsx`

**Version:** 1.0.0  
**Date:** October 15, 2024  
**Author:** AI Assistant

