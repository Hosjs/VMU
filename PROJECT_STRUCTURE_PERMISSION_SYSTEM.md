hể# 📁 CẤU TRÚC THỨ MỤC MỚI - PERMISSION SYSTEM

## 🎯 Mục tiêu
Tổ chức lại cấu trúc dự án để dễ quản lý và bảo trì hệ thống permission-based

---

## 📂 BACKEND STRUCTURE

```
backend/
├── app/
│   ├── Services/                           # Business Logic Services
│   │   ├── PermissionRegistry.php          # ✅ CREATED - Quản lý tập trung permissions
│   │   ├── Auth/
│   │   │   └── PermissionService.php       # TODO - Service xử lý logic permissions
│   │   └── Badge/
│   │       └── BadgeCountService.php       # TODO - Tách logic badge counting
│   │
│   ├── Traits/                             # Reusable Traits
│   │   ├── HasPermissions.php              # ✅ CREATED - Helper methods cho Controllers
│   │   └── ScopesWithPermissions.php       # TODO - Query scopes theo permissions
│   │
│   ├── Http/
│   │   ├── Middleware/
│   │   │   ├── CheckPermission.php         # ✅ EXISTING - Middleware kiểm tra permissions
│   │   │   └── CheckRole.php               # EXISTING - Backward compatible
│   │   │
│   │   └── Controllers/
│   │       └── Api/
│   │           ├── AuthController.php      # Trả về permissions trong /me
│   │           └── Admin/
│   │               ├── PermissionController.php  # TODO - API quản lý permissions
│   │               ├── BadgeController.php       # ✅ UPDATED - Dùng permissions
│   │               ├── UserController.php        # TODO UPDATE - Dùng permissions
│   │               ├── RoleController.php        # TODO UPDATE - Dùng permissions
│   │               └── ...                       # TODO UPDATE - Tất cả controllers
│   │
│   └── Models/
│       ├── User.php                        # ✅ EXISTING - hasPermission() methods
│       ├── Role.php                        # EXISTING - Lưu permissions JSON
│       └── Permission.php                  # TODO - Model riêng nếu cần
│
├── database/
│   ├── migrations/
│   │   └── add_custom_permissions_to_users.php  # EXISTING - custom_permissions column
│   └── seeders/
│       ├── RoleSeeder.php                  # TODO UPDATE - Seed permissions mới
│       └── PermissionSeeder.php            # TODO - Seed tất cả permissions
│
└── routes/
    └── api.php                             # ✅ UPDATED - Protected by permission middleware
```

---

## 📂 FRONTEND STRUCTURE

```
frontend/app/
├── contexts/
│   ├── AuthContext.tsx                     # EXISTING - Authentication
│   └── PermissionContext.tsx               # ✅ CREATED - Permission state
│
├── components/
│   ├── permissions/                        # ✅ Permission Components
│   │   ├── Can.tsx                         # ✅ UPDATED - Conditional rendering
│   │   ├── PermissionGate.tsx              # ✅ CREATED - Route protection
│   │   ├── PermissionSelector.tsx          # EXISTING - UI chọn permissions
│   │   └── index.ts                        # ✅ UPDATED - Export all
│   │
│   ├── common/                             # Shared Components
│   │   ├── ProtectedRoute.tsx              # TODO - Wrapper với PermissionGate
│   │   └── AccessDenied.tsx                # TODO - UI khi không có quyền
│   │
│   └── admin/                              # Admin Components
│       ├── layout/
│       │   └── Sidebar.tsx                 # TODO UPDATE - Filter menu theo permissions
│       └── users/
│           └── PermissionEditor.tsx        # TODO - Edit user permissions
│
├── hooks/
│   ├── usePermissions.ts                   # ✅ EXISTING - Permission hook
│   └── useAuth.ts                          # EXISTING - Auth hook
│
├── utils/
│   ├── permissions.ts                      # ✅ EXISTING - Permission helpers
│   └── constants/
│       └── permissions.ts                  # TODO - Permission constants
│
└── routes/
    └── admin/
        ├── users/
        │   └── index.tsx                   # TODO UPDATE - Wrap với PermissionGate
        ├── orders/
        │   └── index.tsx                   # TODO UPDATE - Wrap với PermissionGate
        └── ...                             # TODO UPDATE - Tất cả routes
```

---

## 🗂️ ORGANIZATION PRINCIPLES

### 1. Backend - Service Layer Pattern
```
Controllers → Services → Models → Database
   ↓           ↓          ↓
Validate   Business    Data Access
Request     Logic
```

**Example:**
```php
// ❌ Bad - Logic trong Controller
class OrderController {
    public function index() {
        if ($user->role->name === 'admin') {
            $orders = Order::all();
        } else {
            $orders = Order::where('user_id', $user->id)->get();
        }
    }
}

// ✅ Good - Logic trong Service/Trait
class OrderController {
    use HasPermissions;
    
    public function index() {
        $query = Order::query();
        $query = $this->scopeByPermission(
            $query, 
            'orders.manage_all', 
            'orders.manage_own'
        );
        return $query->paginate();
    }
}
```

