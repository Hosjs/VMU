import { useEffect, useMemo, useState } from 'react';
import { Card, Input, Select, Table, Badge, Pagination, Toast, Button } from '~/components/ui';
import type { ToastType } from '~/components/ui/Toast';
import { AcademicCapIcon, ArrowPathIcon, BanknotesIcon, ChartBarIcon, ClockIcon, FunnelIcon, InformationCircleIcon, MagnifyingGlassIcon, UsersIcon, XCircleIcon, CheckCircleIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { lecturerService } from '~/services/lecturer.service';
import { courseService } from '~/services/course.service';
import { majorService } from '~/services/major.service';
import { getTeachingPayments } from '~/services/teachingPaymentService';
import { getTeachingSchedules } from '~/services/teachingScheduleService';
import weeklyScheduleService from '~/services/weeklyScheduleService';
import type { Course } from '~/types/course';
import type { Major } from '~/types/major';
import type { TeachingPayment } from '~/types/teaching-payment';
import type { TeachingSchedule } from '~/types/teaching-schedule';
import type { WeeklySchedule } from '~/types/weekly-schedule';

type LecturerOption = {
  id: number;
  hoTen: string;
  trinhDoChuyenMon?: string;
  hocHam?: string;
};

type PaymentStatus = 'chua_tao' | 'chua_thanh_toan' | 'da_thanh_toan' | 'mot_phan' | 'da_duyet';

type SubjectReport = {
  id: string;
  subjectName: string;
  lecturerKey: string;
  lecturerName: string;
  credits: number;
  scheduleCount: number;
  weeklySessions: number;
  absenceSessions: number;
  paymentRows: number;
  paymentStatus: PaymentStatus;
  scheduleStatus: 'co_lich' | 'chua_co_lich';
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
};

type LecturerReport = {
  key: string;
  lecturerId?: number;
  lecturerName: string;
  lecturerTitle: string;
  totalSubjects: number;
  scheduledSubjects: number;
  teachingSessions: number;
  absenceSessions: number;
  paymentRows: number;
  paidSubjects: number;
  unpaidSubjects: number;
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
  subjects: SubjectReport[];
};

type LecturerAccumulator = LecturerReport & {
  subjectsMap: Map<string, SubjectReport>;
};

const EMPTY_TEXT = '--';
const ABSENCE_KEYWORDS = ['nghỉ', 'vắng', 'hoãn', 'ngưng', 'tạm nghỉ', 'tạm hoãn', 'cancel', 'hủy', 'không dạy', 'no class'];

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

const normalizeText = (value?: string | null): string =>
  (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

const getStatusLabel = (status: PaymentStatus): string => {
  switch (status) {
    case 'chua_tao':
      return 'Chưa tạo';
    case 'chua_thanh_toan':
      return 'Chưa thanh toán';
    case 'da_thanh_toan':
      return 'Đã thanh toán';
    case 'mot_phan':
      return 'Thanh toán một phần';
    case 'da_duyet':
      return 'Đã duyệt';
    default:
      return 'Không xác định';
  }
};

const getStatusVariant = (status: PaymentStatus): 'success' | 'warning' | 'info' | 'default' | 'danger' => {
  switch (status) {
    case 'da_thanh_toan':
      return 'success';
    case 'chua_thanh_toan':
      return 'warning';
    case 'mot_phan':
      return 'info';
    case 'da_duyet':
      return 'default';
    case 'chua_tao':
    default:
      return 'default';
  }
};

const getScheduleStatusLabel = (status: 'co_lich' | 'chua_co_lich'): string =>
  status === 'co_lich' ? 'Đã xếp lịch' : 'Chưa xếp lịch';

const getScheduleStatusVariant = (status: 'co_lich' | 'chua_co_lich'): 'success' | 'default' =>
  status === 'co_lich' ? 'success' : 'default';

const buildLecturerTitle = (lecturer?: LecturerOption): string => {
  if (!lecturer) return '';

  const parts = [lecturer.hocHam?.trim(), lecturer.trinhDoChuyenMon?.trim()].filter(Boolean);
  return parts.join(' - ');
};

const isAbsenceSchedule = (schedule: WeeklySchedule): boolean => {
  const content = [schedule.subject_name, schedule.time_slot, schedule.room, schedule.ghi_chu]
    .map((item) => normalizeText(item))
    .join(' ');

  if (!content) return false;
  return ABSENCE_KEYWORDS.some((keyword) => content.includes(normalizeText(keyword)));
};

const matchLecturer = (
  lecturersById: Map<number, LecturerOption>,
  lecturers: LecturerOption[],
  lecturerName?: string | null,
  lecturerId?: number | null,
): { key: string; displayName: string; title: string; lecturerId?: number } => {
  if (lecturerId && lecturersById.has(lecturerId)) {
    const lecturer = lecturersById.get(lecturerId)!;
    return {
      key: `id:${lecturer.id}`,
      displayName: lecturer.hoTen,
      title: buildLecturerTitle(lecturer),
      lecturerId: lecturer.id,
    };
  }

  const normalizedName = normalizeText(lecturerName);
  const matched = lecturers.find((lecturer) => {
    const candidate = normalizeText(lecturer.hoTen);
    return candidate === normalizedName || candidate.includes(normalizedName) || normalizedName.includes(candidate);
  });

  if (matched) {
    return {
      key: `id:${matched.id}`,
      displayName: matched.hoTen,
      title: buildLecturerTitle(matched),
      lecturerId: matched.id,
    };
  }

  const fallbackName = (lecturerName ?? '').trim() || 'Chưa xác định';
  const fallbackKey = normalizedName ? `name:${normalizedName}` : 'name:unknown';

  return {
    key: fallbackKey,
    displayName: fallbackName,
    title: '',
  };
};

const getPaymentStatus = (subject: SubjectReport): PaymentStatus => {
  if (subject.paymentRows === 0) return 'chua_tao';
  if (subject.paymentRows > 0 && subject.paidAmount > 0 && subject.unpaidAmount > 0) return 'mot_phan';
  if (subject.paymentRows > 0 && subject.paidAmount > 0 && subject.unpaidAmount === 0) return 'da_thanh_toan';
  if (subject.paymentRows > 0 && subject.paidAmount === 0 && subject.unpaidAmount > 0) return 'chua_thanh_toan';
  return 'chua_tao';
};

const buildReport = ({
  lecturers,
  payments,
  teachingSchedules,
  weeklySchedules,
  selectedMajorId,
}: {
  lecturers: LecturerOption[];
  payments: TeachingPayment[];
  teachingSchedules: TeachingSchedule[];
  weeklySchedules: WeeklySchedule[];
  selectedMajorId: number | '';
}): LecturerReport[] => {
  const lecturersById = new Map<number, LecturerOption>(lecturers.map((lecturer) => [lecturer.id, lecturer]));
  const reportMap = new Map<string, LecturerAccumulator>();

  const ensureReport = (meta: { key: string; displayName: string; title: string; lecturerId?: number }) => {
    if (!reportMap.has(meta.key)) {
      reportMap.set(meta.key, {
        key: meta.key,
        lecturerId: meta.lecturerId,
        lecturerName: meta.displayName,
        lecturerTitle: meta.title,
        totalSubjects: 0,
        scheduledSubjects: 0,
        teachingSessions: 0,
        absenceSessions: 0,
        paymentRows: 0,
        paidSubjects: 0,
        unpaidSubjects: 0,
        totalAmount: 0,
        paidAmount: 0,
        unpaidAmount: 0,
        subjects: [],
        subjectsMap: new Map<string, SubjectReport>(),
      });
    }

    const report = reportMap.get(meta.key)!;
    if (meta.displayName && report.lecturerName === 'Chưa xác định') {
      report.lecturerName = meta.displayName;
    }
    if (meta.title && !report.lecturerTitle) {
      report.lecturerTitle = meta.title;
    }
    if (meta.lecturerId && !report.lecturerId) {
      report.lecturerId = meta.lecturerId;
    }

    return report;
  };

  const ensureSubject = (report: LecturerAccumulator, subjectName: string) => {
    const normalizedSubject = normalizeText(subjectName) || 'khong-ro-mon-hoc';
    const subjectKey = `${report.key}::${normalizedSubject}`;

    if (!report.subjectsMap.has(subjectKey)) {
      report.subjectsMap.set(subjectKey, {
        id: subjectKey,
        subjectName: subjectName || 'Không rõ môn học',
        lecturerKey: report.key,
        lecturerName: report.lecturerName,
        credits: 0,
        scheduleCount: 0,
        weeklySessions: 0,
        absenceSessions: 0,
        paymentRows: 0,
        paymentStatus: 'chua_tao',
        scheduleStatus: 'chua_co_lich',
        totalAmount: 0,
        paidAmount: 0,
        unpaidAmount: 0,
      });
    }

    return report.subjectsMap.get(subjectKey)!;
  };

  // Teaching schedules: đánh dấu môn đã xếp lịch theo giảng viên
  teachingSchedules.forEach((schedule) => {
    if (Number(schedule.so_tin_chi) === 0) return;

    const lecturerMeta = matchLecturer(lecturersById, lecturers, schedule.can_bo_giang_day);
    const report = ensureReport(lecturerMeta);
    const subject = ensureSubject(report, schedule.ten_hoc_phan);

    subject.scheduleCount += 1;
    subject.scheduleStatus = 'co_lich';
    subject.credits = subject.credits || Number(schedule.so_tin_chi) || 0;
  });

  // Payments: tổng hợp trạng thái môn học và số tiền phải thanh toán
  payments.forEach((payment) => {
    const lecturerMeta = matchLecturer(lecturersById, lecturers, payment.ho_ten_giang_vien || payment.can_bo_giang_day, payment.lecturer_id ?? null);
    const report = ensureReport(lecturerMeta);
    const subject = ensureSubject(report, payment.ten_hoc_phan);

    const status = String(payment.trang_thai_thanh_toan || '') as PaymentStatus;
    const amount = Number(payment.thuc_nhan || payment.thanh_tien_chua_thue || 0);

    subject.paymentRows += 1;
    subject.totalAmount += amount;
    if (status === 'da_thanh_toan' || status === 'da_duyet') {
      subject.paidAmount += amount;
    } else {
      subject.unpaidAmount += amount;
    }
    subject.paymentStatus = getPaymentStatus(subject);
    subject.credits = subject.credits || Number(payment.so_tin_chi) || 0;

    report.paymentRows += 1;
  });

  // Weekly schedules: đếm số buổi dạy / buổi nghỉ ước tính
  weeklySchedules.forEach((schedule) => {
    if (selectedMajorId && schedule.class?.major?.id && schedule.class.major.id !== selectedMajorId) {
      return;
    }

    const lecturerMeta = matchLecturer(
      lecturersById,
      lecturers,
      schedule.lecturer?.hoTen || schedule.lecturer_name,
      schedule.lecturer?.id ?? schedule.lecturer_id ?? null,
    );

    const report = ensureReport(lecturerMeta);
    const subject = ensureSubject(report, schedule.subject_name || schedule.ghi_chu || 'Không rõ môn học');
    const isAbsence = isAbsenceSchedule(schedule);

    if (isAbsence) {
      subject.absenceSessions += 1;
      report.absenceSessions += 1;
    } else {
      subject.weeklySessions += 1;
      report.teachingSessions += 1;
    }

    if (schedule.subject?.tenMonHoc && subject.subjectName === 'Không rõ môn học') {
      subject.subjectName = schedule.subject.tenMonHoc;
    }
  });

  const reports = Array.from(reportMap.values()).map((report) => {
    const subjects = Array.from(report.subjectsMap.values()).sort((a, b) => {
      const amountDiff = b.totalAmount - a.totalAmount;
      if (amountDiff !== 0) return amountDiff;
      return a.subjectName.localeCompare(b.subjectName);
    });

    const totalSubjects = subjects.length;
    const scheduledSubjects = subjects.filter((subject) => subject.scheduleCount > 0).length;
    const paidSubjects = subjects.filter((subject) => subject.paymentStatus === 'da_thanh_toan').length;
    const unpaidSubjects = subjects.filter((subject) => subject.paymentStatus === 'chua_thanh_toan' || subject.paymentStatus === 'chua_tao' || subject.paymentStatus === 'mot_phan').length;
    const totalAmount = subjects.reduce((sum, subject) => sum + subject.totalAmount, 0);
    const paidAmount = subjects.reduce((sum, subject) => sum + subject.paidAmount, 0);
    const unpaidAmount = subjects.reduce((sum, subject) => sum + subject.unpaidAmount, 0);
    const teachingSessions = subjects.reduce((sum, subject) => sum + subject.weeklySessions, 0);
    const absenceSessions = subjects.reduce((sum, subject) => sum + subject.absenceSessions, 0);

    return {
      key: report.key,
      lecturerId: report.lecturerId,
      lecturerName: report.lecturerName,
      lecturerTitle: report.lecturerTitle,
      totalSubjects,
      scheduledSubjects,
      teachingSessions,
      absenceSessions,
      paymentRows: report.paymentRows,
      paidSubjects,
      unpaidSubjects,
      totalAmount,
      paidAmount,
      unpaidAmount,
      subjects,
    } as LecturerReport;
  });

  return reports.sort((a, b) => {
    const amountDiff = b.unpaidAmount - a.unpaidAmount;
    if (amountDiff !== 0) return amountDiff;
    const sessionDiff = b.teachingSessions - a.teachingSessions;
    if (sessionDiff !== 0) return sessionDiff;
    return a.lecturerName.localeCompare(b.lecturerName);
  });
};

export function meta() {
  return [
    { title: 'Báo cáo thống kê giảng viên - VMU Training' },
    { name: 'description', content: 'Thống kê buổi dạy, buổi nghỉ, trạng thái môn học và thanh toán giảng viên' },
  ];
}

export default function ReportsPage() {
  const [lecturers, setLecturers] = useState<LecturerOption[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [teachingPayments, setTeachingPayments] = useState<TeachingPayment[]>([]);
  const [teachingSchedules, setTeachingSchedules] = useState<TeachingSchedule[]>([]);
  const [weeklySchedules, setWeeklySchedules] = useState<WeeklySchedule[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | ''>('');
  const [selectedMajor, setSelectedMajor] = useState<number | ''>('');
  const [semesterCode, setSemesterCode] = useState<string>('');
  const [selectedLecturerKey, setSelectedLecturerKey] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string>('');

  useEffect(() => {
    loadLookupData();
  }, []);

  useEffect(() => {
    if (!selectedCourse || !selectedMajor) {
      setSemesterCode('');
      return;
    }

    const course = courses.find((item) => item.id === selectedCourse);
    const major = majors.find((item) => item.id === selectedMajor);

    if (course && major) {
      setSemesterCode(`${major.maNganh} ${course.ma_khoa_hoc}`.trim());
    }
  }, [selectedCourse, selectedMajor, courses, majors]);

  useEffect(() => {
    if (!selectedCourse || !selectedMajor || !semesterCode) return;
    void loadReportData();
  }, [selectedCourse, selectedMajor, semesterCode]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedLecturerKey, perPage, selectedCourse, selectedMajor]);

  const loadLookupData = async () => {
    try {
      setIsLoading(true);
      const [lecturerData, courseData, majorResponse] = await Promise.all([
        lecturerService.getSimpleLecturers(),
        courseService.getSimpleCourses(),
        majorService.getMajors({ page: 1, per_page: 1000 }),
      ]);

      const sortedLecturers = [...(lecturerData || [])].sort((a, b) => a.hoTen.localeCompare(b.hoTen));
      const sortedCourses = [...(courseData || [])].sort((a, b) => {
        const yearDiff = (b.nam_hoc || 0) - (a.nam_hoc || 0);
        if (yearDiff !== 0) return yearDiff;
        const dotDiff = (b.dot || 0) - (a.dot || 0);
        if (dotDiff !== 0) return dotDiff;
        return String(b.ma_khoa_hoc || '').localeCompare(String(a.ma_khoa_hoc || ''));
      });
      const sortedMajors = [...(majorResponse.data || [])].sort((a, b) => {
        const codeDiff = String(a.maNganh || '').localeCompare(String(b.maNganh || ''));
        if (codeDiff !== 0) return codeDiff;
        return String(a.tenNganh || '').localeCompare(String(b.tenNganh || ''));
      });

      setLecturers(sortedLecturers);
      setCourses(sortedCourses);
      setMajors(sortedMajors);

      if (!selectedCourse && sortedCourses.length > 0) {
        setSelectedCourse(sortedCourses[0].id);
      }

      if (!selectedMajor && sortedMajors.length > 0) {
        setSelectedMajor(sortedMajors[0].id);
      }
    } catch (error) {
      setToast({ message: 'Không thể tải danh mục phục vụ báo cáo', type: 'error' });
      setLecturers([]);
      setCourses([]);
      setMajors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadReportData = async () => {
    try {
      setIsLoading(true);
      const [payments, schedules, weeks] = await Promise.all([
        getTeachingPayments({
          major_id: Number(selectedMajor),
          khoa_hoc_id: Number(selectedCourse),
          semester_code: semesterCode,
        }),
        getTeachingSchedules({
          major_id: Number(selectedMajor),
          khoa_hoc_id: Number(selectedCourse),
          semester_code: semesterCode,
        }),
        weeklyScheduleService.getAll({ khoa_hoc_id: Number(selectedCourse) }),
      ]);

      setTeachingPayments(payments || []);
      setTeachingSchedules(schedules || []);
      setWeeklySchedules(weeks || []);
      setLastUpdatedAt(new Date().toLocaleString('vi-VN'));
    } catch (error) {
      setToast({ message: 'Không thể tải dữ liệu báo cáo', type: 'error' });
      setTeachingPayments([]);
      setTeachingSchedules([]);
      setWeeklySchedules([]);
    } finally {
      setIsLoading(false);
    }
  };

  const reportRows = useMemo(() => {
    return buildReport({
      lecturers,
      payments: teachingPayments,
      teachingSchedules,
      weeklySchedules,
      selectedMajorId: selectedMajor,
    });
  }, [lecturers, teachingPayments, teachingSchedules, weeklySchedules, selectedMajor]);

  const filteredRows = useMemo(() => {
    let rows = [...reportRows];

    if (selectedLecturerKey) {
      rows = rows.filter((row) => row.key === selectedLecturerKey);
    }

    const query = normalizeText(searchQuery);
    if (query) {
      rows = rows.filter((row) => {
        return (
          normalizeText(row.lecturerName).includes(query) ||
          normalizeText(row.lecturerTitle).includes(query) ||
          row.subjects.some((subject) => normalizeText(subject.subjectName).includes(query))
        );
      });
    }

    return rows;
  }, [reportRows, selectedLecturerKey, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / perPage));
  const pagedRows = filteredRows.slice((page - 1) * perPage, page * perPage);

  const activeReport = useMemo(() => {
    if (selectedLecturerKey) {
      return filteredRows.find((row) => row.key === selectedLecturerKey) || null;
    }

    return filteredRows[0] || null;
  }, [filteredRows, selectedLecturerKey]);

  const totalStats = useMemo(() => {
    return filteredRows.reduce(
      (acc, row) => ({
        lecturers: acc.lecturers + 1,
        teachingSessions: acc.teachingSessions + row.teachingSessions,
        absenceSessions: acc.absenceSessions + row.absenceSessions,
        paidAmount: acc.paidAmount + row.paidAmount,
        unpaidAmount: acc.unpaidAmount + row.unpaidAmount,
        totalAmount: acc.totalAmount + row.totalAmount,
        paidSubjects: acc.paidSubjects + row.paidSubjects,
        unpaidSubjects: acc.unpaidSubjects + row.unpaidSubjects,
      }),
      {
        lecturers: 0,
        teachingSessions: 0,
        absenceSessions: 0,
        paidAmount: 0,
        unpaidAmount: 0,
        totalAmount: 0,
        paidSubjects: 0,
        unpaidSubjects: 0,
      },
    );
  }, [filteredRows]);

  const lecturerOptions = useMemo(() => {
    return [
      { value: '', label: 'Tất cả giảng viên' },
      ...reportRows.map((row) => ({
        value: row.key,
        label: row.lecturerTitle ? `${row.lecturerName} • ${row.lecturerTitle}` : row.lecturerName,
      })),
    ];
  }, [reportRows]);

  const detailSubjectColumns = useMemo(
    () => [
      {
        key: 'subjectName',
        label: 'Môn học',
        render: (subject: SubjectReport) => (
          <div>
            <div className="font-medium text-gray-900">{subject.subjectName}</div>
            <div className="text-xs text-gray-500">{subject.lecturerName}</div>
          </div>
        ),
      },
      {
        key: 'scheduleCount',
        label: 'Số buổi',
        render: (subject: SubjectReport) => <Badge variant="info">{subject.weeklySessions}</Badge>,
      },
      {
        key: 'absenceSessions',
        label: 'Buổi nghỉ',
        render: (subject: SubjectReport) => (
          <Badge variant={subject.absenceSessions > 0 ? 'warning' : 'default'}>{subject.absenceSessions}</Badge>
        ),
      },
      {
        key: 'credits',
        label: 'Tín chỉ',
        render: (subject: SubjectReport) => <Badge variant="info">{subject.credits || 0}</Badge>,
      },
      {
        key: 'scheduleStatus',
        label: 'Trạng thái môn học',
        render: (subject: SubjectReport) => (
          <Badge variant={getScheduleStatusVariant(subject.scheduleStatus)}>{getScheduleStatusLabel(subject.scheduleStatus)}</Badge>
        ),
      },
      {
        key: 'paymentStatus',
        label: 'Thanh toán',
        render: (subject: SubjectReport) => (
          <Badge variant={getStatusVariant(subject.paymentStatus)}>{getStatusLabel(subject.paymentStatus)}</Badge>
        ),
      },
      {
        key: 'unpaidAmount',
        label: 'Cần thanh toán',
        render: (subject: SubjectReport) => (
          <div className="text-right">
            <div className="font-semibold text-gray-900">{formatCurrency(subject.unpaidAmount || 0)}</div>
            <div className="text-xs text-gray-500">Đã trả: {formatCurrency(subject.paidAmount || 0)}</div>
          </div>
        ),
      },
    ],
    [],
  );

  const lecturerColumns = useMemo(
    () => [
      {
        key: 'lecturerName',
        label: 'Giảng viên',
        render: (row: LecturerReport) => (
          <div>
            <div className="font-semibold text-gray-900">{row.lecturerName}</div>
            <div className="text-xs text-gray-500">{row.lecturerTitle || 'Chưa có học hàm / trình độ'}</div>
          </div>
        ),
      },
      {
        key: 'totalSubjects',
        label: 'Môn',
        render: (row: LecturerReport) => <Badge variant="info">{row.totalSubjects}</Badge>,
      },
      {
        key: 'teachingSessions',
        label: 'Buổi dạy',
        render: (row: LecturerReport) => <Badge variant="success">{row.teachingSessions}</Badge>,
      },
      {
        key: 'absenceSessions',
        label: 'Buổi nghỉ',
        render: (row: LecturerReport) => <Badge variant={row.absenceSessions > 0 ? 'warning' : 'default'}>{row.absenceSessions}</Badge>,
      },
      {
        key: 'unpaidAmount',
        label: 'Cần thanh toán',
        render: (row: LecturerReport) => (
          <div>
            <div className="font-semibold text-gray-900">{formatCurrency(row.unpaidAmount || 0)}</div>
            <div className="text-xs text-gray-500">Đã thanh toán: {formatCurrency(row.paidAmount || 0)}</div>
          </div>
        ),
      },
      {
        key: 'status',
        label: 'Trạng thái',
        render: (row: LecturerReport) => {
          const label = row.unpaidAmount === 0 ? 'Đã hoàn tất' : row.paidAmount > 0 ? 'Thanh toán một phần' : 'Còn công nợ';
          const variant = row.unpaidAmount === 0 ? 'success' : row.paidAmount > 0 ? 'info' : 'warning';
          return <Badge variant={variant as 'success' | 'info' | 'warning'}>{label}</Badge>;
        },
      },
    ],
    [],
  );

  const handleRefresh = async () => {
    await loadReportData();
  };

  const isReady = selectedCourse && selectedMajor && semesterCode;

  if (isLoading && lecturers.length === 0 && reportRows.length === 0) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-gray-600">Đang tải dữ liệu báo cáo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600">
            <ChartBarIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Báo cáo thống kê giảng viên</h1>
            <p className="text-sm text-gray-500">Theo dõi buổi dạy, buổi nghỉ, trạng thái môn học và công nợ thanh toán</p>
          </div>
        </div>

        <Button variant="secondary" size="sm" onClick={handleRefresh} leftIcon={<ArrowPathIcon className="h-4 w-4" />}>
          Tải lại dữ liệu
        </Button>
      </div>

      <Card>
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2 text-gray-700 font-semibold">
            <FunnelIcon className="h-5 w-5" />
            <span>Bộ lọc báo cáo</span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Select
              label="Bậc đào tạo"
              value={selectedMajor}
              onChange={(e) => {
                setSelectedLecturerKey('');
                setSelectedMajor(e.target.value ? Number(e.target.value) : '');
              }}
              options={majors.map((major) => ({ value: major.id, label: `${major.maNganh} - ${major.tenNganh}` }))}
            />

            <Select
              label="Khóa học"
              value={selectedCourse}
              onChange={(e) => {
                setSelectedLecturerKey('');
                setSelectedCourse(e.target.value ? Number(e.target.value) : '');
              }}
              options={courses.map((course) => ({ value: course.id, label: `${course.ma_khoa_hoc} • ${course.nam_hoc} • Đợt ${course.dot}` }))}
            />

            <Input label="Mã kỳ học" value={semesterCode} disabled helperText="Tự động sinh từ mã ngành và mã khóa học" />

            <Select
              label="Giảng viên"
              value={selectedLecturerKey}
              onChange={(e) => setSelectedLecturerKey(e.target.value)}
              options={lecturerOptions}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm báo cáo</label>
              <MagnifyingGlassIcon className="absolute left-3 top-10 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Tìm theo tên giảng viên hoặc tên môn học..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800 flex items-start gap-3">
              <InformationCircleIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <p>
                Buổi nghỉ được <span className="font-semibold">ước tính</span> từ lịch tuần có ghi chú chứa từ khóa như "nghỉ", "vắng", "hoãn". 
                Nếu dữ liệu lịch chưa ghi rõ, số buổi nghỉ sẽ hiển thị bằng 0.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-gray-500">
              <span className="font-medium text-gray-700">Cập nhật lần cuối:</span> {lastUpdatedAt || 'Chưa có'}
              {!isReady && <span className="ml-2 text-amber-600">Vui lòng chọn đủ ngành và khóa học để tải dữ liệu.</span>}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <DocumentTextIcon className="h-4 w-4" />
              <span>Trang này dùng dữ liệu có sẵn từ lịch giảng, lịch tuần và thanh toán.</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Giảng viên có dữ liệu</p>
              <h3 className="mt-2 text-2xl font-bold text-gray-900">{totalStats.lecturers}</h3>
            </div>
            <UsersIcon className="h-10 w-10 text-blue-500" />
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Buổi dạy</p>
              <h3 className="mt-2 text-2xl font-bold text-gray-900">{totalStats.teachingSessions}</h3>
            </div>
            <AcademicCapIcon className="h-10 w-10 text-green-500" />
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Buổi nghỉ ước tính</p>
              <h3 className="mt-2 text-2xl font-bold text-gray-900">{totalStats.absenceSessions}</h3>
            </div>
            <ClockIcon className="h-10 w-10 text-amber-500" />
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Đã thanh toán</p>
              <h3 className="mt-2 text-2xl font-bold text-gray-900">{formatCurrency(totalStats.paidAmount)}</h3>
            </div>
            <CheckCircleIcon className="h-10 w-10 text-emerald-500" />
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Cần thanh toán</p>
              <h3 className="mt-2 text-2xl font-bold text-gray-900">{formatCurrency(totalStats.unpaidAmount)}</h3>
            </div>
            <BanknotesIcon className="h-10 w-10 text-red-500" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Tổng hợp theo giảng viên</h2>
                <p className="text-sm text-gray-500">Số buổi dạy, buổi nghỉ, trạng thái môn học và công nợ thanh toán</p>
              </div>
              <Badge variant="info">{filteredRows.length} giảng viên</Badge>
            </div>

            <Table
              data={pagedRows}
              columns={lecturerColumns}
              keyExtractor={(item) => item.key}
              isLoading={isLoading}
              emptyMessage="Không có dữ liệu báo cáo phù hợp"
            />

            {filteredRows.length > 0 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                perPage={perPage}
                onPerPageChange={(value) => setPerPage(value)}
                total={filteredRows.length}
              />
            )}
          </div>
        </Card>

        <Card>
          <div className="p-4 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Chi tiết giảng viên</h2>
              <p className="text-sm text-gray-500">
                {activeReport ? activeReport.lecturerName : 'Chưa có dữ liệu phù hợp'}
              </p>
            </div>

            {activeReport ? (
              <div className="space-y-4">
                <div className="rounded-xl bg-gray-50 p-4 space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Họ tên</p>
                    <p className="font-semibold text-gray-900">{activeReport.lecturerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Học hàm / trình độ</p>
                    <p className="font-semibold text-gray-900">{activeReport.lecturerTitle || EMPTY_TEXT}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-white p-3 border border-gray-200">
                      <p className="text-xs text-gray-500">Buổi dạy</p>
                      <p className="mt-1 text-lg font-bold text-green-600">{activeReport.teachingSessions}</p>
                    </div>
                    <div className="rounded-lg bg-white p-3 border border-gray-200">
                      <p className="text-xs text-gray-500">Buổi nghỉ</p>
                      <p className="mt-1 text-lg font-bold text-amber-600">{activeReport.absenceSessions}</p>
                    </div>
                    <div className="rounded-lg bg-white p-3 border border-gray-200">
                      <p className="text-xs text-gray-500">Môn học</p>
                      <p className="mt-1 text-lg font-bold text-blue-600">{activeReport.totalSubjects}</p>
                    </div>
                    <div className="rounded-lg bg-white p-3 border border-gray-200">
                      <p className="text-xs text-gray-500">Còn phải thanh toán</p>
                      <p className="mt-1 text-lg font-bold text-red-600">{formatCurrency(activeReport.unpaidAmount || 0)}</p>
                    </div>
                  </div>

                  <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
                    <div className="flex items-start gap-2">
                      <InformationCircleIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <p>
                        {activeReport.paidAmount > 0
                          ? 'Giảng viên này đã có dữ liệu thanh toán trong hệ thống.'
                          : 'Giảng viên này chưa có khoản thanh toán hoàn tất trong kỳ đang lọc.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-semibold text-gray-900 mb-2">Các môn phụ trách</h3>
                  <Table
                    data={activeReport.subjects}
                    columns={detailSubjectColumns}
                    keyExtractor={(item) => item.id}
                    isLoading={isLoading}
                    emptyMessage="Chưa có môn học nào trong kỳ này"
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-gray-500">
                <XCircleIcon className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                <p>Chưa có dữ liệu phù hợp để hiển thị chi tiết.</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}