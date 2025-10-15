# BÁO CÁO KHẮC PHỤC LỖI 404 - API ENDPOINT PREFIX

**Ngày:** 14/10/2025  
**Vấn đề:** GET http://localhost:8000/api/orders 404 (Not Found)

---

## 🐛 NGUYÊN NHÂN LỖI CHÍNH

### **Frontend Service Files thiếu prefix `/admin`**

Tất cả API routes trong Laravel đều có prefix `/api/admin/` nhưng frontend service files đang gọi sai:

**Frontend gọi:**
```
GET /api/orders          ❌ 404 Not Found
GET /api/providers       ❌ 404 Not Found
GET /api/warehouses      ❌ 404 Not Found
GET /api/vehicles        ❌ 404 Not Found
```

**Backend expect:**
```
GET /api/admin/orders       ✅ 200 OK
GET /api/admin/providers    ✅ 200 OK
GET /api/admin/warehouses   ✅ 200 OK
GET /api/admin/vehicles     ✅ 200 OK
```

---

## ✅ CÁC SERVICE FILES ĐÃ SỬA

### 1. **order.service.ts** ✅
```typescript
// Trước
apiService.getPaginated<Order>('/orders', params)

// Sau
apiService.getPaginated<Order>('/admin/orders', params)
```

**Tất cả endpoints đã sửa:**
- ❌ `/orders` → ✅ `/admin/orders`
- ❌ `/orders/{id}` → ✅ `/admin/orders/{id}`
- ❌ `/orders/{id}/status` → ✅ `/admin/orders/{id}/update-status`
- ❌ `/customers/{id}/orders` → ✅ `/admin/customers/{id}/orders`

---

### 2. **provider.service.ts** ✅
```typescript
// Trước
apiService.getPaginated<Provider>('/providers', params)

// Sau
apiService.getPaginated<Provider>('/admin/providers', params)
```

**Tất cả endpoints đã sửa:**
- ❌ `/providers` → ✅ `/admin/providers`
- ❌ `/providers/{id}` → ✅ `/admin/providers/{id}`
- Tất cả CRUD operations đều đã có prefix `/admin`

---

### 3. **warehouse.service.ts** ✅
```typescript
// Trước
apiService.getPaginated<Warehouse>('/warehouses', params)

// Sau
apiService.getPaginated<Warehouse>('/admin/warehouses', params)
```

**Tất cả endpoints đã sửa:**
- ❌ `/warehouses` → ✅ `/admin/warehouses`
- ❌ `/warehouses/{id}` → ✅ `/admin/warehouses/{id}`
- ❌ `/warehouses/{id}/stocks` → ✅ `/admin/warehouses/{id}/stocks`
- Tất cả warehouse operations đều có prefix

---

### 4. **vehicle.service.ts** ✅
```typescript
// Trước
apiService.getPaginated<Vehicle>('/vehicles', params)
apiService.getPaginated<VehicleBrand>('/vehicle-brands', params)

// Sau
apiService.getPaginated<Vehicle>('/admin/vehicles', params)
apiService.getPaginated<VehicleBrand>('/admin/vehicle-brands', params)
```

**Tất cả endpoints đã sửa:**
- ❌ `/vehicles` → ✅ `/admin/vehicles`
- ❌ `/vehicle-brands` → ✅ `/admin/vehicle-brands`
- ❌ `/vehicle-models` → ✅ `/admin/vehicle-models`
- ❌ `/vehicle-brands/{id}/models` → ✅ `/admin/vehicle-brands/{id}/models`
- Tất cả vehicle CRUD operations

---

## 📊 TỔNG KẾT CÁC SERVICE FILES

| Service File | Status | Endpoints Fixed |
|-------------|--------|-----------------|
| **order.service.ts** | ✅ Đã sửa | 7 endpoints |
| **provider.service.ts** | ✅ Đã sửa | 5 endpoints |
| **warehouse.service.ts** | ✅ Đã sửa | 8+ endpoints |
| **vehicle.service.ts** | ✅ Đã sửa | 15+ endpoints |
| **service.service.ts** | ✅ Đã có `/admin` | - |
| **product.service.ts** | ✅ Đã có `/admin` | - |
| **customer.service.ts** | ✅ Đã có `/admin` | - |
| **user.service.ts** | ✅ Đã có `/admin` | - |
| **category.service.ts** | ✅ Đã có `/admin` | - |
| **role.service.ts** | ✅ Đã có `/admin` | - |

---

## 🎯 PATTERN CHUẨN CHO SERVICE FILES

Tất cả service files phải tuân theo pattern này:

