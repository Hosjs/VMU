import { apiService } from './api.service';

// Types for external grade API
export interface ExternalGradeData {
  hocPhanChu?: string;      // Mã học phần
  tenMon: string;           // Tên môn học
  soTinChi: number;         // Số tín chỉ
  soTinChiThucHoc?: number; // Số tín chỉ thực học
  diem: number | null;      // Điểm
  ghiChu?: string | null;   // Ghi chú

  // Legacy fields (for backward compatibility)
  maHV?: string;
  hoTen?: string;
  maMon?: string;
  x1?: number;
  x2?: number;
  x3?: number;
  x?: number;
  y?: number;
  z?: number;
  [key: string]: any;
}

export interface StudentSuggestion {
  maHV: string;
  hoTen: string;
  email: string;
  maNganh?: string;
  tenNganh?: string;
}

/**
 * Service for grade lookup functionality
 */
export const gradeService = {
  /**
   * Get grades from external API via backend proxy (bypasses CORS)
   */
  async getGradesByMaHV(maHV: string): Promise<ExternalGradeData[]> {
    try {
      // Use backend proxy API to avoid CORS issues
      const response = await apiService.get<ExternalGradeData[]>(
        '/grades/external',
        { MaHV: maHV }
      );

      return response;
    } catch (error: any) {
      console.error('Error fetching grades from proxy API:', error);
      if (error.response?.status === 504) {
        throw new Error('Kết nối API quá thời gian chờ');
      }
      throw new Error(error.response?.data?.message || 'Không thể lấy điểm từ hệ thống');
    }
  },

  /**
   * Search students for autocomplete suggestions
   * Search directly without pagination to get all matching results
   */
  async searchStudents(searchTerm: string, limit: number = 10): Promise<StudentSuggestion[]> {
    try {
      const response = await apiService.get<any>('/students', {
        search: searchTerm,
        per_page: limit,
      });

      // Handle both paginated response and direct array
      let students = [];
      if (response.data && Array.isArray(response.data)) {
        students = response.data;
      } else if (Array.isArray(response)) {
        students = response;
      } else {
        students = [];
      }

      return students.map((student: any) => ({
        maHV: student.maHV,
        hoTen: `${student.hoDem || ''} ${student.ten || ''}`.trim(),
        email: student.email,
        maNganh: student.maNganh,
        tenNganh: student.nganh?.tenNganhHoc || student.nganhHoc,
      }));
    } catch (error) {
      console.error('Error searching students:', error);
      return [];
    }
  },
};
