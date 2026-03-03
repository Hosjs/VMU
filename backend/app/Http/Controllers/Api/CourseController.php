<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KhoaHoc;
use App\Models\Major;
use App\Models\Classes;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class CourseController extends Controller
{
    /**
     * Lấy danh sách phòng học/lớp học
     * GET /api/rooms
     */
    public function index(Request $request)
    {
        try {
            $query = KhoaHoc::query();

            // Search
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('ma_khoa_hoc', 'like', "%{$search}%")
                      ->orWhere('nam_hoc', 'like', "%{$search}%")
                      ->orWhere('ghi_chu', 'like', "%{$search}%");
                });
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'id');
            $sortDirection = $request->get('sort_direction', 'desc');
            $query->orderBy($sortBy, $sortDirection);

            // Pagination
            $perPage = $request->get('per_page', 10);
            $courses = $query->paginate($perPage);

            // Return Laravel standard pagination format
            return response()->json($courses);
        } catch (\Exception $e) {
            Log::error('Error fetching courses: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Không thể lấy danh sách kỳ học',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy chi tiết một kỳ học
     * GET /api/courses/{id}
     */
    public function show($id)
    {
        try {
            $course = KhoaHoc::find($id);

            if (!$course) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy kỳ học',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $course,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching course: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Không thể lấy thông tin kỳ học',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Tạo kỳ học mới
     * POST /api/courses
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'nam_hoc' => 'required|integer|min:2020|max:2100',
                'hoc_ky' => 'required|integer|between:1,3',
                'dot' => 'required|integer|between:1,5',
                'ngay_bat_dau' => 'nullable|date',
                'ngay_ket_thuc' => 'nullable|date|after_or_equal:ngay_bat_dau',
                'ghi_chu' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dữ liệu không hợp lệ',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Generate ma_khoa_hoc: {nam_hoc}.{hoc_ky}.{dot}
            $maKhoaHoc = "{$request->nam_hoc}.{$request->hoc_ky}.{$request->dot}";

            // Check if already exists
            $exists = KhoaHoc::where('ma_khoa_hoc', $maKhoaHoc)->exists();
            if ($exists) {
                return response()->json([
                    'success' => false,
                    'message' => "Kỳ học {$maKhoaHoc} đã tồn tại",
                ], 422);
            }

            $course = KhoaHoc::create([
                'ma_khoa_hoc' => $maKhoaHoc,
                'nam_hoc' => $request->nam_hoc,
                'hoc_ky' => $request->hoc_ky,
                'dot' => $request->dot,
                'ngay_bat_dau' => $request->ngay_bat_dau,
                'ngay_ket_thuc' => $request->ngay_ket_thuc,
                'ghi_chu' => $request->ghi_chu,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Tạo kỳ học thành công',
                'data' => $course,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating course: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Không thể tạo kỳ học',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cập nhật kỳ học
     * PUT /api/courses/{id}
     */
    public function update(Request $request, $id)
    {
        try {
            $course = KhoaHoc::find($id);

            if (!$course) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy kỳ học',
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'ngay_bat_dau' => 'nullable|date',
                'ngay_ket_thuc' => 'nullable|date|after_or_equal:ngay_bat_dau',
                'ghi_chu' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dữ liệu không hợp lệ',
                    'errors' => $validator->errors()
                ], 422);
            }

            $course->update($request->only(['ngay_bat_dau', 'ngay_ket_thuc', 'ghi_chu']));

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật kỳ học thành công',
                'data' => $course,
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating course: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Không thể cập nhật kỳ học',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xóa kỳ học
     * DELETE /api/courses/{id}
     */
    public function destroy($id)
    {
        try {
            $course = KhoaHoc::find($id);

            if (!$course) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy kỳ học',
                ], 404);
            }

            // Check if has classes
            $hasClasses = Classes::where('khoaHoc_id', $id)->exists();
            if ($hasClasses) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không thể xóa kỳ học đã có lớp học',
                ], 422);
            }

            $course->delete();

            return response()->json([
                'success' => true,
                'message' => 'Xóa kỳ học thành công',
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting course: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa kỳ học',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Tạo lớp học cho ngành và kỳ học
     * POST /api/courses/create-classes
     */
    public function createClasses(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'khoa_hoc_id' => 'required|exists:khoa_hoc,id',
                'major_id' => 'required|exists:majors,id',
                'trinh_do' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dữ liệu không hợp lệ',
                    'errors' => $validator->errors()
                ], 422);
            }

            $khoaHoc = KhoaHoc::find($request->khoa_hoc_id);
            $major = Major::find($request->major_id);

            // Generate class name: {MajorCode} {ma_khoa_hoc}
            // Example: CNTT 2025.1.1 or 8310110 2025.1.1
            // Use short_code for display, but save maNganh in database
            $majorCode = $major->short_code ?? $major->maNganh ?? 'UNKN';
            $className = "{$majorCode} {$khoaHoc->ma_khoa_hoc}";

            // Check if class already exists
            $exists = Classes::where('class_name', $className)
                ->where('khoaHoc_id', $request->khoa_hoc_id)
                ->exists();

            if ($exists) {
                return response()->json([
                    'success' => false,
                    'message' => "Lớp {$className} đã tồn tại",
                ], 422);
            }

            $class = Classes::create([
                'class_name' => $className,
                'major_id' => $major->maNganh, // ✅ Lưu maNganh (8310110) thay vì id (1)
                'khoaHoc_id' => $request->khoa_hoc_id,
                'maTrinhDoDaoTao' => $request->trinh_do,
                'trangThai' => 'DangHoc',
                'createdBy' => auth()->id(),
            ]);

            return response()->json([
                'success' => true,
                'message' => "Tạo lớp {$className} thành công",
                'data' => $class,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating class: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Không thể tạo lớp học',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Tạo nhiều lớp học cùng lúc (Bulk creation)
     * POST /api/courses/create-classes-bulk
     *
     * Request body:
     * {
     *   "classes": [
     *     { "khoa_hoc_id": 1, "major_id": 123, "trinh_do": "ThS" },
     *     { "khoa_hoc_id": 1, "major_id": 124, "trinh_do": "ThS" }
     *   ]
     * }
     */
    public function createClassesBulk(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'classes' => 'required|array|min:1',
                'classes.*.khoa_hoc_id' => 'required|exists:khoa_hoc,id',
                'classes.*.major_id' => 'required|exists:majors,id',
                'classes.*.trinh_do' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dữ liệu không hợp lệ',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            $results = [
                'success' => [],
                'failed' => [],
            ];

            foreach ($request->classes as $classData) {
                try {
                    $khoaHoc = KhoaHoc::find($classData['khoa_hoc_id']);
                    $major = Major::find($classData['major_id']);

                    // Generate class name using short_code for better readability
                    // Example: CNTT 2025.1.1 instead of 8310110 2025.1.1
                    $majorCode = $major->short_code ?? $major->maNganh ?? 'UNKN';
                    $className = "{$majorCode} {$khoaHoc->ma_khoa_hoc}";

                    // Check if class already exists
                    $exists = Classes::where('class_name', $className)
                        ->where('khoaHoc_id', $classData['khoa_hoc_id'])
                        ->exists();

                    if ($exists) {
                        $results['failed'][] = [
                            'class_name' => $className,
                            'reason' => 'Lớp đã tồn tại',
                        ];
                        continue;
                    }

                    $class = Classes::create([
                        'class_name' => $className,
                        'major_id' => $major->maNganh, // ✅ Lưu maNganh (8310110) thay vì id (1)
                        'khoaHoc_id' => $classData['khoa_hoc_id'],
                        'maTrinhDoDaoTao' => $classData['trinh_do'],
                        'trangThai' => 'DangHoc',
                        'createdBy' => auth()->id(),
                    ]);

                    $results['success'][] = [
                        'id' => $class->id,
                        'class_name' => $className,
                    ];
                } catch (\Exception $e) {
                    $results['failed'][] = [
                        'major_id' => $classData['major_id'] ?? 'N/A',
                        'khoa_hoc_id' => $classData['khoa_hoc_id'] ?? 'N/A',
                        'reason' => $e->getMessage(),
                    ];
                }
            }

            DB::commit();

            $successCount = count($results['success']);
            $failedCount = count($results['failed']);

            return response()->json([
                'success' => $successCount > 0,
                'message' => "Tạo thành công {$successCount} lớp" .
                            ($failedCount > 0 ? ", thất bại {$failedCount} lớp" : ""),
                'data' => $results,
            ], $successCount > 0 ? 201 : 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating classes bulk: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Không thể tạo lớp học',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy danh sách kỳ học để chọn (dropdown)
     * GET /api/courses/simple
     */
    public function simple()
    {
        try {
            $courses = KhoaHoc::select('id', 'ma_khoa_hoc', 'nam_hoc', 'hoc_ky', 'dot')
                ->orderBy('nam_hoc', 'desc')
                ->orderBy('hoc_ky', 'desc')
                ->orderBy('dot', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $courses,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching simple courses: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Không thể lấy danh sách kỳ học',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
