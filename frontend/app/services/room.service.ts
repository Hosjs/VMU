// filepath: /Applications/XAMPP/xamppfiles/VMU/frontend/app/services/room.service.ts

import type { Room } from '~/types/room';

/**
 * Service để quản lý phòng học/lớp học
 * Gọi qua Laravel backend (proxy) để bypass CORS issue
 */
export class RoomService {
  private apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  /**
   * Lấy danh sách tất cả phòng học/lớp học qua Laravel backend proxy
   */
  async getDanhSach(): Promise<Room[]> {
    try {
      const response = await fetch(`${this.apiUrl}/rooms`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      // API trả về { success: true, data: [...] } hoặc trực tiếp array
      if (result.success && result.data) {
        return Array.isArray(result.data) ? result.data : [];
      }

      if (Array.isArray(result)) {
        return result;
      }

      return [];
    } catch (error) {
      console.error('Error fetching rooms:', error);
      throw new Error('Không thể tải danh sách phòng học. Vui lòng thử lại sau.');
    }
  }

  /**
   * Lấy chi tiết một phòng học theo ID
   */
  async getChiTiet(id: number): Promise<Room | null> {
    try {
      const response = await fetch(`${this.apiUrl}/rooms/${id}`, {
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
      console.error('Error fetching room detail:', error);
      throw error;
    }
  }

  /**
   * Tìm kiếm phòng học theo từ khóa (client-side filtering)
   */
  async timKiem(keyword: string): Promise<Room[]> {
    try {
      const danhSach = await this.getDanhSach();

      if (!keyword || keyword.trim() === '') {
        return danhSach;
      }

      const searchTerm = keyword.toLowerCase().trim();

      return danhSach.filter(room =>
        room.tenLop?.toLowerCase().includes(searchTerm) ||
        room.giaoVienChuNhiem?.toLowerCase().includes(searchTerm) ||
        room.maNganhHoc?.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      console.error('Error searching rooms:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const roomService = new RoomService();

