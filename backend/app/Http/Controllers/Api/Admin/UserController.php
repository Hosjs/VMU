<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use App\Models\UserRole;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    /**
     * Danh sách users với phân trang, tìm kiếm, lọc
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');
        $roleId = $request->get('role_id');
        $isActive = $request->get('is_active');
        $department = $request->get('department');

        $query = User::with(['role', 'userRole']);

        // Search
        if ($search) {
            $query->search($search);
        }

        // Filter by role
        if ($roleId) {
            $query->whereHas('userRole', function($q) use ($roleId) {
                $q->where('role_id', $roleId)->where('is_active', true);
            });
        }

        // Filter by active status
        if ($isActive !== null) {
            $query->active($isActive == 1);
        }

        // Filter by department
        if ($department) {
            $query->where('department', $department);
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $users = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $users,
        ]);
    }

    /**
     * Tạo user mới
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:20',
            'role_id' => 'required|exists:roles,id',
            'employee_code' => 'nullable|string|max:50|unique:users',
            'position' => 'nullable|string|max:100',
            'department' => 'nullable|string|max:100',
            'hire_date' => 'nullable|date',
            'salary' => 'nullable|numeric|min:0',
            'birth_date' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
            'address' => 'nullable|string',
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
            DB::beginTransaction();

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
                'birth_date' => $request->birth_date,
                'gender' => $request->gender,
                'address' => $request->address,
                'is_active' => $request->get('is_active', true),
                'notes' => $request->notes,
            ]);

            // Gán role
            UserRole::create([
                'user_id' => $user->id,
                'role_id' => $request->role_id,
                'assigned_by' => auth()->id(),
                'is_active' => true,
            ]);

            $user->load('role', 'userRole');

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'User created successfully',
                'data' => $user,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xem chi tiết user
     */
    public function show($id)
    {
        $user = User::with(['role', 'userRole'])->find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $user,
        ]);
    }

    /**
     * Cập nhật user
     */
    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $id,
            'password' => 'nullable|string|min:8',
            'phone' => 'nullable|string|max:20',
            'role_id' => 'nullable|exists:roles,id',
            'employee_code' => 'nullable|string|max:50|unique:users,employee_code,' . $id,
            'position' => 'nullable|string|max:100',
            'department' => 'nullable|string|max:100',
            'hire_date' => 'nullable|date',
            'salary' => 'nullable|numeric|min:0',
            'birth_date' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
            'address' => 'nullable|string',
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
            DB::beginTransaction();

            $userData = [
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'employee_code' => $request->employee_code,
                'position' => $request->position,
                'department' => $request->department,
                'hire_date' => $request->hire_date,
                'salary' => $request->salary,
                'birth_date' => $request->birth_date,
                'gender' => $request->gender,
                'address' => $request->address,
                'is_active' => $request->get('is_active', $user->is_active),
                'notes' => $request->notes,
            ];

            if ($request->filled('password')) {
                $userData['password'] = Hash::make($request->password);
            }

            $user->update($userData);

            // Update role if provided
            if ($request->filled('role_id')) {
                // Deactivate old role
                UserRole::where('user_id', $user->id)
                    ->where('is_active', true)
                    ->update(['is_active' => false]);

                // Create new role
                UserRole::create([
                    'user_id' => $user->id,
                    'role_id' => $request->role_id,
                    'assigned_by' => auth()->id(),
                    'is_active' => true,
                ]);
            }

            $user->load('role', 'userRole');

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'User updated successfully',
                'data' => $user,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xóa user (soft delete hoặc deactivate)
     */
    public function destroy($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        // Không cho phép xóa chính mình
        if ($user->id === auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot delete yourself'
            ], 403);
        }

        try {
            // Deactivate instead of delete
            $user->update(['is_active' => false]);

            return response()->json([
                'success' => true,
                'message' => 'User deactivated successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to deactivate user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Kích hoạt lại user
     */
    public function activate($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        $user->update(['is_active' => true]);

        return response()->json([
            'success' => true,
            'message' => 'User activated successfully',
            'data' => $user,
        ]);
    }

    /**
     * Lấy danh sách departments
     */
    public function departments()
    {
        $departments = User::select('department')
            ->whereNotNull('department')
            ->distinct()
            ->pluck('department');

        return response()->json([
            'success' => true,
            'data' => $departments,
        ]);
    }

    /**
     * Lấy danh sách positions
     */
    public function positions()
    {
        $positions = User::select('position')
            ->whereNotNull('position')
            ->distinct()
            ->pluck('position');

        return response()->json([
            'success' => true,
            'data' => $positions,
        ]);
    }

    /**
     * Lấy thống kê users
     */
    public function statistics()
    {
        $stats = [
            'total' => User::count(),
            'active' => User::where('is_active', true)->count(),
            'inactive' => User::where('is_active', false)->count(),
            'by_role' => DB::table('user_roles')
                ->join('roles', 'user_roles.role_id', '=', 'roles.id')
                ->where('user_roles.is_active', true)
                ->select('roles.name', 'roles.display_name', DB::raw('count(*) as count'))
                ->groupBy('roles.id', 'roles.name', 'roles.display_name')
                ->get(),
            'by_department' => User::select('department', DB::raw('count(*) as count'))
                ->whereNotNull('department')
                ->where('is_active', true)
                ->groupBy('department')
                ->get(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}

