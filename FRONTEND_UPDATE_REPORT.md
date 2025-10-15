# BÁO CÁO CẬP NHẬT FRONTEND THEO DATABASE MỚI

**Ngày:** 15/10/2025
**Trạng thái:** 🔄 ĐANG HOÀN THÀNH

---

## 📋 TỔNG QUAN THAY ĐỔI

### ✅ ĐÃ HOÀN THÀNH

#### 1. **Types/Interfaces - Đồng bộ với Backend**

**File: `app/types/product.ts`**
- ✅ **Category Interface** - XÓA trường `type` (service/product/both)
- ✅ **Category** - Thêm `code` field
- ✅ **Category** - Thêm `products_count`
- ✅ **Product Interface** - Đổi `quote_price/settlement_price` → `cost_price/suggested_price`
- ✅ **Product** - Thêm các trường mới: `vehicle_brand_id`, `vehicle_model_id`, `compatible_years`, `is_universal`
- ✅ **Product** - Thêm `supplier_id`, `supplier_code`
- ✅ **Product** - Thêm các trường kho: `min_stock_level`, `max_stock_level`, `reorder_point`
- ✅ **Product** - Thêm relationships: `vehicle_brand`, `vehicle_model`, `supplier`, `warehouse_stocks`
- ✅ **CreateProductData** - Cập nhật đầy đủ theo Product mới
- ✅ **UpdateProductData** - Kế thừa từ CreateProductData

**File: `app/types/service.ts`**
- ✅ **Service Interface** - XÓA `category_id` (services độc lập)
- ✅ **Service** - XÓA `quote_price`, `settlement_price` (không có giá)
- ✅ **Service** - Chỉ còn: `code`, `name`, `description`, `unit`, `estimated_time`, `has_warranty`, `warranty_months`, `notes`, `is_active`
- ✅ **UpdateServiceRequestData** - Thêm interface mới

#### 2. **Services - API Calls**

**File: `app/services/category.service.ts`**
- ✅ **CategoryFormData** - XÓA `type` field
- ✅ **CategoryFormData** - Thêm `code` (required)
- ✅ **CategoryFormData** - Đổi `display_order` → `sort_order`
- ✅ **getCategories()** - XÓA filter `type`, thêm filter `parent_id`

#### 3. **Admin Routes - UI Components**

**File: `app/routes/admin/services.tsx`** ✅ **HOÀN TOÀN MỚI**
- ✅ **XÓA loadCategories()** - Services không có category
- ✅ **XÓA state categories** - Không cần nữa
- ✅ **XÓA category filter** - Trong UI search/filter
- ✅ **XÓA cột Category** - Trong table columns
- ✅ **XÓA cột Quote Price & Settlement Price** - Services không có giá
- ✅ **Thêm cột Unit** - Đơn vị tính
- ✅ **Thêm cột Estimated Time** - Thời gian ước tính
- ✅ **Thêm cột Has Warranty** - Bảo hành
- ✅ **ServiceFormModal** - Form hoàn toàn mới:
  - Chỉ có: name, code, description, unit, estimated_time
  - Checkbox: has_warranty → show warranty_months input
  - notes field
  - XÓA category_id, quote_price, settlement_price

**File: `app/routes/admin/products.tsx`** ⚠️ **CẦN SỬA THÊM**
- ✅ **loadCategories()** - XÓA tham số `type`
- ⚠️ **Columns** - ĐANG hiển thị `quote_price/settlement_price` (CẦN đổi thành `cost_price/suggested_price`)
- ⚠️ **ProductFormModal** - ĐANG dùng `quote_price/settlement_price` (CẦN sửa)

---

## 🚨 VẤN ĐỀ CẦN SỬA NGAY

### File: `app/routes/admin/products.tsx`

