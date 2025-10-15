# BÁO CÁO ĐIỀU CHỈNH DATABASE - MIGRATIONS OPTIMIZATION

## Ngày: 15/10/2025

---

## 📋 TỔNG QUAN ĐIỀU CHỈNH

Đã thực hiện điều chỉnh toàn bộ migrations theo đúng nghiệp vụ của hệ thống quản lý gara:

### ✅ Các thay đổi chính:

1. **Gộp migrations sửa bảng vào file gốc**
   - Đã gộp `add_custom_permissions_to_users_table` vào `create_users_table`
   - Thêm trường `custom_permissions` ngay từ đầu

2. **Loại bỏ giá cố định khỏi Services và Products**
   - Services và Products không còn lưu `quote_price` và `settlement_price` cố định
   - Giá sẽ do Admin quyết định khi báo giá cho từng yêu cầu cụ thể

3. **Cập nhật cấu trúc giá phù hợp nghiệp vụ**

---

## 🔧 CHI TIẾT CÁC THAY ĐỔI

### 1. **BẢNG USERS** (`0001_01_01_000000_create_users_table.php`)

**Đã thêm:**
```php
$table->text('custom_permissions')->nullable();
// Quyền tùy chỉnh override role: users:view,create|orders:view
```

**Lý do:** Gộp migration sửa bảng vào file gốc, tránh tạo nhiều file migration cho cùng 1 bảng.

---

### 2. **BẢNG SERVICES** (`2025_10_03_043440_create_services_table.php`)

**Đã XÓA:**
```php
❌ $table->decimal('quote_price', 15, 2)->default(0); // Giá báo cho khách
❌ $table->decimal('settlement_price', 15, 2)->default(0); // Giá thanh toán cho đối tác
```

**Lý do:** 
- Services là 6 dịch vụ trung tâm của gara
- Giá dịch vụ **KHÔNG cố định**, phụ thuộc vào:
  - Yêu cầu cụ thể của khách hàng
  - Báo giá từ gara liên kết
  - Quyết định của Admin khi báo giá
- Giá sẽ được lưu trong bảng `partner_quote_items` và `order_items`

**Giữ lại:**
- `estimated_time`: Thời gian ước tính (phút)
- `has_warranty`: Có bảo hành hay không
- `warranty_months`: Số tháng bảo hành

---

### 3. **BẢNG PRODUCTS** (Phụ tùng) (`2025_10_03_043448_create_products_table.php`)

**Đã THAY ĐỔI từ:**
```php
❌ $table->decimal('quote_price', 15, 2)->default(0); 
❌ $table->decimal('settlement_price', 15, 2)->default(0);
```

**Thành:**
```php
✅ $table->decimal('cost_price', 15, 2)->default(0); // Giá nhập gần nhất
✅ $table->decimal('suggested_price', 15, 2)->nullable(); // Giá đề xuất bán (tham khảo)
✅ $table->unsignedBigInteger('supplier_id')->nullable(); // Nhà cung cấp chính
```

**Lý do:**
- Phụ tùng có **giá nhập hàng từ nhà cung cấp** (cost_price)
- Giá sẽ cập nhật mỗi lần nhập hàng vào kho
- `suggested_price` chỉ là giá tham khảo, giá thực tế do Admin quyết định khi bán
- Gara liên kết **CHỈ cung cấp dịch vụ**, không bán phụ tùng (trừ trường hợp đặc biệt)

**Đã thêm:**
- `vehicle_brand_id`: Hãng xe tương thích
- `vehicle_model_id`: Dòng xe tương thích
- `compatible_years`: Năm xe tương thích
- `is_universal`: Phụ tùng dùng chung cho nhiều xe

---

### 4. **BẢNG PROVIDERS** (Đối tác) (`2025_10_03_054314_create_providers_table.php`)

**Đã THÊM:**
```php
✅ $table->enum('provider_type', ['supplier', 'garage', 'both'])->default('supplier');
// supplier: Nhà cung cấp phụ tùng
// garage: Gara liên kết (chỉ cung cấp dịch vụ)
// both: Cả hai (hiếm)
```

**Lý do:** Phân biệt rõ ràng giữa:
- **Nhà cung cấp phụ tùng** (supplier): Cung cấp phụ tùng, có giá nhập hàng
- **Gara liên kết** (garage): Cung cấp dịch vụ sửa chữa, có rating và thời gian hoàn thành
- **Cả hai** (both): Trường hợp đặc biệt

---

### 5. **BẢNG PARTNER_QUOTE_ITEMS** (`2025_10_03_053810_create_partner_quote_items_table.php`)

**Đã THÊM:**
```php
✅ $table->boolean('provided_by_partner')->default(false); 
// Phụ tùng do gara cung cấp (trường hợp đặc biệt)
```

**Lý do:** 
- Thông thường gara liên kết **CHỈ cung cấp dịch vụ**
- Phụ tùng sẽ lấy từ kho Việt Nga hoặc Thắng Trường
- `provided_by_partner = true`: Đánh dấu trường hợp ngoại lệ gara liên kết cung cấp phụ tùng

