<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ServiceResource;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ServiceController extends Controller
{
    /**
     * Danh sách 6 dịch vụ chính (độc lập, không có category)
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');
        $isActive = $request->get('is_active');

        $query = Service::query();

        // Search
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($isActive !== null) {
            $query->where('is_active', $isActive == '1' || $isActive === true);
        }

        // Sort
        $sortBy = $request->get('sort_by', 'name');
        $sortDirection = $request->get('sort_direction', 'asc');
        $query->orderBy($sortBy, $sortDirection);

        $services = $query->paginate($perPage);

        return ServiceResource::collection($services);
    }

    /**
     * Tạo service mới (6 dịch vụ chính)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:50|unique:services,code',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'unit' => 'nullable|string|max:50',
            'estimated_time' => 'nullable|integer|min:0',
            'main_image' => 'nullable|string',
            'gallery_images' => 'nullable|string',
            'notes' => 'nullable|string',
            'has_warranty' => 'nullable|boolean',
            'warranty_months' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $service = Service::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Service created successfully',
                'data' => new ServiceResource($service),
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create service',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xem chi tiết service
     */
    public function show($id)
    {
        $service = Service::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => new ServiceResource($service),
        ]);
    }

    /**
     * Cập nhật service
     */
    public function update(Request $request, $id)
    {
        $service = Service::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:50|unique:services,code,' . $id,
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'unit' => 'nullable|string|max:50',
            'estimated_time' => 'nullable|integer|min:0',
            'main_image' => 'nullable|string',
            'gallery_images' => 'nullable|string',
            'notes' => 'nullable|string',
            'has_warranty' => 'nullable|boolean',
            'warranty_months' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $service->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Service updated successfully',
                'data' => new ServiceResource($service),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update service',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xóa service (soft delete bằng cách set is_active = false)
     */
    public function destroy($id)
    {
        try {
            $service = Service::findOrFail($id);
            $service->update(['is_active' => false]);

            return response()->json([
                'success' => true,
                'message' => 'Service deactivated successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to deactivate service',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Thống kê services
     */
    public function statistics()
    {
        $stats = [
            'total' => Service::count(),
            'active' => Service::where('is_active', true)->count(),
            'inactive' => Service::where('is_active', false)->count(),
            'with_warranty' => Service::where('has_warranty', true)->count(),
            'avg_estimated_time' => Service::where('is_active', true)->avg('estimated_time'),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}

