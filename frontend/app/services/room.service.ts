// filepath: /Applications/XAMPP/xamppfiles/VMU/frontend/app/services/room.service.ts

import type { Room } from '~/types/room';
import type { PaginatedResponse, TableQueryParams } from '~/types/common';

/**
 * Service để quản lý phòng học/lớp học
 * Fetch data từ Laravel backend API
 */
export class RoomService {
  private apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  private classManagementPath = `${this.apiUrl}/class-management`;

  /**
   * Lấy danh sách lớp học từ bảng classes
   * Sử dụng cột khoaHoc_id thay vì khoaHoc
   * ✅ FIXED: Fetch ALL classes by setting per_page to a large number
   */
  getClasses = async (params?: {
    khoaHoc_id?: number;
    major_id?: string;
    maTrinhDoDaoTao?: string;
    namVao?: number;
    search?: string;
  }): Promise<Room[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.khoaHoc_id) queryParams.append('khoaHoc_id', params.khoaHoc_id.toString());
      if (params?.major_id) queryParams.append('major_id', params.major_id);
      if (params?.maTrinhDoDaoTao) queryParams.append('maTrinhDoDaoTao', params.maTrinhDoDaoTao);
      if (params?.namVao) queryParams.append('namVao', params.namVao.toString());
      if (params?.search) queryParams.append('search', params.search);

      // ✅ FIX: Request all records for dropdown/autocomplete usage
      queryParams.append('per_page', '10000');

      const url = `${this.apiUrl}/classes${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      // API trả về { data: [...], current_page, total, ... }
      if (result.data) {
        return Array.isArray(result.data) ? result.data : [];
      }

      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Error fetching classes:', error);
      throw new Error('Không thể tải danh sách lớp học. Vui lòng thử lại sau.');
    }
  }

  /**
   * Lấy danh sách lớp học Thạc Sỹ theo năm vào
   * Fetch từ external API: http://203.162.246.113:8088/LopHoc/ThacSy?NamVao=2024
   */
  getLopHocThacSy = async (namVao: number = new Date().getFullYear()): Promise<Room[]> => {
    try {
      const response = await fetch(`${this.classManagementPath}/thac-sy?namVao=${namVao}`, {
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
      // Lấy toàn bộ data từ API classes thay vì external API
      const allData = await this.getClasses({
        khoaHoc_id: params.filters?.khoaHoc || params.filters?.khoaHoc_id,
        major_id: params.filters?.maNganhHoc || params.filters?.major_id,
        maTrinhDoDaoTao: params.filters?.maTrinhDoDaoTao,
        namVao: params.filters?.namVao,
        search: params.search,
      });

      // Client-side filtering
      let filteredData = allData;

      // Search (nếu chưa được filter bởi API)
      if (params.search && !params.filters) {
        const searchTerm = params.search.toLowerCase().trim();
        filteredData = filteredData.filter(room =>
          room.tenLop?.toLowerCase().includes(searchTerm) ||
          room.class_name?.toLowerCase().includes(searchTerm) ||
          room.giaoVienChuNhiem?.toLowerCase().includes(searchTerm) ||
          room.maNganhHoc?.toLowerCase().includes(searchTerm) ||
          room.major_id?.toLowerCase().includes(searchTerm)
        );
      }

      // Filter by khóa học (sử dụng khoaHoc_id)
      if (params.filters?.khoaHoc || params.filters?.khoaHoc_id) {
        const khoaHocFilter = params.filters?.khoaHoc || params.filters?.khoaHoc_id;
        filteredData = filteredData.filter(
          room => room.khoaHoc === Number(khoaHocFilter) || room.khoaHoc_id === Number(khoaHocFilter)
        );
      }

      // Sorting
      if (params.sort_by) {
        filteredData.sort((a, b) => {
          let aValue = a[params.sort_by as keyof Room];
          let bValue = b[params.sort_by as keyof Room];

          // Map old column names to new ones
          if (params.sort_by === 'khoaHoc') {
            aValue = a.khoaHoc_id || a.khoaHoc;
            bValue = b.khoaHoc_id || b.khoaHoc;
          } else if (params.sort_by === 'tenLop') {
            aValue = a.class_name || a.tenLop;
            bValue = b.class_name || b.tenLop;
          } else if (params.sort_by === 'maNganhHoc') {
            aValue = a.major_id || a.maNganhHoc;
            bValue = b.major_id || b.maNganhHoc;
          }

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
   * Lấy danh sách tất cả phòng học/lớp học
   * Ưu tiên sử dụng dữ liệu từ bảng classes
   */
  getDanhSach = async (): Promise<Room[]> => {
    try {
      // Thử lấy từ bảng classes trước
      return await this.getClasses();
    } catch (error) {
      console.warn('Failed to fetch from classes table, falling back to external API:', error);
      // Fallback về external API
      return this.getLopHocThacSy();
    }
  }

  /**
   * Lấy chi tiết một phòng học theo ID
   */
  getChiTiet = async (id: number): Promise<Room | null> => {
    try {
      const response = await fetch(`${this.classManagementPath}/${id}`, {
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
   * Lấy chi tiết lớp học theo ID từ /api/classes/{id}
   */
  getById = async (id: number): Promise<Room> => {
    try {
      const response = await fetch(`${this.apiUrl}/classes/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        return result.data;
      }

      throw new Error('Không tìm thấy lớp học');
    } catch (error) {
      console.error('Error fetching class by id:', error);
      throw error;
    }
  }

  /**
   * Cập nhật thông tin lớp học
   */
  update = async (id: number, data: Partial<Room>): Promise<Room> => {
    try {
      const response = await fetch(`${this.apiUrl}/classes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        return result.data;
      }

      throw new Error('Không thể cập nhật lớp học');
    } catch (error) {
      console.error('Error updating class:', error);
      throw error;
    }
  }

  /**
   * Xóa mềm lớp học (Soft Delete)
   */
  delete = async (id: number): Promise<void> => {
    try {
      const response = await fetch(`${this.apiUrl}/classes/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Không thể xóa lớp học');
      }
    } catch (error) {
      console.error('Error deleting class:', error);
      throw error;
    }
  }

  /**
   * Xóa cứng lớp học (Hard Delete - vĩnh viễn)
   */
  forceDelete = async (id: number): Promise<void> => {
    try {
      const response = await fetch(`${this.apiUrl}/classes/${id}/force`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Không thể xóa vĩnh viễn lớp học');
      }
    } catch (error) {
      console.error('Error force deleting class:', error);
      throw error;
    }
  }
}

export const roomService = new RoomService();
