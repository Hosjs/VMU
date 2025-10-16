# 🔄 HƯỚNG DẪN MIGRATION - CẤU TRÚC MỚI THEO NGHIỆP VỤ

## ✅ ĐÃ HOÀN THÀNH

### Backend - Controllers Mới (Đã tạo)

```
backend/app/Http/Controllers/Api/
├── Management/
│   └── Users/
│       └── UserController.php ✅
│
├── Customer/
│   └── CustomerController.php ✅
│
├── Sales/
│   └── OrderController.php ✅
│
├── Financial/
│   ├── InvoiceController.php ✅
│   └── PaymentController.php ✅
│
├── Inventory/
│   └── ProductController.php ✅
│
├── Reports/
│   └── DashboardController.php ✅
│
└── Common/
    └── BadgeController.php ✅
```

### Routes Mới (Đã tạo)
- `backend/routes/api-new-structure.php` ✅

---

## 🚀 BƯỚC MIGRATION CHO BẠN

### BƯỚC 1: Backup code cũ (BẮT BUỘC) ⚠️

```bash
# Backup toàn bộ dự án
cd C:\xampp\htdocs
xcopy gara gara_backup_$(date +%Y%m%d) /E /I

# Hoặc nếu dùng Git
git add .
git commit -m "Backup before restructure"
git branch backup-old-structure
```

### BƯỚC 2: Apply Backend Changes

#### 2.1. Thay thế routes file

```bash
# Backup file cũ
cd C:\xampp\htdocs\gara\backend\routes
copy api.php api-old-structure.php

# Sử dụng file mới
copy api-new-structure.php api.php
```

**Hoặc manual:** Mở `backend/routes/api.php` và thay thế toàn bộ bằng nội dung trong `api-new-structure.php`

#### 2.2. Update imports trong routes

File routes mới đã update imports:

**Cũ:**
```php
use App\Http\Controllers\Api\Admin\UserController;
```

**Mới:**
```php
use App\Http\Controllers\Api\Management\Users\UserController;
```

#### 2.3. Reload autoloader

```bash
cd C:\xampp\htdocs\gara\backend
composer dump-autoload
```

### BƯỚC 3: Di chuyển Controllers còn lại

Tôi đã tạo sẵn các controllers quan trọng. Bây giờ bạn cần di chuyển các controllers còn lại:

#### Controllers cần di chuyển:

**Management (Quản lý hệ thống):**
```bash
# RoleController
copy Admin\RoleController.php Management\Roles\RoleController.php
# Sau đó sửa namespace: App\Http\Controllers\Api\Management\Roles
```

**Services (Dịch vụ):**
```bash
# ServiceController
mkdir Services
copy Admin\ServiceController.php Services\ServiceController.php

# CategoryController
copy Admin\CategoryController.php Services\CategoryController.php
# Namespace: App\Http\Controllers\Api\Services
```

**Inventory (Kho):**
```bash
# WarehouseController
copy Admin\WarehouseController.php Inventory\WarehouseController.php
# Namespace: App\Http\Controllers\Api\Inventory
```

**Partners (Đối tác):**
```bash
mkdir Partners
copy Admin\ProviderController.php Partners\ProviderController.php
copy Admin\PartnerVehicleHandoverController.php Partners\PartnerVehicleHandoverController.php
# Namespace: App\Http\Controllers\Api\Partners
```

**Financial:**
```bash
# SettlementController
copy Admin\SettlementController.php Financial\SettlementController.php
# Namespace: App\Http\Controllers\Api\Financial
```

#### Script tự động (PowerShell):

```powershell
# File: migrate-controllers.ps1
$baseDir = "C:\xampp\htdocs\gara\backend\app\Http\Controllers\Api"

# Tạo folders
$folders = @("Management\Roles", "Services", "Partners")
foreach ($folder in $folders) {
    New-Item -Path "$baseDir\$folder" -ItemType Directory -Force
}

# Di chuyển files
$moves = @{
    "Admin\RoleController.php" = "Management\Roles\RoleController.php"
    "Admin\ServiceController.php" = "Services\ServiceController.php"
    "Admin\CategoryController.php" = "Services\CategoryController.php"
    "Admin\WarehouseController.php" = "Inventory\WarehouseController.php"
    "Admin\ProviderController.php" = "Partners\ProviderController.php"
    "Admin\SettlementController.php" = "Financial\SettlementController.php"
}

foreach ($move in $moves.GetEnumerator()) {
    Copy-Item "$baseDir\$($move.Key)" "$baseDir\$($move.Value)"
    Write-Host "Copied $($move.Key) -> $($move.Value)"
}
```

### BƯỚC 4: Update Namespaces

Sau khi copy files, **BẮT BUỘC** phải sửa namespace:

**Ví dụ RoleController:**

```php
// ❌ Cũ
namespace App\Http\Controllers\Api\Admin;

// ✅ Mới
namespace App\Http\Controllers\Api\Management\Roles;
```

