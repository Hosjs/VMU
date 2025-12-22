import { apiService } from './api.service';
import type { User, UserFormData } from '~/types/user';
import type { TableQueryParams, PaginatedResponse } from '~/types/common';

class UserService {
  /**
   * Get paginated list of users
   */
  async getUsers(params: TableQueryParams): Promise<PaginatedResponse<User>> {
    return await apiService.getPaginated<User>('/users', params);
  }

  /**
   * Get user profile by ID
   */
  async getProfile(id: number): Promise<User> {
    return await apiService.get<User>(`/users/profile/${id}`);
  }

  /**
   * Get user details by ID
   */
  async getUserById(id: number): Promise<User> {
    return await apiService.get<User>(`/users/${id}`);
  }

  /**
   * Create new user
   */
  async createUser(data: UserFormData): Promise<User> {
    return await apiService.post<User>('/users', data);
  }

  /**
   * Update user
   */
  async updateUser(id: number, data: Partial<UserFormData>): Promise<User> {
    return await apiService.put<User>(`/users/${id}`, data);
  }

  /**
   * Delete user
   */
  async deleteUser(id: number): Promise<void> {
    await apiService.delete(`/users/${id}`);
  }

  /**
   * Update user's custom permissions
   */
  async updateUserPermissions(id: number, permissions: Record<string, string[]>): Promise<User> {
    return await apiService.put<User>(`/users/${id}`, {
      custom_permissions: permissions,
    });
  }

  /**
   * Assign role to user
   */
  async assignRole(userId: number, roleId: number): Promise<void> {
    await apiService.post('/users/roles/assign', {
      user_id: userId,
      role_id: roleId,
    });
  }

  /**
   * Update user's own profile
   */
  async updateProfile(id: number, data: Partial<{
    name: string;
    email: string;
    phone: string;
    birth_date: string;
    gender: string;
    address: string;
  }>): Promise<User> {
    return await apiService.put<User>(`/users/${id}`, data);
  }

  /**
   * Change password
   */
  async changePassword(data: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }): Promise<void> {
    await apiService.post('/auth/change-password', data);
  }
}

export const userService = new UserService();
