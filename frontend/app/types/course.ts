/**
 * Interface cho Kỳ học (KhoaHoc)
 */
export interface Course {
  id: number;
  ma_khoa_hoc: string; // Format: "2025.1.1" (năm.học_kỳ.đợt)
  nam_hoc: number; // Năm học (VD: 2025)
  hoc_ky: number; // Học kỳ (1-3)
  dot: number; // Đợt (1-5)
  ngay_bat_dau?: string;
  ngay_ket_thuc?: string;
  ghi_chu?: string;
}

export interface CourseFormData {
  nam_hoc: number;
  hoc_ky: number;
  dot: number;
  ngay_bat_dau?: string;
  ngay_ket_thuc?: string;
  ghi_chu?: string;
}

export interface CreateClassRequest {
  khoa_hoc_id: number;
  major_id: number;
  trinh_do: string;
  phu_trach_lop: string;
}
