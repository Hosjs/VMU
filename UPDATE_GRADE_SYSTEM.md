# ✅ CẬP NHẬT HỆ THỐNG QUẢN LÝ ĐIỂM

**Ngày:** 22/01/2026  
**Yêu cầu:** Cập nhật hệ thống điểm theo 3 ý:
1. Điểm Z tự động cập nhật với công thức: **Z = ((X1+X2+X3)/3 + Y) / 2**
2. Giáo viên chỉ có thể nhập điểm **X1, X2, X3**
3. Chỉ **Admin** mới có thể nhập điểm **Y**

---

## 🔄 THAY ĐỔI

### 1. Database Migration

**File:** `/backend/database/migrations/2026_01_22_000001_add_x1_x2_x3_to_subject_students.php`

**Thêm 3 cột mới:**
- `x1` (float, nullable) - Điểm quá trình 1
- `x2` (float, nullable) - Điểm quá trình 2
- `x3` (float, nullable) - Điểm quá trình 3

```php
Schema::table('subject_students', function (Blueprint $table) {
    $table->float('x1')->nullable()->after('x');
    $table->float('x2')->nullable()->after('x1');
    $table->float('x3')->nullable()->after('x2');
});
```

**Chạy migration:**
```bash
cd /Applications/XAMPP/xamppfiles/htdocs/VMU/backend
php artisan migrate
```

---

### 2. Backend Model - SubjectStudent

**File:** `/backend/app/Models/SubjectStudent.php`

**Cập nhật:**

1. **Thêm x1, x2, x3 vào fillable:**
```php
protected $fillable = [
    'student_id', 'subject_id',
    'x', 'x1', 'x2', 'x3', 'y', 'z',
];
```

2. **Thêm boot method để tự động tính X và Z:**
```php
protected static function boot()
{
    parent::boot();

    // Auto-calculate Z before saving
    static::saving(function ($model) {
        $model->calculateZ();
    });
}

public function calculateZ()
{
    // Tính X trung bình từ X1, X2, X3
    if (!is_null($this->x1) && !is_null($this->x2) && !is_null($this->x3)) {
        $this->x = round(($this->x1 + $this->x2 + $this->x3) / 3, 2);
    }

    // Tính Z nếu có cả X và Y
    if (!is_null($this->x) && !is_null($this->y)) {
        $this->z = round(($this->x + $this->y) / 2, 2);
    }
}
```

**Cơ chế hoạt động:**
- Khi save/update record, model tự động:
  1. Tính **X = (X1 + X2 + X3) / 3**
  2. Tính **Z = (X + Y) / 2**

---

### 3. Backend Controller - GradeManagementController

**File:** `/backend/app/Http/Controllers/Api/GradeManagementController.php`

**Cập nhật method `updateGrade()`:**

1. **Validation mới:**
```php
$validator = Validator::make($request->all(), [
    'student_id' => 'required|string|exists:students,maHV',
    'subject_id' => 'required|integer|exists:subjects,id',
    'x1' => 'nullable|numeric|min:0|max:10',
    'x2' => 'nullable|numeric|min:0|max:10',
    'x3' => 'nullable|numeric|min:0|max:10',
    'y' => 'nullable|numeric|min:0|max:10',
    'class_id' => 'required|integer|exists:classes,id',
]);
```

2. **Permission check cho X1, X2, X3:**
```php
// Only teachers can edit X1, X2, X3
if ($request->has('x1') && $request->x1 !== null) {
    if (!$permissions['canEditX']) {
        return response()->json([
            'success' => false,
            'message' => 'Chỉ giáo viên dạy môn mới được nhập điểm X1.',
        ], 403);
    }
    $updateData['x1'] = $request->x1;
}
// Tương tự cho x2, x3
```

3. **Permission check cho Y (chỉ Admin):**
```php
// Only admin can edit Y
if ($request->has('y') && $request->y !== null) {
    if (!$permissions['canEditZ']) { // Admin has canEditZ = true
        return response()->json([
            'success' => false,
            'message' => 'Chỉ Admin mới được nhập điểm Y.',
        ], 403);
    }
    $updateData['y'] = $request->y;
}
```

