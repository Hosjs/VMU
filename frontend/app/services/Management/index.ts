export * from './user.service';
export * from './role.service';
import { apiService } from '../api.service';
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
  custom_permissions?: Record<string, string[]>;
}

export interface UserStatistics {
  total: number;
  active: number;
  inactive: number;
  by_role: Record<string, number>;
}

class UserService {
  private readonly BASE_PATH = '/management/users';

  async getUsers(params: TableQueryParams): Promise<PaginatedResponse<AuthUser>> {
    return apiService.getPaginated<AuthUser>(this.BASE_PATH, params);
  }

  async getUserById(id: number): Promise<AuthUser> {
    return apiService.get<AuthUser>(`${this.BASE_PATH}/${id}`);
  }

  async createUser(data: UserFormData): Promise<AuthUser> {
    return apiService.post<AuthUser>(this.BASE_PATH, data);
  }

  async updateUser(id: number, data: Partial<UserFormData>): Promise<AuthUser> {
    return apiService.put<AuthUser>(`${this.BASE_PATH}/${id}`, data);
  }

  async deleteUser(id: number): Promise<void> {
    return apiService.delete<void>(`${this.BASE_PATH}/${id}`);
  }

  async activateUser(id: number): Promise<AuthUser> {
    return apiService.post<AuthUser>(`${this.BASE_PATH}/${id}/activate`, {});
  }

  async getStatistics(): Promise<UserStatistics> {
    return apiService.get<UserStatistics>(`${this.BASE_PATH}/statistics`);
  }

  async getDepartments(): Promise<string[]> {
    try {
      return await apiService.get<string[]>(`${this.BASE_PATH}/departments`);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      return ['Quản lý', 'Kỹ thuật', 'Kế toán', 'Nhân sự', 'Marketing', 'Bán hàng', 'Kho vận'];
    }
  }

  async getPositions(): Promise<string[]> {
    try {
      return await apiService.get<string[]>(`${this.BASE_PATH}/positions`);
    } catch (error) {
      console.error('Failed to fetch positions:', error);
      return ['Giám đốc', 'Quản lý', 'Nhân viên', 'Kỹ thuật viên', 'Kế toán viên'];
    }
  }
}

export const userService = new UserService();
