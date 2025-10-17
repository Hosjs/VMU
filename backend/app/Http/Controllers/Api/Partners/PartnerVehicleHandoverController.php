<?php

namespace App\Http\Controllers\Api\Partners;

use App\Http\Controllers\Controller;
use App\Models\PartnerVehicleHandover;
use App\Traits\HasPermissions;
use Illuminate\Http\Request;

/**
 * Partner Vehicle Handover Controller
 *
 * Quản lý bàn giao xe với đối tác
 * Permissions: orders.* (vì liên quan đến orders)
 */
class PartnerVehicleHandoverController extends Controller
{
    use HasPermissions;

    public function index(Request $request)
    {
        $this->authorizePermission('orders.view');

        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');
        $status = $request->get('status');
        $providerId = $request->get('provider_id');
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');

        // ✅ 1 query duy nhất với eager loading tối ưu
        $query = PartnerVehicleHandover::query()
            ->with(['order:id,order_number,customer_id', 'order.customer:id,name,phone',
                   'vehicle:id,license_plate,brand_id,model_id', 'vehicle.brand:id,name', 'vehicle.model:id,name',
                   'provider:id,name', 'deliverer:id,name', 'receiverTechnician:id,name']);

        // Search
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('handover_number', 'like', "%{$search}%")
                  ->orWhereHas('vehicle', fn($q) => $q->where('license_plate', 'like', "%{$search}%"));
            });
        }

        // Filters
        $query->when($status, fn($q) => $q->where('status', $status))
              ->when($providerId, fn($q) => $q->where('provider_id', $providerId));

        // Sort
        $query->orderBy($sortBy, $sortDirection);

        // ✅ Trả về trực tiếp Laravel pagination
        return $query->paginate($perPage);
    }

    public function show($id)
    {
        $this->authorizePermission('orders.view');

        $handover = PartnerVehicleHandover::with([
            'order',
            'vehicle',
            'provider',
            'deliverer',
            'receiverTechnician'
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $handover
        ]);
    }

    public function store(Request $request)
    {
        $this->authorizePermission('orders.edit');

        $handover = PartnerVehicleHandover::create(array_merge(
            $request->all(),
            ['delivered_by' => auth()->id()]
        ));

        return response()->json([
            'success' => true,
            'message' => 'Tạo phiếu bàn giao thành công',
            'data' => $handover
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $this->authorizePermission('orders.edit');

        $handover = PartnerVehicleHandover::findOrFail($id);
        $handover->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật phiếu bàn giao thành công',
            'data' => $handover
        ]);
    }

    public function destroy($id)
    {
        $this->authorizePermission('orders.delete');

        $handover = PartnerVehicleHandover::findOrFail($id);
        $handover->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa phiếu bàn giao thành công'
        ]);
    }

    public function acknowledge(Request $request, $id)
    {
        $this->authorizePermission('orders.edit');

        $handover = PartnerVehicleHandover::findOrFail($id);
        $handover->update([
            'status' => 'acknowledged',
            'acknowledged_at' => now(),
            'receiver_technician_id' => $request->receiver_technician_id,
            'received_by_name' => $request->received_by_name
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Xác nhận nhận xe thành công',
            'data' => $handover
        ]);
    }
}