---

### 6. **BẢNG MỚI: VEHICLE_SERVICE_HISTORY** (`2025_10_03_043700_create_vehicle_service_history_table.php`)

**Mục đích:** Lưu lịch sử dịch vụ và phụ tùng đã sử dụng cho từng xe

**Thông tin lưu trữ:**
- Tất cả dịch vụ và phụ tùng xe đã sử dụng
- **Giá tại thời điểm thực hiện** (quote_price và settlement_price)
- Số km tại thời điểm làm dịch vụ
- Thông tin bảo hành và bảo dưỡng định kỳ
- Theo dõi gara đối tác và kỹ thuật viên thực hiện
- Đánh giá chất lượng từ khách hàng

**Lợi ích:**
- Theo dõi lịch sử bảo dưỡng xe
- Nhắc nhở bảo dưỡng định kỳ
- Theo dõi bảo hành phụ tùng
- Phân tích giá biến động theo thời gian
- Đánh giá chất lượng dịch vụ từng gara

---

### 7. **BẢNG MỚI: PARTNER_QUOTES** (`2025_10_03_053800_create_partner_quotes_table.php`)

**Mục đích:** Quản lý báo giá từ gara liên kết

**Quy trình nghiệp vụ ĐÚNG:**
1. Khách hàng gửi yêu cầu dịch vụ
2. Admin liên lạc với gara liên kết
3. **Gara liên kết báo giá** (partner_quote)
4. **Admin báo giá cho khách hàng với giá chênh lệch**
5. Khách hàng chấp nhận → Tạo order

**Thông tin lưu:**
- Báo giá từ gara đối tác
- Giá báo cho khách hàng (do Admin quyết định)
- Chênh lệch lợi nhuận
- Trạng thái: pending, quoted, customer_quoted, accepted, rejected

---

## 📊 QUY TRÌNH GIÁ CẢ TRONG HỆ THỐNG

### A. **DỊCH VỤ (Services)**

```
┌─────────────────────────────────────────────────────────────┐
│ SERVICES TABLE                                              │
│ - Không lưu giá cố định                                     │
│ - Chỉ lưu thông tin mô tả, thời gian ước tính              │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ PARTNER_QUOTES TABLE                                        │
│ - Gara liên kết báo giá dịch vụ                           │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ PARTNER_QUOTE_ITEMS TABLE                                   │
│ - partner_unit_price: Giá từ gara liên kết                │
│ - customer_unit_price: Admin quyết định giá báo khách     │
│ - profit_amount: Chênh lệch lợi nhuận                     │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ ORDER_ITEMS TABLE                                           │
│ - quote_unit_price: Giá báo khách (từ partner_quote)      │
│ - settlement_unit_price: Giá trả gara liên kết            │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ VEHICLE_SERVICE_HISTORY TABLE                              │
│ - Lưu snapshot giá tại thời điểm thực hiện                │
│ - Theo dõi lịch sử giá biến động                          │
└─────────────────────────────────────────────────────────────┘
```

### B. **PHỤ TÙNG (Products)**

```
┌─────────────────────────────────────────────────────────────┐
│ PROVIDERS TABLE (type='supplier')                          │
│ - Nhà cung cấp phụ tùng                                    │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ STOCK_MOVEMENTS TABLE (type='in')                          │
│ - unit_cost: Giá nhập hàng từ nhà cung cấp               │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ PRODUCTS TABLE                                              │
│ - cost_price: Giá nhập gần nhất (cập nhật khi nhập kho)  │
│ - suggested_price: Giá đề xuất (tham khảo)               │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ ORDER_ITEMS TABLE                                           │
│ - Admin quyết định giá bán thực tế                        │
│ - quote_unit_price: Giá báo khách                         │
│ - settlement_unit_price: Giá vốn                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 KẾT LUẬN

### ✅ Đã hoàn thành:

1. ✅ Gộp tất cả migrations sửa bảng vào file gốc
2. ✅ Xóa giá cố định khỏi Services (giá do Admin quyết định khi báo giá)
3. ✅ Cập nhật Products với giá nhập hàng từ nhà cung cấp
4. ✅ Phân biệt rõ Providers: supplier vs garage
5. ✅ Tạo bảng vehicle_service_history để theo dõi lịch sử
6. ✅ Tạo bảng partner_quotes để quản lý báo giá từ gara liên kết
7. ✅ Migrate thành công 41 bảng
8. ✅ Cài đặt Passport thành công

### 📌 Lưu ý quan trọng:

- **Services**: Giá không cố định, do Admin quyết định khi báo giá
- **Products**: Giá nhập từ nhà cung cấp, giá bán do Admin quyết định
- **Gara liên kết**: CHỈ cung cấp dịch vụ (trừ trường hợp đặc biệt)
- **Giá biến động**: Được lưu trong history để theo dõi

### 📁 Tổng số migrations: 41 bảng

Tất cả đã được tối ưu hóa theo đúng nghiệp vụ thực tế của hệ thống quản lý gara!

