/**
 * ============================================
 * AUTH CONTEXT - UNIFIED AUTHENTICATION & PERMISSIONS
 * ============================================
 * Quản lý authentication state và permission checking
 * ĐÂY LÀ NGUỒN DUY NHẤT CHO AUTH & PERMISSIONS
 *
 * @version 3.0 - Unified (State + Permissions)
 */

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AuthUser, LoginCredentials, RegisterData } from '~/types/auth';
import { authService } from '~/services/auth.service';
import {
  hasPermission as checkHasPermission,
  hasAnyPermission as checkHasAnyPermission,
  hasAllPermissions as checkHasAllPermissions,
  hasRole as checkHasRole,
  hasAnyRole as checkHasAnyRole,
  canAccessModule as checkCanAccessModule,
  getUserPermissions as checkGetUserPermissions,
  getAccessibleModules as checkGetAccessibleModules,
  isAdmin as checkIsAdmin,
  isManager as checkIsManager,
  type PermissionMap,
} from '~/utils/permissions';

// Extended AuthContextType with all permission methods
export interface AuthContextType {
  // Auth state
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Auth actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser?: () => Promise<void>;
  updateUser?: (user: AuthUser) => void;

  // Permission checks
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  canAccessModule: (module: string) => boolean;
  getUserPermissions: () => PermissionMap;
  getAccessibleModules: () => string[];
  isAdmin: () => boolean;
  isManager: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Export AuthContext để có thể dùng trong usePermissions
export { AuthContext };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = authService.getStoredUser();
      const token = authService.getToken();

      if (storedUser && token) {
        try {
          // Verify token is still valid by fetching current user from API
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          // Token invalid or expired, clear auth
          console.warn('Token expired or invalid, clearing auth');
          authService.clearAuth();
          setUser(null);
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Login handler
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  // Register handler
  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await authService.register(data);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout handler
  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
  };

  // Update user data manually
  const updateUser = (updatedUser: AuthUser) => {
    setUser(updatedUser);
  };

  // ============================================
  // PERMISSION METHODS - ALL IN ONE PLACE
  // ============================================

  const hasPermission = (permission: string) => checkHasPermission(user, permission);
  const hasAnyPermission = (permissions: string[]) => checkHasAnyPermission(user, permissions);
  const hasAllPermissions = (permissions: string[]) => checkHasAllPermissions(user, permissions);
  const hasRole = (role: string) => checkHasRole(user, role);
  const hasAnyRole = (roles: string[]) => checkHasAnyRole(user, roles);
  const canAccessModule = (module: string) => checkCanAccessModule(user, module);
  const getUserPermissions = () => checkGetUserPermissions(user);
  const getAccessibleModules = () => checkGetAccessibleModules(user);
  const isAdmin = () => checkIsAdmin(user);
  const isManager = () => checkIsManager(user);

  return (
    <AuthContext.Provider
      value={{
        // Auth state
        user,
        isLoading,
        isAuthenticated: !!user,

        // Auth actions
        login,
        register,
        logout,
        refreshUser,
        updateUser,

        // Permission methods
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        hasRole,
        hasAnyRole,
        canAccessModule,
        getUserPermissions,
        getAccessibleModules,
        isAdmin,
        isManager,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook để sử dụng Auth & Permissions
 * ĐÂY LÀ HOOK DUY NHẤT NÊN DÙNG
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
