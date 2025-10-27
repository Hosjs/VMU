// filepath: /Applications/XAMPP/xamppfiles/VMU/frontend/app/services/major.service.ts

import type { Major } from '~/types/major';

/**
 * Service để quản lý ngành học (majors)
 * Gọi qua Laravel backend (proxy) để bypass CORS issue
 */
export class MajorService {
  private apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  /**
   * Lấy danh sách tất cả ngành học qua Laravel backend proxy
   */
  async getDanhSach(): Promise<Major[]> {
    try {
      const response = await fetch(`${this.apiUrl}/majors`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      // API trả về { success: true, data: { data: [...] } }
      if (result.success && result.data) {
        if (result.data.data && Array.isArray(result.data.data)) {
          return result.data.data;
        }
        if (Array.isArray(result.data)) {
          return result.data;
        }
      }

      return [];
    } catch (error) {
      console.error('Error fetching majors:', error);
      throw new Error('Không thể tải danh sách ngành học. Vui lòng thử lại sau.');
    }
  }

  /**
   * Lấy chi tiết một ngành học theo mã
   */
  async getChiTiet(maNganh: string): Promise<Major | null> {
    try {
      const response = await fetch(`${this.apiUrl}/majors/${maNganh}`, {
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
      console.error('Error fetching major detail:', error);
      throw error;
    }
  }

  /**
   * Tìm kiếm ngành học theo từ khóa (client-side filtering)
   */
  async timKiem(keyword: string): Promise<Major[]> {
    try {
      const danhSach = await this.getDanhSach();

      if (!keyword || keyword.trim() === '') {
        return danhSach;
      }

      const searchTerm = keyword.toLowerCase().trim();

      return danhSach.filter(major =>
        major.ma?.toLowerCase().includes(searchTerm) ||
        major.tenNganhHoc?.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      console.error('Error searching majors:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const majorService = new MajorService();
