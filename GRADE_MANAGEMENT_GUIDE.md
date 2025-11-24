# Hệ Thống Quản Lý Điểm - Hướng Dẫn Sử Dụng

## 🎯 Tổng quan

Hệ thống quản lý điểm mới được thiết kế theo luồng:
1. **Chọn ngành + năm học** → Xem danh sách lớp
2. **Chọn lớp** → Xem danh sách học sinh
3. **Nhập/sửa điểm** cho từng học sinh theo môn học

## 🚀 Tính năng chính

### ✅ Đã loại bỏ hoàn toàn:
- ❌ Phân loại theo ngành (không còn tab "Phân loại theo ngành")
- ❌ Giao diện tra cứu điểm cũ (đã thay thế hoàn toàn)

### ✨ Tính năng mới:
- ✅ Chọn ngành và năm học trực quan
- ✅ Hiển thị danh sách lớp với số lượng học sinh
- ✅ Xem và nhập điểm theo từng môn học
- ✅ Nhập điểm thành phần X, Y, Z
- ✅ Tự động tính điểm trung bình: **(x × 0.1) + (y × 0.2) + (z × 0.7)**
- ✅ Hiển thị trạng thái Đạt/Không đạt
- ✅ Giao diện thân thiện, dễ sử dụng

## 📋 Cấu trúc Backend API

### 1. GET `/api/grade-management/majors`
Lấy danh sách ngành học với các năm học khả dụng

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "maNganh": "CNTT",
      "tenNganh": "Công nghệ thông tin",
      "years": ["2021", "2022", "2023", "2024"]
    }
  ]
}
```

### 2. GET `/api/grade-management/classes?maNganh={code}&khoaHoc={year}`
Lấy danh sách lớp theo ngành và năm học

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tenLop": "CNTT-K22-01",
      "khoaHoc": "2022",
      "trangThai": "DangHoc",
      "tenNganh": "Công nghệ thông tin",
      "studentCount": 35
    }
  ]
}
```

### 3. GET `/api/grade-management/classes/{classId}/students`
Lấy danh sách học sinh trong lớp kèm điểm

**Query params (optional):**
- `subject_id`: Lọc theo môn học cụ thể

**Response:**
```json
{
  "success": true,
  "data": {
    "class": {
      "id": 1,
      "tenLop": "CNTT-K22-01",
      "khoaHoc": "2022",
      "trangThai": "DangHoc",
      "tenNganh": "Công nghệ thông tin"
    },
    "students": [
      {
        "maHV": "CA2211001",
        "hoTen": "Nguyễn Văn A",
        "ngaySinh": "2000-01-15",
        "gioiTinh": "Nam",
        "email": "nva@example.com",
        "trangThaiHoc": "DangHoc",
        "grades": [
          {
            "grade_id": 1,
            "subject_id": 10,
            "maMon": "IT101",
            "tenMon": "Lập trình Web",
            "soTinChi": 3,
            "x": 8.0,
            "y": 8.5,
            "z": 8.7,
            "created_at": "2024-01-15",
            "updated_at": "2024-01-15"
          }
        ]
      }
    ],
    "subjects": [
      {
        "id": 10,
        "maMon": "IT101",
        "tenMon": "Lập trình Web",
        "soTinChi": 3
      }
    ]
  }
}
```

### 4. POST `/api/grade-management/grades` (Requires Auth)
Cập nhật hoặc tạo mới điểm cho học sinh

**Request:**
```json
{
  "student_id": "CA2211001",
  "subject_id": 10,
  "x": 8.0,
  "y": 8.5,
  "z": 8.7
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cập nhật điểm thành công",
  "data": {
    "id": 1,
    "x": 8.0,
    "y": 8.5,
    "z": 8.7,
    "diem": 8.6
  }
}
```

### 5. POST `/api/grade-management/grades/bulk` (Requires Auth)
Cập nhật điểm hàng loạt

**Request:**
```json
{
  "grades": [
    {
      "student_id": "CA2211001",
      "subject_id": 10,
      "x": 8.0,
      "y": 8.5,
      "z": 8.7
    },
    {
      "student_id": "CA2211002",
      "subject_id": 10,
      "x": 7.5,
      "y": 8.0,
      "z": 7.8
    }
  ]
}
```

### 6. DELETE `/api/grade-management/grades/{gradeId}` (Requires Auth)
Xóa điểm

## 🎨 Frontend - Luồng sử dụng

### Bước 1: Chọn ngành và năm học
1. Khi vào trang, hệ thống tự động load danh sách ngành
2. Click chọn ngành → Hiển thị danh sách năm học khả dụng
3. Click chọn năm học
4. Nhấn "Tiếp tục" để sang bước 2

### Bước 2: Chọn lớp
1. Hiển thị danh sách lớp theo ngành và năm đã chọn
2. Mỗi card lớp hiển thị:
   - Tên lớp
   - Khóa học
   - Trạng thái
   - Số lượng học sinh
3. Click vào lớp để xem danh sách học sinh

