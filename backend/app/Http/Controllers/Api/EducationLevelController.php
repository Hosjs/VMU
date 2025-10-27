<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TrinhDoDaoTao;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EducationLevelController extends Controller
{
    /**
     * Lấy danh sách trình độ đào tạo với pagination
     * GET /api/education-levels
     */
    public function index(Request $request): JsonResponse
    {
        try {
            \Log::info('EducationLevelController@index called', [
                'request_data' => $request->all(),
                'user' => auth()->check() ? auth()->user()->id : 'guest'
            ]);

            $perPage = $request->input('per_page', 10);
            $search = $request->input('search');

            $query = TrinhDoDaoTao::query();

            \Log::info('Query initialized');

            // Search
            if ($search) {
                $query->where(function($q) use ($search) {
                    $q->where('maTrinhDoDaoTao', 'like', "%{$search}%")
                      ->orWhere('tenTrinhDo', 'like', "%{$search}%")
                      ->orWhere('moTa', 'like', "%{$search}%");
                });
            }

            // Sorting
            $sortBy = $request->input('sort_by', 'maTrinhDoDaoTao');
            $sortDirection = $request->input('sort_direction', 'asc');
            $query->orderBy($sortBy, $sortDirection);

            \Log::info('Before pagination');
            $trinhDo = $query->paginate($perPage);
            \Log::info('After pagination', ['count' => $trinhDo->count()]);

            return response()->json([
                'success' => true,
                'data' => $trinhDo->items(),
                'current_page' => $trinhDo->currentPage(),
                'last_page' => $trinhDo->lastPage(),
                'per_page' => $trinhDo->perPage(),
                'total' => $trinhDo->total(),
                'from' => $trinhDo->firstItem(),
                'to' => $trinhDo->lastItem(),
                'first_page_url' => $trinhDo->url(1),
                'last_page_url' => $trinhDo->url($trinhDo->lastPage()),
                'next_page_url' => $trinhDo->nextPageUrl(),
                'prev_page_url' => $trinhDo->previousPageUrl(),
                'path' => $trinhDo->path(),
            ]);
        } catch (\Exception $e) {
            \Log::error('EducationLevelController@index error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Không thể tải danh sách trình độ đào tạo',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Lấy danh sách đơn giản (cho dropdown)
     * GET /api/education-levels/simple
     */
    public function simple(): JsonResponse
    {
        try {
            $trinhDo = TrinhDoDaoTao::select('maTrinhDoDaoTao', 'tenTrinhDo')
                ->where('trangThai', true)
                ->orderBy('tenTrinhDo', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $trinhDo,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể tải danh sách trình độ đào tạo',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Lấy chi tiết một trình độ
     * GET /api/education-levels/{ma}
     */
    public function show($ma): JsonResponse
    {
        try {
            $trinhDo = TrinhDoDaoTao::findOrFail($ma);

            return response()->json([
                'success' => true,
                'data' => $trinhDo,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy trình độ đào tạo',
            ], 404);
        }
    }

    /**
     * Tạo mới trình độ
     * POST /api/education-levels
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'maTrinhDoDaoTao' => 'required|string|max:10|unique:trinh_do_dao_tao,maTrinhDoDaoTao',
            'tenTrinhDo' => 'required|string|max:100',
            'moTa' => 'nullable|string|max:255',
            'trangThai' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $trinhDo = TrinhDoDaoTao::create($request->all());

            return response()->json([
                'success' => true,
                'data' => $trinhDo,
                'message' => 'Tạo trình độ đào tạo thành công',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể tạo trình độ đào tạo',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Cập nhật trình độ
     * PUT /api/education-levels/{ma}
     */
    public function update(Request $request, $ma): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'tenTrinhDo' => 'required|string|max:100',
            'moTa' => 'nullable|string|max:255',
            'trangThai' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $trinhDo = TrinhDoDaoTao::findOrFail($ma);
            $trinhDo->update($request->all());

            return response()->json([
                'success' => true,
                'data' => $trinhDo,
                'message' => 'Cập nhật trình độ đào tạo thành công',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể cập nhật trình độ đào tạo',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Xóa trình độ (soft delete)
     * DELETE /api/education-levels/{ma}
     */
    public function destroy($ma): JsonResponse
    {
        try {
            $trinhDo = TrinhDoDaoTao::findOrFail($ma);
            $trinhDo->delete();

            return response()->json([
                'success' => true,
                'message' => 'Xóa trình độ đào tạo thành công',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa trình độ đào tạo',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
