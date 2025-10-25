import { apiService } from './api.service';
import type { Student, StudentFilters, StudentListResponse } from '~/types/student';

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
};
