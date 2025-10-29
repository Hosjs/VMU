<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PhanLop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ClassAssignmentController extends Controller
{
    private $externalApiUrl = 'http://203.162.246.113:8088';

    /**
     * Display a listing of class assignments
     * GET /api/class-assignments?lopId=3
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            $lopId = $request->get('lopId');

            if (!$lopId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vui lòng chọn lớp học',
                ], 400);
            }

            // Fetch from external API
            $response = Http::timeout(15)->get("{$this->externalApiUrl}/LopHoc/HocVien", [
                'LopID' => $lopId
            ]);

            if (!$response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không thể kết nối đến API nguồn',
                    'error' => $response->body()
                ], $response->status());
            }

            $data = $response->json();

            return response()->json([
                'success' => true,
                'data' => is_array($data) ? $data : [],
                'message' => 'Lấy danh sách học viên trong lớp thành công'
            ]);

        } catch (\Exception $e) {
            Log::error('Class Assignment API Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Đã xảy ra lỗi khi lấy danh sách học viên',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified class assignment
     * GET /api/class-assignments/{id}
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        try {
            $assignment = PhanLop::with(['lop', 'hocVien'])
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $assignment,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy phân lớp',
                'error' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Store a newly created class assignment
     * POST /api/class-assignments
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'idLop' => 'required|integer|exists:lop,id',
            'maHV' => 'required|string|max:20|exists:hoc_vien,maHV',
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

            // Check if already assigned
            $exists = PhanLop::where('idLop', $request->idLop)
                ->where('maHV', $request->maHV)
                ->exists();

            if ($exists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Học viên đã được phân vào lớp này',
                ], 400);
            }

            $assignment = PhanLop::create([
                'idLop' => $request->idLop,
                'maHV' => $request->maHV,
            ]);

            $assignment->load(['lop', 'hocVien']);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $assignment,
                'message' => 'Phân lớp học viên thành công',
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi phân lớp học viên',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update the specified class assignment
     * PUT /api/class-assignments/{id}
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $assignment = PhanLop::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'idLop' => 'sometimes|integer|exists:lop,id',
            'maHV' => 'sometimes|string|max:20|exists:hoc_vien,maHV',
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

            $assignment->update($request->all());
            $assignment->load(['lop', 'hocVien']);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $assignment,
                'message' => 'Cập nhật phân lớp thành công',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi cập nhật phân lớp',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified class assignment
     * DELETE /api/class-assignments/{id}
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        try {
            $assignment = PhanLop::findOrFail($id);

            DB::beginTransaction();

            $assignment->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Xóa phân lớp thành công',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi xóa phân lớp',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Assign multiple students to a class
     * POST /api/class-assignments/bulk
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function bulkAssign(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'idLop' => 'required|integer|exists:lop,id',
            'students' => 'required|array|min:1',
            'students.*' => 'required|string|exists:hoc_vien,maHV',
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

            $assignments = [];
            $errors = [];

            foreach ($request->students as $maHV) {
                // Check if already assigned
                $exists = PhanLop::where('idLop', $request->idLop)
                    ->where('maHV', $maHV)
                    ->exists();

                if ($exists) {
                    $errors[] = "Học viên {$maHV} đã được phân vào lớp này";
                    continue;
                }

                $assignments[] = PhanLop::create([
                    'idLop' => $request->idLop,
                    'maHV' => $maHV,
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $assignments,
                'errors' => $errors,
                'message' => "Đã phân lớp thành công cho " . count($assignments) . " học viên",
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi phân lớp hàng loạt',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove multiple students from a class
     * POST /api/class-assignments/bulk-remove
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function bulkRemove(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'idLop' => 'required|integer|exists:lop,id',
            'students' => 'required|array|min:1',
            'students.*' => 'required|string',
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

            $count = PhanLop::where('idLop', $request->idLop)
                ->whereIn('maHV', $request->students)
                ->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Đã xóa {$count} học viên khỏi lớp",
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi xóa học viên khỏi lớp',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

