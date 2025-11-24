# Cập nhật Quản lý Lớp học - Sử dụng bảng `classes`

## Tổng quan
Đã cập nhật toàn bộ hệ thống để sử dụng bảng `classes` thay vì bảng `lop`, với cột `khoaHoc_id` thay vì `khoaHoc`.

## 1. Backend Changes

### 1.1. Model Lop.php
**File:** `/backend/app/Models/Lop.php`

**Thay đổi:**
- ✅ Đổi `$table = 'lop'` thành `$table = 'classes'`
- ✅ Cập nhật `$fillable` để sử dụng cột mới:
  - `class_name` (thay vì tenLop)
  - `major_id` (thay vì maNganhHoc)
  - `khoaHoc_id` (thay vì khoaHoc)
  - `lecurer_id` (thay vì idGiaoVienChuNhiem)
- ✅ Thêm **Accessors & Mutators** để backward compatibility
- ✅ Thêm scopes: `byKhoaHoc()`, `byMajor()`, `active()`

### 1.2. ClassController.php
**File:** `/backend/app/Http/Controllers/Api/ClassController.php`

**Thay đổi:**
- ✅ Cập nhật `index()` method:
  - Hỗ trợ filter theo `khoaHoc_id` và `major_id`
  - Column mapping để sort đúng: `khoaHoc` → `khoaHoc_id`
  - Transform data để thêm alias cho backward compatibility
- ✅ Cập nhật `getStudents()` method:
  - Sử dụng cột `class_name`, `khoaHoc_id`, `major_id`
  - Trả về đầy đủ thông tin với cả tên cột cũ và mới

## 2. Frontend Changes

### 2.1. Breadcrumb Component
**File:** `/frontend/app/layouts/Breadcrumb.tsx`

**Thay đổi:**
- ✅ Đã có sẵn trong dự án
- ✅ Hỗ trợ đầy đủ các route quản lý lớp học và điểm

### 2.2. Room Type
**File:** `/frontend/app/types/room.ts`

**Thay đổi:**
- ✅ Thêm các property mới:
  - `class_name?: string`
  - `major_id?: string`
  - `khoaHoc_id?: number`
  - `lecurer_id?: number`
- ✅ Giữ lại các property cũ cho backward compatibility:
  - `tenLop?: string`
  - `maNganhHoc?: string`
  - `khoaHoc?: number`

### 2.3. Room Service
**File:** `/frontend/app/services/room.service.ts`

**Thay đổi:**
- ✅ Thêm method `getClasses()` để lấy dữ liệu từ API `/api/classes`
- ✅ Cập nhật `getList()` để:
  - Sử dụng `khoaHoc_id` thay vì `khoaHoc`
  - Hỗ trợ search với cả `class_name` và `tenLop`
  - Hỗ trợ sort với column mapping
- ✅ Cập nhật `getDanhSach()` để ưu tiên dữ liệu từ bảng `classes`

### 2.4. Grade Management Page
**File:** `/frontend/app/routes/academic/grade-management.tsx`

**Thay đổi:**
- ✅ Thêm `useNavigate` và `ArrowLeftIcon`
- ✅ Thêm nút **"Quay lại"** ở header (hiện khi không ở bước đầu tiên)
- ✅ Thêm function `handleBack()` để điều hướng giữa các bước
- ✅ Cập nhật interface `Class` để hỗ trợ `khoaHoc_id`
- ✅ Thêm breadcrumb hiển thị bước hiện tại

## 3. Cấu trúc bảng `classes`

```sql
CREATE TABLE `classes` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `class_name` varchar(255) NOT NULL,
  `maTrinhDoDaoTao` varchar(10) NOT NULL,
  `major_id` varchar(10) NOT NULL,
  `khoaHoc_id` int(11) NOT NULL,
  `lecurer_id` bigint(20) unsigned DEFAULT NULL,
  `trangThai` enum('DangHoc','DaTotNghiep','GiaiThe') DEFAULT 'DangHoc',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `createdBy` bigint(20) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `khoaHoc_id` (`khoaHoc_id`),
  KEY `trangThai` (`trangThai`)
);
```

## 4. API Endpoints

### 4.1. Lấy danh sách lớp học
```
GET /api/classes?khoaHoc_id=2024&major_id=CNTT&search=K66
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "class_name": "K66 CNTT",
      "tenLop": "K66 CNTT",
      "major_id": "CNTT",
      "maNganhHoc": "CNTT",
      "khoaHoc_id": 2024,
      "khoaHoc": 2024,
      ...
    }
  ],
  "current_page": 1,
  "last_page": 1,
  "per_page": 20,
  "total": 1
}
```

### 4.2. Lấy học viên trong lớp
```
GET /api/classes/{id}/students
```

## 5. Tính năng mới

### 5.1. Nút Quay lại
- ✅ Hiển thị ở tất cả các bước (trừ bước 1)
- ✅ Điều hướng về bước trước đó
- ✅ Reset dữ liệu của bước hiện tại

### 5.2. Breadcrumb
- ✅ Tự động hiển thị đường dẫn điều hướng
- ✅ Hỗ trợ đầy đủ các route quản lý học tập
- ✅ Click để quay về bước trước

### 5.3. Sort theo năm học
- ✅ Sort đúng theo cột `khoaHoc_id` trong database
- ✅ Hỗ trợ sort ascending/descending
- ✅ Column mapping tự động (frontend → database)

## 6. Backward Compatibility

### 6.1. Backend
- Model Lop có **Accessors** để map:
  - `tenLop` → `class_name`
  - `khoaHoc` → `khoaHoc_id`
  - `maNganhHoc` → `major_id`
- ClassController trả về cả 2 format (cũ và mới)

### 6.2. Frontend
- Type `Room` hỗ trợ cả 2 format
- Service tự động xử lý cả 2 format
- Components hoạt động với cả 2 format

## 7. Testing

### 7.1. Backend
```bash
cd /Applications/XAMPP/xamppfiles/VMU/backend
php artisan tinker

# Test Model
$class = \App\Models\Lop::first();
echo $class->tenLop; // Trả về class_name
echo $class->khoaHoc; // Trả về khoaHoc_id

# Test API
curl http://localhost:8000/api/classes?khoaHoc_id=2024
```

### 7.2. Frontend
```bash
cd /Applications/XAMPP/xamppfiles/VMU/frontend
npm run build
npm run dev
```

**Test pages:**
- `/categories/course` - Danh sách học phần
- `/academic/grade-management` - Quản lý điểm
- `/student/class-assignments` - Phân lớp học viên

## 8. Checklist hoàn thành

- ✅ Cập nhật Model sử dụng bảng `classes`
- ✅ Cập nhật Controller với column mapping
- ✅ Cập nhật Frontend types
- ✅ Cập nhật Service layer
- ✅ Thêm nút Quay lại
- ✅ Breadcrumb đã có sẵn
- ✅ Fix sort theo năm học (`khoaHoc_id`)
- ✅ Backward compatibility
- ✅ Build frontend thành công

## 9. Lưu ý

1. **Database migration không cần chạy lại** vì bảng `classes` đã tồn tại
2. **Dữ liệu cũ tương thích** nhờ Accessors/Mutators
3. **Frontend build thành công** - không có lỗi TypeScript
4. **API endpoints hoạt động** với cả tên cột cũ và mới

## 10. Hỗ trợ sau này

Nếu cần migrate hoàn toàn sang tên cột mới:
1. Cập nhật tất cả frontend components
2. Xóa Accessors/Mutators trong Model
3. Xóa alias trong Controller response
4. Cập nhật database migration nếu cần

