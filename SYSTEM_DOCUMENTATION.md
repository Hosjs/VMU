# Hệ Thống Quản Lý Đào Tạo Sau Đại Học VMU - System Documentation

## Tổng Quan Hệ Thống

### Giới Thiệu
Hệ thống quản lý đào tạo sau đại học (Master & PhD programs) được xây dựng với kiến trúc **Full-stack Modern Web Application**:
- **Backend**: Laravel 11 + Passport (OAuth2 Authentication)
- **Frontend**: React 19 + React Router v7 + TypeScript + Vite
- **Database**: MySQL
- **Styling**: TailwindCSS v4

### Mục Đích
- Quản lý học viên, giảng viên, lớp học
- Quản lý môn học, chương trình đào tạo
- Quản lý phân công giảng dạy
- Quản lý thanh toán giảng viên
- Hệ thống phân quyền linh hoạt
- UI/UX hiện đại, responsive

---

## Kiến Trúc Tổng Thể

### 1. Backend Architecture (Laravel)

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/                    # API Controllers
│   │   │   │   └── AuthController.php  # Authentication endpoints
│   │   │   └── Controller.php          # Base controller
│   │   ├── Middleware/                 # Custom middleware
│   │   └── Resources/                  # API Resources (transformers)
│   ├── Models/                         # Eloquent Models
│   │   ├── User.php
│   │   ├── Role.php
│   │   ├── UserRole.php
│   │   ├── PermissionModule.php
│   │   └── PermissionAction.php
│   ├── Observers/                      # Model Observers
│   ├── Providers/                      # Service Providers
│   └── Traits/
│       └── HasPermissions.php          # Permission checking trait
├── config/                             # Configuration files
├── database/
│   ├── migrations/                     # Database migrations
│   ├── seeders/                        # Data seeders
│   └── database.sqlite                 # SQLite database
└── routes/
    └── api.php                         # API routes
