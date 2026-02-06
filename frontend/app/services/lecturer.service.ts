import { apiService } from './api.service';
import type { Lecturer, LecturerFilters, LecturerListResponse } from '~/types/lecturer';
import type { PaginatedResponse, TableQueryParams } from '~/types/common';

/**
 * Service để quản lý giảng viên (lecturers)
 */
export const lecturerService = {

  async getLecturersPaginated(params: TableQueryParams): Promise<PaginatedResponse<Lecturer>> {
    return apiService.getPaginated<Lecturer>('/lecturers', params);
  },

  /**
   * Lấy danh sách giảng viên (legacy - tương thích)
   */
  async getList(filters?: LecturerFilters): Promise<LecturerListResponse> {
    try {
      const params: any = {
        page: filters?.page || 1,
        per_page: filters?.per_page || 20,
      };

      if (filters?.search) params.search = filters.search;
      if (filters?.maNganh) params.maNganh = filters.maNganh;
      if (filters?.hocHam) params.hocHam = filters.hocHam;
      if (filters?.trinhDoChuyenMon) params.trinhDoChuyenMon = filters.trinhDoChuyenMon;

      const response = await apiService.getPaginated<Lecturer>('/lecturers', params);

      return {
        success: true,
        data: response.data,
        meta: {
          current_page: response.current_page,
          from: response.from,
          last_page: response.last_page,
          per_page: response.per_page,
          to: response.to,
          total: response.total,
        },
      };
    } catch (error) {
      console.error('Error fetching lecturers:', error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết một giảng viên theo ID
   */
  async getById(id: number): Promise<Lecturer> {
    return await apiService.get<Lecturer>(`/lecturers/${id}`);
  },

  async create(data: Partial<Lecturer>): Promise<Lecturer> {
    return await apiService.post<Lecturer>('/lecturers', data);
  },

  async update(id: number, data: Partial<Lecturer>): Promise<Lecturer> {
    return await apiService.put<Lecturer>(`/lecturers/${id}`, data);
  },

  async delete(id: number): Promise<void> {
    await apiService.delete(`/lecturers/${id}`);
  },

  /**
   * Get simplified list of lecturers for autocomplete
   */
  async getSimpleLecturers(): Promise<Array<{ id: number; hoTen: string; trinhDoChuyenMon?: string; hocHam?: string }>> {
    return await apiService.get<Array<{ id: number; hoTen: string; trinhDoChuyenMon?: string; hocHam?: string }>>('/lecturers/simple');
  },
};

