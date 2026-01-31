import { apiService } from './api.service';
import type { TeachingSession, TeachingSessionFormData, TeachingSessionFilters } from '~/types/teaching-session';
import type { PaginatedResponse, TableQueryParams } from '~/types/common';

/**
 * Service để quản lý các buổi học cụ thể (teaching sessions)
 */
export const teachingSessionService = {
  /**
   * Lấy danh sách sessions với pagination
   */
  async getList(params: TableQueryParams): Promise<PaginatedResponse<TeachingSession>> {
    return apiService.getPaginated<TeachingSession>('/teaching-sessions', params);
  },

  /**
   * Lấy chi tiết một session
   */
  async getById(id: number): Promise<TeachingSession> {
    return apiService.get<TeachingSession>(`/teaching-sessions/${id}`);
  },

  /**
   * Tạo session mới
   */
  async create(data: TeachingSessionFormData): Promise<{ success: boolean; message: string; data: TeachingSession }> {
    return apiService.post<{ success: boolean; message: string; data: TeachingSession }>('/teaching-sessions', data);
  },

  /**
   * Cập nhật session (đổi lịch)
   */
  async update(id: number, data: Partial<TeachingSessionFormData>): Promise<{ success: boolean; message: string; data: TeachingSession }> {
    return apiService.put<{ success: boolean; message: string; data: TeachingSession }>(`/teaching-sessions/${id}`, data);
  },

  /**
   * Xóa session
   */
  async delete(id: number): Promise<{ success: boolean; message: string }> {
    return apiService.delete<{ success: boolean; message: string }>(`/teaching-sessions/${id}`);
  },

  /**
   * Tạo sessions tự động từ teaching_assignment
   */
  async generateSessions(assignmentId: number, force: boolean = false): Promise<{ success: boolean; message: string; data: TeachingSession[] }> {
    return apiService.post<{ success: boolean; message: string; data: TeachingSession[] }>(
      `/teaching-sessions/generate/${assignmentId}`,
      { force }
    );
  },

  /**
   * Lấy sessions của một assignment
   */
  async getSessionsByAssignment(assignmentId: number): Promise<PaginatedResponse<TeachingSession>> {
    return this.getList({
      page: 1,
      per_page: 1000,
      filters: {
        teaching_assignment_id: assignmentId
      }
    });
  },

  /**
   * Lấy sessions của giảng viên trong khoảng thời gian
   */
  async getLecturerSessions(lecturerId: number, startDate: string, endDate: string): Promise<PaginatedResponse<TeachingSession>> {
    return this.getList({
      page: 1,
      per_page: 1000,
      filters: {
        lecturer_id: lecturerId,
        start_date: startDate,
        end_date: endDate
      }
    });
  },
};
