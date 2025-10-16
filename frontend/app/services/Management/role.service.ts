import { apiService } from '../api.service';
import type { Role } from '~/types/auth';

export interface RoleFormData {
  name: string;
  display_name: string;
  description?: string;
  permissions: Record<string, string[]>;
  is_active?: boolean;
}

export interface AvailablePermissions {
  [module: string]: {
    label: string;
    permissions: Array<{
      key: string;
      label: string;
      description?: string;
    }>;
  };
}

class RoleService {
  private readonly BASE_PATH = '/management/roles';

  async getRoles(params?: { search?: string; is_active?: boolean }): Promise<Role[]> {
    return apiService.get<Role[]>(this.BASE_PATH, params);
  }

  async getRoleById(id: number): Promise<Role> {
    return apiService.get<Role>(`${this.BASE_PATH}/${id}`);
  }

  async createRole(data: RoleFormData): Promise<Role> {
    return apiService.post<Role>(this.BASE_PATH, data);
  }

  async updateRole(id: number, data: Partial<RoleFormData>): Promise<Role> {
    return apiService.put<Role>(`${this.BASE_PATH}/${id}`, data);
  }

  async deleteRole(id: number): Promise<void> {
    return apiService.delete<void>(`${this.BASE_PATH}/${id}`);
  }

  async getAvailablePermissions(): Promise<AvailablePermissions> {
    return apiService.get<AvailablePermissions>(`${this.BASE_PATH}/permissions`);
  }
}

export const roleService = new RoleService();
