# HỆ THỐNG PHÂN QUYỀN - HƯỚNG DẪN SỬ DỤNG

## 📚 Tổng quan

Hệ thống phân quyền đã được tích hợp đầy đủ vào dự án với các tính năng:

✅ **Backend (Laravel)**:
- Models: User, Role, UserRole với relationships đầy đủ
- API quản lý roles và permissions
- Cấu trúc permissions dạng JSON linh hoạt

✅ **Frontend (React)**:
- Utils functions đầy đủ cho permission checking
- Custom hooks: `usePermissions`
- Components: `PermissionGate`, `PermissionButton`
- Tích hợp vào AuthContext

---

## 🏗️ Cấu trúc Database

### Bảng `roles`
```sql
- id
- name (unique)           # admin, manager, accountant, employee, mechanic
- display_name            # Tên hiển thị
- description             # Mô tả vai trò
- permissions (JSON)      # {"users": ["view", "create"], ...}
- is_active
- timestamps
```

### Bảng `user_roles`
```sql
- id
- user_id (unique)        # Mỗi user chỉ có 1 role
- role_id
- assigned_at
- assigned_by
- is_active
- timestamps
```

---

## 🔧 Cách sử dụng trong Frontend

### 1. Kiểm tra quyền trong Component

#### Sử dụng Hook `usePermissions`
```typescript
import { usePermissions } from '~/hooks/usePermissions';

function MyComponent() {
  const permissions = usePermissions();

  // Kiểm tra quyền cụ thể
  if (permissions.hasPermission('users.create')) {
    // Hiển thị nút tạo user
  }

  // Kiểm tra role
  if (permissions.isAdmin()) {
    // Hiển thị menu admin
  }

  // Kiểm tra module access
  if (permissions.canAccessModule('orders')) {
    // Cho phép truy cập module orders
  }

  return <div>...</div>;
}
```

### 2. Sử dụng Component `PermissionGate`

```typescript
import { PermissionGate } from '~/components/permissions';

function MyPage() {
  return (
    <div>
      {/* Chỉ hiển thị nếu có quyền users.create */}
      <PermissionGate permission="users.create">
        <button>Tạo người dùng</button>
      </PermissionGate>

      {/* Chỉ hiển thị nếu có ít nhất 1 trong các quyền */}
      <PermissionGate anyPermissions={['users.edit', 'users.delete']}>
        <div>Nút sửa/xóa</div>
      </PermissionGate>

      {/* Chỉ hiển thị nếu có tất cả quyền */}
      <PermissionGate allPermissions={['orders.view', 'orders.approve']}>
        <div>Duyệt đơn hàng</div>
      </PermissionGate>

      {/* Kiểm tra role */}
      <PermissionGate role="admin">
        <div>Admin only content</div>
      </PermissionGate>

      {/* Kiểm tra module access */}
      <PermissionGate module="reports">
        <div>Báo cáo</div>
      </PermissionGate>

      {/* Hiển thị fallback nếu không có quyền */}
      <PermissionGate 
        permission="users.delete"
        fallback={<p>Bạn không có quyền xóa người dùng</p>}
      >
        <button>Xóa</button>
      </PermissionGate>
    </div>
  );
}
```

### 3. Sử dụng Component `PermissionButton`

```typescript
import { PermissionButton } from '~/components/permissions';

function UserList() {
  return (
    <div>
      {/* Button chỉ hiển thị nếu có quyền */}
      <PermissionButton 
        permission="users.create"
        onClick={handleCreate}
        variant="primary"
      >
        <svg>...</svg>
        Tạo người dùng
      </PermissionButton>

      {/* Button với nhiều quyền */}
      <PermissionButton 
        anyPermissions={['users.edit', 'users.delete']}
        onClick={handleEdit}
      >
        Sửa
      </PermissionButton>
    </div>
  );
}
```

### 4. Kiểm tra trong AuthContext

```typescript
import { useAuth } from '~/contexts/AuthContext';

function MyComponent() {
  const { user, hasPermission, hasRole } = useAuth();

  if (hasPermission('users.create')) {
    // Có quyền tạo user
  }

  if (hasRole('admin')) {
    // Là admin
  }

  return <div>...</div>;
}
```

---

## 📝 Danh sách Permissions có sẵn

### Format: `module.action`

**Users Module**:
- `users.view` - Xem danh sách người dùng
- `users.create` - Tạo người dùng mới
- `users.edit` - Chỉnh sửa người dùng
- `users.delete` - Xóa người dùng

**Roles Module**:
- `roles.view`, `roles.create`, `roles.edit`, `roles.delete`

**Customers Module**:
- `customers.view`, `customers.create`, `customers.edit`, `customers.delete`

**Products Module**:
- `products.view`, `products.create`, `products.edit`, `products.delete`

**Services Module**:
- `services.view`, `services.create`, `services.edit`, `services.delete`

