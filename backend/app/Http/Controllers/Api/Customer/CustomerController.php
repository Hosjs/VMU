<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Traits\HasPermissions;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * Customer Management Controller
 *
 * Quản lý khách hàng
 * Permissions: customers.*
 */
class CustomerController extends Controller
{
    use HasPermissions;

    public function index(Request $request)
    {
        $this->authorizePermission('customers.view');

        $perPage = $request->input('per_page', 20);
        $search = $request->input('search');
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');

        $query = Customer::query();

        // ✅ Thêm withCount để đếm số xe
        $query->withCount('vehicles');

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('customer_code', 'like', "%{$search}%");
            });
        }

        // ✅ Thêm sorting
        $query->orderBy($sortBy, $sortDirection);

        // ✅ QUAN TRỌNG: Trả về pagination trực tiếp, KHÔNG wrap trong {success, data}
        return $query->paginate($perPage);
    }

    public function show($id)
    {
        $this->authorizePermission('customers.view');

        $customer = Customer::with(['vehicles', 'orders'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $customer
        ]);
    }

    public function store(Request $request)
    {
        $this->authorizePermission('customers.create');

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $customer = Customer::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Tạo khách hàng thành công',
            'data' => $customer
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $this->authorizePermission('customers.edit');

        $customer = Customer::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'string|max:255',
            'phone' => 'string|max:20',
            'email' => 'nullable|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $customer->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật khách hàng thành công',
            'data' => $customer
        ]);
    }

    public function destroy($id)
    {
        $this->authorizePermission('customers.delete');

        $customer = Customer::findOrFail($id);
        $customer->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa khách hàng thành công'
        ]);
    }

    public function statistics()
    {
        $this->authorizePermission('customers.view');

        $total = Customer::count();
        $newThisMonth = Customer::whereMonth('created_at', now()->month)->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total' => $total,
                'new_this_month' => $newThisMonth
            ]
        ]);
    }
}

