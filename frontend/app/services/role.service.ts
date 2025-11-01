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
   */
  async getRoles(params?: RoleListParams): Promise<RoleListResponse> {
    return await apiService.get<RoleListResponse>('/users/roles', params);
  },

  /**
   * Lấy chi tiết một role
   */
  async getRoleById(id: number): Promise<Role> {
    const response = await apiService.get<RoleDetailResponse>(`/users/roles/${id}`);
    return response.data;
  },

  /**
   * Tạo role mới
   */
  async createRole(data: RoleFormData): Promise<Role> {
    const response = await apiService.post<RoleDetailResponse>('/users/roles', data);
    return response.data;
  },

  /**
   * Cập nhật role
   */
  async updateRole(id: number, data: Partial<RoleFormData>): Promise<Role> {
    const response = await apiService.put<RoleDetailResponse>(`/users/roles/${id}`, data);
    return response.data;
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
    const response = await apiService.get<PermissionsResponse>('/users/roles/permissions');
    return response.data;
  },

  /**
   * Cập nhật permissions cho role
   */
  async updatePermissions(id: number, permissions: PermissionMap): Promise<Role> {
    const response = await apiService.post<RoleDetailResponse>(
      `/users/roles/${id}/permissions`,
      { permissions }
    );
    return response.data;
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
