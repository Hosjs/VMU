# 🚀 QUICK START - PERMISSION SYSTEM

## ⚡ Bắt đầu nhanh trong 5 phút

### 1️⃣ Backend - Reload Autoloader (BẮT BUỘC)

Mở terminal trong thư mục `backend/` và chạy:

```bash
composer dump-autoload
```

Lệnh này sẽ load các class mới:
- `App\Services\PermissionRegistry`
- `App\Traits\HasPermissions`

### 2️⃣ Test Permission System

#### Test API:

```bash
# Login và lấy token
POST http://localhost/gara/backend/public/api/auth/login
{
  "email": "admin@example.com",
  "password": "password"
}

# Test permission middleware
GET http://localhost/gara/backend/public/api/admin/users
Authorization: Bearer {your_token}
# Sẽ check permission "users.view"

# Test badge counts (đã dùng permission-based)
GET http://localhost/gara/backend/public/api/badges/counts
Authorization: Bearer {your_token}
```

### 3️⃣ Frontend - Wrap với PermissionProvider

**File:** `frontend/app/root.tsx`

```tsx
import { AuthProvider } from '~/contexts/AuthContext';
import { PermissionProvider } from '~/components/permissions';

export default function App() {
  return (
    <AuthProvider>
      <PermissionProvider>
        <Outlet />
      </PermissionProvider>
    </AuthProvider>
  );
}
```

### 4️⃣ Sử dụng trong Components

#### Ví dụ 1: Ẩn/hiện button theo quyền

```tsx
import { Can } from '~/components/permissions';

function UsersPage() {
  return (
    <div>
      <h1>Quản lý người dùng</h1>
      
      {/* Chỉ hiển thị nếu có quyền */}
      <Can permission="users.create">
        <button>Tạo người dùng mới</button>
      </Can>
      
      <Can permission="users.delete">
        <button className="btn-danger">Xóa</button>
      </Can>
    </div>
  );
}
```

#### Ví dụ 2: Bảo vệ page

```tsx
import { PermissionGate } from '~/components/permissions';

export default function UsersPage() {
  return (
    <PermissionGate permission="users.view">
      <div>
        <h1>Danh sách người dùng</h1>
        {/* Page content */}
      </div>
    </PermissionGate>
  );
}
```

#### Ví dụ 3: Sử dụng hook

```tsx
import { usePermissions } from '~/components/permissions';

function OrdersPage() {
  const { hasPermission, hasAnyPermission } = usePermissions();
  
  const canEdit = hasPermission('orders.edit');
  const canManage = hasAnyPermission(['orders.approve', 'orders.cancel']);
  
  return (
    <div>
      {canEdit && <button>Chỉnh sửa</button>}
      {canManage && <button>Quản lý</button>}
    </div>
  );
}
```

### 5️⃣ Backend Controller - Sử dụng Trait

```php
<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Traits\HasPermissions;
use App\Models\Order;

class OrderController extends Controller
{
    use HasPermissions;

    public function index()
    {
        // Check permission
        $this->authorizePermission('orders.view');
        
        // Scope by permission
        $query = Order::query();
        $query = $this->scopeByPermission(
            $query,
            'orders.manage_all',   // Xem tất cả
            'orders.manage_own',   // Chỉ xem của mình
            'salesperson_id'       // Column để filter
        );
        
        return response()->json($query->paginate(20));
    }
    
    public function destroy($id)
    {
        // Check nhiều permissions (OR logic)
        $this->authorizeAnyPermission([
            'orders.delete',
            'orders.manage_all'
        ]);
        
        $order = Order::findOrFail($id);
        $order->delete();
        
        return response()->json(['success' => true]);
    }
}
```

---

## 📋 CHECKLIST TRIỂN KHAI

### Backend ✅
- [x] PermissionRegistry Service
- [x] HasPermissions Trait
- [x] CheckPermission Middleware
- [x] BadgeController updated
- [x] All routes protected
- [ ] **TODO: Run `composer dump-autoload`** ⚠️

### Frontend 🔄
- [x] PermissionContext created
- [x] Can/Cannot components
- [x] PermissionGate component
- [ ] **TODO: Wrap app với PermissionProvider** ⚠️
- [ ] **TODO: Update admin pages với PermissionGate** ⚠️
- [ ] **TODO: Update action buttons với Can** ⚠️

### Database 🔄
- [ ] **TODO: Update role permissions trong DB**
- [ ] **TODO: Test với các roles khác nhau**

---

## 🔥 COMMON USE CASES

