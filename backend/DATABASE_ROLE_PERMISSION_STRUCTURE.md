# CẤU TRÚC DATABASE - ROLE & PERMISSION SYSTEM

**Version:** 2.0  
**Date:** 16/10/2025  
**Status:** ✅ HOÀN THIỆN

---

## 📊 TỔNG QUAN HỆ THỐNG

Hệ thống kết hợp **Role-based Access Control (RBAC)** và **Permission-based Access Control (PBAC)**:

- **1 User = 1 Role** (role cố định)
- **Role có Permissions mặc định** (JSON trong bảng roles)
- **User có thể có Custom Permissions** (JSON trong bảng users, override role)
- **Chỉ Admin mới assign custom permissions**

---

## 🗄️ CẤU TRÚC BẢNG

### 1. BẢNG `roles`

Lưu trữ các vai trò trong hệ thống.

```sql
CREATE TABLE roles (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) UNIQUE NOT NULL,           -- admin, manager, accountant, mechanic, employee, warehouse
    display_name VARCHAR(255) NOT NULL,          -- Admin, Manager, Accountant, ...
    description TEXT,                             -- Mô tả vai trò
    permissions JSON,                             -- Danh sách permissions mặc định
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP NULL
);
```

**Permissions Format (JSON):**
```json
{
    "dashboard": ["view"],
    "users": ["view", "create", "edit"],
    "orders": ["view", "create", "edit", "approve"],
    "invoices": ["view", "create"]
}
```

**Roles mặc định:**
- `admin` - Full access
- `manager` - Quản lý toàn bộ
- `accountant` - Quản lý tài chính
- `mechanic` - Kỹ thuật viên
- `employee` - Nhân viên tiếp nhận
- `warehouse` - Quản lý kho

---

### 2. BẢNG `users`

Lưu trữ thông tin người dùng.

```sql
CREATE TABLE users (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(255),
    avatar VARCHAR(255),
    birth_date DATE,
    gender ENUM('male', 'female', 'other'),
    address TEXT,
    
    -- Employee fields
    employee_code VARCHAR(255) UNIQUE,
    position VARCHAR(255),
    department VARCHAR(255),
    hire_date DATE,
    salary DECIMAL(15,2),
    
    -- Role & Permissions (RBAC + PBAC)
    role_id BIGINT UNSIGNED,                      -- FK to roles.id
    custom_permissions JSON,                      -- Override permissions (chỉ admin mới set)
    
    -- Status & Security
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    email_verified_at TIMESTAMP,
    password VARCHAR(255) NOT NULL,
    remember_token VARCHAR(100),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_email (email),
    INDEX idx_role_id (role_id),
    INDEX idx_is_active_position (is_active, position)
);
```

**Custom Permissions Format (JSON):**
```json
{
    "users": ["view", "create"],
    "orders": ["view", "edit", "approve"]
}
```

**Cách hoạt động:**
- Nếu `custom_permissions` = NULL → Dùng permissions từ `role`
- Nếu `custom_permissions` có giá trị → Override permissions từ `role`
- Admin có thể set bất kỳ permission nào cho user

---

### 3. BẢNG `user_roles` (Audit Trail)

Lưu lịch sử thay đổi role của user.

```sql
CREATE TABLE user_roles (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,             -- FK to users.id
    role_id BIGINT UNSIGNED NOT NULL,             -- FK to roles.id
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by BIGINT UNSIGNED,                  -- Admin nào assign
    is_active BOOLEAN DEFAULT TRUE,               -- Role hiện tại hay lịch sử
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_is_active (user_id, is_active),
    INDEX idx_role_is_active (role_id, is_active),
    INDEX idx_assigned_at (assigned_at)
);
```

**Mục đích:**
- Theo dõi lịch sử thay đổi role
- Biết admin nào assign role
- Audit compliance

**Note:** User hiện tại được xác định qua `users.role_id`, không phải `user_roles.is_active`

---

## 🔄 RELATIONSHIPS

### Role → Users (One-to-Many)
```php
// Role model
public function users() {
    return $this->hasMany(User::class);
}

// User model
public function role() {
    return $this->belongsTo(Role::class);
}
```

### User → Role History (One-to-Many)
```php
// User model
public function roleHistory() {
    return $this->hasMany(UserRole::class)->orderBy('assigned_at', 'desc');
}
```

---

## 🔐 PERMISSION CHECKING LOGIC

### 1. Check Permission trong User Model

