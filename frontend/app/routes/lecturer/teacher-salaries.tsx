import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { useTable } from '~/hooks/useTable';
import { useModal } from '~/hooks/useModal';
import { useForm } from '~/hooks/useForm';
import { apiService } from '~/services/api.service';
import { lecturerService } from '~/services/lecturer.service';
import type { SelectOption } from '~/types/common';
import {
  BanknotesIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { Button, Input, Select, Table, Badge, Card, Pagination, Modal } from '~/components/ui';

// Helper function to format numbers with dot separator
const formatNumber = (num: number | string): string => {
  const number = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(number)) return '0';

  // Format with dot as thousands separator (European style)
  return number.toLocaleString('de-DE');
};

// Types
interface LecturerPayment {
  id: number;
  lecturer_id: number;
  lecturer?: {
    id: number;
    hoTen: string;
    maSo?: string;
  };
  semester_code: string;
  subject_name: string;
  subject_code?: string;
  education_level?: string;
  class_name?: string;
  student_count: number;
  theory_sessions: number;
  practical_sessions: number;
  total_sessions: number;
  teaching_hours_start: number;
  teaching_hours_end: number;
  practical_hours: number;
  hourly_rate: number;
  total_amount: number;
  insurance_rate: number;
  insurance_amount: number;
  net_amount: number;
  payment_status: 'pending' | 'approved' | 'paid' | 'rejected';
  start_date: string;
  end_date: string;
  completion_date?: string;
  payment_date?: string;
  payment_method?: string;
  notes?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

interface LecturerPaymentFormData {
  lecturer_id: number | null;
  semester_code: string;
  subject_name: string;
  subject_code?: string;
  education_level?: string;
  credits?: number;
  class_name?: string;
  student_count: number;
  start_date: string;
  end_date: string;
  completion_date?: string;
  teaching_hours_start: number;
  teaching_hours_end: number;
  practical_hours: number;
  theory_sessions: number;
  practical_sessions: number;
  total_sessions: number;
  hourly_rate: number;
  total_amount: number;
  insurance_rate: number;
  insurance_amount: number;
  net_amount: number;
  notes?: string;
}

export function meta() {
  return [
    { title: "Lương giảng viên - VMU Training" },
    { name: "description", content: "Quản lý thanh toán và lương giảng viên" },
  ];
}

const PAYMENT_STATUS_OPTIONS: SelectOption[] = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'approved', label: 'Đã duyệt' },
  { value: 'paid', label: 'Đã thanh toán' },
  { value: 'rejected', label: 'Từ chối' },
];

const PAYMENT_STATUS_BADGE: Record<string, 'warning' | 'success' | 'danger' | 'info'> = {
  pending: 'warning',
  approved: 'info',
  paid: 'success',
  rejected: 'danger',
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  paid: 'Đã thanh toán',
  rejected: 'Từ chối',
};

