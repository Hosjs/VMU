import { apiService } from './api.service';
import type { PaginatedResponse, TableQueryParams } from '~/types/common';

export type AbsenceReason = 'sick' | 'personal' | 'official' | 'other';

export interface LecturerAbsence {
  id: number;
  lecturer_id: number;
  absence_date: string;
  reason: AbsenceReason;
  note: string | null;
  weekly_schedule_id: number | null;
  recorded_by: number | null;
  lecturer?: { id: number; hoTen: string } | null;
  recorder?: { id: number; name: string } | null;
  created_at?: string;
  updated_at?: string;
}

export interface LecturerAbsenceFormData {
  lecturer_id: number;
  absence_date: string;
  reason: AbsenceReason;
  note?: string | null;
  weekly_schedule_id?: number | null;
}

export interface LecturerAbsenceFilters extends Partial<TableQueryParams> {
  lecturer_id?: number;
  from?: string;
  to?: string;
}

class LecturerAbsenceService {
  list(filters: LecturerAbsenceFilters = {}): Promise<PaginatedResponse<LecturerAbsence>> {
    return apiService.getPaginated<LecturerAbsence>('/lecturer-absences', {
      page: filters.page ?? 1,
      per_page: filters.per_page ?? 50,
      ...(filters.lecturer_id ? { lecturer_id: filters.lecturer_id } : {}),
      ...(filters.from ? { from: filters.from } : {}),
      ...(filters.to ? { to: filters.to } : {}),
    });
  }

  create(payload: LecturerAbsenceFormData): Promise<LecturerAbsence> {
    return apiService.post<LecturerAbsence>('/lecturer-absences', payload);
  }

  update(id: number, payload: Partial<LecturerAbsenceFormData>): Promise<LecturerAbsence> {
    return apiService.put<LecturerAbsence>(`/lecturer-absences/${id}`, payload);
  }

  remove(id: number): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>(`/lecturer-absences/${id}`);
  }
}

export const lecturerAbsenceService = new LecturerAbsenceService();

export const ABSENCE_REASON_LABELS: Record<AbsenceReason, string> = {
  sick: 'Ốm',
  personal: 'Việc cá nhân',
  official: 'Công tác',
  other: 'Khác',
};
