<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lecturer;
use App\Helpers\UserHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class LecturerController extends Controller
{
    /**
     * Display a listing of lecturers
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            $query = Lecturer::with(['major']);

            // Apply filters using scopes
            $query->search($request->search)
                  ->byNganh($request->maNganh)
                  ->byHocHam($request->hocHam)
                  ->byTrinhDoChuyenMon($request->trinhDoChuyenMon);

            // Sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortDirection = $request->get('sort_direction', 'desc');
            $query->orderBy($sortBy, $sortDirection);

            // Pagination
            $perPage = $request->get('per_page', 20);
            $lecturers = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $lecturers->items(),
                'current_page' => $lecturers->currentPage(),
                'from' => $lecturers->firstItem(),
                'last_page' => $lecturers->lastPage(),
                'per_page' => $lecturers->perPage(),
                'to' => $lecturers->lastItem(),
                'total' => $lecturers->total(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching lecturers',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created lecturer
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'hoTen' => 'required|string|max:255',
            'trinhDoChuyenMon' => 'nullable|string|max:100',
            'hocHam' => 'nullable|string|max:100',
            'maNganh' => 'nullable|integer',
            'ghiChu' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Additional validation for maNganh if it's provided
        if ($request->filled('maNganh')) {
            $majorExists = \App\Models\Major::where('id', $request->maNganh)->exists();
            if (!$majorExists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => ['maNganh' => ['Ngành học không tồn tại.']],
                ], 422);
            }
        }

        try {
            DB::beginTransaction();

            $lecturer = Lecturer::create([
                'hoTen' => $request->hoTen,
                'trinhDoChuyenMon' => $request->trinhDoChuyenMon,
                'hocHam' => $request->hocHam,
                'maNganh' => $request->maNganh,
                'ghiChu' => $request->ghiChu,
            ]);

            // Tự động tạo user cho giảng viên
            $email = UserHelper::generateEmailFromName($lecturer->hoTen);
            UserHelper::createUserAccount(
                fullName: $lecturer->hoTen,
                email: $email,
                lecturerId: $lecturer->id,
                roleId: 2 // Role ID 2 cho giảng viên
            );

            $lecturer->load(['major']);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $lecturer,
                'message' => 'Thêm giảng viên thành công',
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Error creating lecturer',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified lecturer
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        try {
            $lecturer = Lecturer::with(['major'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $lecturer,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lecturer not found',
                'error' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Update the specified lecturer
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $lecturer = Lecturer::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'hoTen' => 'sometimes|string|max:255',
            'trinhDoChuyenMon' => 'nullable|string|max:100',
            'hocHam' => 'nullable|string|max:100',
            'maNganh' => 'nullable|integer',
            'ghiChu' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Additional validation for maNganh if it's provided
        if ($request->filled('maNganh')) {
            $majorExists = \App\Models\Major::where('id', $request->maNganh)->exists();
            if (!$majorExists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => ['maNganh' => ['Ngành học không tồn tại.']],
                ], 422);
            }
        }

        try {
            DB::beginTransaction();

            $lecturer->update($request->all());
            $lecturer->load(['major']);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $lecturer,
                'message' => 'Cập nhật giảng viên thành công',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Error updating lecturer',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified lecturer
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        try {
            $lecturer = Lecturer::findOrFail($id);

            DB::beginTransaction();

            $lecturer->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Xóa giảng viên thành công',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Error deleting lecturer',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get simplified list of lecturers for dropdown/autocomplete
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function simple()
    {
        try {
            $lecturers = Lecturer::select('id', 'hoTen', 'trinhDoChuyenMon', 'hocHam')
                ->orderBy('hoTen', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $lecturers,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể lấy danh sách giảng viên',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

