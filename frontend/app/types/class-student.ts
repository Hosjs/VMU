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
  diemX?: number;
  diemY?: number;
  tenLop?: string;
  trangThai?: string;
}

export interface ClassStudentsResponse {
  success: boolean;
  data: ClassStudent[];
  message?: string;
}