**Ví dụ ServiceController:**

```php
// ❌ Cũ
namespace App\Http\Controllers\Api\Admin;

// ✅ Mới
namespace App\Http\Controllers\Api\Services;
```

### BƯỚC 5: Update Routes

Trong file `api-new-structure.php`, tôi đã update imports. Bạn cần thêm imports cho các controllers còn lại:

```php
// Thêm vào đầu file
use App\Http\Controllers\Api\Management\Roles\RoleController;
use App\Http\Controllers\Api\Services\ServiceController;
use App\Http\Controllers\Api\Services\CategoryController;
use App\Http\Controllers\Api\Inventory\WarehouseController;
use App\Http\Controllers\Api\Partners\ProviderController;
use App\Http\Controllers\Api\Partners\PartnerVehicleHandoverController;
use App\Http\Controllers\Api\Financial\SettlementController;
```

Sau đó thêm routes:

```php
// SERVICES
Route::prefix('services')->group(function () {
    Route::get('/', [ServiceController::class, 'index'])
        ->middleware('permission:services.view');
    Route::post('/', [ServiceController::class, 'store'])
        ->middleware('permission:services.create');
    // ... các routes khác
});

// PARTNERS
Route::prefix('partners')->group(function () {
    Route::get('/providers', [ProviderController::class, 'index'])
        ->middleware('permission:providers.view');
    // ...
});
```

### BƯỚC 6: Test Backend

```bash
# Test API mới
curl http://localhost/gara/backend/public/api/management/users
curl http://localhost/gara/backend/public/api/sales/orders
curl http://localhost/gara/backend/public/api/financial/invoices
```

Kiểm tra:
- ✅ Routes hoạt động
- ✅ Permissions check đúng
- ✅ Data trả về đúng
- ✅ Không có lỗi namespace

### BƯỚC 7: Cleanup (Sau khi test xong)

```bash
# Xóa folder Admin cũ
rm -rf Admin/

# Xóa file routes cũ
rm api-old-structure.php
```

---

## 📱 FRONTEND - CẤU TRÚC MỚI

### Vấn đề hiện tại:

```
routes/
├── admin/          ❌ Duplicate
├── manager/        ❌ Duplicate
├── accountant/     ❌ Duplicate
├── mechanic/       ❌ Duplicate
└── employee/       ❌ Duplicate
```

### Cấu trúc mới:

```
routes/
├── dashboard/      ✅ Chung cho tất cả (check permission bên trong)
├── users/          ✅ Permission: users.view
├── customers/      ✅ Permission: customers.view
├── orders/         ✅ Permission: orders.view
├── invoices/       ✅ Permission: invoices.view
├── payments/       ✅ Permission: payments.view
├── inventory/      ✅ Permission: products.view, warehouses.view
├── services/       ✅ Permission: services.view
└── reports/        ✅ Permission: reports.view
```

### Migration Plan:

#### BƯỚC 1: Tạo folders mới

```bash
cd C:\xampp\htdocs\gara\frontend\app\routes

# Tạo folders theo nghiệp vụ
mkdir dashboard users customers orders invoices payments inventory services reports settings
```

#### BƯỚC 2: Di chuyển pages

**Users:**
```bash
# Lấy page từ admin/users (vì đầy đủ nhất)
copy admin\users\index.tsx users\index.tsx
copy admin\users\create.tsx users\create.tsx
copy admin\users\$id.edit.tsx users\$id.edit.tsx
```

**Orders:**
```bash
# Merge pages từ nhiều roles
copy admin\orders\index.tsx orders\index.tsx
copy mechanic\orders\index.tsx orders\my-orders.tsx
```

**Invoices:**
```bash
copy admin\invoices\index.tsx invoices\index.tsx
copy accountant\invoices\index.tsx invoices\pending.tsx
```

#### BƯỚC 3: Wrap với PermissionGate

Mỗi page PHẢI wrap với `PermissionGate`:

**users/index.tsx:**
```tsx
import { PermissionGate } from '~/components/permissions';

export default function UsersPage() {
  return (
    <PermissionGate permission="users.view">
      {/* Page content */}
    </PermissionGate>
  );
}
```

**orders/index.tsx:**
```tsx
import { PermissionGate } from '~/components/permissions';
import { Can } from '~/components/permissions';

export default function OrdersPage() {
  return (
    <PermissionGate permission="orders.view">
      <div>
        <h1>Đơn hàng</h1>
        
        {/* Chỉ hiện tất cả orders nếu có quyền manage_all */}
        <Can permission="orders.manage_all">
          <AllOrdersList />
        </Can>
        
        {/* Chỉ hiện orders của mình nếu chỉ có manage_own */}
        <Can permission="orders.manage_own">
          <MyOrdersList />
        </Can>
      </div>
    </PermissionGate>
  );
}
```

#### BƯỚC 4: Update API calls

**Cũ:**
```tsx
// Gọi /api/admin/users
fetch('/api/admin/users')
```