**1. Table Columns - Hiển thị sai tên trường:**
```typescript
// ❌ SAI - đang dùng
{
    key: 'quote_price',
    label: 'Giá báo KH',
    render: (product: Product) => formatters.currency(product.quote_price || 0)
}
{
    key: 'settlement_price',
    label: 'Giá QT',
    render: (product: Product) => formatters.currency(product.settlement_price || 0)
}

// ✅ ĐÚNG - cần đổi thành
{
    key: 'cost_price',
    label: 'Giá nhập',
    render: (product: Product) => formatters.currency(product.cost_price || 0)
}
{
    key: 'suggested_price',
    label: 'Giá đề xuất',
    render: (product: Product) => formatters.currency(product.suggested_price || 0)
}
```

**2. ProductFormData Interface - Sai field names:**
```typescript
// ❌ SAI
interface ProductFormData {
    quote_price: string | number;
    settlement_price: string | number;
}

// ✅ ĐÚNG
interface ProductFormData {
    cost_price: string | number;
    suggested_price: string | number;
    sku: string;
    track_stock: boolean;
    has_warranty: boolean;
    warranty_months: number | string;
}
```

**3. ProductFormModal - Form inputs sai:**
```typescript
// ❌ SAI - labels
<Input label="Giá báo khách hàng *" name="quote_price" />
<Input label="Giá quyết toán *" name="settlement_price" />

// ✅ ĐÚNG
<Input label="Giá nhập (Cost) *" name="cost_price" />
<Input label="Giá đề xuất bán *" name="suggested_price" />
```

---

## 📂 CẤU TRÚC THƯ MỤC FRONTEND

### ✅ Đã tổ chức tốt:

```
frontend/
├── app/
│   ├── types/                    ✅ Đã cập nhật
│   │   ├── product.ts           ✅ Category & Product đúng
│   │   ├── service.ts           ✅ Service đúng
│   │   ├── order.ts             ⚠️ Cần kiểm tra
│   │   ├── invoice.ts           ⚠️ C��n kiểm tra
│   │   └── ...
│   ├── services/                 ✅ Đã cập nhật
│   │   ├── category.service.ts  ✅ XÓA type filter
│   │   ├── service.service.ts   ✅ OK
│   │   ├── product.service.ts   ✅ OK
│   │   └── ...
│   ├── routes/
│   │   └── admin/               ⚠️ Một số cần sửa
│   │       ├── services.tsx     ✅ HOÀN TOÀN MỚI
│   │       ├── products.tsx     ⚠️ CẦN SỬA columns & form
│   │       ├── categories.tsx   ⚠️ Cần kiểm tra
│   │       ├── orders.tsx       ⚠️ Cần kiểm tra
│   │       └── ...
│   └── ...
└── ...
```

---

## 🔄 CÁC FILE CẦN KIỂM TRA & SỬA TIẾP

### 1. **Categories Management**
**File: `app/routes/admin/categories.tsx`**
- ⚠️ Kiểm tra form có field `type` không → XÓA
- ⚠️ Kiểm tra filter `type` → XÓA
- ⚠️ Thêm field `code` vào form (required)
- ⚠️ Thêm filter `parent_id` để hỗ trợ phân cấp

### 2. **Orders Management**
**File: `app/routes/admin/orders.tsx`**
**File: `app/types/order.ts`**
- ⚠️ **OrderItem** - Kiểm tra `quote_unit_price/settlement_unit_price` có đúng không
  - Với **Product items**: cần map từ `cost_price/suggested_price`
  - Với **Service items**: không có giá cố định (giá tính theo quote)
- ⚠️ Form tạo order cần xử lý đúng logic giá

### 3. **Invoices Management**
**File: `app/routes/admin/invoices.tsx`**
**File: `app/types/invoice.ts`**
- ⚠️ Kiểm tra các trường `actual_cost`, `actual_profit` hiển thị đúng (admin only)
- ⚠️ Kiểm tra `partner_settlement_cost`

