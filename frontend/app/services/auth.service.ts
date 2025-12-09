import type { AuthUser, LoginCredentials, AuthResponse, RegisterData } from '~/types/auth';
import { apiService } from './api.service';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

class AuthService {
  constructor() {
    this.login = this.login.bind(this);
    this.register = this.register.bind(this);
    this.logout = this.logout.bind(this);
    this.getCurrentUser = this.getCurrentUser.bind(this);
    this.updateStoredUser = this.updateStoredUser.bind(this);
    this.getPermissions = this.getPermissions.bind(this);
    this.getPermissionModules = this.getPermissionModules.bind(this);
    this.getToken = this.getToken.bind(this);
    this.getStoredUser = this.getStoredUser.bind(this);
    this.clearAuth = this.clearAuth.bind(this);
    this.isAuthenticated = this.isAuthenticated.bind(this);
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiService.postPublic<any>('/auth/login', credentials);

    // Backend trả về { user, token, token_type } trong response
    if (response && response.token) {
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    } else {
      throw new Error('Invalid response from server');
    }

    return response;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiService.postPublic<any>('/auth/register', data);

    if (response && response.token) {
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    }

    return response;
  }

  async logout(): Promise<void> {
    const token = this.getToken();

    try {
      if (token) {
        await apiService.post('/auth/logout', {});
      }
    } finally {
      this.clearAuth();
    }
  }

  async getCurrentUser(): Promise<AuthUser> {
    const response = await apiService.get<any>('/auth/me');
    const user = response.user || response;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  }

  updateStoredUser(user: AuthUser): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  async getPermissions(): Promise<{
    permissions: Record<string, string[]>;
    role: { id: number; name: string; display_name: string };
    has_custom_permissions: boolean;
  }> {
    return apiService.get('/auth/permissions');
  }

  async getPermissionModules(): Promise<unknown> {
    const response = await apiService.get('/management/permissions/modules/simplified');
    return response;
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getStoredUser(): AuthUser | null {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  clearAuth(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
