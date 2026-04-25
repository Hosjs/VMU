import { apiService } from './api.service';
import type { PaginatedResponse, TableQueryParams } from '~/types/common';

export type ExamType = 'regular' | 'retake' | 'makeup';

export interface ExamSchedule {
  id: number;
  khoa_hoc_id: number;
  subject_id: number | null;
  subject_name: string;
  class_id: number | null;
  class_name: string | null;
  exam_start: string;
  exam_end: string;
  room_id: number | null;
  room: string | null;
  supervisor_1_id: number | null;
  supervisor_2_id: number | null;
  exam_type: ExamType;
  note: string | null;
  supervisor1?: { id: number; hoTen: string } | null;
  supervisor2?: { id: number; hoTen: string } | null;
  created_at?: string;
  updated_at?: string;
}

export interface ExamScheduleFormData {
  khoa_hoc_id: number;
  subject_id?: number | null;
  subject_name: string;
  class_id?: number | null;
  class_name?: string | null;
  exam_start: string;
  exam_end: string;
  room_id?: number | null;
  room?: string | null;
  supervisor_1_id?: number | null;
  supervisor_2_id?: number | null;
  exam_type: ExamType;
  note?: string | null;
}

export interface ExamScheduleFilters extends Partial<TableQueryParams> {
  khoa_hoc_id?: number;
  class_id?: number;
  from?: string;
  to?: string;
}

class ExamScheduleService {
  list(filters: ExamScheduleFilters = {}): Promise<PaginatedResponse<ExamSchedule>> {
    return apiService.getPaginated<ExamSchedule>('/exam-schedules', {
      page: filters.page ?? 1,
      per_page: filters.per_page ?? 50,
      ...(filters.khoa_hoc_id ? { khoa_hoc_id: filters.khoa_hoc_id } : {}),
      ...(filters.class_id ? { class_id: filters.class_id } : {}),
      ...(filters.from ? { from: filters.from } : {}),
      ...(filters.to ? { to: filters.to } : {}),
    });
  }

  get(id: number): Promise<ExamSchedule> {
    return apiService.get<ExamSchedule>(`/exam-schedules/${id}`);
  }

  create(payload: ExamScheduleFormData): Promise<ExamSchedule> {
    return apiService.post<ExamSchedule>('/exam-schedules', payload);
  }

  update(id: number, payload: Partial<ExamScheduleFormData>): Promise<ExamSchedule> {
    return apiService.put<ExamSchedule>(`/exam-schedules/${id}`, payload);
  }

  remove(id: number): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>(`/exam-schedules/${id}`);
  }
}

export const examScheduleService = new ExamScheduleService();
