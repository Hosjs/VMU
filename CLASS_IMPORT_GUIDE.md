# Hướng Dẫn Import Dữ Liệu Lớp Học và Học Viên

## Tổng Quan

Hệ thống cung cấp các công cụ để tự động import dữ liệu lớp học và học viên từ API bên ngoài vào database của VMU.

**API Nguồn:**
- API lớp học: `http://203.162.246.113:8088/LopHoc/MaLop?ID={id}`
- API học viên: `http://203.162.246.113:8088/LopHoc/HocVien?LopID={id}`

## Các Thành Phần Đã Tạo

### 1. Service Layer
**File:** `backend/app/Services/ClassImportService.php`

Service này xử lý logic import:
- `importClassWithStudents($classId)` - Import 1 lớp và học viên
- `importMultipleClasses($classIds)` - Import nhiều lớp cùng lúc
- `fetchClassInfo($classId)` - Lấy thông tin lớp từ API
- `fetchClassStudents($classId)` - Lấy danh sách học viên từ API

### 2. API Endpoints
**File:** `backend/app/Http/Controllers/Api/ClassImportController.php`

**Routes:**
```
GET  /api/class-import/preview/{classId}     - Xem trước dữ liệu trước khi import
POST /api/class-import/single                - Import 1 lớp
POST /api/class-import/multiple              - Import nhiều lớp
GET  /api/class-import/available             - Danh sách lớp có thể import
```

### 3. Artisan Command
**File:** `backend/app/Console/Commands/ImportClassData.php`

Chạy import từ command line:
```bash
# Import 1 lớp
php artisan class:import 35

# Import nhiều lớp
php artisan class:import 35 36 37

# Xem trước dữ liệu (không lưu vào DB)
php artisan class:import 35 --preview
```

### 4. Class Management API
**File:** `backend/app/Http/Controllers/Api/LopController.php`

**Routes:**
```
GET /api/classes              - Danh sách lớp (có phân trang)
GET /api/classes/simple       - Danh sách lớp đơn giản (cho dropdown)
GET /api/classes/{id}         - Chi tiết 1 lớp
GET /api/classes/{id}/students - Danh sách học viên trong lớp
```

### 5. Teaching Assignment Integration
**Model:** `backend/app/Models/TeachingAssignment.php`

Đã thêm:
- `lop_id` field - Liên kết với bảng lớp học
- `lop()` relationship - Quan hệ với model Lop

## Cách Sử Dụng

### 1. Sử dụng API Endpoints

#### Xem trước dữ liệu lớp
```bash
curl http://localhost/api/class-import/preview/35
```

Response:
```json
{
  "success": true,
  "data": {
    "class": {
      "ID": 35,
      "TenLop": "Thạc sỹ Quản trị kinh doanh K23",
      "KhoaHoc": 2023
    },
    "students": [...],
    "students_count": 25
  }
}
```

#### Import 1 lớp
```bash
curl -X POST http://localhost/api/class-import/single \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{"class_id": 35}'
```

Response:
```json
{
  "success": true,
  "message": "Import thành công",
  "data": {
    "class": {...},
    "students_count": 25,
    "students": [...]
  }
}
```

#### Import nhiều lớp
```bash
curl -X POST http://localhost/api/class-import/multiple \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{"class_ids": [35, 36, 37]}'
```

### 2. Sử dụng Artisan Command

#### Import từ command line
```bash
# Ví dụ: Import lớp có ID = 35
php artisan class:import 35

# Import nhiều lớp
php artisan class:import 35 36 37 38

# Xem trước không lưu
php artisan class:import 35 --preview
```

#### Tự động hóa với Laravel Scheduler
Thêm vào `app/Console/Kernel.php`:

```php
protected function schedule(Schedule $schedule)
{
    // Tự động import lớp mỗi ngày
    $schedule->command('class:import 35 36 37')
             ->daily()
             ->at('01:00');
}
```

### 3. Tích hợp vào Teaching Assignment

Khi tạo lịch giảng dạy, có thể chọn lớp học:

