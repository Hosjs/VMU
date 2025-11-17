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
      const response = await apiService.get<any>(`/classes/${classId}/students`);

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
          lop: response.lop,
          message: response.data.length > 0
            ? `Tìm thấy ${response.data.length} học viên`
            : 'Không có học viên nào'
        };
      }

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
