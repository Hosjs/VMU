# Hướng dẫn Deploy lên cPanel - sdtvimaru.com

## Cấu trúc thư mục trên server cPanel

```
/home/wpsh1zlbya2n/              ← home directory
├── public_html/                 ← domain chính: www.sdtvimaru.com
│   ├── index.html               ← React SPA (từ build/client/)
│   ├── assets/                  ← JS/CSS (từ build/client/assets/)
│   ├── .htaccess                ← SPA routing + bỏ qua /api/*
│   ├── check.php                ← File debug tạm (XÓA sau khi kiểm tra)
│   └── api/                     ← Laravel public (www.sdtvimaru.com/api)
│       ├── index.php            ← Laravel entry point
│       ├── check.php            ← File debug tạm (XÓA sau khi kiểm tra)
│       ├── .htaccess            ← Laravel routing
│       └── favicon.ico
└── laravel_backend/             ← Code Laravel (NGOÀI public_html - bảo mật)
    ├── app/
    ├── bootstrap/
    ├── config/
    ├── database/
    ├── routes/
    ├── storage/
    ├── vendor/
    └── .env
```

> **Quan trọng:** `index.php` trong `api/` dùng đường dẫn `../../laravel_backend`
> vì nó nằm 2 cấp sâu so với home: `public_html/api/` → `../../` → `/home/wpsh1zlbya2n/`

---

## BƯỚC 1 — Kiểm tra đường dẫn trước (quan trọng!)

### 1a. Upload file debug lên server

Upload `backend/public/check.php` vào `public_html/api/check.php`

### 1b. Truy cập để kiểm tra

Mở trình duyệt: `https://www.sdtvimaru.com/api/check.php`

Kết quả mong đợi:
```
Path ../../laravel_backend EXISTS : YES ✅
vendor (../../) EXISTS            : YES ✅
```

Nếu thấy **NO ❌** → đường dẫn sai, xem mục "Xử lý lỗi" bên dưới.

### 1c. Xóa file debug sau khi kiểm tra xong

---

## BƯỚC 2 — Upload Laravel Backend

### 2a. Upload thư mục `backend/` (trừ `public/`) vào `laravel_backend/`

Dùng **File Manager** hoặc **FTP** upload vào:
```
/home/wpsh1zlbya2n/laravel_backend/
```

Cần upload: `app/`, `bootstrap/`, `config/`, `database/`, `resources/`, `routes/`, `storage/`, `vendor/`, `.env`, `artisan`, `composer.json`

> ⚠️ **Không** upload thư mục `backend/public/` vào đây.

### 2b. Upload `backend/public/` vào `public_html/api/`

Upload nội dung bên trong `backend/public/` vào:
```
/home/wpsh1zlbya2n/public_html/api/
```

Kết quả:
```
public_html/api/index.php
public_html/api/.htaccess
public_html/api/favicon.ico
```

---

## BƯỚC 3 — Upload Frontend Build

Upload **toàn bộ nội dung** trong `frontend/build/client/` vào:
```
/home/wpsh1zlbya2n/public_html/
```

> Bao gồm: `index.html`, `assets/`, `.htaccess`, `favicon.ico`

---

## BƯỚC 4 — Kiểm tra file .env trên server

SSH hoặc dùng Terminal trong cPanel:

```bash
cat ~/laravel_backend/.env
```

Đảm bảo đúng:
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://www.sdtvimaru.com

FRONTEND_URL=https://www.sdtvimaru.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=wpsh1zlbya2n_vmu
DB_USERNAME=wpsh1zlbya2n_vmu
DB_PASSWORD="#$)y9i2NYzcR6!(*"
```

---

## BƯỚC 5 — Chạy lệnh qua Terminal cPanel

Vào **cPanel → Terminal**:

```bash
cd ~/laravel_backend

# Migrations
php artisan migrate --force

# Passport keys (nếu chưa có)
php artisan passport:keys --force

