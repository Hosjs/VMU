/**
 * Interface for Teaching Payment
 */
export interface TeachingPayment {
  id: number;
  teaching_schedule_id: number;
  major_id: number;
  khoa_hoc_id: number;
  semester_code: string;
  lecturer_id?: number;

  // Thông tin giảng viên chi tiết
  chuc_danh_giang_vien?: string;
  ho_ten_giang_vien?: string;

  // Thông tin đơn vị và ngân hàng
  don_vi?: string;
  ma_so_thue_tncn?: string;
  so_tai_khoan?: string;
  tai_ngan_hang?: string;

  // Thông tin học phần
  stt: number;
  ten_hoc_phan: string;
  so_tin_chi: number;
  can_bo_giang_day: string | null;

  // Thời gian giảng dạy
  tu_ngay?: string;
  den_ngay?: string;
  ngay_thi?: string;

  // Đơn giá/01 đết
  don_gia_ly_thuyet?: number;
  don_gia_thuc_hanh?: number;

  // Phân bổ số tiết/học phần
  so_tiet_ly_thuyet?: number;
  so_tiet_thao_luan?: number;
  so_tiet_bai_tap_lon?: number;

  // Số lượng
  so_luong_bai_tap?: number;
  so_luong_bai_thi?: number;

  // Thông tin lớp
  lop?: string;
  chuyen_nganh?: string;

  // Thông tin học phần
  so_buoi: number;
  hoc_phan?: string;
  si_so: number; // Sĩ số = số lượng học viên

  // Đơn giá và tính toán
  don_gia_tin_chi: number;
  so_tiet: number;
  he_so: number;
  he_so_ra_de_cham_thi?: number;
  thanh_tien_chua_thue: number;
  thue_thu_nhap: number;
  thuc_nhan: number;
  tong_nhan: number;

  // Ghi chú
  ghi_chu?: string;
  phu_trach_lop?: string;

  // Trạng thái thanh toán
  trang_thai_thanh_toan: 'chua_thanh_toan' | 'da_thanh_toan';
  ngay_thanh_toan?: string;
  nguoi_thanh_toan?: string;

  created_at?: string;
  updated_at?: string;
  deleted_at?: string;

  // Relations
  major?: {
    id: number;
    tenNganh: string;
    maNganh: string;
  };
  khoaHoc?: {
    id: number;
    ma_khoa_hoc: string;
    nam_hoc: number;
    hoc_ky: number;
    dot: number;
  };
  lecturer?: {
    id: number;
    hoTen: string;
  };
}

/**
 * Interface for Teaching Payment Row (DataGrid)
 */
export interface TeachingPaymentRow {
  id: number | string;
  teaching_schedule_id: number;
  stt: number;
  ten_hoc_phan: string;
  so_tin_chi: number;
  can_bo_giang_day: string;

  // Thông tin giảng viên chi tiết
  chuc_danh_giang_vien?: string; // ThS, TS
  ho_ten_giang_vien?: string; // Họ và tên giảng viên

  // Thông tin đơn vị và ngân hàng
  don_vi?: string;
  ma_so_thue_tncn?: string;
  so_tai_khoan?: string;
  tai_ngan_hang?: string;

  // Thời gian giảng dạy
  tu_ngay?: string | '';
  den_ngay?: string | '';
  ngay_thi?: string | '';

  // Đơn giá/01 đết
  don_gia_ly_thuyet?: number | '';
  don_gia_thuc_hanh?: number | '';

  // Phân bổ số tiết/học phần
  so_tiet_ly_thuyet?: number | '';
  so_tiet_thao_luan?: number | '';
  so_tiet_bai_tap_lon?: number | '';

  // Số lượng
  so_luong_bai_tap?: number | '';
  so_luong_bai_thi?: number | '';

  lop: string;
  chuyen_nganh: string;
  so_buoi: number | '';
  hoc_phan: string;
  si_so: number | ''; // Sĩ số = số lượng học viên
  don_gia_tin_chi: number | '';
  so_tiet: number | '';
  he_so: number | '';
  he_so_ra_de_cham_thi?: number | '';

  thanh_tien_chua_thue: number;
  thue_thu_nhap: number;
  thuc_nhan: number;
  tong_nhan: number;
  ghi_chu: string;
  phu_trach_lop?: string;

  trang_thai_thanh_toan: 'chua_thanh_toan' | 'da_thanh_toan';
  ngay_thanh_toan?: string;
  isNew?: boolean;
}

/**
 * Request for generating payment records
 */
export interface GeneratePaymentRequest {
  major_id: number;
  khoa_hoc_id: number;
  semester_code: string;
}

/**
 * Request for bulk saving payment records
 */
export interface BulkSavePaymentRequest {
  major_id: number;
  khoa_hoc_id: number;
  semester_code: string;
  payments: Array<{
    id?: number;
    teaching_schedule_id: number;
    stt: number;
    ten_hoc_phan: string;
    so_tin_chi: number;
    can_bo_giang_day: string | null;

    // Thông tin giảng viên chi tiết
    chuc_danh_giang_vien?: string;
    ho_ten_giang_vien?: string;

    // Thông tin đơn vị và ngân hàng
    don_vi?: string;
    ma_so_thue_tncn?: string;
    so_tai_khoan?: string;
    tai_ngan_hang?: string;

    // Thời gian giảng dạy
    tu_ngay?: string;
    den_ngay?: string;
    ngay_thi?: string;

    // Đơn giá/01 đết
    don_gia_ly_thuyet?: number;
    don_gia_thuc_hanh?: number;

    // Phân bổ số tiết/học phần
    so_tiet_ly_thuyet?: number;
    so_tiet_thao_luan?: number;
    so_tiet_bai_tap_lon?: number;

    // Số lượng
    so_luong_bai_tap?: number;
    so_luong_bai_thi?: number;

    lop?: string;
    chuyen_nganh?: string;
    so_buoi?: number;
    hoc_phan?: string;
    si_so?: number; // Sĩ số = số lượng học viên
    don_gia_tin_chi?: number;
    so_tiet?: number;
    he_so?: number;
    he_so_ra_de_cham_thi?: number;
    ghi_chu?: string;
    phu_trach_lop?: string;
  }>;
}

/**
 * Request for updating payment status
 */
export interface UpdatePaymentStatusRequest {
  trang_thai_thanh_toan: 'chua_thanh_toan' | 'da_thanh_toan';
  nguoi_thanh_toan?: string;
}

/**
 * Request for bulk updating payment status
 */
export interface BulkUpdatePaymentStatusRequest {
  ids: number[];
  trang_thai_thanh_toan: 'chua_thanh_toan' | 'da_thanh_toan';
  nguoi_thanh_toan?: string;
}

/**
 * Payment summary statistics
 */
export interface PaymentSummary {
  total_payments: number;
  paid_payments: number;
  unpaid_payments: number;
  total_amount: number;
  paid_amount: number;
  unpaid_amount: number;
  total_thuc_nhan: number;
  paid_thuc_nhan: number;
  unpaid_thuc_nhan: number;
}

