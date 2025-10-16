# 🔄 KẾ HOẠCH TÁI CẤU TRÚC DỰ ÁN - PERMISSION-BASED STRUCTURE

## 🎯 MỤC TIÊU

Tái cấu trúc dự án từ **role-based folder structure** sang **permission-based modular structure**:

- ❌ **Trước:** Folders đặt tên theo role (`Admin/`, `Manager/`, `Accountant/`)
- ✅ **Sau:** Folders đặt tên theo nghiệp vụ/module với permissions kiểm soát

---

## 📊 PHÂN TÍCH CẤU TRÚC HIỆN TẠI

### Backend - Vấn đề:
```
app/Http/Controllers/Api/
└── Admin/                    ❌ Tên folder theo role
    ├── UserController.php
    ├── OrderController.php
    ├── InvoiceController.php
    └── ...
```

**Vấn đề:**
1. Chỉ có folder `Admin/` → ngụ ý chỉ admin truy cập được
2. Không phân biệt được nghiệp vụ (User, Order, Financial)
3. Manager, Accountant cũng cần truy cập nhưng folder tên Admin
4. Không linh hoạt khi thêm role mới

### Frontend - Vấn đề:
```
routes/
├── admin/          ❌ Routes riêng cho admin
├── manager/        ❌ Routes riêng cho manager
├── accountant/     ❌ Routes riêng cho accountant
├── mechanic/       ❌ Routes riêng cho mechanic
└── employee/       ❌ Routes riêng cho employee
```

**Vấn đề:**
1. Duplicate code giữa các role folders
2. Cùng 1 page (VD: Orders) bị copy nhiều nơi
3. Khó maintain khi update
4. Không phù hợp với permission-based (user có thể có quyền từ nhiều roles)

---

## 🏗️ CẤU TRÚC MỚI - THEO NGHIỆP VỤ

### Backend Structure (New)

```
backend/app/Http/Controllers/Api/
├── Auth/                           # Authentication
│   └── AuthController.php          
│
├── Management/                     # Quản lý hệ thống (thay vì Admin)
│   ├── Users/
│   │   └── UserController.php      # Permission: users.*
│   ├── Roles/
│   │   └── RoleController.php      # Permission: roles.*
│   └── Settings/
│       └── SettingController.php   # Permission: settings.*
│
├── Customer/                       # Quản lý khách hàng
│   ├── CustomerController.php      # Permission: customers.*
│   └── VehicleController.php       # Permission: vehicles.*
│
├── Sales/                          # Nghiệp vụ bán hàng
│   ├── OrderController.php         # Permission: orders.*
│   ├── ServiceRequestController.php # Permission: service_requests.*
│   └── QuotationController.php     # Permission: quotations.*
│
├── Financial/                      # Nghiệp vụ tài chính
│   ├── InvoiceController.php       # Permission: invoices.*
│   ├── PaymentController.php       # Permission: payments.*
│   └── SettlementController.php    # Permission: settlements.*
│
├── Inventory/                      # Quản lý kho
│   ├── ProductController.php       # Permission: products.*
│   ├── WarehouseController.php     # Permission: warehouses.*
│   └── StockController.php         # Permission: stocks.*
│
├── Services/                       # Dịch vụ sửa chữa
│   ├── ServiceController.php       # Permission: services.*
│   └── CategoryController.php      # Permission: categories.*
│
├── Partners/                       # Quản lý đối tác
│   ├── ProviderController.php      # Permission: providers.*
│   └── PartnerVehicleHandoverController.php
│
├── Reports/                        # Báo cáo
│   ├── DashboardController.php     # Permission: dashboard.*
│   └── ReportController.php        # Permission: reports.*
│
└── Common/                         # Common features
    ├── NotificationController.php
    └── BadgeController.php
```

### Frontend Structure (New)

