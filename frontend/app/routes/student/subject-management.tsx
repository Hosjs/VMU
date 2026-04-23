import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Subject } from '~/types/subject';
import { TrangThaiHocVien, type Student } from '~/types/student';
import {
  AcademicCapIcon,
  FunnelIcon,
  UserGroupIcon,
  ArrowPathIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { Button, Input, Table, Badge, Card, Pagination, Modal, Toast, Select } from '~/components/ui';
import type { ToastType } from '~/components/ui/Toast';

const EXTERNAL_API_BASE = import.meta.env.VITE_LOPHOC_API_BASE || '/lop-hoc-api/LopHoc';

type ProgramType = 'ThacSy' | 'TienSy';

type ExternalClass = Subject & {
  programType: ProgramType;
  classId: number;
};

type JsonRecord = Record<string, unknown>;

const EMPTY_TEXT = '--';

export function meta() {
  return [
    { title: 'Quản lý môn học - VMU Training' },
    { name: 'description', content: 'Đọc dữ liệu lớp và học viên từ API ngoài' },
  ];
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null;
}

function asNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asString(value: unknown, fallback = ''): string {
  if (value === null || value === undefined) return fallback;
  return String(value).trim();
}

function pick(obj: JsonRecord, keys: string[]): unknown {
  for (const key of keys) {
    if (key in obj) return obj[key];
  }
  return undefined;
}

function toRecords(payload: unknown): JsonRecord[] {
  if (Array.isArray(payload)) {
    return payload.filter(isRecord);
  }

  if (!isRecord(payload)) return [];

  const candidateKeys = ['data', 'Data', 'result', 'Result', 'items', 'Items', 'value', 'Value'];
  for (const key of candidateKeys) {
    const value = payload[key];
    if (Array.isArray(value)) {
      return value.filter(isRecord);
    }
  }

  return [];
}

async function fetchExternal(path: string): Promise<JsonRecord[]> {
  const response = await fetch(`${EXTERNAL_API_BASE}/${path}`);
  if (!response.ok) {
    throw new Error(`API ${path} lỗi: ${response.status}`);
  }

  const payload: unknown = await response.json();
  return toRecords(payload);
}

function mapClassToSubject(item: JsonRecord, index: number, programType: ProgramType): ExternalClass {
  const rawClassId = pick(item, ['id', 'ID']);
  const classId = asNumber(rawClassId, 0);
  const maLop = asString(pick(item, ['maLop', 'MaLop', 'code', 'Code']), `LOP-${classId}`);
  const tenLop = asString(
    pick(item, ['tenLop', 'TenLop', 'tenMon', 'TenMon', 'name', 'Name']),
    `Lớp ${classId}`,
  );
  const soTinChi = asNumber(pick(item, ['soTinChi', 'SoTinChi', 'tinChi']), 0);
  const enrolledCount = asNumber(
    pick(item, [
      'siSo',
      'SiSo',
      'siso',
      'Siso',
      'si_so',
      'soHocVien',
      'SoHocVien',
      'sohocvien',
      'soLuongHocVien',
      'SoLuongHocVien',
      'slHocVien',
      'SLHocVien',
      'enrolled_students_count',
    ]),
    0,
  );

  return {
    id: classId,
    classId,
    programType,
    maMon: maLop,
    tenMon: tenLop,
    soTinChi,
    moTa: asString(pick(item, ['ghiChu', 'GhiChu', 'moTa', 'MoTa']), ''),
    enrolled_students_count: enrolledCount,
  };
}

function splitName(fullName: string): { hoDem: string; ten: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { hoDem: '', ten: '' };
  if (parts.length === 1) return { hoDem: '', ten: parts[0] };
  return { hoDem: parts.slice(0, -1).join(' '), ten: parts[parts.length - 1] };
}

function mapStudent(item: JsonRecord, index: number, lopId: number): Student {
  const maHV = asString(pick(item, ['mahv', 'maHV', 'MaHV', 'maHocVien', 'MaHocVien']), EMPTY_TEXT);
  const fullName = asString(
    pick(item, ['hoTen', 'HoTen', 'tenHocVien', 'TenHocVien', 'name', 'Name']),
    '',
  );
  const nameParts = splitName(fullName);

  const hoDem = asString(pick(item, ['hodem', 'hoDem', 'HoDem']), nameParts.hoDem || EMPTY_TEXT);
  const ten = asString(pick(item, ['ten', 'Ten']), nameParts.ten || EMPTY_TEXT);

  return {
    maHV,
    hoDem,
    ten,
    ngaySinh: asString(pick(item, ['ngaysinh', 'ngaySinh', 'NgaySinh']), ''),
    noiSinh: asString(pick(item, ['noisinh', 'noiSinh', 'NoiSinh']), ''),
    gioiTinh: asString(pick(item, ['gioitinh', 'gioiTinh', 'GioiTinh']), EMPTY_TEXT),
    soGiayToTuyThan: asString(pick(item, ['socmnd', 'soCMND', 'soGiayToTuyThan', 'SoGiayToTuyThan']), ''),
    dienThoai: asString(pick(item, ['dienthoai', 'dienThoai', 'DienThoai', 'soDienThoai', 'SoDienThoai']), EMPTY_TEXT),
    email: asString(pick(item, ['email', 'Email']), EMPTY_TEXT),
    quocTich: asString(pick(item, ['quocTich', 'QuocTich']), ''),
    danToc: asString(pick(item, ['danToc', 'DanToc']), ''),
    tonGiao: asString(pick(item, ['tonGiao', 'TonGiao']), ''),
    maTrinhDoDaoTao: asString(pick(item, ['maTrinhDoDaoTao', 'MaTrinhDoDaoTao']), ''),
    maNganh: asString(pick(item, ['maNganh', 'MaNganh']), ''),
    trangThai: TrangThaiHocVien.DangHoc,
    ngayNhapHoc: asString(pick(item, ['ngayNhapHoc', 'NgayNhapHoc']), ''),
    namVaoTruong: asNumber(pick(item, ['namVaoTruong', 'NamVaoTruong', 'namVaotruong']), 0),
    idLop: lopId,
    nganhHoc: asString(pick(item, ['nganhHoc', 'NganhHoc']), ''),
    trangThaiHoc: asString(pick(item, ['trangThaiHoc', 'TrangThaiHoc']), ''),
    namVaotruong: asNumber(pick(item, ['namVaotruong']), 0),
  };
}

async function enrichStudentCounts(classes: ExternalClass[]): Promise<ExternalClass[]> {
  const updated = await Promise.all(
    classes.map(async (cls) => {
      if (!cls.classId || (cls.enrolled_students_count ?? 0) > 0) return cls;

      try {
        const studentRecords = await fetchExternal(`HocVien?LopID=${cls.classId}`);
        return {
          ...cls,
          enrolled_students_count: studentRecords.length,
        };
      } catch {
        return cls;
      }
    }),
  );

  return updated;
}

export default function SubjectManagement() {
  const currentYear = new Date().getFullYear();
  const [programType, setProgramType] = useState<ProgramType>('ThacSy');
  const [admissionYear, setAdmissionYear] = useState<number>(programType === 'ThacSy' ? 2024 : 2023);
  const [subjects, setSubjects] = useState<ExternalClass[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<ExternalClass | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [searchSubject, setSearchSubject] = useState('');
  const [searchStudent, setSearchStudent] = useState('');
  const [studentPage, setStudentPage] = useState(1);
  const [studentPerPage, setStudentPerPage] = useState(10);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);

  const loadSubjects = useCallback(async () => {
    setIsLoadingSubjects(true);
    try {
      const records = await fetchExternal(`${programType}?NamVao=${admissionYear}`);
      const mapped = records.map((item, index) => mapClassToSubject(item, index, programType));
      const mappedWithCounts = await enrichStudentCounts(mapped);

      const dedupedById = new Map<number, ExternalClass>();
      for (const item of mappedWithCounts) {
        dedupedById.set(item.classId, item);
      }

      setSubjects(Array.from(dedupedById.values()));
    } catch (error) {
      setToast({ message: 'Không thể tải dữ liệu lớp từ API ngoài', type: 'error' });
      setSubjects([]);
    } finally {
      setIsLoadingSubjects(false);
    }
  }, [programType, admissionYear]);

  const loadStudentsByClassId = useCallback(async (lopId: number) => {
    setIsLoadingStudents(true);
    try {
      const studentRecords = await fetchExternal(`HocVien?LopID=${lopId}`);

      const mappedStudents = studentRecords.map((item, index) => mapStudent(item, index, lopId));
      setStudents(mappedStudents);
    } catch (error) {
      setToast({ message: 'Không thể tải danh sách học viên từ API ngoài', type: 'error' });
      setStudents([]);
    } finally {
      setIsLoadingStudents(false);
    }
  }, []);

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  const handleViewStudents = async (subject: ExternalClass) => {
    if (!subject.classId) {
      setToast({ message: 'Không tìm thấy ID lớp hợp lệ từ API để tải học viên', type: 'error' });
      return;
    }

    setSelectedSubject(subject);
    setSearchStudent('');
    setStudentPage(1);
    setIsStudentModalOpen(true);
    await loadStudentsByClassId(subject.classId);
  };

  const subjectColumns = useMemo(() => [
    {
      key: 'classId',
      label: 'Mã lớp (ID)',
      render: (subject: ExternalClass) => <span className="font-semibold text-blue-600">{subject.classId}</span>,
    },
    {
      key: 'tenMon',
      label: 'Tên lớp',
      render: (subject: ExternalClass) => (
        <div>
          <div className="font-medium">{subject.tenMon}</div>
          <div className="text-xs text-gray-500">{subject.programType === 'ThacSy' ? 'Thạc sĩ' : 'Tiến sĩ'}</div>
        </div>
      ),
    },
    {
      key: 'soTinChi',
      label: 'Số tín chỉ',
      render: (subject: ExternalClass) => <Badge variant="info">{subject.soTinChi || 0} TC</Badge>,
    },
    {
      key: 'enrolled',
      label: 'Học viên',
      render: (subject: ExternalClass) => (
        <div className="flex items-center gap-2">
          <UserGroupIcon className="w-5 h-5 text-gray-400" />
          <span className="font-semibold">{subject.enrolled_students_count || 0}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Hành động',
      render: (subject: ExternalClass) => (
        <Button
          size="sm"
          variant="primary"
          onClick={() => handleViewStudents(subject)}
          disabled={!subject.classId}
          leftIcon={<UserGroupIcon className="w-4 h-4" />}
        >
          Xem học viên
        </Button>
      ),
    },
  ], []);

  const studentColumns = useMemo(() => [
    {
      key: 'maHV',
      label: 'Mã HV',
      render: (student: Student) => <span className="font-semibold">{student.maHV}</span>,
    },
    {
      key: 'hoTen',
      label: 'Họ và tên',
      render: (student: Student) => (
        <div>
          <div className="font-medium">{`${student.hoDem} ${student.ten}`.trim() || EMPTY_TEXT}</div>
          <div className="text-xs text-gray-500">{student.email || EMPTY_TEXT}</div>
        </div>
      ),
    },
    {
      key: 'gioiTinh',
      label: 'Giới tính',
      render: (student: Student) => student.gioiTinh || EMPTY_TEXT,
    },
    {
      key: 'dienThoai',
      label: 'Điện thoại',
      render: (student: Student) => student.dienThoai || EMPTY_TEXT,
    },
  ], []);

  const filteredSubjects = useMemo(() => {
    if (!searchSubject) return subjects;
    const search = searchSubject.toLowerCase();
    return subjects.filter((subject) =>
      subject.maMon?.toLowerCase().includes(search) ||
      subject.tenMon?.toLowerCase().includes(search),
    );
  }, [subjects, searchSubject]);

  const filteredStudents = useMemo(() => {
    if (!searchStudent) return students;
    const search = searchStudent.toLowerCase();
    return students.filter((student) =>
      student.maHV?.toLowerCase().includes(search) ||
      `${student.hoDem} ${student.ten}`.toLowerCase().includes(search) ||
      student.email?.toLowerCase().includes(search),
    );
  }, [students, searchStudent]);

  const pagedStudents = useMemo(() => {
    const start = (studentPage - 1) * studentPerPage;
    return filteredStudents.slice(start, start + studentPerPage);
  }, [filteredStudents, studentPage, studentPerPage]);

  const totalStudentPages = Math.max(1, Math.ceil(filteredStudents.length / studentPerPage));

  useEffect(() => {
    if (studentPage > totalStudentPages) {
      setStudentPage(1);
    }
  }, [studentPage, totalStudentPages]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
            <AcademicCapIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý môn học</h1>
            <p className="text-sm text-gray-500">Trang này chỉ đọc dữ liệu từ API ngoài</p>
          </div>
        </div>
      </div>

      <Card>
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2 text-gray-700 font-semibold">
            <FunnelIcon className="w-5 h-5" />
            <span>Bộ lọc dữ liệu API</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Bậc đào tạo"
              value={programType}
              onChange={(e) => {
                const nextProgram = e.target.value as ProgramType;
                setProgramType(nextProgram);
                setAdmissionYear(nextProgram === 'ThacSy' ? 2024 : 2023);
              }}
              options={[
                { value: 'ThacSy', label: 'Thạc sĩ' },
                { value: 'TienSy', label: 'Tiến sĩ' },
              ]}
            />
            <Select
              label="Năm học"
              value={admissionYear}
              onChange={(e) => setAdmissionYear(Number(e.target.value) || currentYear)}
              options={Array.from({ length: 11 }, (_, idx) => {
                const year = currentYear - 8 + idx;
                return { value: year, label: String(year) };
              })}
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <Button variant="secondary" size="sm" onClick={loadSubjects} leftIcon={<ArrowPathIcon className="w-4 h-4" />}>
              Tải lại API
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Danh sách lớp: <span className="text-purple-600">{filteredSubjects.length}</span>
            </h2>
          </div>

          <Input
            placeholder="Tìm theo mã lớp / tên lớp..."
            value={searchSubject}
            onChange={(e) => setSearchSubject(e.target.value)}
            className="max-w-md"
          />

          <Table
            data={filteredSubjects}
            columns={subjectColumns}
            keyExtractor={(subject) => `${subject.programType}-${subject.classId}`}
            isLoading={isLoadingSubjects}
            emptyMessage="Không có dữ liệu lớp từ API"
          />
        </div>
      </Card>

      <Modal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        title={`Học viên lớp: ${selectedSubject?.tenMon || ''}`}
        size="xl"
      >
        <div className="space-y-4">
          <Input
            placeholder="Tìm kiếm học viên..."
            value={searchStudent}
            onChange={(e) => {
              setSearchStudent(e.target.value);
              setStudentPage(1);
            }}
            className="max-w-md"
          />

          <Table
            data={pagedStudents}
            columns={studentColumns}
            keyExtractor={(student) => student.maHV}
            isLoading={isLoadingStudents}
            emptyMessage="Không có học viên trong lớp này"
          />

          {!isLoadingStudents && filteredStudents.length > 0 && (
            <Pagination
              currentPage={studentPage}
              totalPages={totalStudentPages}
              onPageChange={setStudentPage}
              perPage={studentPerPage}
              onPerPageChange={(value) => {
                setStudentPerPage(value);
                setStudentPage(1);
              }}
              total={filteredStudents.length}
            />
          )}
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
