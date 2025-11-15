import { apiService } from './api.service';
import type { TeachingAssignment, TeachingAssignmentFormData, TeachingAssignmentFilters } from '~/types/teaching-assignment';
import type { PaginatedResponse, TableQueryParams } from '~/types/common';

/**
 * Service để quản lý lịch giảng dạy (teaching assignments)
 */
export const teachingAssignmentService = {
  /**
   * Lấy danh sách lịch giảng dạy với pagination
   */
  async getList(params: TableQueryParams): Promise<PaginatedResponse<TeachingAssignment>> {
    return apiService.getPaginated<TeachingAssignment>('/teaching-assignments', params);
  },

  /**
   * Lấy chi tiết một lịch giảng dạy
   */
  async getById(id: number): Promise<TeachingAssignment> {
    return apiService.get<TeachingAssignment>(`/teaching-assignments/${id}`);
  },

  /**
   * Tạo lịch giảng dạy mới
   */
  async create(data: TeachingAssignmentFormData): Promise<{ success: boolean; message: string; data: TeachingAssignment }> {
    return apiService.post<{ success: boolean; message: string; data: TeachingAssignment }>('/teaching-assignments', data);
  },

  /**
   * Cập nhật lịch giảng dạy
   */
  async update(id: number, data: Partial<TeachingAssignmentFormData>): Promise<{ success: boolean; message: string; data: TeachingAssignment }> {
    return apiService.put<{ success: boolean; message: string; data: TeachingAssignment }>(`/teaching-assignments/${id}`, data);
  },

  /**
   * Xóa lịch giảng dạy
   */
  async delete(id: number): Promise<{ success: boolean; message: string }> {
    return apiService.delete<{ success: boolean; message: string }>(`/teaching-assignments/${id}`);
  },

  /**
   * Lấy lịch giảng dạy của một giảng viên
   */
  async getLecturerSchedule(lecturerId: number, month?: number, year?: number): Promise<{
    success: boolean;
    lecturer: any;
    assignments: TeachingAssignment[];
  }> {
    const params: any = {};
    if (month) params.month = month;
    if (year) params.year = year;

    return apiService.get<{
      success: boolean;
      lecturer: any;
      assignments: TeachingAssignment[];
    }>(`/teaching-assignments/lecturer/${lecturerId}/schedule`, params);
  },

  /**
   * Kiểm tra xung đột lịch giảng dạy
   */
  async checkConflict(data: {
    lecturer_id: number;
    day_of_week: 'saturday' | 'sunday';
    start_time: string;
    end_time: string;
    start_date: string;
    end_date: string;
    exclude_id?: number;
  }): Promise<{ success: boolean; has_conflict: boolean }> {
    return apiService.post<{ success: boolean; has_conflict: boolean }>('/teaching-assignments/check-conflict', data);
  },
};