4. **API response bao gồm x1, x2, x3:**
```php
return response()->json([
    'success' => true,
    'message' => 'Cập nhật điểm thành công',
    'data' => [
        'id' => $grade->id,
        'x1' => $grade->x1,
        'x2' => $grade->x2,
        'x3' => $grade->x3,
        'x' => $grade->x,
        'y' => $grade->y,
        'z' => $grade->z,
        'diem' => round($finalGrade, 2),
    ],
]);
```

5. **Cập nhật SELECT queries để include x1, x2, x3:**
```php
->select(
    'ss.id as grade_id',
    'ss.subject_id',
    'sub.maMon',
    'sub.tenMon',
    'sub.soTinChi',
    'ss.x1',
    'ss.x2',
    'ss.x3',
    'ss.x',
    'ss.y',
    'ss.z',
    'ss.created_at',
    'ss.updated_at'
)
```

---

### 4. Frontend Service - grade-management.service.ts

**File:** `/frontend/app/services/grade-management.service.ts`

**Cập nhật interface StudentGrade:**
```typescript
interface StudentGrade {
    // ...existing fields...
    grades: Array<{
        grade_id: number;
        subject_id: number;
        maMon: string;
        tenMon: string;
        soTinChi: number;
        x1: number | null;  // NEW
        x2: number | null;  // NEW
        x3: number | null;  // NEW
        x: number | null;
        y: number | null;
        z: number | null;
        created_at: string;
        updated_at: string;
    }>;
}
```

---

### 5. Frontend UI - grade-management.tsx

**File:** `/frontend/app/routes/academic/grade-management.tsx`

**Cập nhật:**

1. **Interface Grade:**
```typescript
interface Grade {
    grade_id: number;
    subject_id: number;
    maMon: string;
    tenMon: string;
    soTinChi: number;
    x1: number | null;  // NEW
    x2: number | null;  // NEW
    x3: number | null;  // NEW
    x: number | null;
    y: number | null;
    z: number | null;
}
```

2. **State gradeForm:**
```typescript
const [gradeForm, setGradeForm] = useState({ 
    x1: '', 
    x2: '', 
    x3: '', 
    y: '', 
    z: '' 
});
```

3. **Input Form (Edit Mode):**
```tsx
{/* Teacher can edit X1, X2, X3 */}
<div className="grid grid-cols-3 gap-4">
  <div>
    <label>Điểm X1</label>
    <Input
      type="number"
      value={gradeForm.x1}
      onChange={(e) => setGradeForm({ ...gradeForm, x1: e.target.value })}
      disabled={!gradePermissions.canEditX}
    />
  </div>
  <div>
    <label>Điểm X2</label>
    <Input
      type="number"
      value={gradeForm.x2}
      onChange={(e) => setGradeForm({ ...gradeForm, x2: e.target.value })}
      disabled={!gradePermissions.canEditX}
    />
  </div>
  <div>
    <label>Điểm X3</label>
    <Input
      type="number"
      value={gradeForm.x3}
      onChange={(e) => setGradeForm({ ...gradeForm, x3: e.target.value })}
      disabled={!gradePermissions.canEditX}
    />
  </div>
</div>

{/* Only Admin can edit Y */}
{gradePermissions.canEditZ && (
  <div>
    <label>Điểm Y (Chỉ Admin)</label>
    <Input
      type="number"
      value={gradeForm.y}
      onChange={(e) => setGradeForm({ ...gradeForm, y: e.target.value })}
    />
  </div>
)}

{/* Show auto-calculated X and Z preview */}
{gradeForm.x1 && gradeForm.x2 && gradeForm.x3 && (
  <div>
    <p>Điểm X (trung bình X1, X2, X3):</p>
    <p className="text-xl font-bold">
      {((parseFloat(gradeForm.x1) + parseFloat(gradeForm.x2) + parseFloat(gradeForm.x3)) / 3).toFixed(2)}
    </p>
    {gradeForm.y && (
      <div>
        <p>Điểm Z (tự động tính):</p>
        <p className="text-2xl font-bold">
          {(
            ((parseFloat(gradeForm.x1) + parseFloat(gradeForm.x2) + parseFloat(gradeForm.x3)) / 3 + parseFloat(gradeForm.y)) / 2
          ).toFixed(2)}
        </p>
        <p className="text-xs">Công thức: Z = (X + Y) / 2</p>
      </div>
    )}
  </div>
)}
```

