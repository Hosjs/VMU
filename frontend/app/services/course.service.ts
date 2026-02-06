import { apiService } from './api.service';
import type { Course, CourseFormData, CreateClassRequest } from '~/types/course';
import type { PaginatedResponse, TableQueryParams } from '~/types/common';

/**
 * Service để quản lý kỳ học (khoa_hoc)
 */
export const courseService = {
  /**
   * Lấy danh sách kỳ học với phân trang
   */
  async getCourses(params?: TableQueryParams): Promise<PaginatedResponse<Course>> {
    // Sử dụng getPaginated để lấy full response bao gồm cả meta
    return await apiService.getPaginated<Course>('/courses', params || {
      page: 1,
      per_page: 10,
    });
  },

  /**
   * Lấy danh sách kỳ học đơn giản (cho dropdown)
   */
  async getSimpleCourses(): Promise<Course[]> {
    // apiService.get already extracts data from { success: true, data: [...] }
    return await apiService.get<Course[]>('/courses/simple');
  },

  /**
   * Lấy chi tiết một kỳ học
   */
  async getCourse(id: number): Promise<Course> {
    const response = await apiService.get<{ data: Course }>(`/courses/${id}`);
    return response.data;
  },

  /**
   * Tạo kỳ học mới
   */
  async createCourse(data: CourseFormData): Promise<Course> {
    const response = await apiService.post<{ data: Course }>('/courses', data);
    return response.data;
  },

  /**
   * Cập nhật kỳ học
   */
  async updateCourse(id: number, data: Partial<CourseFormData>): Promise<Course> {
    const response = await apiService.put<{ data: Course }>(`/courses/${id}`, data);
    return response.data;
  },

  /**
   * Xóa kỳ học
   */
  async deleteCourse(id: number): Promise<void> {
    await apiService.delete(`/courses/${id}`);
  },

  /**
   * Tạo lớp học từ kỳ học và ngành
   */
  async createClass(data: CreateClassRequest): Promise<any> {
    const response = await apiService.post<{ data: any }>('/courses/create-classes', data);
    return response.data;
  },
};
