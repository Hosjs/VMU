<?php

namespace App\Http\Controllers\Api\Management\Roles;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RoleController extends Controller
{
    /**
     * Danh sách roles với phân trang
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 50);
        $search = $request->get('search');
        $isActive = $request->get('is_active');

        $query = Role::withCount('users');

        // Search
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('display_name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by active status
        if ($isActive !== null) {
            $query->where('is_active', $isActive === 'true' ? 1 : 0);
        }
        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $roles = $query->paginate($perPage);

        return response()->json($roles);
    }

    /**
     * Tạo role mới
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:50|unique:roles,name',
            'display_name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'permissions' => 'nullable|array',
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
            $data = $request->except('permissions');

            if ($request->has('permissions')) {
                $data['permissions'] = json_encode($request->permissions);
            }

            $role = Role::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Role created successfully',
                'data' => $role,
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create role',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xem chi tiết role
     */
    public function show($id)
    {
        $role = Role::with(['users' => function($query) {
            $query->select('id', 'name', 'email')->take(10);
        }])->find($id);

        if (!$role) {
            return response()->json([
                'success' => false,
                'message' => 'Role not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $role,
        ]);
    }

    /**
     * Cập nhật role
     */
    public function update(Request $request, $id)
    {
        $role = Role::find($id);

        if (!$role) {
            return response()->json([
                'success' => false,
                'message' => 'Role not found'
            ], 404);
        }

        // Prevent editing system roles
        if (in_array($role->name, ['admin', 'manager', 'accountant', 'technician', 'salesperson'])) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot edit system roles'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:50|unique:roles,name,' . $id,
            'display_name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'permissions' => 'nullable|array',
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
            $data = $request->except('permissions');

            if ($request->has('permissions')) {
                $data['permissions'] = json_encode($request->permissions);
            }

            $role->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Role updated successfully',
                'data' => $role,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update role',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xóa role
     */
    public function destroy($id)
    {
        $role = Role::find($id);

        if (!$role) {
            return response()->json([
                'success' => false,
                'message' => 'Role not found'
            ], 404);
        }

        // Prevent deleting system roles
        if (in_array($role->name, ['admin', 'manager', 'accountant', 'technician', 'salesperson'])) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete system roles'
            ], 403);
        }

        // Check if role has users
        if ($role->users()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete role with existing users'
            ], 400);
        }

        try {
            $role->delete();

            return response()->json([
                'success' => true,
                'message' => 'Role deleted successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete role',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy danh sách permissions có sẵn
     */
    public function getPermissions()
    {
        $permissions = [
            'users' => ['view', 'create', 'edit', 'delete'],
            'roles' => ['view', 'create', 'edit', 'delete'],
            'customers' => ['view', 'create', 'edit', 'delete'],
            'products' => ['view', 'create', 'edit', 'delete'],
            'services' => ['view', 'create', 'edit', 'delete'],
            'categories' => ['view', 'create', 'edit', 'delete'],
            'orders' => ['view', 'create', 'edit', 'delete', 'approve', 'cancel'],
            'invoices' => ['view', 'create', 'edit', 'delete', 'approve'],
            'payments' => ['view', 'create', 'edit', 'delete', 'confirm'],
            'warehouses' => ['view', 'create', 'edit', 'delete'],
            'stocks' => ['view', 'create', 'edit', 'delete', 'transfer'],
            'providers' => ['view', 'create', 'edit', 'delete'],
            'reports' => ['view', 'export'],
            'settings' => ['view', 'edit'],
        ];

        return response()->json([
            'success' => true,
            'data' => $permissions,
        ]);
    }

    /**
     * Thống kê roles
     */
    public function statistics()
    {
        $stats = [
            'total' => Role::count(),
            'active' => Role::where('is_active', true)->count(),
            'inactive' => Role::where('is_active', false)->count(),
            'with_users' => Role::has('users')->count(),
            'roles_by_users' => Role::withCount('users')
                ->orderBy('users_count', 'desc')
                ->get(['id', 'name', 'display_name', 'users_count']),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}