export default function TeacherSalaries() {
  // ============================================
  // STATE & MODALS
  // ============================================
  const location = useLocation();

  interface SubjectOption extends SelectOption {
    tenMonHoc?: string;
  }

  interface TeachingAssignmentOption extends SelectOption {
    assignment_id: number;
    subject_code: string;
    subject_name: string;
    class_name: string;
    education_level: string;
    credits: number;
    student_count: number;
    start_date: string;
    end_date: string;
    theory_sessions: number;
    practical_sessions: number;
    total_sessions: number;
  }

  interface TeachingSession {
    id: number;
    teaching_assignment_id: number;
    session_date: string;
    is_practical: boolean;
    status: string;
    start_time?: string;
    end_time?: string;
  }

  interface TeachingAssignment {
    id: number;
    lecturer_id: number;
    subject_id: number;
    class_id: number;
    semester_code?: string;
    subject?: {
      maMonHoc: string;
      tenMonHoc: string;
      soTinChi: number;
    };
    class?: {
      tenLop: string;
      trinhDo: string;
      siSo: number;
    };
  }

  const [selectedPayment, setSelectedPayment] = useState<LecturerPayment | null>(null);
  const [lecturerOptions, setLecturerOptions] = useState<SelectOption[]>([{ value: '', label: 'Tất cả giảng viên' }]);
  const [semesterOptions, setSemesterOptions] = useState<SelectOption[]>([]);
  const [subjectOptions, setSubjectOptions] = useState<SubjectOption[]>([]);
  const [teachingAssignmentOptions, setTeachingAssignmentOptions] = useState<TeachingAssignmentOption[]>([]);
  const [statistics, setStatistics] = useState<any>(null);

  const createModal = useModal();
  const editModal = useModal();
  const deleteModal = useModal();
  const viewModal = useModal();
  const approveModal = useModal();
  const rejectModal = useModal();

  // ============================================
  // USE TABLE HOOK
  // ============================================
  const {
    data: payments,
    isLoading,
    error,
    meta,
    page,
    perPage,
    search,
    filters,
    handlePageChange,
    handlePerPageChange,
    handleSearch,
    handleFilter,
    handleClearFilters,
    refresh,
  } = useTable<LecturerPayment>({
    fetchData: async (params) => {
      // Use apiService instead of direct fetch
      const queryParams = {
        page: params.page || 1,
        per_page: params.per_page || 20,
        search: params.search || undefined,
        ...params.filters,
      };

      return await apiService.getPaginated<LecturerPayment>('/lecturer-payments', queryParams);
    },
    initialPage: 1,
    initialPerPage: 20,
    initialFilters: {},
  });

  // ============================================
  // LOAD OPTIONS & STATISTICS
  // ============================================
  useEffect(() => {
    loadFilterOptions();
    loadStatistics();
  }, [filters.semester_code]);

  const loadFilterOptions = async () => {
    try {
      // Load lecturers
      const response = await lecturerService.getList();
      setLecturerOptions([
        { value: '', label: 'Tất cả giảng viên' },
        ...response.data.map(l => ({
          value: String(l.id),
          label: l.hoTen,
        })),
      ]);

      // Load semesters (get unique from teaching assignments or use predefined)
      await loadSemesters();
    } catch (err) {
      console.error('Error loading lecturers:', err);
    }
  };

  const loadSemesters = async () => {
    try {
      // apiService.get() returns data directly
      const result = await apiService.get<SelectOption[]>(
        '/lecturer-payments/available-semesters'
      );


      if (result && Array.isArray(result) && result.length > 0) {
        setSemesterOptions(result);
      } else {
        // Fallback
        const currentYear = new Date().getFullYear();
        setSemesterOptions([
          { value: `${currentYear}.1`, label: `${currentYear}.1` },
          { value: `${currentYear}.2`, label: `${currentYear}.2` },
          { value: `${currentYear - 1}.1`, label: `${currentYear - 1}.1` },
          { value: `${currentYear - 1}.2`, label: `${currentYear - 1}.2` },
        ]);
      }
    } catch (err) {
      console.error('❌ Error loading semesters:', err);
      // Fallback to current year semesters
      const currentYear = new Date().getFullYear();
      setSemesterOptions([
        { value: `${currentYear}.1`, label: `${currentYear}.1` },
        { value: `${currentYear}.2`, label: `${currentYear}.2` },
        { value: `${currentYear - 1}.1`, label: `${currentYear - 1}.1` },
        { value: `${currentYear - 1}.2`, label: `${currentYear - 1}.2` },
      ]);
    }
  };

  const loadSubjectsBySemester = async (semesterCode: string) => {
    if (!semesterCode) {
      setSubjectOptions([]);
      return;
    }

    try {
      // apiService.get() returns data directly, already unwrapped
      const result = await apiService.get<Array<{
        value: string;
        label: string;
        subject_name: string;
        subject_code: string;
      }>>('/lecturer-payments/available-subjects', { semester_code: semesterCode });

      // result is already the array, not wrapped in {success, data}
      if (result && Array.isArray(result) && result.length > 0) {
        const subjects = result.map((item: {
          value: string;
          label: string;
          subject_name: string;
          subject_code: string;
        }) => ({
          value: item.value,
          label: item.label,
          tenMonHoc: item.subject_name,
        }));
        setSubjectOptions(subjects);
      } else {
        setSubjectOptions([]);
      }
    } catch (err) {
      console.error('❌ Error loading subjects:', err);
      setSubjectOptions([]);
    }
  };

  const loadTeachingAssignments = async (lecturerId: number | null, semesterCode: string) => {
    if (!lecturerId || !semesterCode) {
      setTeachingAssignmentOptions([]);
      return;
    }

    try {
      // apiService.get() returns data directly
      const result = await apiService.get<TeachingAssignmentOption[]>(
        '/lecturer-payments/teaching-assignments-for-autofill',
        {
          lecturer_id: lecturerId,
          semester_code: semesterCode,
        }
      );

      if (result && Array.isArray(result)) {
        setTeachingAssignmentOptions(result);
      } else {
        setTeachingAssignmentOptions([]);
      }
    } catch (err) {
      console.error('❌ Error loading teaching assignments:', err);
      setTeachingAssignmentOptions([]);
    }
  };

  const loadStatistics = async () => {
    try {
      // Use apiService to call backend API
      const data = await apiService.get<any>('/lecturer-payments/statistics', {
        semester_code: filters.semester_code || '',
      });

      if (data.success && data.data) {
        setStatistics(data.data);
      }
    } catch (err) {
      console.error('Error loading statistics:', err);
    }
  };

  const loadAssignmentDataForAutoFill = async (assignmentId: number) => {
    try {
      console.log('🔄 Loading assignment data for ID:', assignmentId);

      // Fetch assignment details
      const assignment = await apiService.get<TeachingAssignment>(`/teaching-assignments/${assignmentId}`);
      console.log('📦 Assignment data:', assignment);

      if (assignment) {
        // Fetch teaching sessions for this assignment using get with query params
        const sessionsData = await apiService.get<{ data: TeachingSession[] }>('/teaching-sessions', {
          teaching_assignment_id: assignmentId,
          per_page: 1000,
        });

        const sessions: TeachingSession[] = sessionsData?.data || [];
        console.log('📚 Sessions found:', sessions.length);

        // Count theory and practical sessions
        const theorySessions = sessions.filter((s: TeachingSession) => !s.is_practical).length;
        const practicalSessions = sessions.filter((s: TeachingSession) => s.is_practical).length;

        // Get date range
        const sessionDates: Date[] = sessions.map((s: TeachingSession) => new Date(s.session_date));
        const startDate = sessionDates.length > 0
          ? new Date(Math.min(...sessionDates.map((d: Date) => d.getTime())))
          : new Date();
        const endDate = sessionDates.length > 0
          ? new Date(Math.max(...sessionDates.map((d: Date) => d.getTime())))
          : new Date();

        // Format dates to YYYY-MM-DD
        const formatDate = (date: Date): string => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        // Auto-fill form
        form.setValues({
          ...form.values,
          lecturer_id: assignment.lecturer_id,
          semester_code: assignment.semester_code || '',
          subject_name: assignment.subject?.tenMonHoc || '',
          subject_code: assignment.subject?.maMonHoc || '',
          education_level: assignment.class?.trinhDo || '',
          credits: assignment.subject?.soTinChi || 0,
          class_name: assignment.class?.tenLop || '',
          student_count: assignment.class?.siSo || 0,
          start_date: formatDate(startDate),
          end_date: formatDate(endDate),
          completion_date: formatDate(endDate),
          theory_sessions: theorySessions,
          practical_sessions: practicalSessions,
          total_sessions: sessions.length,
        });

        console.log('✅ Form auto-filled successfully');
      }
    } catch (err) {
      console.error('❌ Error loading assignment data for auto-fill:', err);
      alert('Không thể tải dữ liệu phân công. Vui lòng thử lại.');
    }
  };

  // ============================================
  // FORM HANDLING
  // ============================================
  const form = useForm<LecturerPaymentFormData>({
    initialValues: {
      lecturer_id: null,
      semester_code: '',
      subject_name: '',
      subject_code: '',
      education_level: '',
      credits: 0,
      class_name: '',
      student_count: 0,
      start_date: '',
      end_date: '',
      completion_date: '',
      teaching_hours_start: 95000,
      teaching_hours_end: 95000,
      practical_hours: 0,
      theory_sessions: 0,
      practical_sessions: 0,
      total_sessions: 0,
      hourly_rate: 95000,
      total_amount: 0,
      insurance_rate: 10,
      insurance_amount: 0,
      net_amount: 0,
      notes: '',
    },
    onSubmit: async (values) => {
      try {
        // Use apiService instead of fetch
        if (selectedPayment) {
          await apiService.put(`/lecturer-payments/${selectedPayment.id}`, values);
        } else {
          await apiService.post('/lecturer-payments', values);
        }

        form.reset();
        createModal.close();
        editModal.close();
        refresh();
      } catch (error: unknown) {
        console.error('Error saving payment:', error);
        alert(error instanceof Error ? error.message : 'Có lỗi xảy ra');
      }
    },
  });

  // Auto-calculate amounts when sessions or rates change
  useEffect(() => {
    const theory = form.values.theory_sessions * 3 * form.values.hourly_rate;
    const practical = form.values.practical_sessions * 3 * form.values.hourly_rate;
    const total = theory + practical;
    const insurance = total * (form.values.insurance_rate / 100);
    const net = total - insurance;

    form.setFieldValue('total_amount', total);
    form.setFieldValue('insurance_amount', insurance);
    form.setFieldValue('net_amount', net);
    form.setFieldValue('total_sessions', form.values.theory_sessions + form.values.practical_sessions);
  }, [
    form.values.theory_sessions,
    form.values.practical_sessions,
    form.values.hourly_rate,
    form.values.insurance_rate,
  ]);

  // Load subjects when semester changes
  useEffect(() => {
    if (form.values.semester_code) {
      loadSubjectsBySemester(form.values.semester_code);
    } else {
    }
  }, [form.values.semester_code]);

  // Load teaching assignments when both lecturer and semester are selected
  useEffect(() => {
    if (form.values.lecturer_id && form.values.semester_code) {
      loadTeachingAssignments(form.values.lecturer_id, form.values.semester_code);
    } else {
      setTeachingAssignmentOptions([]);
    }
  }, [form.values.lecturer_id, form.values.semester_code]);

  // Handle auto-fill from location state (when navigating from calendar page)
  useEffect(() => {
    const state = location.state as any;
    if (state?.autoFillAssignment) {
      const autoFill = state.autoFillAssignment;
      console.log('📝 Auto-filling form with assignment:', autoFill);

      // Open create modal
      setSelectedPayment(null);
      createModal.open();

      // Auto-fill lecturer
      if (autoFill.lecturerId) {
        form.setFieldValue('lecturer_id', autoFill.lecturerId);
      }

      // Load assignment data and auto-fill
      loadAssignmentDataForAutoFill(autoFill.assignmentId);

      // Clear the state to prevent re-filling on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // ============================================
  // HANDLERS
  // ============================================
  const handleCreate = () => {
    setSelectedPayment(null);
    form.reset();
    createModal.open();
  };

  const handleEdit = (payment: LecturerPayment) => {
    if (payment.payment_status !== 'pending') {
      alert('Chỉ có thể sửa bản kê ở trạng thái "Chờ duyệt"');
      return;
    }
    setSelectedPayment(payment);
    form.setValues({
      lecturer_id: payment.lecturer_id,
      semester_code: payment.semester_code,
      subject_name: payment.subject_name,
      subject_code: payment.subject_code || '',
      education_level: payment.education_level || '',
      class_name: payment.class_name || '',
      student_count: payment.student_count,
      start_date: payment.start_date,
      end_date: payment.end_date,
      completion_date: payment.completion_date || '',
      teaching_hours_start: payment.teaching_hours_start,
      teaching_hours_end: payment.teaching_hours_end,
      practical_hours: payment.practical_hours,
      theory_sessions: payment.theory_sessions,
      practical_sessions: payment.practical_sessions,
      total_sessions: payment.total_sessions,
      hourly_rate: payment.hourly_rate,
      total_amount: payment.total_amount,
      insurance_rate: payment.insurance_rate,
      insurance_amount: payment.insurance_amount,
      net_amount: payment.net_amount,
      notes: payment.notes || '',
    });
    editModal.open();
  };

  const handleView = (payment: LecturerPayment) => {
    setSelectedPayment(payment);
    viewModal.open();
  };

  const handleDeleteClick = (payment: LecturerPayment) => {
    if (payment.payment_status !== 'pending') {
      alert('Chỉ có thể xóa bản kê ở trạng thái "Chờ duyệt"');
      return;
    }
    setSelectedPayment(payment);
    deleteModal.open();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPayment) return;

    try {
      // Use apiService
      await apiService.delete(`/lecturer-payments/${selectedPayment.id}`);

      deleteModal.close();
      refresh();
    } catch (error: unknown) {
      console.error('Error deleting payment:', error);
      alert(error instanceof Error ? error.message : 'Có lỗi xảy ra khi xóa');
    }
  };

  const handleApprove = async (payment: LecturerPayment) => {
    if (payment.payment_status !== 'pending') {
      alert('Chỉ có thể duyệt bản kê ở trạng thái "Chờ duyệt"');
      return;
    }

    if (!confirm(`Xác nhận duyệt thanh toán cho giảng viên "${payment.lecturer?.hoTen}"?`)) {
      return;
    }

    try {
      // Use apiService
      await apiService.post(`/lecturer-payments/${payment.id}/approve`, {});

      refresh();
    } catch (error: unknown) {
      console.error('Error approving payment:', error);
      alert(error instanceof Error ? error.message : 'Có lỗi xảy ra khi duyệt');
    }
  };

  const handleReject = (payment: LecturerPayment) => {
    if (payment.payment_status !== 'pending') {
      alert('Chỉ có thể từ chối bản kê ở trạng thái "Chờ duyệt"');
      return;
    }
    setSelectedPayment(payment);
    rejectModal.open();
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!selectedPayment || !reason.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      // Use apiService
      await apiService.post(`/lecturer-payments/${selectedPayment.id}/reject`, {
        rejection_reason: reason
      });

      rejectModal.close();
      refresh();
    } catch (error: unknown) {
      console.error('Error rejecting payment:', error);
      alert(error instanceof Error ? error.message : 'Có lỗi xảy ra khi từ chối');
    }
  };

  const handleMarkAsPaid = async (payment: LecturerPayment) => {
    if (payment.payment_status !== 'approved') {
      alert('Chỉ có thể thanh toán cho bản kê đã được duyệt');
      return;
    }

    const paymentDate = prompt('Nhập ngày thanh toán (YYYY-MM-DD):');
    if (!paymentDate) return;

    const paymentMethod = prompt('Nhập phương thức thanh toán:');

    try {
      // Use apiService
      await apiService.post(`/lecturer-payments/${payment.id}/mark-as-paid`, {
        payment_date: paymentDate,
        payment_method: paymentMethod || '',
      });

      refresh();
    } catch (error: unknown) {
      console.error('Error marking as paid:', error);
      alert(error instanceof Error ? error.message : 'Có lỗi xảy ra');
    }
  };

  // ============================================
  // TABLE COLUMNS
  // ============================================
  const columns = [
    {
      key: 'id',
      label: 'STT',
      render: (payment: LecturerPayment, index: number) => (
        <span className="text-gray-900 font-medium">
          {(page - 1) * perPage + index + 1}
        </span>
      ),
    },
    {
      key: 'lecturer',
      label: 'Giảng viên',
      render: (payment: LecturerPayment) => (
        <div>
          <div className="font-medium text-gray-900">{payment.lecturer?.hoTen}</div>
          {payment.lecturer?.maSo && (
            <div className="text-sm text-gray-500">{payment.lecturer.maSo}</div>
          )}
        </div>
      ),
    },
    {
      key: 'subject',
      label: 'Môn học',
      render: (payment: LecturerPayment) => (
        <div>
          <div className="font-medium text-gray-900">{payment.subject_name}</div>
          {payment.class_name && (
            <div className="text-sm text-gray-500">{payment.class_name}</div>
          )}
        </div>
      ),
    },
    {
      key: 'semester_code',
      label: 'Học kỳ',
      render: (payment: LecturerPayment) => (
        <span className="text-sm text-gray-700">{payment.semester_code}</span>
      ),
    },
    {
      key: 'sessions',
      label: 'Số buổi',
      render: (payment: LecturerPayment) => (
        <div className="text-sm">
          <div>LT: {payment.theory_sessions}</div>
          <div>TH: {payment.practical_sessions}</div>
          <div className="font-medium">Tổng: {payment.total_sessions}</div>
        </div>
      ),
    },
    {
      key: 'amounts',
      label: 'Số tiền',
      render: (payment: LecturerPayment) => (
        <div className="text-sm text-right">
          <div className="font-medium text-gray-900">
            {formatNumber(payment.total_amount)} đ
          </div>
          <div className="text-red-600">
            -{formatNumber(payment.insurance_amount)} đ
          </div>
          <div className="font-bold text-green-600">
            {formatNumber(payment.net_amount)} đ
          </div>
        </div>
      ),
    },
    {
      key: 'payment_status',
      label: 'Trạng thái',
      render: (payment: LecturerPayment) => (
        <Badge variant={PAYMENT_STATUS_BADGE[payment.payment_status]}>
          {PAYMENT_STATUS_LABELS[payment.payment_status]}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (payment: LecturerPayment) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(payment)}
            title="Xem chi tiết"
          >
            <EyeIcon className="w-4 h-4" />
          </Button>

          {payment.payment_status === 'pending' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(payment)}
                title="Sửa"
              >
                <PencilIcon className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleApprove(payment)}
                title="Duyệt"
              >
                <CheckCircleIcon className="w-4 h-4 text-green-600" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReject(payment)}
                title="Từ chối"
              >
                <XCircleIcon className="w-4 h-4 text-red-600" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteClick(payment)}
                title="Xóa"
              >
                <TrashIcon className="w-4 h-4 text-red-600" />
              </Button>
            </>
          )}

          {payment.payment_status === 'approved' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleMarkAsPaid(payment)}
              title="Đánh dấu đã thanh toán"
            >
              <BanknotesIcon className="w-4 h-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BanknotesIcon className="w-8 h-8 text-green-600" />
            Lương giảng viên
          </h1>
          <p className="text-gray-600 mt-1">Quản lý thanh toán và lương cho giảng viên</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          Tạo bản kê mới
        </Button>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="p-4">
              <div className="text-sm text-gray-600">Tổng số bản kê</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {statistics.total_payments || 0}
              </div>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <div className="text-sm text-gray-600">Chờ duyệt</div>
              <div className="text-2xl font-bold text-yellow-600 mt-1">
                {statistics.by_status?.pending || 0}
              </div>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <div className="text-sm text-gray-600">Tổng tiền</div>
              <div className="text-2xl font-bold text-blue-600 mt-1">
                {formatNumber(statistics.total_amount || 0)} đ
              </div>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <div className="text-sm text-gray-600">Thực nhận</div>
              <div className="text-2xl font-bold text-green-600 mt-1">
                {formatNumber(statistics.net_amount || 0)} đ
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="🔍 Tìm theo tên GV, môn học..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />

            <Select
              options={lecturerOptions}
              value={filters.lecturer_id || ''}
              onChange={(e) => handleFilter('lecturer_id', e.target.value)}
            />

            <Select
              options={PAYMENT_STATUS_OPTIONS}
              value={filters.payment_status || ''}
              onChange={(e) => handleFilter('payment_status', e.target.value)}
            />

            <Input
              placeholder="Học kỳ (vd: 2024.1)"
              value={filters.semester_code || ''}
              onChange={(e) => handleFilter('semester_code', e.target.value)}
            />
          </div>

          {(search || Object.keys(filters).length > 0) && (
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          data={payments}
          isLoading={isLoading}
        />

        {meta && meta.total > 0 && (
          <div className="p-4 border-t">
            <Pagination
              currentPage={page}
              totalPages={meta.last_page}
              total={meta.total}
              perPage={perPage}
              onPageChange={handlePageChange}
              onPerPageChange={handlePerPageChange}
            />
          </div>
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={createModal.isOpen || editModal.isOpen}
        onClose={() => {
          createModal.close();
          editModal.close();
        }}
        title={selectedPayment ? 'Sửa bản kê thanh toán' : 'Tạo bản kê thanh toán'}
        size="xl"
      >
        <form onSubmit={form.handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Giảng viên *"
              options={lecturerOptions.filter(o => o.value)}
              value={form.values.lecturer_id ? String(form.values.lecturer_id) : ''}
              onChange={(e) => form.setFieldValue('lecturer_id', e.target.value ? Number(e.target.value) : null)}
              error={form.errors.lecturer_id}
              required
            />

            <Select
              label="Học kỳ *"
              options={semesterOptions}
              value={form.values.semester_code || ''}
              onChange={(e) => {
                form.setFieldValue('semester_code', e.target.value);
                // Clear subject when semester changes
                form.setFieldValue('subject_code', '');
                form.setFieldValue('subject_name', '');
              }}
              error={form.errors.semester_code}
              required
            />
          </div>

          {/* Teaching Assignment Auto-Fill Section */}
          {form.values.lecturer_id && form.values.semester_code && (
            <>
              {teachingAssignmentOptions.length > 0 ? (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📋 Chọn lịch giảng dạy để tự động điền thông tin
                  </label>
                  <Select
                    options={[
                      { value: '', label: '-- Chọn lịch giảng dạy --' },
                      ...teachingAssignmentOptions
                    ]}
                    value=""
                    onChange={(e) => {
                      const selected = teachingAssignmentOptions.find(a => String(a.value) === e.target.value);
                      if (selected) {
                        // Auto-fill all fields from teaching assignment
                        form.setFieldValue('subject_code', selected.subject_code);
                        form.setFieldValue('subject_name', selected.subject_name);
                        form.setFieldValue('class_name', selected.class_name);
                        form.setFieldValue('education_level', selected.education_level);
                        form.setFieldValue('credits', selected.credits);
                        form.setFieldValue('student_count', selected.student_count);
                        form.setFieldValue('start_date', selected.start_date);
                        form.setFieldValue('end_date', selected.end_date);
                        form.setFieldValue('theory_sessions', Math.round(selected.theory_sessions));
                        form.setFieldValue('practical_sessions', Math.round(selected.practical_sessions));
                        form.setFieldValue('total_sessions', Math.round(selected.total_sessions));
                      }
                    }}
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Chọn một lịch giảng dạy để tự động điền các thông tin: môn học, lớp, số học viên, ngày bắt đầu/kết thúc, số buổi học...
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ℹ️ <strong>Không tìm thấy lịch giảng dạy</strong> cho giảng viên này trong học kỳ {form.values.semester_code}.
                    Bạn có thể nhập thông tin thủ công bên dưới.
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Để sử dụng tính năng tự động điền, hãy đảm bảo giảng viên đã được gán lịch giảng dạy trong hệ thống.
                  </p>
                </div>
              )}
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Môn học *"
              options={subjectOptions}
              value={form.values.subject_code || ''}
              onChange={(e) => {
                const selected = subjectOptions.find(s => s.value === e.target.value);
                form.setFieldValue('subject_code', e.target.value);
                if (selected && selected.tenMonHoc) {
                  form.setFieldValue('subject_name', selected.tenMonHoc);
                } else {
                  console.log('⚠️ No tenMonHoc found in selected subject');
                }
              }}
              error={form.errors.subject_code}
              required
              disabled={!form.values.semester_code || subjectOptions.length === 0}
            />

            <Input
              label="Tên môn học *"
              placeholder="VD: Thiết kế hệ thống Logistics"
              value={form.values.subject_name}
              onChange={(e) => form.handleChange('subject_name', e.target.value)}
              onBlur={() => form.handleBlur('subject_name')}
              error={form.errors.subject_name}
              required
              disabled
            />

            <Input
              label="Trình độ"
              placeholder="VD: VCB, TS"
              value={form.values.education_level}
              onChange={(e) => form.handleChange('education_level', e.target.value)}
              onBlur={() => form.handleBlur('education_level')}
              error={form.errors.education_level}
            />

            <Input
              label="Tên lớp"
              placeholder="VD: Khoa Kinh tế 09/2024"
              value={form.values.class_name}
              onChange={(e) => form.handleChange('class_name', e.target.value)}
              onBlur={() => form.handleBlur('class_name')}
              error={form.errors.class_name}
            />
            <Input
              type="number"
              label="Số tín chỉ"
              value={form.values.credits}
              onChange={(e) => form.handleChange('credits', Number(e.target.value))}
              onBlur={() => form.handleBlur('credits')}
              error={form.errors.credits}
            />

            <Input
              type="date"
              label="Từ ngày *"
              value={form.values.start_date}
              onChange={(e) => form.handleChange('start_date', e.target.value)}
              onBlur={() => form.handleBlur('start_date')}
              error={form.errors.start_date}
              required
            />

            <Input
              type="date"
              label="Đến ngày *"
              value={form.values.end_date}
              onChange={(e) => form.handleChange('end_date', e.target.value)}
              onBlur={() => form.handleBlur('end_date')}
              error={form.errors.end_date}
              required
            />

            <Input
              type="date"
              label="Ngày hoàn thành"
              value={form.values.completion_date}
              onChange={(e) => form.handleChange('completion_date', e.target.value)}
              onBlur={() => form.handleBlur('completion_date')}
              error={form.errors.completion_date}
            />

            <Input
              type="number"
              label="Đơn giá/giờ (VND) *"
              value={form.values.hourly_rate}
              onChange={(e) => form.handleChange('hourly_rate', Number(e.target.value))}
              onBlur={() => form.handleBlur('hourly_rate')}
              error={form.errors.hourly_rate}
              required
            />

            <Input
              type="number"
              label="Số buổi lý thuyết"
              value={form.values.theory_sessions}
              onChange={(e) => form.handleChange('theory_sessions', Number(e.target.value))}
              onBlur={() => form.handleBlur('theory_sessions')}
              error={form.errors.theory_sessions}
            />

            <Input
              type="number"
              label="Số buổi khác"
              value={form.values.practical_sessions}
              onChange={(e) => form.handleChange('practical_sessions', Number(e.target.value))}
              onBlur={() => form.handleBlur('practical_sessions')}
              error={form.errors.practical_sessions}
            />

            <Input
              type="number"
              label="Tỷ lệ bảo hiểm (%)"
              value={form.values.insurance_rate}
              onChange={(e) => form.handleChange('insurance_rate', Number(e.target.value))}
              onBlur={() => form.handleBlur('insurance_rate')}
              error={form.errors.insurance_rate}
            />

            <div className="col-span-2 p-4 bg-gray-50 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Tổng số buổi:</span>
                <span className="font-bold">{form.values.total_sessions}</span>
              </div>
              <div className="flex justify-between">
                <span>Tổng tiền:</span>
                <span className="font-bold text-blue-600">
                  {formatNumber(form.values.total_amount)} đ
                </span>
              </div>
              <div className="flex justify-between">
                <span>Bảo hiểm ({form.values.insurance_rate}%):</span>
                <span className="font-bold text-red-600">
                  -{formatNumber(form.values.insurance_amount)} đ
                </span>
              </div>
              <div className="flex justify-between text-lg border-t pt-2">
                <span className="font-bold">Thực nhận:</span>
                <span className="font-bold text-green-600">
                  {formatNumber(form.values.net_amount)} đ
                </span>
              </div>
            </div>

            <div className="col-span-2">
              <Input
                label="Ghi chú"
                placeholder="Nhập ghi chú (nếu có)"
                value={form.values.notes}
                onChange={(e) => form.handleChange('notes', e.target.value)}
                onBlur={() => form.handleBlur('notes')}
                error={form.errors.notes}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                createModal.close();
                editModal.close();
              }}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={form.isSubmitting}>
              {form.isSubmitting ? 'Đang lưu...' : (selectedPayment ? 'Cập nhật' : 'Tạo mới')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={viewModal.isOpen}
        onClose={viewModal.close}
        title="Chi tiết bản kê thanh toán"
        size="lg"
      >
        {selectedPayment && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Giảng viên</label>
                <div className="font-medium">{selectedPayment.lecturer?.hoTen}</div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Học kỳ</label>
                <div className="font-medium">{selectedPayment.semester_code}</div>
              </div>
              <div className="col-span-2">
                <label className="text-sm text-gray-600">Môn học</label>
                <div className="font-medium">{selectedPayment.subject_name}</div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Lớp</label>
                <div className="font-medium">{selectedPayment.class_name}</div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Số học viên</label>
                <div className="font-medium">{selectedPayment.student_count}</div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Số buổi lý thuyết</label>
                <div className="font-medium">{selectedPayment.theory_sessions}</div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Số buổi thực hành</label>
                <div className="font-medium">{selectedPayment.practical_sessions}</div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Tổng số buổi</label>
                <div className="font-medium">{selectedPayment.total_sessions}</div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Đơn giá/giờ</label>
                <div className="font-medium">{formatNumber(selectedPayment.hourly_rate)} đ</div>
              </div>

              <div className="col-span-2 p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Tổng tiền:</span>
                  <span className="font-bold text-blue-600">
                    {formatNumber(selectedPayment.total_amount)} đ
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Bảo hiểm ({selectedPayment.insurance_rate}%):</span>
                  <span className="font-bold text-red-600">
                    -{formatNumber(selectedPayment.insurance_amount)} đ
                  </span>
                </div>
                <div className="flex justify-between text-lg border-t pt-2">
                  <span className="font-bold">Thực nhận:</span>
                  <span className="font-bold text-green-600">
                    {formatNumber(selectedPayment.net_amount)} đ
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600">Trạng thái</label>
                <div>
                  <Badge variant={PAYMENT_STATUS_BADGE[selectedPayment.payment_status]}>
                    {PAYMENT_STATUS_LABELS[selectedPayment.payment_status]}
                  </Badge>
                </div>
              </div>

              {selectedPayment.payment_date && (
                <div>
                  <label className="text-sm text-gray-600">Ngày thanh toán</label>
                  <div className="font-medium">{selectedPayment.payment_date}</div>
                </div>
              )}

              {selectedPayment.notes && (
                <div className="col-span-2">
                  <label className="text-sm text-gray-600">Ghi chú</label>
                  <div className="font-medium">{selectedPayment.notes}</div>
                </div>
              )}

              {selectedPayment.rejection_reason && (
                <div className="col-span-2">
                  <label className="text-sm text-gray-600">Lý do từ chối</label>
                  <div className="font-medium text-red-600">{selectedPayment.rejection_reason}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="Xác nhận xóa"
      >
        <div className="space-y-4">
          <p>Bạn có chắc chắn muốn xóa bản kê thanh toán này không?</p>
          {selectedPayment && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="font-medium">{selectedPayment.lecturer?.hoTen}</div>
              <div className="text-sm text-gray-600">{selectedPayment.subject_name}</div>
              <div className="text-sm text-gray-600">{selectedPayment.semester_code}</div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={deleteModal.close}>
              Hủy
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              Xóa
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModal.isOpen}
        onClose={rejectModal.close}
        title="Từ chối thanh toán"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const reason = (form.elements.namedItem('reason') as HTMLTextAreaElement).value;
            handleRejectConfirm(reason);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lý do từ chối *
            </label>
            <textarea
              name="reason"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              placeholder="Nhập lý do từ chối..."
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={rejectModal.close}>
              Hủy
            </Button>
            <Button type="submit" variant="danger">
              Từ chối
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

