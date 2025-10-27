// filepath: /Applications/XAMPP/xamppfiles/VMU/frontend/app/types/education-level.ts

/**
 * Interface cho Trình Độ Đào Tạo (Education Level)
 */
export interface EducationLevel {
  maTrinhDoDaoTao: string;
  tenTrinhDo: string;
  moTa?: string;
  trangThai: boolean;
  createdBy?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

/**
 * Query params để lọc danh sách
 */
export interface EducationLevelQueryParams {
  search?: string;
  trangThai?: boolean;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

