import { apiService } from '../api.service';
import type { Role } from '~/types/auth';
import type { PaginatedResponse, TableQueryParams } from '~/types/common';

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

  constructor() {
    // ✅ Bind methods để giữ context
    this.getRoles = this.getRoles.bind(this);
    this.getRoleById = this.getRoleById.bind(this);
    this.createRole = this.createRole.bind(this);
    this.updateRole = this.updateRole.bind(this);
    this.deleteRole = this.deleteRole.bind(this);
    this.getAvailablePermissions = this.getAvailablePermissions.bind(this);
  }

  async getRoles(params?: TableQueryParams): Promise<PaginatedResponse<Role>> {
    // ✅ Sửa: getRoles nên dùng getPaginated thay vì get
    return apiService.getPaginated<Role>(this.BASE_PATH, params || { page: 1, per_page: 10 });
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
