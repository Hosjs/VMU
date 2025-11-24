import { useState, useMemo } from 'react';
import { majorSubjectService } from '~/services/major-subject.service';
import { majorService } from '~/services/major.service';
import { useTable } from '~/hooks/useTable';
import { useModal } from '~/hooks/useModal';
import { useForm } from '~/hooks/useForm';
import { useAsync } from '~/hooks/useAsync';
import type { MajorSubject, MajorSubjectFormData } from '~/types/major-subject';
import type { Major } from '~/types/major';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  AcademicCapIcon,
  BookOpenIcon,
  FunnelIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { Select } from '~/components/ui/Select';
import { Card } from '~/components/ui/Card';
import { Badge } from '~/components/ui/Badge';
import { Table } from '~/components/ui/Table';
import { Modal } from '~/components/ui/Modal';
import { Pagination } from '~/components/ui/Pagination';

export function meta() {
  return [
    { title: "Quản lý Môn học theo Ngành - VMU" },
    { name: "description", content: "Quản lý danh sách môn học thuộc các ngành đào tạo" },
  ];
}

export default function MajorSubjectsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMajorId, setSelectedMajorId] = useState<number | ''>('');
  const [selectedMajorCode, setSelectedMajorCode] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MajorSubject | null>(null);

  // Modal states
  const addModal = useModal();
  const deleteModal = useModal();

  // Load danh sách ngành cho filter dropdown
  const majorsAsync = useAsync(
    () => majorService.getAllMajors(),
    { immediate: true }
  );

  // Table hook với filters
  const table = useTable<MajorSubject>({
    fetchData: async (params) => {
      const filters: any = {};

      if (selectedMajorId) {
        filters.major_id = selectedMajorId;
      }

      if (selectedMajorCode) {
        filters.maNganh = selectedMajorCode;
      }

      return majorSubjectService.getMajorSubjects({
        page: params.page,
        per_page: params.per_page,
        search: params.search,
        sort_by: params.sort_by,
        sort_order: params.sort_direction,
        ...filters,
      });
    },
    initialPerPage: 20,
    initialSortBy: 'ms.created_at',
    initialSortDirection: 'desc',
  });

  // Form thêm mới
  const addForm = useForm<MajorSubjectFormData>({
    initialValues: {
      major_id: 0,
      subject_id: 0,
    },
    onSubmit: async (values) => {
      try {
        await majorSubjectService.createMajorSubject(values);
        addModal.close();
        addForm.reset();
        table.refresh();
      } catch (error: any) {
        console.error('Error adding major-subject:', error);
        if (error.response?.data?.message) {
          alert(error.response.data.message);
        }
      }
    },
  });

  // Xử lý tìm kiếm
  const handleSearch = () => {
    table.handleSearch(searchTerm);
  };

  // Xử lý xóa
  const handleDeleteClick = (item: MajorSubject) => {
    setItemToDelete(item);
    deleteModal.open();
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      await majorSubjectService.deleteMajorSubject(itemToDelete.id);
      deleteModal.close();
      setItemToDelete(null);
      table.refresh();
    } catch (error) {
      console.error('Error deleting major-subject:', error);
      alert('Lỗi khi xóa môn học khỏi ngành');
    }
  };

  // Clear filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedMajorId('');
    setSelectedMajorCode('');
    table.handleClearFilters();
  };

  // Kiểm tra có filter đang active không
  const hasActiveFilters = searchTerm || selectedMajorId || selectedMajorCode;

  // Prepare major options cho dropdown
  const majorOptions = useMemo(() => {
    if (!majorsAsync.data) return [];
    return majorsAsync.data.map((major: Major) => ({
      value: major.id,
      label: `${major.ma} - ${major.tenNganhHoc}`,
    }));
  }, [majorsAsync.data]);

  // Prepare major code options
  const majorCodeOptions = useMemo(() => {
    if (!majorsAsync.data) return [];
    const uniqueCodes = Array.from(new Set(majorsAsync.data.map((m: Major) => m.ma)));
    return uniqueCodes.map(code => ({
      value: code,
      label: code,
    }));
  }, [majorsAsync.data]);

  // Table columns
  const columns = [
    {
      key: 'maNganh',
      label: 'Mã Ngành',
      sortable: true,
      render: (item: MajorSubject) => (
        <div className="flex items-center gap-2">
          <AcademicCapIcon className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-blue-600">{item.maNganh}</span>
        </div>
      ),
    },
    {
      key: 'tenNganh',
      label: 'Tên Ngành',
      sortable: true,
      render: (item: MajorSubject) => (
        <span className="font-medium">{item.tenNganh}</span>
      ),
    },
    {
      key: 'maMon',
      label: 'Mã Môn',
      sortable: true,
      render: (item: MajorSubject) => (
        <div className="flex items-center gap-2">
          <BookOpenIcon className="h-5 w-5 text-green-600" />
          <span className="font-medium text-green-600">{item.maMon}</span>
        </div>
      ),
    },
    {
      key: 'tenMon',
      label: 'Tên Môn Học',
      sortable: true,
      render: (item: MajorSubject) => (
        <span>{item.tenMon}</span>
      ),
    },
    {
      key: 'soTinChi',
      label: 'Số Tín Chỉ',
      sortable: true,
      render: (item: MajorSubject) => (
        <Badge variant="info">{item.soTinChi} TC</Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Ngày Thêm',
      sortable: true,
      render: (item: MajorSubject) => (
        <span className="text-sm text-gray-600">
          {item.created_at ? new Date(item.created_at).toLocaleDateString('vi-VN') : '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (item: MajorSubject) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteClick(item)}
            className="text-red-600 hover:text-red-700"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <AcademicCapIcon className="h-8 w-8 text-blue-600" />
          Quản lý Môn học theo Ngành
        </h1>
        <p className="text-gray-600 mt-2">
          Quản lý danh sách môn học thuộc các ngành đào tạo
        </p>
      </div>

      {/* Filters Card */}
      <Card className="mb-6">
        <div className="p-4">
          {/* Search and Filter Toggle */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm theo tên ngành, mã ngành, tên môn, mã môn..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSearch} variant="primary">
                <MagnifyingGlassIcon className="h-5 w-5" />
                Tìm kiếm
              </Button>
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className={showFilters ? 'bg-gray-100' : ''}
              >
                <FunnelIcon className="h-5 w-5" />
                Bộ lọc
              </Button>
              {hasActiveFilters && (
                <Button onClick={handleClearFilters} variant="outline">
                  <XMarkIcon className="h-5 w-5" />
                  Xóa lọc
                </Button>
              )}
              <Button onClick={addModal.open} variant="primary">
                <PlusIcon className="h-5 w-5" />
                Thêm mới
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <Select
                label="Lọc theo Ngành"
                value={selectedMajorId}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedMajorId(value ? Number(value) : '');
                  table.handleFilter('major_id', value ? Number(value) : undefined);
                }}
                options={[
                  { value: '', label: 'Tất cả ngành' },
                  ...majorOptions,
                ]}
              />
              <Select
                label="Lọc theo Mã Ngành"
                value={selectedMajorCode}
                onChange={(e) => {
                  setSelectedMajorCode(e.target.value);
                  table.handleFilter('maNganh', e.target.value || undefined);
                }}
                options={[
                  { value: '', label: 'Tất cả mã ngành' },
                  ...majorCodeOptions,
                ]}
              />
            </div>
          )}

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
              <span className="text-sm text-gray-600">Đang lọc:</span>
              {searchTerm && (
                <Badge variant="info">
                  Tìm kiếm: "{searchTerm}"
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      table.handleSearch('');
                    }}
                    className="ml-2"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedMajorId && (
                <Badge variant="success">
                  Ngành: {majorOptions.find(m => m.value === selectedMajorId)?.label}
                  <button
                    onClick={() => {
                      setSelectedMajorId('');
                      table.handleFilter('major_id', undefined);
                    }}
                    className="ml-2"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedMajorCode && (
                <Badge variant="warning">
                  Mã ngành: {selectedMajorCode}
                  <button
                    onClick={() => {
                      setSelectedMajorCode('');
                      table.handleFilter('maNganh', undefined);
                    }}
                    className="ml-2"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600">Tổng số bản ghi</div>
            <div className="text-2xl font-bold text-blue-600">{table.meta.total}</div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600">Trang hiện tại</div>
            <div className="text-2xl font-bold text-green-600">
              {table.meta.current_page} / {table.meta.last_page}
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600">Số ngành</div>
            <div className="text-2xl font-bold text-purple-600">
              {majorsAsync.data?.length || 0}
            </div>
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          data={table.data}
          isLoading={table.isLoading}
          sortBy={table.sortBy}
          sortDirection={table.sortDirection}
          onSort={table.handleSort}
          emptyMessage="Không tìm thấy dữ liệu"
        />

        {/* Pagination */}
        <div className="p-4 border-t">
          <Pagination
            currentPage={table.meta.current_page}
            totalPages={table.meta.last_page}
            perPage={table.perPage}
            total={table.meta.total}
            onPageChange={table.handlePageChange}
            onPerPageChange={table.handlePerPageChange}
          />
        </div>
      </Card>

      {/* Add Modal */}
      <Modal
        isOpen={addModal.isOpen}
        onClose={addModal.close}
        title="Thêm Môn học vào Ngành"
      >
        <form onSubmit={addForm.handleSubmit} className="space-y-4">
          <Select
            label="Chọn Ngành"
            value={addForm.values.major_id}
            onChange={(e) => addForm.handleChange('major_id', Number(e.target.value))}
            required
            options={[
              { value: 0, label: 'Chọn ngành...' },
              ...majorOptions,
            ]}
          />

          <Select
            label="Chọn Môn học"
            value={addForm.values.subject_id}
            onChange={(e) => addForm.handleChange('subject_id', Number(e.target.value))}
            required
            options={[
              { value: 0, label: 'Chọn môn học...' },
              // TODO: Load subjects dynamically
            ]}
            helperText="Chọn ngành trước để xem danh sách môn học có thể thêm"
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={addModal.close}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" disabled={addForm.isSubmitting}>
              {addForm.isSubmitting ? 'Đang thêm...' : 'Thêm'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="Xác nhận xóa"
      >
        <div className="space-y-4">
          <p>
            Bạn có chắc chắn muốn xóa môn học <strong>{itemToDelete?.tenMon}</strong> khỏi ngành{' '}
            <strong>{itemToDelete?.tenNganh}</strong>?
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={deleteModal.close}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              <TrashIcon className="h-4 w-4" />
              Xóa
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
