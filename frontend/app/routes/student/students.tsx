import { useState, useEffect, useMemo } from 'react';
import { studentService } from '~/services/student.service';
import { useTable } from '~/hooks/useTable';
import type { Student } from '~/types/student';
import type { SelectOption } from '~/types/common';
import { UserGroupIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { Select } from '~/components/ui/Select';
import { Table } from '~/components/ui/Table';
import { Badge } from '~/components/ui/Badge';
import { Card } from '~/components/ui/Card';
import { Pagination } from '~/components/ui/Pagination';
import {
  STATUS_CONFIG,
  TRINH_DO_OPTIONS,
  GIOI_TINH_OPTIONS,
} from '~/constants/student.constants';

export function meta() {
  return [
    { title: "Danh sách học viên - VMU Training" },
    { name: "description", content: "Quản lý thông tin học viên thạc sỹ" },
  ];
}

export default function Students() {
  // ============================================
  // DYNAMIC OPTIONS từ API
  // ============================================
  const [nganhOptions, setNganhOptions] = useState<SelectOption[]>([{ value: '', label: 'Tất cả' }]);
  const [trinhDoOptions, setTrinhDoOptions] = useState<SelectOption[]>(TRINH_DO_OPTIONS);
  const [namVaoOptions, setNamVaoOptions] = useState<SelectOption[]>([]);

  // Local filters (sẽ merge vào useTable filters)
  const [namVao, setNamVao] = useState<number>(new Date().getFullYear());
  const [maNganh, setMaNganh] = useState<string>('');

  // ✅ SỬ DỤNG useTable HOOK
  const {
    data: students,
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
  } = useTable<Student>({
    fetchData: studentService.getStudentsPaginated,
    initialPage: 1,
    initialPerPage: 20,
    initialFilters: {
      namVao: new Date().getFullYear(),
      maNganh: '',
    },
  });

  // ============================================
  // LOAD DYNAMIC OPTIONS
  // ============================================
  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    try {
      // Load ngành học từ database
      const nganhData = await studentService.getNganhHocList();
      setNganhOptions([
        { value: '', label: 'Tất cả' },
        ...nganhData.map(n => ({
          value: n.maNganh,
          label: `${n.tenNganh} (${n.maNganh})`,
        })),
      ]);

      // Load trình độ từ database
      const trinhDoData = await studentService.getTrinhDoList();
      setTrinhDoOptions([
        { value: '', label: 'Tất cả' },
        ...trinhDoData.map(t => ({
          value: t.maTrinhDoDaoTao,
          label: t.tenTrinhDo,
        })),
      ]);
    } catch (err) {
      console.error('Error loading filter options:', err);
    }
  };

  // Generate year options dynamically
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const years: SelectOption[] = [{ value: '', label: 'Tất cả' }];

    for (let year = currentYear + 2; year >= currentYear - 10; year--) {
      years.push({ value: year.toString(), label: year.toString() });
    }

    setNamVaoOptions(years);
  }, []);

  // ============================================
  // FILTER HANDLERS
  // ============================================
  const handleNamVaoChange = (value: string) => {
    const year = value ? Number(value) : new Date().getFullYear();
    setNamVao(year);
    handleFilter('namVao', year);
  };

  const handleMaNganhChange = (value: string) => {
    setMaNganh(value);
    handleFilter('maNganh', value);
  };

  const handleGioiTinhChange = (value: string) => {
    handleFilter('gioiTinh', value);
  };

  const handleTrinhDoChange = (value: string) => {
    handleFilter('trinhDo', value);
  };

  // ============================================
  // TABLE CONFIGURATION
  // ============================================
  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status] || { label: status, variant: 'default' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const columns = useMemo(() => [
    {
      key: 'maHV',
      label: 'Mã học viên',
      render: (student: Student) => (
        <span className="font-semibold text-blue-600">{student.maHV || 'Chưa cấp'}</span>
      ),
    },
    {
      key: 'hoTen',
      label: 'Họ và tên',
      render: (student: Student) => (
        <div>
          <div className="font-medium">{`${student.hoDem} ${student.ten}`}</div>
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
    {
      key: 'nganh',
      label: 'Ngành học',
      render: (student: Student) => (
        <div>
          <div className="text-sm">
            {student.nganhHoc || student.nganh?.tenNganh || student.maNganh}
          </div>
          <div className="text-xs text-gray-500">Mã: {student.maNganh}</div>
        </div>
      ),
    },
    {
      key: 'namVaoTruong',
      label: 'Năm vào',
      render: (student: Student) => student.namVaotruong || student.namVaoTruong,
    },
    {
      key: 'trangThai',
      label: 'Trạng thái',
      render: (student: Student) => getStatusBadge(student.trangThaiHoc || student.trangThai),
    },
  ], []);

  const getStudentKey = (student: Student, index: number): string => {
    return student.maHV || `student-${index}-${student.email || student.dienThoai || Math.random()}`;
  };

  // ============================================
  // RENDER
  // ============================================
  if (isLoading && students.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách học viên...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <UserGroupIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Danh sách học viên</h1>
            <p className="text-sm text-gray-500">Quản lý thông tin học viên</p>
          </div>
        </div>

        <Button variant="primary" onClick={() => {}}>
          + Thêm học viên
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2 text-gray-700 font-semibold">
            <FunnelIcon className="w-5 h-5" />
            <span>Bộ lọc</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tìm kiếm
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Tìm theo mã, tên, email, SĐT..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Năm vào - Dynamic từ API */}
            <Select
              label="Năm vào trường"
              value={namVao.toString()}
              onChange={(e) => handleNamVaoChange(e.target.value)}
              options={namVaoOptions}
            />

            {/* Trình độ - Dynamic từ API */}
            <Select
              label="Trình độ đào tạo"
              value={filters.trinhDo || ''}
              onChange={(e) => handleTrinhDoChange(e.target.value)}
              options={trinhDoOptions}
            />

            {/* Giới tính - Static */}
            <Select
              label="Giới tính"
              value={filters.gioiTinh || ''}
              onChange={(e) => handleGioiTinhChange(e.target.value)}
              options={GIOI_TINH_OPTIONS}
            />
          </div>

          {/* Ngành học - Dynamic từ database */}
          <Select
            label="Ngành học"
            value={maNganh}
            onChange={(e) => handleMaNganhChange(e.target.value)}
            options={nganhOptions}
          />

          {/* Clear filters button */}
          {(search || filters.gioiTinh || filters.trinhDo) && (
            <div className="flex justify-end">
              <Button
                variant="secondary"
                onClick={handleClearFilters}
                className="text-sm"
              >
                🔄 Xóa bộ lọc
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          ⚠️ {error.message}
        </div>
      )}

      {/* Table Card */}
      <Card>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Tổng số: <span className="text-blue-600">{meta.total}</span> học viên
              <span className="text-sm text-gray-500 ml-2">
                (Hiển thị {meta.from}-{meta.to})
              </span>
            </h2>
            <Button
              variant="secondary"
              onClick={refresh}
              className="text-sm"
            >
              🔄 Làm mới
            </Button>
          </div>

          <Table
            data={students}
            columns={columns}
            keyExtractor={getStudentKey}
            isLoading={isLoading}
            emptyMessage="Không tìm thấy học viên nào"
          />
        </div>

        {/* Pagination */}
        {meta.total > 0 && (
          <Pagination
            currentPage={page}
            totalPages={meta.last_page}
            onPageChange={handlePageChange}
            perPage={perPage}
            onPerPageChange={handlePerPageChange}
            total={meta.total}
          />
        )}
      </Card>
    </div>
  );
}
