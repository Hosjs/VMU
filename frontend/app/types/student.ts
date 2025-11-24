// Student related types based on DBML schema

export enum TrangThaiHocVien {
  DangHoc = 'DangHoc',
  BaoLuu = 'BaoLuu',
  DaTotNghiep = 'DaTotNghiep',
  ThoiHoc = 'ThoiHoc',
}

export interface Student {
  maHV: string;
  hoDem: string;
  ten: string;
  ngaySinh: string;
  gioiTinh: string;
  soGiayToTuyThan: string;
  dienThoai: string;
  email: string;
  quocTich: string;
  danToc: string;
  tonGiao: string;
  maTrinhDoDaoTao: string;
  maNganh: string;
  trangThai: TrangThaiHocVien;
  ngayNhapHoc: string;
  namVaoTruong: number;
  idLop: number | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  createdBy?: number;

  // Relations (optional - từ API có thể join)
  trinhDoDaoTao?: {
    maTrinhDoDaoTao: string;
    tenTrinhDo: string;
  };
  nganh?: {
    maNganh: string;
    tenNganh: string;
  };
  lop?: {
    id: number;
    tenLop: string;
  };

  // External API fields (có tên khác)
  nganhHoc?: string;           // Tên ngành từ API external
  trangThaiHoc?: string;        // Trạng thái từ API external
  namVaotruong?: number;        // Năm vào từ API external (lưu ý: chữ 't' thường)
}

// Đổi tên thành StudentMajor để tránh xung đột với Major từ major.ts
export interface StudentMajor {
  tenNganh: string;
  moTa: string;
  trangThai: boolean;
}

export interface TrainingLevel {
  maTrinhDoDaoTao: string;
  tenTrinhDo: string;
  moTa: string;
  trangThai: boolean;
}

export interface StudentFilters {
  search?: string;
  namVao?: number;
  maNganh?: string;
  maTrinhDoDaoTao?: string;
  trangThai?: TrangThaiHocVien;
  gioiTinh?: string;
  page?: number;
  per_page?: number;
}

export interface StudentListResponse {
  success: boolean;
  data: Student[];
  meta?: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}
