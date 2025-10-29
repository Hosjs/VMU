// filepath: /Applications/XAMPP/xamppfiles/VMU/frontend/app/types/class-assignment.ts

export interface ClassAssignment {
  id: number;
  idLop: number;
  maHV: string;
  hoDem: string;
  ten: string;
  ngaySinh: string;
  gioiTinh: string;
  dienThoai?: string;
  email: string;
  nganhHoc?: string;
  trangThaiHoc?: string;
  namVaotruong?: number;
  maTrinhDoDaoTao?: string;
  maNganh?: string;

  // Computed fields
  hoTen?: string;
  stt?: number;
}

/**
 * Query params để lọc danh sách phân lớp
 */
export interface ClassAssignmentQueryParams {
  lopId?: number;
  search?: string;
  gioiTinh?: string;
  trangThaiHoc?: string;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

/**
 * Response từ API
 */
export interface ClassAssignmentListResponse {
  success: boolean;
  data: ClassAssignment[];
  message?: string;
}

