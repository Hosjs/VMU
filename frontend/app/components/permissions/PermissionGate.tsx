/**
 * PermissionGate Component
 * Component bảo vệ route/page dựa trên permissions
 * Redirect về trang không có quyền nếu user không đủ permission
 */

import type React from 'react';
import { Navigate, useLocation } from 'react-router';
import { usePermissions } from '~/contexts/PermissionContext';

interface PermissionGateProps {
  /**
   * Permission cần thiết để truy cập
   */
  permission?: string | string[];

  /**
   * Role cần thiết để truy cập
   */
  role?: string | string[];

  /**
   * Logic: "any" (có 1 trong các permissions) hoặc "all" (có tất cả)
   * Default: "any"
   */
  logic?: 'any' | 'all';

  /**
   * Children hiển thị khi có quyền
   */
  children: React.ReactNode;

  /**
   * Redirect path khi không có quyền
   * Default: '/admin/dashboard'
   */
  redirectTo?: string;

  /**
   * Component hiển thị khi không có quyền (thay vì redirect)
   */
  fallback?: React.ReactNode;
}

/**
 * PermissionGate - Bảo vệ route theo permissions
 *
 * @example
 * // Bảo vệ route users
 * <PermissionGate permission="users.view">
 *   <UsersPage />
 * </PermissionGate>
 *
 * @example
 * // Bảo vệ với nhiều permissions
 * <PermissionGate permission={["orders.view", "orders.edit"]} logic="any">
 *   <OrdersPage />
 * </PermissionGate>
 *
 * @example
 * // Bảo vệ theo role
 * <PermissionGate role="admin">
 *   <AdminPanel />
 * </PermissionGate>
 *
 * @example
 * // Với fallback component
 * <PermissionGate
 *   permission="users.delete"
 *   fallback={<div>Bạn không có quyền truy cập trang này</div>}
 * >
 *   <DeleteUserPage />
 * </PermissionGate>
 */
export function PermissionGate({
  permission,
  role,
  logic = 'any',
  children,
  redirectTo = '/admin/dashboard',
  fallback,
}: PermissionGateProps) {
  const location = useLocation();
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasRole, hasAnyRole, isLoading, user } = usePermissions();

  // Đang loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Chưa đăng nhập
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Kiểm tra role
  if (role) {
    const roles = Array.isArray(role) ? role : [role];
    const hasRequiredRole = hasAnyRole(roles);

    if (!hasRequiredRole) {
      if (fallback) {
        return <>{fallback}</>;
      }
      return <Navigate to={redirectTo} replace />;
    }
  }

  // Kiểm tra permission
  if (permission) {
    const permissions = Array.isArray(permission) ? permission : [permission];

    let hasRequiredPermission = false;

    if (logic === 'all') {
      hasRequiredPermission = hasAllPermissions(permissions);
    } else {
      hasRequiredPermission = hasAnyPermission(permissions);
    }

    if (!hasRequiredPermission) {
      if (fallback) {
        return <>{fallback}</>;
      }
      return <Navigate to={redirectTo} replace />;
    }
  }

  return <>{children}</>;
}

/**
 * Component hiển thị khi không có quyền truy cập
 */
export function NoPermissionPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full text-center p-8">
        <div className="mb-6">
          <svg
            className="mx-auto h-24 w-24 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Không có quyền truy cập
        </h1>
        <p className="text-gray-600 mb-8">
          Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.
        </p>
        <div className="space-x-4">
          <a
            href="/admin/dashboard"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Về trang chủ
          </a>
          <button
            onClick={() => window.history.back()}
            className="inline-block px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    </div>
  );
}
