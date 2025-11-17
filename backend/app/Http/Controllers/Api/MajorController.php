<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Major;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MajorController extends Controller
{
    /**
     * Display a listing of majors
     */
    public function index(Request $request): JsonResponse
    {
        $query = Major::query()->with(['parent', 'children']);

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('maNganh', 'like', "%{$search}%")
                  ->orWhere('tenNganh', 'like', "%{$search}%")
                  ->orWhere('ghiChu', 'like', "%{$search}%");
            });
        }

        // Filter by training level (Thạc sỹ: mã bắt đầu bằng 8, Tiến sỹ: mã bắt đầu bằng 9)
        if ($request->has('dao_tao_thac_sy') && $request->dao_tao_thac_sy) {
            $query->where('maNganh', 'like', '8%');
        }

        if ($request->has('dao_tao_tien_sy') && $request->dao_tao_tien_sy) {
            $query->where('maNganh', 'like', '9%');
        }

        // Filter by parent (top level or child)
        if ($request->has('parent_id')) {
            if ($request->parent_id === 'null' || $request->parent_id === null) {
                $query->whereNull('parent_id');
            } else {
                $query->where('parent_id', $request->parent_id);
            }
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        // ✅ Trả về pagination trực tiếp (như api.service.ts đang expect)
        $result = $query->paginate($request->per_page ?? 20);

        return response()->json($result);
    }

    /**
     * Store a newly created major
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ma_nganh' => 'required|string|max:20|unique:majors,maNganh',
            'ten_nganh' => 'required|string|max:255',
            'thoi_gian_dao_tao' => 'nullable|numeric|min:0|max:10',
            'mo_ta' => 'nullable|string',
            'parent_id' => 'nullable|exists:majors,id',
        ]);

        $major = Major::create([
            'maNganh' => $validated['ma_nganh'],
            'tenNganh' => $validated['ten_nganh'],
            'thoi_gian_dao_tao' => $validated['thoi_gian_dao_tao'] ?? null,
            'ghiChu' => $validated['mo_ta'] ?? null,
            'parent_id' => $validated['parent_id'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'data' => $major->load(['parent', 'children']),
            'message' => 'Tạo ngành học thành công'
        ], 201);
    }

    /**
     * Display the specified major
     */
    public function show($id): JsonResponse
    {
        $major = Major::with(['parent', 'children'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $major
        ]);
    }

    /**
     * Update the specified major
     */
    public function update(Request $request, $id): JsonResponse
    {
        $major = Major::findOrFail($id);

        $validated = $request->validate([
            'ma_nganh' => 'string|max:20|unique:majors,maNganh,' . $major->id,
            'ten_nganh' => 'string|max:255',
            'thoi_gian_dao_tao' => 'nullable|numeric|min:0|max:10',
            'mo_ta' => 'nullable|string',
            'parent_id' => 'nullable|exists:majors,id',
        ]);

        $updateData = [];
        if (isset($validated['ma_nganh'])) $updateData['maNganh'] = $validated['ma_nganh'];
        if (isset($validated['ten_nganh'])) $updateData['tenNganh'] = $validated['ten_nganh'];
        if (isset($validated['thoi_gian_dao_tao'])) $updateData['thoi_gian_dao_tao'] = $validated['thoi_gian_dao_tao'];
        if (isset($validated['mo_ta'])) $updateData['ghiChu'] = $validated['mo_ta'];
        if (array_key_exists('parent_id', $validated)) $updateData['parent_id'] = $validated['parent_id'];

        $major->update($updateData);

        return response()->json([
            'success' => true,
            'data' => $major->load(['parent', 'children']),
            'message' => 'Cập nhật ngành học thành công'
        ]);
    }

    /**
     * Remove the specified major (soft delete)
     */
    public function destroy($id): JsonResponse
    {
        $major = Major::findOrFail($id);

        // Check if has children
        if ($major->children()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa ngành học có chương trình con'
            ], 400);
        }

        $major->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa ngành học thành công'
        ]);
    }

    /**
     * Get subjects of a major
     */
    public function getSubjects($id): JsonResponse
    {
        $major = Major::findOrFail($id);

        $subjects = $major->subjects()
            ->orderBy('maMon', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $subjects,
            'major' => [
                'id' => $major->id,
                'ma' => $major->maNganh,
                'tenNganhHoc' => $major->tenNganh,
            ]
        ]);
    }
}
