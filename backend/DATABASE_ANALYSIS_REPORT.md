# PHÂN TÍCH DATABASE VÀ AUTHENTICATION SYSTEM

## 📊 TỔNG QUAN DATABASE

### Nghiệp vụ hệ thống quản lý Garage

Hệ thống được thiết kế cho **2 đối tượng chính**:
1. **Thắng Trường** - Garage chính (công ty mẹ)
2. **Việt Nga** - Đối tác cung cấp phụ tùng

### Các module chính:

#### 1. **User Management & Authentication** ✅
- Users (nhân viên, admin, kỹ thuật viên)
- Roles & Permissions (5 roles: admin, manager, accountant, employee, mechanic)
- Sessions (session-based auth)
- OAuth/Passport (JWT token auth)

#### 2. **Customer & Vehicle Management**
- Customers (khách hàng)
- Vehicles (xe của khách hàng)
- Vehicle Brands & Models (hãng xe và dòng xe)
- Vehicle Inspections (kiểm tra xe khi nhận/trả)

#### 3. **Service Management**
- Service Requests (yêu cầu dịch vụ từ khách hàng)
- Services (danh mục dịch vụ)
- Categories (phân loại dịch vụ/sản phẩm)

#### 4. **Order & Sales**
- Orders (đơn hàng dịch vụ/sản phẩm)
- Order Items (chi tiết đơn hàng)
- Direct Sales (bán lẻ phụ tùng tại Việt Nga)

#### 5. **Financial Management**
- Invoices (hóa đơn cho khách hàng)
- Payments (thanh toán từ khách hàng)
- Settlements (quyết toán với đối tác)
- Settlement Payments (thanh toán cho đối tác)

#### 6. **Partner & Provider**
- Providers (đối tác garage liên kết)
- Partner Vehicle Handovers (bàn giao xe cho đối tác)
- Partner Quotations (báo giá từ đối tác)

#### 7. **Warehouse & Inventory**
- Warehouses (kho - Việt Nga là kho chính)
- Warehouse Stocks (tồn kho)
- Stock Transfers (chuyển kho)
- Stock Movements (xuất nhập kho)
- Products (sản phẩm/phụ tùng)

#### 8. **Warranty & Support**
- Warranties (bảo hành)
- Notifications (thông báo)

---

## ✅ ĐÁNH GIÁ DATABASE CHO SESSION + JWT

### 1. Bảng Users ✅
```
- id, name, email, password ✅
- phone, avatar, address, gender ✅
- employee_code, position, department ✅
- salary, hire_date, is_active ✅
- remember_token ✅ (cho remember me)
```
**KẾT LUẬN**: Hoàn hảo cho authentication

### 2. Bảng Sessions ✅
```
- id, user_id, ip_address
- user_agent, payload, last_activity
```
**KẾT LUẬN**: Đầy đủ cho session-based auth

### 3. Bảng Password Reset ✅
```
- email, token, created_at
```
**KẾT LUẬN**: Hỗ trợ reset password

### 4. Bảng OAuth (Passport) ✅
```
- oauth_auth_codes ✅
- oauth_access_tokens ✅
- oauth_refresh_tokens ✅
- oauth_clients ✅
- oauth_personal_access_clients ✅
- oauth_device_codes ✅
```
**KẾT LUẬN**: Đầy đủ tất cả bảng Passport cần thiết

### 5. Bảng Roles & Permissions ✅
```
- roles (5 roles đã định nghĩa rõ)
- user_roles (1 user - 1 role)
- permissions dạng JSON trong roles
```
**KẾT LUẬN**: Phân quyền chi tiết và rõ ràng

---

## 🔐 AUTHENTICATION SYSTEM ĐÃ THIẾT LẬP

### Files đã tạo:

1. **Config Files**
   - `config/auth.php` - Cấu hình guards (web + api)
   - `config/passport.php` - Cấu hình token expiration

2. **Controllers**
   - `app/Http/Controllers/Api/AuthController.php`
     - register() - Đăng ký
     - login() - Đăng nhập API (JWT)
     - loginWeb() - Đăng nhập Web (Session)
     - logout() - Đăng xuất
     - me() - Thông tin user
     - refresh() - Refresh token
     - changePassword() - Đổi mật khẩu

