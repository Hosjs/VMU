import { useState, useEffect, useMemo } from 'react';
import { subjectService } from '~/services/subject.service';
import { majorService } from '~/services/major.service';
import { useModal } from '~/hooks/useModal';
import { useTable } from '~/hooks/useTable';
import type { Subject, SubjectEnrollment } from '~/types/subject';
import type { Student } from '~/types/student';
import type { SelectOption } from '~/types/common';
import {
  AcademicCapIcon,
  FunnelIcon,
  UserGroupIcon,
  PlusIcon,
  XMarkIcon,
  ArrowPathIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { Button, Input, Select, Table, Badge, Card, Pagination, Modal, Toast } from '~/components/ui';
import type { ToastType } from '~/components/ui/Toast';

export function meta() {
  return [
    { title: "Quản lý môn học - VMU Training" },
    { name: "description", content: "Quản lý danh sách môn học và sinh viên đăng ký" },
  ];
}


export default function SubjectManagement() {
  const [namHoc, setNamHoc] = useState<number>(new Date().getFullYear());
  const [selectedMajorId, setSelectedMajorId] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [majorOptions, setMajorOptions] = useState<SelectOption[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<number[]>([]);
  const [isLoadingAvailableSubjects, setIsLoadingAvailableSubjects] = useState(false);
  const [searchSubject, setSearchSubject] = useState('');
  const [searchTableSubject, setSearchTableSubject] = useState('');

  const studentListModal = useModal();
  const addStudentsModal = useModal();
  const addSubjectsModal = useModal();
  const createSubjectModal = useModal();
  const editSubjectModal = useModal();

  const [newSubject, setNewSubject] = useState({
    maMon: '',
    tenMon: '',
    soTinChi: 1,
    moTa: '',
  });

  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const enrolledTable = useTable<SubjectEnrollment>({
    fetchData: async (params) => {
      if (!selectedSubject || !selectedMajorId) {
        return { data: [], current_page: 1, from: 0, last_page: 1, per_page: 20, to: 0, total: 0, first_page_url: '', last_page_url: '', next_page_url: null, path: '', prev_page_url: null };
      }
      return await subjectService.getEnrolledStudents(selectedSubject.id, {
        nam_hoc: namHoc,
        major_id: selectedMajorId,
        search: params.search,
        page: params.page,
        per_page: params.per_page,
      });
    },
    initialPerPage: 20,
  });

  const availableTable = useTable<Student>({
    fetchData: async (params) => {
      if (!selectedSubject || !selectedMajorId) {
        return { data: [], current_page: 1, from: 0, last_page: 1, per_page: 20, to: 0, total: 0, first_page_url: '', last_page_url: '', next_page_url: null, path: '', prev_page_url: null };
      }
      return await subjectService.getAvailableStudents(selectedSubject.id, namHoc, selectedMajorId, {
        search: params.search,
        page: params.page,
        per_page: params.per_page,
      });
    },
    initialPerPage: 20,
  });

  useEffect(() => {
    loadMajorOptions();
  }, []);

  useEffect(() => {
    if (namHoc && selectedMajorId) {
      loadSubjects();
      loadAvailableSubjects();
    } else {
      setSubjects([]);
      setAvailableSubjects([]);
    }
  }, [namHoc, selectedMajorId]);

  const loadMajorOptions = async () => {
    try {
      const majors = await majorService.getAllMajors();
      const options: SelectOption[] = [
        { value: '', label: '-- Chọn ngành --' },
        ...majors
          .map(major => ({
            value: major.id.toString(),
            label: `${major.maNganh} - ${major.tenNganh}`,
          }))
      ];
      setMajorOptions(options);
    } catch (err) {
      setToast({ message: '❌ Lỗi khi tải danh sách ngành', type: 'error' });
    }
  };

  const loadSubjects = async () => {
    if (!selectedMajorId) return;

    try {
      setIsLoadingSubjects(true);
      const data = await subjectService.getSubjectsByMajorAndYear(selectedMajorId, namHoc);
      setSubjects(data);
    } catch (err) {
      console.error('❌ Error loading subjects:', err);
      setToast({ message: '❌ Lỗi khi tải danh sách môn học', type: 'error' });
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  const loadAvailableSubjects = async () => {
    if (!selectedMajorId) return;

    try {
      setIsLoadingAvailableSubjects(true);
      const data = await subjectService.getAvailableSubjectsForMajor(selectedMajorId);
      setAvailableSubjects(data);
    } catch (err) {
      setToast({ message: '❌ Lỗi khi tải danh sách môn học khả dụng', type: 'error' });
    } finally {
      setIsLoadingAvailableSubjects(false);
    }
  };

  const handleViewStudents = async (subject: Subject) => {
    setSelectedSubject(subject);
    studentListModal.open();
    enrolledTable.refresh();
  };

  const handleAddStudents = () => {
    setSelectedStudentIds([]);
    addStudentsModal.open();
    availableTable.refresh();
  };

  const handleToggleStudent = (maHV: string) => {
    setSelectedStudentIds(prev =>
      prev.includes(maHV) ? prev.filter(id => id !== maHV) : [...prev, maHV]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudentIds.length === availableTable.data.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(availableTable.data.map(s => s.maHV));
    }
  };

  const handleEnrollStudents = async () => {
    if (!selectedSubject || !selectedMajorId || selectedStudentIds.length === 0) return;

    try {
      const result = await subjectService.bulkEnrollStudents({
        maHVs: selectedStudentIds,
        subject_id: selectedSubject.id,
        major_id: selectedMajorId,
        namHoc,
      });

      let message = `✅ Đã thêm ${result.enrollments.length} sinh viên`;
      if (result.duplicates.length > 0) {
        message += `. ${result.duplicates.length} sinh viên đã đăng ký trước đó`;
      }

      setToast({ message, type: 'success' });
      addStudentsModal.close();
      enrolledTable.refresh();
      loadSubjects();
    } catch (err: any) {
      setToast({ message: `❌ ${err.message}`, type: 'error' });
    }
  };

  const handleUnenrollStudent = async (enrollmentId: number) => {
    if (!selectedSubject || !confirm('Bạn có chắc chắn muốn xóa sinh viên khỏi môn học này?')) return;

    try {
      await subjectService.unenrollStudent(enrollmentId);
      setToast({ message: '✅ Đã xóa sinh viên khỏi môn học', type: 'success' });
      enrolledTable.refresh();
      loadSubjects();
    } catch (err: any) {
      setToast({ message: `❌ ${err.message}`, type: 'error' });
    }
  };

  const handleAddSubjects = () => {
    setNewSubject({ maMon: '', tenMon: '', soTinChi: 1, moTa: '' });
    setFormErrors({});
    createSubjectModal.open();
  };

  const validateSubjectForm = () => {
    const errors: Record<string, string> = {};

    if (!newSubject.maMon.trim()) {
      errors.maMon = 'Mã môn học là bắt buộc';
    } else if (newSubject.maMon.length > 20) {
      errors.maMon = 'Mã môn học không được quá 20 ký tự';
    }

    if (!newSubject.tenMon.trim()) {
      errors.tenMon = 'Tên môn học là bắt buộc';
    } else if (newSubject.tenMon.length > 255) {
      errors.tenMon = 'Tên môn học không được quá 255 ký tự';
    }

    if (newSubject.soTinChi < 1 || newSubject.soTinChi > 10) {
      errors.soTinChi = 'Số tín chỉ phải từ 1 đến 10';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateSubject = async () => {
    if (!validateSubjectForm()) {
      return;
    }

    try {
      const createdSubject = await subjectService.createSubject(newSubject);

      // Nếu có ngành được chọn, tự động gán môn học cho ngành đó
      if (selectedMajorId) {
        await subjectService.bulkAssignSubjectsToMajor({
          major_id: selectedMajorId,
          subject_ids: [createdSubject.id],
        });
      }

      setToast({ message: '✅ Tạo môn học thành công', type: 'success' });
      createSubjectModal.close();
      loadSubjects();
    } catch (err: any) {
      setToast({ message: `❌ ${err.message}`, type: 'error' });
    }
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setNewSubject({
      maMon: subject.maMon,
      tenMon: subject.tenMon,
      soTinChi: subject.soTinChi,
      moTa: subject.moTa || '',
    });
    setFormErrors({});
    editSubjectModal.open();
  };

  const handleUpdateSubject = async () => {
    if (!editingSubject || !validateSubjectForm()) {
      return;
    }

    try {
      await subjectService.updateSubject(editingSubject.id, newSubject);
      setToast({ message: '✅ Cập nhật môn học thành công', type: 'success' });
      editSubjectModal.close();
      loadSubjects();
    } catch (err: any) {
      setToast({ message: `❌ ${err.message}`, type: 'error' });
    }
  };

  const handleDeleteSubject = async (subject: Subject) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa môn học "${subject.tenMon}"?\n\nLưu ý: Chỉ có thể xóa môn học chưa có sinh viên đăng ký.`)) {
      return;
    }

    try {
      await subjectService.deleteSubject(subject.id);
      setToast({ message: '✅ Xóa môn học thành công', type: 'success' });
      loadSubjects();
    } catch (err: any) {
      setToast({ message: `❌ ${err.message}`, type: 'error' });
    }
  };

  const handleToggleSubject = (subjectId: number) => {
    setSelectedSubjectIds(prev =>
      prev.includes(subjectId) ? prev.filter(id => id !== subjectId) : [...prev, subjectId]
    );
  };

  const handleSelectAllSubjects = () => {
    if (selectedSubjectIds.length === availableSubjects.length) {
      setSelectedSubjectIds([]);
    } else {
      setSelectedSubjectIds(availableSubjects.map(s => s.id));
    }
  };

  const handleEnrollSubjects = async () => {
    if (!selectedMajorId || selectedSubjectIds.length === 0) return;

    try {
      const result = await subjectService.bulkAssignSubjectsToMajor({
        subject_ids: selectedSubjectIds,
        major_id: selectedMajorId,
      });

      let message = `✅ Đã thêm ${result.added} môn học`;
      setToast({ message, type: 'success' });
      addSubjectsModal.close();
      loadSubjects();
    } catch (err: any) {
      setToast({ message: `❌ ${err.message}`, type: 'error' });
    }
  };

  const subjectColumns = useMemo(() => [
    {
      key: 'maMon',
      label: 'Mã môn',
      render: (subject: Subject) => (
        <span className="font-semibold text-blue-600">{subject.maMon}</span>
      ),
    },
    {
      key: 'tenMon',
      label: 'Tên môn học',
      render: (subject: Subject) => (
        <div>
          <div className="font-medium">{subject.tenMon}</div>
          {subject.moTa && (
            <div className="text-xs text-gray-500 line-clamp-1">{subject.moTa}</div>
          )}
        </div>
      ),
    },
    {
      key: 'soTinChi',
      label: 'Số tín chỉ',
      render: (subject: Subject) => (
        <Badge variant="info">{subject.soTinChi} TC</Badge>
      ),
    },
    {
      key: 'enrolled',
      label: 'Sinh viên',
      render: (subject: Subject) => (
        <div className="flex items-center gap-2">
          <UserGroupIcon className="w-5 h-5 text-gray-400" />
          <span className="font-semibold">{subject.enrolled_students_count || 0}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Hành động',
      render: (subject: Subject) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="primary"
            onClick={() => handleViewStudents(subject)}
            leftIcon={<UserGroupIcon className="w-4 h-4" />}
          >
            Quản lý SV
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEditSubject(subject)}
            leftIcon={<PencilIcon className="w-4 h-4" />}
            className="text-blue-600 hover:bg-blue-50"
          >
            Sửa
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleDeleteSubject(subject)}
            leftIcon={<TrashIcon className="w-4 h-4" />}
            className="text-red-600 hover:bg-red-50"
          >
            Xóa
          </Button>
        </div>
      ),
    },
  ], []);

  const enrolledColumns = useMemo(() => [
    {
      key: 'maHV',
      label: 'Mã SV',
      render: (enrollment: SubjectEnrollment) => (
        <span className="font-semibold">{enrollment.maHV}</span>
      ),
    },
    {
      key: 'hoTen',
      label: 'Họ và tên',
      render: (enrollment: SubjectEnrollment) => (
        <div>
          <div className="font-medium">
            {enrollment.student?.hoDem} {enrollment.student?.ten}
          </div>
          <div className="text-xs text-gray-500">{enrollment.student?.email}</div>
        </div>
      ),
    },
    {
      key: 'dienThoai',
      label: 'Điện thoại',
      render: (enrollment: SubjectEnrollment) => enrollment.student?.dienThoai,
    },
    {
      key: 'trangThai',
      label: 'Trạng thái',
      render: (enrollment: SubjectEnrollment) => {
        const variants: Record<string, any> = {
          DangHoc: 'info',
          DaHoanThanh: 'success',
          Huy: 'danger',
        };
        const labels: Record<string, string> = {
          DangHoc: 'Đang học',
          DaHoanThanh: 'Hoàn thành',
          Huy: 'Hủy',
        };
        return (
          <Badge variant={variants[enrollment.trangThai]}>
            {labels[enrollment.trangThai]}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      label: 'Hành động',
      render: (enrollment: SubjectEnrollment) => (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleUnenrollStudent(enrollment.id)}
          leftIcon={<XMarkIcon className="w-4 h-4" />}
          className="text-red-600 hover:bg-red-50"
        >
          Xóa
        </Button>
      ),
    },
  ], []);

  const availableColumns = useMemo(() => [
    {
      key: 'select',
      label: '',
      render: (student: Student) => (
        <input
          type="checkbox"
          checked={selectedStudentIds.includes(student.maHV)}
          onChange={() => handleToggleStudent(student.maHV)}
          className="w-4 h-4"
        />
      ),
    },
    {
      key: 'maHV',
      label: 'Mã SV',
      render: (student: Student) => <span className="font-semibold">{student.maHV}</span>,
    },
    {
      key: 'hoTen',
      label: 'Họ và tên',
      render: (student: Student) => (
        <div>
          <div className="font-medium">{student.hoDem} {student.ten}</div>
          <div className="text-xs text-gray-500">{student.email}</div>
        </div>
      ),
    },
    {
      key: 'gioiTinh',
      label: 'Giới tính',
      render: (student: Student) => student.gioiTinh,
    },
    {
      key: 'dienThoai',
      label: 'Điện thoại',
      render: (student: Student) => student.dienThoai,
    },
  ], [selectedStudentIds, availableTable.data]);

  const filteredSubjects = useMemo(() => {
    if (!searchTableSubject) return subjects;
    const search = searchTableSubject.toLowerCase();
    return subjects.filter(s =>
      s.maMon?.toLowerCase().includes(search) ||
      s.tenMon?.toLowerCase().includes(search) ||
      s.moTa?.toLowerCase().includes(search)
    );
  }, [subjects, searchTableSubject]);

  const filteredAvailableSubjects = useMemo(() => {
    if (!searchSubject) return availableSubjects;
    const search = searchSubject.toLowerCase();
    return availableSubjects.filter(s =>
      s.maMon?.toLowerCase().includes(search) ||
      s.tenMon?.toLowerCase().includes(search)
    );
  }, [availableSubjects, searchSubject]);

  const availableSubjectsColumns = useMemo(() => [
    {
      key: 'select',
      label: '',
      render: (subject: Subject) => (
        <input
          type="checkbox"
          checked={selectedSubjectIds.includes(subject.id)}
          onChange={() => handleToggleSubject(subject.id)}
          className="w-4 h-4"
        />
      ),
    },
    {
      key: 'maMon',
      label: 'Mã môn',
      render: (subject: Subject) => (
        <span className="font-semibold text-blue-600">{subject.maMon}</span>
      ),
    },
    {
      key: 'tenMon',
      label: 'Tên môn học',
      render: (subject: Subject) => (
        <div>
          <div className="font-medium">{subject.tenMon}</div>
          {subject.moTa && (
            <div className="text-xs text-gray-500 line-clamp-1">{subject.moTa}</div>
          )}
        </div>
      ),
    },
    {
      key: 'soTinChi',
      label: 'Số tín chỉ',
      render: (subject: Subject) => (
        <Badge variant="info">{subject.soTinChi} TC</Badge>
      ),
    },
  ], [selectedSubjectIds]);

  const yearOptions: SelectOption[] = useMemo(() => {
    const options: SelectOption[] = [{ value: '', label: '-- Chọn năm --' }];
    const currentYear = new Date().getFullYear();
    for (let year = currentYear + 2; year >= currentYear - 10; year--) {
      options.push({ value: year.toString(), label: year.toString() });
    }
    return options;
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
            <AcademicCapIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý môn học</h1>
            <p className="text-sm text-gray-500">Quản lý danh sách môn học và sinh viên đăng ký</p>
          </div>
        </div>
      </div>

      <Card>
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2 text-gray-700 font-semibold">
            <FunnelIcon className="w-5 h-5" />
            <span>Bộ lọc</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Năm học"
              value={namHoc.toString()}
              onChange={(e) => setNamHoc(Number(e.target.value))}
              options={yearOptions}
            />

            <Select
              label="Ngành học"
              value={selectedMajorId?.toString() || ''}
              onChange={(e) => setSelectedMajorId(e.target.value ? Number(e.target.value) : null)}
              options={majorOptions}
            />
          </div>
        </div>
      </Card>

      {isLoadingSubjects ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải danh sách môn học...</p>
          </div>
        </div>
      ) : subjects.length === 0 ? (
        <Card>
          <div className="p-8 text-center text-gray-500">
            {selectedMajorId ? (
              <>
                <p>Không có môn học nào</p>
                <p className="text-xs mt-2">Debug: selectedMajorId={selectedMajorId}, namHoc={namHoc}, subjects.length={subjects.length}</p>
              </>
            ) : 'Vui lòng chọn năm học và ngành để xem danh sách môn học'}
          </div>
        </Card>
      ) : (
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Danh sách môn học: <span className="text-purple-600">{subjects.length}</span> môn
              </h2>
              <div className="flex gap-2">
                {selectedMajorId && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAddSubjects}
                    leftIcon={<PlusIcon className="w-4 h-4" />}
                  >
                    Thêm môn học
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={loadSubjects}
                  leftIcon={<ArrowPathIcon className="w-4 h-4" />}
                >
                  Làm mới
                </Button>
              </div>
            </div>

            <div className="mb-4">
              <Input
                placeholder="Tìm kiếm môn học..."
                value={searchTableSubject}
                onChange={(e) => setSearchTableSubject(e.target.value)}
                className="max-w-md"
              />
            </div>

            <Table
              data={filteredSubjects}
              columns={subjectColumns}
              keyExtractor={(subject) => subject.id.toString()}
              emptyMessage="Không có môn học nào"
            />
          </div>
        </Card>
      )}

      <Modal
        isOpen={studentListModal.isOpen}
        onClose={studentListModal.close}
        title={`Sinh viên môn: ${selectedSubject?.tenMon || ''}`}
        size="xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Tìm kiếm sinh viên..."
                value={enrolledTable.search}
                onChange={(e) => enrolledTable.handleSearch(e.target.value)}
              />
            </div>
            <Button
              variant="primary"
              onClick={handleAddStudents}
              leftIcon={<PlusIcon className="w-4 h-4" />}
            >
              Thêm sinh viên
            </Button>
          </div>

          <Table
            data={enrolledTable.data}
            columns={enrolledColumns}
            keyExtractor={(e) => e.id.toString()}
            isLoading={enrolledTable.isLoading}
            emptyMessage="Chưa có sinh viên nào đăng ký môn học này"
          />

          {enrolledTable.meta.total > 0 && (
            <Pagination
              currentPage={enrolledTable.page}
              totalPages={enrolledTable.meta.last_page}
              onPageChange={enrolledTable.handlePageChange}
              perPage={enrolledTable.perPage}
              onPerPageChange={enrolledTable.handlePerPageChange}
              total={enrolledTable.meta.total}
            />
          )}
        </div>
      </Modal>

      <Modal
        isOpen={addStudentsModal.isOpen}
        onClose={addStudentsModal.close}
        title="Thêm sinh viên vào môn học"
        size="xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Input
              placeholder="Tìm kiếm sinh viên..."
              value={availableTable.search}
              onChange={(e) => availableTable.handleSearch(e.target.value)}
              className="max-w-md"
            />
            <Badge variant="info">
              Đã chọn: {selectedStudentIds.length} sinh viên
            </Badge>
          </div>

          <Table
            data={availableTable.data}
            columns={availableColumns}
            keyExtractor={(s) => s.maHV}
            isLoading={availableTable.isLoading}
            emptyMessage="Không có sinh viên khả dụng"
          />

          {availableTable.meta.total > 0 && (
            <Pagination
              currentPage={availableTable.page}
              totalPages={availableTable.meta.last_page}
              onPageChange={availableTable.handlePageChange}
              perPage={availableTable.perPage}
              onPerPageChange={availableTable.handlePerPageChange}
              total={availableTable.meta.total}
            />
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="secondary" onClick={addStudentsModal.close}>
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleEnrollStudents}
              disabled={selectedStudentIds.length === 0}
            >
              Thêm {selectedStudentIds.length} sinh viên
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={addSubjectsModal.isOpen}
        onClose={addSubjectsModal.close}
        title={`Thêm môn học vào ngành (Năm ${namHoc})`}
        size="xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Input
              placeholder="Tìm kiếm môn học..."
              value={searchSubject}
              onChange={(e) => setSearchSubject(e.target.value)}
              className="max-w-md"
            />
            <Badge variant="info">
              Đã chọn: {selectedSubjectIds.length} môn học
            </Badge>
          </div>

          <Table
            data={filteredAvailableSubjects}
            columns={availableSubjectsColumns}
            keyExtractor={(s) => s.id.toString()}
            isLoading={isLoadingAvailableSubjects}
            emptyMessage="Không có môn học khả dụng"
          />

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="secondary" onClick={addSubjectsModal.close}>
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleEnrollSubjects}
              disabled={selectedSubjectIds.length === 0}
            >
              Thêm {selectedSubjectIds.length} môn học
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={createSubjectModal.isOpen}
        onClose={createSubjectModal.close}
        title="Tạo môn học mới"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Mã môn học"
              placeholder="Nhập mã môn học"
              value={newSubject.maMon}
              onChange={(e) => setNewSubject({ ...newSubject, maMon: e.target.value })}
              error={formErrors.maMon}
            />

            <Input
              label="Tên môn học"
              placeholder="Nhập tên môn học"
              value={newSubject.tenMon}
              onChange={(e) => setNewSubject({ ...newSubject, tenMon: e.target.value })}
              error={formErrors.tenMon}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Số tín chỉ"
              placeholder="Nhập số tín chỉ"
              type="number"
              value={newSubject.soTinChi}
              onChange={(e) => setNewSubject({ ...newSubject, soTinChi: Number(e.target.value) })}
              error={formErrors.soTinChi}
            />

            <Input
              label="Mô tả"
              placeholder="Nhập mô tả môn học (tuỳ chọn)"
              value={newSubject.moTa}
              onChange={(e) => setNewSubject({ ...newSubject, moTa: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="secondary" onClick={createSubjectModal.close}>
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateSubject}
            >
              Tạo môn học
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={editSubjectModal.isOpen}
        onClose={editSubjectModal.close}
        title="Sửa môn học"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Mã môn học"
              placeholder="Nhập mã môn học"
              value={newSubject.maMon}
              onChange={(e) => setNewSubject({ ...newSubject, maMon: e.target.value })}
              error={formErrors.maMon}
            />

            <Input
              label="Tên môn học"
              placeholder="Nhập tên môn học"
              value={newSubject.tenMon}
              onChange={(e) => setNewSubject({ ...newSubject, tenMon: e.target.value })}
              error={formErrors.tenMon}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Số tín chỉ"
              placeholder="Nhập số tín chỉ"
              type="number"
              value={newSubject.soTinChi}
              onChange={(e) => setNewSubject({ ...newSubject, soTinChi: Number(e.target.value) })}
              error={formErrors.soTinChi}
            />

            <Input
              label="Mô tả"
              placeholder="Nhập mô tả môn học (tuỳ chọn)"
              value={newSubject.moTa}
              onChange={(e) => setNewSubject({ ...newSubject, moTa: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="secondary" onClick={editSubjectModal.close}>
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdateSubject}
            >
              Cập nhật môn học
            </Button>
          </div>
        </div>
      </Modal>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
