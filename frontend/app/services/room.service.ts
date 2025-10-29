// filepath: /Applications/XAMPP/xamppfiles/VMU/frontend/app/services/room.service.ts

import type { Room } from '~/types/room';
import type { PaginatedResponse, TableQueryParams } from '~/types/common';

/**
 * Service để quản lý phòng học/lớp học
 * Fetch data từ external API qua Laravel backend proxy
 */
export class RoomService {
  private apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  /**
   * Lấy danh sách lớp học Thạc Sỹ theo năm vào
   * Fetch từ external API: http://203.162.246.113:8088/LopHoc/ThacSy?NamVao=2024
   */
  getLopHocThacSy = async (namVao: number = new Date().getFullYear()): Promise<Room[]> => {
    try {
      // Gọi qua Laravel backend để bypass CORS
      const response = await fetch(`${this.apiUrl}/rooms/thac-sy?namVao=${namVao}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      // API trả về { success: true, data: [...] }
      if (result.success && result.data) {
        return Array.isArray(result.data) ? result.data : [];
      }

      if (Array.isArray(result)) {
        return result;
      }

      return [];
    } catch (error) {
      console.error('Error fetching rooms:', error);
      throw new Error('Không thể tải danh sách lớp học. Vui lòng thử lại sau.');
    }
  }

  /**
   * Lấy danh sách lớp học với pagination (client-side)
   * Để tương thích với useTable hook
   */
  getList = async (params: TableQueryParams): Promise<PaginatedResponse<Room>> => {
    try {
      // Lấy toàn bộ data từ API
      const namVao = params.filters?.namVao || new Date().getFullYear();
      const allData = await this.getLopHocThacSy(namVao);

      // Client-side filtering
      let filteredData = allData;

      // Search
      if (params.search) {
        const searchTerm = params.search.toLowerCase().trim();
        filteredData = filteredData.filter(room =>
          room.tenLop?.toLowerCase().includes(searchTerm) ||
          room.giaoVienChuNhiem?.toLowerCase().includes(searchTerm) ||
          room.maNganhHoc?.toLowerCase().includes(searchTerm)
        );
      }

      // Filter by trình độ
      if (params.filters?.maTrinhDoDaoTao) {
        filteredData = filteredData.filter(
          room => room.maTrinhDoDaoTao === params.filters?.maTrinhDoDaoTao
        );
      }

      // Filter by ngành học
      if (params.filters?.maNganhHoc) {
        filteredData = filteredData.filter(
          room => room.maNganhHoc === params.filters?.maNganhHoc
        );
      }

      // Filter by khóa học
      if (params.filters?.khoaHoc) {
        filteredData = filteredData.filter(
          room => room.khoaHoc === Number(params.filters?.khoaHoc)
        );
      }

      // Sorting
      if (params.sort_by) {
        filteredData.sort((a, b) => {
          const aValue = a[params.sort_by as keyof Room];
          const bValue = b[params.sort_by as keyof Room];

          if (aValue == null) return 1;
          if (bValue == null) return -1;

          const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
          return params.sort_direction === 'desc' ? -comparison : comparison;
        });
      }

      // Pagination
      const page = params.page || 1;
      const perPage = params.per_page || 20;
      const total = filteredData.length;
      const lastPage = Math.ceil(total / perPage);
      const from = (page - 1) * perPage + 1;
      const to = Math.min(page * perPage, total);

      const paginatedData = filteredData.slice((page - 1) * perPage, page * perPage);

      return {
        data: paginatedData,
        current_page: page,
        last_page: lastPage,
        per_page: perPage,
        total,
        from: total > 0 ? from : 0,
        to: total > 0 ? to : 0,
        first_page_url: '',
        last_page_url: '',
        next_page_url: page < lastPage ? '' : null,
        prev_page_url: page > 1 ? '' : null,
        path: '',
      };
    } catch (error) {
      console.error('Error fetching rooms list:', error);
      throw new Error('Không thể tải danh sách lớp học. Vui lòng thử lại sau.');
    }
  }

  /**
   * Lấy danh sách tất cả phòng học/lớp học qua Laravel backend proxy
   * @deprecated Use getLopHocThacSy instead
   */
  getDanhSach = async (): Promise<Room[]> => {
    return this.getLopHocThacSy();
  }

  /**
   * Lấy chi tiết một phòng học theo ID
   */
  getChiTiet = async (id: number): Promise<Room | null> => {
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
}

export const roomService = new RoomService();
