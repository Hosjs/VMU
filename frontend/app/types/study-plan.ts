// frontend/src/types/training.ts
export interface TrainingPlanParams {
    education_type: 'thac-sy' | 'tien-sy';
    nam_vao: number;
    ma_nganh: string;
}

export interface TrainingPlanResponse {
    success: boolean;
    data: TrainingCourse[];
    meta: {
        education_type: string;
        nam_vao: number;
        ma_nganh: string;
    };
}

export interface TrainingCourse {
    MaMonHoc?: string;
    TenMonHoc?: string;
    SoTinChi?: number;
    HocKy?: number;
    NamHoc?: number;
    BatBuoc?: boolean;
    TuChon?: boolean;
    GhiChu?: string;
    [key: string]: any; // Allow for additional fields from API
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

export interface TrainingPlanFormData {
    education_type: 'thac-sy' | 'tien-sy';
    nam_vao: number;
    ma_nganh: string;
}
