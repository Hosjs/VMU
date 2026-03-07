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
            // Join với khoa_hoc và majors để lấy thông tin đầy đủ
            $query = DB::table('classes')
                ->leftJoin('khoa_hoc', 'classes.khoaHoc_id', '=', 'khoa_hoc.id')
                ->leftJoin('majors', 'classes.major_id', '=', 'majors.id')
                ->leftJoin('lecturers', 'classes.lecurer_id', '=', 'lecturers.id')
                ->select(
                    'classes.*',
                    'khoa_hoc.nam_hoc',
                    'khoa_hoc.ma_khoa_hoc',
                    'majors.maNganh as major_code',
                    'majors.tenNganh as major_name',
                    'lecturers.hoTen as lecturer_name'
                );

            // Search
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('classes.class_name', 'like', "%{$search}%")
                      ->orWhere('majors.tenNganh', 'like', "%{$search}%")
                      ->orWhere('majors.maNganh', 'like', "%{$search}%")
                      ->orWhere('khoa_hoc.nam_hoc', 'like', "%{$search}%");
                });
            }

            if ($request->has('maTrinhDoDaoTao')) {
                $query->where('classes.maTrinhDoDaoTao', $request->maTrinhDoDaoTao);
            }

            if ($request->has('maNganhHoc') || $request->has('major_id')) {
                $majorValue = $request->maNganhHoc ?? $request->major_id;

                // Check if it's a numeric ID or a string code (maNganh)
                if (is_numeric($majorValue)) {
                    $query->where('classes.major_id', $majorValue);
                } else {
                    // It's a maNganh string like "8520216", filter by majors.maNganh
                    $query->where('majors.maNganh', $majorValue);
                }
            }

            if ($request->has('khoaHoc') || $request->has('khoaHoc_id')) {
                $khoaHoc = $request->khoaHoc ?? $request->khoaHoc_id;
                $query->where('classes.khoaHoc_id', $khoaHoc);
            }

            if ($request->has('namVao')) {
                $query->where('khoa_hoc.nam_hoc', $request->namVao);
            }

            // Sorting - đảm bảo sort đúng với tên cột trong database
            $sortBy = $request->get('sort_by', 'id');
            $sortDirection = $request->get('sort_direction', 'desc');

            // Map tên cột cũ sang tên cột mới
            $columnMapping = [
                'tenLop' => 'classes.class_name',
                'maNganhHoc' => 'classes.major_id',
                'khoaHoc' => 'khoa_hoc.nam_hoc',
                'id' => 'classes.id',
                'class_name' => 'classes.class_name',
                'major_id' => 'classes.major_id',
                'khoaHoc_id' => 'classes.khoaHoc_id',
            ];

            // Get sort column, add table prefix if not already present
            if (isset($columnMapping[$sortBy])) {
                $sortColumn = $columnMapping[$sortBy];
            } else {
                // If column doesn't have a table prefix, add classes.
                $sortColumn = strpos($sortBy, '.') !== false ? $sortBy : "classes.{$sortBy}";
            }

            $query->orderBy($sortColumn, $sortDirection);

            // Count before pagination
            $total = $query->count();

            // Pagination
            $perPage = $request->per_page ?? 20;
            $page = $request->page ?? 1;
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
                    'maNganhHoc' => $item->major_code, // alias - use major code
                    'khoaHoc_id' => $item->khoaHoc_id,
                    'khoaHoc' => $item->khoaHoc_id, // alias
                    'nam_hoc' => $item->nam_hoc, // ✅ Year from khoa_hoc table
                    'ma_khoa_hoc' => $item->ma_khoa_hoc,
                    'major_code' => $item->major_code, // ✅ Major code
                    'major_name' => $item->major_name, // ✅ Major name
                    'lecurer_id' => $item->lecurer_id,
                    'idGiaoVienChuNhiem' => $item->lecurer_id, // alias
                    'lecturer_name' => $item->lecturer_name, // ✅ Lecturer name
                    'phu_trach_lop' => $item->lecturer_name, // alias
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

    /**
     * Update a class
     * PUT /api/classes/{id}
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $class = DB::table('classes')->where('id', $id)->first();

            if (!$class) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy lớp học',
                ], 404);
            }

            // Validate
            $validated = $request->validate([
                'class_name' => 'sometimes|string|max:255',
                'major_id' => 'sometimes|nullable',
                'khoaHoc_id' => 'sometimes|nullable',
                'maTrinhDoDaoTao' => 'sometimes|string|max:50',
                'lecurer_id' => 'sometimes|nullable|integer|exists:lecturers,id',
                'phu_trach_lop' => 'sometimes|nullable|string|max:255',
                'trangThai' => 'sometimes|string|max:50',
            ]);

            $updateData = [];

            if ($request->has('class_name')) {
                $updateData['class_name'] = $request->class_name;
            }

            if ($request->has('major_id') && !empty($request->major_id)) {
                // Convert to integer if it's a string
                $majorId = is_numeric($request->major_id) ? (int)$request->major_id : $request->major_id;

                // Validate major exists
                $majorExists = DB::table('majors')->where('id', $majorId)->exists();
                if (!$majorExists) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Ngành học không tồn tại',
                    ], 422);
                }

                $updateData['major_id'] = $majorId;
            }

            if ($request->has('khoaHoc_id') && !empty($request->khoaHoc_id)) {
                // Convert to integer if it's a string
                $khoaHocId = is_numeric($request->khoaHoc_id) ? (int)$request->khoaHoc_id : $request->khoaHoc_id;

                // Validate khoa hoc exists
                $khoaHocExists = DB::table('khoa_hoc')->where('id', $khoaHocId)->exists();
                if (!$khoaHocExists) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Khóa học không tồn tại',
                    ], 422);
                }

                $updateData['khoaHoc_id'] = $khoaHocId;
            }

            if ($request->has('maTrinhDoDaoTao')) {
                $updateData['maTrinhDoDaoTao'] = $request->maTrinhDoDaoTao;
            }

            if ($request->has('lecurer_id')) {
                $updateData['lecurer_id'] = $request->lecurer_id;
            }

            if ($request->has('phu_trach_lop')) {
                $updateData['phu_trach_lop'] = $request->phu_trach_lop;
            }

            if ($request->has('trangThai')) {
                $updateData['trangThai'] = $request->trangThai;
            }

            $updateData['updated_at'] = now();

            DB::table('classes')
                ->where('id', $id)
                ->update($updateData);

            // Get updated class with relations
            $updatedClass = DB::table('classes')
                ->leftJoin('khoa_hoc', 'classes.khoaHoc_id', '=', 'khoa_hoc.id')
                ->leftJoin('majors', 'classes.major_id', '=', 'majors.id')
                ->leftJoin('lecturers', 'classes.lecurer_id', '=', 'lecturers.id')
                ->select(
                    'classes.*',
                    'khoa_hoc.nam_hoc',
                    'khoa_hoc.ma_khoa_hoc',
                    'majors.maNganh as major_code',
                    'majors.tenNganh as major_name',
                    'lecturers.hoTen as lecturer_name'
                )
                ->where('classes.id', $id)
                ->first();

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật lớp học thành công',
                'data' => $updatedClass,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error updating class: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Không thể cập nhật lớp học',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a class (Soft Delete)
     * DELETE /api/classes/{id}
     */
    public function destroy($id): JsonResponse
    {
        try {
            $class = DB::table('classes')->where('id', $id)->first();

            if (!$class) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy lớp học',
                ], 404);
            }

            // Check if class has students
            $hasStudents = DB::table('class_students')
                ->where('class_id', $id)
                ->whereNull('deleted_at')
                ->exists();

            if ($hasStudents) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không thể xóa lớp học đã có học viên',
                ], 422);
            }

            // Soft delete
            DB::table('classes')
                ->where('id', $id)
                ->update(['deleted_at' => now()]);

            return response()->json([
                'success' => true,
                'message' => 'Xóa lớp học thành công',
            ]);
        } catch (\Exception $e) {
            \Log::error('Error deleting class: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa lớp học',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Force delete a class (Hard Delete)
     * DELETE /api/classes/{id}/force
     */
    public function forceDelete($id): JsonResponse
    {
        try {
            $class = DB::table('classes')->where('id', $id)->first();

            if (!$class) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy lớp học',
                ], 404);
            }

            // Check if class has students
            $hasStudents = DB::table('class_students')
                ->where('class_id', $id)
                ->exists();

            if ($hasStudents) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không thể xóa vĩnh viễn lớp học đã có học viên. Vui lòng xóa mềm.',
                ], 422);
            }

            // Hard delete
            DB::table('classes')->where('id', $id)->delete();

            return response()->json([
                'success' => true,
                'message' => 'Xóa vĩnh viễn lớp học thành công',
            ]);
        } catch (\Exception $e) {
            \Log::error('Error force deleting class: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa vĩnh viễn lớp học',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