```php
public function hasPermission(string $permission): bool
{
    // 1. Admin có tất cả quyền
    if ($this->role && $this->role->name === 'admin') {
        return true;
    }

    // 2. Kiểm tra custom_permissions (override role)
    if ($this->custom_permissions && is_array($this->custom_permissions)) {
        // Format: {"users": ["view", "create"], "orders": ["view"]}
        [$module, $action] = explode('.', $permission);
        
        if (isset($this->custom_permissions[$module])) {
            return in_array($action, $this->custom_permissions[$module]);
        }
    }

    // 3. Kiểm tra permissions từ role
    if ($this->role && $this->role->permissions) {
        [$module, $action] = explode('.', $permission);
        
        if (isset($this->role->permissions[$module])) {
            return in_array($action, $this->role->permissions[$module]);
        }
    }

    return false;
}
```

### 2. Sử dụng trong Controller

```php
// Check single permission
if ($user->hasPermission('users.create')) {
    // Cho phép tạo user
}

// Check multiple permissions
if ($user->hasAnyPermission(['users.edit', 'users.delete'])) {
    // Có ít nhất 1 trong 2 quyền
}

// Check all permissions
if ($user->hasAllPermissions(['orders.view', 'orders.edit'])) {
    // Có cả 2 quyền
}

// Check role
if ($user->hasRole('admin')) {
    // Là admin
}
```

### 3. Sử dụng trong Middleware

```php
// routes/api.php
Route::middleware(['auth:api', 'permission:users.view'])->group(function () {
    Route::get('/users', [UserController::class, 'index']);
});
```

---

## 📝 DANH SÁCH PERMISSIONS

### Dashboard
- `dashboard.view` - Xem dashboard

### Users Management
- `users.view` - Xem danh sách users
- `users.create` - Tạo user mới
- `users.edit` - Sửa thông tin user
- `users.delete` - Xóa user

### Roles Management
- `roles.view` - Xem danh sách roles
- `roles.create` - Tạo role mới
- `roles.edit` - Sửa role
- `roles.delete` - Xóa role

### Customers Management
- `customers.view` - Xem danh sách khách hàng
- `customers.create` - Tạo khách hàng
- `customers.edit` - Sửa thông tin khách hàng
- `customers.delete` - Xóa khách hàng

### Vehicles Management
- `vehicles.view` - Xem danh sách xe
- `vehicles.create` - Thêm xe
- `vehicles.edit` - Sửa thông tin xe
- `vehicles.delete` - Xóa xe

### Products Management
- `products.view` - Xem danh sách sản phẩm
- `products.create` - Tạo sản phẩm
- `products.edit` - Sửa sản phẩm
- `products.delete` - Xóa sản phẩm

### Orders Management
- `orders.view` - Xem đơn hàng
- `orders.create` - Tạo đơn hàng
- `orders.edit` - Sửa đơn hàng
- `orders.delete` - Xóa đơn hàng
- `orders.approve` - Duyệt đơn hàng
- `orders.cancel` - Hủy đơn hàng

### Invoices Management
- `invoices.view` - Xem hóa đơn
- `invoices.create` - Tạo hóa đơn
- `invoices.edit` - Sửa hóa đơn
- `invoices.delete` - Xóa hóa đơn
- `invoices.approve` - Duyệt hóa đơn

### Payments Management
- `payments.view` - Xem thanh toán
- `payments.create` - Tạo thanh toán
- `payments.edit` - Sửa thanh toán
- `payments.delete` - Xóa thanh toán
- `payments.confirm` - Xác nhận thanh toán
- `payments.verify` - Xác minh thanh toán

### Settlements Management
- `settlements.view` - Xem quyết toán
- `settlements.create` - Tạo quyết toán
- `settlements.edit` - Sửa quyết toán
- `settlements.delete` - Xóa quyết toán
- `settlements.approve` - Duyệt quyết toán

### Warehouses Management
- `warehouses.view` - Xem kho
- `warehouses.create` - Tạo kho
- `warehouses.edit` - Sửa kho
- `warehouses.delete` - Xóa kho

### Stocks Management
- `stocks.view` - Xem tồn kho
- `stocks.create` - Nhập kho
- `stocks.edit` - Sửa tồn kho
- `stocks.delete` - Xóa tồn kho
- `stocks.transfer` - Chuyển kho

### Providers Management
- `providers.view` - Xem nhà cung cấp
- `providers.create` - Tạo nhà cung cấp
- `providers.edit` - Sửa nhà cung cấp
- `providers.delete` - Xóa nhà cung cấp

### Reports
- `reports.view` - Xem báo cáo
- `reports.export` - Xuất báo cáo

### Settings
- `settings.view` - Xem cài đặt
- `settings.edit` - Sửa cài đặt

---

## 🎯 USE CASES

### Use Case 1: Admin gán custom permissions cho User

