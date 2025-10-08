# 📋 SERVICES REFACTORING - MIGRATION GUIDE

## Tổng quan thay đổi

Đã refactor cấu trúc services để loại bỏ code trùng lặp và dễ bảo trì hơn.

## 🔄 Thay đổi cấu trúc

### TRƯỚC (Cũ - Bị trùng lặp)
```
utils/
  ├── api.ts              → Low-level HTTP client
  ├── auth.ts             → Auth logic + API calls
  ├── formatters.ts
  └── validators.ts

services/
  ├── api.service.ts      → Wrapper cho utils/api.ts (TRÙNG LẶP!)
  ├── user.service.ts
  ├── product.service.ts
  └── ...

contexts/
  └── AuthContext.tsx     → State + Business Logic (TRÙNG LẶP!)
```

### SAU (Mới - Tối ưu)
```
utils/
  ├── formatters.ts       → Helper functions only
  ├── validators.ts       → Helper functions only
  └── permissions.ts      → Helper functions only

services/
  ├── api.service.ts      → UNIFIED HTTP Client (gộp utils/api + services/api.service)
  ├── auth.service.ts     → Auth Business Logic (chuyển từ utils/auth.ts)
  ├── user.service.ts
  ├── product.service.ts
  └── ...

contexts/
  └── AuthContext.tsx     → React State Management ONLY
```

## 📝 Migration - Cập nhật Import

### 1. API Service
```typescript
// ❌ CŨ
import { api } from '~/utils/api';
import { authService } from '~/utils/auth';

const token = authService.getToken();
const response = await api.get('/endpoint', token);

// ✅ MỚI
import { apiService } from '~/services/api.service';

const response = await apiService.get('/endpoint'); // Auto auth!
```

### 2. Auth Service
```typescript
// ❌ CŨ
import { authService } from '~/utils/auth';

// ✅ MỚI
import { authService } from '~/services/auth.service';
```

### 3. Auth Context (không đổi)
```typescript
// ✅ Giữ nguyên
import { useAuth } from '~/contexts/AuthContext';

const { user, login, logout } = useAuth();
```

## 🎯 API Service - Các phương thức

### Authenticated Endpoints (tự động thêm token)
```typescript
// GET request
const data = await apiService.get<User>('/users/123');

// GET với params
const data = await apiService.get<User>('/users/search', { name: 'John' });

// GET với pagination
const paginated = await apiService.getPaginated<User>('/users', {
  page: 1,
  per_page: 10,
  search: 'John',
  sort_by: 'name',
  sort_direction: 'asc'
});

// POST
const newUser = await apiService.post<User>('/users', { name: 'John' });

// PUT
const updated = await apiService.put<User>('/users/123', { name: 'Jane' });

// DELETE
await apiService.delete('/users/123');
```

### Public Endpoints (không cần token)
```typescript
// Login/Register không cần token
const response = await apiService.postPublic<AuthResponse>('/auth/login', {
  email: 'user@example.com',
  password: 'password'
});

// Public data
const data = await apiService.getPublic<Product[]>('/products/public');
```

### Low-level HTTP Client (trường hợp đặc biệt)
```typescript
import { api } from '~/services/api.service';

// Nếu cần control hoàn toàn token
const response = await api.get<Data>('/endpoint', customToken);
```

## 🔐 Auth Service - Các phương thức

```typescript
import { authService } from '~/services/auth.service';

// Login
const { user, token } = await authService.login({ email, password });

// Register
const { user, token } = await authService.register(data);

// Logout
await authService.logout();

// Get current user (gọi API)
const user = await authService.getCurrentUser();

// Get stored user (từ localStorage, không gọi API)
const user = authService.getStoredUser();

// Get token
const token = authService.getToken();

// Check auth
const isAuth = authService.isAuthenticated();

// Clear auth data
authService.clearAuth();
```

## 🎨 Auth Context - Chỉ State Management

```typescript
import { useAuth } from '~/contexts/AuthContext';

function Component() {
  const { 
    user,           // Current user object
    isLoading,      // Loading state
    isAuthenticated, // Boolean
    login,          // Async function
    register,       // Async function
    logout,         // Async function
    refreshUser     // Refresh user data
  } = useAuth();

  // AuthContext CHỈ quản lý React state
  // Business logic nằm ở authService
}
```

## ✅ Lợi ích sau khi refactor

