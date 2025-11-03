// filepath: /Applications/XAMPP/xamppfiles/VMU/frontend/app/services/major.service.ts

import { apiService } from './api.service';
import type { Major } from '~/types/major';
import type { PaginatedResponse, TableQueryParams } from '~/types/common';

/**
 * Service để quản lý ngành học (majors)
 * Sử dụng apiService chuẩn để gọi API từ database
 */
class MajorService {
  /**
   * Lấy danh sách ngành học với pagination
   */
  async getMajors(params: TableQueryParams): Promise<PaginatedResponse<Major>> {
    return apiService.getPaginated<Major>('/majors', params);
  }

  /**
   * Lấy chi tiết một ngành học theo ID
   */
  async getMajor(id: number): Promise<Major> {
    return apiService.get<Major>(`/majors/${id}`);
  }

  /**
   * Tạo ngành học mới
   */
  async createMajor(data: Partial<Major>): Promise<Major> {
    return apiService.post<Major>('/majors', data);
  }

  /**
   * Cập nhật ngành học
   */
  async updateMajor(id: number, data: Partial<Major>): Promise<Major> {
    return apiService.put<Major>(`/majors/${id}`, data);
  }

  /**
   * Xóa ngành học
   */
  async deleteMajor(id: number): Promise<void> {
    return apiService.delete(`/majors/${id}`);
  }

  /**
   * Lấy danh sách tất cả (dùng cho dropdown/select)
   */
  async getAllMajors(): Promise<Major[]> {
    const response = await apiService.getPaginated<Major>('/majors', {
      page: 1,
      per_page: 1000, // Lấy tất cả
    });
    return response.data;
  }
}

export const majorService = new MajorService();
