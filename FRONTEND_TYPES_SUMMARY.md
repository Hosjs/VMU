# BÁO CÁO TYPE DEFINITIONS FRONTEND - HỆ THỐNG QUẢN LÝ GARAGE

**Ngày cập nhật:** 6 tháng 10, 2025

## ✅ CÁC FILE TYPES ĐÃ TẠO/CẬP NHẬT

### 1. **Files Types Mới Tạo**
- ✅ `provider.ts` - Quản lý Gara liên kết & Báo giá đối tác
- ✅ `warehouse.ts` - Quản lý Kho & Chuyển kho  
- ✅ `vehicle.ts` - Quản lý Xe, Kiểm định & Bàn giao xe
- ✅ `settlement.ts` - Quản lý Quyết toán & Thanh toán đối tác
- ✅ `direct-sale.ts` - Bán hàng trực tiếp từ Việt Nga
- ✅ `warranty.ts` - Quản lý Bảo hành
- ✅ `notification.ts` - Thông báo hệ thống

### 2. **Files Types Đã Cập Nhật**
- ✅ `service.ts` - Cập nhật Service & ServiceRequest khớp với DB
- ✅ `order.ts` - Thêm partner_provider, settlement_total, handover dates
- ✅ `invoice.ts` - Thêm issuer, admin_only_access, actual_cost/profit
- ✅ `product.ts` - Thêm quote_price, settlement_price, warehouse tracking
- ✅ `customer.ts` - Thêm insurance, gender, birth_date
- ✅ `index.ts` - Export tất cả types

### 3. **Files Types Giữ Nguyên**
- ✅ `auth.ts` - Đã đúng cấu trúc
- ✅ `common.ts` - Đã đầy đủ

---

## 📊 THỐNG KÊ TYPES

### **Tổng số interfaces đã tạo:** ~80+ interfaces

### **Phân loại theo module:**

#### 🔐 **Authentication & Authorization** (auth.ts)
- `AuthUser`, `Role`, `LoginCredentials`, `RegisterData`, `AuthResponse`

#### 👥 **Customer Management** (customer.ts)
- `Customer`, `CreateCustomerData`, `UpdateCustomerData`

#### 🚗 **Vehicle Management** (vehicle.ts)
- `VehicleBrand`, `VehicleModel`, `Vehicle`
- `VehicleInspection`, `PartnerVehicleHandover`
- `CreateVehicleData`, `CreateVehicleHandoverData`

#### 🔧 **Service Management** (service.ts)
- `Service`, `ServiceRequest`, `ServiceRequestService`
- `CreateServiceRequestData`, `UpdateServiceRequestData`

#### 📦 **Product Management** (product.ts)
- `Category`, `Product`
- `CreateProductData`, `UpdateProductData`

#### 📋 **Order Management** (order.ts)
- `Order`, `OrderItem`
- `CreateOrderData`, `UpdateOrderData`

#### 💰 **Financial Management**

**Invoices** (invoice.ts)
- `Invoice`, `Payment`
- `CreateInvoiceData`, `CreatePaymentData`

**Settlements** (settlement.ts)
- `Settlement`, `SettlementPayment`
- `CreateSettlementData`, `CreateSettlementPaymentData`

**Direct Sales** (direct-sale.ts)
- `DirectSale`, `DirectSaleItem`
- `CreateDirectSaleData`

#### 🤝 **Partner Management** (provider.ts)
- `Provider`, `QuotationRequest`, `PartnerQuotation`
- `CreateProviderData`, `UpdateProviderData`
- `CreatePartnerQuotationData`

#### 🏪 **Warehouse & Inventory** (warehouse.ts)
- `Warehouse`, `WarehouseStock`
- `StockTransfer`, `StockTransferItem`, `StockMovement`
- `CreateWarehouseData`, `CreateStockTransferData`

#### 🛡️ **Warranty** (warranty.ts)
- `Warranty`, `CreateWarrantyData`

#### 🔔 **Notifications** (notification.ts)
- `Notification`, `CreateNotificationData`

#### 🛠️ **Common Types** (common.ts)
- `PaginationMeta`, `PaginatedResponse`, `ApiError`, `SelectOption`, `TableQueryParams`

---

## 🔒 THÔNG TIN NHẠY CẢM - PHÂN QUYỀN

### **Các trường CHỈ ADMIN XEM (Cần kiểm soát trong UI):**

#### **Services & Products**
- `settlement_price` - Giá quyết toán với đối tác

#### **Orders**
- `settlement_total` - Tổng thanh toán cho đối tác
- `settlement_unit_price`, `settlement_total_price` (trong OrderItem)

#### **Invoices**
- `actual_cost` - Chi phí thực tế
- `actual_profit` - Lợi nhuận thực tế
- `partner_settlement_cost` - Chi phí quyết toán với gara

#### **Partner Quotations**
- `service_cost`, `parts_cost`, `labor_cost`, `other_costs`
- `total_cost` - Tổng chi phí (GIÁ QUYẾT TOÁN VỚI THẮNG TRƯỜNG)
- `admin_only_pricing` = true

#### **Direct Sales**
- `total_cost`, `gross_profit`, `profit_margin` (DirectSale)
- `unit_cost`, `total_cost`, `line_profit`, `profit_margin` (DirectSaleItem)
- `visibility_level`, `is_confidential`

