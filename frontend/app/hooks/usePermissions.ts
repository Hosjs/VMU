/**
 * usePermissions Hook
 * Hook để kiểm tra quyền hạn của user hiện tại
 *
 * @example
 * const permissions = usePermissions();
 * if (permissions.hasPermission('users.create')) {
 *   // Show create button
 * }
 */

import { useContext } from 'react';
import { AuthContext } from '~/contexts/AuthContext';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canAccessModule,
  getUserPermissions,
  getAccessibleModules,
  isAdmin,
  isManager,
  hasRole,
  hasAnyRole,
  type PermissionMap,
} from '~/utils/permissions';

export function usePermissions() {
  const { user } = useContext(AuthContext);

  return {
    /**
     * Kiểm tra user có quyền cụ thể
     * @param permission - Permission string dạng "module.action" (vd: "users.create")
     * @returns boolean
     * @example hasPermission('users.create')
     */
    hasPermission: (permission: string): boolean => hasPermission(user, permission),

    /**
     * Kiểm tra user có bất kỳ quyền nào trong danh sách
     * @param permissions - Array of permission strings
     * @returns boolean
     * @example hasAnyPermission(['users.create', 'users.edit'])
     */
    hasAnyPermission: (permissions: string[]): boolean => hasAnyPermission(user, permissions),

    /**
     * Kiểm tra user có tất cả quyền trong danh sách
     * @param permissions - Array of permission strings
     * @returns boolean
     * @example hasAllPermissions(['users.view', 'users.edit'])
     */
    hasAllPermissions: (permissions: string[]): boolean => hasAllPermissions(user, permissions),

    /**
     * Kiểm tra user có quyền truy cập module
     * (có ít nhất 1 action trong module)
     * @param module - Module name (vd: "users", "orders")
     * @returns boolean
     * @example canAccessModule('users')
     */
    canAccessModule: (module: string): boolean => canAccessModule(user, module),

    /**
     * Lấy tất cả permissions của user
     * @returns PermissionMap object
     */
    getUserPermissions: (): PermissionMap => getUserPermissions(user),

    /**
     * Lấy danh sách modules có quyền truy cập
     * @returns Array of module names
     */
    getAccessibleModules: (): string[] => getAccessibleModules(user),

    /**
     * Kiểm tra có phải admin không
     * @returns boolean
     */
    isAdmin: (): boolean => isAdmin(user),

    /**
     * Kiểm tra có phải manager không
     * @returns boolean
     */
    isManager: (): boolean => isManager(user),

    /**
     * Kiểm tra role cụ thể
     * @param roleName - Role name to check
     * @returns boolean
     * @example hasRole('admin')
     */
    hasRole: (roleName: string): boolean => hasRole(user, roleName),

    /**
     * Kiểm tra có một trong các roles
     * @param roleNames - Array of role names
     * @returns boolean
     * @example hasAnyRole(['admin', 'manager'])
     */
    hasAnyRole: (roleNames: string[]): boolean => hasAnyRole(user, roleNames),

    /**
     * User hiện tại
     */
    user,
  };
}

