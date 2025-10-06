import type { AuthUser, LoginCredentials, AuthResponse, RegisterData } from '~/types/auth';
import { api } from './api';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);

    // Save token and user to localStorage
    if (response.token) {
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    }

    return response;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);

    // Save token and user to localStorage
    if (response.token) {
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    }

    return response;
  },

  async logout(): Promise<void> {
    const token = this.getToken();

    try {
      if (token) {
        await api.post('/auth/logout', {}, token);
      }
    } finally {
      // Always clear local storage
      this.clearAuth();
    }
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    const token = this.getToken();

    if (!token) {
      return null;
    }

    try {
      const user = await api.get<AuthUser>('/auth/user', token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return user;
    } catch (error) {
      // If token is invalid, clear storage
      this.clearAuth();
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getStoredUser(): AuthUser | null {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  clearAuth(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
// User types based on database schema
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  employee_code?: string;
  position?: string;
  department?: string;
  hire_date?: string;
  salary?: number;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  name: 'admin' | 'manager' | 'accountant' | 'employee' | 'mechanic';
  display_name: string;
  description?: string;
  permissions: string[];
  is_active: boolean;
}

export interface AuthUser extends User {
  role?: Role;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  token_type: string;
  expires_in: number;
}

export interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
}