```
frontend/app/routes/
├── auth/                           # Public auth routes
│   ├── login.tsx
│   └── register.tsx
│
├── dashboard/                      # Dashboard chung (protected)
│   └── index.tsx                   # Permission: dashboard.view
│
├── users/                          # Quản lý người dùng
│   ├── index.tsx                   # Permission: users.view
│   ├── create.tsx                  # Permission: users.create
│   └── [id].edit.tsx               # Permission: users.edit
│
├── customers/                      # Quản lý khách hàng
│   ├── index.tsx                   # Permission: customers.view
│   ├── create.tsx                  # Permission: customers.create
│   └── [id]/
│       ├── index.tsx               # View detail
│       ├── edit.tsx                # Permission: customers.edit
│       └── vehicles.tsx            # Permission: vehicles.view
│
├── orders/                         # Quản lý đơn hàng
│   ├── index.tsx                   # Permission: orders.view
│   ├── create.tsx                  # Permission: orders.create
│   ├── [id].tsx                    # View detail
│   └── my-orders.tsx               # Permission: orders.manage_own
│
├── invoices/                       # Quản lý hóa đơn
│   ├── index.tsx                   # Permission: invoices.view
│   ├── [id].tsx                    # View detail
│   └── pending.tsx                 # Permission: invoices.approve
│
├── payments/                       # Quản lý thanh toán
│   ├── index.tsx                   # Permission: payments.view
│   └── confirm.tsx                 # Permission: payments.confirm
│
├── inventory/                      # Quản lý kho
│   ├── products/
│   │   └── index.tsx               # Permission: products.view
│   ├── warehouses/
│   │   └── index.tsx               # Permission: warehouses.view
│   └── stocks/
│       └── index.tsx               # Permission: stocks.view
│
├── services/                       # Dịch vụ
│   ├── index.tsx                   # Permission: services.view
│   └── categories/
│       └── index.tsx               # Permission: categories.view
│
├── reports/                        # Báo cáo
│   ├── index.tsx                   # Permission: reports.view
│   ├── financial.tsx               # Permission: reports.financial
│   └── operations.tsx              # Permission: reports.operations
│
└── settings/                       # Cài đặt
    ├── index.tsx                   # Permission: settings.view
    ├── roles.tsx                   # Permission: roles.view
    └── profile.tsx                 # No permission needed
```

---

## 🔄 MIGRATION PLAN

### Phase 1: Backend Controllers (Ưu tiên cao) ⚡

#### Step 1.1: Tạo folder structure mới
```bash
# Tạo folders theo nghiệp vụ
backend/app/Http/Controllers/Api/
├── Management/
├── Customer/
├── Sales/
├── Financial/
├── Inventory/
├── Services/
├── Partners/
├── Reports/
└── Common/
```

#### Step 1.2: Di chuyển và update namespace

**Từ:**
```php
namespace App\Http\Controllers\Api\Admin;

class UserController extends Controller { }
```

**Sang:**
```php
namespace App\Http\Controllers\Api\Management\Users;

class UserController extends Controller { }
```

#### Step 1.3: Update routes
```php
// Cũ
use App\Http\Controllers\Api\Admin\UserController;

// Mới
use App\Http\Controllers\Api\Management\Users\UserController;
```

### Phase 2: Frontend Routes (Ưu tiên cao) ⚡

#### Step 2.1: Tạo folder structure mới
```bash
# Xóa các folders theo role
rm -rf routes/admin routes/manager routes/accountant routes/mechanic routes/employee

# Tạo folders theo nghiệp vụ
mkdir routes/dashboard routes/users routes/customers routes/orders ...
```

#### Step 2.2: Di chuyển pages và wrap với PermissionGate

**Cũ (admin/users/index.tsx):**
```tsx
export default function AdminUsersPage() {
  // No permission check
  return <div>Users list</div>
}
```

**Mới (users/index.tsx):**
```tsx
import { PermissionGate } from '~/components/permissions';

export default function UsersPage() {
  return (
    <PermissionGate permission="users.view">
      <div>Users list</div>
    </PermissionGate>
  );
}
```

#### Step 2.3: Update navigation/sidebar

**Cũ:**
```tsx
{user.role.name === 'admin' && (
  <Link to="/admin/users">Users</Link>
)}
```

**Mới:**
```tsx
<Can permission="users.view">
  <Link to="/users">Users</Link>
</Can>
```

### Phase 3: Cleanup & Testing

- [ ] Xóa folders cũ (Admin, manager, accountant, etc)
- [ ] Update tất cả imports
- [ ] Test từng role
- [ ] Update documentation

---

## 📋 MAPPING CONTROLLERS VỚI NGHIỆP VỤ

### Management (Quản lý hệ thống)
- `UserController` → `Management/Users/UserController`
- `RoleController` → `Management/Roles/RoleController`
- `SettingController` → `Management/Settings/SettingController`

### Customer (Khách hàng)
- `CustomerController` → `Customer/CustomerController`
- `VehicleController` → `Customer/VehicleController`
- `VehicleBrandController` → `Customer/VehicleBrandController`

### Sales (Bán hàng)
- `OrderController` → `Sales/OrderController`
- `ServiceRequestController` → `Sales/ServiceRequestController`
- `PartnerVehicleHandoverController` → `Sales/PartnerVehicleHandoverController`

### Financial (Tài chính)
- `InvoiceController` → `Financial/InvoiceController`
- `PaymentController` → `Financial/PaymentController`
- `SettlementController` → `Financial/SettlementController`