```

#### Backend Key Features

**Authentication & Authorization:**
- Laravel Passport OAuth2 implementation
- JWT token-based authentication
- Role-based access control (RBAC)
- Custom permissions system với module + action

**API Structure:**
- RESTful API design
- Consistent response format
- Validation & error handling
- Pagination support
- Filtering & sorting

**Database Design:**
- Normalized schema
- Soft deletes support
- Timestamps tracking
- Foreign key constraints

**Key Tables:**
```
- users: Người dùng hệ thống
- roles: Vai trò (admin, manager, accountant, teacher, student, homeroom_teacher)
- trinh_do_dao_tao: Trình độ đào tạo (Cử nhân, Thạc sỹ, Tiến sỹ)
- nganh_hoc: Ngành học cũ
- majors: Ngành học mới với cấu trúc cây (parent_id)
- khoa_hoc: Khóa học/học kỳ
- classes: Lớp học
- students: Học viên
- class_students: Quan hệ lớp-học viên
- lecturers: Giảng viên (349 records)
- subjects: Môn học
- major_subjects: Quan hệ ngành-môn học
- subject_students: Quan hệ môn học-học viên (với điểm)
- subject_enrollments: Đăng ký môn học
- teaching_assignments: Phân công giảng dạy
- payment_rates: Đơn giá thanh toán
- lecturer_payments: Thanh toán giảng viên
```

---

### 2. Frontend Architecture (React + TypeScript)

```
frontend/
├── app/
│   ├── root.tsx                        # Entry point với providers
│   ├── routes.ts                       # Route definitions
│   ├── app.css                         # Global styles
│   │
│   ├── components/
│   │   ├── LoadingSystem.tsx           # Loading states
│   │   └── ui/                         # Reusable UI components
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       ├── Table.tsx
│   │       ├── Select.tsx
│   │       ├── Badge.tsx
│   │       ├── Card.tsx
│   │       ├── Toast.tsx
│   │       ├── Pagination.tsx
│   │       └── index.tsx
│   │
│   ├── contexts/                       # React Contexts
│   │   ├── AuthContext.tsx             # Authentication state
│   │   └── NotificationContext.tsx     # Notifications state
│   │
│   ├── hooks/                          # Custom React Hooks
│   │   ├── useAuth.ts
│   │   ├── useTable.ts
│   │   ├── useModal.ts
│   │   ├── useForm.ts
│   │   ├── useAsync.ts
│   │   └── useBadgeCounts.ts
│   │
│   ├── layouts/                        # Layout components
│   │   ├── MainLayout.tsx              # Protected layout
│   │   ├── Sidebar.tsx                 # Navigation menu
│   │   ├── Header.tsx                  # Top header
│   │   └── Breadcrumb.tsx              # Breadcrumb navigation
│   │
│   ├── routes/                         # Page components
│   │   ├── home.tsx                    # Public home page
│   │   ├── login.tsx                   # Login page
│   │   ├── register.tsx                # Register page
│   │   ├── products.tsx                # Public products
│   │   ├── dashboard/                  # Dashboard pages
│   │   ├── management/                 # User & role management
│   │   ├── customers/                  # Customer management
│   │   ├── sales/                      # Sales management
│   │   ├── financial/                  # Financial management
│   │   ├── inventory/                  # Inventory management
│   │   ├── partners/                   # Partner management
│   │   └── reports/                    # Reports
│   │
│   ├── services/                       # API Services
│   │   ├── api.service.ts              # HTTP client
│   │   ├── auth.service.ts             # Auth operations
│   │   └── index.ts
│   │
│   ├── types/                          # TypeScript types
│   │   ├── auth.ts
│   │   ├── common.ts
│   │   ├── customer.ts
│   │   ├── service.ts
│   │   ├── product.ts
│   │   ├── order.ts
│   │   └── index.ts
│   │
│   └── utils/                          # Utility functions
│       ├── permissions.ts              # Permission helpers
│       ├── formatters.ts               # Data formatters
│       ├── validators.ts               # Form validators
│       └── index.ts
│
├── public/                             # Static files
├── vite.config.ts                      # Vite configuration
├── tsconfig.json                       # TypeScript config
└── package.json                        # Dependencies
```

#### Frontend Key Features

**State Management:**
- React Context API cho global state
- Local state với useState/useReducer
- Server state không cache (fetch mỗi lần cần)

**Routing:**
- React Router v7 (file-based routing)
- Protected routes với authentication guard
- Public routes (home, login, register)
- Layout-based routing

**UI Components:**
- Component library tự xây dựng
- Consistent design system
- Accessible components
- Loading states
- Error boundaries

**Type Safety:**
- Full TypeScript coverage
- Strict type checking
- Type inference
- Interface definitions

---

## Chi Tiết Các Module Hệ Thống

### 1. Authentication Module

**Chức năng:**
- Đăng ký tài khoản mới
- Đăng nhập (email + password)
- Đăng xuất
- Quên mật khẩu (placeholder)
- Refresh token tự động

**Luồng hoạt động:**

```
1. Login Flow:
   User nhập credentials
   → POST /api/auth/login
   → Backend validate
   → Generate access token (Passport)
   → Return { user, token, token_type }
   → Frontend lưu token vào localStorage
   → Update AuthContext state
   → Redirect to /dashboard

2. Session Persistence:
   App load
   → Check localStorage có token
   → GET /api/auth/me (verify token)
   → Nếu valid: set user state
   → Nếu invalid: clear auth, redirect login

3. Protected Routes:
   User access protected route
   → MainLayout check isAuthenticated
   → Nếu false: redirect /login
   → Nếu true: render content

4. Logout Flow:
   User click logout
   → POST /api/auth/logout
   → Clear localStorage
   → Clear AuthContext
   → Redirect to /login
```

**API Endpoints:**
```
POST   /api/auth/register    # Đăng ký
POST   /api/auth/login        # Đăng nhập
POST   /api/auth/logout       # Đăng xuất
GET    /api/auth/me           # Lấy thông tin user hiện tại
GET    /api/auth/permissions  # Lấy permissions của user
```

---

### 2. Permission System (RBAC)

**Cấu trúc phân quyền:**

```
User → Role → Permissions
           → Custom Permissions (override)
```

**Database Schema:**

```sql
users (id, name, email, password, ...)

