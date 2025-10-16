/**
 * Permission Context
 * Cung cấp quyền hạn của user cho toàn bộ ứng dụng
 * Tích hợp với AuthContext
 */

import { createContext, useContext, type ReactNode } from 'react';
import { AuthContext } from './AuthContext';
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
import type { AuthUser } from '~/types/auth';

interface PermissionContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  canAccessModule: (module: string) => boolean;
  getUserPermissions: () => PermissionMap;
  getAccessibleModules: () => string[];
  isAdmin: () => boolean;
  isManager: () => boolean;
  hasRole: (roleName: string) => boolean;
  hasAnyRole: (roleNames: string[]) => boolean;
}

export const PermissionContext = createContext<PermissionContextValue | undefined>(undefined);

interface PermissionProviderProps {
  children: ReactNode;
}

/**
 * PermissionProvider
 * Wrap app với provider này để sử dụng permissions
 */
export function PermissionProvider({ children }: PermissionProviderProps) {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error('PermissionProvider must be used within AuthProvider');
  }

  const { user, isLoading } = authContext;

  const value: PermissionContextValue = {
    user,
    isLoading,
    hasPermission: (permission: string) => hasPermission(user, permission),
    hasAnyPermission: (permissions: string[]) => hasAnyPermission(user, permissions),
    hasAllPermissions: (permissions: string[]) => hasAllPermissions(user, permissions),
    canAccessModule: (module: string) => canAccessModule(user, module),
    getUserPermissions: () => getUserPermissions(user),
    getAccessibleModules: () => getAccessibleModules(user),
    isAdmin: () => isAdmin(user),
    isManager: () => isManager(user),
    hasRole: (roleName: string) => hasRole(user, roleName),
    hasAnyRole: (roleNames: string[]) => hasAnyRole(user, roleNames),
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

/**
 * Hook để sử dụng permissions
 */
export function usePermissions() {
  const context = useContext(PermissionContext);

  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }

  return context;
}
