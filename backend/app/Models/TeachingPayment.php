<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TeachingPayment extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'teaching_payments';

    protected $fillable = [
        'teaching_schedule_id',
        'major_id',
        'khoa_hoc_id',
        'semester_code',
        'lecturer_id',

        // Thông tin giảng viên chi tiết
        'chuc_danh_giang_vien',
        'ho_ten_giang_vien',

        // Thông tin đơn vị và ngân hàng
        'don_vi',
        'ma_so_thue_tncn',
        'so_tai_khoan',
        'tai_ngan_hang',

        'stt',
        'ten_hoc_phan',
        'so_tin_chi',
        'can_bo_giang_day',

        // Thời gian giảng dạy
        'tu_ngay',
        'den_ngay',
        'ngay_thi',

        // Đơn giá/01 đết
        'don_gia_ly_thuyet',
        'don_gia_thuc_hanh',

        // Phân bổ số tiết/học phần
        'so_tiet_ly_thuyet',
        'so_tiet_thao_luan',
        'so_tiet_bai_tap_lon',

        // Số lượng
        'so_luong_bai_tap',
        'so_luong_bai_thi',

        'lop',
        'chuyen_nganh',
        'so_buoi',
        'hoc_phan',
        'si_so', // Sĩ số = số lượng học viên
        'don_gia_tin_chi',
        'so_tiet',
        'he_so',
        'he_so_ra_de_cham_thi',
        'thanh_tien_chua_thue',
        'thue_thu_nhap',
        'thuc_nhan',
        'tong_nhan',
        'ghi_chu',
        'phu_trach_lop',
        'trang_thai_thanh_toan',
        'ngay_thanh_toan',
        'nguoi_thanh_toan',
    ];

    protected $casts = [
        'teaching_schedule_id' => 'integer',
        'major_id' => 'integer',
        'khoa_hoc_id' => 'integer',
        'lecturer_id' => 'integer',
        'stt' => 'integer',
        'so_tin_chi' => 'integer',
        'so_buoi' => 'integer',
        'si_so' => 'integer',

        // Đơn giá/01 đết
        'don_gia_ly_thuyet' => 'decimal:2',
        'don_gia_thuc_hanh' => 'decimal:2',

        // Phân bổ số tiết/học phần
        'so_tiet_ly_thuyet' => 'decimal:2',
        'so_tiet_thao_luan' => 'decimal:2',
        'so_tiet_bai_tap_lon' => 'decimal:2',

        // Số lượng
        'so_luong_bai_tap' => 'integer',
        'so_luong_bai_thi' => 'integer',

        'don_gia_tin_chi' => 'decimal:2',
        'so_tiet' => 'decimal:2',
        'he_so' => 'decimal:2',
        'he_so_ra_de_cham_thi' => 'decimal:2',
        'thanh_tien_chua_thue' => 'decimal:2',
        'thue_thu_nhap' => 'decimal:2',
        'thuc_nhan' => 'decimal:2',
        'tong_nhan' => 'decimal:2',

        // Dates
        'tu_ngay' => 'date',
        'den_ngay' => 'date',
        'ngay_thi' => 'date',
        'ngay_thanh_toan' => 'datetime',
    ];

    /**
     * Relationship: Payment belongs to Teaching Schedule
     */
    public function teachingSchedule()
    {
        return $this->belongsTo(TeachingSchedule::class, 'teaching_schedule_id', 'id');
    }

    /**
     * Relationship: Payment belongs to Major
     */
    public function major()
    {
        return $this->belongsTo(Major::class, 'major_id', 'id');
    }

    /**
     * Relationship: Payment belongs to Course (KhoaHoc)
     */
    public function khoaHoc()
    {
        return $this->belongsTo(KhoaHoc::class, 'khoa_hoc_id', 'id');
    }

    /**
     * Relationship: Payment belongs to Lecturer
     */
    public function lecturer()
    {
        return $this->belongsTo(Lecturer::class, 'lecturer_id', 'id');
    }

    /**
     * Scope: Filter by semester code
     */
    public function scopeBySemesterCode($query, $semesterCode)
    {
        return $query->where('semester_code', $semesterCode);
    }

    /**
     * Scope: Filter by payment status
     */
    public function scopeByPaymentStatus($query, $status)
    {
        return $query->where('trang_thai_thanh_toan', $status);
    }

    /**
     * Scope: Filter unpaid
     */
    public function scopeUnpaid($query)
    {
        return $query->where('trang_thai_thanh_toan', 'chua_thanh_toan');
    }

    /**
     * Scope: Filter paid
     */
    public function scopePaid($query)
    {
        return $query->where('trang_thai_thanh_toan', 'da_thanh_toan');
    }

    /**
     * Calculate total amounts automatically
     */
    public function calculateAmounts()
    {
        // Thành tiền chưa thuế = Số tín chỉ × Đơn giá × Hệ số × Số tiết
        $this->thanh_tien_chua_thue = $this->so_tin_chi * $this->don_gia_tin_chi * $this->he_so * $this->so_tiet;

        // Thuế thu nhập (giả sử 10%)
        $this->thue_thu_nhap = $this->thanh_tien_chua_thue * 0.10;

        // Thực nhận = Thành tiền - Thuế
        $this->thuc_nhan = $this->thanh_tien_chua_thue - $this->thue_thu_nhap;

        // Tổng nhận
        $this->tong_nhan = $this->thuc_nhan;

        return $this;
    }

    /**
     * Mark as paid
     */
    public function markAsPaid($userName = null)
    {
        $this->trang_thai_thanh_toan = 'da_thanh_toan';
        $this->ngay_thanh_toan = now();
        $this->nguoi_thanh_toan = $userName;
        $this->save();

        return $this;
    }

    /**
     * Mark as unpaid
     */
    public function markAsUnpaid()
    {
        $this->trang_thai_thanh_toan = 'chua_thanh_toan';
        $this->ngay_thanh_toan = null;
        $this->nguoi_thanh_toan = null;
        $this->save();

        return $this;
    }
}

