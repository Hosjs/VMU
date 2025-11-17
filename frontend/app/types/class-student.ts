export interface ClassStudent {
  mahv: string;
  hodem: string;
  ten: string;
  ngaysinh?: string;
  gioitinh?: string;
  dienthoai?: string;
  email?: string;
  noisinh?: string;
  socmnd?: string;
  trangthaihoc?: string;
  tenLop?: string;
  // Optional fields
  diemX?: number;
  diemY?: number;
  trangThai?: string;
}

export interface ClassStudentsResponse {
  success: boolean;
  data: ClassStudent[];
  lop?: {
    id: number;
    tenLop: string;
    khoaHoc: string;
    maNganhHoc: string;
  };
  message?: string;
}
