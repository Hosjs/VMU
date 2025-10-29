import { useState, useEffect, useMemo } from 'react';
import { classAssignmentService } from '~/services/class-assignment.service';
import { roomService } from '~/services/room.service';
import { useTable } from '~/hooks/useTable';
import type { ClassAssignment } from '~/types/class-assignment';
import type { SelectOption } from '~/types/common';
import {
  UserGroupIcon,
  FunnelIcon,
  ArrowPathIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { Select } from '~/components/ui/Select';
import { Table } from '~/components/ui/Table';
import { Badge } from '~/components/ui/Badge';
import { Card } from '~/components/ui/Card';
import { Pagination } from '~/components/ui/Pagination';
import { STATUS_CONFIG, GIOI_TINH_OPTIONS } from '~/constants/student.constants';

export function meta() {
  return [
    { title: "Phân lớp học viên - VMU Training" },
    { name: "description", content: "Quản lý phân lớp học viên theo lớp học" },
  ];
}

export default function ClassAssignments() {
  const [lopOptions, setLopOptions] = useState<SelectOption[]>([]);
  const [selectedLopId, setSelectedLopId] = useState<number | null>(null);
  const [namVao, setNamVao] = useState<number>(new Date().getFullYear());
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);

  const {
    data: students,
    isLoading,
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
  } = useTable<ClassAssignment>({
    fetchData: classAssignmentService.getList,
    initialPage: 1,
    initialPerPage: 20,
    initialFilters: {
      lopId: null,
    },
  });

  useEffect(() => {
    loadRoomOptions();
  }, [namVao]);

  const loadRoomOptions = async () => {
    try {
      setIsLoadingRooms(true);
      const rooms = await roomService.getLopHocThacSy(namVao);

      const options: SelectOption[] = rooms.map(room => ({
        value: room.id,
        label: `${room.tenLop} - K${room.khoaHoc} - ${room.maNganhHoc}`,
      }));

      setLopOptions(options);

      // Auto select first room if available
      if (options.length > 0 && !selectedLopId) {
        const firstRoomId = Number(options[0].value);
        setSelectedLopId(firstRoomId);
        handleFilter('lopId', firstRoomId);
      }
    } catch (err) {
      console.error('Error loading rooms:', err);
    } finally {
      setIsLoadingRooms(false);
    }
  };

  // ============================================
  // HANDLERS
  // ============================================
  const handleLopChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const lopId = value ? Number(value) : null;
    setSelectedLopId(lopId);
    handleFilter('lopId', lopId);
  };

  const handleNamVaoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(e.target.value, 10);
    setNamVao(isNaN(year) ? new Date().getFullYear() : year);
    setSelectedLopId(null); // Reset lớp đã chọn khi đổi năm
  };

  const handleGioiTinhChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleFilter('gioiTinh', e.target.value);
  };

  const handleTrangThaiChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleFilter('trangThaiHoc', e.target.value);
  };

  // ============================================
  // YEAR OPTIONS
  // ============================================
  const namVaoOptions: SelectOption[] = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years: SelectOption[] = [];

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
      render: (_: ClassAssignment, index: number) => (
        <span className="text-gray-900 font-medium">
          {(meta.current_page - 1) * meta.per_page + index + 1}
        </span>
      ),
    },
    {
      key: 'maHV',
      label: 'Mã học viên',
      sortable: true,
      width: '130px',
      render: (item: ClassAssignment) => (
        <span className="font-semibold text-blue-600">
          {item.maHV || 'Chưa cấp'}
        </span>
      ),
    },
    {
      key: 'hoTen',
      label: 'Họ và tên',
      sortable: true,
      render: (item: ClassAssignment) => (
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
      render: (item: ClassAssignment) => (
        <span className="text-sm text-gray-700">
          {item.ngaySinh ? new Date(item.ngaySinh).toLocaleDateString('vi-VN') : '-'}
        </span>
      ),
    },
    {
      key: 'gioiTinh',
      label: 'Giới tính',
      width: '90px',
      render: (item: ClassAssignment) => (
        <Badge variant={item.gioiTinh === 'Nam' ? 'info' : 'secondary'}>
          {item.gioiTinh}
        </Badge>
      ),
    },
    {
      key: 'dienThoai',
      label: 'Điện thoại',
      width: '120px',
      render: (item: ClassAssignment) => (
        <span className="text-sm text-gray-700">
          {item.dienThoai || '-'}
        </span>
      ),
    },
    {
      key: 'nganhHoc',
      label: 'Ngành học',
      render: (item: ClassAssignment) => (
        <span className="text-sm text-gray-600">
          {item.nganhHoc || item.maNganh || '-'}
        </span>
      ),
    },
    {
      key: 'trangThaiHoc',
      label: 'Trạng thái',
      width: '140px',
      render: (item: ClassAssignment) => (
        item.trangThaiHoc ? getStatusBadge(item.trangThaiHoc) : <Badge variant="default">-</Badge>
      ),
    },
  ], [meta.current_page, meta.per_page]);

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
            Phân lớp học viên
          </h1>
          <p className="text-gray-600 mt-1">
            Quản lý danh sách học viên theo lớp học
          </p>
        </div>
        <Button
          variant="outline"
          onClick={refresh}
          disabled={isLoading}
        >
          <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {/* Filters Card */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-700 font-semibold">
            <FunnelIcon className="w-5 h-5" />
            <span>Bộ lọc</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Năm vào */}
            <Select
              label="Năm vào"
              value={namVao.toString()}
              onChange={(e) => handleNamVaoChange(e as any)}
              options={namVaoOptions}
              disabled={isLoadingRooms}
            />

            {/* Lớp học */}
            <Select
              label="Lớp học"
              value={selectedLopId?.toString() || ''}
              onChange={(e) => handleLopChange(e as any)}
              options={lopOptions}
              disabled={isLoadingRooms || lopOptions.length === 0}
              required
            />

            {/* Giới tính */}
            <Select
              label="Giới tính"
              value={filters.gioiTinh || ''}
              onChange={(e) => handleGioiTinhChange(e as any)}
              options={GIOI_TINH_OPTIONS}
            />

            {/* Trạng thái */}
            <Select
              label="Trạng thái"
              value={filters.trangThaiHoc || ''}
              onChange={(e) => handleTrangThaiChange(e as any)}
              options={trangThaiOptions}
            />
          </div>

          {/* Search */}
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Input
                label="Tìm kiếm"
                placeholder="Tìm theo mã HV, họ tên, email, điện thoại..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            {(search || filters.gioiTinh || filters.trangThaiHoc) && (
              <Button
                variant="outline"
                onClick={handleClearFilters}
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Stats Card */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AcademicCapIcon className="w-6 h-6 text-blue-600" />
            <div>
              <div className="text-sm text-gray-600">Tổng số học viên</div>
              <div className="text-2xl font-bold text-gray-900">{meta.total}</div>
            </div>
          </div>
          {selectedLopId && (
            <div className="text-sm text-gray-600">
              Hiển thị: {meta.from} - {meta.to} / {meta.total}
            </div>
          )}
        </div>
      </Card>

      {/* Table Card */}
      <Card>
        {!selectedLopId ? (
          <div className="text-center py-12">
            <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Vui lòng chọn lớp học
            </h3>
            <p className="text-gray-600">
              Chọn năm vào và lớp học để xem danh sách học viên
            </p>
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              data={students}
              isLoading={isLoading}
              emptyMessage="Không tìm thấy học viên nào trong lớp"
            />

            {meta.total > 0 && (
              <div className="mt-4 border-t pt-4">
                <Pagination
                  currentPage={page}
                  totalPages={meta.last_page}
                  perPage={perPage}
                  total={meta.total}
                  onPageChange={handlePageChange}
                  onPerPageChange={handlePerPageChange}
                />
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