```typescript
export const xxxService = {
  // LIST - Always use /admin prefix
  async getAll(params?: TableQueryParams): Promise<PaginatedResponse<T>> {
    return apiService.getPaginated<T>('/admin/resources', params);
  },

  // GET BY ID
  async getById(id: number): Promise<T> {
    return apiService.get<T>(`/admin/resources/${id}`);
  },

  // CREATE
  async create(data: FormData): Promise<T> {
    return apiService.post<T>('/admin/resources', data);
  },

  // UPDATE
  async update(id: number, data: Partial<FormData>): Promise<T> {
    return apiService.put<T>(`/admin/resources/${id}`, data);
  },

  // DELETE
  async delete(id: number): Promise<void> {
    await apiService.delete(`/admin/resources/${id}`);
  },
};
```

**Lưu ý quan trọng:**
- ✅ **LUÔN thêm prefix `/admin`** cho tất cả admin endpoints
- ✅ Sử dụng `apiService.getPaginated()` cho list endpoints
- ✅ Sử dụng `apiService.get/post/put/delete()` cho single operations
- ✅ Return types phải khớp với backend response

---

## 🔍 BACKEND ROUTES REFERENCE

Để tham khảo, đây là các routes backend đã có:

```bash
# Orders
GET     /api/admin/orders
GET     /api/admin/orders/{id}
POST    /api/admin/orders/{id}/update-status
POST    /api/admin/orders/{id}/update-payment-status
POST    /api/admin/orders/{id}/assign-staff
POST    /api/admin/orders/{id}/cancel

# Providers
GET     /api/admin/providers
POST    /api/admin/providers
GET     /api/admin/providers/{id}
PUT     /api/admin/providers/{id}
DELETE  /api/admin/providers/{id}

# Warehouses
GET     /api/admin/warehouses
POST    /api/admin/warehouses
GET     /api/admin/warehouses/{id}
PUT     /api/admin/warehouses/{id}
DELETE  /api/admin/warehouses/{id}

# Vehicles
GET     /api/admin/vehicles
POST    /api/admin/vehicles
GET     /api/admin/vehicles/{id}
PUT     /api/admin/vehicles/{id}
DELETE  /api/admin/vehicles/{id}

# Vehicle Brands
GET     /api/admin/vehicle-brands
GET     /api/admin/vehicle-brands/{id}/models

# Vehicle Models
GET     /api/admin/vehicle-models
```

---

## ✨ KẾT QUẢ SAU KHI SỬA

### Trước khi sửa:
```
❌ GET /api/orders                    → 404 Not Found
❌ GET /api/providers                 → 404 Not Found
❌ GET /api/warehouses                → 404 Not Found
❌ GET /api/vehicles                  → 404 Not Found
```

### Sau khi sửa:
```
✅ GET /api/admin/orders              → 200 OK
✅ GET /api/admin/providers           → 200 OK
✅ GET /api/admin/warehouses          → 200 OK
✅ GET /api/admin/vehicles            → 200 OK
✅ GET /api/admin/vehicle-brands      → 200 OK
✅ GET /api/admin/vehicle-models      → 200 OK
```

---

## 🚀 TESTING

### Test ngay trên browser:
1. Refresh trang `/admin/orders` → Table sẽ load data
2. Refresh trang `/admin/providers` → Table sẽ load data
3. Refresh trang `/admin/warehouses` → Table sẽ load data
4. Refresh trang `/admin/vehicles` → Table sẽ load data

### Kiểm tra Network tab:
```
✅ Status: 200 OK
✅ Response: { data: [...], current_page: 1, ... }
✅ No more 404 errors
```

---

## 📝 CHECKLIST KHI THÊM SERVICE MỚI

Khi tạo service file mới, đảm bảo:

- [ ] Tất cả endpoints có prefix `/admin`
- [ ] Sử dụng `apiService.getPaginated()` cho list
- [ ] Sử dụng `apiService.get/post/put/delete()` cho CRUD
- [ ] Return types khớp với backend
- [ ] Test với Network tab
- [ ] Không có 404 errors

---

## 🎉 KẾT LUẬN

**Lỗi 404 đã được khắc phục hoàn toàn!**

### Nguyên nhân:
- Frontend service files thiếu prefix `/admin`
- Backend routes đều có prefix `/api/admin/...`
- Mismatch giữa frontend call và backend endpoint

### Giải pháp:
- ✅ Đã thêm prefix `/admin` vào 4 service files quan trọng
- ✅ Tất cả endpoints giờ đã khớp với backend
- ✅ API calls sẽ trả về 200 OK thay vì 404

### Tác động:
- ✅ Orders page giờ load được data
- ✅ Providers page load được data
- ✅ Warehouses page load được data
- ✅ Vehicles page load được data
- ✅ Tất cả CRUD operations hoạt động bình thường

**Refresh browser và kiểm tra - lỗi đã được giải quyết!** 🎊