### 1. **Loại bỏ trùng lặp**
- ❌ Trước: 2 API clients (`utils/api` + `services/api.service`)
- ✅ Sau: 1 API client duy nhất (`services/api.service`)

### 2. **Separation of Concerns**
- `utils/` → Chỉ chứa helper functions (formatters, validators)
- `services/` → Business logic, API calls
- `contexts/` → React state management only

### 3. **Auto Authentication**
- Không cần truyền token manually
- `apiService` tự động lấy token từ localStorage

### 4. **Dễ bảo trì**
- Tất cả API logic tập trung ở `services/`
- Dễ dàng thêm middleware, interceptors
- Dễ test

### 5. **Type Safety**
- Generic types cho response data
- TypeScript inference hoạt động tốt hơn

## 🚨 Breaking Changes

### Các import cần update
```typescript
// ❌ Không còn hoạt động
import { api } from '~/utils/api';
import { authService } from '~/utils/auth';

// ✅ Update thành
import { apiService } from '~/services/api.service';
import { authService } from '~/services/auth.service';
```

### Domain services đã được update tự động
Tất cả các services sau đã được cập nhật:
- ✅ `user.service.ts`
- ✅ `customer.service.ts`
- ✅ `product.service.ts`
- ✅ `order.service.ts`
- ✅ `invoice.service.ts`
- ✅ `service.service.ts`
- ✅ `vehicle.service.ts`
- ✅ `warehouse.service.ts`
- ✅ `warranty.service.ts`
- ✅ `notification.service.ts`
- ✅ `direct-sale.service.ts`
- ✅ `category.service.ts`
- ✅ `role.service.ts`
- ✅ `dashboard.service.ts`
- ✅ `provider.service.ts`
- ✅ `settlement.service.ts`

## 📦 Files có thể XÓA (nếu muốn)

Các file sau đã KHÔNG còn được dùng:
```
utils/api.ts          → Đã gộp vào services/api.service.ts
utils/auth.ts         → Đã chuyển thành services/auth.service.ts
```

**Lưu ý**: Chưa xóa để tránh break code nếu có component nào vẫn đang import cũ.

## 🔍 Next Steps

1. ✅ Search toàn project cho `from '~/utils/api'` và update
2. ✅ Search toàn project cho `from '~/utils/auth'` và update
3. ✅ Test lại login/logout flow
4. ✅ Test các API calls trong các pages
5. ✅ Sau khi chắc chắn không còn lỗi → XÓA `utils/api.ts` và `utils/auth.ts`

## 💡 Best Practices

### DO ✅
- Dùng `apiService` cho authenticated endpoints
- Dùng `apiService.postPublic` cho login/register
- Dùng `authService` cho auth operations
- Dùng `useAuth()` hook trong React components

### DON'T ❌
- Không truyền token manually nữa (apiService tự động lấy)
- Không gọi fetch/axios trực tiếp
- Không để business logic trong Context
- Không duplicate API calls

## 📚 Examples

### Example 1: Login Page
```typescript
import { useAuth } from '~/contexts/AuthContext';
import { useNavigate } from 'react-router';

function LoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (credentials) => {
    try {
      await login(credentials); // Business logic ở authService
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  return <LoginForm onSubmit={handleLogin} loading={isLoading} />;
}
```

### Example 2: User Management Page
```typescript
import { userService } from '~/services/user.service';
import { useTable } from '~/hooks/useTable';

function UsersPage() {
  const { data, loading, refetch } = useTable(userService.getUsers);

  const handleDelete = async (id: number) => {
    await userService.deleteUser(id);
    refetch();
  };

  return <UserTable data={data} loading={loading} onDelete={handleDelete} />;
}
```

### Example 3: Custom Service
```typescript
// services/custom.service.ts
import { apiService } from './api.service';

class CustomService {
  async getData() {
    return apiService.get<MyData>('/custom-endpoint');
  }

  async createData(data: CreateData) {
    return apiService.post<MyData>('/custom-endpoint', data);
  }
}

export const customService = new CustomService();
```

---

## 🎉 Kết luận

Refactor hoàn tất! Cấu trúc mới clean hơn, dễ bảo trì và mở rộng. Tất cả API calls giờ đi qua `services/`, context chỉ quản lý state, utils chỉ chứa helpers.

**Author**: AutoCare Pro Team  
**Date**: 2025-10-08  
**Version**: 2.0 - Refactored & Optimized