**Orders Module**:
- `orders.view`, `orders.create`, `orders.edit`, `orders.delete`
- `orders.approve` - Phê duyệt đơn hàng
- `orders.cancel` - Hủy đơn hàng

**Invoices Module**:
- `invoices.view`, `invoices.create`, `invoices.edit`, `invoices.delete`
- `invoices.approve` - Phê duyệt hóa đơn

**Payments Module**:
- `payments.view`, `payments.create`, `payments.edit`, `payments.delete`
- `payments.confirm` - Xác nhận thanh toán
- `payments.verify` - Xác minh thanh toán

**Warehouses Module**:
- `warehouses.view`, `warehouses.create`, `warehouses.edit`, `warehouses.delete`

**Stocks Module**:
- `stocks.view`, `stocks.create`, `stocks.edit`, `stocks.delete`
- `stocks.transfer` - Chuyển kho

**Reports Module**:
- `reports.view` - Xem báo cáo
- `reports.export` - Xuất báo cáo

**Settings Module**:
- `settings.view` - Xem cài đặt
- `settings.edit` - Chỉnh sửa cài đặt

---

## 🎯 Các Role mặc định

### 1. Admin (Quản trị viên)
- **Quyền hạn**: Full quyền trên toàn hệ thống
- **Mô tả**: Có thể làm mọi thứ

### 2. Manager (Quản lý)
- **Quyền hạn**: Quản lý hoạt động kinh doanh và nhân sự
- **Module access**: users, customers, orders, invoices, reports
- **Hạn chế**: Không thể xóa users, không thể quản lý roles

### 3. Accountant (Kế toán)
- **Quyền hạn**: Quản lý tài chính, hóa đơn, thanh toán
- **Module access**: invoices, payments, settlements, reports
- **Hạn chế**: Chỉ xem được customers và orders

### 4. Employee (Nhân viên)
- **Quyền hạn**: Bán hàng và chăm sóc khách hàng
- **Module access**: customers, vehicles, orders, invoices
- **Hạn chế**: Không có quyền approve, verify

### 5. Mechanic (Thợ máy)
- **Quyền hạn**: Sửa chữa và bảo dưỡng xe
- **Module access**: customers (view), vehicles, orders, inspections
- **Hạn chế**: Chỉ có quyền xem customers

---

## 🚀 API Endpoints

### Roles Management

**GET** `/api/admin/roles`
- Lấy danh sách roles
- Params: `search`, `is_active`, `sort_by`, `sort_direction`, `per_page`

**GET** `/api/admin/roles/:id`
- Lấy chi tiết role

**POST** `/api/admin/roles`
- Tạo role mới
```json
{
  "name": "custom_role",
  "display_name": "Custom Role",
  "description": "Mô tả",
  "permissions": {
    "users": ["view", "create"],
    "orders": ["view", "edit"]
  },
  "is_active": true
}
```

**PUT** `/api/admin/roles/:id`
- Cập nhật role

**DELETE** `/api/admin/roles/:id`
- Xóa role (không thể xóa role hệ thống)

**GET** `/api/admin/roles/permissions`
- Lấy danh sách tất cả permissions có sẵn

**GET** `/api/admin/roles/statistics`
- Thống kê roles

### Users Management

**POST** `/api/admin/users`
- Tạo user với role_id
```json
{
  "name": "Nguyễn Văn A",
  "email": "a@example.com",
  "password": "password123",
  "role_id": 2,
  "department": "Kỹ thuật",
  "position": "Nhân viên"
}
```

**PUT** `/api/admin/users/:id`
- Cập nhật user (bao gồm cả role_id để thay đổi vai trò)

---

## 💡 Utility Functions

### Kiểm tra permissions

```typescript
import { 
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canAccessModule,
  getUserPermissions,
  getAccessibleModules,
  isAdmin,
  hasRole
} from '~/utils/permissions';

// Kiểm tra quyền cụ thể
hasPermission(user, 'users.create') // true/false

// Kiểm tra có ít nhất 1 quyền
hasAnyPermission(user, ['users.edit', 'users.delete']) // true/false

// Kiểm tra có tất cả quyền
hasAllPermissions(user, ['orders.view', 'orders.approve']) // true/false

// Kiểm tra truy cập module
canAccessModule(user, 'orders') // true/false

// Lấy tất cả permissions của user
const permissions = getUserPermissions(user)
// { users: ['view', 'create'], orders: ['view', 'edit'] }

// Lấy danh sách modules có thể truy cập
const modules = getAccessibleModules(user)
// ['users', 'customers', 'orders', ...]

// Kiểm tra admin
isAdmin(user) // true/false

// Kiểm tra role
hasRole(user, 'manager') // true/false
```

### Format permissions

