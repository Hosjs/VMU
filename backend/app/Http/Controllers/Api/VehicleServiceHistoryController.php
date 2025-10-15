<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\VehicleServiceHistoryResource;
use App\Models\VehicleServiceHistory;
use Illuminate\Http\Request;

class VehicleServiceHistoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = VehicleServiceHistory::with(['vehicle', 'customer', 'service', 'product', 'provider']);

        // Filter by vehicle
        if ($request->has('vehicle_id')) {
            $query->byVehicle($request->vehicle_id);
        }

        // Filter by customer
        if ($request->has('customer_id')) {
            $query->byCustomer($request->customer_id);
        }

        // Filter by type
        if ($request->has('type')) {
            $query->byType($request->type);
        }

        // Filter active warranties
        if ($request->boolean('with_warranty')) {
            $query->withWarranty();
        }

        // Filter maintenance records
        if ($request->boolean('maintenance_only')) {
            $query->maintenance();
        }

        // Filter upcoming maintenance
        if ($request->boolean('upcoming_maintenance')) {
            $query->upcomingMaintenance();
        }

        // Sort
        $sortBy = $request->input('sort_by', 'service_date');
        $sortOrder = $request->input('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $histories = $query->paginate($request->input('per_page', 15));

        return VehicleServiceHistoryResource::collection($histories);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'vehicle_id' => 'required|exists:vehicles,id',
            'customer_id' => 'required|exists:customers,id',
            'order_id' => 'required|exists:orders,id',
            'order_item_id' => 'nullable|exists:order_items,id',
            'type' => 'required|in:service,product',
            'service_id' => 'required_if:type,service|exists:services,id',
            'product_id' => 'required_if:type,product|exists:products,id',
            'item_name' => 'required|string',
            'item_code' => 'required|string',
            'quantity' => 'required|numeric|min:0',
            'quote_unit_price' => 'required|numeric|min:0',
            'settlement_unit_price' => 'required|numeric|min:0',
            'mileage_at_service' => 'required|integer|min:0',
            'service_date' => 'required|date',
            'provider_id' => 'nullable|exists:providers,id',
        ]);

        // Generate history number
        $validated['history_number'] = 'VH-' . date('Ymd') . '-' . str_pad(VehicleServiceHistory::whereDate('created_at', today())->count() + 1, 3, '0', STR_PAD_LEFT);

        // Calculate totals
        $validated['quote_total_price'] = $validated['quote_unit_price'] * $validated['quantity'];
        $validated['settlement_total_price'] = $validated['settlement_unit_price'] * $validated['quantity'];

        $history = VehicleServiceHistory::create($validated);

        return new VehicleServiceHistoryResource($history->load(['vehicle', 'customer', 'service', 'product']));
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $history = VehicleServiceHistory::with(['vehicle', 'customer', 'order', 'service', 'product', 'provider', 'technician', 'warranty'])
            ->findOrFail($id);

        return new VehicleServiceHistoryResource($history);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $history = VehicleServiceHistory::findOrFail($id);

        $validated = $request->validate([
            'customer_rating' => 'nullable|integer|min:1|max:5',
            'customer_feedback' => 'nullable|string',
            'technician_notes' => 'nullable|string',
            'internal_notes' => 'nullable|string',
            'status' => 'nullable|in:completed,warranty_active,warranty_expired,replaced',
        ]);

        $history->update($validated);

        return new VehicleServiceHistoryResource($history->load(['vehicle', 'customer', 'service', 'product']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $history = VehicleServiceHistory::findOrFail($id);
        $history->delete();

        return response()->json(['message' => 'Service history deleted successfully'], 200);
    }

    /**
     * Get service history by vehicle
     */
    public function byVehicle(string $vehicleId)
    {
        $histories = VehicleServiceHistory::with(['service', 'product', 'provider'])
            ->byVehicle($vehicleId)
            ->orderBy('service_date', 'desc')
            ->paginate(20);

        return VehicleServiceHistoryResource::collection($histories);
    }

    /**
     * Get upcoming maintenance for a vehicle
     */
    public function upcomingMaintenance(string $vehicleId)
    {
        $histories = VehicleServiceHistory::byVehicle($vehicleId)
            ->maintenance()
            ->upcomingMaintenance()
            ->orderBy('next_maintenance_date')
            ->get();

        return VehicleServiceHistoryResource::collection($histories);
    }
}
