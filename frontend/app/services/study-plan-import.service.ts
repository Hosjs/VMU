import { apiService } from './api.service';

export interface StudyPlanImportRequest {
  education_type: 'thac-sy' | 'tien-sy';
  target_nam_vao: number;
  ma_nganh: string;
  years_back?: number;
}

export interface StudyPlanImportResult {
  source_year: number;
  target_year: number;
  ma_nganh: string;
  items: any[];
  count: number;
}

class StudyPlanImportService {
  preview(payload: StudyPlanImportRequest): Promise<StudyPlanImportResult> {
    return apiService.post<StudyPlanImportResult>('/study-plans/import-from-previous', payload);
  }
}

export const studyPlanImportService = new StudyPlanImportService();
