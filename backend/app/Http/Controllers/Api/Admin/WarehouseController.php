<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class WarehouseController extends Controller
{
    /**
     * Danh sách warehouses với phân trang
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');
        $status = $request->get('status');
        $type = $request->get('type');

        $query = Warehouse::with('manager');

        // Search
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($status) {
            $query->where('status', $status);
        }

        // Filter by type
        if ($type) {
            $query->where('type', $type);
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $warehouses = $query->paginate($perPage);

        return response()->json($warehouses);
    }

    /**
     * Tạo warehouse mới
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:50|unique:warehouses,code',
            'name' => 'required|string|max:255',
            'type' => 'required|in:main,branch,partner',
            'location' => 'required|string',
            'address' => 'nullable|string',
            'manager_id' => 'nullable|exists:users,id',
            'phone' => 'nullable|string|max:20',
            'capacity' => 'nullable|integer|min:0',
            'current_stock' => 'nullable|integer|min:0',
            'status' => 'nullable|in:active,inactive,maintenance',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $warehouse = Warehouse::create($request->all());
            $warehouse->load('manager');

            return response()->json([
                'success' => true,
                'message' => 'Warehouse created successfully',
                'data' => $warehouse,
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create warehouse',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xem chi tiết warehouse
     */
    public function show($id)
    {
        $warehouse = Warehouse::with(['manager', 'stocks'])->find($id);

        if (!$warehouse) {
            return response()->json([
                'success' => false,
                'message' => 'Warehouse not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $warehouse,
        ]);
    }

    /**
     * Cập nhật warehouse
     */
    public function update(Request $request, $id)
    {
        $warehouse = Warehouse::find($id);

        if (!$warehouse) {
            return response()->json([
                'success' => false,
                'message' => 'Warehouse not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:50|unique:warehouses,code,' . $id,
            'name' => 'required|string|max:255',
            'type' => 'required|in:main,branch,partner',
            'location' => 'required|string',
            'address' => 'nullable|string',
            'manager_id' => 'nullable|exists:users,id',
            'phone' => 'nullable|string|max:20',
            'capacity' => 'nullable|integer|min:0',
            'current_stock' => 'nullable|integer|min:0',
            'status' => 'nullable|in:active,inactive,maintenance',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $warehouse->update($request->all());
            $warehouse->load('manager');

            return response()->json([
                'success' => true,
                'message' => 'Warehouse updated successfully',
                'data' => $warehouse,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update warehouse',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xóa warehouse
     */
    public function destroy($id)
    {
        $warehouse = Warehouse::find($id);

        if (!$warehouse) {
            return response()->json([
                'success' => false,
                'message' => 'Warehouse not found'
            ], 404);
        }

        // Check if warehouse has stocks
        if ($warehouse->stocks()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete warehouse with existing stocks'
            ], 400);
        }

        try {
            $warehouse->delete();

            return response()->json([
                'success' => true,
                'message' => 'Warehouse deleted successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete warehouse',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Thống kê warehouses
     */
    public function statistics()
    {
        $stats = [
            'total' => Warehouse::count(),
            'active' => Warehouse::where('status', 'active')->count(),
            'inactive' => Warehouse::where('status', 'inactive')->count(),
            'maintenance' => Warehouse::where('status', 'maintenance')->count(),
            'by_type' => Warehouse::selectRaw('type, COUNT(*) as count')
                ->groupBy('type')
                ->get(),
            'total_capacity' => Warehouse::sum('capacity'),
            'total_current_stock' => Warehouse::sum('current_stock'),
            'usage_rate' => Warehouse::sum('capacity') > 0
                ? round((Warehouse::sum('current_stock') / Warehouse::sum('capacity')) * 100, 2)
                : 0,
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}

