<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Provider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class ProviderController extends Controller
{
    /**
     * Danh sách providers (đối tác)
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');
        $status = $request->get('status');
        $serviceType = $request->get('service_type');

        $query = Provider::with('manager');

        // Search
        if ($search) {
            $query->search($search);
        }

        // Filter by status
        if ($status) {
            $query->where('status', $status);
        }

        // Filter by service type
        if ($serviceType) {
            $query->where('service_types', 'like', "%{$serviceType}%");
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $providers = $query->paginate($perPage);

        return response()->json($providers);
    }

    /**
     * Tạo provider mới
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:50|unique:providers,code',
            'name' => 'required|string|max:255',
            'business_name' => 'nullable|string|max:255',
            'tax_code' => 'nullable|string|max:50',
            'contact_person' => 'required|string|max:100',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'required|string',
            'website' => 'nullable|url|max:255',
            'bank_name' => 'nullable|string|max:100',
            'bank_account' => 'nullable|string|max:100',
            'bank_branch' => 'nullable|string|max:100',
            'service_types' => 'nullable|string',
            'specializations' => 'nullable|string',
            'commission_rate' => 'nullable|numeric|min:0|max:100',
            'payment_terms' => 'nullable|integer|min:0',
            'credit_limit' => 'nullable|numeric|min:0',
            'payment_method' => 'nullable|string|max:50',
            'rating' => 'nullable|numeric|min:0|max:5',
            'status' => 'nullable|in:active,inactive,suspended',
            'contract_start' => 'nullable|date',
            'contract_end' => 'nullable|date',
            'notes' => 'nullable|string',
            'attachment_urls' => 'nullable|string',
            'managed_by' => 'nullable|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $provider = Provider::create($request->all());
            $provider->load('manager');

            return response()->json([
                'success' => true,
                'message' => 'Provider created successfully',
                'data' => $provider,
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create provider',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xem chi tiết provider
     */
    public function show($id)
    {
        $provider = Provider::with([
            'manager',
            'warehouses',
            'orders' => function($query) {
                $query->latest()->take(10);
            },
            'settlements' => function($query) {
                $query->latest()->take(10);
            },
        ])->find($id);

        if (!$provider) {
            return response()->json([
                'success' => false,
                'message' => 'Provider not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $provider,
        ]);
    }

    /**
     * Cập nhật provider
     */
    public function update(Request $request, $id)
    {
        $provider = Provider::find($id);

        if (!$provider) {
            return response()->json([
                'success' => false,
                'message' => 'Provider not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:50|unique:providers,code,' . $id,
            'name' => 'required|string|max:255',
            'business_name' => 'nullable|string|max:255',
            'tax_code' => 'nullable|string|max:50',
            'contact_person' => 'required|string|max:100',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'required|string',
            'website' => 'nullable|url|max:255',
            'bank_name' => 'nullable|string|max:100',
            'bank_account' => 'nullable|string|max:100',
            'bank_branch' => 'nullable|string|max:100',
            'service_types' => 'nullable|string',
            'specializations' => 'nullable|string',
            'commission_rate' => 'nullable|numeric|min:0|max:100',
            'payment_terms' => 'nullable|integer|min:0',
            'credit_limit' => 'nullable|numeric|min:0',
            'payment_method' => 'nullable|string|max:50',
            'rating' => 'nullable|numeric|min:0|max:5',
            'status' => 'nullable|in:active,inactive,suspended',
            'contract_start' => 'nullable|date',
            'contract_end' => 'nullable|date',
            'notes' => 'nullable|string',
            'attachment_urls' => 'nullable|string',
            'managed_by' => 'nullable|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $provider->update($request->all());
            $provider->load('manager');

            return response()->json([
                'success' => true,
                'message' => 'Provider updated successfully',
                'data' => $provider,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update provider',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xóa provider
     */
    public function destroy($id)
    {
        $provider = Provider::find($id);

        if (!$provider) {
            return response()->json([
                'success' => false,
                'message' => 'Provider not found'
            ], 404);
        }

        // Check if provider has active orders
        if ($provider->orders()->whereNotIn('status', ['completed', 'cancelled'])->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete provider with active orders'
            ], 400);
        }

        try {
            $provider->update(['status' => 'inactive']);

            return response()->json([
                'success' => true,
                'message' => 'Provider deactivated successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to deactivate provider',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cập nhật đánh giá provider
     */
    public function updateRating(Request $request, $id)
    {
        $provider = Provider::find($id);

        if (!$provider) {
            return response()->json([
                'success' => false,
                'message' => 'Provider not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'rating' => 'required|numeric|min:0|max:5',
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
            $data = ['rating' => $request->rating];

            if ($request->filled('notes')) {
                $data['notes'] = $provider->notes . "\n" . now()->format('Y-m-d H:i') . " - Rating: {$request->rating}/5 - " . $request->notes;
            }

            $provider->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Provider rating updated successfully',
                'data' => $provider,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update rating',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Thống kê providers
     */
    public function statistics()
    {
        $stats = [
            'total' => Provider::count(),
            'active' => Provider::where('status', 'active')->count(),
            'inactive' => Provider::where('status', 'inactive')->count(),
            'suspended' => Provider::where('status', 'suspended')->count(),
            'by_service_type' => Provider::selectRaw('service_types, COUNT(*) as count')
                ->groupBy('service_types')
                ->get(),
            'top_rated' => Provider::where('rating', '>', 0)
                ->orderBy('rating', 'desc')
                ->take(10)
                ->get(['id', 'name', 'rating', 'completed_orders']),
            'total_orders' => Provider::sum('completed_orders'),
            'pending_settlements' => DB::table('settlements')
                ->whereIn('payment_status', ['unpaid', 'partial'])
                ->sum('total_amount'),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}

