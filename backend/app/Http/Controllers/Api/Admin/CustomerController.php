<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Http\Resources\CustomerResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CustomerController extends Controller
{
    /**
     * Danh sách customers với phân trang và tìm kiếm
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');
        $isActive = $request->get('is_active');

        $query = Customer::with(['vehicles', 'user']);

        // Search
        if ($search) {
            $query->search($search);
        }

        // Filter active
        if ($isActive !== null) {
            $query->where('is_active', $isActive == 1);
        }

        // Sort - Chuẩn hóa dùng sort_direction
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $customers = $query->paginate($perPage);

        // Return trực tiếp pagination response (không wrap)
        return response()->json($customers);
    }

    /**
     * Tạo customer mới
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'birth_date' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
            'insurance_company' => 'nullable|string|max:100',
            'insurance_number' => 'nullable|string|max:100',
            'insurance_expiry' => 'nullable|date',
            'notes' => 'nullable|string',
            'preferences' => 'nullable|string',
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
            $customer = Customer::create($request->all());

            $customer->load(['vehicles', 'user']);

            return response()->json([
                'success' => true,
                'message' => 'Customer created successfully',
                'data' => $customer,
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create customer',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xem chi tiết customer
     */
    public function show($id)
    {
        $customer = Customer::with([
            'vehicles.brand',
            'vehicles.model',
            'orders' => function($query) {
                $query->latest()->take(10);
            },
            'invoices' => function($query) {
                $query->latest()->take(10);
            },
            'serviceRequests' => function($query) {
                $query->latest()->take(10);
            },
        ])->find($id);

        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'Customer not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $customer,
        ]);
    }

    /**
     * Cập nhật customer
     */
    public function update(Request $request, $id)
    {
        $customer = Customer::find($id);

        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'Customer not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'birth_date' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
            'insurance_company' => 'nullable|string|max:100',
            'insurance_number' => 'nullable|string|max:100',
            'insurance_expiry' => 'nullable|date',
            'notes' => 'nullable|string',
            'preferences' => 'nullable|string',
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
            $customer->update($request->all());

            $customer->load(['vehicles', 'user']);

            return response()->json([
                'success' => true,
                'message' => 'Customer updated successfully',
                'data' => $customer,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update customer',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xóa customer
     */
    public function destroy($id)
    {
        $customer = Customer::find($id);

        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'Customer not found'
            ], 404);
        }

        // Check if customer has orders
        if ($customer->orders()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete customer with existing orders. Please deactivate instead.'
            ], 400);
        }

        try {
            // Deactivate instead of delete
            $customer->update(['is_active' => false]);

            return response()->json([
                'success' => true,
                'message' => 'Customer deactivated successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to deactivate customer',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Thống kê customer
     */
    public function statistics()
    {
        $stats = [
            'total' => Customer::count(),
            'active' => Customer::where('is_active', true)->count(),
            'inactive' => Customer::where('is_active', false)->count(),
            'with_vehicles' => Customer::has('vehicles')->count(),
            'with_orders' => Customer::has('orders')->count(),
            'top_customers' => Customer::withCount('orders')
                ->orderBy('orders_count', 'desc')
                ->take(10)
                ->get(['id', 'name', 'phone', 'email']),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}

