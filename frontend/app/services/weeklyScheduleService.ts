import { apiService } from './api.service';
import type {
  WeeklySchedule,
  BulkSaveWeeklyScheduleRequest,
  WeeklyScheduleFilters,
  SemesterWeeksResponse,
} from '~/types/weekly-schedule';

class WeeklyScheduleService {
  private baseUrl = '/weekly-schedules';

  /**
   * Get all weekly schedules with filters
   */
  async getAll(filters?: WeeklyScheduleFilters): Promise<WeeklySchedule[]> {
    const params: Record<string, any> = {};

    if (filters?.khoa_hoc_id) {
      params.khoa_hoc_id = filters.khoa_hoc_id;
    }
    if (filters?.week_number) {
      params.week_number = filters.week_number;
    }
    if (filters?.class_id) {
      params.class_id = filters.class_id;
    }
    if (filters?.class_ids) {
      params.class_ids = filters.class_ids;
    }

    const response = await apiService.get<WeeklySchedule[]>(this.baseUrl, params);
    return response;
  }

  /**
   * Get a single weekly schedule by ID
   */
  async getById(id: number): Promise<WeeklySchedule> {
    const response = await apiService.get<WeeklySchedule>(`${this.baseUrl}/${id}`);
    return response;
  }

  /**
   * Bulk save weekly schedules
   */
  async bulkSave(
    request: BulkSaveWeeklyScheduleRequest
  ): Promise<WeeklySchedule[]> {
    const response = await apiService.post<WeeklySchedule[]>(
      `${this.baseUrl}/bulk-save`,
      request
    );
    return response;
  }

  /**
   * Update a weekly schedule
   */
  async update(
    id: number,
    data: Partial<WeeklySchedule>
  ): Promise<WeeklySchedule> {
    const response = await apiService.put<WeeklySchedule>(
      `${this.baseUrl}/${id}`,
      data
    );
    return response;
  }

  /**
   * Delete a weekly schedule
   */
  async delete(id: number): Promise<void> {
    await apiService.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Get available week numbers
   */
  async getWeekNumbers(): Promise<string[]> {
    const response = await apiService.get<string[]>(
      `${this.baseUrl}/week-numbers`
    );
    return response;
  }

  /**
   * Get week list for a specific semester (khoa_hoc)
   */
  async getWeeksBySemester(khoaHocId: number): Promise<SemesterWeeksResponse> {
    const response = await apiService.get<SemesterWeeksResponse>(
      `${this.baseUrl}/weeks-by-semester`,
      { khoa_hoc_id: khoaHocId }
    );
    return response;
  }
}

export default new WeeklyScheduleService();
