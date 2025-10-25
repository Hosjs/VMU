<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;

class CheckPermission
{
    public function handle(Request $request, Closure $next, ?string $permissions = null): Response
    {
        $user = $request->user();

        // Kiểm tra user đã đăng nhập
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
            ], 401);
        }

        // Nếu không có permission requirement, cho phép truy cập
        if (!$permissions) {
            return $next($request);
        }

        // Log để debug
        Log::info('CheckPermission', [
            'user_id' => $user->id,
            'required_permissions' => $permissions,
            'route' => $request->path(),
        ]);

        // Parse permissions - hỗ trợ nhiều format:
        // 1. "users.view" - single permission với dấu chấm
        // 2. "users.view,users.edit" - multiple permissions với dấu phẩy
        $permissionList = explode(',', $permissions);
        $checkedPermissions = [];

        foreach ($permissionList as $perm) {
            $perm = trim($perm);

            // Parse module và action
            if (strpos($perm, '.') !== false) {
                // Format: "module.action"
                list($module, $action) = explode('.', $perm, 2);
            } else {
                // Không hợp lệ, bỏ qua
                Log::warning('Invalid permission format', ['permission' => $perm]);
                continue;
            }

            $checkedPermissions[] = [
                'module' => $module,
                'action' => $action,
                'has_permission' => $user->hasPermission($module, $action),
            ];

            // Kiểm tra quyền - nếu user có BẤT KỲ quyền nào trong danh sách thì OK
            if ($user->hasPermission($module, $action)) {
                Log::info('Permission granted', [
                    'user_id' => $user->id,
                    'permission' => "$module.$action",
                ]);
                return $next($request);
            }
        }

        // Log khi từ chối
        Log::warning('Permission denied', [
            'user_id' => $user->id,
            'required_permissions' => $permissions,
            'checked_permissions' => $checkedPermissions,
            'route' => $request->path(),
        ]);

        // Nếu không có quyền nào phù hợp
        return response()->json([
            'success' => false,
            'message' => 'Bạn không có quyền thực hiện hành động này',
            'required_permissions' => $permissions,
            'debug' => config('app.debug') ? $checkedPermissions : null,
        ], 403);
    }
}
