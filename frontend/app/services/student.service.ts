import { apiService } from './api.service';
import type { Student, StudentFilters, StudentListResponse } from '~/types/student';
import type { PaginatedResponse, TableQueryParams } from '~/types/common';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const studentService = {
  /**
   * Lấy danh sách học viên thạc sỹ từ API external (qua Laravel proxy)
   * API: /api/students/thac-sy?namVao=2022&maNganh=8310110
   */
  async getThacSyList(namVao: number, maNganh: string): Promise<Student[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/students/thac-sy?namVao=${namVao}&maNganh=${maNganh}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch student list');
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching ThacSy list:', error);
      throw error;
    }
  },

  /**
   * Lấy hồ sơ 1 học viên theo mã (qua Laravel proxy)
   * API: /api/students/by-code/DA2211003
   */
  async getStudentByCode(maHV: string): Promise<Student> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/students/by-code/${maHV}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch student detail');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching student by code:', error);
      throw error;
    }
  },

  /**
   * CRUD Operations (sử dụng internal API)
   */
  async getList(filters?: StudentFilters): Promise<StudentListResponse> {
    try {
      const params: any = {
        page: filters?.page || 1,
        per_page: filters?.per_page || 20,
      };

      if (filters?.search) params.search = filters.search;
      if (filters?.namVao) params.namVao = filters.namVao;
      if (filters?.maNganh) params.maNganh = filters.maNganh;
      if (filters?.maTrinhDoDaoTao) params.maTrinhDoDaoTao = filters.maTrinhDoDaoTao;
      if (filters?.trangThai) params.trangThai = filters.trangThai;
      if (filters?.gioiTinh) params.gioiTinh = filters.gioiTinh;

      const response = await apiService.getPaginated<Student>('/students', params);

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
      console.error('Error fetching students:', error);
      throw error;
    }
  },

  async getById(maHV: string): Promise<Student> {
    return await apiService.get<Student>(`/students/${maHV}`);
  },

  async create(data: Partial<Student>): Promise<Student> {
    return await apiService.post<Student>('/students', data);
  },

  async update(maHV: string, data: Partial<Student>): Promise<Student> {
    return await apiService.put<Student>(`/students/${maHV}`, data);
  },

  async delete(maHV: string): Promise<void> {
    await apiService.delete(`/students/${maHV}`);
  },

  /**
   * ✅ NEW: Lấy danh sách học viên với pagination (tương thích useTable hook)
   * Hàm này wrap API external và format về Laravel pagination format
   */
  async getStudentsPaginated(params: TableQueryParams): Promise<PaginatedResponse<Student>> {
    try {
      const { page = 1, per_page = 20, search, filters } = params;

      // Lấy filters
      const namVao = filters?.namVao || new Date().getFullYear();
      const maNganh = filters?.maNganh || '8310110';

      // Gọi API
      const response = await fetch(
        `${API_BASE_URL}/students/thac-sy?namVao=${namVao}&maNganh=${maNganh}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch student list');
      }

      const result = await response.json();
      let students: Student[] = result.data || [];

      // Client-side filtering
      if (search) {
        const searchLower = search.toLowerCase();
        students = students.filter(s =>
          s.maHV?.toLowerCase().includes(searchLower) ||
          `${s.hoDem} ${s.ten}`.toLowerCase().includes(searchLower) ||
          s.email?.toLowerCase().includes(searchLower) ||
          s.dienThoai?.includes(search)
        );
      }

      // Filter by gender
      if (filters?.gioiTinh) {
        students = students.filter(s => s.gioiTinh === filters.gioiTinh);
      }

      // Filter by trình độ
      if (filters?.trinhDo) {
        students = students.filter(s =>
          s.maTrinhDoDaoTao === filters.trinhDo ||
          s.trinhDoDaoTao?.maTrinhDoDaoTao === filters.trinhDo
        );
      }

      // Pagination
      const total = students.length;
      const startIndex = (page - 1) * per_page;
      const endIndex = startIndex + per_page;
      const paginatedData = students.slice(startIndex, endIndex);

      // Return Laravel pagination format
      return {
        current_page: page,
        data: paginatedData,
        first_page_url: `?page=1`,
        from: startIndex + 1,
        last_page: Math.ceil(total / per_page),
        last_page_url: `?page=${Math.ceil(total / per_page)}`,
        next_page_url: page < Math.ceil(total / per_page) ? `?page=${page + 1}` : null,
        path: '/api/students',
        per_page,
        prev_page_url: page > 1 ? `?page=${page - 1}` : null,
        to: Math.min(endIndex, total),
        total,
      };
    } catch (error) {
      console.error('Error fetching students paginated:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách ngành học từ database
   */
  async getNganhHocList(): Promise<Array<{ maNganh: string; tenNganh: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/nganh-hoc`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch nganh hoc list');
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching nganh hoc:', error);
      return [];
    }
  },

  /**
   * Lấy danh sách trình độ đào tạo từ database
   */
  async getTrinhDoList(): Promise<Array<{ maTrinhDoDaoTao: string; tenTrinhDo: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/trinh-do-dao-tao`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch trinh do list');
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching trinh do:', error);
      return [];
    }
  },
};
