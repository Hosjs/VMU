// filepath: /Applications/XAMPP/xamppfiles/VMU/frontend/app/services/education-level.service.ts

import type { EducationLevel } from '~/types/education-level';
import type { PaginatedResponse, TableQueryParams } from '~/types/common';

/**
 * Service để quản lý trình độ đào tạo từ database
 */
export class EducationLevelService {
  private apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  /**
   * Lấy danh sách trình độ đào tạo với pagination
   */
  async getList(params: TableQueryParams): Promise<PaginatedResponse<EducationLevel>> {
    try {
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append('page', params.page.toString());
      if (params.per_page) queryParams.append('per_page', params.per_page.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.sort_by) queryParams.append('sort_by', params.sort_by);
      if (params.sort_direction) queryParams.append('sort_direction', params.sort_direction);

      const response = await fetch(`${this.apiUrl}/education-levels?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        return {
          data: result.data,
          current_page: result.current_page,
          last_page: result.last_page,
          per_page: result.per_page,
          total: result.total,
          from: result.from,
          to: result.to,
          first_page_url: result.first_page_url,
          last_page_url: result.last_page_url,
          next_page_url: result.next_page_url,
          prev_page_url: result.prev_page_url,
          path: result.path,
        };
      }

      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error fetching education levels:', error);
      throw new Error('Không thể tải danh sách trình độ đào tạo. Vui lòng thử lại sau.');
    }
  }

  /**
   * Lấy chi tiết một trình độ đào tạo
   */
  async getById(ma: string): Promise<EducationLevel | null> {
    try {
      const response = await fetch(`${this.apiUrl}/education-levels/${ma}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        return result.data;
      }

      return null;
    } catch (error) {
      console.error('Error fetching education level detail:', error);
      throw error;
    }
  }

  /**
   * Tạo mới trình độ đào tạo
   */
  async create(data: Partial<EducationLevel>): Promise<EducationLevel> {
    try {
      const response = await fetch(`${this.apiUrl}/education-levels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Không thể tạo trình độ đào tạo');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error creating education level:', error);
      throw error;
    }
  }

  /**
   * Cập nhật trình độ đào tạo
   */
  async update(ma: string, data: Partial<EducationLevel>): Promise<EducationLevel> {
    try {
      const response = await fetch(`${this.apiUrl}/education-levels/${ma}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Không thể cập nhật trình độ đào tạo');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error updating education level:', error);
      throw error;
    }
  }

  /**
   * Xóa trình độ đào tạo
   */
  async delete(ma: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/education-levels/${ma}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Không thể xóa trình độ đào tạo');
      }
    } catch (error) {
      console.error('Error deleting education level:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const educationLevelService = new EducationLevelService();