### Inventory (Kho)
- `ProductController` → `Inventory/ProductController`
- `WarehouseController` → `Inventory/WarehouseController`
- `StockController` → `Inventory/StockController`

### Services (Dịch vụ)
- `ServiceController` → `Services/ServiceController`
- `CategoryController` → `Services/CategoryController`

### Partners (Đối tác)
- `ProviderController` → `Partners/ProviderController`

### Reports (Báo cáo)
- `DashboardController` → `Reports/DashboardController`
- `ReportController` → `Reports/ReportController`

### Common (Chung)
- `NotificationController` → `Common/NotificationController`
- `BadgeController` → `Common/BadgeController`

---

## 🎯 LỢI ÍCH CỦA CẤU TRÚC MỚI

### 1. Tách biệt theo nghiệp vụ (Business Logic)
```
❌ Cũ: Admin/UserController → Ngụ ý chỉ admin dùng
✅ Mới: Management/Users/UserController → Ai có permission users.* đều dùng được
```

### 2. Không duplicate code
```
❌ Cũ: 
- admin/orders/index.tsx
- manager/orders/index.tsx  ← Duplicate
- mechanic/orders/index.tsx ← Duplicate

✅ Mới:
- orders/index.tsx (duy nhất, check permission bên trong)
```

### 3. Dễ mở rộng
```
❌ Cũ: Thêm role mới → phải tạo folder mới + copy code
✅ Mới: Thêm role mới → chỉ cần config permissions trong DB
```

### 4. Theo nghiệp vụ thật của Garage
```
✅ Customer Management (Khách hàng + Xe)
✅ Sales Operations (Đơn hàng + Yêu cầu dịch vụ)
✅ Financial Management (Hóa đơn + Thanh toán)
✅ Inventory Management (Kho + Sản phẩm)
✅ Service Management (Dịch vụ + Danh mục)
✅ Partner Management (Đối tác)
✅ Reporting (Báo cáo)
```

### 5. Permission-based routing
```tsx
// Một page phục vụ nhiều roles khác nhau
<Route path="/orders">
  <PermissionGate permission="orders.view">
    <OrdersPage />
  </PermissionGate>
</Route>

// Bên trong page:
<Can permission="orders.approve">
  <ApproveButton />  // Chỉ ai có quyền mới thấy
</Can>
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

### 1. Database không thay đổi
Cấu trúc database **GIỮ NGUYÊN**, chỉ thay đổi code structure:
- ✅ `roles` table với `permissions` JSON
- ✅ `users` table với `custom_permissions`
- ✅ Tất cả relationships giữ nguyên

### 2. Backward compatible
Hệ thống vẫn **hỗ trợ check role** khi cần:
```tsx
<Can role="admin">  // Vẫn hoạt động
  <AdminPanel />
</Can>
```

### 3. Migration từng bước
Không cần migrate hết 1 lúc:
1. Tạo structure mới
2. Di chuyển từng module
3. Test kỹ
4. Xóa code cũ khi đã stable

### 4. Routes vẫn clean
```
❌ Cũ: /admin/users, /manager/orders
✅ Mới: /users, /orders (permission check bên trong)
```

---

## 📝 CHECKLIST IMPLEMENTATION

### Backend
- [ ] Tạo folders: Management, Customer, Sales, Financial, Inventory, Services, Partners, Reports, Common
- [ ] Di chuyển UserController → Management/Users/
- [ ] Di chuyển OrderController → Sales/
- [ ] Di chuyển InvoiceController → Financial/
- [ ] Di chuyển ProductController → Inventory/
- [ ] Di chuyển ServiceController → Services/
- [ ] Di chuyển ProviderController → Partners/
- [ ] Di chuyển DashboardController → Reports/
- [ ] Di chuyển NotificationController → Common/
- [ ] Update tất cả namespaces
- [ ] Update routes/api.php
- [ ] Run `composer dump-autoload`
- [ ] Test API endpoints

### Frontend
- [ ] Tạo folders: users, customers, orders, invoices, payments, inventory, services, reports
- [ ] Di chuyển admin/users → users (wrap với PermissionGate)
- [ ] Di chuyển admin/orders → orders
- [ ] Di chuyển admin/invoices → invoices
- [ ] Xóa folders: admin, manager, accountant, mechanic, employee
- [ ] Update Sidebar navigation với Can components
- [ ] Update all routes
- [ ] Test UI với các roles khác nhau

---

## 🚀 READY TO IMPLEMENT

**Next Step:** Implement từng phase theo thứ tự ưu tiên!

**Estimated Time:**
- Phase 1 (Backend): 2-3 hours
- Phase 2 (Frontend): 3-4 hours  
- Phase 3 (Testing): 1-2 hours
- **Total: 6-9 hours**