### 2. Frontend - Component Composition
```
Pages → Containers → Components → Atoms
  ↓         ↓            ↓          ↓
Route   Business    UI Logic    Basic UI
Logic    Logic
```

**Example:**
```tsx
// ❌ Bad - Permission logic rải rác
function UsersPage() {
    const user = useAuth();
    if (user.role.name !== 'admin') return <div>No access</div>;
    // ...
}

// ✅ Good - Dùng PermissionGate
function UsersPage() {
    return (
        <PermissionGate permission="users.view">
            <UsersList />
        </PermissionGate>
    );
}
```

---

## 📋 TODO LIST - MIGRATION

### Phase 1: Backend Core ✅
- [x] Tạo PermissionRegistry.php
- [x] Tạo HasPermissions Trait
- [x] Cập nhật BadgeController
- [x] Áp dụng middleware vào routes

### Phase 2: Backend Controllers 🔄
- [ ] UserController - Dùng permissions
- [ ] RoleController - Dùng permissions
- [ ] OrderController - Scope by permissions
- [ ] InvoiceController - Scope by permissions
- [ ] PaymentController - Scope by permissions
- [ ] Các controllers khác

### Phase 3: Frontend Core ✅
- [x] Tạo PermissionContext
- [x] Cập nhật Can component
- [x] Tạo PermissionGate component
- [x] Tạo Cannot component

### Phase 4: Frontend Pages 🔄
- [ ] Wrap tất cả admin routes với PermissionGate
- [ ] Cập nhật Sidebar filter theo permissions
- [ ] Cập nhật action buttons với Can component
- [ ] Thay thế role checks bằng permission checks

### Phase 5: Database & Seeders 🔄
- [ ] Update RoleSeeder với permissions mới
- [ ] Tạo PermissionSeeder
- [ ] Test migrations

### Phase 6: Testing & Documentation ⏳
- [ ] Test tất cả permissions
- [ ] Test edge cases
- [ ] Cập nhật API documentation
- [ ] Video demo

---

## 🎯 BENEFITS OF NEW STRUCTURE

### 1. Separation of Concerns
- **Services**: Business logic tách khỏi controllers
- **Traits**: Code reuse giữa các controllers
- **Components**: UI logic tách khỏi pages

### 2. Maintainability
- **Single Source of Truth**: PermissionRegistry
- **Easy to Update**: Chỉ cần update 1 nơi
- **Clear Dependencies**: Dễ trace bugs

### 3. Scalability
- **Easy to Add**: Thêm permission mới rất đơn giản
- **Flexible**: Custom permissions per user
- **Extensible**: Dễ mở rộng cho multi-tenant

### 4. Testability
- **Unit Tests**: Test từng function riêng
- **Integration Tests**: Test middleware & routes
- **E2E Tests**: Test user flows

---

## 📊 PERMISSION FLOW

### Backend Request Flow
```
1. Request → CheckPermission Middleware
2. Middleware → User Model → hasPermission()
3. hasPermission() → Check custom_permissions → Check role permissions
4. Result → Allow/Deny
5. Controller → Use HasPermissions Trait → scopeByPermission()
6. Response
```

### Frontend Component Flow
```
1. Component Render
2. usePermissions Hook → PermissionContext
3. PermissionContext → AuthContext → User with Permissions
4. Check Permission → hasPermission()
5. Conditional Render → Show/Hide
```

---

## 🔒 SECURITY CONSIDERATIONS

### 1. Always Check on Backend
```tsx
// Frontend chỉ để UX, không phải security
<Can permission="users.delete">
    <DeleteButton /> {/* Chỉ ẩn UI */}
</Can>

// Backend PHẢI check
Route::delete('/users/{id}')
    ->middleware('permission:users.delete'); // Real security
```

### 2. Never Trust Frontend
- Frontend permissions chỉ để improve UX
- Backend LUÔN validate permissions
- Frontend có thể bị bypass bằng DevTools

### 3. Log Permission Checks
```php
// Log khi user bị deny
Log::warning('Permission denied', [
    'user_id' => $user->id,
    'permission' => $permission,
    'ip' => request()->ip()
]);
```

---

## 📝 NAMING CONVENTIONS

### Permissions
```
Format: {resource}.{action}
Examples:
- users.view
- orders.create
- invoices.approve
- reports.export
```

### Files
```
Services: {Name}Service.php
Traits: {Functionality}Trait.php or Has{Feature}.php
Controllers: {Resource}Controller.php
Components: {Feature}Component.tsx
```

### Variables
```php
// Backend
$hasPermission (boolean)
$permissions (array)
$permissionName (string)

// Frontend
hasPermission (function)
permissions (object)
permissionKey (string)
```

---

**Cấu trúc mới đã sẵn sàng để mở rộng! 🚀**