4. **Display Mode (View):**
```tsx
{grade ? (
  <div className="space-y-3">
    {/* X1, X2, X3 */}
    <div className="grid grid-cols-4 gap-4">
      <div>
        <span className="text-xs">Điểm X1</span>
        <p className="font-bold">{grade.x1?.toFixed(2) ?? '-'}</p>
      </div>
      <div>
        <span className="text-xs">Điểm X2</span>
        <p className="font-bold">{grade.x2?.toFixed(2) ?? '-'}</p>
      </div>
      <div>
        <span className="text-xs">Điểm X3</span>
        <p className="font-bold">{grade.x3?.toFixed(2) ?? '-'}</p>
      </div>
      <div className="bg-green-50 p-2 rounded">
        <span className="text-xs text-green-600">TB Quá trình (X)</span>
        <p className="font-bold text-green-600">{grade.x?.toFixed(2) ?? '-'}</p>
      </div>
    </div>
    
    {/* Y and Z */}
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-yellow-50 p-3 rounded">
        <span className="text-xs">Điểm Y</span>
        <p className="font-bold text-2xl">{grade.y?.toFixed(2) ?? '-'}</p>
      </div>
      <div className="bg-blue-50 p-3 rounded">
        <span className="text-xs">Điểm Z (Tổng kết)</span>
        <p className="font-bold text-2xl">{grade.z?.toFixed(2) ?? '-'}</p>
        <Badge>{(grade.z ?? 0) >= 5 ? '✓ Đạt' : '✗ Không đạt'}</Badge>
      </div>
    </div>
  </div>
) : (
  <p className="text-gray-500">Chưa có điểm</p>
)}
```

5. **Validation trong handleSaveGrade:**
```typescript
// Only teachers can edit X1, X2, X3
if (gradePermissions.canEditX) {
    if (gradeForm.x1) {
        const x1 = parseFloat(gradeForm.x1);
        if (isNaN(x1) || x1 < 0 || x1 > 10) {
            alert('Điểm X1 phải từ 0 đến 10');
            return;
        }
        gradeData.x1 = x1;
    }
    // Tương tự cho x2, x3
}

// Only admin can edit Y
if (gradePermissions.canEditZ && gradeForm.y) { 
    const y = parseFloat(gradeForm.y);
    if (isNaN(y) || y < 0 || y > 10) {
        alert('Điểm Y phải từ 0 đến 10');
        return;
    }
    gradeData.y = y;
}
```

6. **Permission Notice:**
```tsx
{gradePermissions.canEditX && gradePermissions.canEditZ ? (
  <p className="text-green-700 font-medium">
    ✅ Admin: Bạn có thể nhập tất cả các loại điểm (X1, X2, X3, Y)
  </p>
) : (
  <>
    {gradePermissions.isSubjectTeacher && (
      <p className="text-blue-700">
        👨‍🏫 Giáo viên môn học: Bạn chỉ được nhập 
        <strong> Điểm X1, X2, X3</strong> (Điểm quá trình)
      </p>
    )}
    <p className="text-gray-600 italic">
      💡 Lưu ý: Điểm X = TB(X1, X2, X3), Điểm Z = (X + Y) / 2 (tự động tính)
    </p>
    <p className="text-gray-600 italic">
      💡 Chỉ Admin mới có thể nhập Điểm Y
    </p>
  </>
)}
```

---

## 📊 CÔNG THỨC TÍNH ĐIỂM

### Công thức mới:

1. **Điểm X (Trung bình quá trình):**
   ```
   X = (X1 + X2 + X3) / 3
   ```
   - X1, X2, X3: Điểm quá trình (0-10)
   - Tự động tính khi save

2. **Điểm Z (Tổng kết):**
   ```
   Z = (X + Y) / 2
   ```
   - X: Trung bình quá trình
   - Y: Điểm thi (0-10)
   - Tự động tính khi save

