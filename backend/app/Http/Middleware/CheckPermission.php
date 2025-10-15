<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * Middleware kiểm tra permissions động thay vì hard-code role
     * Sử dụng: ->middleware('permission:users.view,users.create')
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$permissions): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.'
            ], 401);
        }

        // Admin có tất cả quyền
        if ($user->role && $user->role->name === 'admin') {
            return $next($request);
        }

        // Kiểm tra permissions
        $hasPermission = false;

        foreach ($permissions as $permission) {
            if ($user->hasPermission($permission)) {
                $hasPermission = true;
                break;
            }
        }

        if (!$hasPermission) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền thực hiện hành động này.',
                'required_permissions' => $permissions,
            ], 403);
        }

        return $next($request);
    }
}

