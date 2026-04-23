import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import type {
  GridColDef,
  GridRowsProp,
  GridRowModel,
} from '@mui/x-data-grid';
import {
  Box,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField as MuiTextField,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  getTeachingPayments,
  generatePaymentRecords,
  bulkSavePayments,
  bulkUpdatePaymentStatus,
  getPaymentSummary,
} from '~/services/teachingPaymentService';
import { courseService } from '~/services/course.service';
import { majorService } from '~/services/major.service';
import { Autocomplete } from '~/components/ui/Autocomplete';
import type { AutocompleteOption } from '~/components/ui/Autocomplete';
import type {
  TeachingPaymentRow,
  BulkSavePaymentRequest,
  PaymentSummary,
} from '~/types/teaching-payment';
import type { Course } from '~/types/course';
import type { Major } from '~/types/major';
import { exportTeachingPaymentToExcel } from '~/utils/teachingPaymentExcelExporter';
import { formatters } from '~/utils/formatters';

/**
 * Format currency to VND
 */
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
};

export default function TeachingPaymentPage() {
  const [rows, setRows] = useState<GridRowsProp<TeachingPaymentRow>>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [majorOptions, setMajorOptions] = useState<AutocompleteOption[]>([]);
  const [courseOptions, setCourseOptions] = useState<AutocompleteOption[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | ''>('');
  const [selectedMajor, setSelectedMajor] = useState<number | ''>('');
  const [semesterCode, setSemesterCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [selectedRows, setSelectedRows] = useState<(string | number)[]>([]);
  const [selectionModel, setSelectionModel] = useState<any>(null); // Store raw selection model
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: 'paid' | 'unpaid' | null;
  }>({ open: false, action: null });
  const [nguoiThanhToan, setNguoiThanhToan] = useState<string>('');

  // 🔍 Search and Filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all'); // 'all' | 'paid' | 'unpaid'
  const [lecturerFilter, setLecturerFilter] = useState<string>('');
  const [classFilter, setClassFilter] = useState<string>('');
  const [filteredRows, setFilteredRows] = useState<GridRowsProp<TeachingPaymentRow>>([]);

  // Helper to get selected row count
  const getSelectedCount = () => {
    if (!selectionModel) return 0;

    // Handle MUI DataGrid v7+ selection model
    if (typeof selectionModel === 'object' && 'type' in selectionModel) {
      if (selectionModel.type === 'exclude') {
        // "Select all except..." - total rows minus excluded
        const excludedCount = selectionModel.ids?.size || 0;
        return rows.length - excludedCount;
      } else if (selectionModel.type === 'include') {
        // "Select only these" - count of included
        return selectionModel.ids?.size || 0;
      }
    }

    // Fallback to array length
    return selectedRows.length;
  };

  // 🔍 Helper: Clear all filters
  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setLecturerFilter('');
    setClassFilter('');
  };

  // 🔍 Helper: Get unique lecturers for filter
  const getUniqueLecturers = (): string[] => {
    const lecturers = new Set<string>();
    rows.forEach(row => {
      if (row.ho_ten_giang_vien) lecturers.add(row.ho_ten_giang_vien);
      else if (row.can_bo_giang_day) lecturers.add(row.can_bo_giang_day);
    });
    return Array.from(lecturers).sort();
  };

  // 🔍 Helper: Check if any filter is active
  const hasActiveFilters = (): boolean => {
    return (
      searchQuery.trim() !== '' ||
      statusFilter !== 'all' ||
      lecturerFilter.trim() !== '' ||
      classFilter.trim() !== ''
    );
  };

  // Load courses and majors on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load existing payments when course and major are selected
  useEffect(() => {
    if (selectedCourse && selectedMajor && semesterCode) {
      loadExistingPayments();
      loadSummary();
    }
  }, [selectedCourse, selectedMajor, semesterCode]);

  // 🔍 Filter rows based on search query and filters
  useEffect(() => {
    let filtered = [...rows];

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(row => {
        return (
          row.ten_hoc_phan?.toLowerCase().includes(query) ||
          row.ho_ten_giang_vien?.toLowerCase().includes(query) ||
          row.can_bo_giang_day?.toLowerCase().includes(query) ||
          row.lop?.toLowerCase().includes(query) ||
          row.chuyen_nganh?.toLowerCase().includes(query) ||
          row.don_vi?.toLowerCase().includes(query) ||
          row.chuc_danh_giang_vien?.toLowerCase().includes(query) ||
          String(row.stt).includes(query)
        );
      });
    }

    // Apply status filter
    if (statusFilter === 'paid') {
      filtered = filtered.filter(row => row.trang_thai_thanh_toan === 'da_thanh_toan');
    } else if (statusFilter === 'unpaid') {
      filtered = filtered.filter(row => row.trang_thai_thanh_toan === 'chua_thanh_toan');
    }

    // Apply lecturer filter
    if (lecturerFilter.trim()) {
      const lecturerQuery = lecturerFilter.toLowerCase();
      filtered = filtered.filter(row =>
        row.ho_ten_giang_vien?.toLowerCase().includes(lecturerQuery) ||
        row.can_bo_giang_day?.toLowerCase().includes(lecturerQuery)
      );
    }

    // Apply class filter
    if (classFilter.trim()) {
      const classQuery = classFilter.toLowerCase();
      filtered = filtered.filter(row =>
        row.lop?.toLowerCase().includes(classQuery)
      );
    }

    setFilteredRows(filtered);
  }, [rows, searchQuery, statusFilter, lecturerFilter, classFilter]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [coursesData, majorsResponse] = await Promise.all([
        courseService.getSimpleCourses(),
        majorService.getMajors({ page: 1, per_page: 100 }),
      ]);

      setCourses(coursesData || []);
      setMajors(majorsResponse.data || []);

      // Create autocomplete options for majors
      const majorOpts: AutocompleteOption[] = (majorsResponse.data || []).map(major => ({
        value: major.id,
        label: `${major.tenNganh}`,
        subtitle: `Mã ngành: ${major.maNganh}`,
        searchText: `${major.maNganh} ${major.tenNganh}`,
      }));
      setMajorOptions(majorOpts);

      // Create autocomplete options for courses
      const courseOpts: AutocompleteOption[] = (coursesData || []).map(course => ({
        value: course.id,
        label: formatters.courseCode(course),
        subtitle: formatters.courseCodeDetail(course),
        searchText: `${formatters.courseCode(course)} ${course.nam_hoc} ${course.dot} ${formatters.courseCodeDetail(course)}`,
      }));

      setCourseOptions(courseOpts);
    } catch (err) {
      setError('Lỗi khi tải dữ liệu');
      console.error('❌ Error loading initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadExistingPayments = async () => {
    try {
      setLoading(true);

      const payments = await getTeachingPayments({
        khoa_hoc_id: Number(selectedCourse),
        major_id: Number(selectedMajor),
        semester_code: semesterCode,
      });

      if (payments && Array.isArray(payments) && payments.length > 0) {
        const mappedRows = payments.map((payment): TeachingPaymentRow => {
          return {
            id: payment.id,
            teaching_schedule_id: payment.teaching_schedule_id,
            stt: payment.stt,
            ten_hoc_phan: payment.ten_hoc_phan,
            so_tin_chi: payment.so_tin_chi,
            can_bo_giang_day: payment.can_bo_giang_day ?? '',

            // Thông tin giảng viên chi tiết
            chuc_danh_giang_vien: payment.chuc_danh_giang_vien ?? '',
            ho_ten_giang_vien: payment.ho_ten_giang_vien ?? payment.can_bo_giang_day ?? '', // ✅ Fallback to can_bo_giang_day

            // Thông tin đơn vị và ngân hàng
            don_vi: payment.don_vi ?? '',
            ma_so_thue_tncn: payment.ma_so_thue_tncn ?? '',
            so_tai_khoan: payment.so_tai_khoan ?? '',
            tai_ngan_hang: payment.tai_ngan_hang ?? '',

            // Thời gian giảng dạy
            tu_ngay: payment.tu_ngay ?? '',
            den_ngay: payment.den_ngay ?? '',
            ngay_thi: payment.ngay_thi ?? '',

            // Đơn giá/01 đết
            don_gia_ly_thuyet: payment.don_gia_ly_thuyet || '',
            don_gia_thuc_hanh: payment.don_gia_thuc_hanh || '',

            // Phân bổ số tiết/học phần
            so_tiet_ly_thuyet: payment.so_tiet_ly_thuyet || '',
            so_tiet_thao_luan: payment.so_tiet_thao_luan || '',
            so_tiet_bai_tap_lon: payment.so_tiet_bai_tap_lon || '',

            // Số lượng
            so_luong_bai_tap: payment.so_luong_bai_tap || '',
            so_luong_bai_thi: payment.so_luong_bai_thi || '',

            lop: payment.lop ?? '',
            chuyen_nganh: payment.chuyen_nganh ?? '',
            so_buoi: payment.so_buoi || '',
            hoc_phan: payment.hoc_phan ?? '',
            si_so: payment.si_so || '',
            don_gia_tin_chi: payment.don_gia_tin_chi || '',
            so_tiet: payment.so_tiet || '',
            he_so: payment.he_so || 1.0,
            he_so_ra_de_cham_thi: payment.he_so_ra_de_cham_thi || '',
            thanh_tien_chua_thue: payment.thanh_tien_chua_thue,
            thue_thu_nhap: payment.thue_thu_nhap,
            thuc_nhan: payment.thuc_nhan,
            tong_nhan: payment.tong_nhan,
            ghi_chu: payment.ghi_chu ?? '',
            phu_trach_lop: payment.phu_trach_lop ?? '',
            trang_thai_thanh_toan: payment.trang_thai_thanh_toan,
            ngay_thanh_toan: payment.ngay_thanh_toan,
            isNew: false,
          };
        });
        setRows(mappedRows);
      } else {
        setRows([]);
      }
    } catch (err) {
      console.error('❌ Error loading payments:', err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const summaryData = await getPaymentSummary({
        khoa_hoc_id: Number(selectedCourse),
        major_id: Number(selectedMajor),
        semester_code: semesterCode,
      });
      setSummary(summaryData);
    } catch (err) {
      console.error('❌ Error loading summary:', err);
    }
  };

  const handleCourseChange = (value: string | number) => {
    const courseId = value ? Number(value) : '';
    setSelectedCourse(courseId);

    if (courseId && selectedMajor) {
      const course = courses.find(c => c.id === courseId);
      const major = majors.find(m => m.id === selectedMajor);
      if (course && major) {
        setSemesterCode(`${major.maNganh} ${course.ma_khoa_hoc}`);
      }
    }
  };

  const handleMajorChange = (value: string | number) => {
    const majorId = value ? Number(value) : '';
    setSelectedMajor(majorId);

    if (majorId && selectedCourse) {
      const major = majors.find(m => m.id === majorId);
      const course = courses.find(c => c.id === selectedCourse);
      if (major && course) {
        setSemesterCode(`${major.maNganh} ${course.ma_khoa_hoc}`);
      }
    }
  };

  const handleGeneratePayments = async () => {
    setError(null);
    setSuccess(null);

    if (!selectedCourse || !selectedMajor || !semesterCode) {
      setError('Vui lòng chọn kỳ học và ngành học');
      return;
    }

    try {
      setGenerating(true);
      await generatePaymentRecords({
        major_id: Number(selectedMajor),
        khoa_hoc_id: Number(selectedCourse),
        semester_code: semesterCode,
      });
      setSuccess('✅ Đã tạo bản ghi thanh toán từ lịch giảng dạy');
      await loadExistingPayments();
      await loadSummary();
    } catch (err: any) {
      console.error('❌ Generate error:', err);
      setError(err.response?.data?.message || 'Lỗi khi tạo bản ghi thanh toán');
    } finally {
      setGenerating(false);
    }
  };

  const calculateAmounts = (row: TeachingPaymentRow): TeachingPaymentRow => {
    const soTinChi = Number(row.so_tin_chi) || 0;
    const donGiaTinChi = Number(row.don_gia_tin_chi) || 0;
    const heSo = Number(row.he_so) || 1.0;
    const soTiet = Number(row.so_tiet) || 0;

    const thanhTienChuaThue = soTinChi * donGiaTinChi * heSo * soTiet;
    const thueThuNhap = thanhTienChuaThue * 0.10; // 10% tax
    const thucNhan = thanhTienChuaThue - thueThuNhap;

    return {
      ...row,
      thanh_tien_chua_thue: thanhTienChuaThue,
      thue_thu_nhap: thueThuNhap,
      thuc_nhan: thucNhan,
      tong_nhan: thucNhan,
    };
  };

  const processRowUpdate = (newRow: GridRowModel<TeachingPaymentRow>): GridRowModel<TeachingPaymentRow> => {
    // Recalculate amounts
    const updatedRow = calculateAmounts(newRow as TeachingPaymentRow);
    const updatedRows = rows.map((row) => (row.id === updatedRow.id ? updatedRow : row));
    setRows(updatedRows as TeachingPaymentRow[]);
    return updatedRow;
  };

  const handleProcessRowUpdateError = (error: Error) => {
    console.error('Row update error:', error);
    setError('Lỗi khi cập nhật dòng');
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    if (!selectedCourse || !selectedMajor || !semesterCode) {
      setError('Vui lòng chọn kỳ học và ngành học');
      return;
    }

    if (rows.length === 0) {
      setError('Không có dữ liệu để lưu');
      return;
    }

    try {
      setSaving(true);

      const payments = rows.map((row) => ({
        id: typeof row.id === 'number' ? row.id : undefined,
        teaching_schedule_id: row.teaching_schedule_id,
        stt: row.stt,
        ten_hoc_phan: row.ten_hoc_phan,
        so_tin_chi: row.so_tin_chi,
        can_bo_giang_day: row.can_bo_giang_day || null,

        // Thông tin giảng viên chi tiết
        chuc_danh_giang_vien: row.chuc_danh_giang_vien || undefined,
        ho_ten_giang_vien: row.ho_ten_giang_vien || undefined,

        // Thông tin đơn vị và ngân hàng
        don_vi: row.don_vi || undefined,
        ma_so_thue_tncn: row.ma_so_thue_tncn || undefined,
        so_tai_khoan: row.so_tai_khoan || undefined,
        tai_ngan_hang: row.tai_ngan_hang || undefined,

        // Thời gian giảng dạy
        tu_ngay: row.tu_ngay || undefined,
        den_ngay: row.den_ngay || undefined,
        ngay_thi: row.ngay_thi || undefined,

        // Đơn giá/01 đết
        don_gia_ly_thuyet: row.don_gia_ly_thuyet !== '' ? Number(row.don_gia_ly_thuyet) : undefined,
        don_gia_thuc_hanh: row.don_gia_thuc_hanh !== '' ? Number(row.don_gia_thuc_hanh) : undefined,

        // Phân bổ số tiết/học phần
        so_tiet_ly_thuyet: row.so_tiet_ly_thuyet !== '' ? Number(row.so_tiet_ly_thuyet) : undefined,
        so_tiet_thao_luan: row.so_tiet_thao_luan !== '' ? Number(row.so_tiet_thao_luan) : undefined,
        so_tiet_bai_tap_lon: row.so_tiet_bai_tap_lon !== '' ? Number(row.so_tiet_bai_tap_lon) : undefined,

        // Số lượng
        so_luong_bai_tap: row.so_luong_bai_tap !== '' ? Number(row.so_luong_bai_tap) : undefined,
        so_luong_bai_thi: row.so_luong_bai_thi !== '' ? Number(row.so_luong_bai_thi) : undefined,

        lop: row.lop || undefined,
        chuyen_nganh: row.chuyen_nganh || undefined,
        so_buoi: row.so_buoi !== '' ? Number(row.so_buoi) : undefined,
        hoc_phan: row.hoc_phan || undefined,
        si_so: row.si_so !== '' ? Number(row.si_so) : undefined,
        don_gia_tin_chi: row.don_gia_tin_chi !== '' ? Number(row.don_gia_tin_chi) : undefined,
        so_tiet: row.so_tiet !== '' ? Number(row.so_tiet) : undefined,
        he_so: row.he_so !== '' ? Number(row.he_so) : undefined,
        he_so_ra_de_cham_thi: row.he_so_ra_de_cham_thi !== '' ? Number(row.he_so_ra_de_cham_thi) : undefined,
        ghi_chu: row.ghi_chu || undefined,
        phu_trach_lop: row.phu_trach_lop || undefined,
      }));

      const requestData: BulkSavePaymentRequest = {
        major_id: Number(selectedMajor),
        khoa_hoc_id: Number(selectedCourse),
        semester_code: semesterCode,
        payments,
      };

      await bulkSavePayments(requestData);
      setSuccess('✅ Lưu thông tin thanh toán thành công!');

      // Reload the payments and summary
      await loadExistingPayments();
      await loadSummary();
    } catch (err: any) {
      console.error('❌ Save error:', err);
      setError(err.response?.data?.message || 'Lỗi khi lưu thông tin thanh toán');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkAsPaid = () => {
    if (getSelectedCount() === 0) {
      setError('Vui lòng chọn ít nhất 1 dòng để đánh dấu đã thanh toán');
      return;
    }
    setConfirmDialog({ open: true, action: 'paid' });
  };

  const handleMarkAsUnpaid = () => {
    if (getSelectedCount() === 0) {
      setError('Vui lòng chọn ít nhất 1 dòng để đánh dấu chưa thanh toán');
      return;
    }
    setConfirmDialog({ open: true, action: 'unpaid' });
  };

  const confirmStatusUpdate = async () => {
    try {
      setSaving(true);
      // Filter for number IDs only
      const ids = selectedRows.filter(id => typeof id === 'number') as number[];

      await bulkUpdatePaymentStatus({
        ids,
        trang_thai_thanh_toan: confirmDialog.action === 'paid' ? 'da_thanh_toan' : 'chua_thanh_toan',
        nguoi_thanh_toan: confirmDialog.action === 'paid' ? nguoiThanhToan : undefined,
      });

      setSuccess(`✅ Đã cập nhật trạng thái thanh toán cho ${ids.length} bản ghi`);
      setConfirmDialog({ open: false, action: null });
      setNguoiThanhToan('');
      setSelectedRows([]);

      // Reload
      await loadExistingPayments();
      await loadSummary();
    } catch (err: any) {
      console.error('❌ Status update error:', err);
      setError(err.response?.data?.message || 'Lỗi khi cập nhật trạng thái thanh toán');
    } finally {
      setSaving(false);
    }
  };

  const handleExportToExcel = async () => {
    try {
      setError(null);
      setSuccess(null);

      if (rows.length === 0) {
        setError('Không có dữ liệu để xuất');
        return;
      }

      // Use the template path relative to public folder
      const templatePath = '/Teaching-payment_Excel_format/template_ai.xlsx';

      // Export to Excel using the template
      await exportTeachingPaymentToExcel({
        data: rows as TeachingPaymentRow[],
        templatePath,
      });

      setSuccess('Xuất file Excel thành công!');
    } catch (err) {
      console.error('❌ Error exporting to Excel:', err);
      setError('Lỗi khi xuất file Excel: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const columns: GridColDef<TeachingPaymentRow>[] = [
    {
      field: 'stt',
      headerName: 'TT',
      width: 60,
      editable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.row.trang_thai_thanh_toan === 'da_thanh_toan' ? 'success' : 'default'}
        />
      ),
    },
    // Thông tin giảng viên
    {
      field: 'chuc_danh_giang_vien',
      headerName: 'Chức danh GV',
      width: 150,
      editable: true, // Có thể edit, nhưng tự động điền từ lecturers
    },
    {
      field: 'ho_ten_giang_vien',
      headerName: 'Họ và tên',
      width: 200,
      editable: true,
    },
    {
      field: 'don_vi',
      headerName: 'Đơn vị',
      width: 150,
      editable: true, // Có thể edit, nhưng tự động điền từ lecturers
    },
    {
      field: 'ma_so_thue_tncn',
      headerName: 'Mã số thuế TNCN',
      width: 150,
      editable: true,
    },
    {
      field: 'so_tai_khoan',
      headerName: 'Số tài khoản',
      width: 150,
      editable: true,
    },
    {
      field: 'tai_ngan_hang',
      headerName: 'Tại Ngân hàng',
      width: 150,
      editable: true,
    },
    // Thông tin lớp học (lấy từ weekly_schedules)
    {
      field: 'lop',
      headerName: 'Lớp',
      width: 200, // Tăng width để chứa nhiều dòng
      editable: false, // Không cho edit vì lấy từ weekly_schedules
      renderCell: (params) => {
        const lopValue = params.value || '-';
        return (
          <div
            className="text-blue-600 font-medium"
            style={{
              whiteSpace: 'normal',
              wordWrap: 'break-word',
              lineHeight: '1.8',
              padding: '8px 0',
            }}
            dangerouslySetInnerHTML={{ __html: lopValue }}
          />
        );
      },
    },
    {
      field: 'chuyen_nganh',
      headerName: 'Chuyên ngành',
      width: 200,
      editable: false, // Không cho edit vì lấy từ weekly_schedules
    },
    {
      field: 'ten_hoc_phan',
      headerName: 'Học phần',
      width: 250,
      editable: false, // Không cho edit vì lấy từ teaching_schedules
    },
    {
      field: 'so_tin_chi',
      headerName: 'Số tín chỉ',
      width: 90,
      editable: true,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
    },
    // Thời gian giảng dạy
    {
      field: 'tu_ngay',
      headerName: 'Từ ngày',
      width: 110,
      editable: true,
      type: 'date',
      valueGetter: (value) => value ? new Date(value) : null,
      valueSetter: (value, row) => {
        return { ...row, tu_ngay: value ? value.toISOString().split('T')[0] : '' };
      },
    },
    {
      field: 'den_ngay',
      headerName: 'Đến ngày',
      width: 110,
      editable: true,
      type: 'date',
      valueGetter: (value) => value ? new Date(value) : null,
      valueSetter: (value, row) => {
        return { ...row, den_ngay: value ? value.toISOString().split('T')[0] : '' };
      },
    },
    {
      field: 'ngay_thi',
      headerName: 'Ngày thi',
      width: 110,
      editable: true,
      type: 'date',
      valueGetter: (value) => value ? new Date(value) : null,
      valueSetter: (value, row) => {
        return { ...row, ngay_thi: value ? value.toISOString().split('T')[0] : '' };
      },
    },
    // Đơn giá/01 đết
    {
      field: 'don_gia_ly_thuyet',
      headerName: 'Đơn giá LT',
      width: 130,
      editable: true,
      type: 'number',
      align: 'right',
      headerAlign: 'center',
      valueFormatter: (value) => {
        if (value === '' || value === null) return '';
        return formatCurrency(Number(value));
      },
    },
    {
      field: 'don_gia_thuc_hanh',
      headerName: 'Đơn giá TH/TL',
      width: 130,
      editable: true,
      type: 'number',
      align: 'right',
      headerAlign: 'center',
      valueFormatter: (value) => {
        if (value === '' || value === null) return '';
        return formatCurrency(Number(value));
      },
    },
    // Phân bổ số tiết/học phần
    {
      field: 'so_tiet_ly_thuyet',
      headerName: 'Số tiết LT',
      width: 100,
      editable: true,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'so_tiet_thao_luan',
      headerName: 'Số tiết TL',
      width: 100,
      editable: true,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'so_tiet_bai_tap_lon',
      headerName: 'Số tiết BTL',
      width: 100,
      editable: true,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
    },
    // Số lượng
    {
      field: 'so_luong_bai_tap',
      headerName: 'SL bài tập',
      width: 100,
      editable: true,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'so_luong_bai_thi',
      headerName: 'SL bài thi',
      width: 100,
      editable: true,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'so_buoi',
      headerName: 'Số buổi',
      width: 90,
      editable: true,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'si_so',
      headerName: 'Sĩ số (SL HV)',
      width: 110,
      editable: true,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'don_gia_tin_chi',
      headerName: 'Đơn giá TC',
      width: 130,
      editable: true,
      type: 'number',
      align: 'right',
      headerAlign: 'center',
      valueFormatter: (value) => {
        if (value === '' || value === null) return '';
        return formatCurrency(Number(value));
      },
    },
    {
      field: 'so_tiet',
      headerName: 'Số tiết',
      width: 90,
      editable: true,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'he_so',
      headerName: 'Hệ số',
      width: 80,
      editable: true,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'he_so_ra_de_cham_thi',
      headerName: 'HS ra đề, chấm thi',
      width: 140,
      editable: true,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'thanh_tien_chua_thue',
      headerName: 'Thành tiền (chưa thuế)',
      width: 180,
      editable: false,
      type: 'number',
      align: 'right',
      headerAlign: 'center',
      valueFormatter: (value) => formatCurrency(Number(value)),
      renderCell: (params) => (
        <span className="font-semibold text-blue-700">
          {formatCurrency(Number(params.value))}
        </span>
      ),
    },
    {
      field: 'thue_thu_nhap',
      headerName: 'Thuế (10%)',
      width: 130,
      editable: false,
      type: 'number',
      align: 'right',
      headerAlign: 'center',
      valueFormatter: (value) => formatCurrency(Number(value)),
    },
    {
      field: 'thuc_nhan',
      headerName: 'Thực nhận',
      width: 150,
      editable: false,
      type: 'number',
      align: 'right',
      headerAlign: 'center',
      valueFormatter: (value) => formatCurrency(Number(value)),
      renderCell: (params) => (
        <span className="font-bold text-green-700">
          {formatCurrency(Number(params.value))}
        </span>
      ),
    },
    {
      field: 'ghi_chu',
      headerName: 'Ghi chú',
      width: 200,
      editable: true,
    },
    {
      field: 'phu_trach_lop',
      headerName: 'Phụ trách lớp',
      width: 180,
      editable: true,
      type: 'singleSelect',
      valueOptions: [
        { value: '', label: '-- Chọn phụ trách lớp --' },
        { value: 'Lê Thành Lự', label: 'Lê Thành Lự' },
        { value: 'Đồng Phương Thanh', label: 'Đồng Phương Thanh' },
        { value: 'Đỗ Tất Mạnh', label: 'Đỗ Tất Mạnh' },
      ],
    },
    {
      field: 'trang_thai_thanh_toan',
      headerName: 'Trạng thái',
      width: 130,
      editable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value === 'da_thanh_toan' ? 'Đã TT' : 'Chưa TT'}
          size="small"
          color={params.value === 'da_thanh_toan' ? 'success' : 'warning'}
          icon={params.value === 'da_thanh_toan' ? <CheckCircleIcon className="w-4 h-4" /> : <XCircleIcon className="w-4 h-4" />}
        />
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Thanh toán tiền giảng dạy
        </h1>
        <p className="text-gray-600">
          Quản lý thanh toán tiền giảng dạy cho giảng viên theo từng kỳ học
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Autocomplete
            label="Năm học"
            placeholder="Tìm kiếm theo mã kỳ học hoặc năm học..."
            options={courseOptions}
            value={selectedCourse}
            onChange={handleCourseChange}
            disabled={loading}
          />

          <Autocomplete
            label="Ngành học"
            placeholder="Tìm kiếm theo mã ngành hoặc tên ngành..."
            options={majorOptions}
            value={selectedMajor}
            onChange={handleMajorChange}
            disabled={loading}
          />

          <MuiTextField
            label="Mã kỳ học - Ngành"
            value={semesterCode}
            onChange={(e) => setSemesterCode(e.target.value)}
            fullWidth
            helperText="VD: QLKT 2025.1"
          />
        </div>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <Typography variant="h6" className="mb-4 font-semibold">
            Thống kê thanh toán
          </Typography>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Tổng số bản ghi</div>
              <div className="text-2xl font-bold text-blue-700">{summary.total_payments}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Đã thanh toán</div>
              <div className="text-2xl font-bold text-green-700">{summary.paid_payments}</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Chưa thanh toán</div>
              <div className="text-2xl font-bold text-orange-700">{summary.unpaid_payments}</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Tổng thực nhận</div>
              <div className="text-xl font-bold text-purple-700">
                {formatCurrency(summary.total_thuc_nhan)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alerts */}
      {error && (
        <Alert severity="error" className="mb-4" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" className="mb-4" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* DataGrid */}
      {selectedCourse && selectedMajor && semesterCode ? (
        <Paper elevation={2} className="p-6">
          {/* Header with title and count */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <Typography variant="h6" className="text-gray-900 font-semibold">
                Bảng thanh toán tiền giảng dạy
              </Typography>
              <Typography variant="caption" className="text-gray-600">
                Hiển thị {filteredRows.length} / {rows.length} bản ghi
                {getSelectedCount() > 0 && (
                  <span className="ml-2 text-blue-600 font-medium">
                    • {getSelectedCount()} dòng đã chọn
                  </span>
                )}
              </Typography>
            </div>
            <div className="flex gap-2">
              {rows.length === 0 && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={generating ? <CircularProgress size={16} /> : <ArrowPathIcon className="w-5 h-5" />}
                  onClick={handleGeneratePayments}
                  disabled={generating || loading}
                >
                  {generating ? 'Đang tạo...' : 'Tạo từ lịch giảng dạy'}
                </Button>
              )}
              {rows.length > 0 && (
                <>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircleIcon className="w-5 h-5" />}
                    onClick={handleMarkAsPaid}
                    disabled={getSelectedCount() === 0 || saving}
                    sx={{
                      '&:disabled': {
                        opacity: 0.5,
                        cursor: 'not-allowed',
                      },
                    }}
                  >
                    Đánh dấu đã TT ({getSelectedCount()})
                  </Button>
                  <Button
                    variant="contained"
                    color="warning"
                    startIcon={<XCircleIcon className="w-5 h-5" />}
                    onClick={handleMarkAsUnpaid}
                    disabled={getSelectedCount() === 0 || saving}
                    sx={{
                      '&:disabled': {
                        opacity: 0.5,
                        cursor: 'not-allowed',
                      },
                    }}
                  >
                    Đánh dấu chưa TT ({getSelectedCount()})
                  </Button>
                  <Button
                    variant="outlined"
                    color="info"
                    startIcon={<ArrowDownTrayIcon className="w-5 h-5" />}
                    onClick={handleExportToExcel}
                    disabled={loading || rows.length === 0}
                  >
                    Xuất Excel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={saving || loading || rows.length === 0}
                  >
                    {saving ? <CircularProgress size={20} /> : 'Lưu tất cả'}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* 🔍 Search and Filters Section */}
          <div className="mb-4 space-y-3">
            {/* Search Box */}
            <div className="flex gap-3">
              <MuiTextField
                fullWidth
                size="small"
                placeholder="Tìm kiếm theo tên học phần, giảng viên, lớp, chuyên ngành..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setSearchQuery('')}
                        edge="end"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Quick Status Filters */}
              <div className="flex gap-2 items-center min-w-fit">
                <Chip
                  icon={<FunnelIcon className="w-4 h-4" />}
                  label="Tất cả"
                  onClick={() => setStatusFilter('all')}
                  color={statusFilter === 'all' ? 'primary' : 'default'}
                  variant={statusFilter === 'all' ? 'filled' : 'outlined'}
                />
                <Chip
                  icon={<CheckCircleIcon className="w-4 h-4" />}
                  label="Đã TT"
                  onClick={() => setStatusFilter('paid')}
                  color={statusFilter === 'paid' ? 'success' : 'default'}
                  variant={statusFilter === 'paid' ? 'filled' : 'outlined'}
                />
                <Chip
                  icon={<XCircleIcon className="w-4 h-4" />}
                  label="Chưa TT"
                  onClick={() => setStatusFilter('unpaid')}
                  color={statusFilter === 'unpaid' ? 'warning' : 'default'}
                  variant={statusFilter === 'unpaid' ? 'filled' : 'outlined'}
                />
              </div>
            </div>

            {/* Advanced Filters Row */}
            <div className="flex gap-3">
              {/* Lecturer Filter */}
              <FormControl size="small" className="min-w-[200px]">
                <InputLabel>Giảng viên</InputLabel>
                <Select
                  value={lecturerFilter}
                  label="Giảng viên"
                  onChange={(e) => setLecturerFilter(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Tất cả giảng viên</em>
                  </MenuItem>
                  {getUniqueLecturers().map((lecturer) => (
                    <MenuItem key={lecturer} value={lecturer}>
                      {lecturer}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Class Filter */}
              <MuiTextField
                size="small"
                label="Lọc theo lớp"
                placeholder="VD: QLKT 2025"
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="min-w-[200px]"
                InputProps={{
                  endAdornment: classFilter && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setClassFilter('')}
                        edge="end"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Clear All Filters Button */}
              {hasActiveFilters() && (
                <Tooltip title="Xóa tất cả bộ lọc">
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<XMarkIcon className="w-4 h-4" />}
                    onClick={clearAllFilters}
                    sx={{ minWidth: 'fit-content', whiteSpace: 'nowrap' }}
                  >
                    Xóa bộ lọc
                  </Button>
                </Tooltip>
              )}
            </div>

            {/* Active Filters Chips */}
            {hasActiveFilters() && (
              <div className="flex flex-wrap gap-2 items-center text-sm text-gray-600">
                <span className="font-medium">Đang lọc:</span>
                {searchQuery && (
                  <Chip
                    size="small"
                    label={`Tìm kiếm: "${searchQuery}"`}
                    onDelete={() => setSearchQuery('')}
                    color="primary"
                    variant="outlined"
                  />
                )}
                {statusFilter !== 'all' && (
                  <Chip
                    size="small"
                    label={`Trạng thái: ${statusFilter === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}`}
                    onDelete={() => setStatusFilter('all')}
                    color={statusFilter === 'paid' ? 'success' : 'warning'}
                    variant="outlined"
                  />
                )}
                {lecturerFilter && (
                  <Chip
                    size="small"
                    label={`Giảng viên: ${lecturerFilter}`}
                    onDelete={() => setLecturerFilter('')}
                    color="info"
                    variant="outlined"
                  />
                )}
                {classFilter && (
                  <Chip
                    size="small"
                    label={`Lớp: ${classFilter}`}
                    onDelete={() => setClassFilter('')}
                    color="secondary"
                    variant="outlined"
                  />
                )}
              </div>
            )}
          </div>

          <Box sx={{ height: 700, width: '100%' }}>
            <DataGrid
              rows={filteredRows}
              columns={columns}
              processRowUpdate={processRowUpdate}
              onProcessRowUpdateError={handleProcessRowUpdateError}
              loading={loading}
              checkboxSelection
              disableRowSelectionOnClick
              editMode="cell"
              getRowHeight={() => 'auto'} // Cho phép row tự động điều chỉnh chiều cao
              onRowSelectionModelChange={(newSelection) => {
                console.log('📌 Selection changed:', newSelection);

                // Store raw selection model
                setSelectionModel(newSelection);

                // Extract actual selected IDs based on selection type
                let selectedIds: (string | number)[] = [];

                if (typeof newSelection === 'object' && newSelection !== null && 'type' in newSelection) {
                  const model = newSelection as { type: 'exclude' | 'include'; ids: Set<any> };

                  if (model.type === 'exclude') {
                    // "Select all except..." - get all row IDs except excluded ones
                    const excludedIds = new Set(model.ids);
                    selectedIds = rows
                      .filter(row => !excludedIds.has(row.id))
                      .map(row => row.id);
                  } else if (model.type === 'include') {
                    // "Select only these" - get included IDs
                    selectedIds = Array.from(model.ids);
                  }
                } else {
                  // Fallback to array format (older MUI versions)
                  selectedIds = Array.isArray(newSelection)
                    ? newSelection
                    : Array.from(newSelection as any);
                }

                setSelectedRows(selectedIds as (string | number)[]);
                console.log('📌 Selected rows count:', selectedIds.length);
                console.log('📌 Selected IDs:', selectedIds);
              }}
              getRowClassName={(params) => {
                // Highlight paid rows with green background (like Excel image)
                if (params.row.trang_thai_thanh_toan === 'da_thanh_toan') {
                  return 'bg-green-100';
                }
                return '';
              }}
              sx={{
                '& .bg-green-100': {
                  backgroundColor: '#d1fae5', // Light green for paid rows
                  '&:hover': {
                    backgroundColor: '#a7f3d0',
                  },
                  '&.Mui-selected': {
                    backgroundColor: '#6ee7b7 !important',
                    '&:hover': {
                      backgroundColor: '#6ee7b7 !important',
                    },
                  },
                },
                '& .MuiDataGrid-cell:focus': {
                  outline: '2px solid #3b82f6',
                },
                '& .MuiDataGrid-cell:focus-within': {
                  outline: '2px solid #3b82f6',
                },
                '& .MuiDataGrid-cell--editable': {
                  cursor: 'text',
                  '&:hover': {
                    backgroundColor: '#f3f4f6',
                  },
                },
                // Excel-like styling
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#e5e7eb',
                  fontWeight: 'bold',
                },
                '& .MuiDataGrid-cell': {
                  borderRight: '1px solid #e5e7eb',
                  whiteSpace: 'normal', // Cho phép xuống dòng
                  wordWrap: 'break-word', // Tự động cắt từ dài
                  lineHeight: '1.8', // Khoảng cách giữa các dòng
                  padding: '8px', // Padding cho đẹp hơn
                  alignItems: 'flex-start', // Align content to top
                },
                '& .MuiDataGrid-row': {
                  borderBottom: '1px solid #d1d5db',
                  minHeight: 'auto !important', // Override min height
                  maxHeight: 'none !important', // No max height limit
                },
              }}
            />
          </Box>
        </Paper>
      ) : (
        <Paper elevation={1} className="p-12 text-center">
          <Typography variant="h6" className="text-gray-500">
            Vui lòng chọn kỳ học và ngành học để bắt đầu
          </Typography>
          <Typography variant="body2" className="text-gray-400 mt-2">
            Chọn kỳ học và ngành học ở trên để xem bảng thanh toán
          </Typography>
        </Paper>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, action: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {confirmDialog.action === 'paid' ? 'Xác nhận đánh dấu đã thanh toán' : 'Xác nhận đánh dấu chưa thanh toán'}
        </DialogTitle>
        <DialogContent>
          <Typography className="mb-4">
            {confirmDialog.action === 'paid'
              ? `Bạn có chắc chắn muốn đánh dấu ${getSelectedCount()} bản ghi là đã thanh toán?`
              : `Bạn có chắc chắn muốn đánh dấu ${getSelectedCount()} bản ghi là chưa thanh toán?`
            }
          </Typography>
          {confirmDialog.action === 'paid' && (
            <MuiTextField
              label="Người thanh toán"
              value={nguoiThanhToan}
              onChange={(e) => setNguoiThanhToan(e.target.value)}
              fullWidth
              helperText="Nhập tên người thực hiện thanh toán"
              autoFocus
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setConfirmDialog({ open: false, action: null });
              setNguoiThanhToan('');
            }}
            disabled={saving}
          >
            Hủy
          </Button>
          <Button
            onClick={confirmStatusUpdate}
            variant="contained"
            color={confirmDialog.action === 'paid' ? 'success' : 'warning'}
            disabled={saving}
          >
            {saving ? <CircularProgress size={20} /> : 'Xác nhận'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}











