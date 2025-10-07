# 🎯 HƯỚNG DẪN SEEDERS - 6 DỊCH VỤ CHÍNH

## 📋 TỔNG QUAN

Đã tạo đầy đủ seeders cho hệ thống quản lý garage với **6 dịch vụ chính**:

1. ✅ **Hỗ trợ đăng kiểm** - Nhận xe, xếp hàng, đăng kiểm, giao trả xe
2. 🛡️ **Bảo hiểm xe** - TNDS + Bảo hiểm vật chất
3. 🎨 **Sơn sửa bảo hiểm** - Sơn, sửa chữa qua bảo hiểm
4. 📦 **Phụ tùng ô tô** - Bán phụ tùng, linh kiện chính hãng
5. 🔧 **Bảo dưỡng định kỳ** - 5K, 10K, 20K, 40K km
6. 🔨 **Sửa chữa tổng hợp** - Động cơ, điện, gầm, sơn gò

---

## 📁 CÁC FILE SEEDER ĐÃ TẠO

### 1. **RoleSeeder.php** ✅
Tạo 5 roles với permissions chi tiết:
- **Admin** - Toàn quyền
- **Manager** - Quản lý hoạt động
- **Accountant** - Quản lý tài chính
- **Employee** - Nhân viên bán hàng
- **Mechanic** - Thợ máy, kỹ thuật viên

### 2. **CategorySeeder.php** ✅
Tạo 6 categories chính + 22 categories con:
- Hỗ trợ đăng kiểm (3 loại xe: con, tải, khách)
- Bảo hiểm xe (TNDS, Vật chất)
- Sơn sửa bảo hiểm (3 loại)
- Phụ tùng ô tô (4 nhóm: động cơ, điện, gầm, dầu nhớt)
- Bảo dưỡng định kỳ (4 cấp)
- Sửa chữa tổng hợp (4 loại)

### 3. **ServiceSeeder.php** ✅
Tạo 30+ dịch vụ bao gồm:

#### Dịch vụ đăng kiểm:
- Đăng kiểm xe con: 500.000đ
- Đăng kiểm xe tải: 800.000đ
- Đăng kiểm xe khách: 900.000đ

#### Bảo hiểm:
- TNDS xe con: 650.000đ/năm
- TNDS xe tải: 1.200.000đ/năm
- Vật chất mức 1: 2.500.000đ/năm
- Vật chất mức 2: 4.500.000đ/năm
- Vật chất mức 3: 7.000.000đ/năm

#### Sơn sửa bảo hiểm:
- Sơn toàn bộ xe: 25.000.000đ
- Sơn cánh xe: 3.500.000đ
- Sơn nắp capo/cốp: 4.000.000đ
- Sửa va chạm nhẹ: 8.000.000đ
- Sửa va chạm nặng: 35.000.000đ

#### Bảo dưỡng:
- 5.000km: 1.200.000đ
- 10.000km: 2.500.000đ
- 20.000km: 4.500.000đ
- 40.000km: 7.500.000đ

#### Sửa chữa:
- Đại tu động cơ: 25.000.000đ
- Sửa hộp số tự động: 15.000.000đ
- Sửa hệ thống điện: 3.000.000đ
- Thay ắc quy: 2.500.000đ
- Thay phanh: 3.500.000đ
- Thay giảm xóc: 8.000.000đ
- Sơn gò ngoài bảo hiểm: 2-5 triệu

### 4. **ProductSeeder.php** ✅
Tạo 25+ sản phẩm phụ tùng:

#### Phụ tùng động cơ:
- Lọc dầu Toyota/Honda/Hyundai: 150-250k
- Bugi NGK: 400k
- Dây curoa Gates: 1.200k

#### Phụ tùng điện:
- Ắc quy GS 55AH: 1.800k
- Ắc quy Varta 70AH: 3.500k
- Bóng đèn LED Philips: 850k
- Cầu chì: 150k

#### Phụ tùng gầm:
- Má phanh Toyota: 1.200k
- Phanh đĩa Brembo: 2.500k
- Lốp Michelin 205/55R16: 2.800k
- Lốp Bridgestone 215/60R16: 2.500k
- Giảm xóc KYB: 3.500k

#### Dầu nhớt:
- Shell Helix Ultra 5W-40: 850k
- Castrol Magnatec 10W-40: 650k
- Mobil 1 0W-40: 1.200k
- Dầu hộp số ATF: 180k
- Dầu phanh DOT 4: 120k

### 5. **VehicleBrandSeeder.php** ✅
Tạo 7 hãng xe + 35+ dòng xe:
- Toyota (5 dòng): Vios, Camry, Fortuner, Innova, Altis
- Honda (5 dòng): City, Civic, CR-V, Accord, HR-V
- Hyundai (6 dòng): i10, Grand i10, Accent, Elantra, Santa Fe, Tucson
- Mazda (5 dòng): Mazda 2, 3, 6, CX-5, CX-8
- Ford (4 dòng): Ranger, Everest, EcoSport, Territory
- Kia (5 dòng): Morning, Soluto, Cerato, Seltos, Sorento
- VinFast (5 dòng): Fadil, Lux A2.0, Lux SA2.0, VF e34, VF 8

### 6. **WarehouseSeeder.php** ✅
Tạo 4 kho/garage:
- **VN** - Kho Việt Nga (Main warehouse)
- **TT** - Garage Thắng Trường (Partner)
- **GT1** - Garage Liên Kết 1 (Thủ Đức)
- **GT2** - Garage Liên Kết 2 (Quận 7)

