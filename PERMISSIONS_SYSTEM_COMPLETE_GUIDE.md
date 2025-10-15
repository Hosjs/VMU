# 🔐 HỆ THỐNG PHÂN QUYỀN USER - HƯỚNG DẪN ĐẦY ĐỦ

## 📋 TỔNG QUAN

Hệ thống phân quyền cho phép **Admin** quản lý quyền hạn của từng user theo 2 cấp độ:
1. **Role Permissions**: Quyền mặc định theo vai trò (Admin, Manager, Accountant, Mechanic, Employee)
2. **Custom Permissions**: Quyền tùy chỉnh riêng cho từng user (ghi đè quyền của role)

---

## 🏗️ KIẾN TRÚC HỆ THỐNG

### 1. Core Utilities (`~/utils/permissions.ts`)

#### **Permissions có sẵn trong hệ thống:**
```typescript
export const AVAILABLE_PERMISSIONS = {
  users: ['view', 'create', 'edit', 'delete'],
  roles: ['view', 'create', 'edit', 'delete'],
  customers: ['view', 'create', 'edit', 'delete'],
  vehicles: ['view', 'create', 'edit', 'delete'],
  products: ['view', 'create', 'edit', 'delete'],
  services: ['view', 'create', 'edit', 'delete'],
  categories: ['view', 'create', 'edit', 'delete'],
  orders: ['view', 'create', 'edit', 'delete', 'approve', 'cancel'],
  invoices: ['view', 'create', 'edit', 'delete', 'approve'],
  payments: ['view', 'create', 'edit', 'delete', 'confirm', 'verify'],
  settlements: ['view', 'create', 'edit', 'delete', 'approve'],
  warehouses: ['view', 'create', 'edit', 'delete'],
  stocks: ['view', 'create', 'edit', 'delete', 'transfer'],
  providers: ['view', 'create', 'edit', 'delete'],
  reports: ['view', 'export'],
  settings: ['view', 'edit'],
};
```

#### **Functions chính:**

| Function | Mô tả | Ví dụ |
|----------|-------|-------|
| `hasPermission(user, permission)` | Kiểm tra quyền cụ thể | `hasPermission(user, 'users.create')` |
| `hasAnyPermission(user, permissions)` | Có ít nhất 1 quyền | `hasAnyPermission(user, ['users.create', 'users.edit'])` |
| `hasAllPermissions(user, permissions)` | Có tất cả quyền | `hasAllPermissions(user, ['users.view', 'users.edit'])` |
| `canAccessModule(user, module)` | Có quyền truy cập module | `canAccessModule(user, 'users')` |
| `getEffectivePermissions(user)` | Lấy quyền thực tế (merged) | `getEffectivePermissions(user)` |
| `getUserPermissions(user)` | Lấy tất cả quyền | `getUserPermissions(user)` |
| `getAccessibleModules(user)` | Modules có quyền truy cập | `getAccessibleModules(user)` |

---

### 2. React Hook (`~/hooks/usePermissions.ts`)

Hook để sử dụng trong React components:

```typescript
import { usePermissions } from '~/hooks/usePermissions';

function MyComponent() {
  const permissions = usePermissions();
  
  // Kiểm tra quyền cụ thể
  if (permissions.hasPermission('users.create')) {
    // Show create button
  }
  
  // Kiểm tra nhiều quyền
  if (permissions.hasAnyPermission(['users.edit', 'users.delete'])) {
    // Show actions
  }
  
  // Kiểm tra role
  if (permissions.isAdmin()) {
    // Admin only features
  }
  
  return <div>...</div>;
}
```

**API của hook:**
- ✅ `hasPermission(permission: string): boolean`
- ✅ `hasAnyPermission(permissions: string[]): boolean`
- ✅ `hasAllPermissions(permissions: string[]): boolean`
- ✅ `canAccessModule(module: string): boolean`
- ✅ `getUserPermissions(): PermissionMap`
- ✅ `getAccessibleModules(): string[]`
- ✅ `isAdmin(): boolean`
- ✅ `isManager(): boolean`
- ✅ `hasRole(roleName: string): boolean`
- ✅ `hasAnyRole(roleNames: string[]): boolean`
- ✅ `user: AuthUser | null`

---

### 3. Components (`~/components/permissions/`)

#### **a) PermissionGate** - Bảo vệ nội dung theo quyền

```typescript
import { PermissionGate } from '~/components/permissions';

// Kiểm tra quyền cụ thể
<PermissionGate permission="users.create">
  <CreateButton />
</PermissionGate>

// Kiểm tra nhiều quyền (OR)
<PermissionGate anyPermissions={['users.edit', 'users.delete']}>
  <ActionsMenu />
</PermissionGate>

// Kiểm tra nhiều quyền (AND)
<PermissionGate allPermissions={['users.view', 'users.edit']}>
  <EditForm />
</PermissionGate>

// Kiểm tra module
<PermissionGate module="users">
  <UsersSection />
</PermissionGate>

// Kiểm tra role
<PermissionGate role="admin">
  <AdminPanel />
</PermissionGate>

// Hiển thị fallback khi không có quyền
<PermissionGate 
  permission="users.delete"
  fallback={<div>Bạn không có quyền xóa</div>}
>
  <DeleteButton />
</PermissionGate>
```