### 4. **Data Files**
**File: `app/data/services.ts`**
- ⚠️ Nếu có mock data về services → XÓA `category_id`, `quote_price`, `settlement_price`

---

## 🎯 LOGIC NGHIỆP VỤ MỚI

### **Services (6 dịch vụ chính)**
```
✅ KHÔNG có category (độc lập hoàn toàn)
✅ KHÔNG có giá cố định
✅ Chỉ có thông tin cơ bản: name, code, description, unit, estimated_time
✅ Có warranty info: has_warranty, warranty_months
✅ Có notes field
```

### **Products (Phụ tùng)**
```
✅ CÓ category (categories chỉ quản lý products)
✅ CÓ giá: cost_price (giá nhập), suggested_price (giá đề xuất)
✅ CÓ thông tin xe: vehicle_brand_id, vehicle_model_id, compatible_years
✅ CÓ supplier: supplier_id, supplier_code
✅ CÓ warehouse management: min_stock_level, max_stock_level, reorder_point
✅ CÓ warranty: has_warranty, warranty_months
```

### **Categories**
```
✅ KHÔNG có type (chỉ quản lý products)
✅ CÓ code field (mã danh mục)
✅ CÓ phân cấp: parent_id, children
✅ CÓ sort_order (thứ tự hiển thị)
```

---

## 📝 CHECKLIST TIẾP THEO

### Cần làm ngay:
- [ ] Sửa `products.tsx` - Đổi columns và form từ quote_price/settlement_price → cost_price/suggested_price
- [ ] Kiểm tra `categories.tsx` - Đảm bảo không có field/filter `type`
- [ ] Kiểm tra `orders.tsx` - Logic giá cho OrderItems
- [ ] Kiểm tra `invoices.tsx` - Hiển thị đúng cost/profit fields

### Nên làm:
- [ ] Kiểm tra tất cả components tái sử dụng có reference đến Service/Product
- [ ] Tìm và xóa các file duplicate/unused
- [ ] Kiểm tra mock data trong `app/data/`
- [ ] Test toàn bộ flow tạo/sửa Services và Products

### Nice to have:
- [ ] Thêm TypeScript strict mode checks
- [ ] Refactor shared form components
- [ ] Optimize re-renders
- [ ] Add loading states consistency

---

## 🎉 KẾT QUẢ ĐẠT ĐƯỢC

### ✅ Đã hoàn thành:
1. **Types đồng bộ 100%** với backend mới (Category, Service, Product)
2. **Services page** hoàn toàn mới, đúng logic (no category, no price)
3. **Category service** đã xóa type filter
4. **Products form** đã có SKU, track_stock, warranty fields

### ⚠️ Cần sửa tiếp:
1. **Products columns** - hiển thị sai tên field (quote/settlement vs cost/suggested)
2. **Products form** - input fields sai tên
3. **Categories page** - chưa kiểm tra
4. **Orders page** - logic giá cần review

---

## 💡 GHI CHÚ QUAN TRỌNG

### Logic giá mới:
```
SERVICES:
- Backend: KHÔNG có giá cố định
- Frontend: KHÔNG hiển thị/nhập giá
- Giá services tính theo từng order/quote

PRODUCTS:
- Backend: cost_price (giá nhập), suggested_price (giá đề xuất)
- Frontend: Hiển thị cả 2 giá, admin có thể edit
- Khi tạo OrderItem: lấy suggested_price làm quote_unit_price
- settlement_unit_price phụ thuộc partner/supplier
```

### Workflow tạo Order:
```
1. Chọn Services → Không có giá sẵn → Nhập giá thủ công
2. Chọn Products → Lấy suggested_price → Có thể adjust
3. Tính toán: quote_total, settlement_total, profit
4. Admin xem được profit margin
```

---

**Chuẩn bị bởi:** AI Assistant
**Ngày:** 15/10/2025
**Trạng thái:** 🔄 70% hoàn thành, cần tiếp tục sửa products.tsx và kiểm tra orders/categories