### 7. **ProviderSeeder.php** ✅
Tạo 6 đối tác:
- 4 Garage liên kết (Thắng Trường, Minh Tuấn, Hoàng Long, Thành Đạt)
- 2 Công ty bảo hiểm (Bảo Việt, PVI)

### 8. **DatabaseSeeder.php** ✅
Seed tất cả dữ liệu + tạo 4 users mặc định

---

## 🚀 CÁCH CHẠY SEEDERS

### Bước 1: Di chuyển vào thư mục backend
```bash
cd C:\xampp\htdocs\gara\backend
```

### Bước 2: Chạy migration (nếu chưa chạy)
```bash
php artisan migrate
```

### Bước 3: Chạy seeders
```bash
# Cách 1: Reset database và seed từ đầu (KHUYẾN NGHỊ)
php artisan migrate:fresh --seed

# Cách 2: Chỉ chạy seeders (không reset database)
php artisan db:seed

# Cách 3: Chạy từng seeder cụ thể
php artisan db:seed --class=CategorySeeder
php artisan db:seed --class=ServiceSeeder
php artisan db:seed --class=ProductSeeder
```

---

## 📊 DỮ LIỆU SAU KHI SEED

### Tài khoản mặc định:
```
Email: admin@garage.com      | Password: password123 | Role: Admin
Email: manager@garage.com    | Password: password123 | Role: Manager
Email: accountant@garage.com | Password: password123 | Role: Accountant
Email: mechanic@garage.com   | Password: password123 | Role: Mechanic
```

### Thống kê dữ liệu:
- ✅ 5 Roles với permissions chi tiết
- ✅ 4 Users mặc định
- ✅ 7 Hãng xe + 35+ Dòng xe
- ✅ 4 Kho/Garage
- ✅ 6 Đối tác (4 garage + 2 bảo hiểm)
- ✅ 28 Categories (6 chính + 22 con)
- ✅ 30+ Dịch vụ
- ✅ 25+ Sản phẩm phụ tùng

---

## 💡 LƯU Ý QUAN TRỌNG

### 1. Giá dịch vụ
Mỗi dịch vụ có 2 loại giá:
- **quote_price**: Giá báo cho khách hàng
- **settlement_price**: Giá quyết toán với đối tác (thấp hơn)
- **Lợi nhuận** = quote_price - settlement_price

### 2. Bảo hành
- Đăng kiểm: 12 tháng
- Sơn sửa: 6-24 tháng
- Bảo dưỡng: 3-12 tháng
- Phụ tùng: 6-60 tháng (tùy loại)

### 3. Thời gian ước tính (estimated_time)
Tính bằng **phút**:
- Đăng kiểm: 4-6 giờ (240-360 phút)
- Bảo dưỡng: 2-6 giờ
- Sơn: 1-10 ngày
- Đại tu động cơ: 5 ngày

### 4. Warehouse
- **Việt Nga (VN)**: Kho chính, chuyên phụ tùng
- **Thắng Trường (TT)**: Garage chính, sửa chữa
- **GT1, GT2**: Garage liên kết

---

## 🎯 KIỂM TRA KẾT QUẢ

### Kiểm tra database:
```bash
# Đếm số lượng records
php artisan tinker

>>> \App\Models\Category::count();
>>> \App\Models\Service::count();
>>> \App\Models\Product::count();
>>> \App\Models\VehicleBrand::count();
>>> \App\Models\Warehouse::count();
>>> \App\Models\Provider::count();
```

### Test API:
```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@garage.com","password":"password123"}'

# Lấy danh sách services (cần token)
curl -X GET http://localhost:8000/api/services \
  -H "Authorization: Bearer {token}"
```

---

## 🔧 TÙY CHỈNH

### Thêm dịch vụ mới:
Mở file `ServiceSeeder.php` và thêm vào array `$services`:
```php
[
    'name' => 'Tên dịch vụ',
    'code' => 'CODE-UNIQUE',
    'description' => 'Mô tả chi tiết',
    'category_id' => $category->id,
    'quote_price' => 1000000,
    'settlement_price' => 800000,
    'unit' => 'lần',
    'estimated_time' => 120,
    'has_warranty' => true,
    'warranty_months' => 6,
    'is_active' => true,
]
```

### Thêm sản phẩm mới:
Mở file `ProductSeeder.php` và thêm vào array `$products`:
```php
[
    'name' => 'Tên sản phẩm',
    'code' => 'PT-CODE',
    'sku' => 'SKU-001',
    'description' => 'Mô tả',
    'category_id' => $category->id,
    'quote_price' => 500000,
    'settlement_price' => 400000,
    'unit' => 'cái',
    'track_stock' => true,
    'has_warranty' => true,
    'warranty_months' => 12,
    'supplier_name' => 'Nhà cung cấp',
    'is_active' => true,
]
```

---

## 📞 HỖ TRỢ

Nếu gặp lỗi khi seed:
1. Kiểm tra database đã tồn tại chưa
2. Chạy `php artisan migrate:fresh` để reset
3. Kiểm tra các relationship trong models
4. Xem log tại `storage/logs/laravel.log`

---

## ✅ HOÀN TẤT

Hệ thống seeders đã sẵn sàng cho 6 dịch vụ chính của garage! 🎉

Chạy `php artisan migrate:fresh --seed` để bắt đầu!

