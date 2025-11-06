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
    async getTrainingPlan(params: TrainingPlanParams): Promise<TrainingPlanResponse> {
        return apiService.get<TrainingPlanResponse>('/training/course-registrations', params);
    }

    async getEducationTypes(): Promise<EducationType[]> {
        return apiService.get<EducationType[]>('/training/education-types');
    }

    async getAvailableYears(): Promise<YearOption[]> {
        return apiService.get<YearOption[]>('/training/available-years');
    }
}

export const trainingService = new TrainingService();
