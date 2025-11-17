# 📚 Hướng Dẫn Import Môn Học Từ API

## ✅ Đã Hoàn Thành

### 1. Cấu trúc Database
- ✅ Bảng `subjects` (môn học)
- ✅ Bảng `major_subjects` (liên kết ngành-môn học)
- ✅ Models: `Subject`, `MajorSubject`
- ✅ Relationships đầy đủ giữa `Major` và `Subject`

### 2. Dữ liệu đã import ⭐
- ✅ **338 môn học** đã được import thành công
- ✅ **484 liên kết** ngành-môn học
- ✅ **25/63 ngành** đã có đầy đủ môn học từ API
- ✅ Top ngành nhiều môn nhất:
  - Quản lý kinh tế: 57 môn
  - Công nghệ thông tin: 53 môn
  - Kỹ thuật xây dựng: 37 môn

---

## 🌐 API Endpoint (ĐÃ XÁC NHẬN) ✅

**Endpoint chính xác để lấy môn học:**
```
http://203.162.246.113:8088/KeHoachDaoTao/ThacSy?NamVao=2022&MaNganh=8310110
http://203.162.246.113:8088/KeHoachDaoTao/TienSy?NamVao=2022&MaNganh=9310110
```

**Cấu trúc response:**
```json
[
  {
    "id": 2,
    "khoaHoc": 2022,
    "maTrinhDoDaoTao": "04",
    "maNganh": "8310110",
    "hocPhanSo": 501,
    "hocPhanChu": "TH",
    "tenMon": "Triết học",
    "soTinChi": 3,
    "baiTapLon": true,
    "loaiHocPhan": "CH",
    "luaChon": true
  }
]
```

---

## 🚀 Các Script Đã Tạo

### 1. `import_all_subjects_from_api.php` ⭐ (KHUYẾN NGHỊ - ĐÃ TEST THÀNH CÔNG)
Script hoàn chỉnh import tất cả môn học từ API thực tế.

**Cách chạy:**
```bash
cd /Applications/XAMPP/xamppfiles/VMU/backend
php import_all_subjects_from_api.php
```

**Kết quả đã đạt được:**
- ✅ Import thành công 338 môn học
- ✅ Tạo 484 liên kết ngành-môn học
- ✅ Xử lý 25 ngành có dữ liệu
- ✅ Tự động thử nhiều năm (2024-2019) để tìm data
- ✅ Tự động phân biệt Thạc sỹ/Tiến sỹ

**Tính năng:**
- Tự động gọi API `/KeHoachDaoTao/ThacSy` và `/TienSy`
- Thử nhiều năm để tìm dữ liệu (2024-2019)
- Import đầy đủ: mã môn, tên môn, số tín chỉ, loại học phần, bài tập lớn
- Tránh duplicate bằng cache và INSERT IGNORE
- Hiển thị progress bar và thống kê chi tiết

### 2. `import_subjects_correct_api.php`
Script với fallback dữ liệu mẫu (đã được thay thế bởi script trên).

**Cách chạy:**
```bash
cd /Applications/XAMPP/xamppfiles/VMU/backend
php import_subjects_correct_api.php
```

**Tính năng:**
- Tự động thử các endpoint: `/DanhMucHocPhan`, `/MonHoc`, `/HocPhan`, `/ChuongTrinhDaoTao`
- Nếu không tìm thấy API, tự động import dữ liệu mẫu
- Import đầy đủ thông tin: mã môn, tên môn, số tín chỉ, loại học phần

### 2. `import_subjects_manual.php`
Import môn học thủ công từ dữ liệu bạn tự định nghĩa.

**Cách sử dụng:**
```bash
php import_subjects_manual.php
```

### 3. Database Seeder
**Cách chạy:**
```bash
php artisan db:seed --class=SubjectsSeeder
```

---

## 📊 Cấu Trúc Dữ Liệu

