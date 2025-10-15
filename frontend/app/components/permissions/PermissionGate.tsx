/**
 * PermissionGate Component
 * Component bảo vệ nội dung dựa trên quyền hạn
 * Chỉ render children nếu user có quyền
 */

import type { ReactNode } from 'react';
import { usePermissions } from '~/hooks/usePermissions';

interface PermissionGateProps {
  /**
   * Permission cần kiểm tra (vd: "users.create")
   */
  permission?: string;

  /**
   * Danh sách permissions, user cần có ít nhất 1
   */
  anyPermissions?: string[];

  /**
   * Danh sách permissions, user cần có tất cả
   */
  allPermissions?: string[];

  /**
   * Module cần kiểm tra quyền truy cập
   */
  module?: string;

  /**
   * Role cần kiểm tra
   */
  role?: string;

  /**
   * Danh sách roles, user cần có ít nhất 1
   */
  anyRoles?: string[];

  /**
   * Nội dung hiển thị khi có quyền
   */
  children: ReactNode;

  /**
   * Nội dung hiển thị khi không có quyền (optional)
   */
  fallback?: ReactNode;
}

export function PermissionGate({
  permission,
  anyPermissions,
  allPermissions,
  module,
  role,
  anyRoles,
  children,
  fallback = null,
}: PermissionGateProps) {
  const permissions = usePermissions();

  let hasAccess = true;

  // Kiểm tra permission cụ thể
  if (permission && !permissions.hasPermission(permission)) {
    hasAccess = false;
  }

  // Kiểm tra anyPermissions
  if (anyPermissions && !permissions.hasAnyPermission(anyPermissions)) {
    hasAccess = false;
  }

  // Kiểm tra allPermissions
  if (allPermissions && !permissions.hasAllPermissions(allPermissions)) {
    hasAccess = false;
  }

  // Kiểm tra module access
  if (module && !permissions.canAccessModule(module)) {
    hasAccess = false;
  }

  // Kiểm tra role
  if (role && !permissions.hasRole(role)) {
    hasAccess = false;
  }

  // Kiểm tra anyRoles
  if (anyRoles && !permissions.hasAnyRole(anyRoles)) {
    hasAccess = false;
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