#### **b) PermissionButton** - Button chỉ hiển thị khi có quyền

```typescript
import { PermissionButton } from '~/components/permissions';

<PermissionButton 
  permission="users.create"
  onClick={handleCreate}
  variant="primary"
>
  Tạo người dùng
</PermissionButton>

<PermissionButton 
  anyPermissions={['orders.approve', 'orders.cancel']}
  onClick={handleApprove}
  variant="success"
>
  Phê duyệt
</PermissionButton>
```

#### **c) PermissionSelector** - Component chọn permissions

```typescript
import { PermissionSelector } from '~/components/permissions';

function UserForm() {
  const [permissions, setPermissions] = useState({
    users: ['view', 'create'],
    orders: ['view', 'edit'],
  });
  
  return (
    <PermissionSelector
      value={permissions}
      onChange={setPermissions}
      mode="compact" // hoặc "detailed"
    />
  );
}
```

**Props:**
- `value`: Object với key là module, value là array actions
- `onChange`: Callback khi permissions thay đổi
- `mode`: 'compact' hoặc 'detailed'
- `disabled`: Disabled tất cả checkboxes

---

## 🔧 CÁCH SỬ DỤNG TRONG TRANG USERS

### 1. Form tạo/sửa User

File: `~/routes/admin/users.tsx`

```typescript
// Trong UserFormModal component

// Custom Permissions Section
<div>
  <h3>Quyền hạn tùy chỉnh</h3>
  <p>
    {selectedRole ? (
      <>
        Vai trò <strong>{selectedRole.display_name}</strong> có các quyền mặc định.
        Bạn có thể tùy chỉnh quyền riêng cho user này.
      </>
    ) : (
      'Chọn vai trò để xem quyền mặc định'
    )}
  </p>
  
  {selectedRole && (
    <div className="bg-blue-50 p-4">
      <strong>💡 Lưu ý:</strong> Quyền tùy chỉnh sẽ ghi đè quyền mặc định của vai trò.
    </div>
  )}
  
  <PermissionSelector
    value={values.custom_permissions || {}}
    onChange={(permissions) => handleChange('custom_permissions', permissions)}
    mode="compact"
  />
</div>
```

### 2. Lưu Custom Permissions

```typescript
// UserFormData interface
export interface UserFormData {
  name: string;
  email: string;
  role_id: number;
  // ... các field khác
  custom_permissions?: Record<string, string[]>; // ← Custom permissions
}

// Submit form
const handleSubmit = async (values: UserFormData) => {
  if (isEdit && user) {
    await userService.updateUser(user.id, values);
  } else {
    await userService.createUser(values);
  }
};
```

### 3. Hiển thị quyền của User

```typescript
import { getUserPermissions } from '~/utils/permissions';

function UserDetail({ user }: { user: AuthUser }) {
  // Lấy quyền thực tế (đã merge custom_permissions)
  const permissions = getUserPermissions(user);
  
  return (
    <div>
      <h3>Quyền hạn:</h3>
      {Object.entries(permissions).map(([module, actions]) => (
        <div key={module}>
          <strong>{getModuleLabel(module)}:</strong>
          {actions.map(action => getActionLabel(action)).join(', ')}
        </div>
      ))}
    </div>
  );
}
```

---

## 📊 DATA FLOW

### 1. User Login
```
Login → AuthContext → Store user with role & custom_permissions
```

### 2. Permission Check
```
Component → usePermissions() hook
         → getEffectivePermissions(user)
         → Merge role.permissions + user.custom_permissions
         → Return final permissions
```

### 3. Custom Permissions Override
```
Role Permissions: { users: ['view'], orders: ['view'] }
Custom Permissions: { users: ['view', 'create', 'edit'] }

Effective Permissions: { 
  users: ['view', 'create', 'edit'], ← Override từ custom
  orders: ['view']                     ← Giữ nguyên từ role
}
```

---

## 🎯 CÁC TRƯỜNG HỢP SỬ DỤNG

### 1. Bảo vệ Route
```typescript
import { Navigate } from 'react-router';
import { usePermissions } from '~/hooks/usePermissions';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const permissions = usePermissions();
  
  if (!permissions.canAccessModule('users')) {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
}
```

### 2. Bảo vệ Button/Action
```typescript
<PermissionButton
  permission="users.delete"
  onClick={() => handleDelete(user)}
  variant="danger"
>
  Xóa
</PermissionButton>
```

### 3. Bảo vệ Section/Content
```typescript
<PermissionGate permission="reports.export">
  <ExportSection />
</PermissionGate>
```

### 4. Conditional Rendering
```typescript
const permissions = usePermissions();

{permissions.hasPermission('users.create') && (
  <CreateUserButton />
)}
```

### 5. Role-based Features
```typescript
const permissions = usePermissions();

if (permissions.isAdmin()) {
  // Show admin-only features
} else if (permissions.isManager()) {
  // Show manager features
}
```

---

## 💾 DATABASE SCHEMA

