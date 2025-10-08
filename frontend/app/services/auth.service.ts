/**
 * ============================================
 * AUTHENTICATION SERVICE
 * ============================================
 * Quản lý authentication: login, register, logout, token, user
 * Chuyển từ utils/auth.ts lên services/
 *
 * @version 2.0 - Moved to services layer
 */

import type { AuthUser, LoginCredentials, AuthResponse, RegisterData } from '~/types/auth';
import { apiService } from './api.service';

// ============================================
// CONSTANTS
// ============================================

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// ============================================
// AUTH SERVICE
// ============================================

class AuthService {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiService.postPublic<any>('/auth/login', credentials);

    // Backend trả về: { user, token, token_type }
    if (response && response.token) {
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    } else {
      throw new Error('Invalid response from server');
    }

    return response;
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiService.postPublic<any>('/auth/register', data);

    // Backend trả về: { user, token, token_type }
    if (response && response.token) {
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    }

    return response;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    const token = this.getToken();

    try {
      if (token) {
        await apiService.post('/auth/logout', {});
      }
    } finally {
      // Always clear local storage
      this.clearAuth();
    }
  }

  /**
   * Get current authenticated user from API
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    const token = this.getToken();

    if (!token) {
      return null;
    }

    try {
      const response = await apiService.get<any>('/auth/me');

      // Backend có thể trả về nhiều format khác nhau
      const user = response.user || response;

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
  }

  /**
   * Get token from localStorage
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Get stored user from localStorage (không gọi API)
   */
  getStoredUser(): AuthUser | null {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Clear auth data from localStorage
   */
  clearAuth(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

// ============================================
// EXPORTS
// ============================================

export const authService = new AuthService();

