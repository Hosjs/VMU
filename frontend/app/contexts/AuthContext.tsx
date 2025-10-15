/**
 * ============================================
 * AUTH CONTEXT - REACT STATE MANAGEMENT ONLY
 * ============================================
 * CHỈ quản lý state cho UI, KHÔNG chứa business logic
 * Business logic đã được chuyển sang services/auth.service.ts
 *
 * @version 2.0 - Simplified (State Only)
 */

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AuthUser, LoginCredentials, AuthContextType, RegisterData } from '~/types/auth';
import { authService } from '~/services/auth.service';
import { hasRole as checkHasRole, hasPermission as checkHasPermission } from '~/utils/permissions';

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

      if (storedUser) {
        // Verify token is still valid
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
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

  // Check if user has role
  const hasRole = (role: string) => checkHasRole(user, role);

  // Check if user has permission
  const hasPermission = (permission: string) => checkHasPermission(user, permission);

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
        hasRole,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
