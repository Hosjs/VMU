/**
 * Interface for Teaching Schedule
 */
export interface TeachingSchedule {
  id: number;
  major_id: number;
  khoa_hoc_id: number;
  semester_code: string;
  stt: number;
  ten_hoc_phan: string;
  so_tin_chi: number;
  can_bo_giang_day: string;
  tuan?: string;
  ngay?: string;
  ghi_chu?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  major?: {
    id: number;
    tenNganh: string;
    maNganh: string;
  };
  khoaHoc?: {
    id: number;
    ma_khoa_hoc: string;
    nam_hoc: number;
    hoc_ky: number;
    dot: number;
  };
}

/**
 * Interface for creating/editing teaching schedule row
 */
export interface TeachingScheduleRow {
  id: number | string;
  stt: number;
  ten_hoc_phan: string;
  so_tin_chi: number | '';
  can_bo_giang_day: string;
  tuan?: string;
  ngay?: string;
  ghi_chu?: string;
  isNew?: boolean; // Flag to indicate new row
}

/**
 * Interface for bulk save request
 */
export interface BulkSaveTeachingScheduleRequest {
  major_id: number;
  khoa_hoc_id: number;
  semester_code: string;
  schedules: {
    stt: number;
    ten_hoc_phan: string;
    so_tin_chi: number;
    can_bo_giang_day: string;
    tuan?: string;
    ngay?: string;
    ghi_chu?: string;
  }[];
}

/**
 * Interface for filter params
 */
export interface TeachingScheduleFilters {
  semester_code?: string;
  major_id?: number;
  khoa_hoc_id?: number;
}
