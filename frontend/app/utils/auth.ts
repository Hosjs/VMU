import type { AuthUser, LoginCredentials, AuthResponse, RegisterData } from '~/types/auth';
import { api } from './api';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<any>('/auth/login', credentials);

    // Backend trả về: { success, data: { user, token, token_type } }
    // Phải lấy từ response.data (bên trong data của API response)
    const authData = response.data;

    // Save token and user to localStorage
    if (authData && authData.token) {
      localStorage.setItem(TOKEN_KEY, authData.token);
      localStorage.setItem(USER_KEY, JSON.stringify(authData.user));
    } else {
      throw new Error('Invalid response from server');
    }

    return authData;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<any>('/auth/register', data);

    // Backend trả về: { success, data: { user, token, token_type } }
    const authData = response.data;

    // Save token and user to localStorage
    if (authData && authData.token) {
      localStorage.setItem(TOKEN_KEY, authData.token);
      localStorage.setItem(USER_KEY, JSON.stringify(authData.user));
    }

    return authData;
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
      const response = await api.get<any>('/auth/me', token);

      // Backend trả về: { success, data: { user } }
      const user = response.data?.user || response.user || response.data || response;

      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        return user;
      }

      return null;
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
