import { useState, useMemo, useEffect } from 'react';
import { majorService } from '~/services/major.service';
import { useTable } from '~/hooks/useTable';
import { useModal } from '~/hooks/useModal';
import { useForm } from '~/hooks/useForm';
import type { Major, MajorFormData } from '~/types/major';
import type { TableQueryParams } from '~/types/common';
import {
  AcademicCapIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { Card } from '~/components/ui/Card';
import { Badge } from '~/components/ui/Badge';
import { Table } from '~/components/ui/Table';
import { Pagination } from '~/components/ui/Pagination';
import { Modal } from '~/components/ui/Modal';

export function meta() {
  return [
    { title: "Quản lý ngành học - VMU Training" },
    { name: "description", content: "Quản lý danh sách các ngành học" },
  ];
}

export default function MajorsPage() {
  const [selectedMajor, setSelectedMajor] = useState<Major | null>(null);
  const [allMajors, setAllMajors] = useState<Major[]>([]);
  const createModal = useModal();
  const editModal = useModal();
  const deleteModal = useModal();

  const sortFieldMap: Record<string, string> = {
    'ma': 'maNganh',
    'tenNganhHoc': 'tenNganh',
    'thoiGianDaoTao': 'thoi_gian_dao_tao',
  };

  // Custom fetch function để map sort field
  const fetchMajorsWithMapping = async (params: TableQueryParams) => {
    // Map sort_by từ accessor sang database column
    if (params.sort_by && sortFieldMap[params.sort_by]) {
      params = {
        ...params,
        sort_by: sortFieldMap[params.sort_by],
      };
    }
    return majorService.getMajors(params);
  };

  const table = useTable<Major>({
    fetchData: fetchMajorsWithMapping,
    initialPage: 1,
    initialPerPage: 20,
    initialSortBy: 'maNganh',
    initialSortDirection: 'asc',
  });

  // Load all majors for parent dropdown
  useEffect(() => {
    const loadAllMajors = async () => {
      try {
        const majors = await majorService.getAllMajors();
        setAllMajors(majors);
      } catch (error) {
        console.error('Error loading majors:', error);
      }
    };
    loadAllMajors();
  }, [table.data]);

  // ============================================
  // FORM for Create/Edit
  // ============================================
  const form = useForm<MajorFormData>({
    initialValues: {
      ma_nganh: '',
      ten_nganh: '',
      mo_ta: '',
      thoi_gian_dao_tao: undefined,
      parent_id: null,
    },
    onSubmit: async (values) => {
      try {
        if (selectedMajor) {
          await majorService.updateMajor(selectedMajor.id, values);
        } else {
          await majorService.createMajor(values);
        }
        form.reset();
        createModal.close();
        editModal.close();
        table.refresh();
      } catch (error: any) {
        console.error('Error saving major:', error);
        alert(error.message || 'Có lỗi xảy ra');
      }
    },
  });

  const columns = useMemo(() => [
    {
      key: 'stt',
      label: 'STT',
      width: '60px',
      render: (_: Major, index: number) => (
        <span className="text-gray-900">
          {(table.meta.current_page - 1) * table.meta.per_page + index + 1}
        </span>
      ),
    },
    {
      key: 'ma',
      label: 'Mã ngành',
      sortable: true,
      width: '120px',
      render: (item: Major) => (
        <span className="font-semibold text-blue-600">
          {item.ma || '-'}
        </span>
      ),
    },
    {
      key: 'tenNganhHoc',
      label: 'Tên ngành',
      sortable: true,
      render: (item: Major) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {item.tenNganhHoc || '-'}
          </div>
          {item.parent && (
            <div className="text-xs text-gray-500 mt-1">
              Thuộc: {item.parent.tenNganhHoc}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'thoiGianDaoTao',
      label: 'Thời gian',
      width: '100px',
      render: (item: Major) => (
        <div className="text-center">
          {item.thoiGianDaoTao ? (
            <Badge variant="info">{item.thoiGianDaoTao} năm</Badge>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'level',
      label: 'Cấp độ',
      width: '120px',
      render: (item: Major) => (
        <div className="text-center">
          {item.daoTaoThacSy && (
            <Badge variant="success">Thạc sỹ</Badge>
          )}
          {item.daoTaoThacSy && item.daoTaoTienSy && <span className="mx-1"></span>}
          {item.daoTaoTienSy && (
            <Badge variant="warning">Tiến sỹ</Badge>
          )}
          {!item.daoTaoThacSy && !item.daoTaoTienSy && (
            <Badge variant="default">Khác</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Thao tác',
      width: '120px',
      render: (item: Major) => (
        <div className="flex gap-2 justify-center">
          <Button
            size="sm"
            variant="primary"
            onClick={() => handleEdit(item)}
          >
            <PencilIcon className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDeleteClick(item)}
          >
            <TrashIcon className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ], [table.meta.current_page, table.meta.per_page]);

  const handleCreate = () => {
    setSelectedMajor(null);
    form.reset();
    createModal.open();
  };

  const handleEdit = (major: Major) => {
    setSelectedMajor(major);
    form.setFieldValue('ma_nganh', major.ma);
    form.setFieldValue('ten_nganh', major.tenNganhHoc);
    form.setFieldValue('mo_ta', major.mo_ta || '');
    form.setFieldValue('thoi_gian_dao_tao', major.thoiGianDaoTao);
    form.setFieldValue('parent_id', major.parent_id || null);
    editModal.open();
  };

  const handleDeleteClick = (major: Major) => {
    setSelectedMajor(major);
    deleteModal.open();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedMajor) return;

    try {
      await majorService.deleteMajor(selectedMajor.id);
      deleteModal.close();
      table.refresh();
    } catch (error: any) {
      console.error('Error deleting major:', error);
      alert(error.message || 'Có lỗi xảy ra khi xóa');
    }
  };

  // Get parent majors (no parent_id)
  const parentMajors = allMajors.filter(m => !m.parent_id);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <AcademicCapIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý ngành học</h1>
            <p className="text-sm text-gray-500">Quản lý thông tin các ngành đào tạo</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => table.refresh()}
            disabled={table.isLoading}
          >
            <ArrowPathIcon className={`w-5 h-5 mr-2 ${table.isLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          <Button variant="primary" onClick={handleCreate}>
            <PlusIcon className="w-5 h-5 mr-2" />
            Thêm ngành học
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <Card>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tìm kiếm
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Tìm theo mã ngành, tên ngành..."
                  value={table.search}
                  onChange={(e) => table.handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Per Page */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hiển thị
              </label>
              <select
                value={table.meta.per_page}
                onChange={(e) => table.handlePerPageChange(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value={10}>10 / trang</option>
                <option value={20}>20 / trang</option>
                <option value={50}>50 / trang</option>
                <option value={100}>100 / trang</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Error Message */}
      {table.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          ⚠️ {table.error.message}
          <button
            onClick={() => table.refresh()}
            className="ml-4 underline hover:no-underline"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Table Card */}
      <Card>
        <div className="p-4 space-y-4">
          <Table
            columns={columns}
            data={table.data}
            isLoading={table.isLoading}
            emptyMessage="Chưa có dữ liệu ngành học"
            onSort={table.handleSort}
            sortBy={table.sortBy}
            sortDirection={table.sortDirection}
            keyExtractor={(item) => String(item.id)}
          />

          {/* Pagination */}
          {!table.isLoading && table.data.length > 0 && (
            <div className="flex justify-center mt-4">
              <Pagination
                currentPage={table.meta.current_page}
                totalPages={table.meta.last_page}
                onPageChange={table.handlePageChange}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={createModal.isOpen || editModal.isOpen}
        onClose={() => {
          createModal.close();
          editModal.close();
        }}
        title={selectedMajor ? 'Cập nhật ngành học' : 'Thêm ngành học mới'}
      >
        <form onSubmit={form.handleSubmit} className="space-y-4">
          <Input
            label="Mã ngành"
            name="ma_nganh"
            value={form.values.ma_nganh}
            onChange={(e) => form.handleChange('ma_nganh', e.target.value)}
            error={form.errors.ma_nganh}
            required
            disabled={!!selectedMajor}
            placeholder="VD: 8310110, 9480201"
          />

          <Input
            label="Tên ngành"
            name="ten_nganh"
            value={form.values.ten_nganh}
            onChange={(e) => form.handleChange('ten_nganh', e.target.value)}
            error={form.errors.ten_nganh}
            required
            placeholder="VD: Quản lý kinh tế - ThS"
          />

          <Input
            label="Thời gian đào tạo (năm)"
            type="number"
            step="0.5"
            value={form.values.thoi_gian_dao_tao || ''}
            onChange={(e) => form.handleChange('thoi_gian_dao_tao', e.target.value ? Number(e.target.value) : undefined)}
            placeholder="VD: 2, 4"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngành cha (nếu là chương trình con)
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={form.values.parent_id || ''}
              onChange={(e) => form.handleChange('parent_id', e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">-- Không có ngành cha --</option>
              {parentMajors.map(major => (
                <option key={major.id} value={major.id}>
                  {major.ma} - {major.tenNganhHoc}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ghi chú
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              rows={3}
              value={form.values.mo_ta || ''}
              onChange={(e) => form.handleChange('mo_ta', e.target.value)}
              placeholder="Mô tả thêm về ngành học..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                createModal.close();
                editModal.close();
              }}
            >
              Hủy
            </Button>
            <Button type="submit" variant="primary" disabled={form.isSubmitting}>
              {form.isSubmitting ? 'Đang lưu...' : selectedMajor ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="Xác nhận xóa"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Bạn có chắc chắn muốn xóa ngành học <strong>{selectedMajor?.tenNganhHoc}</strong>?
          </p>
          {selectedMajor?.children && selectedMajor.children.length > 0 && (
            <p className="text-red-600 text-sm">
              ⚠️ Ngành học này có {selectedMajor.children.length} chương trình con. Không thể xóa!
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={deleteModal.close}>
              Hủy
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              disabled={selectedMajor?.children && selectedMajor.children.length > 0}
            >
              Xóa
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
