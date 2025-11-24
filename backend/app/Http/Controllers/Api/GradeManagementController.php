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
                    // Lấy các năm từ bảng classes (sử dụng khoaHoc_id)
                    $years = [];

                    try {
                        // Lấy các khoaHoc_id từ bảng classes
                        $years = DB::table('classes')
                            ->where('major_id', $major->maNganh)
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

            // FIX: Thêm COLLATE để fix collation mismatch
            $classes = DB::table('classes as c')
                ->leftJoin('majors as m', function($join) {
                    $join->on('c.major_id', '=', DB::raw('m.maNganh COLLATE utf8mb4_unicode_ci'));
                })
                ->where('c.major_id', $request->maNganh)
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

            // Get class info with major - FIX: Sử dụng bảng classes và fix collation
            $class = DB::table('classes as c')
                ->leftJoin('majors as m', function($join) {
                    $join->on('c.major_id', '=', DB::raw('m.maNganh COLLATE utf8mb4_unicode_ci'));
                })
                ->where('c.id', $classId)
                ->whereNull('m.deleted_in')
                ->whereNull('c.deleted_at')
                ->select(
                    'c.*',
                    'c.class_name as tenLop',
                    'c.major_id as maNganhHoc',
                    'm.tenNganh',
                    'm.maNganh',
                    'm.id as major_id'
                )
                ->first();

            if (!$class) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy lớp',
                ], 404);
            }

            // Get students in class - FIX: Sử dụng bảng students thay vì hoc_vien
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

            $students = $studentsQuery->get()->map(function ($student) use ($subjectId) {
                $student->hoTen = trim($student->hoDem . ' ' . $student->ten);

                // Get grades for this student from subject_students
                $gradesQuery = DB::table('subject_students as ss')
                    ->join('subjects as sub', 'ss.subject_id', '=', 'sub.id')
                    ->where('ss.student_id', $student->maHV);

                if ($subjectId) {
                    $gradesQuery->where('ss.subject_id', $subjectId);
                }

                $student->grades = $gradesQuery
                    ->select(
                        'ss.id as grade_id',
                        'ss.subject_id',
                        'sub.maMon',
                        'sub.tenMon',
                        'sub.soTinChi',
                        'ss.x',
                        'ss.y',
                        'ss.z',
                        'ss.created_at',
                        'ss.updated_at'
                    )
                    ->get();

                return $student;
            });

            // Get available subjects for this major from major_subjects
            $subjects = DB::table('subjects as s')
                ->join('major_subjects as ms', 's.id', '=', 'ms.subject_id')
                ->join('majors as m', 'ms.major_id', '=', 'm.id')
                ->where('m.maNganh', $class->maNganh)
                ->whereNull('m.deleted_in')
                ->select('s.id', 's.maMon', 's.tenMon', 's.soTinChi')
                ->groupBy('s.id', 's.maMon', 's.tenMon', 's.soTinChi')
                ->orderBy('s.tenMon')
                ->get();

            // Log để debug
            \Log::info('Major info:', [
                'maNganh' => $class->maNganh,
                'major_id' => $class->major_id ?? 'NOT SET',
                'subjects_count' => $subjects->count(),
                'subjects_ids' => $subjects->pluck('id')->toArray()
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'class' => $class,
                    'students' => $students,
                    'subjects' => $subjects,
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
     * Update or create grade for a student
     */
    public function updateGrade(Request $request)
    {
        // FIX: Kiểm tra tồn tại trong bảng students thay vì hoc_vien
        $validator = Validator::make($request->all(), [
            'student_id' => 'required|string|exists:students,maHV',
            'subject_id' => 'required|integer|exists:subjects,id',
            'x' => 'required|numeric|min:0|max:10',
            'y' => 'required|numeric|min:0|max:10',
            'z' => 'required|numeric|min:0|max:10',
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

            $grade = SubjectStudent::updateOrCreate(
                [
                    'student_id' => $request->student_id,
                    'subject_id' => $request->subject_id,
                ],
                [
                    'x' => $request->x,
                    'y' => $request->y,
                    'z' => $request->z,
                ]
            );

            // Calculate final grade
            $finalGrade = ($request->x * 0.1) + ($request->y * 0.2) + ($request->z * 0.7);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật điểm thành công',
                'data' => [
                    'id' => $grade->id,
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

