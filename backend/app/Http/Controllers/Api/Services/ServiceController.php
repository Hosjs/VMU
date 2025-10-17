<?php

namespace App\Http\Controllers\Api\Services;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Traits\HasPermissions;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * Service Management Controller
 *
 * Quản lý dịch vụ sửa chữa
 * Permissions: services.*
 */
class ServiceController extends Controller
{
    use HasPermissions;

    public function index(Request $request)
    {
        $this->authorizePermission('services.view');

        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');
        $categoryId = $request->get('category_id');
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');

        // ✅ 1 query duy nhất với eager loading
        $query = Service::query()
            ->with(['category:id,name'])
            ->withCount('serviceRequests');

        // Search
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter
        $query->when($categoryId, fn($q) => $q->where('category_id', $categoryId));

        // Sort
        $query->orderBy($sortBy, $sortDirection);

        // ✅ Trả về trực tiếp Laravel pagination
        return $query->paginate($perPage);
    }

    public function show($id)
    {
        $this->authorizePermission('services.view');

        $service = Service::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $service
        ]);
    }

    public function store(Request $request)
    {
        $this->authorizePermission('services.create');

        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'code' => 'required|unique:services,code',
            'price' => 'required|numeric|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $service = Service::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Tạo dịch vụ thành công',
            'data' => $service
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $this->authorizePermission('services.edit');

        $service = Service::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'code' => 'unique:services,code,' . $id,
            'price' => 'numeric|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $service->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật dịch vụ thành công',
            'data' => $service
        ]);
    }

    public function destroy($id)
    {
        $this->authorizePermission('services.delete');

        $service = Service::findOrFail($id);
        $service->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa dịch vụ thành công'
        ]);
    }

    public function statistics()
    {
        $this->authorizePermission('services.view');

        $total = Service::count();
        $active = Service::where('is_active', true)->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total' => $total,
                'active' => $active
            ]
        ]);
    }
}
