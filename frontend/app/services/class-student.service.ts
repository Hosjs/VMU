import { apiService } from './api.service';
import type { ClassStudent, ClassStudentsResponse } from '~/types/class-student';

class ClassStudentService {
  /**
   * Lấy danh sách học viên trong lớp từ database
   * GET /api/classes/{id}/students
   */
  async getStudentsByClassId(classId: number | string): Promise<ClassStudentsResponse> {
    try {
      // Call Laravel backend API to get students from database
      // Use apiService.http.get to get the full response instead of just data
      const response = await apiService.http.get<{
        success: boolean;
        data: ClassStudent[];
        lop?: any;
        message?: string;
      }>(`/classes/${classId}/students`);


      if (response && response.success && Array.isArray(response.data)) {
        return {
          success: true,
          data: response.data,
          lop: response.lop,
          message: response.message || `Tìm thấy ${response.data.length} học viên`
        };
      }

      // Nếu response không đúng format
      console.warn('Invalid response format:', response);
      return {
        success: false,
        data: [],
        message: 'Không thể tải danh sách học viên'
      };
    } catch (error) {
      console.error('Error fetching class students:', error);
      return {
        success: false,
        data: [],
        message: 'Không thể tải danh sách học viên'
      };
    }
  }
}

export const classStudentService = new ClassStudentService();