roles (id, name, display_name, description, is_system, permissions)
  - permissions: JSON { "module": ["action1", "action2"] }

user_roles (user_id, role_id)

permission_modules (id, name, display_name, description)
  - Ví dụ: users, roles, customers, orders, products...

permission_actions (id, module_id, name, display_name, description)
  - Ví dụ: view, create, edit, delete
```

**Cách hoạt động:**

1. **Default Permissions (từ Role):**
   - Role có permissions mặc định dạng JSON
   - User thuộc role → inherit permissions của role

2. **Custom Permissions (User-specific):**
   - Có thể gán thêm/bớt permissions cho user cụ thể
   - Override permissions của role

3. **Permission Checking:**
   ```php
   // Backend (Laravel)
   $user->hasPermission('users.view')
   $user->hasAnyPermission(['users.view', 'users.edit'])
   $user->hasAllPermissions(['users.view', 'users.edit'])
   $user->hasRole('admin')
   $user->canAccessModule('users')
   ```

   ```typescript
   // Frontend (React)
   const { hasPermission, hasAnyPermission, canAccessModule } = useAuth();
   
   if (hasPermission('users.view')) {
     // Show user list
   }
   
   if (hasAnyPermission(['users.edit', 'users.delete'])) {
     // Show action buttons
   }
   ```

**Permission Format:**
```
{module}.{action}

Ví dụ:
- users.view
- users.create
- users.edit
- users.delete
- roles.view
- orders.create
- products.edit
```

**Built-in Roles:**
- **Admin**: Full access tất cả modules
- **Manager**: Quản lý đào tạo - access hầu hết modules
- **Accountant**: Quản lý tài chính, thanh toán giảng viên
- **Teacher**: Giảng viên - xem lịch, nhập điểm
- **Homeroom Teacher**: Giáo viên chủ nhiệm - quản lý lớp, học viên
- **Student**: Học viên - xem thông tin cá nhân, đăng ký môn học

---

### 3. Management Module

**Quản lý người dùng:**
- CRUD users
- Gán role cho user
- Gán custom permissions
- Active/Inactive user
- Reset password

**Quản lý vai trò:**
- CRUD roles
- Set default permissions cho role
- View users thuộc role

**API Endpoints:**
```
GET    /api/management/users          # List users
GET    /api/management/users/:id      # Get user detail
POST   /api/management/users          # Create user
PUT    /api/management/users/:id      # Update user
DELETE /api/management/users/:id      # Delete user

GET    /api/management/roles          # List roles
GET    /api/management/roles/:id      # Get role detail
POST   /api/management/roles          # Create role
PUT    /api/management/roles/:id      # Update role
DELETE /api/management/roles/:id      # Delete role

GET    /api/management/permissions/modules  # Get all modules & actions
```

---

### 4. Customer Module

**Chức năng:**
- Quản lý thông tin khách hàng
- Quản lý phương tiện của khách hàng
- Lịch sử giao dịch
- Ghi chú khách hàng

**Entities:**
- Customer (khách hàng)
- Vehicle (phương tiện)
- CustomerNote (ghi chú)

---

### 5. Sales Module

**Chức năng:**
- Quản lý đơn hàng
- Quản lý yêu cầu dịch vụ
- Theo dõi trạng thái
- Workflow automation

**Workflow:**
```
Service Request → Quotation → Order → Work Order → Invoice → Payment
```

---

### 6. Financial Module

**Chức năng:**
- Quản lý hóa đơn
- Quản lý thanh toán
- Quyết toán công nợ
- Báo cáo tài chính

**Entities:**
- Invoice (hóa đơn)
- Payment (thanh toán)
- Settlement (quyết toán)

---

### 7. Inventory Module

**Chức năng:**
- Quản lý sản phẩm
- Quản lý kho
- Nhập/xuất kho
- Kiểm kê tồn kho

**Entities:**
- Product (sản phẩm)
- Warehouse (kho)
- Stock (tồn kho)
- StockTransaction (phiếu nhập/xuất)

---

### 8. Partners Module

**Chức năng:**
- Quản lý nhà cung cấp
- Quản lý đối tác
- Lịch sử giao dịch

---

### 9. Reports Module

**Chức năng:**
- Báo cáo doanh thu
- Báo cáo tồn kho
- Báo cáo công nợ
- Báo cáo hiệu suất
- Export Excel/PDF

---

## Hướng Dẫn Sử Dụng Base Code

### 1. Setup Dự Án Mới

**Clone base code:**
```bash
git clone <base-code-repo>
cd my-new-project
```

**Backend Setup:**
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
php artisan passport:install
php artisan serve
```

