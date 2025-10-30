// filepath: /Applications/XAMPP/xamppfiles/VMU/frontend/app/types/class-assignment.ts

export interface ClassAssignment {
  id: number;
  idLop: number;
  mahv: string;
  hodem: string;
  ten: string;
  ngaysinh: string;
  gioitinh: string;
  dienthoai?: string;
  email: string;
  trangthaihoc?: string;
  namvaotruong?: number;
  matrinhdodaotao?: string;
  manganh?: string;

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