### Bảng `subjects`
```sql
CREATE TABLE subjects (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    maMon VARCHAR(20) UNIQUE NOT NULL,
    tenMon VARCHAR(255) NOT NULL,
    soTinChi INT NOT NULL,
    moTa TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Bảng `major_subjects`
```sql
CREATE TABLE major_subjects (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    major_id BIGINT UNSIGNED NOT NULL,
    subject_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (major_id) REFERENCES majors(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    UNIQUE KEY unique_major_subject (major_id, subject_id)
);
```

---

## 🔧 Cách Thêm Môn Học Cho Ngành Khác

### Cách 1: Thêm vào script `import_subjects_correct_api.php`

Mở file và tìm function `importFromSampleData()`, thêm dữ liệu mới:

```php
// Dữ liệu cho ngành mới
$newMajorSubjects = [
    ['maMon' => 'XXX01', 'tenMon' => 'Tên môn học', 'soTinChi' => 3, 'moTa' => 'Mô tả'],
    // ... thêm môn học khác
];

// Import cho ngành mới
$newMajor = DB::table('majors')->where('maNganh', 'MÃ_NGÀNH')->first();
if ($newMajor) {
    echo "📚 Import môn học cho ngành...\n";
    foreach ($newMajorSubjects as $subject) {
        DB::statement(
            "INSERT IGNORE INTO subjects (maMon, tenMon, soTinChi, moTa, created_at, updated_at) 
             VALUES (?, ?, ?, ?, NOW(), NOW())",
            [$subject['maMon'], $subject['tenMon'], $subject['soTinChi'], $subject['moTa']]
        );
        
        $subj = DB::table('subjects')->where('maMon', $subject['maMon'])->first();
        if ($subj) {
            DB::statement(
                "INSERT IGNORE INTO major_subjects (major_id, subject_id) VALUES (?, ?)",
                [$newMajor->id, $subj->id]
            );
        }
    }
}
```

### Cách 2: Thêm trực tiếp qua SQL

```sql
-- Thêm môn học
INSERT INTO subjects (maMon, tenMon, soTinChi, moTa) 
VALUES ('CODE01', 'Tên môn học', 3, 'Mô tả');

-- Liên kết với ngành (lấy major_id từ bảng majors)
INSERT INTO major_subjects (major_id, subject_id)
SELECT m.id, s.id
FROM majors m, subjects s
WHERE m.maNganh = '8480201' AND s.maMon = 'CODE01';
```

### Cách 3: Sử dụng Laravel Tinker

```bash
php artisan tinker
```

```php
// Tạo môn học
$subject = new App\Models\Subject([
    'maMon' => 'TEST01',
    'tenMon' => 'Môn học test',
    'soTinChi' => 3,
    'moTa' => 'Mô tả môn học'
]);
$subject->save();

// Liên kết với ngành
$major = App\Models\Major::where('maNganh', '8480201')->first();
$major->subjects()->attach($subject->id);
```

---

## 🔍 Kiểm Tra Dữ Liệu

### Query số lượng
```bash
# Số môn học
php artisan tinker --execute="echo DB::table('subjects')->count();"

# Số liên kết
php artisan tinker --execute="echo DB::table('major_subjects')->count();"

# Ngành có nhiều môn học nhất
php artisan tinker --execute="
\$result = DB::table('majors as m')
    ->leftJoin('major_subjects as ms', 'm.id', '=', 'ms.major_id')
    ->select('m.tenNganh', DB::raw('COUNT(ms.id) as total'))
    ->groupBy('m.id', 'm.tenNganh')
    ->orderByDesc('total')
    ->limit(5)
    ->get();
print_r(\$result->toArray());
"
```

### Kiểm tra môn học của ngành
```php
$major = App\Models\Major::where('maNganh', '8480201')->with('subjects')->first();
echo "Ngành: {$major->tenNganh}\n";
echo "Số môn: " . $major->subjects->count() . "\n";
foreach ($major->subjects as $subject) {
    echo "- {$subject->maMon}: {$subject->tenMon} ({$subject->soTinChi} TC)\n";
}
```

---

## 📦 Backup và Restore

### Backup dữ liệu môn học
```bash
mysqldump -u root VMU subjects major_subjects > subjects_backup.sql
```

### Restore
```bash
mysql -u root VMU < subjects_backup.sql
```

---

## 🆘 Troubleshooting

### Lỗi: "Column not found: created_at"
**Giải pháp:** Bảng thiếu cột timestamps
```bash
cd /Applications/XAMPP/xamppfiles/VMU/backend
mysql -u root VMU << 'EOF'
ALTER TABLE major_subjects 
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
EOF
```

### Lỗi: Foreign key constraint
**Giải pháp:** Tạo lại bảng
```bash
php import_subjects_correct_api.php
# Script sẽ tự động tạo lại bảng nếu cần
```

### Import không thành công
**Kiểm tra:**
1. Database connection trong `.env`
2. Bảng `majors` đã có dữ liệu chưa
3. API endpoint có đúng không

---

## 📊 Thống Kê Hiện Tại

- ✅ **63 ngành** trong database
- ✅ **45 môn học** đã import (2 ngành mẫu)
- ✅ **45 liên kết** ngành-môn học
- ⏳ **61 ngành** còn lại cần import môn học

---

## 🎯 Kế Hoạch Tiếp Theo

### Để import đầy đủ môn học cho tất cả ngành:

**Option 1: Tìm API đúng**
- Liên hệ team backend để lấy endpoint chính xác
- Cập nhật vào `import_subjects_correct_api.php`
- Chạy lại script

**Option 2: Import thủ công**
- Lấy dữ liệu JSON từ frontend/Postman
- Parse và thêm vào function `importFromSampleData()`
- Chạy script cho từng ngành

**Option 3: Excel/CSV Import**
- Export dữ liệu ra Excel
- Tạo seeder từ Excel
- Import hàng loạt

---

## 💡 Tips

1. **Môn chung giữa các ngành:** Các môn như "Triết học", "Tiếng Anh" chỉ tạo 1 lần, sau đó attach vào nhiều ngành
2. **Backup thường xuyên:** Trước khi import hàng loạt
3. **Test với ít dữ liệu trước:** Import 1-2 ngành để test
4. **Sử dụng transactions:** Để rollback nếu có lỗi

---

## 📞 Hỗ Trợ

Nếu cần import thêm môn học:
1. Cung cấp dữ liệu JSON từ API
2. Hoặc cung cấp endpoint API chính xác
3. Hoặc danh sách môn học dạng Excel/CSV

**File quan trọng:**
- `/backend/import_subjects_correct_api.php` - Script chính
- `/backend/app/Models/Subject.php` - Model môn học
- `/backend/app/Models/MajorSubject.php` - Model liên kết
- `/backend/database/seeders/SubjectsSeeder.php` - Seeder