**Frontend Setup:**
```bash
cd frontend
npm install
npm run dev
```

**Environment Variables:**
```env
# Backend (.env)
APP_NAME="Your App Name"
APP_URL=http://localhost:8000
DB_CONNECTION=sqlite

# Frontend (.env)
VITE_API_URL=http://localhost:8000/api
```

---

### 2. Tạo Module Mới

#### Bước 1: Backend (Laravel)

**Tạo Migration:**
```bash
php artisan make:migration create_products_table
```

```php
Schema::create('products', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->text('description')->nullable();
    $table->decimal('price', 10, 2);
    $table->integer('stock')->default(0);
    $table->boolean('is_active')->default(true);
    $table->timestamps();
    $table->softDeletes();
});
```

**Tạo Model:**
```bash
php artisan make:model Product
```

```php
class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'price',
        'stock',
        'is_active'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
    ];
}
```

**Tạo Controller:**
```bash
php artisan make:controller Api/ProductController --api
```

```php
class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::query();

        if ($request->has('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        return $query->paginate($request->per_page ?? 20);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
        ]);

        $product = Product::create($validated);

        return response()->json([
            'success' => true,
            'data' => $product,
            'message' => 'Product created successfully'
        ], 201);
    }

    public function show(Product $product)
    {
        return response()->json([
            'success' => true,
            'data' => $product
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'description' => 'nullable|string',
            'price' => 'numeric|min:0',
            'stock' => 'integer|min:0',
        ]);

        $product->update($validated);

        return response()->json([
            'success' => true,
            'data' => $product,
            'message' => 'Product updated successfully'
        ]);
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully'
        ]);
    }
}
```

**Thêm Routes:**
```php
// routes/api.php
Route::middleware('auth:api')->group(function () {
    Route::apiResource('products', ProductController::class);
});
```

**Thêm Permissions:**
```sql
INSERT INTO permission_modules (name, display_name) VALUES ('products', 'Quản lý sản phẩm');

INSERT INTO permission_actions (module_id, name, display_name) VALUES
(module_id, 'view', 'Xem sản phẩm'),
(module_id, 'create', 'Tạo sản phẩm'),
(module_id, 'edit', 'Sửa sản phẩm'),
(module_id, 'delete', 'Xóa sản phẩm');
```

#### Bước 2: Frontend (React)

**Tạo Type Definitions:**
```typescript
// app/types/product.ts
export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductFormData {
  name: string;
  description?: string;
  price: number;
  stock: number;
}
```

**Tạo Service:**
```typescript
// app/services/product.service.ts
import { apiService } from './api.service';
import type { Product, ProductFormData } from '~/types/product';
import type { PaginatedResponse, TableQueryParams } from '~/types/common';

class ProductService {
  async getProducts(params: TableQueryParams): Promise<PaginatedResponse<Product>> {
    return apiService.getPaginated<Product>('/products', params);
  }

  async getProduct(id: number): Promise<Product> {
    return apiService.get<Product>(`/products/${id}`);
  }

  async createProduct(data: ProductFormData): Promise<Product> {
    return apiService.post<Product>('/products', data);
  }

  async updateProduct(id: number, data: Partial<ProductFormData>): Promise<Product> {
    return apiService.put<Product>(`/products/${id}`, data);
  }

  async deleteProduct(id: number): Promise<void> {
    return apiService.delete(`/products/${id}`);
  }
}

export const productService = new ProductService();
```

