<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lop;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class LopController extends Controller
{
    /**
     * Get list of classes with optional filters
     * GET /api/classes
     */
    public function index(Request $request): JsonResponse
    {
        $query = Lop::with(['trinhDoDaoTao', 'nganhHoc']);

        // Filter by training level
        if ($request->has('maTrinhDoDaoTao')) {
            $query->where('maTrinhDoDaoTao', $request->maTrinhDoDaoTao);
        }

        // Filter by major
        if ($request->has('maNganhHoc')) {
            $query->where('maNganhHoc', $request->maNganhHoc);
        }

        // Filter by academic year
        if ($request->has('khoaHoc')) {
            $query->where('khoaHoc', $request->khoaHoc);
        }

        // Filter by status
        if ($request->has('trangThai')) {
            $query->where('trangThai', $request->trangThai);
        }

        // Search by class name
        if ($request->has('search')) {
            $query->where('tenLop', 'like', '%' . $request->search . '%');
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        // Pagination
        $perPage = $request->get('per_page', 15);
        $classes = $query->paginate($perPage);

        return response()->json($classes);
    }

    /**
     * Get a single class with students
     * GET /api/classes/{id}
     */
    public function show(int $id): JsonResponse
    {
        $lop = Lop::with(['trinhDoDaoTao', 'nganhHoc', 'hocViens'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $lop
        ]);
    }

    /**
     * Get students in a class
     * GET /api/classes/{id}/students
     */
    public function getStudents(int $id): JsonResponse
    {
        $lop = Lop::findOrFail($id);
        $students = $lop->hocViens()->get();

        return response()->json([
            'success' => true,
            'data' => [
                'class' => [
                    'id' => $lop->id,
                    'tenLop' => $lop->tenLop,
                    'khoaHoc' => $lop->khoaHoc,
                ],
                'students' => $students,
                'count' => $students->count()
            ]
        ]);
    }

    /**
     * Get simple list of classes for dropdown
     * GET /api/classes/simple
     */
    public function simple(Request $request): JsonResponse
    {
        $query = Lop::select('id', 'tenLop', 'khoaHoc', 'maTrinhDoDaoTao', 'maNganhHoc');

        // Filter by training level
        if ($request->has('maTrinhDoDaoTao')) {
            $query->where('maTrinhDoDaoTao', $request->maTrinhDoDaoTao);
        }

        // Filter by major
        if ($request->has('maNganhHoc')) {
            $query->where('maNganhHoc', $request->maNganhHoc);
        }

        // Only active classes
        $query->where('trangThai', 'active');

        $classes = $query->orderBy('tenLop')->get();

        return response()->json([
            'success' => true,
            'data' => $classes
        ]);
    }
}

