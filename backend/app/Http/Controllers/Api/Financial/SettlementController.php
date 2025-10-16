<?php

namespace App\Http\Controllers\Api\Financial;

use App\Http\Controllers\Controller;
use App\Models\Settlement;
use App\Traits\HasPermissions;
use Illuminate\Http\Request;

/**
 * Settlement Management Controller
 *
 * Quản lý đối soát - Nghiệp vụ tài chính
 * Permissions: settlements.*
 */
class SettlementController extends Controller
{
    use HasPermissions;

    public function index(Request $request)
    {
        $this->authorizePermission('settlements.view');

        $perPage = $request->get('per_page', 20);
        $status = $request->get('status');

        $query = Settlement::with(['provider', 'createdBy', 'approvedBy']);

        if ($status) {
            $query->where('status', $status);
        }

        $settlements = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $settlements
        ]);
    }

    public function show($id)
    {
        $this->authorizePermission('settlements.view');

        $settlement = Settlement::with(['provider', 'payments'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $settlement
        ]);
    }

    public function store(Request $request)
    {
        $this->authorizePermission('settlements.create');

        $settlement = Settlement::create(array_merge(
            $request->all(),
            ['created_by' => auth()->id()]
        ));

        return response()->json([
            'success' => true,
            'message' => 'Tạo đối soát thành công',
            'data' => $settlement
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $this->authorizePermission('settlements.edit');

        $settlement = Settlement::findOrFail($id);
        $settlement->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật đối soát thành công',
            'data' => $settlement
        ]);
    }

    public function destroy($id)
    {
        $this->authorizePermission('settlements.delete');

        $settlement = Settlement::findOrFail($id);
        $settlement->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa đối soát thành công'
        ]);
    }

    public function approve(Request $request, $id)
    {
        $this->authorizePermission('settlements.approve');

        $settlement = Settlement::findOrFail($id);
        $settlement->update([
            'status' => 'approved',
            'approved_by' => auth()->id(),
            'approved_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Phê duyệt đối soát thành công',
            'data' => $settlement
        ]);
    }
}
<?php

namespace App\Http\Controllers\Api\Management\Roles;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Traits\HasPermissions;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * Role Management Controller
 *
 * Quản lý vai trò và permissions
 * Permissions: roles.*
 */
class RoleController extends Controller
{
    use HasPermissions;

    public function index(Request $request)
    {
        $this->authorizePermission('roles.view');

        $perPage = $request->get('per_page', 50);
        $search = $request->get('search');

        $query = Role::withCount('users');

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('display_name', 'like', "%{$search}%");
            });
        }

        $roles = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $roles
        ]);
    }

    public function show($id)
    {
        $this->authorizePermission('roles.view');

        $role = Role::withCount('users')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $role
        ]);
    }

    public function store(Request $request)
    {
        $this->authorizePermission('roles.create');

        $validator = Validator::make($request->all(), [
            'name' => 'required|unique:roles,name',
            'display_name' => 'required',
            'permissions' => 'array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $role = Role::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Tạo vai trò thành công',
            'data' => $role
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $this->authorizePermission('roles.edit');

        $role = Role::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'unique:roles,name,' . $id,
            'permissions' => 'array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $role->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật vai trò thành công',
            'data' => $role
        ]);
    }

    public function destroy($id)
    {
        $this->authorizePermission('roles.delete');

        $role = Role::findOrFail($id);

        // Không cho phép xóa role đang được sử dụng
        if ($role->users_count > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa vai trò đang được sử dụng'
            ], 403);
        }

        $role->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa vai trò thành công'
        ]);
    }

    public function getPermissions()
    {
        $this->authorizePermission('roles.view');

        return response()->json([
            'success' => true,
            'data' => \App\Services\PermissionRegistry::getAllPermissions()
        ]);
    }

    public function statistics()
    {
        $this->authorizePermission('roles.view');

        $roles = Role::withCount('users')->get();

        return response()->json([
            'success' => true,
            'data' => $roles
        ]);
    }
}

