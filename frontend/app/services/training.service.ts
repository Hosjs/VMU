import { apiService } from './api.service';

export interface TrainingPlanParams {
  education_type: 'thac-sy' | 'tien-sy';
  nam_vao: number;
  ma_nganh: string;
}

export interface TrainingPlanResponse {
  success: boolean;
  data: any[];
  meta: {
    education_type: string;
    nam_vao: number;
    ma_nganh: string;
  };
}

export interface EducationType {
  key: string;
  value: string;
  label: string;
}

export interface YearOption {
  value: number;
  label: string;
}

class TrainingService {
  /**
   * Lấy kế hoạch đào tạo (training plan - dùng cho course registrations)
   */
  async getTrainingPlan(params: TrainingPlanParams): Promise<TrainingPlanResponse> {
    const token = localStorage.getItem('auth_token');
    const queryString = new URLSearchParams({
      education_type: params.education_type,
      nam_vao: params.nam_vao.toString(),
      ma_nganh: params.ma_nganh
    }).toString();

    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/training/course-registrations?${queryString}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    return response.json();
  }

  /**
   * Lấy kế hoạch học tập (study plans - dùng cho study plans)
   */
  async getStudyPlans(params: TrainingPlanParams): Promise<TrainingPlanResponse> {
    const token = localStorage.getItem('auth_token');
    const queryString = new URLSearchParams({
      education_type: params.education_type,
      nam_vao: params.nam_vao.toString(),
      ma_nganh: params.ma_nganh
    }).toString();

    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/training/study-plans?${queryString}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    const jsonData = await response.json();
    return jsonData;
  }

  /**
   * Lấy danh sách loại hình đào tạo
   */
  async getEducationTypes(): Promise<EducationType[]> {
    return apiService.get<EducationType[]>('/training/education-types');
  }

  /**
   * Lấy danh sách các năm có sẵn
   */
  async getAvailableYears(): Promise<YearOption[]> {
    return apiService.get<YearOption[]>('/training/available-years');
  }
}

export const trainingService = new TrainingService();