```typescript
import { 
  formatPermission,
  getModuleLabel,
  getActionLabel 
} from '~/utils/permissions';

formatPermission('users.create') // "Tạo người dùng"
getModuleLabel('users') // "Người dùng"
getActionLabel('create') // "Tạo mới"
```

---

## 🔒 Bảo mật

### Frontend
- Tất cả UI elements được bảo vệ bởi PermissionGate
- Routes được bảo vệ bởi kiểm tra permissions
- Buttons/Actions ẩn nếu không có quyền

### Backend (Cần triển khai thêm)
- **TODO**: Tạo Middleware để kiểm tra permissions
- **TODO**: Áp dụng middleware vào routes
- **TODO**: Validate permissions trong Controllers

---

## 📦 Files đã tạo/cập nhật

### Frontend
✅ `/app/utils/permissions.ts` - Utils functions đầy đủ
✅ `/app/hooks/usePermissions.ts` - Custom hook
✅ `/app/components/permissions/PermissionGate.tsx` - Gate component
✅ `/app/components/permissions/PermissionButton.tsx` - Button component
✅ `/app/components/permissions/index.ts` - Export file
✅ `/app/contexts/AuthContext.tsx` - Đã tích hợp permissions
✅ `/app/types/auth.ts` - Cập nhật types

### Backend
✅ `/app/Models/User.php` - Có relationships
✅ `/app/Models/Role.php` - Có relationships
✅ `/app/Models/UserRole.php` - Pivot model
✅ `/app/Http/Controllers/Api/Admin/RoleController.php` - API đầy đủ
✅ `/app/Http/Controllers/Api/Admin/UserController.php` - API gán role
✅ `/database/seeders/RoleSeeder.php` - Seed 5 roles mặc định

---

## 🎓 Ví dụ thực tế

### Ví dụ 1: Trang quản lý Users
```typescript
import { usePermissions } from '~/hooks/usePermissions';
import { PermissionGate, PermissionButton } from '~/components/permissions';

function UsersPage() {
  const permissions = usePermissions();

  // Kiểm tra quyền truy cập module
  if (!permissions.canAccessModule('users')) {
    return <div>Bạn không có quyền truy cập trang này</div>;
  }

  return (
    <div>
      <h1>Quản lý người dùng</h1>
      
      {/* Nút tạo chỉ hiển thị nếu có quyền */}
      <PermissionButton 
        permission="users.create"
        onClick={handleCreate}
      >
        Tạo người dùng
      </PermissionButton>

      {/* Table với actions có điều kiện */}
      <table>
        {users.map(user => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td>
              <PermissionButton 
                permission="users.edit"
                onClick={() => handleEdit(user)}
                size="sm"
              >
                Sửa
              </PermissionButton>
              
              <PermissionButton 
                permission="users.delete"
                onClick={() => handleDelete(user)}
                size="sm"
                variant="danger"
              >
                Xóa
              </PermissionButton>
            </td>
          </tr>
        ))}
      </table>
    </div>
  );
}
```

### Ví dụ 2: Điều hướng Menu
```typescript
import { usePermissions } from '~/hooks/usePermissions';

function Sidebar() {
  const permissions = usePermissions();

  const menuItems = [
    { 
      label: 'Người dùng', 
      path: '/admin/users', 
      module: 'users' 
    },
    { 
      label: 'Khách hàng', 
      path: '/admin/customers', 
      module: 'customers' 
    },
    { 
      label: 'Đơn hàng', 
      path: '/admin/orders', 
      module: 'orders' 
    },
    // ...
  ];

  return (
    <nav>
      {menuItems.map(item => {
        // Chỉ hiển thị menu nếu có quyền truy cập module
        if (!permissions.canAccessModule(item.module)) {
          return null;
        }

        return (
          <Link key={item.path} to={item.path}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
```

---

## ✅ Checklist triển khai

### Đã hoàn thành
- [x] Tạo utils functions đầy đủ
- [x] Tạo custom hooks
- [x] Tạo permission components
- [x] Tích hợp vào AuthContext
- [x] Cập nhật types
- [x] Backend API roles management
- [x] Backend API users with roles
- [x] Database structure
- [x] Seeders với 5 roles mặc định

### TODO - Backend Security (Quan trọng!)
- [ ] Tạo Permission Middleware
- [ ] Áp dụng middleware vào routes
- [ ] Validate permissions trong controllers
- [ ] Audit log cho permissions changes

### TODO - Enhancements
- [ ] UI quản lý roles (CRUD roles)
- [ ] UI custom permissions cho từng role
- [ ] Permission history/audit
- [ ] Bulk assign roles

---

## 📞 Liên hệ & Support

Nếu có vấn đề hoặc cần hỗ trợ thêm về hệ thống phân quyền, vui lòng tham khảo:
- Tài liệu này
- Code comments trong các files
- Unit tests (nếu có)

---

**Phiên bản**: 1.0  
**Ngày cập nhật**: 2025-10-15

