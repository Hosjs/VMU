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
  // Fields từ API bên ngoài
  id?: number;
  khoaHoc?: number;
  maTrinhDoDaoTao?: string;
  maNganh?: string;
  hocPhanSo?: number;
  hocPhanChu?: string;
  tenMon?: string;
  soTinChi?: number;
  baiTapLon?: boolean;
  loaiHocPhan?: string;
  luaChon?: boolean;

  tenHocPhan?: string;
  tenMonHoc?: string;
  maHocPhan?: string;
  maMonHoc?: string;
  soTinChiLyThuyet?: number;
  soTinChiThucHanh?: number;
  hocKy?: number;
  namHoc?: number;
  khoaHoc2?: number;
  loai?: string;
  batBuoc?: boolean;
  tuChon?: boolean;
  ghiChu?: string;
  tinChi?: number;

  [key: string]: any;
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
