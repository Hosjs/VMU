
export interface Lecturer {
  id: number;
  hoTen: string;
  ho_ten?: string;
  trinhDoChuyenMon?: string;
  trinh_do_chuyen_mon?: string;
  hocHam?: string;
  hoc_ham?: string;
  maNganh?: number | null;
  ma_nganh?: number | null;
  ghiChu?: string;
  ghi_chu?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  major?: {
    id: number;
    maNganh: string;
    tenNganh: string;
  };
}

export interface LecturerFormData {
  ho_ten: string;
  trinh_do_chuyen_mon?: string;
  hoc_ham?: string;
  ma_nganh?: number | null;
  ghi_chu?: string;
}

export interface LecturerFilters {
  search?: string;
  maNganh?: number;
  hocHam?: string;
  trinhDoChuyenMon?: string;
  page?: number;
  per_page?: number;
}

export interface LecturerListResponse {
  success: boolean;
  data: Lecturer[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}
