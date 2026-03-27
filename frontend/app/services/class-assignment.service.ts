// filepath: /Applications/XAMPP/xamppfiles/VMU/frontend/app/services/class-assignment.service.ts

import type { ClassAssignment } from '~/types/class-assignment';
import type { PaginatedResponse, TableQueryParams } from '~/types/common';
import { getApiBaseUrl } from './api.service';

/**
 * Service để quản lý phân lớp học viên
 * Fetch data từ external API qua Laravel backend proxy
 */
export class ClassAssignmentService {
  private apiUrl = getApiBaseUrl();

  /**
   * Lấy danh sách học viên trong lớp với pagination (client-side)
   * Để tương thích với useTable hook
   */
  getList = async (params: TableQueryParams): Promise<PaginatedResponse<ClassAssignment>> => {
    try {
      // Lấy lopId từ filters
      const lopId = params.filters?.lopId;
      if (!lopId) {
        // Trả về rỗng thay vì báo lỗi, để UI hiển thị thông báo "Vui lòng chọn lớp"
        return {
          data: [],
          current_page: 1,
          last_page: 1,
          per_page: params.per_page || 20,
          total: 0,
          from: 0,
          to: 0,
          first_page_url: '',
          last_page_url: '',
          next_page_url: null,
          prev_page_url: null,
          path: '',
        };
      }

      // Gọi API với lopId as query param
      const response = await fetch(`${this.apiUrl}/class-assignments?lopId=${lopId}`, {
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
      let allData: ClassAssignment[] = [];
      if (result.success && result.data) {
        allData = Array.isArray(result.data) ? result.data : [];
      } else if (Array.isArray(result)) {
        allData = result;
      }

      // Client-side filtering
      let filteredData = allData;

      // Search - sử dụng lowercase field names
      if (params.search) {
        const searchTerm = params.search.toLowerCase().trim();
        filteredData = filteredData.filter(item =>
          item.mahv?.toLowerCase().includes(searchTerm) ||
          item.hodem?.toLowerCase().includes(searchTerm) ||
          item.ten?.toLowerCase().includes(searchTerm) ||
          item.email?.toLowerCase().includes(searchTerm) ||
          item.dienthoai?.toLowerCase().includes(searchTerm)
        );
      }

      if (params.filters?.gioiTinh) {
        filteredData = filteredData.filter(
          item => item.gioitinh === params.filters?.gioiTinh
        );
      }

      // Filter by trạng thái học - sử dụng lowercase
      if (params.filters?.trangThaiHoc) {
        filteredData = filteredData.filter(
          item => item.trangthaihoc === params.filters?.trangThaiHoc
        );
      }

      // Sorting
      if (params.sort_by) {
        filteredData.sort((a, b) => {
          const aValue = a[params.sort_by as keyof ClassAssignment];
          const bValue = b[params.sort_by as keyof ClassAssignment];

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
      console.error('Error fetching class assignments list:', error);
      throw error;
    }
  }

  /**
   * Lấy chi tiết 1 phân lớp
   */
  getById = async (id: number): Promise<ClassAssignment> => {
    try {
      const response = await fetch(`${this.apiUrl}/class-assignments/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching class assignment:', error);
      throw new Error('Không thể tải thông tin phân lớp. Vui lòng thử lại sau.');
    }
  }

  /**
   * Thêm học viên vào lớp
   */
  assign = async (lopId: number, maHV: string): Promise<ClassAssignment> => {
    try {
      const response = await fetch(`${this.apiUrl}/class-assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idLop: lopId, maHV }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to assign student');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error assigning student:', error);
      throw error;
    }
  }

  /**
   * Phân lớp hàng loạt
   */
  bulkAssign = async (lopId: number, students: string[]): Promise<any> => {
    try {
      const response = await fetch(`${this.apiUrl}/class-assignments/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idLop: lopId, students }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to bulk assign students');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error bulk assigning students:', error);
      throw error;
    }
  }

  /**
   * Xóa học viên khỏi lớp
   */
  remove = async (id: number): Promise<void> => {
    try {
      const response = await fetch(`${this.apiUrl}/class-assignments/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to remove student');
      }
    } catch (error) {
      console.error('Error removing student:', error);
      throw error;
    }
  }

  /**
   * Xóa nhiều học viên khỏi lớp
   */
  bulkRemove = async (lopId: number, students: string[]): Promise<void> => {
    try {
      const response = await fetch(`${this.apiUrl}/class-assignments/bulk-remove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idLop: lopId, students }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to bulk remove students');
      }
    } catch (error) {
      console.error('Error bulk removing students:', error);
      throw error;
    }
  }
}

export const classAssignmentService = new ClassAssignmentService();