3. **Middleware**
   - `app/Http/Middleware/AuthenticateWithSessionOrToken.php`
     - Cho phép auth bằng cả Session hoặc JWT

4. **Routes**
   - `routes/api.php` - API endpoints cho auth

5. **Seeders**
   - `database/seeders/RoleSeeder.php` - Tạo 5 roles mặc định
   - `database/seeders/DatabaseSeeder.php` - Tạo admin & manager

6. **Documentation**
   - `AUTH_DOCUMENTATION.md` - Hướng dẫn chi tiết

---

## 🎯 CÁC TÍNH NĂNG

### ✅ Session-based Authentication (Web)
- Dùng cho website/dashboard
- Cookie-based
- Session timeout: 120 phút
- Remember me support

### ✅ JWT Token Authentication (API)
- Dùng cho Mobile App / SPA
- Bearer token
- Access token: 15 ngày
- Refresh token: 30 ngày
- Personal access token: 365 ngày

### ✅ Dual Authentication
- Middleware hỗ trợ cả 2 loại auth
- Tự động chọn phương thức phù hợp

### ✅ Role-based Authorization
- 5 roles với permissions chi tiết
- Helper methods: isAdmin(), isManager(), etc.
- Dễ dàng mở rộng

### ✅ Security Features
- Password hashing (bcrypt)
- CSRF protection (session)
- Token revocation
- Session regeneration
- Active user check

---

## 📝 LƯU Ý QUAN TRỌNG

### 1. Không có Foreign Keys trong Migration ✅
Theo yêu cầu của bạn, tất cả quan hệ được định nghĩa trong **Model**, không có foreign key constraints trong database. Điều này:
- ✅ Linh hoạt hơn khi thay đổi dữ liệu
- ✅ Không bị lỗi cascade khi xóa
- ⚠️ Cần cẩn thận khi maintain data integrity

### 2. Cấu trúc phân quyền
- Mỗi user chỉ có **1 role duy nhất**
- Permissions được lưu dạng JSON trong bảng roles
- Dễ dàng custom permissions cho từng role

### 3. Database Type: SQLite
- Phù hợp cho development
- Production nên chuyển sang MySQL/PostgreSQL

---

## 🚀 CÁCH SỬ DỤNG

### Bước 1: Cài đặt Passport
```bash
cd backend
php artisan passport:keys
php artisan passport:client --personal
```

### Bước 2: Chạy Migration & Seed
```bash
php artisan migrate:fresh --seed
```

### Bước 3: Test Authentication
**Đăng nhập:**
```bash
POST /api/auth/login
{
  "email": "admin@garage.com",
  "password": "password123"
}
```

**Sử dụng Token:**
```bash
GET /api/auth/me
Header: Authorization: Bearer {token}
```

---

## 📊 KẾT LUẬN

### ✅ Database đã ĐẦY ĐỦ cho yêu cầu:
1. ✅ Session authentication (bảng sessions)
2. ✅ JWT token authentication (bảng oauth_*)
3. ✅ User management (bảng users)
4. ✅ Role & permissions (bảng roles, user_roles)
5. ✅ Password reset (bảng password_reset_tokens)

### ✅ Authentication System đã SẴN SÀNG:
1. ✅ API endpoints đầy đủ
2. ✅ Middleware bảo vệ routes
3. ✅ Phân quyền chi tiết
4. ✅ Security best practices
5. ✅ Documentation đầy đủ

### 🎯 Nghiệp vụ đã được thiết kế CỰC KỲ CHI TIẾT:
- Quản lý garage chuyên nghiệp
- Hỗ trợ cả bán lẻ (Việt Nga) và sửa chữa (Thắng Trường)
- Quản lý đối tác và quyết toán
- Kiểm soát kho và chuyển kho
- Theo dõi bảo hành
- Báo cáo tài chính chi tiết

**Database của bạn đã hoàn toàn sẵn sàng để sử dụng với Session + JWT Token!** 🎉

