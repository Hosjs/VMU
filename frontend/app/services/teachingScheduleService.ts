import { apiService } from './api.service';
import type { TeachingSchedule, BulkSaveTeachingScheduleRequest, TeachingScheduleFilters } from '~/types/teaching-schedule';

/**
 * Get all teaching schedules with filters
 */
export const getTeachingSchedules = async (filters?: TeachingScheduleFilters): Promise<TeachingSchedule[]> => {
  return await apiService.get<TeachingSchedule[]>('/teaching-schedules', filters);
};

/**
 * Get a single teaching schedule by ID
 */
export const getTeachingSchedule = async (id: number): Promise<TeachingSchedule> => {
  return await apiService.get<TeachingSchedule>(`/teaching-schedules/${id}`);
};

/**
 * Get unique semester codes
 */
export const getSemesterCodes = async (): Promise<string[]> => {
  return await apiService.get<string[]>('/teaching-schedules/semester-codes');
};

/**
 * Bulk save teaching schedules (requires authentication)
 */
export const bulkSaveTeachingSchedules = async (data: BulkSaveTeachingScheduleRequest): Promise<TeachingSchedule[]> => {
  return await apiService.post<TeachingSchedule[]>('/teaching-schedules/bulk-save', data);
};

/**
 * Update a single teaching schedule (requires authentication)
 */
export const updateTeachingSchedule = async (id: number, data: Partial<TeachingSchedule>): Promise<TeachingSchedule> => {
  return await apiService.put<TeachingSchedule>(`/teaching-schedules/${id}`, data);
};

/**
 * Delete a teaching schedule (requires authentication)
 */
export const deleteTeachingSchedule = async (id: number): Promise<void> => {
  await apiService.delete(`/teaching-schedules/${id}`);
};
