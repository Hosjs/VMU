import { apiService } from './api.service';
import type { ClassStudent, ClassStudentsResponse } from '~/types/class-student';

class ClassStudentService {
  async getStudentsByClassId(classId: number | string): Promise<ClassStudentsResponse> {
    try {
      // Call Laravel backend API which will proxy to external API
      const data = await apiService.get<ClassStudent[]>(
        `/class-students/${classId}`
      );

      return {
        success: true,
        data: data,
        message: data.length > 0 ? `Tìm thấy ${data.length} học viên` : 'Không có học viên nào'
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
