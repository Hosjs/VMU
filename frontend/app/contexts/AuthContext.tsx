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

export interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser?: () => Promise<void>;
  updateUser?: (user: AuthUser) => void;

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

export { AuthContext };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = authService.getStoredUser();
      const token = authService.getToken();

      if (storedUser && token) {
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          console.warn('Token expired or invalid, clearing auth');
          authService.clearAuth();
          setUser(null);
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await authService.register(data);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
  };

  const updateUser = (updatedUser: AuthUser) => {
    setUser(updatedUser);
  };

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
        user,
        isLoading,
        isAuthenticated: !!user,

        login,
        register,
        logout,
        refreshUser,
        updateUser,

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

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
