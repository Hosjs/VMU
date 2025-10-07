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
   * Get user statistics
   */
  async getStatistics(): Promise<UserStatistics> {
    return apiService.get<UserStatistics>(`${this.BASE_PATH}/statistics`);
  }

  /**
   * Get list of departments
   */
  async getDepartments(): Promise<string[]> {
    try {
      const response = await apiService.get<string[]>(`${this.BASE_PATH}/departments`);
      return response;
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      // Return default departments if API fails
      return [
        'Quản lý',
        'Kỹ thuật',
        'Kế toán',
        'Nhân sự',
        'Marketing',
        'Bán hàng',
        'Kho vận',
      ];
    }
  }

  /**
   * Get list of positions
   */
  async getPositions(): Promise<string[]> {
    try {
      const response = await apiService.get<string[]>(`${this.BASE_PATH}/positions`);
      return response;
    } catch (error) {
      console.error('Failed to fetch positions:', error);
      // Return default positions if API fails
      return [
        'Giám đốc',
        'Phó giám đốc',
        'Trưởng phòng',
        'Phó phòng',
        'Trưởng nhóm',
        'Nhân viên',
        'Thực tập sinh',
      ];
    }
  }

  /**
   * Change user password
   */
  async changePassword(id: number, oldPassword: string, newPassword: string): Promise<void> {
    return apiService.put<void>(`${this.BASE_PATH}/${id}/change-password`, {
      old_password: oldPassword,
      new_password: newPassword,
    });
  }

  /**
   * Reset user password (admin only)
   */
  async resetPassword(id: number, newPassword: string): Promise<void> {
    return apiService.put<void>(`${this.BASE_PATH}/${id}/reset-password`, {
      new_password: newPassword,
    });
  }

  /**
   * Toggle user active status
   */
  async toggleStatus(id: number): Promise<AuthUser> {
    return apiService.put<AuthUser>(`${this.BASE_PATH}/${id}/toggle-status`, {});
  }
}

export const userService = new UserService();

