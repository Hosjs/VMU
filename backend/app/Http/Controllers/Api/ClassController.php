<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ClassController extends Controller
{
    /**
     * Get all classes
     * GET /api/classes
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = DB::table('classes');

            // Search
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('class_name', 'like', "%{$search}%")
                      ->orWhere('khoaHoc_id', 'like', "%{$search}%")
                      ->orWhere('major_id', 'like', "%{$search}%");
                });
            }

            // Filter by trình độ đào tạo
            if ($request->has('maTrinhDoDaoTao')) {
                $query->where('maTrinhDoDaoTao', $request->maTrinhDoDaoTao);
            }

            // Filter by ngành học
            if ($request->has('maNganhHoc') || $request->has('major_id')) {
                $majorId = $request->maNganhHoc ?? $request->major_id;
                $query->where('major_id', $majorId);
            }

            // Filter by khóa học
            if ($request->has('khoaHoc') || $request->has('khoaHoc_id')) {
                $khoaHoc = $request->khoaHoc ?? $request->khoaHoc_id;
                $query->where('khoaHoc_id', $khoaHoc);
            }

            // Sorting - đảm bảo sort đúng với tên cột trong database
            $sortBy = $request->get('sort_by', 'id');
            $sortDirection = $request->get('sort_direction', 'desc');

            // Map tên cột cũ sang tên cột mới
            $columnMapping = [
                'tenLop' => 'class_name',
                'maNganhHoc' => 'major_id',
                'khoaHoc' => 'khoaHoc_id',
            ];

            $sortColumn = $columnMapping[$sortBy] ?? $sortBy;
            $query->orderBy($sortColumn, $sortDirection);

            // Pagination
            $perPage = $request->per_page ?? 20;
            $page = $request->page ?? 1;
            $total = $query->count();
            $lastPage = ceil($total / $perPage);

            $data = $query
                ->skip(($page - 1) * $perPage)
                ->take($perPage)
                ->get();

            // Transform data để thêm các alias cho backward compatibility
            $data = $data->map(function($item) {
                return (object)[
                    'id' => $item->id,
                    'class_name' => $item->class_name,
                    'tenLop' => $item->class_name, // alias
                    'maTrinhDoDaoTao' => $item->maTrinhDoDaoTao,
                    'major_id' => $item->major_id,
                    'maNganhHoc' => $item->major_id, // alias
                    'khoaHoc_id' => $item->khoaHoc_id,
                    'khoaHoc' => $item->khoaHoc_id, // alias
                    'lecurer_id' => $item->lecurer_id,
                    'idGiaoVienChuNhiem' => $item->lecurer_id, // alias
                    'trangThai' => $item->trangThai,
                    'created_at' => $item->created_at,
                    'updated_at' => $item->updated_at,
                    'deleted_at' => $item->deleted_at,
                    'createdBy' => $item->createdBy,
                ];
            });

            return response()->json([
                'data' => $data,
                'current_page' => (int)$page,
                'last_page' => (int)$lastPage,
                'per_page' => (int)$perPage,
                'total' => $total,
                'from' => $total > 0 ? (($page - 1) * $perPage) + 1 : 0,
                'to' => min($page * $perPage, $total),
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in ClassController@index: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tải danh sách lớp học',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get simple list for dropdown
     * GET /api/classes/simple
     */
    public function simple(): JsonResponse
    {
        try {
            $classes = DB::table('classes')
                ->select('id', 'tenLop', 'khoaHoc', 'maNganhHoc')
                ->orderBy('tenLop', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $classes,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in ClassController@simple: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tải danh sách lớp học',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get class details
     * GET /api/classes/{id}
     */
    public function show($id): JsonResponse
    {
        try {
            $class = DB::table('classes')->where('id', $id)->first();

            if (!$class) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy lớp học',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $class,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in ClassController@show: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy lớp học',
                'error' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Get students in a class
     * GET /api/classes/{id}/students
     * Accepts either class ID or course_code (e.g., "531 ITBT")
     */
    public function getStudents($id): JsonResponse
    {
        try {
            \Log::info("ClassController@getStudents called with ID: {$id}");

            $class = null;
            $students = collect();

            // Kiểm tra xem $id có phải là course_code hay không (chứa space và chữ)
            if (preg_match('/^\d+\s+[A-Z]+/', $id)) {
                // Đây là course_code dạng "531 ITBT"
                // Parse để lấy mã môn (phần cuối cùng sau khoảng trắng)
                $parts = explode(' ', trim($id));
                $maMon = end($parts); // Lấy phần cuối cùng, ví dụ: "ITBT"

                \Log::info("Parsed course_code: {$id} -> maMon: {$maMon}");

                // Tìm subject_id từ mã môn
                $subject = DB::table('subjects')->where('maMon', $maMon)->first();

                if (!$subject) {
                    \Log::warning("Subject not found for maMon: {$maMon}");
                    return response()->json([
                        'success' => false,
                        'message' => "Không tìm thấy môn học với mã: {$maMon}",
                        'data' => [],
                    ], 404);
                }

                \Log::info("Found subject: {$subject->tenMon} (ID: {$subject->id})");

                // CÁCH 1 (ƯU TIÊN): Lấy học viên từ bảng subject_students
                // Đây là cách chính xác nhất vì nó lưu trữ việc đăng ký môn học
                $studentIds = DB::table('subject_students')
                    ->where('subject_id', $subject->id)
                    ->pluck('student_id');

                if ($studentIds->isNotEmpty()) {
                    \Log::info("Found {$studentIds->count()} students enrolled in subject from subject_students");

                    $students = DB::table('students')
                        ->whereIn('maHV', $studentIds)
                        ->whereNull('deleted_at')
                        ->orderBy('maHV', 'asc')
                        ->get();

                    // Tìm lớp từ teaching_assignments hoặc major
                    $teachingAssignment = DB::table('teaching_assignments')
                        ->where('course_code', $id)
                        ->whereNull('deleted_at')
                        ->first();

                    if ($teachingAssignment && $teachingAssignment->class_id) {
                        $class = DB::table('classes')->where('id', $teachingAssignment->class_id)->first();
                    } else {
                        // Tìm lớp từ major của môn học
                        $majorIds = DB::table('major_subjects')
                            ->where('subject_id', $subject->id)
                            ->pluck('major_id');

                        if ($majorIds->isNotEmpty()) {
                            $class = DB::table('classes')
                                ->whereIn('major_id', $majorIds)
                                ->orderBy('id', 'desc')
                                ->first();
                        }
                    }
                } else {
                    // CÁCH 2 (FALLBACK): Nếu chưa có dữ liệu trong subject_students
                    \Log::info("No students in subject_students, trying class_students and teaching_assignments");

                    // Tìm lớp học từ teaching_assignments dựa trên course_code
                    $teachingAssignment = DB::table('teaching_assignments')
                        ->where('course_code', $id)
                        ->whereNull('deleted_at')
                        ->first();

                    if ($teachingAssignment && $teachingAssignment->class_id) {
                        $class = DB::table('classes')->where('id', $teachingAssignment->class_id)->first();

                        if ($class) {
                            \Log::info("Found class from teaching_assignment: {$class->class_name} (ID: {$class->id})");

                            // Lấy học viên từ bảng class_students
                            $studentIds = DB::table('class_students')
                                ->where('class_id', $class->id)
                                ->whereNull('deleted_at')
                                ->pluck('student_id');

                            if ($studentIds->isNotEmpty()) {
                                $students = DB::table('students')
                                    ->whereIn('maHV', $studentIds)
                                    ->whereNull('deleted_at')
                                    ->orderBy('maHV', 'asc')
                                    ->get();
                            }
                        }
                    }
                }

                // CÁCH 3 (FALLBACK CUỐI): Nếu vẫn không có học viên
                if ($students->isEmpty()) {
                    \Log::info("Still no students, trying major_subjects fallback");

                    $majorIds = DB::table('major_subjects')
                        ->where('subject_id', $subject->id)
                        ->pluck('major_id');

                    if ($majorIds->isNotEmpty()) {
                        $class = DB::table('classes')
                            ->whereIn('major_id', $majorIds)
                            ->orderBy('id', 'desc')
                            ->first();

                        if ($class) {
                            \Log::info("Found class from major: {$class->class_name} (ID: {$class->id})");

                            // Lấy từ idLop (fallback cuối cùng)
                            $students = DB::table('students')
                                ->where('idLop', $class->id)
                                ->whereNull('deleted_at')
                                ->orderBy('maHV', 'asc')
                                ->get();
                        }
                    }
                }

                // Nếu vẫn không có lớp, lấy lớp đầu tiên
                if (!$class) {
                    $class = DB::table('classes')->first();
                    \Log::warning("Using first available class as fallback");
                }


            } else {
                // Đây là class ID thông thường
                \Log::info("Using class ID directly: {$id}");

                $class = DB::table('classes')->where('id', $id)->first();

                if (!$class) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Không tìm thấy lớp học',
                        'data' => [],
                    ], 404);
                }

                // Lấy học viên từ bảng class_students trước
                $studentIds = DB::table('class_students')
                    ->where('class_id', $id)
                    ->whereNull('deleted_at')
                    ->pluck('student_id');

                if ($studentIds->isNotEmpty()) {
                    $students = DB::table('students')
                        ->whereIn('maHV', $studentIds)
                        ->whereNull('deleted_at')
                        ->orderBy('maHV', 'asc')
                        ->get();
                } else {
                    // Fallback: Lấy từ idLop nếu chưa có dữ liệu trong class_students
                    \Log::info("No data in class_students, falling back to idLop");
                    $students = DB::table('students')
                        ->where('idLop', $id)
                        ->whereNull('deleted_at')
                        ->orderBy('maHV', 'asc')
                        ->get();
                }
            }

            // Map student data
            $studentsData = $students->map(function($student) use ($class) {
                return [
                    'mahv' => $student->maHV ?? null,
                    'hodem' => $student->hoDem ?? null,
                    'ten' => $student->ten ?? null,
                    'ngaysinh' => $student->ngaySinh ?? null,
                    'gioitinh' => $student->gioiTinh ?? null,
                    'dienthoai' => $student->dienThoai ?? null,
                    'email' => $student->email ?? null,
                    'noisinh' => $student->quocTich ?? $student->noiSinh ?? null,
                    'socmnd' => $student->soGiayToTuyThan ?? $student->soCMND ?? null,
                    'trangthaihoc' => $student->trangThai ?? null,
                    'tenLop' => $class->class_name ?? null,
                ];
            });

            \Log::info("Found {$studentsData->count()} students");

            return response()->json([
                'success' => true,
                'data' => $studentsData,
                'lop' => [
                    'id' => $class->id ?? null,
                    'tenLop' => $class->class_name ?? null,
                    'khoaHoc' => $class->khoaHoc_id ?? null,
                    'maNganhHoc' => $class->major_id ?? null,
                ],
                'message' => 'Lấy danh sách học viên thành công'
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in ClassController@getStudents: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tải danh sách học viên',
                'error' => $e->getMessage(),
                'data' => [],
            ], 500);
        }
    }
}
