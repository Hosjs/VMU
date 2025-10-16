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

        $query = Vehicle::with(['customer', 'brand', 'model']);

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('license_plate', 'like', "%{$search}%")
                  ->orWhere('vin', 'like', "%{$search}%");
            });
        }

        if ($customerId) {
            $query->where('customer_id', $customerId);
        }

        $vehicles = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $vehicles
        ]);
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
<?php

namespace App\Http\Controllers\Api\Sales;

use App\Http\Controllers\Controller;
use App\Models\ServiceRequest;
use App\Traits\HasPermissions;
use Illuminate\Http\Request;

/**
 * Service Request Management Controller
 *
 * Quản lý yêu cầu dịch vụ
 * Permissions: service_requests.*
 */
class ServiceRequestController extends Controller
{
    use HasPermissions;

    public function index(Request $request)
    {
        $this->authorizePermission('service_requests.view');

        $perPage = $request->input('per_page', 20);
        $search = $request->input('search');
        $status = $request->input('status');

        $query = ServiceRequest::with(['customer', 'vehicle', 'assignedTo']);

        // Scope by permission
        $query = $this->scopeByPermission(
            $query,
            'service_requests.manage_all',
            'service_requests.manage_own',
            'assigned_to'
        );

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('request_number', 'like', "%{$search}%")
                  ->orWhereHas('customer', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($status) {
            $query->where('status', $status);
        }

        $serviceRequests = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $serviceRequests
        ]);
    }

    public function show($id)
    {
        $this->authorizePermission('service_requests.view');

        $serviceRequest = ServiceRequest::with(['customer', 'vehicle', 'assignedTo'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $serviceRequest
        ]);
    }

    public function store(Request $request)
    {
        $this->authorizePermission('service_requests.create');

        $serviceRequest = ServiceRequest::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Tạo yêu cầu dịch vụ thành công',
            'data' => $serviceRequest
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $this->authorizePermission('service_requests.edit');

        $serviceRequest = ServiceRequest::findOrFail($id);
        $serviceRequest->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật yêu cầu thành công',
            'data' => $serviceRequest
        ]);
    }

    public function destroy($id)
    {
        $this->authorizePermission('service_requests.delete');

        $serviceRequest = ServiceRequest::findOrFail($id);
        $serviceRequest->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa yêu cầu thành công'
        ]);
    }

    public function approve(Request $request, $id)
    {
        $this->authorizePermission('service_requests.approve');

        $serviceRequest = ServiceRequest::findOrFail($id);
        $serviceRequest->update([
            'status' => 'approved',
            'approved_by' => auth()->id(),
            'approved_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Phê duyệt yêu cầu thành công',
            'data' => $serviceRequest
        ]);
    }

    public function assign(Request $request, $id)
    {
        $this->authorizePermission('service_requests.assign');

        $serviceRequest = ServiceRequest::findOrFail($id);
        $serviceRequest->update([
            'assigned_to' => $request->assigned_to
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Phân công thành công',
            'data' => $serviceRequest
        ]);
    }
}

