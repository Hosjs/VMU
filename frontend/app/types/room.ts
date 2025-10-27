// filepath: /Applications/XAMPP/xamppfiles/VMU/frontend/app/types/room.ts

/**
 * Interface cho Lớp Học (Class/Room)
 */
export interface Room {
  id: number;
  tenLop: string;
  maTrinhDoDaoTao: string;
  maNganhHoc: string;
  khoaHoc: number;
  giaoVienChuNhiem?: string;
  maNganhHocNavigation?: any;
  maTrinhDoDaoTaoNavigation?: any;
  phanLops?: any[];
  soLuongHocVien?: number;
  trangThai?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Query params để lọc danh sách phòng học
 */
export interface RoomQueryParams {
  search?: string;
  maTrinhDoDaoTao?: string;
  maNganhHoc?: string;
  khoaHoc?: number;
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

