/**
 * Interface for Weekly Schedule
 */
export interface WeeklySchedule {
  id: number;
  stt: number;
  week_number: string;
  khoa_hoc_id?: number | null;
  class_id: number;
  subject_id?: number | null;
  subject_name?: string | null;
  lecturer_id?: number | null;
  lecturer_name?: string | null;
  time_slot?: string | null;
  room?: string | null;
  ghi_chu?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  class?: {
    id: number;
    class_name: string;
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
  };
  khoaHoc?: {
    id: number;
    ma_khoa_hoc: string;
    nam_hoc: number;
    hoc_ky: number;
    dot: number;
    ngay_bat_dau?: string;
    ngay_ket_thuc?: string;
  };
  subject?: {
    id: number;
    tenMonHoc: string;
  };
  lecturer?: {
    id: number;
    hoTen: string;
    tenKhoa: string;
  };
}

/**
 * Interface for Week information
 */
export interface Week {
  week_number: number;
  week_label: string;
  start_date: string;
  end_date: string;
  display_label: string;
}

/**
 * Interface for Semester weeks response
 */
export interface SemesterWeeksResponse {
  khoa_hoc: {
    id: number;
    ma_khoa_hoc: string;
    ngay_bat_dau: string;
    ngay_ket_thuc: string;
  };
  total_weeks: number;
  weeks: Week[];
}

/**
 * Interface for creating/editing weekly schedule row
 */
export interface WeeklyScheduleRow {
  id: number | string;
  stt: number;
  class_name: string;
  subject_name: string;
  lecturer_name: string;
  time_slot: string;
  room: string;
  ghi_chu: string;
  isNew?: boolean; // Flag to indicate new row
}

/**
 * Interface for bulk save request
 */
export interface BulkSaveWeeklyScheduleRequest {
  week_number: string;
  khoa_hoc_id: number;
  class_ids: number[];
  schedules: {
    stt: number;
    subject_id?: number | null;
    subject_name?: string | null;
    lecturer_id?: number | null;
    lecturer_name?: string | null;
    time_slot?: string | null;
    room?: string | null;
    ghi_chu?: string | null;
  }[];
}

/**
 * Interface for filter params
 */
export interface WeeklyScheduleFilters {
  week_number?: string;
  khoa_hoc_id?: number;
  class_id?: number;
  class_ids?: string; // comma-separated
}
