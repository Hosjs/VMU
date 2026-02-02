# 📚 Hướng dẫn Hệ thống Quản lý Điểm - VMU Training

**Ngày tạo:** 02/02/2026  
**Phiên bản:** 2.0

---

## 📑 Mục lục

1. [Tổng quan hệ thống](#tổng-quan-hệ-thống)
2. [Cấu trúc Database](#cấu-trúc-database)
3. [API Routes](#api-routes)
4. [Frontend Component](#frontend-component)
5. [Luồng hoạt động](#luồng-hoạt động)
6. [Các lỗi thường gặp](#các-lỗi-thường-gặp)
7. [Best Practices](#best-practices)

---

## 🎯 Tổng quan hệ thống

Hệ thống Quản lý Điểm cho phép giảng viên và quản trị viên:
- Xem danh sách học viên theo lớp và môn học
- Nhập và cập nhật điểm (X1, X2, X3, Y, Z)
- Tự động tính toán điểm trung bình
- Quản lý quyền truy cập (giảng viên môn học, GVCN, admin)

### Tech Stack:
- **Backend:** Laravel 10 (PHP 8.1+)
- **Frontend:** React + TypeScript + React Router v6
- **Database:** MySQL 8.0
- **Authentication:** Laravel Passport (OAuth 2.0)

---

## 🗄️ Cấu trúc Database

### Bảng chính

#### 1. `majors` - Ngành học
```sql
majors:
  - id (PK)              : 4
  - maNganh              : "8480201"
  - tenNganh             : "Công nghệ thông tin"
  - deleted_in           : timestamp
```

#### 2. `classes` - Lớp học
```sql
classes:
  - id (PK)              : 106
  - class_name           : "CNTT 2025.1.1"
  - major_id             : 8480201 (giá trị của maNganh!)
  - khoaHoc_id           : 10
  - trangThai            : "DangHoc"
  - homeroomTeacherId    : null
  - deleted_at           : timestamp
```

**⚠️ Quan trọng:** `classes.major_id` lưu **GIÁ TRỊ** của `majors.maNganh`, không phải `majors.id`!

#### 3. `students` - Học viên
```sql
students:
  - maHV (PK)            : "CN2211001"
  - hoDem                : "Nguyễn Văn"
  - ten                  : "A"
  - ngaySinh             : "2000-01-01"
  - gioiTinh             : "Nam"
  - email                : "a@example.com"
  - dienThoai            : "0123456789"
  - idLop                : 106
  - trangThai            : "DangHoc"
  - deleted_at           : timestamp
```

#### 4. `subjects` - Môn học
```sql
subjects:
  - id (PK)              : 20
  - maMon                : "CNTT05"
  - tenMon               : "An toàn và bảo mật thông tin"
  - soTinChi             : 3
  - deleted_at           : timestamp
```

#### 5. `major_subjects` - Môn học theo ngành
```sql
major_subjects:
  - id (PK)              : 123
  - major_id             : 4 (majors.id - FK!)
  - subject_id           : 20 (subjects.id - FK)
  - hocKy                : 1
  - batBuoc              : true
  - deleted_at           : timestamp
```

#### 6. `subject_enrollments` - Đăng ký môn học
```sql
subject_enrollments:
  - id (PK)              : 1
  - maHV                 : "CN2211001" (students.maHV - FK)
  - subject_id           : 20 (subjects.id - FK)
  - major_id             : 4 (majors.id - FK!)
  - namHoc               : 2025
  - hocKy                : 1
  - trangThai            : "DangHoc"
  - deleted_at           : timestamp (soft delete)
```

**⚠️ Quan trọng:** `subject_enrollments.major_id` tham chiếu đến `majors.id`, **KHÔNG PHẢI** giá trị maNganh!

#### 7. `subject_students` - Điểm số
```sql
subject_students:
  - id (PK)              : 1
  - student_id           : "CN2211001" (students.maHV - FK)
  - subject_id           : 20 (subjects.id - FK)
  - x1, x2, x3           : float (điểm thành phần)
  - x                    : float (trung bình x1, x2, x3)
  - y                    : float (điểm giữa kỳ)
  - z                    : float (điểm cuối kỳ)
  - created_at, updated_at
```

**⚠️ Lưu ý:** Bảng này **KHÔNG CÓ** `major_id`, `namHoc`, `hocKy`, `deleted_at`!

---

## 🔗 Quan hệ giữa các bảng

### Luồng JOIN phức tạp:

```
┌─────────────────────────────────────────────────────────────┐
│                    GRADE MANAGEMENT FLOW                     │
└─────────────────────────────────────────────────────────────┘

1. User chọn Ngành (maNganh = "8480201")
                    ↓
2. Lấy danh sách Classes
   classes.major_id = 8480201 (giá trị maNganh)
        JOIN với
   majors.maNganh = "8480201"
        Lấy được
   majors.id = 4 (major_numeric_id)
                    ↓
3. User chọn Class (id = 106)
   Có: major_id = 8480201, major_numeric_id = 4
                    ↓
4. Lấy danh sách Subjects cho ngành
   major_subjects.major_id = 4 (majors.id)
                    ↓
5. User chọn Subject (id = 20)
                    ↓
6. Lấy danh sách Students đã đăng ký
   subject_enrollments.subject_id = 20
   subject_enrollments.major_id = 4 (dùng major_numeric_id!)
                    ↓
7. Lấy điểm của từng student
   subject_students.student_id = students.maHV
   subject_students.subject_id = 20
```

---

## 🛣️ API Routes

### Backend: `/backend/routes/api.php`

#### 1. Grade Management Routes (Line ~225-235)

```php
Route::prefix('grade-management')->group(function () {
    // Lấy tất cả classes với thông tin ngành
    Route::get('/all-classes', [GradeManagementController::class, 'getAllClassesWithInfo']);
    
    // Lấy danh sách ngành và năm học có classes
    Route::get('/majors', [GradeManagementController::class, 'getMajorsWithYears']);
    
    // Lấy classes theo ngành và năm
    Route::get('/classes', [GradeManagementController::class, 'getClassesByMajorAndYear']);
    
    // Lấy students và grades của một class
    Route::get('/classes/{classId}/students', [GradeManagementController::class, 'getStudentsWithGrades']);
    
    // Lấy subjects của một class
    Route::get('/classes/{classId}/subjects', [GradeManagementController::class, 'getClassSubjects']);
    
    // Nhập/cập nhật điểm đơn
    Route::post('/grades', [GradeManagementController::class, 'updateGrade']);
    
    // Nhập/cập nhật điểm hàng loạt
    Route::post('/grades/bulk', [GradeManagementController::class, 'bulkUpdateGrades']);
});
```

#### 2. Academic Years Routes (Line ~46-49)

```php
// Quản lý kỳ học
Route::get('/academic-years', [AcademicYearController::class, 'index']);
Route::get('/academic-years/active', [AcademicYearController::class, 'getActiveYears']);
Route::post('/academic-years', [AcademicYearController::class, 'store']);
Route::delete('/academic-years/{id}', [AcademicYearController::class, 'destroy']);
```

#### 3. Subjects Routes (Line ~69-83)

```php
Route::prefix('subjects')->group(function () {
    Route::get('/', [SubjectController::class, 'index']);
    Route::get('/by-major', [SubjectController::class, 'getSubjectsByMajorAndYear']);
    Route::get('/{subjectId}/students', [SubjectController::class, 'getEnrolledStudents']);
    Route::get('/available-students', [SubjectController::class, 'getAvailableStudents']);
    Route::post('/', [SubjectController::class, 'store']);
    Route::put('/{id}', [SubjectController::class, 'update']);
    Route::delete('/{id}', [SubjectController::class, 'destroy']);
    Route::post('/enroll', [SubjectController::class, 'enrollStudent']);
    Route::post('/bulk-enroll', [SubjectController::class, 'bulkEnrollStudents']);
    Route::delete('/unenroll/{enrollmentId}', [SubjectController::class, 'unenrollStudent']);
    Route::post('/bulk-unenroll', [SubjectController::class, 'bulkUnenrollStudents']);
});
```

---

## ⚛️ Frontend Component

### File: `/frontend/app/routes/academic/grade-management.tsx`

#### Component Structure:

```typescript
export default function GradeManagementPage() {
  // ============ STATE MANAGEMENT ============
  const [majors, setMajors] = useState<Major[]>([]);
  const [selectedMajorId, setSelectedMajorId] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [students, setStudents] = useState<StudentWithGrades[]>([]);
  const [grades, setGrades] = useState<GradeInput[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ============ DATA LOADING ============
  useEffect(() => {
    loadMajors(); // Load danh sách ngành
  }, []);

  useEffect(() => {
    if (majorId && classId && subjectId) {
      loadSubjectById(subjectId); // Load students và grades
    }
  }, [majorId, classId, subjectId]);

  // ============ CORE FUNCTIONS ============
  const loadMajors = async () => {
    // Gọi API: GET /grade-management/majors
    // Response: [{id, maNganh, tenNganh, years[], classCount}]
  };

  const loadClasses = async (majorId: string, year: string) => {
    // Gọi API: GET /grade-management/classes?major_id={majorId}&year={year}
    // Response: [{id, tenLop, khoaHoc, studentCount}]
  };

  const loadSubjects = async (classId: number) => {
    // Gọi API: GET /grade-management/classes/{classId}/subjects
    // Response: [{id, maMon, tenMon, soTinChi}]
  };

  const loadStudentGrades = async (classId: number, subjectId: number) => {
    // Gọi API: GET /grade-management/classes/{classId}/students?subject_id={subjectId}
    // Response: {students: [{maHV, hoTen, grades: {...}}]}
  };

  const handleSaveGrades = async () => {
    // Gọi API: POST /grade-management/grades/bulk
    // Body: {grades: [{student_id, subject_id, x1, x2, x3, y, z}]}
  };

  // ============ RENDER ============
  return (
    <div>
      {/* 1. Header */}
      {/* 2. Major & Year Selection */}
      {/* 3. Class Selection */}
      {/* 4. Subject Selection */}
      {/* 5. Student Grades Table */}
      {/* 6. Save Button */}
    </div>
  );
}
```

#### UI Workflow:

```
┌──────────────────────────────────────────────────────────────┐
│  🎓 Quản lý điểm                                              │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Chọn Ngành: [Công nghệ thông tin ▼]  Năm học: [2025 ▼]    │
│                                                               │
│  Lớp học:                                                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 📚 CNTT 2025.1.1  (25 học viên)                     │    │
│  │ 📚 CNTT 2025.1.2  (30 học viên)                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  Môn học:                                                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 📖 An toàn và bảo mật thông tin (3 TC)             │    │
│  │ 📖 Lập trình web (3 TC)                             │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  Danh sách học viên:                                          │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ STT│ Mã HV     │ Họ tên      │X1│X2│X3│ Y│ Z│ Điểm      ││
│  ├────┼───────────┼─────────────┼──┼──┼──┼──┼──┼───────────┤│
│  │  1 │CN2211001  │Nguyễn Văn A │8 │9 │8 │8 │9 │ 8.6  ✏️  ││
│  │  2 │CN2211002  │Trần Thị B   │7 │8 │7 │8 │8 │ 7.8  ✏️  ││
│  └──────────────────────────────────────────────────────────┘│
│                                                               │
│                                      [💾 Lưu điểm]           │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔄 Luồng hoạt động chi tiết

### 1. Khởi tạo trang (Page Load)

```typescript
// Step 1: Load majors
GET /api/grade-management/majors
→ Response: [
  {
    id: "8480201",
    maNganh: "8480201",
    tenNganh: "Công nghệ thông tin",
    years: [2025, 2024, 2023],
    classCount: 5
  }
]

// Frontend updates:
- Populate major dropdown
- Set first major as selected (if exists)
```

### 2. User chọn Ngành và Năm học

```typescript
// User selects: Ngành = "8480201", Năm = 2025

// Step 2: Load classes
GET /api/grade-management/classes?major_id=8480201&year=2025
→ Response: [
  {
    id: 106,
    tenLop: "CNTT 2025.1.1",
    khoaHoc: "2025",
    studentCount: 25
  }
]

// Frontend updates:
- Display class cards
- Clear selected class, subject, students
```

### 3. User chọn Lớp

```typescript
// User clicks: CNTT 2025.1.1 (id=106)

// Step 3: Load subjects for this class
GET /api/grade-management/classes/106/subjects
→ Response: [
  {
    id: 20,
    maMon: "CNTT05",
    tenMon: "An toàn và bảo mật thông tin",
    soTinChi: 3
  }
]

// Frontend updates:
- Navigate to: /academic/grades/8480201/106
- Display subject list
- Clear selected subject, students
```

### 4. User chọn Môn học

```typescript
// User clicks: An toàn và bảo mật (id=20)

// Step 4: Load students and their grades
GET /api/grade-management/classes/106/students?subject_id=20
→ Response: {
  class: { id: 106, tenLop: "CNTT 2025.1.1", ... },
  gradePermissions: {
    canEditX: true,
    canEditY: true,
    canEditZ: true,
    isSubjectTeacher: false,
    isHomeroomTeacher: false
  },
  students: [
    {
      maHV: "CN2211001",
      hoTen: "Nguyễn Văn A",
      grades: [
        {
          grade_id: 1,
          subject_id: 20,
          maMon: "CNTT05",
          tenMon: "An toàn và bảo mật thông tin",
          x1: 8.0,
          x2: 9.0,
          x3: 8.0,
          x: 8.3,
          y: 8.0,
          z: 9.0
        }
      ]
    }
  ],
  subjects: [...]
}

// Frontend updates:
- Navigate to: /academic/grades/8480201/106/20
- Display student grades table
- Initialize grades state
```

### 5. Backend Query Logic (Critical!)

```php
// File: GradeManagementController.php
// Method: getStudentsWithGrades($classId, $subjectId)

// Step 1: Get class info WITH major_numeric_id
$class = DB::table('classes as c')
    ->leftJoin('majors as m', function($join) {
        // ⚠️ IMPORTANT: classes.major_id stores maNganh VALUE
        $join->on(DB::raw('CAST(c.major_id AS CHAR)'), '=', 'm.maNganh');
    })
    ->where('c.id', $classId)
    ->select(
        'c.*',
        'c.major_id',              // = 8480201 (maNganh value)
        'm.id as major_numeric_id' // = 4 (majors.id) ← USE THIS!
    )
    ->first();

// Step 2: Get enrolled students
$students = DB::table('subject_enrollments as se')
    ->join('students as s', 'se.maHV', '=', 's.maHV')
    ->where('se.subject_id', $subjectId)
    ->where('se.major_id', $class->major_numeric_id) // ← USE major_numeric_id!
    //                      ^^^^^^^^^^^^^^^^^^^^^^
    //                      NOT $class->major_id (8480201)!
    //                      USE majors.id (4)!
    ->whereNull('se.deleted_at')
    ->whereNull('s.deleted_at')
    ->select('s.maHV', 's.hoDem', 's.ten', ...)
    ->get();

// Step 3: Get grades for each student
foreach ($students as $student) {
    $student->grades = DB::table('subject_students as ss')
        ->where('ss.student_id', $student->maHV)
        ->where('ss.subject_id', $subjectId)
        ->select('ss.x1', 'ss.x2', 'ss.x3', 'ss.x', 'ss.y', 'ss.z')
        ->get();
}
```

### 6. User nhập/sửa điểm

```typescript
// User edits grade in table cell
const handleGradeChange = (studentId: string, field: string, value: number) => {
  setGrades(prevGrades => {
    const existing = prevGrades.find(g => g.student_id === studentId);
    if (existing) {
      return prevGrades.map(g =>
        g.student_id === studentId
          ? { ...g, [field]: value }
          : g
      );
    }
    return [...prevGrades, { student_id: studentId, [field]: value }];
  });
};

// Auto-calculate averages
// X = (X1 + X2 + X3) / 3
// Z = (X + Y) / 2
```

### 7. User lưu điểm

```typescript
// User clicks: Save button
const handleSaveGrades = async () => {
  // Validate grades
  const validGrades = grades.filter(g => 
    Object.keys(g).length > 1 // Has at least one grade field
  );

  // Call API
  await gradeManagementService.bulkUpdateGrades({
    class_id: classId,
    subject_id: subjectId,
    grades: validGrades.map(g => ({
      student_id: g.student_id,
      subject_id: subjectId,
      x1: g.x1,
      x2: g.x2,
      x3: g.x3,
      y: g.y,
      z: g.z
    }))
  });

  // Reload data
  await loadStudentGrades(classId, subjectId);
};
```

---

## ⚠️ Các lỗi thường gặp

### 1. ❌ Empty students array despite data exists

**Nguyên nhân:**
```php
// SAI - Dùng classes.major_id (8480201)
->where('se.major_id', $class->major_id)

// ĐÚNG - Dùng majors.id (4)
->where('se.major_id', $class->major_numeric_id)
```

**Giải pháp:** Luôn sử dụng `major_numeric_id` khi JOIN với các bảng tham chiếu `majors.id`!

### 2. ❌ Column not found: 'ss.major_id'

**Nguyên nhân:** Bảng `subject_students` KHÔNG CÓ field `major_id`

**Giải pháp:** Query từ `subject_enrollments` để lấy danh sách students, sau đó LEFT JOIN `subject_students` để lấy điểm.

### 3. ❌ Column not found: 'ss.deleted_at'

**Nguyên nhân:** Bảng `subject_students` KHÔNG CÓ soft delete

**Giải pháp:** Chỉ check `deleted_at` ở `subject_enrollments` và `students`.

### 4. ❌ Infinite re-renders in frontend

**Nguyên nhân:** `params` object được tạo mới mỗi lần render

**Giải pháp:**
```typescript
// SAI
const params = { majorId, classId, subjectId };

// ĐÚNG
const params = useMemo(() => ({
  majorId, classId, subjectId
}), [majorId, classId, subjectId]);
```

### 5. ❌ Subjects list empty

**Nguyên nhân:** Query sử dụng sai `major_id`

**Giải pháp:**
```php
// Query major_subjects
->where('ms.major_id', $class->major_numeric_id) // Dùng majors.id!
```

---

## 💡 Best Practices

### 1. Database Queries

```php
// ✅ DO: Luôn phân biệt 2 loại major_id
$class->major_id          // = 8480201 (maNganh value) - Dùng cho display
$class->major_numeric_id  // = 4 (majors.id) - Dùng cho queries!

// ✅ DO: Check nullable before use
if ($class && $class->major_numeric_id) {
    // Safe to use
}

// ✅ DO: Use proper field names
subject_enrollments.maHV     // Student field in enrollments
subject_students.student_id  // Student field in grades

// ❌ DON'T: Mix up these values!
```

### 2. Frontend State Management

```typescript
// ✅ DO: Use useMemo for computed values
const params = useMemo(() => ({
  majorId, classId, subjectId
}), [majorId, classId, subjectId]);

// ✅ DO: Clear dependent state when parent changes
useEffect(() => {
  setClasses([]);
  setSelectedClass(null);
  setSubjects([]);
  setSelectedSubject(null);
}, [selectedMajorId, selectedYear]);

// ❌ DON'T: Keep stale data
```

### 3. Grade Calculations

```typescript
// ✅ DO: Auto-calculate on input change
const calculateAverages = (grades: GradeInput) => {
  const x = (grades.x1 + grades.x2 + grades.x3) / 3;
  const z = (x + grades.y) / 2;
  return { ...grades, x, z };
};

// ✅ DO: Validate ranges (0-10)
const validateGrade = (value: number) => {
  return value >= 0 && value <= 10;
};
```

### 4. Error Handling

```typescript
// ✅ DO: Show user-friendly error messages
try {
  await loadData();
} catch (error) {
  if (error.message.includes('Column not found')) {
    alert('Lỗi cấu trúc dữ liệu. Vui lòng liên hệ admin.');
  } else {
    alert('Lỗi: ' + error.message);
  }
}

// ✅ DO: Log for debugging
console.error('Error loading students:', error);
```

---

## 🔍 Debugging Checklist

Khi gặp lỗi "students empty", kiểm tra:

- [ ] `subject_enrollments` có data cho `subject_id` này không?
- [ ] `major_id` trong query có đúng là `majors.id` (4) không phải maNganh (8480201)?
- [ ] `deleted_at` có null không?
- [ ] JOIN condition có đúng field name không? (`maHV` vs `student_id`)
- [ ] Frontend có gửi đúng `classId` và `subjectId` không?
- [ ] Backend có return đúng format JSON không?

---

## 📊 Performance Tips

### Backend:
```php
// ✅ Use indexes
- students.maHV (PK)
- subject_enrollments.subject_id, major_id, maHV
- subject_students.student_id, subject_id

// ✅ Use select() to limit columns
->select('s.maHV', 's.hoDem', 's.ten') // Only needed fields

// ✅ Use pagination for large datasets
->paginate(50)
```

### Frontend:
```typescript
// ✅ Debounce input changes
const debouncedSave = useMemo(
  () => debounce(saveGrades, 500),
  []
);

// ✅ Lazy load data
const loadMore = () => {
  setPage(prev => prev + 1);
};

// ✅ Memoize expensive calculations
const totalStudents = useMemo(
  () => students.length,
  [students]
);
```

---

## 🎯 Quick Reference

### Major ID Values:

| Context | Value | Usage |
|---------|-------|-------|
| `classes.major_id` | 8480201 | Display mã ngành |
| `majors.maNganh` | "8480201" | Unique code |
| `majors.id` | 4 | Database FK |
| `$class->major_numeric_id` | 4 | Query với FK tables |

### Common API Calls:

```bash
# Get majors
GET /api/grade-management/majors

# Get classes
GET /api/grade-management/classes?major_id=8480201&year=2025

# Get subjects
GET /api/grade-management/classes/106/subjects

# Get students with grades
GET /api/grade-management/classes/106/students?subject_id=20

# Save grades
POST /api/grade-management/grades/bulk
Body: {"grades": [...]}
```

---

## 📝 Summary

### Key Points:
1. ✅ Có 3 bảng chính: `students`, `subjects`, `subject_enrollments`
2. ✅ `subject_enrollments` chứa enrollment data (có `major_id`, `namHoc`, `hocKy`)
3. ✅ `subject_students` chỉ chứa grades (không có `major_id`, `deleted_at`)
4. ✅ `classes.major_id` = maNganh value (8480201)
5. ✅ `subject_enrollments.major_id` = majors.id (4)
6. ✅ Luôn dùng `major_numeric_id` khi query với FK tables!

### Most Common Mistake:
```php
// ❌ WRONG
->where('se.major_id', $class->major_id) // 8480201

// ✅ CORRECT  
->where('se.major_id', $class->major_numeric_id) // 4
```

---

**Người viết:** GitHub Copilot  
**Ngày cập nhật:** 02/02/2026  
**Phiên bản:** 2.0 - Fixed major_id mismatch issue

**Status:** ✅ Hệ thống hoạt động ổn định sau khi fix major_numeric_id

---

## 📞 Support

Nếu gặp vấn đề, check:
1. Laravel logs: `backend/storage/logs/laravel.log`
2. Browser console (F12)
3. Network tab để xem API responses
4. Database với query tools

**Good luck! 🚀**
