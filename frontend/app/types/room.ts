/**
 * Interface cho Lớp Học (Class/Room)
 * Hỗ trợ cả cột cũ và mới từ bảng classes
 */
export interface Room {
  id: number;

  // Cột mới từ bảng classes
  class_name?: string;
  major_id?: string;
  khoaHoc_id?: number;
  lecurer_id?: number;

  // Cột cũ (alias/backward compatibility)
  tenLop?: string;
  maNganhHoc?: string;
  khoaHoc?: number;
  idGiaoVienChuNhiem?: number;

  // Thông tin từ bảng liên kết
  nam_hoc?: number; // Year from khoa_hoc table
  ma_khoa_hoc?: string; // Course code from khoa_hoc table
  major_code?: string; // Major code from majors table
  major_name?: string; // Major name from majors table
  lecturer_name?: string; // Lecturer name from lecturers table
  phu_trach_lop?: string; // Alias for lecturer_name

  // Các cột chung
  maTrinhDoDaoTao?: string;
  giaoVienChuNhiem?: string;
  trangThai?: string;
  maNganhHocNavigation?: any;
  maTrinhDoDaoTaoNavigation?: any;
  phanLops?: any[];
  soLuongHocVien?: number;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  deletedAt?: string;
  deleted_at?: string;
  createdBy?: number;
}

/**
 * Query params để lọc danh sách phòng học
 */
export interface RoomQueryParams {
  search?: string;
  maTrinhDoDaoTao?: string;
  maNganhHoc?: string;
  major_id?: string;
  khoaHoc?: number;
  khoaHoc_id?: number;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

/**
 * Response từ API
 */
export interface RoomListResponse {
  success: boolean;
  data: Room[];
  message?: string;
}