### 1. Ẩn menu item nếu không có quyền

```tsx
import { Can } from '~/components/permissions';

function Sidebar() {
  return (
    <nav>
      <Can permission="users.view">
        <MenuItem href="/admin/users">Người dùng</MenuItem>
      </Can>
      
      <Can permission="orders.view">
        <MenuItem href="/admin/orders">Đơn hàng</MenuItem>
      </Can>
      
      <Can permission="reports.view">
        <MenuItem href="/admin/reports">Báo cáo</MenuItem>
      </Can>
    </nav>
  );
}
```

### 2. Disable button nếu không có quyền

```tsx
import { usePermissions } from '~/components/permissions';

function OrderDetail({ order }) {
  const { hasPermission } = usePermissions();
  
  return (
    <div>
      <button 
        disabled={!hasPermission('orders.approve')}
        onClick={handleApprove}
      >
        Phê duyệt
      </button>
      
      <button 
        disabled={!hasPermission('orders.cancel')}
        onClick={handleCancel}
      >
        Hủy đơn
      </button>
    </div>
  );
}
```

### 3. Hiển thị message khác nhau theo quyền

```tsx
import { Can, Cannot } from '~/components/permissions';

function OrdersPage() {
  return (
    <div>
      <Can permission="orders.manage_all">
        <p className="text-success">
          Bạn có quyền xem tất cả đơn hàng trong hệ thống
        </p>
      </Can>
      
      <Can permission="orders.manage_own">
        <Cannot permission="orders.manage_all">
          <p className="text-warning">
            Bạn chỉ có thể xem đơn hàng được giao cho mình
          </p>
        </Cannot>
      </Can>
    </div>
  );
}
```

### 4. Conditional columns trong table

```tsx
import { usePermissions } from '~/components/permissions';

function UsersTable() {
  const { hasPermission } = usePermissions();
  
  return (
    <table>
      <thead>
        <tr>
          <th>Tên</th>
          <th>Email</th>
          {hasPermission('users.edit') && <th>Hành động</th>}
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td>{user.email}</td>
            {hasPermission('users.edit') && (
              <td>
                <button>Sửa</button>
                {hasPermission('users.delete') && (
                  <button>Xóa</button>
                )}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

## ⚠️ QUAN TRỌNG

### 1. Backend LUÔN check permissions
Frontend chỉ để improve UX, **KHÔNG PHẢI security layer**:

```php
// ❌ BAD - Chỉ check ở frontend
<Can permission="users.delete">
  <button onClick={deleteUser} /> {/* Có thể bypass bằng DevTools */}
</Can>

// ✅ GOOD - Check cả 2 nơi
// Frontend (UX)
<Can permission="users.delete">
  <button onClick={deleteUser} />
</Can>

// Backend (Security)
Route::delete('/users/{id}', [UserController::class, 'destroy'])
    ->middleware('permission:users.delete');
```

### 2. Admin luôn có tất cả quyền
Admin được check trong User model:

```php
public function hasPermission(string $permission): bool
{
    // Admin bypass tất cả
    if ($this->role && $this->role->name === 'admin') {
        return true;
    }
    
    // ... check permissions
}
```

### 3. Custom permissions override role permissions
User có thể có quyền riêng trong `custom_permissions` field:

```json
{
  "custom_permissions": {
    "users": ["view", "edit"],
    "orders": ["view", "create", "manage_own"]
  }
}
```

---

## 🐛 TROUBLESHOOTING

### Lỗi: "Class PermissionRegistry not found"
**Fix:** Chạy `composer dump-autoload` trong backend/

### Lỗi: "usePermissions must be used within PermissionProvider"
**Fix:** Wrap app với `<PermissionProvider>` trong root.tsx

### Lỗi: 403 Forbidden khi call API
**Fix:** Check permissions của user trong database, hoặc check middleware ở routes

### Badge counts không cập nhật
**Fix:** Badge đã dùng permission-based, check xem user có đúng permissions không

---

## 📚 TÀI LIỆU CHI TIẾT

Xem thêm:
- `PERMISSION_BASED_SYSTEM_COMPLETE.md` - Hướng dẫn đầy đủ (400+ dòng)
- `PROJECT_STRUCTURE_PERMISSION_SYSTEM.md` - Cấu trúc dự án
- `PERMISSION_SYSTEM_COMPLETION_REPORT.md` - Báo cáo hoàn thành

---

**Hệ thống sẵn sàng sử dụng! 🎉**

Chỉ cần chạy `composer dump-autoload` và bắt đầu code!

