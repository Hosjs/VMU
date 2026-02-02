<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SubjectStudent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class GradeManagementController extends Controller
{
    /**
     * Get list of majors (ngành học) with year options
     */
    public function getMajorsWithYears()
    {
        try {
            // Lấy danh sách ngành từ bảng majors
            $majors = DB::table('majors as m')
                ->whereNull('m.deleted_in')
                ->select(
                    'm.id',
                    'm.maNganh',
                    'm.tenNganh'
                )
                ->get()
                ->map(function ($major) {
                    // ✅ FIX: classes.major_id stores maNganh (as number), not majors.id
                    $years = [];

                    try {
                        // Lấy các khoaHoc_id từ bảng classes where major_id matches maNganh
                        $years = DB::table('classes')
                            ->whereRaw('CAST(major_id AS CHAR) = ?', [$major->maNganh])
                            ->whereNotNull('khoaHoc_id')
                            ->whereNull('deleted_at')
                            ->distinct()
                            ->pluck('khoaHoc_id')
                            ->map(function ($year) {
                                return (int) $year;
                            })
                            ->unique()
                            ->sort()
                            ->values()
                            ->toArray();

                        // Sort descending
                        rsort($years);
                    } catch (\Exception $e) {
                        \Log::error('Error getting years for major ' . $major->maNganh . ': ' . $e->getMessage());
                    }

                    // Nếu không có years từ bảng classes, tạo danh sách năm mặc định
                    if (empty($years)) {
                        $currentYear = (int) date('Y');
                        $years = range($currentYear, $currentYear - 5); // Last 6 years
                        \Log::info('Using default years for major ' . $major->maNganh, [
                            'years' => $years
                        ]);
                    }

                    return [
                        'id' => $major->id,
                        'maNganh' => $major->maNganh,
                        'tenNganh' => $major->tenNganh,
                        'years' => $years,
                    ];
                })
                ->values();

            return response()->json([
                'success' => true,
                'data' => $majors,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching majors with years: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy danh sách ngành',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get all classes with full information (major name, student count)
     */
    public function getAllClassesWithInfo()
    {
        try {
            \Log::info('getAllClassesWithInfo called');

            // ✅ FIX: classes.major_id stores maNganh code (as number), not majors.id
            // So we need to join c.major_id with m.maNganh (converting types)
            $classes = DB::table('classes as c')
                ->leftJoin('majors as m', function($join) {
                    $join->on(DB::raw('CAST(c.major_id AS CHAR)'), '=', 'm.maNganh');
                })
                ->whereNull('c.deleted_at')
                ->whereNull('m.deleted_in')
                ->select(
                    'c.id',
                    'c.class_name as tenLop',
                    'c.khoaHoc_id as khoaHoc',
                    'c.trangThai',
                    'c.major_id',
                    'm.id as major_db_id',
                    'm.tenNganh',
                    'm.maNganh',
                    DB::raw('(SELECT COUNT(*) FROM students WHERE idLop = c.id AND deleted_at IS NULL) as studentCount')
                )
                ->orderBy('c.khoaHoc_id', 'desc')
                ->orderBy('c.class_name')
                ->get();

            \Log::info('All classes loaded', [
                'count' => $classes->count(),
                'with_major' => $classes->whereNotNull('tenNganh')->count(),
                'without_major' => $classes->whereNull('tenNganh')->count(),
            ]);

            return response()->json([
                'success' => true,
                'data' => $classes,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching all classes: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy danh sách lớp',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get classes by major and year
     */
    public function getClassesByMajorAndYear(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'maNganh' => 'required|string',
            'khoaHoc' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            \Log::info('getClassesByMajorAndYear called', [
                'maNganh' => $request->maNganh,
                'khoaHoc' => $request->khoaHoc,
            ]);

            // ✅ FIX: classes.major_id stores maNganh code, so join with m.maNganh
            $classes = DB::table('classes as c')
                ->join('majors as m', function($join) {
                    $join->on(DB::raw('CAST(c.major_id AS CHAR)'), '=', 'm.maNganh');
                })
                ->where('m.maNganh', $request->maNganh)
                ->where('c.khoaHoc_id', $request->khoaHoc)
                ->whereNull('m.deleted_in')
                ->whereNull('c.deleted_at')
                ->select(
                    'c.id',
                    'c.class_name as tenLop',
                    'c.khoaHoc_id as khoaHoc',
                    'c.trangThai',
                    'm.tenNganh',
                    'm.maNganh',
                    DB::raw('(SELECT COUNT(*) FROM students WHERE idLop = c.id AND deleted_at IS NULL) as studentCount')
                )
                ->orderBy('c.class_name')
                ->get();

            \Log::info('Classes found', [
                'count' => $classes->count(),
            ]);

            return response()->json([
                'success' => true,
                'data' => $classes,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching classes: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy danh sách lớp',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get students in a class with their grades
     */
    public function getStudentsWithGrades($classId, Request $request)
    {
        try {
            // Get subject filter if provided
            $subjectId = $request->query('subject_id');

            // Get class info with major - ✅ FIX: classes.major_id stores maNganh, not majors.id
            $class = DB::table('classes as c')
                ->leftJoin('majors as m', function($join) {
                    $join->on(DB::raw('CAST(c.major_id AS CHAR)'), '=', 'm.maNganh');
                })
                ->where('c.id', $classId)
                ->whereNull('m.deleted_in')
                ->whereNull('c.deleted_at')
                ->select(
                    'c.*',
                    'c.class_name as tenLop',
                    'c.major_id',
                    'c.lecurer_id as homeroomTeacherId',
                    'm.tenNganh',
                    'm.maNganh',
                    'm.id as major_numeric_id'
                )
                ->first();

            if (!$class) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy lớp',
                ], 404);
            }

            // ✅ Check user permissions for grade entry
            $user = auth('api')->user();
            $gradePermissions = $this->getGradePermissions($user, $class, $subjectId);

            if ($subjectId) {
                // ✅ FIX: Query from subject_enrollments (enrollment/registration data)
                // subject_enrollments.major_id = majors.id (e.g., 4)
                // NOT classes.major_id (e.g., 8480201)
                // Use major_numeric_id which is majors.id!
                $studentsQuery = DB::table('subject_enrollments as se')
                    ->join('students as s', 'se.maHV', '=', 's.maHV')
                    ->where('se.subject_id', $subjectId)
                    ->where('se.major_id', $class->major_numeric_id)  // ✅ Use major_numeric_id (majors.id)!
                    ->whereNull('se.deleted_at')
                    ->whereNull('s.deleted_at')
                    ->select(
                        's.maHV',
                        's.hoDem',
                        's.ten',
                        's.ngaySinh',
                        's.gioiTinh',
                        's.email',
                        's.dienThoai',
                        's.trangThai as trangThaiHoc',
                        's.idLop'
                    )
                    ->distinct()
                    ->orderBy('s.maHV');

                $students = $studentsQuery->get()->map(function ($student) use ($subjectId) {
                    $student->hoTen = trim($student->hoDem . ' ' . $student->ten);

                    // Get grades for this student and subject
                    $student->grades = DB::table('subject_students as ss')
                        ->join('subjects as sub', 'ss.subject_id', '=', 'sub.id')
                        ->where('ss.student_id', $student->maHV)  // ✅ FIX: Use student_id field
                        ->where('ss.subject_id', $subjectId)
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
                        ->get();

                    return $student;
                });

                \Log::info('Students with enrollments for subject:', [
                    'subject_id' => $subjectId,
                    'class_id' => $classId,
                    'major_id' => $class->major_id,
                    'total_students' => $students->count(),
                    'student_ids' => $students->pluck('maHV')->toArray(),
                    'query' => 'Using subject_enrollments without idLop filter'
                ]);
            } else {
                // No subject filter - get all students in class
                $studentsQuery = DB::table('students as s')
                    ->where('s.idLop', $classId)
                    ->whereNull('s.deleted_at')
                    ->select(
                        's.maHV',
                        's.hoDem',
                        's.ten',
                        's.ngaySinh',
                        's.gioiTinh',
                        's.email',
                        's.dienThoai',
                        's.trangThai as trangThaiHoc'
                    )
                    ->orderBy('s.maHV');

                $students = $studentsQuery->get()->map(function ($student) {
                    $student->hoTen = trim($student->hoDem . ' ' . $student->ten);

                    // Get all grades for this student
                    $student->grades = DB::table('subject_students as ss')
                        ->join('subjects as sub', 'ss.subject_id', '=', 'sub.id')
                        ->where('ss.student_id', $student->maHV)  // ✅ FIX: Use student_id field
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
                        ->get();

                    return $student;
                });
            }

            // Get available subjects for this major from major_subjects
            // ✅ FIX: major_subjects.major_id references majors.id (numeric), not maNganh
            $subjects = DB::table('subjects as s')
                ->join('major_subjects as ms', 's.id', '=', 'ms.subject_id')
                ->where('ms.major_id', $class->major_numeric_id)  // Use major_numeric_id (majors.id)
                ->whereNull('ms.deleted_at')
                ->select('s.id', 's.maMon', 's.tenMon', 's.soTinChi')
                ->groupBy('s.id', 's.maMon', 's.tenMon', 's.soTinChi')
                ->orderBy('s.tenMon')
                ->get();

            // Log để debug
            \Log::info('Loading subjects for class', [
                'class_id' => $classId,
                'maNganh' => $class->maNganh,
                'major_id' => $class->major_id,
                'major_numeric_id' => $class->major_numeric_id,
                'subjects_count' => $subjects->count(),
                'subjects' => $subjects->pluck('tenMon', 'id')->toArray()
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'class' => $class,
                    'students' => $students,
                    'subjects' => $subjects,
                    'gradePermissions' => $gradePermissions,
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching students with grades: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy danh sách học sinh',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get grade entry permissions for current user
     */
    private function getGradePermissions($user, $class, $subjectId)
    {
        $permissions = [
            'canEditX' => false,
            'canEditY' => false,
            'canEditZ' => false,
            'isSubjectTeacher' => false,
            'isHomeroomTeacher' => false,
        ];

        if (!$user) {
            return $permissions;
        }

        // Check if user is admin - only admin can edit all grades including Z
        if ($user->hasPermission('grades', 'create')) {
            $permissions['canEditX'] = true;
            $permissions['canEditY'] = true;
            $permissions['canEditZ'] = true;
            return $permissions;
        }

        // Get lecturer_id from user
        $lecturerId = $user->lecturer_id ?? null;

        if (!$lecturerId) {
            return $permissions;
        }

        // Check if user is homeroom teacher of this class
        // Homeroom teacher can ONLY edit Y (not X or Z)
        if ($class->homeroomTeacherId && $class->homeroomTeacherId == $lecturerId) {
            $permissions['isHomeroomTeacher'] = true;
            $permissions['canEditY'] = true;
        }

        // Check if user is subject teacher
        // Subject teacher can ONLY edit X (not Y or Z)
        if ($subjectId) {
            $isSubjectTeacher = DB::table('teaching_assignments')
                ->where('lecturer_id', $lecturerId)
                ->where('course_code', function($query) use ($subjectId) {
                    $query->select('maMon')
                        ->from('subjects')
                        ->where('id', $subjectId)
                        ->limit(1);
                })
                ->where('class_id', $class->id)
                ->whereNull('deleted_at')
                ->exists();

            if ($isSubjectTeacher) {
                $permissions['isSubjectTeacher'] = true;
                $permissions['canEditX'] = true;
            }
        }

        return $permissions;
    }

    /**
     * Update or create grade for a student
     */
    public function updateGrade(Request $request)
    {
        // FIX: Kiểm tra tồn tại trong bảng students thay vì hoc_vien
        $validator = Validator::make($request->all(), [
            'student_id' => 'required|string|exists:students,maHV',
            'subject_id' => 'required|integer|exists:subjects,id',
            'x1' => 'nullable|numeric|min:0|max:10',
            'x2' => 'nullable|numeric|min:0|max:10',
            'x3' => 'nullable|numeric|min:0|max:10',
            'y' => 'nullable|numeric|min:0|max:10',
            'class_id' => 'required|integer|exists:classes,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Get class info
            $class = DB::table('classes')->where('id', $request->class_id)->first();
            if (!$class) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy lớp',
                ], 404);
            }

            // Check permissions
            $user = auth('api')->user();
            $permissions = $this->getGradePermissions($user, $class, $request->subject_id);

            // Prepare data to update
            $updateData = [];

            // Check X1, X2, X3 permissions (only teachers can edit)
            if ($request->has('x1') && $request->x1 !== null) {
                if (!$permissions['canEditX']) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Bạn không có quyền nhập điểm X1. Chỉ giáo viên dạy môn mới được nhập.',
                    ], 403);
                }
                $updateData['x1'] = $request->x1;
            }

            if ($request->has('x2') && $request->x2 !== null) {
                if (!$permissions['canEditX']) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Bạn không có quyền nhập điểm X2. Chỉ giáo viên dạy môn mới được nhập.',
                    ], 403);
                }
                $updateData['x2'] = $request->x2;
            }

            if ($request->has('x3') && $request->x3 !== null) {
                if (!$permissions['canEditX']) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Bạn không có quyền nhập điểm X3. Chỉ giáo viên dạy môn mới được nhập.',
                    ], 403);
                }
                $updateData['x3'] = $request->x3;
            }

            // Check Y permission (only admin can edit)
            if ($request->has('y') && $request->y !== null) {
                if (!$permissions['canEditZ']) { // Admin has canEditZ = true
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Bạn không có quyền nhập điểm Y. Chỉ Admin mới được nhập điểm Y.',
                    ], 403);
                }
                $updateData['y'] = $request->y;
            }

            $grade = SubjectStudent::updateOrCreate(
                [
                    'student_id' => $request->student_id,
                    'subject_id' => $request->subject_id,
                ],
                $updateData
            );

            // Model will auto-calculate X (average of X1, X2, X3) and Z via boot method
            // Refresh to get calculated values
            $grade->refresh();

            // Calculate final grade based on formula: X*10% + Y*20% + Z*70%
            $x = $grade->x ?? 0;
            $y = $grade->y ?? 0;
            $z = $grade->z ?? 0;
            $finalGrade = ($x * 0.1) + ($y * 0.2) + ($z * 0.7);

            DB::commit();

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
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error updating grade: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi cập nhật điểm',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Bulk update grades for multiple students
     */
    public function bulkUpdateGrades(Request $request)
    {
        // FIX: Kiểm tra tồn tại trong bảng students thay vì hoc_vien
        $validator = Validator::make($request->all(), [
            'grades' => 'required|array',
            'grades.*.student_id' => 'required|string|exists:students,maHV',
            'grades.*.subject_id' => 'required|integer|exists:subjects,id',
            'grades.*.x' => 'required|numeric|min:0|max:10',
            'grades.*.y' => 'required|numeric|min:0|max:10',
            'grades.*.z' => 'required|numeric|min:0|max:10',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            DB::beginTransaction();

            $updated = 0;
            foreach ($request->grades as $gradeData) {
                SubjectStudent::updateOrCreate(
                    [
                        'student_id' => $gradeData['student_id'],
                        'subject_id' => $gradeData['subject_id'],
                    ],
                    [
                        'x' => $gradeData['x'],
                        'y' => $gradeData['y'],
                        'z' => $gradeData['z'],
                    ]
                );
                $updated++;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Cập nhật thành công {$updated} điểm",
                'data' => [
                    'updated' => $updated,
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error bulk updating grades: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi cập nhật điểm hàng loạt',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Delete a grade
     */
    public function deleteGrade($gradeId)
    {
        try {
            $grade = SubjectStudent::findOrFail($gradeId);

            DB::beginTransaction();
            $grade->delete();
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Xóa điểm thành công',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error deleting grade: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi xóa điểm',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }
}

