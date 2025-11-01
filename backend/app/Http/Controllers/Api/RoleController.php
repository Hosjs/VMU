<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use App\Models\PermissionModule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class RoleController extends Controller
{
    /**
     * Lấy danh sách tất cả roles
     */
    public function index(Request $request)
    {
        try {
            $query = Role::query();

            // Filter by active status
            if ($request->has('is_active')) {
                $query->where('is_active', $request->is_active);
            }

            // Search
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('display_name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }

            // Pagination
            $perPage = $request->get('per_page', 15);
            $roles = $query->withCount('users')
                ->orderBy('created_at', 'desc')
                ->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $roles,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy danh sách vai trò: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Lấy chi tiết một role
     */
    public function show($id)
    {
        try {
            $role = Role::with(['users' => function($query) {
                $query->select('id', 'name', 'email', 'role_id', 'is_active');
            }])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $role,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy vai trò',
            ], 404);
        }
    }

    /**
     * Tạo role mới
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:roles,name',
            'display_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'permissions' => 'nullable|array',
            'is_active' => 'boolean',
        ], [
            'name.required' => 'Tên vai trò là bắt buộc',
            'name.unique' => 'Tên vai trò đã tồn tại',
            'display_name.required' => 'Tên hiển thị là bắt buộc',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $role = Role::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Tạo vai trò thành công',
                'data' => $role,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tạo vai trò: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Cập nhật role
     */
    public function update(Request $request, $id)
    {
        try {
            $role = Role::findOrFail($id);

            // Không cho phép sửa system role
            if ($role->is_system) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không thể sửa vai trò hệ thống',
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255|unique:roles,name,' . $id,
                'display_name' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string',
                'permissions' => 'nullable|array',
                'is_active' => 'boolean',
            ], [
                'name.unique' => 'Tên vai trò đã tồn tại',
                'display_name.required' => 'Tên hiển thị là bắt buộc',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dữ liệu không hợp lệ',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $role->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật vai trò thành công',
                'data' => $role->fresh(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi cập nhật vai trò: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Xóa role
     */
    public function destroy($id)
    {
        try {
            $role = Role::findOrFail($id);

            // Không cho phép xóa system role
            if ($role->is_system) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không thể xóa vai trò hệ thống',
                ], 403);
            }

            // Kiểm tra có user nào đang dùng role này không
            $usersCount = $role->users()->count();
            if ($usersCount > 0) {
                return response()->json([
                    'success' => false,
                    'message' => "Không thể xóa vai trò này vì có {$usersCount} người dùng đang sử dụng",
                ], 400);
            }

            $role->delete();

            return response()->json([
                'success' => true,
                'message' => 'Xóa vai trò thành công',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi xóa vai trò: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Lấy danh sách tất cả modules và actions
     * Dùng để hiển thị UI phân quyền
     */
    public function getPermissions()
    {
        try {
            $modules = PermissionModule::active()
                ->ordered()
                ->with(['activeActions' => function($query) {
                    $query->ordered();
                }])
                ->get()
                ->map(function($module) {
                    return [
                        'id' => $module->id,
                        'name' => $module->name,
                        'display_name' => $module->display_name,
                        'description' => $module->description,
                        'icon' => $module->icon ?? null,
                        'actions' => $module->activeActions->map(function($action) {
                            return [
                                'id' => $action->id,
                                'action' => $action->action,
                                'display_name' => $action->display_name,
                                'description' => $action->description,
                            ];
                        }),
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $modules,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy danh sách quyền: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Gán role cho user
     */
    public function assignRole(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'role_id' => 'required|exists:roles,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $user = User::findOrFail($request->user_id);
            $role = Role::findOrFail($request->role_id);

            // Cập nhật role_id trong bảng users
            $user->role_id = $role->id;
            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Gán vai trò thành công',
                'data' => $user->fresh(['role']),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi gán vai trò: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Cập nhật permissions cho role
     */
    public function updatePermissions(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'permissions' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $role = Role::findOrFail($id);

            // Không cho phép sửa permissions của admin
            if ($role->name === 'admin' || $role->is_system) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không thể sửa quyền của vai trò hệ thống',
                ], 403);
            }

            $role->permissions = $request->permissions;
            $role->save();

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật quyền thành công',
                'data' => $role->fresh(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi cập nhật quyền: ' . $e->getMessage(),
            ], 500);
        }
    }
}

