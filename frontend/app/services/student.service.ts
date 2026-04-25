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

      if (filters?.search && filters.search.trim() !== '') {
        params.search = filters.search.trim();
      }

      if (filters?.namVao && filters.namVao > 0) {
        params.namVao = filters.namVao;
      }

      if (filters?.maNganh && filters.maNganh.trim() !== '') {
        params.maNganh = filters.maNganh.trim();
      }

      if (filters?.maTrinhDoDaoTao && filters.maTrinhDoDaoTao.trim() !== '') {
        params.maTrinhDoDaoTao = filters.maTrinhDoDaoTao.trim();
      }

      if (filters?.trangThai && filters.trangThai.trim() !== '') {
        params.trangThai = filters.trangThai.trim();
      }

      if (filters?.gioiTinh && filters.gioiTinh.trim() !== '') {
        params.gioiTinh = filters.gioiTinh.trim();
      }

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
   * D4 — Đồng bộ học viên từ API ngoài (yêu cầu permission students.create).
   */
  async syncExternal(params?: { major?: string; year?: number }): Promise<{
    ok: boolean;
    message?: string;
    source?: string;
    count?: number;
    stats?: { created: number; updated: number; skipped: number; failed: number };
    errors?: Array<{ index: number; message: string }>;
  }> {
    return apiService.post('/students/sync-external', params ?? {});
  },

  /**
   * ✅ NEW: Lấy danh sách học viên với pagination (tương thích useTable hook)
   * Hàm này gọi API internal Laravel với authentication
   */
  async getStudentsPaginated(params: TableQueryParams): Promise<PaginatedResponse<Student>> {
    try {
      const { page = 1, per_page = 20, search, filters } = params;

      const token = localStorage.getItem('auth_token');

      const queryParams: Record<string, any> = {
        page,
        per_page,
      };

      if (search && search.trim()) queryParams.search = search;
      if (filters?.namVao) queryParams.namVao = filters.namVao;
      if (filters?.maNganh && filters.maNganh.trim()) queryParams.maNganh = filters.maNganh;
      if (filters?.gioiTinh && filters.gioiTinh.trim()) queryParams.gioiTinh = filters.gioiTinh;
      if (filters?.trinhDo && filters.trinhDo.trim()) queryParams.maTrinhDoDaoTao = filters.trinhDo;

      const queryString = new URLSearchParams(
        Object.entries(queryParams).map(([key, value]) => [key, String(value)])
      ).toString();

      const apiUrl = `${API_BASE_URL}/students?${queryString}`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch student list');
      }

      const result = await response.json();

      if (result.success && result.data) {
        return {
          current_page: result.meta.current_page,
          data: result.data,
          first_page_url: `?page=1`,
          from: result.meta.from,
          last_page: result.meta.last_page,
          last_page_url: `?page=${result.meta.last_page}`,
          next_page_url: result.meta.current_page < result.meta.last_page ? `?page=${result.meta.current_page + 1}` : null,
          path: '/api/students',
          per_page: result.meta.per_page,
          prev_page_url: result.meta.current_page > 1 ? `?page=${result.meta.current_page - 1}` : null,
          to: result.meta.to,
          total: result.meta.total,
        };
      }

      return {
        current_page: 1,
        data: [],
        first_page_url: `?page=1`,
        from: 0,
        last_page: 1,
        last_page_url: `?page=1`,
        next_page_url: null,
        path: '/api/students',
        per_page,
        prev_page_url: null,
        to: 0,
        total: 0,
      };
    } catch (error) {
      console.error('Error fetching students paginated:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách ngành học từ API majors
   */
  async getMajorsList(): Promise<Array<{ value: string; label: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/majors?per_page=1000`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch majors list');
      }

      const result = await response.json();

      let majors = [];
      if (result.data && Array.isArray(result.data)) {
        majors = result.data;
      }

      const options = majors.map((major: any) => {
        const tenNganh = major.tenNganh || major.ten_nganh || '';
        const maNganh = major.maNganh || major.ma_nganh || '';

        return {
          value: maNganh,
          label: `${tenNganh}`
        };
      }).filter((opt: { value: string; label: string }) => opt.value && opt.value.trim() !== '');

      return options;
    } catch (error) {
      console.error('Error fetching majors:', error);
      return [];
    }
  },

  /**
   * Lấy danh sách ngành học với ID (dùng cho API cần major_id)
   * Trả về { value: id, label: "maNganh - tenNganh" }
   */
  async getMajorsListWithId(): Promise<Array<{ value: string; label: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/majors?per_page=1000`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch majors list');
      }

      const result = await response.json();

      let majors = [];
      if (result.data && Array.isArray(result.data)) {
        majors = result.data;
      }

      const options = majors.map((major: any) => {
        const id = major.id;
        const tenNganh = major.tenNganh || major.ten_nganh || '';
        const maNganh = major.maNganh || major.ma_nganh || '';

        return {
          value: id?.toString() || '',
          label: `${maNganh} - ${tenNganh}`
        };
      }).filter((opt: { value: string; label: string }) => opt.value && opt.value.trim() !== '');

      return options;
    } catch (error) {
      console.error('Error fetching majors:', error);
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
      return [];
    }
  },
};