#### **Settlements**
- Toàn bộ thông tin settlement (CHỈ ADMIN)

---

## 🎯 ĐIỂM QUAN TRỌNG CẦN LƯU Ý

### **1. Enum Values - Cần khớp chính xác với Backend:**

```typescript
// Order Status
'draft' | 'quoted' | 'confirmed' | 'in_progress' | 'completed' | 'delivered' | 'paid' | 'cancelled'

// Payment Status  
'pending' | 'partial' | 'paid' | 'refunded'

// Service Request Status
'pending' | 'contacted' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'

// Priority
'low' | 'normal' | 'high' | 'urgent'

// Provider Status
'active' | 'inactive' | 'suspended' | 'blacklisted'

// Warehouse Type
'main' | 'partner'

// Invoice Issuer
'thang_truong' | 'viet_nga'
```

### **2. Format Lưu Trữ Đặc Biệt:**

```typescript
// File attachments - ngăn cách bởi |
attachment_urls: "url1|url2|url3"

// Image galleries - ngăn cách bởi |  
gallery_images: "url1|url2|url3"

// Lists - ngăn cách bởi |
included_items: "item1|item2|item3"

// Key-value pairs - ngăn cách bởi |
preferences: "key1=value1|key2=value2"
```

### **3. Relationships Quan Trọng:**

```typescript
// Service Request Flow
ServiceRequest → ServiceRequestService → Service
             ↓
           Order → OrderItem → Service/Product
             ↓
         Invoice → Payment
             ↓
       Settlement → SettlementPayment

// Partner Workflow
Provider → PartnerQuotation → Order
        ↓
  PartnerVehicleHandover (Bàn giao xe)
        ↓
    Settlement (Quyết toán)
```

### **4. Warehouse Management:**

```typescript
// Stock Flow
Warehouse → WarehouseStock (Tồn kho)
         ↓
   StockTransfer → StockTransferItem (Chuyển kho)
         ↓
   StockMovement (Lịch sử xuất/nhập)
```

---

## ⚠️ CÁC VẤN ĐỀ CẦN XỬ LÝ TIẾP

### **1. Cần tạo API Services tương ứng:**
- [ ] `provider.service.ts`
- [ ] `warehouse.service.ts`
- [ ] `vehicle.service.ts`
- [ ] `settlement.service.ts`
- [ ] `direct-sale.service.ts`
- [ ] `warranty.service.ts`
- [ ] `notification.service.ts`

### **2. Cần cập nhật các Service hiện có:**
- [ ] Cập nhật `service.service.ts` cho ServiceRequest mới
- [ ] Cập nhật `order.service.ts` cho Order fields mới
- [ ] Cập nhật `invoice.service.ts` cho Invoice fields mới
- [ ] Cập nhật `product.service.ts` cho Product fields mới

### **3. Cần tạo UI Components:**
- [ ] Provider Management (CRUD)
- [ ] Warehouse Management
- [ ] Stock Transfer
- [ ] Vehicle Handover
- [ ] Settlement Management
- [ ] Direct Sales
- [ ] Warranty Tracking

### **4. Cần implement Access Control:**
- [ ] Kiểm tra role trước khi hiển thị giá settlement
- [ ] Ẩn thông tin nhạy cảm với non-admin users
- [ ] Filter data theo visibility_level
- [ ] Kiểm tra admin_only_access flag

### **5. Validation Rules cần thêm:**
- [ ] Phone number format
- [ ] Email format
- [ ] License plate format
- [ ] Tax code format
- [ ] Date validations
- [ ] Price validations (không âm)

---

## 📝 GHI CHÚ BỔ SUNG

### **Nghiệp vụ đặc biệt:**

1. **Thắng Trường vs Việt Nga:**
   - Thắng Trường: Nhận yêu cầu, báo giá khách hàng
   - Việt Nga: Kho phụ tùng, bán hàng trực tiếp
   - Cần phân biệt rõ trong UI

2. **Quy trình bàn giao xe:**
   - Nhân viên Thắng Trường giao xe
   - Kỹ thuật viên gara liên kết nhận xe
   - Ghi nhận tình trạng, ký xác nhận
   - Chụp ảnh minh chứng

3. **Quyết toán với đối tác:**
   - TOÀN BỘ thông tin CHỈ ADMIN xem
   - Bao gồm: giá vốn, lợi nhuận, chi phí thực tế
   - Cần kiểm tra role nghiêm ngặt

4. **Chuyển kho miễn thuế:**
   - Chuyển kho nội bộ: `is_tax_exempt = true`
   - Cần có `tax_exemption_code`
   - Ghi chú lý do miễn thuế

---

## ✨ KẾT LUẬN

**Đã hoàn thành:**
- ✅ Tạo đầy đủ type definitions cho toàn bộ hệ thống
- ✅ Cập nhật các types cũ khớp với database mới
- ✅ Document rõ ràng phân quyền và thông tin nhạy cảm
- ✅ Không có lỗi TypeScript nghiêm trọng

**Cần làm tiếp:**
- ⏳ Tạo API Services
- ⏳ Tạo UI Components
- ⏳ Implement Access Control
- ⏳ Add Validation Rules
- ⏳ Testing & Integration

**Trạng thái hiện tại:** ✅ **READY FOR DEVELOPMENT**

