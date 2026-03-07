import { useState, useEffect, useMemo } from 'react';
import { roomService } from '~/services/room.service';
import { studentService } from '~/services/student.service';
import { useTable } from '~/hooks/useTable';
import { useForm } from '~/hooks/useForm';
import type { Room } from '~/types/room';
import type { SelectOption } from '~/types/common';
import {
  AcademicCapIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { ClassActionButtons } from './components/ClassActionButtons';
import { AddClassModal } from './components/AddClassModal';
import { ViewClassModal } from './components/ViewClassModal';
import { EditClassModal } from './components/EditClassModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { Select } from '~/components/ui/Select';
import { Card } from '~/components/ui/Card';
import { Badge } from '~/components/ui/Badge';
import { Table } from '~/components/ui/Table';
import { Pagination } from '~/components/ui/Pagination';
import { generateKhoaHocOptions } from '~/constants/room.constants';

export function meta() {
  return [
    { title: "Quản lý lớp - VMU Training" },
    { name: "description", content: "Quản lý thông tin lớp học" },
  ];
}

export default function Classes() {
  // ============================================
  // DYNAMIC OPTIONS từ API
  // ============================================
  const [nganhOptions, setNganhOptions] = useState<SelectOption[]>([{ value: '', label: 'Tất cả' }]);
  const [trinhDoOptions, setTrinhDoOptions] = useState<SelectOption[]>([{ value: '', label: 'Tất cả' }]);
  const [khoaHocOptions] = useState<SelectOption[]>(generateKhoaHocOptions(10));
  const [majorNamesMap, setMajorNamesMap] = useState<Record<string, string>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Room | null>(null);

  // ============================================
  // FORM for search
  // ============================================
  const searchForm = useForm({
    initialValues: { search: '' },
    onSubmit: async (values) => {
      handleSearch(values.search);
    },
  });

  // ============================================
  // TABLE HOOK - Fetch data with pagination
  // ============================================
  const {
    data: rooms,
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
  } = useTable<Room>({
    fetchData: roomService.getList,
    initialPage: 1,
    initialPerPage: 20,
    initialSortBy: 'tenLop',
    initialSortDirection: 'asc',
    initialFilters: {
      namVao: new Date().getFullYear(),
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
      // Load ngành học từ API majors
      const majorsData = await studentService.getMajorsList();
      setNganhOptions([
        { value: '', label: 'Tất cả' },
        ...majorsData,
      ]);

      // Build map for quick lookup: maNganh -> tenNganh
      const namesMap: Record<string, string> = {};
      majorsData.forEach(major => {
        if (major.value) {
          namesMap[major.value] = major.label;
        }
      });
      setMajorNamesMap(namesMap);

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

  // ============================================
  // FILTER HANDLERS
  // ============================================
  const handleNamVaoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const year = value ? Number(value) : new Date().getFullYear();
    handleFilter('namVao', year);
  };

  const handleMaNganhChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleFilter('maNganhHoc', e.target.value);
  };

  const handleTrinhDoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleFilter('maTrinhDoDaoTao', e.target.value);
  };

  const handleKhoaHocChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleFilter('khoaHoc', e.target.value);
  };

  const handleClearSearch = () => {
    searchForm.reset();
    handleSearch('');
  };

  const handleClearAllFilters = () => {
    searchForm.reset();
    handleClearFilters();
  };

  // ============================================
  // ACTION HANDLERS
  // ============================================
  const handleView = (room: Room) => {
    setSelectedClass(room);
    setIsViewModalOpen(true);
  };

  const handleEdit = (room: Room) => {
    setSelectedClass(room);
    setIsEditModalOpen(true);
  };

  const handleDelete = (room: Room) => {
    setSelectedClass(room);
    setIsDeleteModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedClass(null);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedClass(null);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedClass(null);
  };

  const handleEditSuccess = () => {
    refresh();
  };

  const handleDeleteSuccess = () => {
    refresh();
  };

  // ============================================
  // TABLE COLUMNS CONFIGURATION
  // ============================================
  const columns = useMemo(() => [
    {
      key: 'stt',
      label: 'STT',
      width: '60px',
      render: (_: Room, index: number) => (
        <span className="text-gray-900">
          {(meta.current_page - 1) * meta.per_page + index + 1}
        </span>
      ),
    },
    {
      key: 'tenLop',
      label: 'Tên lớp',
      sortable: true,
      render: (room: Room) => (
        <div>
          <div className="font-semibold text-blue-600">{room.tenLop || room.class_name}</div>
        </div>
      ),
    },
    {
      key: 'major_name',
      label: 'Ngành học',
      render: (room: Room) => {
        let majorName = room.major_name || room.maNganhHocNavigation?.tenNganh;
        const majorCode = room.major_code || room.maNganhHoc || room.major_id;
        if (!majorName && majorCode && majorNamesMap[majorCode]) {
          majorName = majorNamesMap[majorCode];
        }

        return (
          <div>
            <div className="text-sm font-medium text-gray-800">{majorName || 'Chưa xác định'}</div>
          </div>
        );
      },
    },
    {
      key: 'maTrinhDoDaoTao',
      label: 'Trình độ',
      width: '120px',
      render: (room: Room) => (
        <Badge variant="info">
          {room.maTrinhDoDaoTao || 'Chưa xác định'}
        </Badge>
      ),
    },
    {
      key: 'khoaHoc',
      label: 'Khóa',
      width: '120px',
      sortable: true,
      render: (room: Room) => {
        const khoaHocLabel = room.nam_hoc || room.ma_khoa_hoc || room.khoaHoc_id || room.khoaHoc;
        return (
          <div className="text-center">
            <Badge variant="secondary">
              {khoaHocLabel || 'N/A'}
            </Badge>
          </div>
        );
      },
    },
    {
      key: 'phu_trach_lop',
      label: 'Phụ trách lớp',
      width: '160px',
      render: (room: Room) => {
        const phuTrachLop = room.phu_trach_lop || room.lecturer_name;
        return (
          <div className="text-sm text-gray-700">
            {phuTrachLop || 'Chưa phân công'}
          </div>
        );
      },
    },
    {
      key: 'actions',
      label: 'Thao tác',
      width: '180px',
      render: (room: Room) => (
        <ClassActionButtons
          onView={() => handleView(room)}
          onEdit={() => handleEdit(room)}
          onDelete={() => handleDelete(room)}
        />
      ),
    },
  ], [meta.current_page, meta.per_page, majorNamesMap]);

  // ============================================
  // KEY EXTRACTOR
  // ============================================
  const getRoomKey = (room: Room, index: number): string => {
    return `room-${room.id}-${index}`;
  };

  // ============================================
  // RENDER
  // ============================================
  if (isLoading && rooms.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách lớp học...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <AcademicCapIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý lớp</h1>
            <p className="text-sm text-gray-500">Quản lý thông tin lớp học</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Thêm lớp
          </Button>
          <Button
            variant="primary"
            onClick={refresh}
            disabled={isLoading}
          >
            <ArrowPathIcon className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <Card>
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2 text-gray-700 font-semibold">
            <FunnelIcon className="w-5 h-5" />
            <span>Tìm kiếm & Lọc</span>
          </div>

          <form onSubmit={searchForm.handleSubmit} className="space-y-4">
            {/* Search Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tìm kiếm lớp học
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Tìm theo tên lớp, mã ngành..."
                  value={searchForm.values.search}
                  onChange={(e) => searchForm.handleChange('search', e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      searchForm.handleSubmit();
                    }
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Năm vào */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Năm vào
                </label>
                <Select
                  value={filters.namVao?.toString() || new Date().getFullYear().toString()}
                  onChange={handleNamVaoChange}
                  options={khoaHocOptions}
                />
              </div>

              {/* Ngành học */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngành học
                </label>
                <Select
                  value={filters.maNganhHoc || ''}
                  onChange={handleMaNganhChange}
                  options={nganhOptions}
                />
              </div>

              {/* Trình độ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trình độ
                </label>
                <Select
                  value={filters.maTrinhDoDaoTao || ''}
                  onChange={handleTrinhDoChange}
                  options={trinhDoOptions}
                />
              </div>

              {/* Khóa học */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Khóa học
                </label>
                <Select
                  value={filters.khoaHoc?.toString() || ''}
                  onChange={handleKhoaHocChange}
                  options={khoaHocOptions}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
              >
                <MagnifyingGlassIcon className="w-4 h-4 mr-1" />
                Tìm kiếm
              </Button>
              {searchForm.values.search && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleClearSearch}
                >
                  Xóa tìm kiếm
                </Button>
              )}
              <Button
                type="button"
                variant="secondary"
                onClick={handleClearAllFilters}
              >
                Xóa tất cả bộ lọc
              </Button>
            </div>
          </form>
        </div>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          ⚠️ {error.message}
          <button
            onClick={refresh}
            className="ml-4 underline hover:no-underline"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600 mb-1">Tổng số lớp</div>
            <div className="text-2xl font-bold text-indigo-600">{meta.total || 0}</div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600 mb-1">Hiển thị</div>
            <div className="text-2xl font-bold text-blue-600">
              {meta.from || 0} - {meta.to || 0}
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600 mb-1">Trang hiện tại</div>
            <div className="text-2xl font-bold text-purple-600">
              {meta.current_page} / {meta.last_page}
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600 mb-1">Năm vào</div>
            <div className="text-2xl font-bold text-green-600">
              {filters.namVao || new Date().getFullYear()}
            </div>
          </div>
        </Card>
      </div>

      {/* Table Card */}
      <Card>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Danh sách lớp học
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Hiển thị:</span>
              <select
                value={perPage}
                onChange={(e) => handlePerPageChange(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>/ trang</span>
            </div>
          </div>

          {/* Table with UI component */}
          <Table
             columns={columns}
             data={rooms}
             isLoading={isLoading}
             emptyMessage={
               searchForm.values.search
                ? `Không tìm thấy lớp học nào với từ khóa "${searchForm.values.search}"`
                 : 'Chưa có dữ liệu lớp học'
             }
             keyExtractor={getRoomKey}
           />

          {/* Pagination */}
          {!isLoading && rooms.length > 0 && (
            <div className="flex justify-center mt-4">
              <Pagination
                currentPage={meta.current_page}
                totalPages={meta.last_page}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Add Class Modal */}
      <AddClassModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          refresh();
        }}
      />

      {/* View Class Modal */}
      <ViewClassModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        classData={selectedClass}
      />

      {/* Edit Class Modal */}
      <EditClassModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSuccess={handleEditSuccess}
        classData={selectedClass}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onSuccess={handleDeleteSuccess}
        classData={selectedClass}
      />
    </div>
  );
}
