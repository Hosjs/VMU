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

        $query = PartnerVehicleHandover::with([
            'order.customer',
            'vehicle.brand',
            'vehicle.model',
            'provider',
            'deliverer',
            'receiverTechnician'
        ]);

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('handover_number', 'like', "%{$search}%")
                  ->orWhereHas('vehicle', function($q) use ($search) {
                      $q->where('license_plate', 'like', "%{$search}%");
                  });
            });
        }

        if ($status) {
            $query->where('status', $status);
        }

        if ($providerId) {
            $query->where('provider_id', $providerId);
        }

        $handovers = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $handovers
        ]);
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

