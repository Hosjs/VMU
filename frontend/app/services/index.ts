// Export all services
export * from './api.service';
export * from './user.service';
export * from './customer.service';
export * from './product.service';
export * from './category.service';
export * from './role.service';
export * from './dashboard.service';
import { apiService } from './api.service';
import type { PaginatedResponse, TableQueryParams } from '~/types/common';
import type { AuthUser } from '~/types/auth';

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role_id: number;
  employee_code?: string;
  position?: string;
  department?: string;
  hire_date?: string;
  salary?: number;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  is_active?: boolean;
  notes?: string;
}

export interface UserStatistics {
  total: number;
  active: number;
  inactive: number;
  by_role: Record<string, number>;
  by_department: Record<string, number>;
}

class UserService {
  private readonly BASE_PATH = '/admin/users';

  /**
   * Get paginated list of users
   */
  async getUsers(params: TableQueryParams): Promise<PaginatedResponse<AuthUser>> {
    return apiService.getPaginated<AuthUser>(this.BASE_PATH, params);
  }

  /**
   * Get single user by ID
   */
  async getUserById(id: number): Promise<AuthUser> {
    return apiService.get<AuthUser>(`${this.BASE_PATH}/${id}`);
  }

  /**
   * Create new user
   */
  async createUser(data: UserFormData): Promise<AuthUser> {
    return apiService.post<AuthUser>(this.BASE_PATH, data);
  }

  /**
   * Update existing user
   */
  async updateUser(id: number, data: Partial<UserFormData>): Promise<AuthUser> {
    return apiService.put<AuthUser>(`${this.BASE_PATH}/${id}`, data);
  }

  /**
   * Delete user (deactivate)
   */
  async deleteUser(id: number): Promise<void> {
    return apiService.delete<void>(`${this.BASE_PATH}/${id}`);
  }

  /**
   * Activate user
   */
  async activateUser(id: number): Promise<AuthUser> {
    return apiService.post<AuthUser>(`${this.BASE_PATH}/${id}/activate`, {});
  }

  /**
   * Get list of departments
   */
  async getDepartments(): Promise<string[]> {
    return apiService.get<string[]>(`${this.BASE_PATH}-departments`);
  }

  /**
   * Get list of positions
   */
  async getPositions(): Promise<string[]> {
    return apiService.get<string[]>(`${this.BASE_PATH}-positions`);
  }

  /**
   * Get user statistics
   */
  async getStatistics(): Promise<UserStatistics> {
    return apiService.get<UserStatistics>(`${this.BASE_PATH}-statistics`);
  }
}

export const userService = new UserService();

