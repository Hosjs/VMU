<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

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

        // Parse permissions - hỗ trợ nhiều format:
        // 1. "users.view" - single permission với dấu chấm
        // 2. "users.view,users.edit" - multiple permissions với dấu phẩy
        // 3. "users,view" - legacy format
        $permissionList = explode(',', $permissions);

        foreach ($permissionList as $perm) {
            $perm = trim($perm);

            // Parse module và action
            if (strpos($perm, '.') !== false) {
                // Format: "module.action"
                list($module, $action) = explode('.', $perm, 2);
            } else {
                // Không hợp lệ, bỏ qua
                continue;
            }

            // Kiểm tra quyền - nếu user có BẤT KỲ quyền nào trong danh sách thì OK
            if ($user->hasPermission($module, $action)) {
                return $next($request);
            }
        }

        // Nếu không có quyền nào phù hợp
        return response()->json([
            'success' => false,
            'message' => 'Bạn không có quyền thực hiện hành động này',
            'required_permission' => $permissions,
        ], 403);
    }
}