**Tạo Page Component:**
```typescript
// app/routes/products/list.tsx
import { useState, useEffect } from 'react';
import { Table, Button, Modal, Input } from '~/components/ui';
import { useTable, useModal, useForm } from '~/hooks';
import { productService } from '~/services/product.service';
import type { Product, ProductFormData } from '~/types/product';

export default function ProductList() {
  const {
    data,
    isLoading,
    pagination,
    handlePageChange,
    handleSearch,
    handleSort,
    refresh
  } = useTable<Product>({
    fetchFn: productService.getProducts,
    initialParams: {
      page: 1,
      per_page: 20,
      sort_by: 'created_at',
      sort_direction: 'desc'
    }
  });

  const createModal = useModal();
  const editModal = useModal();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const {
    values,
    errors,
    handleChange,
    handleSubmit,
    reset
  } = useForm<ProductFormData>({
    initialValues: {
      name: '',
      description: '',
      price: 0,
      stock: 0
    },
    onSubmit: async (values) => {
      if (selectedProduct) {
        await productService.updateProduct(selectedProduct.id, values);
      } else {
        await productService.createProduct(values);
      }
      reset();
      createModal.close();
      editModal.close();
      refresh();
    }
  });

  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Tên sản phẩm', sortable: true },
    { key: 'price', label: 'Giá', render: (item: Product) => `${item.price.toLocaleString()}đ` },
    { key: 'stock', label: 'Tồn kho' },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (item: Product) => (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => handleEdit(item)}>Sửa</Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(item.id)}>Xóa</Button>
        </div>
      )
    }
  ];

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    reset(product);
    editModal.open();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Bạn có chắc muốn xóa?')) {
      await productService.deleteProduct(id);
      refresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Quản lý sản phẩm</h1>
        <Button onClick={createModal.open}>Thêm sản phẩm</Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table
          columns={columns}
          data={data}
          isLoading={isLoading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onSort={handleSort}
        />
      </div>

      <Modal
        isOpen={createModal.isOpen}
        onClose={createModal.close}
        title="Thêm sản phẩm mới"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Tên sản phẩm"
            name="name"
            value={values.name}
            onChange={handleChange}
            error={errors.name}
            required
          />
          <Input
            label="Mô tả"
            name="description"
            value={values.description}
            onChange={handleChange}
          />
          <Input
            label="Giá"
            name="price"
            type="number"
            value={values.price}
            onChange={handleChange}
            error={errors.price}
            required
          />
          <Input
            label="Tồn kho"
            name="stock"
            type="number"
            value={values.stock}
            onChange={handleChange}
            required
          />
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" onClick={createModal.close}>
              Hủy
            </Button>
            <Button type="submit">Lưu</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
```

**Thêm Route:**
```typescript
// app/routes.ts
layout("layouts/MainLayout.tsx", [
  // ...existing routes...
  route("products/list", "routes/products/list.tsx"),
]),
```

**Thêm Menu Item:**
```typescript
// app/layouts/Sidebar.tsx
const allMenuItems: MenuItem[] = useMemo(() => [
  // ...existing items...
  {
    title: 'Sản phẩm',
    path: '/products/list',
    icon: <CubeIcon className="w-5 h-5" />,
    requiredPermissions: ['products.view'],
  },
], []);
```

---

### 3. API Response Format

