<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lecturer;
use App\Models\TeachingPayment;
use App\Models\TeachingSchedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class TeachingPaymentController extends Controller
{
    /**
     * Build lecturer title from hocHam + trinhDoChuyenMon.
     */
    private function buildLecturerTitle(Lecturer $lecturer): string
    {
        $parts = [];
        if (!empty($lecturer->hocHam)) {
            $parts[] = trim($lecturer->hocHam);
        }
        if (!empty($lecturer->trinhDoChuyenMon)) {
            $parts[] = trim($lecturer->trinhDoChuyenMon);
        }

        return implode('.', $parts);
    }

    /**
     * Resolve lecturer by id first, then by name fallback.
     */
    private function resolveLecturer(?int $lecturerId, ?string $name): ?Lecturer
    {
        if (!empty($lecturerId)) {
            $lecturer = Lecturer::with('major')->find($lecturerId);
            if ($lecturer) {
                return $lecturer;
            }
        }

        if (!empty($name)) {
            return Lecturer::with('major')
                ->where('hoTen', 'LIKE', '%' . trim($name) . '%')
                ->first();
        }

        return null;
    }

    /**
     * Fill missing payment fields using saved lecturer profile.
     */
    private function applyLecturerProfile($payment, ?Lecturer $lecturer): void
    {
        if (!$lecturer) {
            return;
        }

        if (empty($payment->lecturer_id)) {
            $payment->lecturer_id = $lecturer->id;
        }

        if (empty($payment->chuc_danh_giang_vien)) {
            $payment->chuc_danh_giang_vien = $this->buildLecturerTitle($lecturer);
        }

        if (empty($payment->ho_ten_giang_vien)) {
            $payment->ho_ten_giang_vien = $lecturer->hoTen;
        }

        if (empty($payment->don_vi)) {
            $payment->don_vi = $lecturer->don_vi ?: ($lecturer->major->tenNganh ?? '');
        }

        if (empty($payment->ma_so_thue_tncn)) {
            $payment->ma_so_thue_tncn = $lecturer->ma_so_thue_tncn;
        }
        if (empty($payment->so_tai_khoan)) {
            $payment->so_tai_khoan = $lecturer->so_tai_khoan;
        }
        if (empty($payment->tai_ngan_hang)) {
            $payment->tai_ngan_hang = $lecturer->tai_ngan_hang;
        }
    }

    /**
     * Remember lecturer payment profile when user has entered new values.
     */
    private function syncLecturerProfileFromPaymentData(?Lecturer $lecturer, array $paymentData): void
    {
        if (!$lecturer) {
            return;
        }

        $profileUpdates = [];
        foreach (['don_vi', 'ma_so_thue_tncn', 'so_tai_khoan', 'tai_ngan_hang'] as $field) {
            $value = isset($paymentData[$field]) ? trim((string) $paymentData[$field]) : '';
            if ($value !== '' && $lecturer->{$field} !== $value) {
                $profileUpdates[$field] = $value;
            }
        }

        if (!empty($profileUpdates)) {
            $lecturer->update($profileUpdates);
        }
    }

    /**
     * Get teaching payments by filters
     *
     * GET /api/teaching-payments
     * Query params: major_id, khoa_hoc_id, semester_code, page, per_page
     */
    public function index(Request $request)
    {
        try {
            $query = TeachingPayment::with(['major', 'khoaHoc', 'lecturer']);

            if ($request->has('major_id')) {
                $query->where('major_id', $request->major_id);
            }

            if ($request->has('khoa_hoc_id')) {
                $query->where('khoa_hoc_id', $request->khoa_hoc_id);
            }

            if ($request->has('semester_code')) {
                $query->where('semester_code', $request->semester_code);
            }

            if ($request->has('trang_thai_thanh_toan')) {
                $query->where('trang_thai_thanh_toan', $request->trang_thai_thanh_toan);
            }

            $query->orderBy('stt');

            // Check if pagination is requested
            if ($request->has('page') || $request->has('per_page')) {
                $perPage = $request->get('per_page', 15);
                $payments = $query->paginate($perPage);

                // Process each payment item
                foreach ($payments->items() as $payment) {
                    $this->processPaymentItem($payment);
                }

                return response()->json([
                    'success' => true,
                    'data' => $payments->items(),
                    'meta' => [
                        'current_page' => $payments->currentPage(),
                        'last_page' => $payments->lastPage(),
                        'per_page' => $payments->perPage(),
                        'total' => $payments->total(),
                    ],
                ]);
            } else {
                // Return all results without pagination
                $payments = $query->get();

                foreach ($payments as $payment) {
                    $this->processPaymentItem($payment);
                }

                return response()->json([
                    'success' => true,
                    'data' => $payments,
                ]);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy danh sách thanh toán',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Process payment item to fill missing data
     */
    private function processPaymentItem($payment)
    {
        // ✅ FIX: Only load classes that have this specific subject in weekly_schedules
        // Điều này đảm bảo "Phương pháp nghiên cứu khoa học" chỉ hiển thị lớp QLVT 2025.2.2, không phải tất cả các lớp
        if (!empty($payment->ten_hoc_phan)) {
            // Tìm weekly_schedules theo khoa_hoc_id + ten_hoc_phan
            $weeklySchedules = \App\Models\WeeklySchedule::with(['class', 'class.major'])
                ->where('khoa_hoc_id', $payment->khoa_hoc_id)
                ->where('subject_name', $payment->ten_hoc_phan)
                ->get();

            // Lấy class names - CHỈ những lớp có học phần này
            $classNames = [];
            $chuyenNganh = '';
            foreach ($weeklySchedules as $ws) {
                if ($ws->class) {
                    $classNames[] = $ws->class->class_name;
                    if (!$chuyenNganh && $ws->class->major) {
                        $chuyenNganh = $ws->class->major->tenNganh ?? '';
                    }
                }
            }

            // ✅ Chỉ cập nhật nếu tìm thấy classes
            if (!empty($classNames)) {
                $payment->lop = implode('<br>', array_unique($classNames));
                if (!empty($chuyenNganh)) {
                    $payment->chuyen_nganh = $chuyenNganh;
                }
            } else {
                // ✅ Nếu không có lớp nào học môn này, để trống
                $payment->lop = '';
            }
        }

        $lecturer = $this->resolveLecturer(
            $payment->lecturer_id,
            $payment->can_bo_giang_day ?: $payment->ho_ten_giang_vien
        );
        $this->applyLecturerProfile($payment, $lecturer);
    }

    /**
     * Generate payment records from teaching schedules
     *
     * POST /api/teaching-payments/generate
     * Body: { major_id, khoa_hoc_id, semester_code }
     */
    public function generate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'major_id' => 'required|integer|exists:majors,id',
            'khoa_hoc_id' => 'required|integer',
            'semester_code' => 'required|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Get teaching schedules for this semester
            $schedules = TeachingSchedule::where('major_id', $request->major_id)
                ->where('khoa_hoc_id', $request->khoa_hoc_id)
                ->where('semester_code', $request->semester_code)
                ->orderBy('stt')
                ->get();

            if ($schedules->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy lịch giảng dạy cho kỳ học này',
                ], 404);
            }

            // Delete existing payment records for this semester
            TeachingPayment::where('major_id', $request->major_id)
                ->where('khoa_hoc_id', $request->khoa_hoc_id)
                ->where('semester_code', $request->semester_code)
                ->delete();

            // Create payment records from schedules
            $payments = [];
            foreach ($schedules as $schedule) {
                // Skip break/holiday rows (so_tin_chi = 0)
                if ($schedule->so_tin_chi == 0) {
                    continue;
                }

                // ✅ Lấy thông tin lớp học từ weekly_schedules
                $classNames = [];
                $chuyenNganh = '';

                // Tìm theo khoa_hoc_id và subject_name (không cần khớp lecturer_name vì có thể khác nhau)
                if (!empty($schedule->ten_hoc_phan)) {
                    $weeklySchedules = \App\Models\WeeklySchedule::with(['class', 'class.major'])
                        ->where('khoa_hoc_id', $schedule->khoa_hoc_id)
                        ->where('subject_name', $schedule->ten_hoc_phan)
                        ->get();

                    // Lấy class names từ weekly_schedules
                    foreach ($weeklySchedules as $ws) {
                        if ($ws->class) {
                            $classNames[] = $ws->class->class_name;
                            // Lấy chuyên ngành từ major
                            if (!$chuyenNganh && $ws->class->major) {
                                $chuyenNganh = $ws->class->major->tenNganh ?? '';
                            }
                        }
                    }
                }

                // Join class names với <br> để xuống dòng trong HTML table
                $lop = !empty($classNames) ? implode('<br>', array_unique($classNames)) : '';

                // ✅ Lấy thông tin giảng viên từ bảng lecturers
                $hoTenGiangVien = $schedule->can_bo_giang_day; // Họ tên = Cán bộ giảng dạy
                $lecturer = $this->resolveLecturer(null, $hoTenGiangVien);
                $lecturerId = $lecturer?->id;
                $chucDanhGiangVien = $lecturer ? $this->buildLecturerTitle($lecturer) : '';
                $donVi = $lecturer ? ($lecturer->don_vi ?: ($lecturer->major->tenNganh ?? '')) : '';
                $maSoThueTncn = $lecturer?->ma_so_thue_tncn;
                $soTaiKhoan = $lecturer?->so_tai_khoan;
                $taiNganHang = $lecturer?->tai_ngan_hang;

                $payment = TeachingPayment::create([
                    'teaching_schedule_id' => $schedule->id,
                    'major_id' => $schedule->major_id,
                    'khoa_hoc_id' => $schedule->khoa_hoc_id,
                    'semester_code' => $schedule->semester_code,
                    'lecturer_id' => $lecturerId, // ✅ Lưu lecturer_id nếu tìm thấy
                    'stt' => $schedule->stt,
                    'ten_hoc_phan' => $schedule->ten_hoc_phan,
                    'so_tin_chi' => $schedule->so_tin_chi,
                    'can_bo_giang_day' => $schedule->can_bo_giang_day,

                    // ✅ Thông tin giảng viên tự động
                    'ho_ten_giang_vien' => $hoTenGiangVien, // = Cán bộ giảng dạy
                    'chuc_danh_giang_vien' => $chucDanhGiangVien, // Từ lecturers
                    'don_vi' => $donVi, // Từ lecturers → major
                    'ma_so_thue_tncn' => $maSoThueTncn,
                    'so_tai_khoan' => $soTaiKhoan,
                    'tai_ngan_hang' => $taiNganHang,

                    'lop' => $lop ?: '', // ✅ Lấy từ weekly_schedules
                    'chuyen_nganh' => $chuyenNganh ?: '', // ✅ Lấy từ major của class
                    'so_buoi' => 0,
                    'hoc_phan' => $schedule->ten_hoc_phan, // ✅ Copy từ ten_hoc_phan
                    'si_so' => 0,
                    'don_gia_tin_chi' => 0,
                    'so_tiet' => 0,
                    'he_so' => 1.0,
                    'thanh_tien_chua_thue' => 0,
                    'thue_thu_nhap' => 0,
                    'thuc_nhan' => 0,
                    'tong_nhan' => 0,
                    'ghi_chu' => $schedule->ghi_chu,
                    'trang_thai_thanh_toan' => 'chua_thanh_toan',
                ]);

                $payments[] = $payment;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Đã tạo " . count($payments) . " bản ghi thanh toán từ lịch giảng dạy",
                'data' => $payments,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tạo bản ghi thanh toán',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Bulk save/update payment records
     *
     * POST /api/teaching-payments/bulk-save
     * Body: { major_id, khoa_hoc_id, semester_code, payments: [] }
     */
    public function bulkSave(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'major_id' => 'required|integer|exists:majors,id',
            'khoa_hoc_id' => 'required|integer',
            'semester_code' => 'required|string|max:50',
            'payments' => 'required|array|min:1',
            'payments.*.id' => 'sometimes|integer',
            'payments.*.lecturer_id' => 'nullable|integer|exists:lecturers,id',
            'payments.*.teaching_schedule_id' => 'required|integer',
            'payments.*.stt' => 'required|integer',
            'payments.*.ten_hoc_phan' => 'required|string',
            'payments.*.so_tin_chi' => 'required|integer',
            'payments.*.can_bo_giang_day' => 'nullable|string',

            // Thông tin giảng viên chi tiết
            'payments.*.chuc_danh_giang_vien' => 'nullable|string',
            'payments.*.ho_ten_giang_vien' => 'nullable|string',

            // Thông tin đơn vị và ngân hàng
            'payments.*.don_vi' => 'nullable|string',
            'payments.*.ma_so_thue_tncn' => 'nullable|string',
            'payments.*.so_tai_khoan' => 'nullable|string',
            'payments.*.tai_ngan_hang' => 'nullable|string',

            // Thời gian giảng dạy
            'payments.*.tu_ngay' => 'nullable|date',
            'payments.*.den_ngay' => 'nullable|date',
            'payments.*.ngay_thi' => 'nullable|date',

            // Đơn giá/01 đết
            'payments.*.don_gia_ly_thuyet' => 'nullable|numeric',
            'payments.*.don_gia_thuc_hanh' => 'nullable|numeric',

            // Phân bổ số tiết/học phần
            'payments.*.so_tiet_ly_thuyet' => 'nullable|numeric',
            'payments.*.so_tiet_thao_luan' => 'nullable|numeric',
            'payments.*.so_tiet_bai_tap_lon' => 'nullable|numeric',

            // Số lượng
            'payments.*.so_luong_bai_tap' => 'nullable|integer',
            'payments.*.so_luong_bai_thi' => 'nullable|integer',

            'payments.*.lop' => 'nullable|string',
            'payments.*.chuyen_nganh' => 'nullable|string',
            'payments.*.so_buoi' => 'nullable|integer',
            'payments.*.hoc_phan' => 'nullable|string',
            'payments.*.si_so' => 'nullable|integer',
            'payments.*.don_gia_tin_chi' => 'nullable|numeric',
            'payments.*.so_tiet' => 'nullable|numeric',
            'payments.*.he_so' => 'nullable|numeric',
            'payments.*.he_so_ra_de_cham_thi' => 'nullable|numeric',
            'payments.*.ghi_chu' => 'nullable|string',
            'payments.*.phu_trach_lop' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            DB::beginTransaction();

            $savedPayments = [];

            foreach ($request->payments as $paymentData) {
                $lecturer = $this->resolveLecturer(
                    isset($paymentData['lecturer_id']) ? (int) $paymentData['lecturer_id'] : null,
                    $paymentData['can_bo_giang_day'] ?? ($paymentData['ho_ten_giang_vien'] ?? null)
                );

                if ($lecturer) {
                    if (empty($paymentData['ho_ten_giang_vien'])) {
                        $paymentData['ho_ten_giang_vien'] = $lecturer->hoTen;
                    }
                    if (empty($paymentData['don_vi'])) {
                        $paymentData['don_vi'] = $lecturer->don_vi ?: ($lecturer->major->tenNganh ?? '');
                    }
                    if (empty($paymentData['ma_so_thue_tncn'])) {
                        $paymentData['ma_so_thue_tncn'] = $lecturer->ma_so_thue_tncn;
                    }
                    if (empty($paymentData['so_tai_khoan'])) {
                        $paymentData['so_tai_khoan'] = $lecturer->so_tai_khoan;
                    }
                    if (empty($paymentData['tai_ngan_hang'])) {
                        $paymentData['tai_ngan_hang'] = $lecturer->tai_ngan_hang;
                    }
                }

                // Calculate amounts
                $soTinChi = $paymentData['so_tin_chi'] ?? 0;
                $donGiaTinChi = $paymentData['don_gia_tin_chi'] ?? 0;
                $heSo = $paymentData['he_so'] ?? 1.0;
                $soTiet = $paymentData['so_tiet'] ?? 0;

                $thanhTienChuaThue = $soTinChi * $donGiaTinChi * $heSo * $soTiet;
                $thueThuNhap = $thanhTienChuaThue * 0.10; // 10% tax
                $thucNhan = $thanhTienChuaThue - $thueThuNhap;

                $data = [
                    'teaching_schedule_id' => $paymentData['teaching_schedule_id'],
                    'major_id' => $request->major_id,
                    'khoa_hoc_id' => $request->khoa_hoc_id,
                    'semester_code' => $request->semester_code,
                    'lecturer_id' => $lecturer?->id,
                    'stt' => $paymentData['stt'],
                    'ten_hoc_phan' => $paymentData['ten_hoc_phan'],
                    'so_tin_chi' => $soTinChi,
                    'can_bo_giang_day' => $paymentData['can_bo_giang_day'] ?? null,

                    // Thông tin giảng viên chi tiết
                    'chuc_danh_giang_vien' => $paymentData['chuc_danh_giang_vien'] ?? null,
                    'ho_ten_giang_vien' => $paymentData['ho_ten_giang_vien'] ?? null,

                    // Thông tin đơn vị và ngân hàng
                    'don_vi' => $paymentData['don_vi'] ?? null,
                    'ma_so_thue_tncn' => $paymentData['ma_so_thue_tncn'] ?? null,
                    'so_tai_khoan' => $paymentData['so_tai_khoan'] ?? null,
                    'tai_ngan_hang' => $paymentData['tai_ngan_hang'] ?? null,

                    // Thời gian giảng dạy
                    'tu_ngay' => $paymentData['tu_ngay'] ?? null,
                    'den_ngay' => $paymentData['den_ngay'] ?? null,
                    'ngay_thi' => $paymentData['ngay_thi'] ?? null,

                    // Đơn giá/01 đết
                    'don_gia_ly_thuyet' => $paymentData['don_gia_ly_thuyet'] ?? null,
                    'don_gia_thuc_hanh' => $paymentData['don_gia_thuc_hanh'] ?? null,

                    // Phân bổ số tiết/học phần
                    'so_tiet_ly_thuyet' => $paymentData['so_tiet_ly_thuyet'] ?? null,
                    'so_tiet_thao_luan' => $paymentData['so_tiet_thao_luan'] ?? null,
                    'so_tiet_bai_tap_lon' => $paymentData['so_tiet_bai_tap_lon'] ?? null,

                    // Số lượng
                    'so_luong_bai_tap' => $paymentData['so_luong_bai_tap'] ?? null,
                    'so_luong_bai_thi' => $paymentData['so_luong_bai_thi'] ?? null,

                    'lop' => $paymentData['lop'] ?? '',
                    'chuyen_nganh' => $paymentData['chuyen_nganh'] ?? '',
                    'so_buoi' => $paymentData['so_buoi'] ?? 0,
                    'hoc_phan' => $paymentData['hoc_phan'] ?? '',
                    'si_so' => $paymentData['si_so'] ?? 0, // Sĩ số = số lượng học viên
                    'don_gia_tin_chi' => $donGiaTinChi,
                    'so_tiet' => $soTiet,
                    'he_so' => $heSo,
                    'he_so_ra_de_cham_thi' => $paymentData['he_so_ra_de_cham_thi'] ?? null,
                    'thanh_tien_chua_thue' => $thanhTienChuaThue,
                    'thue_thu_nhap' => $thueThuNhap,
                    'thuc_nhan' => $thucNhan,
                    'tong_nhan' => $thucNhan,
                    'ghi_chu' => $paymentData['ghi_chu'] ?? null,
                    'phu_trach_lop' => $paymentData['phu_trach_lop'] ?? null,
                ];

                if (isset($paymentData['id'])) {
                    // Update existing
                    $payment = TeachingPayment::find($paymentData['id']);
                    if ($payment) {
                        // Only update if not paid
                        if ($payment->trang_thai_thanh_toan !== 'da_thanh_toan') {
                            $payment->update($data);
                        }
                        $savedPayments[] = $payment;
                    }
                } else {
                    // Create new
                    $payment = TeachingPayment::create($data);
                    $savedPayments[] = $payment;
                }

                $this->syncLecturerProfileFromPaymentData($lecturer, $paymentData);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Lưu thông tin thanh toán thành công',
                'data' => $savedPayments,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lưu thông tin thanh toán',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update payment status
     *
     * PUT /api/teaching-payments/{id}/status
     * Body: { trang_thai_thanh_toan: 'da_thanh_toan' | 'chua_thanh_toan', nguoi_thanh_toan }
     */
    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'trang_thai_thanh_toan' => 'required|in:chua_thanh_toan,da_thanh_toan',
            'nguoi_thanh_toan' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $payment = TeachingPayment::find($id);

            if (!$payment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy bản ghi thanh toán',
                ], 404);
            }

            if ($request->trang_thai_thanh_toan === 'da_thanh_toan') {
                $payment->markAsPaid($request->nguoi_thanh_toan);
            } else {
                $payment->markAsUnpaid();
            }

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật trạng thái thanh toán thành công',
                'data' => $payment,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi cập nhật trạng thái thanh toán',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Bulk update payment status
     *
     * POST /api/teaching-payments/bulk-update-status
     * Body: { ids: [], trang_thai_thanh_toan, nguoi_thanh_toan }
     */
    public function bulkUpdateStatus(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:teaching_payments,id',
            'trang_thai_thanh_toan' => 'required|in:chua_thanh_toan,da_thanh_toan',
            'nguoi_thanh_toan' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            DB::beginTransaction();

            $payments = TeachingPayment::whereIn('id', $request->ids)->get();

            foreach ($payments as $payment) {
                if ($request->trang_thai_thanh_toan === 'da_thanh_toan') {
                    $payment->markAsPaid($request->nguoi_thanh_toan);
                } else {
                    $payment->markAsUnpaid();
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Đã cập nhật " . $payments->count() . " bản ghi thanh toán",
                'data' => $payments,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi cập nhật trạng thái thanh toán',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a payment record
     *
     * DELETE /api/teaching-payments/{id}
     */
    public function destroy($id)
    {
        try {
            $payment = TeachingPayment::find($id);

            if (!$payment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy bản ghi thanh toán',
                ], 404);
            }

            $payment->delete();

            return response()->json([
                'success' => true,
                'message' => 'Xóa bản ghi thanh toán thành công',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi xóa bản ghi thanh toán',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get payment summary/statistics
     *
     * GET /api/teaching-payments/summary
     * Query params: major_id, khoa_hoc_id, semester_code
     */
    public function summary(Request $request)
    {
        try {
            $query = TeachingPayment::query();

            if ($request->has('major_id')) {
                $query->where('major_id', $request->major_id);
            }

            if ($request->has('khoa_hoc_id')) {
                $query->where('khoa_hoc_id', $request->khoa_hoc_id);
            }

            if ($request->has('semester_code')) {
                $query->where('semester_code', $request->semester_code);
            }

            $totalPayments = (clone $query)->count();
            $paidPayments = (clone $query)->where('trang_thai_thanh_toan', 'da_thanh_toan')->count();
            $unpaidPayments = (clone $query)->where('trang_thai_thanh_toan', 'chua_thanh_toan')->count();

            $totalAmount = (clone $query)->sum('thanh_tien_chua_thue');
            $paidAmount = (clone $query)->where('trang_thai_thanh_toan', 'da_thanh_toan')->sum('thanh_tien_chua_thue');
            $unpaidAmount = (clone $query)->where('trang_thai_thanh_toan', 'chua_thanh_toan')->sum('thanh_tien_chua_thue');

            $totalThucNhan = (clone $query)->sum('thuc_nhan');
            $paidThucNhan = (clone $query)->where('trang_thai_thanh_toan', 'da_thanh_toan')->sum('thuc_nhan');
            $unpaidThucNhan = (clone $query)->where('trang_thai_thanh_toan', 'chua_thanh_toan')->sum('thuc_nhan');

            return response()->json([
                'success' => true,
                'data' => [
                    'total_payments' => $totalPayments,
                    'paid_payments' => $paidPayments,
                    'unpaid_payments' => $unpaidPayments,
                    'total_amount' => $totalAmount,
                    'paid_amount' => $paidAmount,
                    'unpaid_amount' => $unpaidAmount,
                    'total_thuc_nhan' => $totalThucNhan,
                    'paid_thuc_nhan' => $paidThucNhan,
                    'unpaid_thuc_nhan' => $unpaidThucNhan,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy thống kê thanh toán',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get dashboard statistics
     *
     * GET /api/teaching-payments/statistics
     */
    public function statistics(Request $request)
    {
        try {
            // Get total lecturers count
            $totalLecturers = DB::table('lecturers')
                ->whereNull('deleted_at')
                ->count();

            // Get total teaching assignments (schedules)
            $totalTeachingAssignments = DB::table('teaching_schedules')
                ->whereNull('deleted_at')
                ->count();

            // Get current semester (most recent khoa_hoc)
            $currentSemester = DB::table('khoa_hoc')
                ->select('ma_khoa_hoc')
                ->orderBy('ngay_bat_dau', 'desc')
                ->first();

            // Payment statistics
            $totalPayments = TeachingPayment::count();
            $pendingPayments = TeachingPayment::where('trang_thai_thanh_toan', 'chua_thanh_toan')->count();
            $approvedPayments = TeachingPayment::where('trang_thai_thanh_toan', 'da_duyet')->count();
            $paidPayments = TeachingPayment::where('trang_thai_thanh_toan', 'da_thanh_toan')->count();

            // Amount statistics
            $totalAmount = TeachingPayment::sum('thanh_tien_chua_thue') ?? 0;
            $pendingAmount = TeachingPayment::where('trang_thai_thanh_toan', 'chua_thanh_toan')->sum('thanh_tien_chua_thue') ?? 0;
            $paidAmount = TeachingPayment::where('trang_thai_thanh_toan', 'da_thanh_toan')->sum('thuc_nhan') ?? 0;

            return response()->json([
                'success' => true,
                'data' => [
                    'total_lecturers' => $totalLecturers,
                    'total_teaching_assignments' => $totalTeachingAssignments,
                    'total_payments' => $totalPayments,
                    'pending_payments' => $pendingPayments,
                    'approved_payments' => $approvedPayments,
                    'paid_payments' => $paidPayments,
                    'total_amount' => $totalAmount,
                    'pending_amount' => $pendingAmount,
                    'paid_amount' => $paidAmount,
                    'current_semester' => $currentSemester ? $currentSemester->ma_khoa_hoc : null,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy thống kê dashboard',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

