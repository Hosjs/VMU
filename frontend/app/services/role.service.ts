import { apiService } from './api.service';
import type {
  Role,
  RoleFormData,
  RoleListParams,
  RoleListResponse,
  RoleDetailResponse,
  PermissionsResponse,
  PermissionMap,
  PermissionModule,
} from '~/types/role';

export const roleService = {
  /**
   * Lấy danh sách roles với phân trang
   * Sử dụng public endpoint /api/roles (không cần auth)
   */
  async getRoles(params?: RoleListParams): Promise<RoleListResponse> {
    return await apiService.get<RoleListResponse>('/roles', params);
  },

  /**
   * Lấy danh sách roles cho management (authenticated)
   */
  async getRolesManagement(params?: RoleListParams): Promise<RoleListResponse> {
    return await apiService.get<RoleListResponse>('/users/roles', params);
  },

  /**
   * Lấy chi tiết một role
   */
  async getRoleById(id: number): Promise<Role> {
    return await apiService.get<Role>(`/roles/${id}`);
  },

  /**
   * Tạo role mới
   */
  async createRole(data: RoleFormData): Promise<Role> {
    return await apiService.post<Role>('/users/roles', data);
  },

  /**
   * Cập nhật role
   */
  async updateRole(id: number, data: Partial<RoleFormData>): Promise<Role> {
    return await apiService.put<Role>(`/users/roles/${id}`, data);
  },

  /**
   * Xóa role
   */
  async deleteRole(id: number): Promise<void> {
    await apiService.delete(`/users/roles/${id}`);
  },

  /**
   * Lấy danh sách tất cả modules và actions
   */
  async getPermissions(): Promise<PermissionModule[]> {
    return await apiService.get<PermissionModule[]>('/users/roles/permissions');
  },

  /**
   * Cập nhật permissions cho role
   */
  async updatePermissions(id: number, permissions: PermissionMap): Promise<Role> {
    return await apiService.post<Role>(
      `/users/roles/${id}/permissions`,
      { permissions }
    );
  },

  /**
   * Gán role cho user
   */
  async assignRole(userId: number, roleId: number): Promise<void> {
    await apiService.post('/users/roles/assign', {
      user_id: userId,
      role_id: roleId,
    });
  },
};