```bash
curl -X POST http://localhost/api/teaching-assignments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "lecturer_id": 1,
    "lop_id": 5,
    "course_name": "Quản trị chiến lược",
    "start_date": "2025-01-15",
    "end_date": "2025-05-15",
    "day_of_week": "saturday",
    "start_time": "08:00",
    "end_time": "12:00",
    "room": "A101"
  }'
```

### 4. Lấy danh sách lớp cho dropdown

```bash
# Danh sách lớp đơn giản
curl http://localhost/api/classes/simple

# Lọc theo trình độ đào tạo
curl http://localhost/api/classes/simple?maTrinhDoDaoTao=THS

# Lọc theo ngành học
curl http://localhost/api/classes/simple?maNganhHoc=QTKD
```

## Workflow Đề Xuất

### Khi cần thêm lịch giảng dạy cho giảng viên:

1. **Import dữ liệu lớp học** (nếu chưa có trong DB):
   ```bash
   # Xem trước
   curl http://localhost/api/class-import/preview/35
   
   # Import nếu OK
   curl -X POST http://localhost/api/class-import/single \
     -d '{"class_id": 35}'
   ```

2. **Lấy danh sách lớp** để hiển thị trong form:
   ```bash
   curl http://localhost/api/classes/simple
   ```

3. **Tạo teaching assignment** với lớp đã chọn:
   ```bash
   curl -X POST http://localhost/api/teaching-assignments \
     -d '{
       "lecturer_id": 1,
       "lop_id": 5,
       "course_name": "...",
       ...
     }'
   ```

4. **Xem lịch giảng** của giảng viên:
   ```bash
   curl http://localhost/api/teaching-assignments?lecturer_id=1
   ```

## Import Hàng Loạt

Nếu cần import nhiều lớp cùng lúc:

```bash
# Tạo file danh sách IDs
echo "35 36 37 38 39 40" > class_ids.txt

# Import tất cả
php artisan class:import $(cat class_ids.txt)
```

Hoặc sử dụng API:
```bash
curl -X POST http://localhost/api/class-import/multiple \
  -d '{"class_ids": [35, 36, 37, 38, 39, 40]}'
```

## Xử Lý Lỗi

### Import thất bại
- Kiểm tra log: `storage/logs/laravel.log`
- Thử xem trước để debug: `php artisan class:import {id} --preview`

### Dữ liệu trùng lặp
- Service tự động xử lý bằng `updateOrCreate`
- Lớp học: Tìm theo tên và khóa học
- Học viên: Tìm theo mã học viên (maHV)

### API bên ngoài không phản hồi
- Service có timeout 15 giây
- Sẽ trả về lỗi với message rõ ràng

## Database Schema

### Bảng `lop`
```sql
- id (bigint, PK)
- tenLop (varchar)
- maTrinhDoDaoTao (varchar)
- maNganhHoc (varchar)
- khoaHoc (int)
- trangThai (enum)
```

### Bảng `hoc_vien`
```sql
- maHV (varchar, PK)
- hoDem (varchar)
- ten (varchar)
- idLop (bigint, FK to lop.id)
- ... (các trường khác)
```

### Bảng `teaching_assignments`
```sql
- id (bigint, PK)
- lecturer_id (bigint, FK)
- lop_id (bigint, FK to lop.id) ← MỚI THÊM
- course_name (varchar)
- start_date (date)
- end_date (date)
- ... (các trường khác)
```

## Testing

Test các API endpoints:

```bash
# Test preview
curl http://localhost/api/class-import/preview/35

# Test import
curl -X POST http://localhost/api/class-import/single \
  -H "Authorization: Bearer {token}" \
  -d '{"class_id": 35}'

# Test classes list
curl http://localhost/api/classes

# Test class detail with students
curl http://localhost/api/classes/35/students
```

## Notes

- Tất cả API import yêu cầu authentication (trừ preview)
- Dữ liệu được validate trước khi lưu
- Hỗ trợ soft delete cho tất cả các bảng
- Tự động mapping field từ API bên ngoài (TenLop → tenLop, MaHV → maHV, etc.)

