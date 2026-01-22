<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HocVien;
use App\Helpers\UserHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class StudentController extends Controller
{
    /**
     * Display a listing of students
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            // ✅ Remove strict validation - allow viewing all students
            $query = HocVien::with(['trinhDoDaoTao', 'nganh', 'lop']);

            // Apply filters using scopes - all optional
            $query->search($request->search)
                  ->byNamVao($request->namVao)
                  ->byNganh($request->maNganh)
                  ->byTrinhDo($request->maTrinhDoDaoTao)
                  ->byTrangThai($request->trangThai)
                  ->byGioiTinh($request->gioiTinh);

            // Sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortDirection = $request->get('sort_direction', 'desc');
            $query->orderBy($sortBy, $sortDirection);

            // Pagination
            $perPage = $request->get('per_page', 20);
            $students = $query->paginate($perPage);


            return response()->json([
                'success' => true,
                'data' => $students->items(),
                'meta' => [
                    'current_page' => $students->currentPage(),
                    'from' => $students->firstItem(),
                    'last_page' => $students->lastPage(),
                    'per_page' => $students->perPage(),
                    'to' => $students->lastItem(),
                    'total' => $students->total(),
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('StudentController@index - Error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error fetching students',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created student
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'maHV' => 'required|string|max:20|unique:students,maHV',
            'hoDem' => 'required|string|max:100',
            'ten' => 'required|string|max:50',
            'ngaySinh' => 'required|date',
            'gioiTinh' => 'required|string|max:10',
            'soGiayToTuyThan' => 'required|string|max:20',
            'dienThoai' => 'required|string|max:20|unique:students,dienThoai',
            'email' => 'nullable|email|max:100|unique:students,email', // Email sẽ tự động tạo
            'quocTich' => 'nullable|string|max:50',
            'danToc' => 'nullable|string|max:50',
            'tonGiao' => 'nullable|string|max:50',
            'maTrinhDoDaoTao' => 'required|string|max:10|exists:trinh_do_dao_tao,maTrinhDoDaoTao',
            'maNganh' => 'required|string|max:20', // Bỏ exists check vì có thể không khớp
            'trangThai' => 'required|in:DangHoc,BaoLuu,DaTotNghiep,ThoiHoc',
            'ngayNhapHoc' => 'required|date',
            'namVaoTruong' => 'required|integer|min:2000|max:2100',
            'idLop' => 'nullable|exists:classes,id',
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

            // Use validated data only
            $validatedData = $validator->validated();

            // Add createdBy from authenticated user (if exists)
            if (auth()->check()) {
                $validatedData['createdBy'] = auth()->id();
            }

            $student = HocVien::create($validatedData);

            // Tự động tạo user cho học sinh
            $fullName = trim($student->hoDem . ' ' . $student->ten);
            $email = UserHelper::generateEmailFromName($fullName);
            UserHelper::createUserAccount(
                fullName: $fullName,
                email: $email,
                lecturerId: null,
                roleId: 3 // Role ID 3 cho học sinh
            );

            $student->load(['trinhDoDaoTao', 'nganh', 'lop']);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $student,
                'message' => 'Thêm học viên thành công',
            ], 201);
        } catch (\Illuminate\Database\QueryException $e) {
            DB::rollBack();

            // Log the error for debugging
            \Log::error('Student creation failed - Database error', [
                'error' => $e->getMessage(),
                'sql' => $e->getSql(),
                'bindings' => $e->getBindings(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Lỗi database khi tạo học viên',
                'error' => $e->getMessage(),
                'details' => config('app.debug') ? $e->getTrace() : null,
            ], 500);
        } catch (\Exception $e) {
            DB::rollBack();

            // Log the error for debugging
            \Log::error('Student creation failed - General error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error creating student',
                'error' => $e->getMessage(),
                'details' => config('app.debug') ? $e->getTrace() : null,
            ], 500);
        }
    }

    /**
     * Display the specified student
     *
     * @param string $maHV
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($maHV)
    {
        try {
            $student = HocVien::with(['trinhDoDaoTao', 'nganh', 'lop'])
                ->findOrFail($maHV);

            return response()->json([
                'success' => true,
                'data' => $student,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found',
                'error' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Update the specified student
     *
     * @param Request $request
     * @param string $maHV
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $maHV)
    {
        $student = HocVien::findOrFail($maHV);

        $validator = Validator::make($request->all(), [
            'hoDem' => 'sometimes|string|max:100',
            'ten' => 'sometimes|string|max:50',
            'ngaySinh' => 'sometimes|date',
            'gioiTinh' => 'sometimes|string|max:10',
            'soGiayToTuyThan' => 'sometimes|string|max:20',
            'dienThoai' => 'sometimes|string|max:20|unique:students,dienThoai,' . $maHV . ',maHV',
            'email' => 'sometimes|email|max:100|unique:students,email,' . $maHV . ',maHV',
            'quocTich' => 'nullable|string|max:50',
            'danToc' => 'nullable|string|max:50',
            'tonGiao' => 'nullable|string|max:50',
            'maTrinhDoDaoTao' => 'sometimes|string|max:10|exists:trinh_do_dao_tao,maTrinhDoDaoTao',
            'maNganh' => 'sometimes|string|exists:majors,maNganh',
            'trangThai' => 'sometimes|in:DangHoc,BaoLuu,DaTotNghiep,ThoiHoc',
            'ngayNhapHoc' => 'sometimes|date',
            'namVaoTruong' => 'sometimes|integer|min:2000|max:2100',
            'idLop' => 'nullable|exists:classes,id',
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

            $student->update($request->all());
            $student->load(['trinhDoDaoTao', 'nganh', 'lop']);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $student,
                'message' => 'Cập nhật học viên thành công',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Error updating student',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified student
     *
     * @param string $maHV
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($maHV)
    {
        try {
            $student = HocVien::findOrFail($maHV);

            DB::beginTransaction();

            $student->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Xóa học viên thành công',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Error deleting student',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get ThacSy list from external API (with CORS proxy)
     */
    public function getThacSy(Request $request)
    {
        $namVao = $request->get('namVao', 2022);
        $maNganh = $request->get('maNganh', '8310110');

        try {
            $response = Http::timeout(10)->get('http://203.162.246.113:8088/HoSoHocVien/ThacSy', [
                'NamVao' => $namVao,
                'MaNganh' => $maNganh,
            ]);

            if ($response->successful()) {
                return response()->json([
                    'success' => true,
                    'data' => $response->json(),
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch data from external API',
                'error' => $response->body(),
            ], $response->status());
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error connecting to external API',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get student by code from database (removed external API dependency)
     */
    public function getByCode(Request $request, $maHV)
    {
        try {
            // Try to get from students table first (new structure)
            $student = DB::table('students')
                ->where('maHV', $maHV)
                ->first();

            if ($student) {
                return response()->json([
                    'success' => true,
                    'data' => $student,
                ]);
            }

            // If not found, return 404
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy học viên với mã: ' . $maHV,
            ], 404);
        } catch (\Exception $e) {
            \Log::error('Error fetching student by code: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy thông tin học viên từ database',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }
}
