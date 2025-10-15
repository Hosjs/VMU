import { createContext, useContext, useState, useEffect } from 'react';
import type React from 'react';
import { authService } from '~/services/auth.service';

interface PermissionContextType {
  permissions: string[];
  role: string | null;
  roleDisplayName: string | null;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasRole: (role: string) => boolean;
  refresh: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

interface PermissionProviderProps {
  children: React.ReactNode;
}

/**
 * Permission Provider
 * Quản lý permissions của user hiện tại
 * Sử dụng: Wrap App component với <PermissionProvider>
 */
export function PermissionProvider({ children }: PermissionProviderProps) {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [roleDisplayName, setRoleDisplayName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPermissions = async () => {
    try {
      setIsLoading(true);
      const response = await authService.getPermissions();
      setPermissions(response.permissions || []);
      setRole(response.role || null);
      setRoleDisplayName(response.role_display_name || null);
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
      setPermissions([]);
      setRole(null);
      setRoleDisplayName(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch permissions khi mount
    const token = localStorage.getItem('token');
    if (token) {
      fetchPermissions();
    } else {
      setIsLoading(false);
    }
  }, []);

  /**
   * Kiểm tra có permission cụ thể
   * Hỗ trợ wildcard: users.* sẽ match users.view, users.create, etc
   */
  const hasPermission = (permission: string): boolean => {
    // Admin có tất cả quyền
    if (role === 'admin') return true;

    // Check exact match
    if (permissions.includes(permission)) return true;

    // Check wildcard
    const parts = permission.split('.');
    if (parts.length === 2) {
      const wildcardPermission = `${parts[0]}.*`;
      if (permissions.includes(wildcardPermission)) return true;
    }

    return false;
  };

  /**
   * Kiểm tra có bất kỳ permission nào
   */
  const hasAnyPermission = (perms: string[]): boolean => {
    if (role === 'admin') return true;
    return perms.some(p => hasPermission(p));
  };

  /**
   * Kiểm tra có tất cả permissions
   */
  const hasAllPermissions = (perms: string[]): boolean => {
    if (role === 'admin') return true;
    return perms.every(p => hasPermission(p));
  };

  /**
   * Kiểm tra có role cụ thể
   */
  const hasRole = (roleName: string): boolean => {
    return role === roleName;
  };

  /**
   * Refresh permissions
   */
  const refresh = async () => {
    await fetchPermissions();
  };

  return (
    <PermissionContext.Provider
      value={{
        permissions,
        role,
        roleDisplayName,
        isLoading,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        hasRole,
        refresh,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
}

/**
 * Hook để sử dụng permission context
 */
export function usePermissions(): PermissionContextType {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
}