### Bước 3: Quản lý điểm
1. Hiển thị thông tin lớp đã chọn
2. Có dropdown để chọn môn học cụ thể
3. Danh sách học sinh với 2 chế độ xem:

**Chế độ 1: Xem tất cả các môn**
- Hiển thị tất cả môn học của mỗi học sinh
- Điểm X, Y, Z và điểm trung bình
- Nút "Sửa" để chỉnh sửa điểm

**Chế độ 2: Chọn 1 môn cụ thể**
- Tập trung vào 1 môn học
- Hiển thị chi tiết điểm X, Y, Z
- Form nhập/sửa điểm ngay trong card học sinh
- Nút "Nhập điểm" nếu chưa có điểm
- Nút "Sửa" nếu đã có điểm

### Nhập/Sửa điểm:
1. Click nút "Nhập điểm" hoặc "Sửa"
2. Form hiển thị 3 ô input: X, Y, Z
3. Nhập điểm từ 0-10
4. Click "Lưu điểm" → Hệ thống tự động tính điểm TB
5. Thông báo "Cập nhật điểm thành công!"

## 💾 Database Structure

### Bảng liên quan:
```
students (học sinh)
  - maHV (PK)
  - hoDem, ten
  - idLop (FK -> lop.id)
  - ...

lop (lớp học)
  - id (PK)
  - tenLop
  - maNganhHoc (FK)
  - khoaHoc
  - trangThai

subject_students (điểm)
  - id (PK)
  - student_id (FK -> students.maHV)
  - subject_id (FK -> subjects.id)
  - x, y, z (float)

subjects (môn học)
  - id (PK)
  - maMon
  - tenMon
  - soTinChi

major_subjects (liên kết ngành-môn)
  - major_id (FK)
  - subject_id (FK)

nganh_hoc (ngành học)
  - maNganh (PK)
  - tenNganh
```

## 🔒 Phân quyền

API nhập/sửa/xóa điểm yêu cầu:
- Đăng nhập (token trong localStorage)
- Permission: `grades.create` hoặc `grades.delete`

## 📱 URL và Routing

**Frontend URL:** `/academic/grade-management`

**Breadcrumb navigation:**
```
1. Chọn ngành & năm học → 2. Chọn lớp → 3. Quản lý điểm
```

Có nút "Quay lại" ở mỗi bước để dễ dàng điều hướng.

## 🎯 Công thức tính điểm

**Điểm trung bình hệ 10:**
```
Điểm TB = (X × 0.1) + (Y × 0.2) + (Z × 0.7)
```

**Kết quả:**
- `>= 5.0`: Đạt (màu xanh)
- `< 5.0`: Không đạt (màu đỏ)

## 🚀 Cách sử dụng

### 1. Khởi động Backend:
```bash
cd backend
php artisan serve
```

### 2. Khởi động Frontend:
```bash
cd frontend
npm run dev
```

### 3. Truy cập:
```
http://localhost:5173/academic/grade-management
```

### 4. Thêm vào menu navigation:

Cập nhật file menu/navigation để thêm link mới:
```typescript
{
  title: "Quản lý điểm",
  href: "/academic/grade-management",
  icon: AcademicCapIcon,
  permission: "grades.create"
}
```

## ⚡ Performance Tips

1. **Lazy loading:** Chỉ load dữ liệu khi cần (khi chọn lớp)
2. **Caching:** Backend có thể cache danh sách ngành/lớp
3. **Pagination:** Có thể thêm pagination nếu lớp có quá nhiều học sinh

## 🐛 Troubleshooting

### Lỗi: "Failed to fetch majors"
- Kiểm tra backend đang chạy
- Kiểm tra database có dữ liệu trong bảng `nganh_hoc` và `lop`

### Lỗi: "Validation error" khi lưu điểm
- Đảm bảo điểm X, Y, Z từ 0-10
- Đảm bảo đã đăng nhập (có token)

### Không hiển thị môn học
- Kiểm tra bảng `major_subjects` đã liên kết môn học với ngành chưa
- Kiểm tra bảng `subjects` có dữ liệu

## 📝 TODO - Tính năng mở rộng

- [ ] Export điểm ra Excel
- [ ] Import điểm hàng loạt từ Excel
- [ ] Lịch sử thay đổi điểm
- [ ] Thông báo khi điểm được cập nhật
- [ ] Phê duyệt điểm (workflow)
- [ ] Khóa điểm sau khi hoàn thành học kỳ
- [ ] Thống kê điểm theo lớp
- [ ] So sánh điểm giữa các lớp

## 🎉 Kết luận

Hệ thống mới:
- ✅ Loại bỏ phân loại theo ngành
- ✅ Giao diện thân thiện, trực quan
- ✅ Luồng nhập điểm rõ ràng: Ngành → Lớp → Học sinh → Môn → Điểm
- ✅ 100% dữ liệu từ database
- ✅ Tự động tính điểm trung bình
- ✅ Sẵn sàng để sử dụng!

