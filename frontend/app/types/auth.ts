export interface Role {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  permissions?: PermissionMap | string; // ✅ Hỗ trợ cả object và string
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  // Statistics
  users_count?: number;
  active_users_count?: number;
  permission_summary?: {
    total_modules: number;
    total_actions: number;
  };
}

// ✅ Type cho Permission Map (sync với backend)
export type PermissionMap = Record<string, string[]>;

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  avatar?: string;

  // Role & Permissions (Hệ thống mới)
  role_id: number;
  role?: Role;
  role_name?: string;
  role_display_name?: string;

  // ✅ Custom Permissions - Quyền bổ sung riêng (ngoài quyền role)
  custom_permissions?: PermissionMap;

  // ✅ All Permissions - Tổng hợp (role + custom) từ backend
  all_permissions?: PermissionMap;

  // Employee Info
  employee_code?: string;
  position?: string;
  department?: string;
  hire_date?: string;
  salary?: number;
  birth_date?: string;
  age?: number;
  years_of_service?: number;
  gender?: 'male' | 'female' | 'other';

  // Status
  is_active?: boolean;
  notes?: string;
  email_verified_at?: string;

  // Timestamps
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  address?: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  token_type: string;
  expires_in?: number;
}

export interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser?: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  updateUser?: (user: AuthUser) => void;
}