**Mới:**
```tsx
// Gọi /api/management/users
fetch('/api/management/users')
```

**Tất cả endpoints cần update:**
- `/api/admin/users` → `/api/management/users`
- `/api/admin/orders` → `/api/sales/orders`
- `/api/admin/invoices` → `/api/financial/invoices`
- `/api/admin/payments` → `/api/financial/payments`
- `/api/admin/products` → `/api/inventory/products`
- `/api/admin/dashboard` → `/api/reports/dashboard`

#### BƯỚC 5: Update Sidebar Navigation

**File: `layouts/Sidebar.tsx` (hoặc tương tự)**

**Cũ:**
```tsx
{user.role.name === 'admin' && (
  <Link to="/admin/users">Users</Link>
)}
{(user.role.name === 'admin' || user.role.name === 'manager') && (
  <Link to="/admin/orders">Orders</Link>
)}
```

**Mới:**
```tsx
<Can permission="users.view">
  <Link to="/users">Users</Link>
</Can>

<Can permission="orders.view">
  <Link to="/orders">Orders</Link>
</Can>

<Can permission="invoices.view">
  <Link to="/invoices">Invoices</Link>
</Can>
```

#### BƯỚC 6: Update root.tsx routes

**File: `routes.ts` hoặc route config**

**Cũ:**
```tsx
// Nhiều routes duplicate
<Route path="/admin/users" element={<AdminUsersPage />} />
<Route path="/manager/users" element={<ManagerUsersPage />} />
```

**Mới:**
```tsx
// Một route duy nhất
<Route path="/users" element={<UsersPage />} />
<Route path="/orders" element={<OrdersPage />} />
<Route path="/invoices" element={<InvoicesPage />} />
```

#### BƯỚC 7: Cleanup Frontend

```bash
# Sau khi test xong, xóa folders cũ
cd routes
rmdir /s admin manager accountant mechanic employee
```

---

## ✅ CHECKLIST MIGRATION

### Backend
- [ ] **Backup code** (Git commit hoặc copy folder)
- [ ] **Copy api-new-structure.php** sang api.php
- [ ] **Di chuyển controllers** còn lại
- [ ] **Update namespaces** trong controllers
- [ ] **Run composer dump-autoload**
- [ ] **Test API endpoints**
- [ ] **Xóa folder Admin** (sau khi test xong)

### Frontend
- [ ] **Backup code**
- [ ] **Tạo folders mới** (users, orders, invoices, etc)
- [ ] **Di chuyển pages** từ admin/manager/etc
- [ ] **Wrap tất cả pages** với PermissionGate
- [ ] **Update API endpoints** trong service files
- [ ] **Update Sidebar** navigation với Can components
- [ ] **Update routes config**
- [ ] **Test UI** với các roles khác nhau
- [ ] **Xóa folders cũ** (admin, manager, etc)

### Testing
- [ ] Test với **admin** user
- [ ] Test với **manager** user
- [ ] Test với **accountant** user
- [ ] Test với **mechanic** user
- [ ] Test với **employee** user
- [ ] Test **custom permissions** (user có quyền riêng)
- [ ] Test **edge cases** (no permission, partial permission)

---

## 🎯 LỢI ÍCH SAU KHI MIGRATION

### 1. Code Clean & DRY
```
❌ Trước: 1 page x 5 roles = 5 files duplicate
✅ Sau: 1 page duy nhất, permission check bên trong
```

### 2. Dễ Maintain
```
❌ Trước: Sửa 1 tính năng phải sửa 5 nơi
✅ Sau: Sửa 1 nơi, apply cho tất cả
```

### 3. Flexible Permissions
```
❌ Trước: User chỉ có 1 role cố định
✅ Sau: User có thể có custom permissions mix từ nhiều roles
```

### 4. URL Clean
```
❌ Trước: /admin/users, /manager/users
✅ Sau: /users (permission check ở backend + frontend)
```

---

## 🐛 TROUBLESHOOTING

### Lỗi: Class not found
**Fix:** Run `composer dump-autoload` trong backend

### Lỗi: Route not found
**Fix:** Check imports trong api.php, đảm bảo namespace đúng

### Lỗi: 403 Forbidden
**Fix:** Check permissions trong database, đảm bảo user có đúng permissions

### Frontend: usePermissions error
**Fix:** Đảm bảo đã wrap app với `<PermissionProvider>` trong root.tsx

---

## 📞 SUPPORT

Nếu gặp vấn đề khi migration:

1. **Check namespace**: Đảm bảo tất cả controllers có namespace đúng
2. **Check imports**: Routes file phải import đúng controllers
3. **Check permissions**: Database phải có đúng permissions cho roles
4. **Test từng bước**: Không migrate tất cả cùng lúc

**Thời gian ước tính:**
- Backend: 1-2 giờ
- Frontend: 2-3 giờ
- Testing: 1 giờ
- **Total: 4-6 giờ**

---

**Bắt đầu từ BƯỚC 1: BACKUP! ⚠️**

