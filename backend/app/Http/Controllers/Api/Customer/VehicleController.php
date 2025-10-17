<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use App\Traits\HasPermissions;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * Vehicle Management Controller
 *
 * Quản lý phương tiện của khách hàng
 * Permissions: vehicles.*
 */
class VehicleController extends Controller
{
    use HasPermissions;

    public function index(Request $request)
    {
        $this->authorizePermission('vehicles.view');

        $perPage = $request->input('per_page', 20);
        $search = $request->input('search');
        $customerId = $request->input('customer_id');
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');

        // ✅ 1 query duy nhất với eager loading tối ưu
        $query = Vehicle::query()
            ->with(['customer:id,name,phone', 'brand:id,name', 'model:id,name'])
            ->withCount(['orders', 'serviceRequests']);

        // Search
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('license_plate', 'like', "%{$search}%")
                  ->orWhere('vin', 'like', "%{$search}%")
                  ->orWhere('engine_number', 'like', "%{$search}%")
                  ->orWhereHas('customer', fn($q) => $q->where('name', 'like', "%{$search}%"));
            });
        }

        // Filter
        $query->when($customerId, fn($q) => $q->where('customer_id', $customerId));

        // Sort
        $query->orderBy($sortBy, $sortDirection);

        // ✅ Trả về trực tiếp Laravel pagination
        return $query->paginate($perPage);
    }

    public function show($id)
    {
        $this->authorizePermission('vehicles.view');

        $vehicle = Vehicle::with(['customer', 'brand', 'model', 'serviceHistory'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $vehicle
        ]);
    }

    public function store(Request $request)
    {
        $this->authorizePermission('vehicles.create');

        $validator = Validator::make($request->all(), [
            'customer_id' => 'required|exists:customers,id',
            'license_plate' => 'required|string|unique:vehicles,license_plate',
            'brand_id' => 'required|exists:vehicle_brands,id',
            'model_id' => 'required|exists:vehicle_models,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $vehicle = Vehicle::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Tạo phương tiện thành công',
            'data' => $vehicle->load(['customer', 'brand', 'model'])
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $this->authorizePermission('vehicles.edit');

        $vehicle = Vehicle::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'license_plate' => 'string|unique:vehicles,license_plate,' . $id,
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $vehicle->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật phương tiện thành công',
            'data' => $vehicle->load(['customer', 'brand', 'model'])
        ]);
    }

    public function destroy($id)
    {
        $this->authorizePermission('vehicles.delete');

        $vehicle = Vehicle::findOrFail($id);
        $vehicle->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa phương tiện thành công'
        ]);
    }
}