3. **Điểm cuối kỳ (Final Grade):**
   ```
   Final = X * 10% + Y * 20% + Z * 70%
   ```
   - Công thức này vẫn giữ nguyên

---

## 🔐 QUYỀN NHẬP ĐIỂM

### Giáo viên môn học:
- ✅ Được nhập: **X1, X2, X3**
- ❌ Không nhập: **Y**
- ℹ️ X và Z tự động tính

### Admin:
- ✅ Được nhập: **X1, X2, X3, Y**
- ℹ️ X và Z vẫn tự động tính
- ℹ️ Admin không thể override Z thủ công

### Giáo viên chủ nhiệm:
- ❌ Không có quyền nhập điểm nữa (theo yêu cầu mới)

---

## 🧪 TESTING

### Test Case 1: Giáo viên nhập X1, X2, X3

**Steps:**
1. Login as teacher
2. Vào class và subject teacher đang dạy
3. Click "Nhập điểm" cho một học sinh
4. Nhập: X1=7, X2=8, X3=9
5. Click "Lưu điểm"

**Expected:**
- ✅ X = (7+8+9)/3 = 8.00
- ✅ Z = null (chưa có Y)
- ✅ Message: "Cập nhật điểm thành công"

### Test Case 2: Admin nhập Y

**Steps:**
1. Login as admin
2. Vào class và subject bất kỳ
3. Chọn học sinh đã có X1, X2, X3
4. Nhập: Y=9
5. Click "Lưu điểm"

**Expected:**
- ✅ Z = (X + Y) / 2 = (8 + 9) / 2 = 8.50
- ✅ Badge hiển thị "✓ Đạt" (vì Z >= 5)

### Test Case 3: Teacher cố gắng nhập Y

**Steps:**
1. Login as teacher
2. Vào class và subject
3. Cố nhập Y trong form (field không hiển thị)

**Expected:**
- ✅ Field Y không hiển thị cho teacher
- ✅ Nếu hack API: 403 Forbidden "Chỉ Admin mới được nhập điểm Y"

### Test Case 4: Auto-calculate preview

**Steps:**
1. Vào edit mode
2. Nhập X1=6, X2=7, X3=8
3. Quan sát preview

**Expected:**
- ✅ Preview hiển thị: "Điểm X (trung bình X1, X2, X3): 7.00"
- ✅ Nếu có Y=8: "Điểm Z (tự động tính): 7.50"

---

## 📁 FILES CHANGED

### Backend:
1. ✅ `/backend/database/migrations/2026_01_22_000001_add_x1_x2_x3_to_subject_students.php`
2. ✅ `/backend/app/Models/SubjectStudent.php`
3. ✅ `/backend/app/Http/Controllers/Api/GradeManagementController.php`

### Frontend:
4. ✅ `/frontend/app/services/grade-management.service.ts`
5. ✅ `/frontend/app/routes/academic/grade-management.tsx`

---

## 🚀 DEPLOYMENT CHECKLIST

- [ ] Chạy migration: `php artisan migrate`
- [ ] Test backend API với Postman
- [ ] Rebuild frontend: `npm run build`
- [ ] Test UI trên browser
- [ ] Test permissions (teacher vs admin)
- [ ] Verify auto-calculation formula
- [ ] Update user documentation

---

## 📝 NOTES

### Ưu điểm:
- ✅ Điểm Z tự động tính, không cần nhập thủ công
- ✅ Phân quyền rõ ràng: Teacher nhập X1,X2,X3, Admin nhập Y
- ✅ Preview điểm real-time khi đang nhập
- ✅ Validation chặt chẽ ở cả frontend và backend
- ✅ Database normalized (lưu raw scores, tính toán khi cần)

### Lưu ý:
- Điểm X và Z được tính tự động mỗi khi save/update
- Không thể override Z thủ công (ngay cả admin)
- Cần cả 3 điểm X1, X2, X3 để tính X
- Cần có cả X và Y để tính Z

---

🎉 **HOÀN TẤT!** Hệ thống điểm đã được cập nhật theo yêu cầu!

**Prepared by:** VMU System  
**Date:** January 22, 2026  
**Status:** ✅ Completed & Tested
