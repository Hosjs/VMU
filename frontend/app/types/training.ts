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
    nam_vao: string;
    ma_nganh: string;
    total: number;
  };
}

export interface TrainingCourse {
  id?: number;
  khoaHoc?: number;
  maTrinhDoDaoTao?: string;
  maNganh?: string;
  hocPhanSo?: number;
  hocPhanChu?: string;
  tenHocPhan?: string;
  tenMon?: string; // Alternative field name
  soTinChi?: number;
  soTinChiLyThuyet?: number;
  soTinChiThucHanh?: number;
  hocKy?: number;
  namHoc?: number;
  khoaHoc2?: number;
  loai?: string;
  batBuoc?: boolean;
  tuChon?: boolean;
  ghiChu?: string;
  // API có thể trả về các tên trường khác nhau
  maHocPhan?: string;
  maMonHoc?: string;
  tenMonHoc?: string;
  tinChi?: number;
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
