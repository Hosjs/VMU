# Hướng Dẫn Khắc Phục Lỗi Passport "Personal access client not found"

## 🔴 Lỗi Gặp Phải
```
RuntimeException
Personal access client not found for 'users' user provider. Please create one.
```

## ✅ Nguyên Nhân
- Các bảng OAuth đã được tạo từ migration nhưng chưa có **Personal Access Client** trong database
- Có nhiều migration Passport trùng lặp gây xung đột

## ✅ Giải Pháp Đã Thực Hiện

### 1. Xóa các migration Passport trùng lặp
```bash
cd C:\xampp\htdocs\gara\backend\database\migrations
Remove-Item 2025_10_07_*.php
```

### 2. Tạo Personal Access Client
```bash
cd C:\xampp\htdocs\gara\backend
php artisan passport:client --personal
```

### 3. Đảm bảo encryption keys tồn tại
```bash
php artisan passport:keys
```

## 📝 Các Migration Passport Hiện Tại
Chỉ nên giữ các migration Passport ban đầu (từ ngày 2025_10_03):
- `2025_10_03_045016_create_oauth_auth_codes_table.php`
- `2025_10_03_045017_create_oauth_access_tokens_table.php`
- `2025_10_03_045018_create_oauth_refresh_tokens_table.php`
- `2025_10_03_045019_create_oauth_clients_table.php`
- `2025_10_03_045020_create_oauth_device_codes_table.php`

## 🧪 Test Authentication

### Register (POST /api/auth/register)
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "phone": "0123456789"
}
```

### Login (POST /api/auth/login)
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

Response sẽ trả về token:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {...},
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "token_type": "Bearer"
  }
}
```

### Sử dụng Token
Thêm header vào các request tiếp theo:
```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

## 🎯 Kết Quả
- ✅ Personal Access Client đã được tạo thành công
- ✅ Encryption keys đã tồn tại
- ✅ API Authentication hoạt động bình thường
- ✅ CORS middleware đã được cấu hình

## 🔄 Nếu Gặp Lỗi Lại
Nếu bạn xóa database và migrate lại, cần chạy lại lệnh:
```bash
php artisan passport:client --personal
```

## 📚 Tham Khảo
- Laravel Passport: https://laravel.com/docs/12.x/passport
- API Routes: `backend/routes/api.php`
- Auth Controller: `backend/app/Http/Controllers/Api/AuthController.php`