### Table: `users`
```sql
id INT PRIMARY KEY
name VARCHAR(255)
email VARCHAR(255)
role_id INT FOREIGN KEY
custom_permissions JSON NULL  -- ← Lưu custom permissions
-- Format: {"users":["view","create"],"orders":["view"]}
```

### Table: `roles`
```sql
id INT PRIMARY KEY
name VARCHAR(50)
display_name VARCHAR(100)
permissions JSON
-- Format: {"users":["view","create"],"orders":["view","edit","delete"]}
```

---

## ✅ CHECKLIST TRIỂN KHAI

### Frontend (Đã hoàn thành)
- [x] File `~/utils/permissions.ts` - Core utilities
- [x] File `~/hooks/usePermissions.ts` - React hook
- [x] File `~/components/permissions/PermissionGate.tsx`
- [x] File `~/components/permissions/PermissionButton.tsx`
- [x] File `~/components/permissions/PermissionSelector.tsx`
- [x] File `~/types/auth.ts` - Thêm `custom_permissions` vào AuthUser
- [x] File `~/routes/admin/users.tsx` - Form có PermissionSelector
- [x] File `~/services/user.service.ts` - UserFormData có custom_permissions

### Backend (Cần kiểm tra)
- [ ] Migration thêm column `custom_permissions` vào table `users`
- [ ] API POST/PUT `/admin/users` nhận và lưu `custom_permissions`
- [ ] API GET `/admin/users/{id}` trả về `custom_permissions`
- [ ] Validation cho `custom_permissions` format
- [ ] Middleware kiểm tra permissions (optional)

---

## 🧪 TESTING

### Test Permission Check
```typescript
// Test hasPermission
const user = {
  role: { name: 'manager', permissions: { users: ['view'] } },
  custom_permissions: { users: ['view', 'create', 'edit'] }
};

console.log(hasPermission(user, 'users.view'));   // true
console.log(hasPermission(user, 'users.create')); // true (custom)
console.log(hasPermission(user, 'users.delete')); // false
```

### Test Component
```typescript
import { render } from '@testing-library/react';
import { PermissionGate } from '~/components/permissions';

test('PermissionGate hides content without permission', () => {
  const { container } = render(
    <PermissionGate permission="users.delete">
      <button>Delete</button>
    </PermissionGate>
  );
  
  expect(container.querySelector('button')).toBeNull();
});
```

---

## 🚀 NÂNG CAO

### 1. Cache Permissions
```typescript
const permissionsCache = new Map();

export function getUserPermissions(user: AuthUser | null): PermissionMap {
  if (!user) return {};
  
  const cacheKey = `${user.id}_${user.updated_at}`;
  if (permissionsCache.has(cacheKey)) {
    return permissionsCache.get(cacheKey);
  }
  
  const permissions = getEffectivePermissions(user);
  permissionsCache.set(cacheKey, permissions);
  return permissions;
}
```

### 2. Permission Logging
```typescript
export function hasPermission(user: AuthUser | null, permission: string): boolean {
  const result = /* ... check logic ... */;
  
  if (!result) {
    console.warn(`Permission denied: ${user?.email} tried to access ${permission}`);
  }
  
  return result;
}
```

### 3. Dynamic Permissions (từ API)
```typescript
export async function loadDynamicPermissions(): Promise<PermissionMap> {
  const response = await apiService.get('/permissions/available');
  return response.data;
}
```

---

## 📚 TÀI LIỆU LIÊN QUAN

- `PERMISSIONS_SYSTEM_GUIDE.md` - Hướng dẫn cơ bản
- `ADMIN_SYSTEM_COMPLETION_REPORT.md` - Báo cáo hoàn thành hệ thống admin
- Backend API docs: `/docs/api/permissions`

---

## 🐛 TROUBLESHOOTING

### Vấn đề: User có role admin nhưng vẫn bị chặn quyền
**Giải pháp:** Kiểm tra `role.name === 'admin'` (lowercase)

### Vấn đề: Custom permissions không được áp dụng
**Giải pháp:** Đảm bảo backend trả về `custom_permissions` trong user object

### Vấn đề: PermissionSelector không hiển thị
**Giải pháp:** Kiểm tra import `getModuleLabel`, `getActionLabel` từ `~/utils/permissions`

### Vấn đề: usePermissions hook báo lỗi
**Giải pháp:** Đảm bảo component nằm trong `<AuthProvider>`

---

## 📝 NOTES

1. **Admin luôn có full quyền** - Không cần set custom_permissions
2. **Custom permissions ghi đè role permissions** - Merge strategy
3. **Permissions được cache** - Update khi user refresh hoặc re-login
4. **Backend phải validate permissions** - Frontend chỉ là UI guard
5. **Empty custom_permissions** - User sử dụng quyền mặc định của role

---

## 📧 SUPPORT

Nếu có vấn đề, liên hệ:
- Frontend Lead: [Your Name]
- Backend Lead: [Backend Dev]
- Documentation: `PERMISSIONS_SYSTEM_GUIDE.md`

---

**Cập nhật lần cuối:** 15/10/2025
**Version:** 2.0.0 - Complete Implementation

