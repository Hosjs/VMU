<?php

namespace App\Http\Controllers\Api\Management\Users;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use App\Models\UserRole;
use App\Traits\HasPermissions;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

/**
 * User Management Controller
 *
 * Quản lý người dùng trong hệ thống
 * Permissions: users.*
 */
class UserController extends Controller
{
    use HasPermissions;

    /**
     * Danh sách người dùng
     * Permission: users.view
     */
    public function index(Request $request)
    {
        $this->authorizePermission('users.view');

        $perPage = $request->input('per_page', 20);
        $search = $request->input('search');
        $roleId = $request->input('role_id');
        $status = $request->input('status');
        $department = $request->input('department');

        $query = User::with(['role']);

        // Search
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('employee_code', 'like', "%{$search}%");
            });
        }

        // Filter by role - SỬA: dùng role_id trực tiếp
        if ($roleId) {
            $query->where('role_id', $roleId);
        }

        // Filter by status
        if ($status !== null) {
            $query->where('is_active', $status);
        }

        // Filter by department
        if ($department) {
            $query->where('department', $department);
        }

        // Sort
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $users = $query->paginate($perPage);

        return response()->json($users); // Laravel pagination format
    }

    /**
     * Chi tiết người dùng
     * Permission: users.view
     */
    public function show($id)
    {
        $this->authorizePermission('users.view');

        $user = User::with(['role', 'roleHistory'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }

    /**
     * Tạo người dùng mới
     * Permission: users.create
     */
    public function store(Request $request)
    {
        $this->authorizePermission('users.create');

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string|max:20',
            'role_id' => 'required|exists:roles,id',
            'employee_code' => 'nullable|string|unique:users,employee_code',
            'position' => 'nullable|string',
            'department' => 'nullable|string',
            'hire_date' => 'nullable|date',
            'salary' => 'nullable|numeric',
            'custom_permissions' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Chỉ admin mới được set custom_permissions
        if ($request->has('custom_permissions') && !$request->user()->hasRole('admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Only admin can set custom permissions'
            ], 403);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'employee_code' => $request->employee_code,
            'position' => $request->position,
            'department' => $request->department,
            'hire_date' => $request->hire_date,
            'salary' => $request->salary,
            'role_id' => $request->role_id, // ✅ Gán role_id trực tiếp
            'custom_permissions' => $request->custom_permissions,
            'is_active' => true,
        ]);

        // Log vào user_roles cho audit trail
        UserRole::create([
            'user_id' => $user->id,
            'role_id' => $request->role_id,
            'assigned_by' => $request->user()->id,
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tạo người dùng thành công',
            'data' => $user->load('role')
        ], 201);
    }

    /**
     * Cập nhật người dùng
     * Permission: users.edit
     */
    public function update(Request $request, $id)
    {
        $this->authorizePermission('users.edit');

        $user = User::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'string|max:255',
            'email' => 'email|unique:users,email,' . $id,
            'password' => 'nullable|string|min:6',
            'phone' => 'nullable|string|max:20',
            'role_id' => 'exists:roles,id',
            'employee_code' => 'nullable|string|unique:users,employee_code,' . $id,
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->only([
            'name', 'email', 'phone', 'employee_code',
            'position', 'department', 'salary', 'birth_date',
            'gender', 'address', 'notes'
        ]);

        if ($request->has('password') && $request->password) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        // Update role if provided
        if ($request->has('role_id') && $request->role_id != $user->role_id) {
            $oldRoleId = $user->role_id;

            // Cập nhật role_id trực tiếp trong users table
            $user->update(['role_id' => $request->role_id]);

            // Đánh dấu role cũ là inactive trong audit trail
            if ($oldRoleId) {
                UserRole::where('user_id', $user->id)
                    ->where('role_id', $oldRoleId)
                    ->where('is_active', true)
                    ->update(['is_active' => false]);
            }

            // Tạo record mới trong audit trail
            UserRole::create([
                'user_id' => $user->id,
                'role_id' => $request->role_id,
                'assigned_by' => $request->user()->id,
                'is_active' => true,
            ]);
        }

        // Update custom permissions if provided
        if ($request->has('custom_permissions')) {
            $user->update([
                'custom_permissions' => $request->custom_permissions
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật người dùng thành công',
            'data' => $user->load('role')
        ]);
    }

    /**
     * Xóa người dùng
     * Permission: users.delete
     */
    public function destroy($id)
    {
        $this->authorizePermission('users.delete');

        $user = User::findOrFail($id);

        // Không cho phép xóa chính mình
        if ($user->id === auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa tài khoản của chính bạn'
            ], 403);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa người dùng thành công'
        ]);
    }

    /**
     * Kích hoạt/vô hiệu hóa người dùng
     * Permission: users.activate
     */
    public function activate(Request $request, $id)
    {
        $this->authorizePermission('users.activate');

        $user = User::findOrFail($id);
        $user->update([
            'is_active' => $request->input('is_active', true)
        ]);

        return response()->json([
            'success' => true,
            'message' => $user->is_active ? 'Kích hoạt thành công' : 'Vô hiệu hóa thành công',
            'data' => $user
        ]);
    }

    /**
     * Danh sách departments
     */
    public function departments()
    {
        $this->authorizePermission('users.view');

        $departments = User::select('department')
            ->distinct()
            ->whereNotNull('department')
            ->pluck('department');

        return response()->json([
            'success' => true,
            'data' => $departments
        ]);
    }

    /**
     * Danh sách positions
     */
    public function positions()
    {
        $this->authorizePermission('users.view');

        $positions = User::select('position')
            ->distinct()
            ->whereNotNull('position')
            ->pluck('position');

        return response()->json([
            'success' => true,
            'data' => $positions
        ]);
    }

    /**
     * Thống kê
     */
    public function statistics()
    {
        $this->authorizePermission('users.view');

        $total = User::count();
        $active = User::where('is_active', true)->count();
        $byRole = User::with('role')
            ->get()
            ->groupBy('role.name')
            ->map->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total' => $total,
                'active' => $active,
                'inactive' => $total - $active,
                'by_role' => $byRole
            ]
        ]);
    }
}

