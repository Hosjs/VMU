# Authentication System - Hướng dẫn sử dụng

## Tổng quan

Hệ thống authentication đã được cấu hình để hỗ trợ **2 phương thức xác thực**:
1. **Session-based Authentication** (cho Web) - Sử dụng Laravel Session
2. **JWT Token Authentication** (cho API) - Sử dụng Laravel Passport

## Database Schema

### Các bảng Authentication đã có:

✅ **users** - Thông tin người dùng
✅ **sessions** - Quản lý session cho web auth
✅ **password_reset_tokens** - Reset mật khẩu
✅ **roles** - Các vai trò (admin, manager, accountant, employee, mechanic)
✅ **user_roles** - Liên kết user với role (mỗi user chỉ có 1 role)
✅ **oauth_auth_codes** - OAuth authorization codes
✅ **oauth_access_tokens** - JWT access tokens
✅ **oauth_refresh_tokens** - Refresh tokens
✅ **oauth_clients** - OAuth clients
✅ **oauth_personal_access_clients** - Personal access clients
✅ **oauth_device_codes** - Device codes

## Cài đặt và cấu hình

### 1. Cài đặt Passport Keys

```bash
# Chạy trong thư mục backend
php artisan passport:keys
php artisan passport:client --personal
```

### 2. Chạy Migration và Seeder

```bash
# Reset database và seed
php artisan migrate:fresh --seed

# Hoặc chỉ seed nếu đã migrate
php artisan db:seed
```

Sau khi seed, bạn sẽ có các tài khoản mặc định:
- **Admin**: admin@garage.com / password123
- **Manager**: manager@garage.com / password123

### 3. Cấu hình .env

Thêm vào file `.env`:

```env
# Session Configuration
SESSION_DRIVER=database
SESSION_LIFETIME=120

# Passport Configuration
PASSPORT_TOKEN_EXPIRATION=15
PASSPORT_REFRESH_TOKEN_EXPIRATION=30
PASSPORT_PERSONAL_ACCESS_TOKEN_EXPIRATION=365
```

## API Endpoints

### Public Endpoints (Không cần authentication)

#### 1. Đăng ký user mới
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Nguyễn Văn A",
  "email": "nguyenvana@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "phone": "0901234567",
  "address": "123 Đường ABC, Quận 1, TP.HCM",
  "gender": "male"
}
```

Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "Nguyễn Văn A",
      "email": "nguyenvana@example.com",
      "role": {
        "name": "employee",
        "display_name": "Nhân viên"
      }
    },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "token_type": "Bearer"
  }
}
```

#### 2. Đăng nhập (API - JWT Token)
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@garage.com",
  "password": "password123",
  "remember_me": false
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "Administrator",
      "email": "admin@garage.com",
      "role": {
        "name": "admin",
        "display_name": "Quản trị viên"
      }
    },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "token_type": "Bearer"
  }
}
```

#### 3. Đăng nhập (Web - Session)
```http
POST /api/auth/login-web
Content-Type: application/json

{
  "email": "admin@garage.com",
  "password": "password123",
  "remember_me": true
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "Administrator",
      "email": "admin@garage.com"
    }
  }
}
```

### Protected Endpoints (Cần authentication)

Sử dụng JWT token trong header:
```http
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

#### 1. Lấy thông tin user hiện tại
```http
GET /api/auth/me
Authorization: Bearer {token}
```

#### 2. Đăng xuất
```http
POST /api/auth/logout
Authorization: Bearer {token}
```

#### 3. Refresh Token
```http
POST /api/auth/refresh
Authorization: Bearer {token}
```

#### 4. Đổi mật khẩu
```http
POST /api/auth/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "current_password": "password123",
  "new_password": "newpassword456",
  "new_password_confirmation": "newpassword456"
}
```

## Phân quyền (Roles & Permissions)

### Các Role có sẵn:

1. **admin** (Quản trị viên)
   - Toàn quyền truy cập hệ thống
   - Quản lý users, roles, settings
   - Xem tất cả báo cáo và dữ liệu nhạy cảm

2. **manager** (Quản lý)
   - Quản lý hoạt động kinh doanh
   - Phê duyệt orders, invoices
   - Xem báo cáo

3. **accountant** (Kế toán)
   - Quản lý tài chính
   - Tạo và phê duyệt invoices, payments
   - Quyết toán với đối tác

4. **employee** (Nhân viên)
   - Quản lý khách hàng
   - Tạo orders, invoices
   - Nhận payments

5. **mechanic** (Thợ máy)
   - Xem thông tin xe và orders
   - Cập nhật tiến độ sửa chữa
   - Tạo inspection reports

### Kiểm tra quyền trong code:

```php
// Trong Controller
if ($request->user()->isAdmin()) {
    // Code cho admin
}

if ($request->user()->hasRole('manager')) {
    // Code cho manager
}

// Trong Model
$user->role->name; // 'admin', 'manager', etc.
$user->role->permissions; // JSON array of permissions
```

## Middleware

### 1. auth:api
Chỉ cho phép JWT token authentication
```php
Route::middleware('auth:api')->group(function () {
    // API routes
});
```

### 2. auth:web
Chỉ cho phép session authentication
```php
Route::middleware('auth:web')->group(function () {
    // Web routes
});
```

### 3. auth.session.or.token
Cho phép cả session hoặc JWT token
```php
Route::middleware('auth.session.or.token')->group(function () {
    // Routes có thể dùng cả 2 loại auth
});
```

## Frontend Integration

### Sử dụng với React/Vue

```javascript
// 1. Đăng nhập và lưu token
const login = async (email, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  if (data.success) {
    // Lưu token vào localStorage
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
  }
};

// 2. Gọi API với token
const fetchProtectedData = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('/api/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  return await response.json();
};

// 3. Đăng xuất
const logout = async () => {
  const token = localStorage.getItem('token');
  
  await fetch('/api/auth/logout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
```

## Security Best Practices

1. **Luôn sử dụng HTTPS** trong production
2. **Token expiration**: Access token hết hạn sau 15 ngày
3. **Refresh token**: Dùng để lấy token mới khi hết hạn
4. **Session lifetime**: Session hết hạn sau 120 phút không hoạt động
5. **Password policy**: Tối thiểu 8 ký tự
6. **Rate limiting**: Cân nhắc thêm rate limiting cho login endpoint

## Troubleshooting

### Lỗi: "Unauthenticated"
- Kiểm tra token có được gửi trong header không
- Kiểm tra token có hết hạn không
- Thử refresh token

### Lỗi: "Invalid credentials"
- Kiểm tra email/password đúng chưa
- Kiểm tra user có is_active = true không

### Lỗi: Passport keys not found
```bash
php artisan passport:keys --force
```

### Lỗi: Migration failed
```bash
php artisan migrate:fresh --seed
```

## Testing

### Test với Postman/Insomnia

1. Import collection từ file `postman_collection.json`
2. Đăng nhập để lấy token
3. Set token vào Authorization header
4. Test các endpoints

### Test với curl

```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@garage.com","password":"password123"}'

# Get user info
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Kết luận

✅ Database đã đầy đủ và sẵn sàng cho Session + JWT authentication
✅ Hỗ trợ cả Web (Session) và Mobile/SPA (JWT Token)
✅ Phân quyền chi tiết với 5 roles
✅ Bảo mật với Passport OAuth2
✅ Dễ dàng mở rộng và tùy chỉnh

Nghiệp vụ hệ thống quản lý garage đã được thiết kế rất chi tiết và chuyên nghiệp, phù hợp cho việc quản lý:
- Khách hàng và xe
- Dịch vụ sửa chữa và bán phụ tùng
- Đơn hàng và thanh toán
- Kho và chuyển kho
- Đối tác và quyết toán
- Bảo hành và kiểm tra xe

