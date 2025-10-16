import type React from 'react';
import { usePermissions } from '~/contexts/PermissionContext';

interface CanProps {
  /**
   * Permission cần kiểm tra (có thể là array hoặc string)
   * Format: "resource.action" (vd: "users.view", "orders.create")
   */
  permission?: string | string[];

  /**
   * Role cần kiểm tra
   */
  role?: string | string[];

  /**
   * Logic: "any" (có 1 trong các permissions) hoặc "all" (có tất cả)
   * Default: "any"
   */
  logic?: 'any' | 'all';

  /**
   * Children hiển thị khi có permission
   */
  children: React.ReactNode;

  /**
   * Fallback hiển thị khi không có permission
   */
  fallback?: React.ReactNode;
}

/**
 * Component Can - Hiển thị nội dung dựa trên permissions
 *
 * @example
 * // Kiểm tra 1 permission
 * <Can permission="users.view">
 *   <button>Xem users</button>
 * </Can>
 *
 * @example
 * // Kiểm tra nhiều permissions (any)
 * <Can permission={["users.view", "users.create"]}>
 *   <button>Quản lý users</button>
 * </Can>
 *
 * @example
 * // Kiểm tra nhiều permissions (all)
 * <Can permission={["orders.view", "orders.update"]} logic="all">
 *   <button>Cập nhật đơn hàng</button>
 * </Can>
 *
 * @example
 * // Kiểm tra role
 * <Can role="admin">
 *   <button>Admin Panel</button>
 * </Can>
 *
 * @example
 * // Với fallback
 * <Can permission="users.delete" fallback={<span>Không có quyền xóa</span>}>
 *   <button>Xóa user</button>
 * </Can>
 */
export function Can({ permission, role, logic = 'any', children, fallback = null }: CanProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasRole, hasAnyRole, isLoading } = usePermissions();

  // Đang loading
  if (isLoading) {
    return null;
  }

  // Kiểm tra role
  if (role) {
    const roles = Array.isArray(role) ? role : [role];
    const hasRequiredRole = hasAnyRole(roles);

    if (!hasRequiredRole) {
      return <>{fallback}</>;
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
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}

/**
 * Component Cannot - Ngược lại với Can
 * Hiển thị nội dung khi KHÔNG có permission
 */
export function Cannot({ permission, role, logic = 'any', children, fallback = null }: CanProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasRole, hasAnyRole, isLoading } = usePermissions();

  // Đang loading
  if (isLoading) {
    return null;
  }

  // Kiểm tra role
  if (role) {
    const roles = Array.isArray(role) ? role : [role];
    const hasRequiredRole = hasAnyRole(roles);

    if (hasRequiredRole) {
      return <>{fallback}</>;
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

    if (hasRequiredPermission) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}