**Success Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Product Name"
  },
  "message": "Operation successful"
}
```

**Paginated Response:**
```json
{
  "current_page": 1,
  "data": [...],
  "first_page_url": "...",
  "from": 1,
  "last_page": 10,
  "last_page_url": "...",
  "next_page_url": "...",
  "path": "...",
  "per_page": 20,
  "prev_page_url": null,
  "to": 20,
  "total": 200
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["The email field is required."]
  }
}
```

---

## Best Practices

### Backend (Laravel)

1. **Luôn validate request data**
   ```php
   $request->validate([
       'email' => 'required|email|unique:users',
   ]);
   ```

2. **Sử dụng Eloquent relationships**
   ```php
   $user->roles()->attach($roleId);
   $order->customer;
   ```

3. **Sử dụng Query Builder khi cần performance**
   ```php
   DB::table('users')->where('active', 1)->get();
   ```

4. **Implement soft deletes cho data quan trọng**
   ```php
   use SoftDeletes;
   ```

5. **Luôn return consistent response format**

6. **Sử dụng middleware cho authentication & authorization**

7. **Log errors và important events**
   ```php
   Log::error('Payment failed', ['order_id' => $orderId]);
   ```

### Frontend (React)

1. **Luôn định nghĩa types cho data**
   ```typescript
   interface User {
     id: number;
     name: string;
   }
   ```

2. **Sử dụng custom hooks cho logic tái sử dụng**
   ```typescript
   const { data, isLoading } = useTable(...);
   ```

3. **Handle loading và error states**
   ```typescript
   if (isLoading) return <LoadingSpinner />;
   if (error) return <ErrorMessage />;
   ```

4. **Không hardcode permissions, check động**
   ```typescript
   {hasPermission('users.edit') && <EditButton />}
   ```

5. **Sử dụng UI components có sẵn, không tự tạo mới**

6. **Keep components small và focused**

7. **Sử dụng React.memo cho performance-critical components**

8. **Clean up effects và subscriptions**
   ```typescript
   useEffect(() => {
     return () => cleanup();
   }, []);
   ```

---

## Naming Conventions

### Backend

**Files:**
- Controllers: `ProductController.php` (PascalCase)
- Models: `Product.php` (PascalCase, singular)
- Migrations: `create_products_table.php` (snake_case, plural)

**Database:**
- Tables: `products` (lowercase, plural)
- Columns: `created_at` (snake_case)
- Foreign keys: `user_id` (singular_id)

**Routes:**
- `/api/products` (lowercase, plural)
- `/api/products/{id}` (use route model binding)

### Frontend

**Files:**
- Components: `ProductList.tsx` (PascalCase)
- Services: `product.service.ts` (camelCase)
- Types: `product.ts` (lowercase)
- Hooks: `useProduct.ts` (camelCase)

**Code:**
- Variables: `productList` (camelCase)
- Functions: `getProducts` (camelCase)
- Interfaces: `Product` (PascalCase)
- Types: `ProductType` (PascalCase)

---

## Testing

### Backend Testing
```bash
php artisan test
```

```php
// tests/Feature/ProductTest.php
public function test_can_create_product()
{
    $response = $this->postJson('/api/products', [
        'name' => 'Test Product',
        'price' => 100
    ]);

    $response->assertStatus(201)
             ->assertJson(['success' => true]);
}
```

### Frontend Testing
```bash
npm run test
```

---

## Deployment

### Backend Deployment

1. **Setup server (Ubuntu/CentOS)**
2. **Install dependencies**: PHP 8.2+, Composer, Database
3. **Clone code và install**
   ```bash
   git clone <repo>
   composer install --no-dev
   php artisan migrate --force
   php artisan config:cache
   php artisan route:cache
   ```
4. **Setup web server** (Nginx/Apache)
5. **Setup SSL** (Let's Encrypt)
6. **Setup queue worker** (Supervisor)

### Frontend Deployment

1. **Build production**
   ```bash
   npm run build
   ```
2. **Deploy to hosting** (Vercel, Netlify, S3+CloudFront)
3. **Set environment variables**
4. **Setup custom domain**

---

## Troubleshooting

### Common Issues

**Backend:**
```
Issue: 500 Internal Server Error
Fix: Check logs in storage/logs/laravel.log

Issue: CORS error
Fix: Configure config/cors.php

Issue: Migration fails
Fix: php artisan migrate:fresh (dev only)
```

**Frontend:**
```
Issue: Module not found
Fix: npm install

Issue: Type errors
Fix: npm run typecheck

Issue: API call fails
Fix: Check VITE_API_URL in .env
```

---

## Contact & Support

- **Documentation**: Đọc file này
- **Issues**: Tạo issue trong Git repo
- **Updates**: Check changelog

---

## Changelog

### Version 1.0.0 (Current)
- Initial base code
- Authentication & Authorization
- RBAC permission system
- UI component library
- CRUD modules skeleton
- Documentation

### Roadmap
- [ ] Unit tests coverage
- [ ] E2E testing setup
- [ ] Docker compose setup
- [ ] CI/CD pipeline
- [ ] Performance optimization
- [ ] Security audit

---

**Last Updated**: October 18, 2025
**Version**: 1.0.0
**Maintainer**: Development Team

