<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\PartnerVehicleHandoverResource;
use App\Models\PartnerVehicleHandover;
use App\Models\Order;
use App\Models\Vehicle;
use App\Models\Provider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class PartnerVehicleHandoverController extends Controller
{
    /**
     * Danh sách bàn giao xe
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');
        $status = $request->get('status');
        $handoverType = $request->get('handover_type');
        $providerId = $request->get('provider_id');
        $orderId = $request->get('order_id');

        $query = PartnerVehicleHandover::with([
            'order.customer',
            'vehicle.brand',
            'vehicle.model',
            'provider',
            'deliverer',
            'receiverTechnician'
        ]);

        // Search
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('handover_number', 'like', "%{$search}%")
                  ->orWhereHas('vehicle', function($q) use ($search) {
                      $q->where('license_plate', 'like', "%{$search}%");
                  })
                  ->orWhere('received_by_name', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($status) {
            $query->where('status', $status);
        }

        // Filter by handover type
        if ($handoverType) {
            $query->where('handover_type', $handoverType);
        }

        // Filter by provider
        if ($providerId) {
            $query->where('provider_id', $providerId);
        }

        // Filter by order
        if ($orderId) {
            $query->where('order_id', $orderId);
        }

        // Sort
        $sortBy = $request->get('sort_by', 'handover_date');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $handovers = $query->paginate($perPage);

        return PartnerVehicleHandoverResource::collection($handovers);
    }

    /**
     * Xem chi tiết bàn giao
     */
    public function show($id)
    {
        $handover = PartnerVehicleHandover::with([
            'order.customer',
            'order.orderItems',
            'vehicle.brand',
            'vehicle.model',
            'provider',
            'deliverer',
            'receiverTechnician'
        ])->findOrFail($id);

        return new PartnerVehicleHandoverResource($handover);
    }

    /**
     * Tạo biên bản bàn giao mới
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|exists:orders,id',
            'vehicle_id' => 'required|exists:vehicles,id',
            'provider_id' => 'required|exists:providers,id',
            'handover_type' => 'required|in:delivery,return',
            'delivered_by' => 'nullable|exists:users,id',
            'delivered_by_name' => 'required|string|max:100',
            'delivered_by_phone' => 'required|string|max:20',
            'received_by_name' => 'required|string|max:100',
            'received_by_phone' => 'required|string|max:20',
            'received_by_position' => 'nullable|string|max:50',
            'technician_license_number' => 'nullable|string|max:50',
            'mileage' => 'required|integer|min:0',
            'fuel_level' => 'nullable|numeric|min:0|max:100',
            'vehicle_condition' => 'nullable|string',
            'included_items' => 'nullable|string',
            'vehicle_documents' => 'nullable|string',
            'work_description' => 'required|string',
            'special_instructions' => 'nullable|string',
            'expected_completion' => 'nullable|date',
            'handover_image_urls' => 'nullable|string',
            'damage_image_urls' => 'nullable|string',
            'delivery_notes' => 'nullable|string',
            'receive_notes' => 'nullable|string',
            'admin_notes' => 'nullable|string',
            'handover_date' => 'required|date',
            'planned_return_date' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Generate handover number
            $date = date('Ymd');
            $lastHandover = PartnerVehicleHandover::whereDate('created_at', today())
                ->orderBy('id', 'desc')
                ->first();

            $sequence = $lastHandover ? (int)substr($lastHandover->handover_number, -3) + 1 : 1;
            $handoverNumber = 'BG-' . $date . '-' . str_pad($sequence, 3, '0', STR_PAD_LEFT);

            $data = $request->all();
            $data['handover_number'] = $handoverNumber;
            $data['status'] = 'draft';

            $handover = PartnerVehicleHandover::create($data);

            // Update order partner_handover_date if handover_type is delivery
            if ($request->handover_type === 'delivery') {
                Order::where('id', $request->order_id)->update([
                    'partner_handover_date' => $request->handover_date
                ]);
            }

            // Update order partner_return_date if handover_type is return
            if ($request->handover_type === 'return') {
                Order::where('id', $request->order_id)->update([
                    'partner_return_date' => $request->handover_date
                ]);
            }

            DB::commit();

            $handover->load(['order', 'vehicle', 'provider']);

            return response()->json([
                'success' => true,
                'message' => 'Handover created successfully',
                'data' => new PartnerVehicleHandoverResource($handover),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create handover: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cập nhật biên bản bàn giao
     */
    public function update(Request $request, $id)
    {
        $handover = PartnerVehicleHandover::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'received_by_name' => 'nullable|string|max:100',
            'received_by_phone' => 'nullable|string|max:20',
            'received_by_position' => 'nullable|string|max:50',
            'technician_license_number' => 'nullable|string|max:50',
            'mileage' => 'nullable|integer|min:0',
            'fuel_level' => 'nullable|numeric|min:0|max:100',
            'vehicle_condition' => 'nullable|string',
            'included_items' => 'nullable|string',
            'vehicle_documents' => 'nullable|string',
            'work_description' => 'nullable|string',
            'special_instructions' => 'nullable|string',
            'expected_completion' => 'nullable|date',
            'handover_image_urls' => 'nullable|string',
            'damage_image_urls' => 'nullable|string',
            'delivered_by_signature' => 'nullable|string',
            'received_by_signature' => 'nullable|string',
            'delivery_notes' => 'nullable|string',
            'receive_notes' => 'nullable|string',
            'admin_notes' => 'nullable|string',
            'status' => 'nullable|in:draft,pending,confirmed,in_progress,completed,disputed',
            'handover_date' => 'nullable|date',
            'planned_return_date' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $handover->update($request->all());
            $handover->load(['order', 'vehicle', 'provider']);

            return response()->json([
                'success' => true,
                'message' => 'Handover updated successfully',
                'data' => new PartnerVehicleHandoverResource($handover),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update handover: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xác nhận bàn giao
     */
    public function acknowledge(Request $request, $id)
    {
        $handover = PartnerVehicleHandover::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'received_by_signature' => 'required|string',
            'receive_notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $handover->update([
                'is_acknowledged' => true,
                'acknowledged_at' => now(),
                'received_by_signature' => $request->received_by_signature,
                'receive_notes' => $request->receive_notes,
                'status' => 'confirmed',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Handover acknowledged successfully',
                'data' => new PartnerVehicleHandoverResource($handover),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to acknowledge handover: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xóa biên bản bàn giao
     */
    public function destroy($id)
    {
        try {
            $handover = PartnerVehicleHandover::findOrFail($id);

            // Only allow deletion if status is draft
            if ($handover->status !== 'draft') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only draft handovers can be deleted'
                ], 403);
            }

            $handover->delete();

            return response()->json([
                'success' => true,
                'message' => 'Handover deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete handover: ' . $e->getMessage()
            ], 500);
        }
    }
}

