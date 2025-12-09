import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { studentService } from '~/services/student.service';
import { majorService } from '~/services/major.service';
import { useModal } from '~/hooks/useModal';
import type { Student } from '~/types/student';
import type { SelectOption } from '~/types/common';
import {
  UserGroupIcon,
  FunnelIcon,
  ArrowPathIcon,
  AcademicCapIcon,
  EyeIcon,
  PlusIcon,
  UserPlusIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { Select } from '~/components/ui/Select';
import { Table } from '~/components/ui/Table';
import { Badge } from '~/components/ui/Badge';
import { Card } from '~/components/ui/Card';
import { Pagination } from '~/components/ui/Pagination';
import { Modal } from '~/components/ui/Modal';
import { STATUS_CONFIG, GIOI_TINH_OPTIONS } from '~/constants/student.constants';

export function meta() {
  return [
    { title: "Phân lớp học viên - VMU Training" },
    { name: "description", content: "Quản lý phân lớp học viên theo lớp học" },
  ];
}

export default function ClassAssignments() {
  const navigate = useNavigate();
  const [namVao, setNamVao] = useState<number | null>(new Date().getFullYear());
  const [selectedMaNganh, setSelectedMaNganh] = useState<string>('');
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  // ============================================
  // THÊM SINH VIÊN VÀO LỚP
  // ============================================
  const addStudentModal = useModal();
  const [majorOptions, setMajorOptions] = useState<SelectOption[]>([]);
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isLoadingModalStudents, setIsLoadingModalStudents] = useState(false);
  const [isAddingStudents, setIsAddingStudents] = useState(false);

  // Filters cho modal thêm sinh viên
  const [studentFilters, setStudentFilters] = useState({
    namHoc: new Date().getFullYear(),
    maNganh: '',
    gioiTinh: '',
    search: '',
  });

  // States cho danh sách sinh viên hiển thị
  const [displayStudents, setDisplayStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [gioiTinhFilter, setGioiTinhFilter] = useState('');
  const [trangThaiFilter, setTrangThaiFilter] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  // Load danh sách ngành học
  useEffect(() => {
    loadMajorOptions();
  }, []);

  // Load sinh viên khi thay đổi năm hoặc ngành
  useEffect(() => {
    if (namVao && selectedMaNganh) {
      loadStudentsByMajorAndYear();
    } else {
      setDisplayStudents([]);
      setFilteredStudents([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [namVao, selectedMaNganh]);

  // Filter students khi thay đổi filters
  useEffect(() => {
    filterStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayStudents, searchTerm, gioiTinhFilter, trangThaiFilter]);

  const loadMajorOptions = async () => {
    try {
      const majors = await majorService.getAllMajors();

      const options: SelectOption[] = [
        { value: '', label: '-- Chọn ngành --' },
        ...majors
          .filter(m => m.daoTaoThacSy)
          .map(major => {
            // ✅ Sử dụng ma (accessor) hoặc maNganh (field gốc)
            const maNganh = major.ma || (major as any).maNganh || '';
            const tenNganh = major.tenNganhHoc || (major as any).tenNganh || '';

            return {
              value: maNganh,
              label: `${maNganh} - ${tenNganh}`,
            };
          })
          .filter(opt => opt.value !== '') // ✅ Loại bỏ các option không có mã ngành
      ];

      setMajorOptions(options);
    } catch (err) {
      console.error('❌ [class-assignments] Error loading majors:', err);
    }
  };

  // ============================================
  // LOAD SINH VIÊN THEO NGÀNH VÀ NĂM
  // ============================================
  const loadStudentsByMajorAndYear = async () => {
    if (!namVao || !selectedMaNganh) return;

    // ✅ DEBUG: Log giá trị filter
    console.log('🔍 [class-assignments] loadStudentsByMajorAndYear called with:', {
      namVao,
      selectedMaNganh,
      types: {
        namVao: typeof namVao,
        selectedMaNganh: typeof selectedMaNganh
      }
    });

    try {
      setIsLoadingStudents(true);

      // ✅ Lấy từ database với đúng field namVaoTruong
      const response = await studentService.getList({
        namVao: namVao, // Backend sẽ map thành namVaoTruong
        maNganh: selectedMaNganh,
        per_page: 1000,
      });

      console.log('✅ [class-assignments] API Response:', {
        totalReceived: response.data.length,
        total: response.meta?.total,
        firstStudent: response.data[0] ? {
          maHV: response.data[0].maHV,
          namVaoTruong: response.data[0].namVaoTruong,
          maNganh: response.data[0].maNganh
        } : null
      });

      setDisplayStudents(response.data);
      setFilteredStudents(response.data);
      setCurrentPage(1);
    } catch (err) {
      console.error('❌ [class-assignments] Error loading students:', err);
      setDisplayStudents([]);
      setFilteredStudents([]);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  // ============================================
  // LỌC SINH VIÊN
  // ============================================
  const filterStudents = () => {
    let filtered = [...displayStudents];

    // Lọc theo tìm kiếm
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        s.maHV?.toLowerCase().includes(search) ||
        s.hoDem?.toLowerCase().includes(search) ||
        s.ten?.toLowerCase().includes(search) ||
        s.email?.toLowerCase().includes(search) ||
        s.dienThoai?.toLowerCase().includes(search)
      );
    }

    // Lọc theo giới tính
    if (gioiTinhFilter) {
      filtered = filtered.filter(s => s.gioiTinh === gioiTinhFilter);
    }

    // Lọc theo trạng thái
    if (trangThaiFilter) {
      filtered = filtered.filter(s => s.trangThaiHoc === trangThaiFilter);
    }

    setFilteredStudents(filtered);
    setCurrentPage(1); // Reset về trang 1 khi filter
  };

  // ============================================
  // LOAD DANH SÁCH SINH VIÊN CHO MODAL (KHẢ DỤNG ĐỂ THÊM VÀO LỚP)
  // ============================================
  const loadAvailableStudents = async () => {
    if (!studentFilters.namHoc) return;

    try {
      setIsLoadingModalStudents(true);

      if (!studentFilters.maNganh) {
        setAvailableStudents([]);
        return;
      }

      // ✅ Lấy từ database thay vì API external
      const response = await studentService.getList({
        namVao: studentFilters.namHoc,
        maNganh: studentFilters.maNganh,
        gioiTinh: studentFilters.gioiTinh || undefined,
        search: studentFilters.search || undefined,
        per_page: 1000, // Lấy nhiều để có đầy đủ danh sách
      });

      setAvailableStudents(response.data);
    } catch (err) {
      console.error('Error loading students:', err);
      setAvailableStudents([]);
    } finally {
      setIsLoadingModalStudents(false);
    }
  };

  // Load students khi mở modal hoặc thay đổi filters
  useEffect(() => {
    if (addStudentModal.isOpen) {
      loadAvailableStudents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addStudentModal.isOpen, studentFilters.namHoc, studentFilters.maNganh, studentFilters.gioiTinh, studentFilters.search]);

  // ============================================
  // HANDLERS
  // ============================================
  const handleNamVaoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value) {
      const year = parseInt(value, 10);
      setNamVao(year);
    } else {
      setNamVao(null);
    }
    // Reset khi đổi năm
    setDisplayStudents([]);
    setFilteredStudents([]);
  };

  const handleMaNganhChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedMaNganh(value);
    // Reset khi đổi ngành
    setDisplayStudents([]);
    setFilteredStudents([]);
  };

  const handleGioiTinhChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGioiTinhFilter(e.target.value);
  };

  const handleTrangThaiChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTrangThaiFilter(e.target.value);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setGioiTinhFilter('');
    setTrangThaiFilter('');
  };

  // ============================================
  // THÊM SINH VIÊN VÀO LỚP
  // ============================================
  const handleOpenAddStudentModal = () => {
    setSelectedStudents([]);
    setStudentFilters({
      namHoc: namVao || new Date().getFullYear(),
      maNganh: selectedMaNganh || '',
      gioiTinh: '',
      search: '',
    });
    addStudentModal.open();
  };

  const handleToggleStudent = (maHV: string) => {
    setSelectedStudents(prev =>
      prev.includes(maHV)
        ? prev.filter(id => id !== maHV)
        : [...prev, maHV]
    );
  };

  const handleToggleAllStudents = () => {
    if (selectedStudents.length === availableStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(availableStudents.map(s => s.maHV));
    }
  };

  const handleAddStudentsToList = async () => {
    if (selectedStudents.length === 0) {
      alert('Vui lòng chọn ít nhất một sinh viên');
      return;
    }

    try {
      setIsAddingStudents(true);

      // Lấy danh sách sinh viên được chọn từ availableStudents
      const studentsToAdd = availableStudents.filter(s =>
        selectedStudents.includes(s.maHV)
      );

      // Kiểm tra sinh viên đã có trong danh sách chưa
      const existingMaHVs = displayStudents.map(s => s.maHV);
      const newStudents = studentsToAdd.filter(s => !existingMaHVs.includes(s.maHV));

      if (newStudents.length === 0) {
        alert('Tất cả sinh viên đã có trong danh sách!');
        addStudentModal.close();
        setIsAddingStudents(false);
        return;
      }

      // Thêm sinh viên mới vào danh sách
      const updatedStudents = [...displayStudents, ...newStudents];
      setDisplayStudents(updatedStudents);
      setFilteredStudents(updatedStudents);

      // Đóng modal và reset
      addStudentModal.close();
      setSelectedStudents([]);

      alert(`Đã thêm ${newStudents.length} sinh viên vào danh sách thành công!${
        newStudents.length < selectedStudents.length 
          ? `\n(${selectedStudents.length - newStudents.length} sinh viên đã có trong danh sách)`
          : ''
      }`);
    } catch (err) {
      console.error('Error adding students:', err);
      alert('Có lỗi xảy ra khi thêm sinh viên. Vui lòng thử lại.');
    } finally {
      setIsAddingStudents(false);
    }
  };

  // ============================================
  // XÓA SINH VIÊN
  // ============================================
  const handleDeleteStudent = async (maHV: string, hoTen: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa sinh viên "${hoTen}"?`)) {
      return;
    }

    try {
      await studentService.delete(maHV);

      // Xóa khỏi danh sách hiển thị
      const updatedStudents = displayStudents.filter(s => s.maHV !== maHV);
      setDisplayStudents(updatedStudents);
      setFilteredStudents(updatedStudents.filter(s => {
        // Apply current filters
        let match = true;
        if (searchTerm) {
          const search = searchTerm.toLowerCase();
          match = match && (
            s.maHV?.toLowerCase().includes(search) ||
            s.hoDem?.toLowerCase().includes(search) ||
            s.ten?.toLowerCase().includes(search) ||
            s.email?.toLowerCase().includes(search) ||
            s.dienThoai?.toLowerCase().includes(search)
          );
        }
        if (gioiTinhFilter) {
          match = match && s.gioiTinh === gioiTinhFilter;
        }
        if (trangThaiFilter) {
          match = match && s.trangThaiHoc === trangThaiFilter;
        }
        return match;
      }));

      alert(`Đã xóa sinh viên "${hoTen}" thành công!`);
    } catch (err) {
      console.error('Error deleting student:', err);
      alert('Có lỗi xảy ra khi xóa sinh viên. Vui lòng thử lại.');
    }
  };

  // ============================================
  // XEM CHI TIẾT SINH VIÊN
  // ============================================
  const handleViewStudent = (maHV: string) => {
    navigate(`/students/${maHV}`);
  };

  // ============================================
  // SỬA SINH VIÊN
  // ============================================
  const handleEditStudent = (maHV: string) => {
    navigate(`/students/${maHV}/edit`);
  };

  // ============================================
  // THÊM SINH VIÊN MỚI
  // ============================================
  const handleAddNewStudent = () => {
    navigate('/students/create');
  };

  // ============================================
  // PAGINATION
  // ============================================
  const totalPages = Math.ceil(filteredStudents.length / perPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  };

  // ============================================
  // YEAR OPTIONS
  // ============================================
  const namVaoOptions: SelectOption[] = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years: SelectOption[] = [{ value: '', label: '-- Chọn năm --' }];

    for (let year = currentYear + 2; year >= currentYear - 10; year--) {
      years.push({ value: year.toString(), label: year.toString() });
    }

    return years;
  }, []);

  // ============================================
  // STATUS OPTIONS
  // ============================================
  const trangThaiOptions: SelectOption[] = [
    { value: '', label: 'Tất cả' },
    { value: 'Đang học', label: 'Đang học' },
    { value: 'Bảo lưu', label: 'Bảo lưu' },
    { value: 'Đã tốt nghiệp', label: 'Đã tốt nghiệp' },
    { value: 'Thôi học', label: 'Thôi học' },
    { value: 'Nộp hồ sơ đầu vào', label: 'Nộp hồ sơ đầu vào' },
  ];

  // ============================================
  // TABLE COLUMNS
  // ============================================
  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status] || { label: status, variant: 'default' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const columns = useMemo(() => [
    {
      key: 'stt',
      label: 'STT',
      width: '60px',
      render: (_: Student, index: number) => (
        <span className="text-gray-900 font-medium">
          {(currentPage - 1) * perPage + index + 1}
        </span>
      ),
    },
    {
      key: 'maHV',
      label: 'Mã học viên',
      sortable: true,
      width: '130px',
      render: (item: Student) => (
        <span className="font-semibold text-blue-600">
          {item.maHV || 'Chưa cấp'}
        </span>
      ),
    },
    {
      key: 'hoTen',
      label: 'Họ và tên',
      sortable: true,
      render: (item: Student) => (
        <div>
          <div className="font-medium text-gray-900">
            {`${item.hoDem} ${item.ten}`.trim()}
          </div>
          <div className="text-xs text-gray-500">{item.email}</div>
        </div>
      ),
    },
    {
      key: 'ngaySinh',
      label: 'Ngày sinh',
      sortable: true,
      width: '110px',
      render: (item: Student) => (
        <span className="text-sm text-gray-700">
          {item.ngaySinh ? new Date(item.ngaySinh).toLocaleDateString('vi-VN') : '-'}
        </span>
      ),
    },
    {
      key: 'gioiTinh',
      label: 'Giới tính',
      width: '90px',
      render: (item: Student) => (
        <Badge variant={item.gioiTinh === 'Nam' ? 'info' : 'secondary'}>
          {item.gioiTinh}
        </Badge>
      ),
    },
    {
      key: 'dienThoai',
      label: 'Điện thoại',
      width: '120px',
      render: (item: Student) => (
        <span className="text-sm text-gray-700">
          {item.dienThoai || '-'}
        </span>
      ),
    },
    {
      key: 'trangThaiHoc',
      label: 'Trạng thái',
      width: '140px',
      render: (item: Student) => (
        item.trangThaiHoc ? getStatusBadge(item.trangThaiHoc) : <Badge variant="default">-</Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Hành động',
      width: '100px',
      render: (item: Student) => (
        <div className="flex justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/students/${item.maHV}`)}
          >
            <EyeIcon className="w-5 h-5 text-gray-500" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditStudent(item.maHV)}
          >
            <PencilIcon className="w-5 h-5 text-gray-500" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteStudent(item.maHV, `${item.hoDem} ${item.ten}`)}
          >
            <TrashIcon className="w-5 h-5 text-red-500" />
          </Button>
        </div>
      ),
    },
  ], [currentPage, perPage, navigate]);

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <UserGroupIcon className="w-8 h-8 text-blue-600" />
            Danh sách học viên
          </h1>
          <p className="text-gray-600 mt-1">
            Quản lý danh sách học viên theo năm và ngành học
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              if (namVao && selectedMaNganh) {
                loadStudentsByMajorAndYear();
              }
            }}
            disabled={isLoadingStudents || !namVao || !selectedMaNganh}
          >
            <ArrowPathIcon className={`w-4 h-4 ${isLoadingStudents ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>

          {namVao && selectedMaNganh && filteredStudents.length > 0 && (
            <Button
              variant="primary"
              onClick={handleOpenAddStudentModal}
            >
              <UserPlusIcon className="w-5 h-5" />
              Thêm học sinh vào lớp
            </Button>
          )}
        </div>
      </div>

      {/* Filters Card - Cải thiện layout */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-700 font-semibold">
            <FunnelIcon className="w-5 h-5" />
            <span>Bộ lọc chính</span>
          </div>

          {/* Bộ lọc chính - Năm học và Ngành */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            {/* Năm vào */}
            <div>
              <Select
                label="Năm học"
                value={namVao?.toString() || ''}
                onChange={handleNamVaoChange}
                options={namVaoOptions}
                required
              />
              <p className="text-xs text-gray-600 mt-1">Chọn năm vào của học viên</p>
            </div>

            {/* Ngành học */}
            <div>
              <Select
                label="Ngành học"
                value={selectedMaNganh}
                onChange={handleMaNganhChange}
                options={majorOptions}
                disabled={!namVao}
                required
              />
              <p className="text-xs text-gray-600 mt-1">
                {!namVao ? 'Vui lòng chọn năm học trước' : 'Chọn ngành để xem danh sách sinh viên'}
              </p>
            </div>
          </div>

          {/* Bộ lọc phụ - Giới tính và Trạng thái */}
          {namVao && selectedMaNganh && displayStudents.length > 0 && (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">
                Lọc danh sách học viên
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Tìm kiếm */}
                <div className="lg:col-span-2">
                  <Input
                    label="Tìm kiếm"
                    placeholder="Tìm theo mã HV, họ tên, email, điện thoại..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                </div>

                {/* Giới tính */}
                <Select
                  label="Giới tính"
                  value={gioiTinhFilter}
                  onChange={handleGioiTinhChange}
                  options={GIOI_TINH_OPTIONS}
                />

                {/* Trạng thái */}
                <Select
                  label="Trạng thái học"
                  value={trangThaiFilter}
                  onChange={handleTrangThaiChange}
                  options={trangThaiOptions}
                />
              </div>

              {/* Nút xóa bộ lọc */}
              {(searchTerm || gioiTinhFilter || trangThaiFilter) && (
                <div className="flex justify-end mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearFilters}
                  >
                    <ArrowPathIcon className="w-4 h-4 mr-1" />
                    Xóa bộ lọc phụ
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Stats Card */}
      {namVao && selectedMaNganh && (
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AcademicCapIcon className="w-6 h-6 text-blue-600" />
              <div>
                <div className="text-sm text-gray-600">Tổng số học viên</div>
                <div className="text-2xl font-bold text-gray-900">{filteredStudents.length}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {filteredStudents.length > 0 && (
                <div className="text-sm text-gray-600">
                  Hiển thị: {(currentPage - 1) * perPage + 1} - {Math.min(currentPage * perPage, filteredStudents.length)} / {filteredStudents.length}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Table Card */}
      <Card>
        {!namVao || !selectedMaNganh ? (
          <div className="text-center py-12">
            <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Vui lòng chọn năm học và ngành
            </h3>
            <p className="text-gray-600">
              {!namVao && 'Bước 1: Chọn năm học'}
              {namVao && !selectedMaNganh && 'Bước 2: Chọn ngành học để xem danh sách sinh viên'}
            </p>
          </div>
        ) : isLoadingStudents ? (
          <div className="text-center py-12">
            <ArrowPathIcon className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Đang tải danh sách học viên...</p>
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              data={paginatedStudents}
              isLoading={false}
              emptyMessage={
                displayStudents.length === 0
                  ? "Không có học viên nào trong năm và ngành này"
                  : "Không tìm thấy học viên nào phù hợp với bộ lọc"
              }
            />

            {filteredStudents.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  perPage={perPage}
                  total={filteredStudents.length}
                  onPageChange={handlePageChange}
                  onPerPageChange={handlePerPageChange}
                />
              </div>
            )}
          </>
        )}
      </Card>

      {/* ============================================ */}
      {/* MODAL THÊM SINH VIÊN VÀO LỚP */}
      {/* ============================================ */}
      <Modal
        isOpen={addStudentModal.isOpen}
        onClose={addStudentModal.close}
        title="Thêm học sinh vào lớp"
        size="xl"
      >
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200 space-y-4">
            <div className="flex items-center gap-2 text-blue-900 font-semibold mb-2">
              <FunnelIcon className="w-5 h-5" />
              <span>Bộ lọc tìm kiếm học viên</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Năm học */}
              <div>
                <Select
                  label="Năm học"
                  value={studentFilters.namHoc.toString()}
                  onChange={(e) => setStudentFilters(prev => ({
                    ...prev,
                    namHoc: parseInt(e.target.value)
                  }))}
                  options={namVaoOptions.filter(opt => opt.value !== '')}
                />
              </div>

              {/* Ngành học */}
              <div>
                <Select
                  label="Ngành học"
                  value={studentFilters.maNganh}
                  onChange={(e) => setStudentFilters(prev => ({
                    ...prev,
                    maNganh: e.target.value
                  }))}
                  options={majorOptions}
                  required
                />
                {!studentFilters.maNganh && (
                  <p className="text-xs text-orange-600 mt-1">* Vui lòng chọn ngành học</p>
                )}
              </div>

              {/* Giới tính */}
              <div>
                <Select
                  label="Giới tính"
                  value={studentFilters.gioiTinh}
                  onChange={(e) => setStudentFilters(prev => ({
                    ...prev,
                    gioiTinh: e.target.value
                  }))}
                  options={GIOI_TINH_OPTIONS}
                />
              </div>
            </div>

            {/* Tìm kiếm */}
            <Input
              label="Tìm kiếm nhanh"
              placeholder="Nhập mã HV, họ tên, email để tìm kiếm..."
              value={studentFilters.search}
              onChange={(e) => setStudentFilters(prev => ({
                ...prev,
                search: e.target.value
              }))}
            />

            {/* Thông tin số lượng */}
            {studentFilters.maNganh && !isLoadingModalStudents && (
              <div className="bg-white p-2 rounded border border-blue-300">
                <p className="text-sm text-blue-800">
                  📊 Tìm thấy <strong>{availableStudents.length}</strong> học viên phù hợp
                </p>
              </div>
            )}
          </div>

          {/* Danh sách sinh viên */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <UserGroupIcon className="w-5 h-5 text-blue-600" />
                Danh sách sinh viên ({availableStudents.length})
              </h4>
              {availableStudents.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleAllStudents}
                >
                  {selectedStudents.length === availableStudents.length ? (
                    <>❌ Bỏ chọn tất cả</>
                  ) : (
                    <>✅ Chọn tất cả</>
                  )}
                </Button>
              )}
            </div>

            {isLoadingModalStudents ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
                <ArrowPathIcon className="w-10 h-10 animate-spin mx-auto mb-3 text-blue-600" />
                <p className="text-gray-600">Đang tải danh sách sinh viên...</p>
              </div>
            ) : availableStudents.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
                <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">
                  {!studentFilters.maNganh
                    ? '👆 Vui lòng chọn ngành học để hiển thị danh sách'
                    : '🔍 Không tìm thấy sinh viên nào phù hợp'}
                </p>
                {studentFilters.maNganh && (
                  <p className="text-sm text-gray-500 mt-2">
                    Thử thay đổi bộ lọc hoặc năm học
                  </p>
                )}
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto border rounded-lg shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
                    <tr>
                      <th className="w-12 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedStudents.length === availableStudents.length && availableStudents.length > 0}
                          onChange={handleToggleAllStudents}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Mã HV
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Họ và tên
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Giới tính
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Email
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {availableStudents.map((student) => (
                      <tr
                        key={student.maHV}
                        className={`hover:bg-blue-50 cursor-pointer transition-colors ${
                          selectedStudents.includes(student.maHV) ? 'bg-blue-100 border-l-4 border-blue-500' : ''
                        }`}
                        onClick={() => handleToggleStudent(student.maHV)}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(student.maHV)}
                            onChange={() => handleToggleStudent(student.maHV)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-blue-600">
                          {student.maHV}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                          {`${student.hoDem} ${student.ten}`.trim()}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Badge variant={student.gioiTinh === 'Nam' ? 'info' : 'secondary'}>
                            {student.gioiTinh}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {student.email}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Số lượng đã chọn */}
          {selectedStudents.length > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                  {selectedStudents.length}
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-900">
                    ✅ Đã chọn {selectedStudents.length} sinh viên
                  </p>
                  <p className="text-xs text-green-700">
                    Sẵn sàng thêm vào lớp học
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={addStudentModal.close}
              disabled={isAddingStudents}
            >
              ❌ Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleAddStudentsToList}
              disabled={selectedStudents.length === 0 || isAddingStudents}
            >
              {isAddingStudents ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  Đang thêm...
                </>
              ) : (
                <>
                  <PlusIcon className="w-5 h-5" />
                  ➕ Thêm {selectedStudents.length > 0 ? `${selectedStudents.length} ` : ''}sinh viên
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
