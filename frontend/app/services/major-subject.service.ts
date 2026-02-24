import { apiService } from './api.service';
import type { MajorSubject, MajorSubjectQueryParams, MajorSubjectFormData, BulkAssignFormData } from '~/types/major-subject';
import type { Subject } from '~/types/subject';
import type { PaginatedResponse } from '~/types/common';

/**
 * Service để quản lý quan hệ ngành-môn học (major-subjects)
 */
class MajorSubjectService {
  /**
   * Lấy danh sách major-subjects với pagination và filters
   */
  async getMajorSubjects(params: MajorSubjectQueryParams): Promise<PaginatedResponse<MajorSubject>> {
    const response = await apiService.get<any>('/major-subjects', { params });

    // API trả về: { success: true, data: [...], pagination: {...} }
    if (response.success && response.data) {
      return {
        data: response.data,
        current_page: response.pagination.current_page,
        per_page: response.pagination.per_page,
        total: response.pagination.total,
        last_page: response.pagination.last_page,
        from: response.pagination.from,
        to: response.pagination.to,
        first_page_url: '',
        last_page_url: '',
        next_page_url: null,
        prev_page_url: null,
        path: '',
      };
    }

    throw new Error('Invalid response format');
  }

  /**
   * Lấy chi tiết một major-subject theo ID
   */
  async getMajorSubject(id: number): Promise<MajorSubject> {
    const response = await apiService.get<any>(`/major-subjects/${id}`);
    return response.success ? response.data : response;
  }

  /**
   * Tạo quan hệ ngành-môn học mới
   */
  async createMajorSubject(data: MajorSubjectFormData): Promise<MajorSubject> {
    const response = await apiService.post<any>('/major-subjects', data);
    return response.success ? response.data : response;
  }

  /**
   * Xóa quan hệ ngành-môn học
   */
  async deleteMajorSubject(id: number): Promise<void> {
    await apiService.delete(`/major-subjects/${id}`);
  }

  /**
   * Bulk assign nhiều môn học vào một ngành
   */
  async bulkAssignSubjects(data: BulkAssignFormData): Promise<{ added: number; skipped: number }> {
    const response = await apiService.post<any>('/major-subjects/bulk-assign', data);
    return response.success ? response.data : response;
  }

  /**
   * Lấy danh sách môn học có thể thêm vào ngành (chưa được gán)
   */
  async getAvailableSubjects(majorId: number): Promise<Subject[]> {
    const response = await apiService.get<any>(`/major-subjects/available-subjects/${majorId}`);
    return response.success ? response.data : response;
  }

  /**
   * Lấy danh sách môn học theo ngành (cho autocomplete)
   * ✅ FIXED: Accept both number (majors.id) and string (maNganh)
   * ✅ FIXED: apiService.get already extracts .data, so response is the array directly
   */
  async getSubjectsByMajor(majorId: number | string): Promise<Array<{ id: number; maMon: string; tenMon: string; soTinChi: number }>> {
    // ✅ Handle null, undefined, 0, empty string
    if (!majorId || majorId === 0 || majorId === '' || majorId === '0') {
      return [];
    }

    try {
      // apiService.get already extracts response.data
      // So response is directly the subjects array
      const subjects = await apiService.get<Array<{ id: number; maMon: string; tenMon: string; soTinChi: number }>>('/major-subjects/by-major', { major_id: majorId });

      return Array.isArray(subjects) ? subjects : [];
    } catch (error) {
      console.error('❌ Error in getSubjectsByMajor:', error);
      return [];
    }
  }
}

export const majorSubjectService = new MajorSubjectService();