```php
// Admin muốn cho 1 accountant quyền xem users (thường chỉ admin/manager mới có)
$user = User::find(5); // Accountant
$user->custom_permissions = [
    'users' => ['view'], // Thêm quyền xem users
];
$user->save();

// User này giờ có:
// - Tất cả permissions từ role "accountant"
// - Thêm permission "users.view" từ custom_permissions
```

### Use Case 2: Admin tạo User mới với Role

```php
$user = User::create([
    'name' => 'Nguyễn Văn A',
    'email' => 'a@example.com',
    'password' => Hash::make('password'),
    'role_id' => 3, // Role accountant
    'custom_permissions' => null, // Dùng permissions mặc định từ role
]);

// Log vào user_roles để audit
UserRole::create([
    'user_id' => $user->id,
    'role_id' => 3,
    'assigned_by' => auth()->id(),
    'is_active' => true,
]);
```

### Use Case 3: Admin thay đổi Role của User

```php
$user = User::find(5);
$oldRoleId = $user->role_id;

// Disable old role trong user_roles
UserRole::where('user_id', $user->id)
    ->where('is_active', true)
    ->update(['is_active' => false]);

// Update role_id mới
$user->role_id = 4; // Manager
$user->save();

// Log vào user_roles
UserRole::create([
    'user_id' => $user->id,
    'role_id' => 4,
    'assigned_by' => auth()->id(),
    'is_active' => true,
]);
```

### Use Case 4: Kiểm tra User có quyền không

```php
$user = User::find(5);

// Check permission
if ($user->hasPermission('invoices.approve')) {
    // User có quyền duyệt hóa đơn
    // (từ role hoặc custom_permissions)
}

// Check role
if ($user->hasRole('admin')) {
    // User là admin
}

// Get all permissions
$allPermissions = $user->getAllPermissions();
// ['users.view', 'orders.view', 'orders.create', ...]
```

---

## 🔒 BẢO MẬT & QUY TẮC

### 1. Quy tắc gán Custom Permissions

✅ **CHỈ ADMIN** mới được:
- Set `custom_permissions` cho user khác
- Thay đổi `role_id` của user khác
- Xem và quản lý permissions

❌ **USER THƯỜNG KHÔNG THỂ**:
- Tự thay đổi `custom_permissions` của mình
- Tự thay đổi `role_id` của mình
- Vượt quyền bằng cách edit database trực tiếp (có validation ở backend)

### 2. Validation trong Controller

```php
// UserController@update
public function update(Request $request, User $user)
{
    // Chỉ admin mới được set custom_permissions
    if ($request->has('custom_permissions')) {
        if (!auth()->user()->hasRole('admin')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
    }

    // Chỉ admin mới được thay đổi role
    if ($request->has('role_id')) {
        if (!auth()->user()->hasRole('admin')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
    }

    $user->update($request->only(['name', 'email', 'phone']));
    
    return response()->json($user);
}
```

### 3. Middleware Protection

```php
// app/Http/Middleware/CheckPermission.php
public function handle($request, Closure $next, $permission)
{
    if (!$request->user()->hasPermission($permission)) {
        return response()->json(['error' => 'Forbidden'], 403);
    }

    return $next($request);
}
```

---

## 📊 ER DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                         ROLES                                │
├─────────────────────────────────────────────────────────────┤
│ id (PK)                                                      │
│ name (UNIQUE)          - admin, manager, accountant, ...    │
│ display_name           - Admin, Manager, ...                │
│ permissions (JSON)     - {"users": ["view"], ...}           │
│ is_active                                                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 1
                              │
                              │
                              │ N
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         USERS                                │
├─────────────────────────────────────────────────────────────┤
│ id (PK)                                                      │
│ name, email, password                                        │
│ role_id (FK) → roles.id    - 1 user = 1 role               │
│ custom_permissions (JSON)  - {"users": ["view"], ...}       │
│ is_active                                                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 1
                              │
                              │
                              │ N
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     USER_ROLES (Audit)                       │
├─────────────────────────────────────────────────────────────┤
│ id (PK)                                                      │
│ user_id (FK) → users.id                                     │
│ role_id (FK) → roles.id                                     │
│ assigned_by (FK) → users.id                                 │
│ assigned_at                                                  │
│ is_active              - Role hiện tại hay lịch sử          │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ CHECKLIST MIGRATION

Để áp dụng cấu trúc mới:

- [x] Backup database hiện tại
- [x] Chạy migrations mới
- [x] Run RoleSeeder để tạo roles
- [ ] Migrate dữ liệu users cũ sang cấu trúc mới
- [ ] Test permission checking
- [ ] Deploy

---

**Hệ thống đã sẵn sàng! 🚀**