# Cache (tăng hiệu năng)
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Phân quyền
chmod -R 755 ~/laravel_backend/storage
chmod -R 755 ~/laravel_backend/bootstrap/cache
```

---

## BƯỚC 6 — Bật SSL trong cPanel

1. Vào **cPanel → SSL/TLS → Let's Encrypt SSL**
2. Chọn: `sdtvimaru.com` và `www.sdtvimaru.com`
3. Nhấn **Issue**

---

## BƯỚC 7 — Kiểm tra

| URL | Kết quả mong đợi |
|-----|-----------------|
| `https://www.sdtvimaru.com` | Trang React load |
| `https://www.sdtvimaru.com/login` | Trang login React |
| `https://www.sdtvimaru.com/api/up` | `{"status":"up"}` |
| `https://www.sdtvimaru.com/api/auth/login` | POST endpoint (trả 422 nếu GET) |

---

## Xử lý lỗi

### ❌ HTTP ERROR 500 khi vào `/api`

**Bước 1:** Bật debug tạm thời — SSH vào server:
```bash
cd ~/laravel_backend
# Đổi APP_DEBUG=true trong .env tạm thời
sed -i 's/APP_DEBUG=false/APP_DEBUG=true/' .env
php artisan config:clear
```
Reload trang để xem lỗi chi tiết, sau đó tắt lại:
```bash
sed -i 's/APP_DEBUG=true/APP_DEBUG=false/' .env
php artisan config:cache
```

**Bước 2:** Kiểm tra log:
```bash
tail -50 ~/laravel_backend/storage/logs/laravel.log
```

**Nguyên nhân thường gặp:**
- Đường dẫn `../../laravel_backend` không tồn tại → kiểm tra `check.php`
- `vendor/` chưa upload hoặc thiếu → chạy `composer install --no-dev` trên server
- Thiếu quyền thư mục `storage/` → `chmod -R 755 storage/`
- PHP version < 8.2 → kiểm tra trong cPanel → Software → PHP Version

### ❌ `/api` trả 404
- Kiểm tra `public_html/api/index.php` đã tồn tại chưa
- Kiểm tra `.htaccess` trong `public_html/` có rule loại trừ `/api`

### ❌ Lỗi Mixed Content hoặc không bảo mật
- Bật SSL Let's Encrypt trong cPanel (Bước 6)
- Đảm bảo `APP_URL` dùng `https://`

### ❌ 401 Unauthorized — token không gửi được
- Kiểm tra `.htaccess` trong `public_html/api/` có dòng `HTTP_AUTHORIZATION`
- Một số cPanel không pass Authorization header → thêm vào `index.php`:
  ```php
  // Thêm trước $app->handleRequest(...)
  if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
      // Already set
  } elseif (function_exists('apache_request_headers')) {
      $headers = apache_request_headers();
      if (isset($headers['Authorization'])) {
          $_SERVER['HTTP_AUTHORIZATION'] = $headers['Authorization'];
      }
  }
  ```


## Cấu trúc thư mục trên server cPanel

```
/home/<cpanel_user>/
├── public_html/              ← domain chính: www.sdtvimaru.com
│   ├── index.html            ← React SPA (từ build/client/)
│   ├── assets/               ← JS/CSS (từ build/client/assets/)
│   ├── .htaccess             ← SPA routing + bỏ qua /api/*
│   └── api/                  ← Laravel public (www.sdtvimaru.com/api)
│       ├── index.php         ← Laravel entry point
│       ├── .htaccess         ← Laravel routing
│       └── favicon.ico
└── laravel_backend/          ← Code Laravel (NGOÀI public_html - bảo mật)
    ├── app/
    ├── bootstrap/
    ├── config/
    ├── database/
    ├── routes/
    ├── storage/
    ├── vendor/
    └── .env
```

---

## BƯỚC 1 — Upload Laravel Backend

### 1a. Upload toàn bộ thư mục `backend/` (trừ `public/`)

Dùng **File Manager** hoặc **FTP** upload thư mục `backend/` vào:
```
/home/<cpanel_user>/laravel_backend/
```

