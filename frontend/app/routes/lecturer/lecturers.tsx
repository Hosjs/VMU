import { useState, useEffect, useMemo } from 'react';
import { lecturerService } from '~/services/lecturer.service';
import { studentService } from '~/services/student.service';
import { useTable } from '~/hooks/useTable';
import { useModal } from '~/hooks/useModal';
import { useForm } from '~/hooks/useForm';
import type { Lecturer, LecturerFormData } from '~/types/lecturer';
import type { SelectOption } from '~/types/common';
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { Button, Input, Select, Table, Badge, Card, Pagination, Modal } from '~/components/ui';
import {
  HOC_HAM_OPTIONS,
  TRINH_DO_CHUYEN_MON_OPTIONS,
  HOC_HAM_BADGE_VARIANT,
  TRINH_DO_BADGE_VARIANT,
} from '~/constants/lecturer.constants';

export function meta() {
  return [
    { title: "Quản lý giảng viên - VMU Training" },
    { name: "description", content: "Quản lý thông tin giảng viên" },
  ];
}

export default function Lecturers() {
  // ============================================
  // STATE & MODALS
  // ============================================
  const [selectedLecturer, setSelectedLecturer] = useState<Lecturer | null>(null);
  const [nganhOptions, setNganhOptions] = useState<SelectOption[]>([{ value: '', label: 'Tất cả' }]);

  const createModal = useModal();
  const editModal = useModal();
  const deleteModal = useModal();

  // ============================================
  // USE TABLE HOOK
  // ============================================
  const {
    data: lecturers,
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
  } = useTable<Lecturer>({
    fetchData: lecturerService.getLecturersPaginated,
    initialPage: 1,
    initialPerPage: 20,
    initialFilters: {},
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
    } catch (err) {
      console.error('Error loading filter options:', err);
    }
  };

  // ============================================
  // FORM HANDLING
  // ============================================
  const form = useForm<LecturerFormData>({
    initialValues: {
      ho_ten: '',
      trinh_do_chuyen_mon: '',
      hoc_ham: '',
      ma_nganh: null,
      ghi_chu: '',
    },
    onSubmit: async (values) => {
      try {
        if (selectedLecturer) {
          await lecturerService.update(selectedLecturer.id, values);
        } else {
          await lecturerService.create(values);
        }
        form.reset();
        createModal.close();
        editModal.close();
        refresh();
      } catch (error: any) {
        console.error('Error saving lecturer:', error);
        alert(error.message || 'Có lỗi xảy ra');
      }
    },
  });

  // ============================================
  // HANDLERS
  // ============================================
  const handleCreate = () => {
    setSelectedLecturer(null);
    form.reset();
    createModal.open();
  };

  const handleEdit = (lecturer: Lecturer) => {
    setSelectedLecturer(lecturer);
    form.setFieldValue('ho_ten', lecturer.hoTen);
    form.setFieldValue('trinh_do_chuyen_mon', lecturer.trinhDoChuyenMon || '');
    form.setFieldValue('hoc_ham', lecturer.hocHam || '');
    form.setFieldValue('ma_nganh', lecturer.maNganh || null);
    form.setFieldValue('ghi_chu', lecturer.ghiChu || '');
    editModal.open();
  };

  const handleDeleteClick = (lecturer: Lecturer) => {
    setSelectedLecturer(lecturer);
    deleteModal.open();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedLecturer) return;

    try {
      await lecturerService.delete(selectedLecturer.id);
      deleteModal.close();
      setSelectedLecturer(null);
      refresh();
    } catch (error: any) {
      console.error('Error deleting lecturer:', error);
      alert(error.message || 'Có lỗi xảy ra khi xóa');
    }
  };

  // ============================================
  // TABLE CONFIGURATION
  // ============================================
  const columns = useMemo(() => [
    {
      key: 'stt',
      label: 'STT',
      width: '60px',
      render: (_: Lecturer, index: number) => (
        <span className="text-gray-900">
          {(page - 1) * perPage + index + 1}
        </span>
      ),
    },
    {
      key: 'hoTen',
      label: 'Họ và tên',
      sortable: true,
      render: (lecturer: Lecturer) => (
        <div className="font-medium text-gray-900">
          {lecturer.hoTen}
        </div>
      ),
    },
    {
      key: 'hocHam',
      label: 'Học hàm',
      width: '140px',
      render: (lecturer: Lecturer) => (
        <div className="text-center">
          {lecturer.hocHam ? (
            <Badge variant={HOC_HAM_BADGE_VARIANT[lecturer.hocHam] || 'default'}>
              {lecturer.hocHam}
            </Badge>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'trinhDoChuyenMon',
      label: 'Trình độ',
      width: '120px',
      render: (lecturer: Lecturer) => (
        <div className="text-center">
          {lecturer.trinhDoChuyenMon ? (
            <Badge variant={TRINH_DO_BADGE_VARIANT[lecturer.trinhDoChuyenMon] || 'default'}>
              {lecturer.trinhDoChuyenMon}
            </Badge>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'major',
      label: 'Ngành',
      render: (lecturer: Lecturer) => (
        <div className="text-sm">
          {lecturer.major ? (
            <>
              <div className="text-gray-900">{lecturer.major.tenNganh}</div>
              <div className="text-xs text-gray-500">Mã: {lecturer.major.maNganh}</div>
            </>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Thao tác',
      width: '120px',
      render: (lecturer: Lecturer) => (
        <div className="flex gap-2 justify-center">
          <Button
            size="sm"
            variant="primary"
            onClick={() => handleEdit(lecturer)}
          >
            <PencilIcon className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDeleteClick(lecturer)}
          >
            <TrashIcon className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ], [page, perPage]);

  // ============================================
  // RENDER
  // ============================================
  if (isLoading && lecturers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách giảng viên...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
            <UserGroupIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý giảng viên</h1>
            <p className="text-sm text-gray-500">Quản lý thông tin giảng viên</p>
          </div>
        </div>

        <Button variant="primary" onClick={handleCreate} leftIcon={<PlusIcon className="w-5 h-5" />}>
          Thêm giảng viên
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2 text-gray-700 font-semibold">
            <FunnelIcon className="w-5 h-5" />
            <span>Bộ lọc</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tìm kiếm
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Tìm theo tên, học hàm, trình độ..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Học hàm */}
            <Select
              label="Học hàm"
              value={filters.hocHam || ''}
              onChange={(e) => handleFilter('hocHam', e.target.value)}
              options={HOC_HAM_OPTIONS}
            />

            {/* Trình độ */}
            <Select
              label="Trình độ"
              value={filters.trinhDoChuyenMon || ''}
              onChange={(e) => handleFilter('trinhDoChuyenMon', e.target.value)}
              options={TRINH_DO_CHUYEN_MON_OPTIONS}
            />
          </div>

          {/* Ngành học */}
          <Select
            label="Ngành học"
            value={filters.maNganh?.toString() || ''}
            onChange={(e) => handleFilter('maNganh', e.target.value ? Number(e.target.value) : undefined)}
            options={nganhOptions}
          />

          {/* Clear filters button */}
          {(search || filters.hocHam || filters.trinhDoChuyenMon || filters.maNganh) && (
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
              Tổng số: <span className="text-green-600">{meta.total}</span> giảng viên
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
            data={lecturers}
            columns={columns}
            keyExtractor={(item) => item.id.toString()}
            isLoading={isLoading}
            emptyMessage="Không tìm thấy giảng viên nào"
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

      {/* Create Modal */}
      <Modal
        isOpen={createModal.isOpen}
        onClose={createModal.close}
        title="Thêm giảng viên mới"
      >
        <form onSubmit={form.handleSubmit} className="space-y-4">
          <Input
            label="Họ và tên"
            required
            value={form.values.ho_ten}
            onChange={(e) => form.setFieldValue('ho_ten', e.target.value)}
            placeholder="Nhập họ tên giảng viên"
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Học hàm"
              value={form.values.hoc_ham || ''}
              onChange={(e) => form.setFieldValue('hoc_ham', e.target.value)}
              options={[
                { value: '', label: '-- Chọn học hàm --' },
                ...HOC_HAM_OPTIONS.filter((opt: SelectOption) => opt.value !== '')
              ]}
            />

            <Select
              label="Trình độ chuyên môn"
              value={form.values.trinh_do_chuyen_mon || ''}
              onChange={(e) => form.setFieldValue('trinh_do_chuyen_mon', e.target.value)}
              options={[
                { value: '', label: '-- Chọn trình độ --' },
                ...TRINH_DO_CHUYEN_MON_OPTIONS.filter((opt: SelectOption) => opt.value !== '')
              ]}
            />
          </div>

          <Select
            label="Ngành học"
            value={form.values.ma_nganh?.toString() || ''}
            onChange={(e) => form.setFieldValue('ma_nganh', e.target.value ? Number(e.target.value) : null)}
            options={nganhOptions}
          />

          <Input
            label="Ghi chú"
            value={form.values.ghi_chu || ''}
            onChange={(e) => form.setFieldValue('ghi_chu', e.target.value)}
            placeholder="Ghi chú thêm"
          />

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="secondary" onClick={createModal.close}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" isLoading={form.isSubmitting}>
              Tạo mới
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={editModal.isOpen}
        onClose={editModal.close}
        title="Cập nhật thông tin giảng viên"
      >
        <form onSubmit={form.handleSubmit} className="space-y-4">
          <Input
            label="Họ và tên"
            required
            value={form.values.ho_ten}
            onChange={(e) => form.setFieldValue('ho_ten', e.target.value)}
            placeholder="Nhập họ tên giảng viên"
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Học hàm"
              value={form.values.hoc_ham || ''}
              onChange={(e) => form.setFieldValue('hoc_ham', e.target.value)}
              options={[
                { value: '', label: '-- Chọn học hàm --' },
                ...HOC_HAM_OPTIONS.filter((opt: SelectOption) => opt.value !== '')
              ]}
            />

            <Select
              label="Trình độ chuyên môn"
              value={form.values.trinh_do_chuyen_mon || ''}
              onChange={(e) => form.setFieldValue('trinh_do_chuyen_mon', e.target.value)}
              options={[
                { value: '', label: '-- Chọn trình độ --' },
                ...TRINH_DO_CHUYEN_MON_OPTIONS.filter((opt: SelectOption) => opt.value !== '')
              ]}
            />
          </div>

          <Select
            label="Ngành học"
            value={form.values.ma_nganh?.toString() || ''}
            onChange={(e) => form.setFieldValue('ma_nganh', e.target.value ? Number(e.target.value) : null)}
            options={nganhOptions}
          />

          <Input
            label="Ghi chú"
            value={form.values.ghi_chu || ''}
            onChange={(e) => form.setFieldValue('ghi_chu', e.target.value)}
            placeholder="Ghi chú thêm"
          />

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="secondary" onClick={editModal.close}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" isLoading={form.isSubmitting}>
              Cập nhật
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="Xác nhận xóa giảng viên"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Bạn có chắc chắn muốn xóa giảng viên{' '}
            <span className="font-semibold text-gray-900">
              {selectedLecturer?.hoTen}
            </span>
            ?
          </p>
          <p className="text-sm text-red-600">
            ⚠️ Hành động này không thể hoàn tác!
          </p>

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="secondary" onClick={deleteModal.close}>
              Hủy
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              Xóa
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
