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
                    $q->where('tenLop', 'like', "%{$search}%")
                      ->orWhere('khoaHoc', 'like', "%{$search}%");
                });
            }

            // Filter by trình độ đào tạo
            if ($request->has('maTrinhDoDaoTao')) {
                $query->where('maTrinhDoDaoTao', $request->maTrinhDoDaoTao);
            }

            // Filter by ngành học
            if ($request->has('maNganhHoc')) {
                $query->where('maNganhHoc', $request->maNganhHoc);
            }

            // Filter by khóa học
            if ($request->has('khoaHoc')) {
                $query->where('khoaHoc', $request->khoaHoc);
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'id');
            $sortDirection = $request->get('sort_direction', 'desc');
            $query->orderBy($sortBy, $sortDirection);

            // Pagination
            $perPage = $request->per_page ?? 20;
            $page = $request->page ?? 1;
            $total = $query->count();
            $lastPage = ceil($total / $perPage);

            $data = $query
                ->skip(($page - 1) * $perPage)
                ->take($perPage)
                ->get();

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
     */
    public function getStudents($id): JsonResponse
    {
        try {
            // Tìm lớp học từ bảng classes
            $class = DB::table('classes')->where('id', $id)->first();

            if (!$class) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy lớp học',
                    'data' => [],
                ], 404);
            }

            // Lấy danh sách học viên từ bảng students với idLop
            $students = DB::table('students')
                ->where('idLop', $id)
                ->whereNull('deleted_at')
                ->orderBy('maHV', 'asc')
                ->get()
                ->map(function($student) use ($class) {
                    return [
                        'mahv' => $student->maHV,
                        'hodem' => $student->hoDem,
                        'ten' => $student->ten,
                        'ngaysinh' => $student->ngaySinh ?? null,
                        'gioitinh' => $student->gioiTinh,
                        'dienthoai' => $student->dienThoai,
                        'email' => $student->email,
                        'noisinh' => $student->quocTich ?? $student->noiSinh ?? null,
                        'socmnd' => $student->soGiayToTuyThan ?? $student->soCMND ?? null,
                        'trangthaihoc' => $student->trangThai,
                        'tenLop' => $class->tenLop,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $students,
                'lop' => [
                    'id' => $class->id,
                    'tenLop' => $class->tenLop,
                    'khoaHoc' => $class->khoaHoc ?? null,
                    'maNganhHoc' => $class->maNganhHoc ?? null,
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