> ⚠️ **Không** upload thư mục `backend/public/` vào đây.
> 
> Cần upload: `app/`, `bootstrap/`, `config/`, `database/`, `resources/`, `routes/`, `storage/`, `vendor/`, `.env`, `artisan`, `composer.json`

### 1b. Upload thư mục `backend/public/` vào `public_html/api/`

Upload nội dung bên trong `backend/public/` vào:
```
/home/<cpanel_user>/public_html/api/
```

Kết quả:
```
public_html/api/index.php
public_html/api/.htaccess
public_html/api/favicon.ico
```

---

## BƯỚC 2 — Upload Frontend Build

Upload **toàn bộ nội dung** trong `frontend/build/client/` vào:
```
/home/<cpanel_user>/public_html/
```

> Bao gồm: `index.html`, `assets/`, `.htaccess`, `favicon.ico`, v.v.

---

## BƯỚC 3 — Kiểm tra file .env trên server

SSH vào hoặc dùng Terminal trong cPanel, chạy:

```bash
cat ~/laravel_backend/.env
```

Đảm bảo các dòng quan trọng đúng:
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://www.sdtvimaru.com

FRONTEND_URL=https://www.sdtvimaru.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=wpsh1zlbya2n_vmu
DB_USERNAME=wpsh1zlbya2n_vmu
DB_PASSWORD="#$)y9i2NYzcR6!(*"
```

---

## BƯỚC 4 — Chạy Migrations (qua Terminal cPanel)

Vào **cPanel → Terminal** hoặc SSH:

```bash
cd ~/laravel_backend
php artisan migrate --force
```

Nếu chưa có Passport keys:
```bash
php artisan passport:keys --force
```

Cache config:
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Phân quyền storage:
```bash
chmod -R 755 ~/laravel_backend/storage
chmod -R 755 ~/laravel_backend/bootstrap/cache
```

---

## BƯỚC 5 — Bật SSL trong cPanel

1. Vào **cPanel → SSL/TLS → Let's Encrypt SSL**
2. Chọn domain: `sdtvimaru.com` và `www.sdtvimaru.com`
3. Nhấn **Issue** để cấp SSL miễn phí

> Sau khi có SSL, trình duyệt sẽ không còn báo "không bảo mật" nữa.

---

## BƯỚC 6 — Kiểm tra

| URL | Kết quả mong đợi |
|-----|-----------------|
| `https://www.sdtvimaru.com` | Trang login React |
| `https://www.sdtvimaru.com/login` | Trang login React |
| `https://www.sdtvimaru.com/api/up` | `{"status":"up","timestamp":...}` |
| `https://www.sdtvimaru.com/api/auth/login` | POST endpoint (401 nếu GET) |

---

## Kiểm tra lỗi thường gặp

### ❌ `/api` vẫn 404
- Kiểm tra `public_html/api/index.php` đã tồn tại chưa
- Kiểm tra đường dẫn trong `index.php`: `../laravel_backend/` phải đúng

### ❌ Lỗi 500 khi gọi API
```bash
cat ~/laravel_backend/storage/logs/laravel.log | tail -50
```

### ❌ Lỗi Mixed Content (http + https)
- Đảm bảo `APP_URL` trong `.env` dùng `https://`
- Đảm bảo SSL đã được bật trong cPanel

### ❌ Token không gửi được (401 Unauthorized)
- Kiểm tra `.htaccess` trong `public_html/api/` có dòng:
  ```
  RewriteCond %{HTTP:Authorization} .
  RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
  ```

---

## Cấu trúc file đã thay đổi

| File | Thay đổi |
|------|---------|
| `frontend/.env.production` | `VITE_API_URL=https://www.sdtvimaru.com/api` |
| `frontend/public/.htaccess` | Loại trừ `/api/*` khỏi SPA routing |
| `backend/public/.htaccess` | Xử lý Authorization header cho Passport |
| `backend/.env` | `APP_URL=https://www.sdtvimaru.com`, production settings |

