import { useState, useEffect, useMemo } from 'react';
import { studentService } from '~/services/student.service';
import { useTable } from '~/hooks/useTable';
import { useModal } from '~/hooks/useModal';
import { useForm } from '~/hooks/useForm';
import type { Student } from '~/types/student';
import type { SelectOption } from '~/types/common';
import { UserGroupIcon, MagnifyingGlassIcon, FunnelIcon, PencilIcon, TrashIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { Button, Input, Select, Table, Badge, Card, Pagination, Modal, Toast } from '~/components/ui';
import type { ToastType } from '~/components/ui/Toast';
import {
  STATUS_CONFIG,
  TRINH_DO_OPTIONS,
  GIOI_TINH_OPTIONS,
} from '~/constants/student.constants';
import * as XLSX from 'xlsx';

export function meta() {
  return [
    { title: "Danh sách học viên - VMU Training" },
    { name: "description", content: "Quản lý thông tin học viên thạc sỹ" },
  ];
}

export default function Students() {
  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  /**
   * Format date string to yyyy-MM-dd for API compatibility
   * Handles: ISO datetime, yyyy-MM-dd, null/undefined
   */
  const formatDateToYYYYMMDD = (dateValue: string | null | undefined): string => {
    if (!dateValue) return '';

    // Already in yyyy-MM-dd format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue;
    }

    // Convert ISO datetime or other formats
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return '';

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
    } catch {
      return '';
    }
  };

  // ============================================
  // STATE & HOOKS
  // ============================================
  const [nganhOptions, setNganhOptions] = useState<SelectOption[]>([{ value: '', label: 'Tất cả' }]);
  const [trinhDoOptions, setTrinhDoOptions] = useState<SelectOption[]>(TRINH_DO_OPTIONS);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // ✅ SỬ DỤNG useTable HOOK (kế thừa logic pagination, search, filter)
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
      namVao: '',
      maNganh: '',
      trinhDo: '',
      gioiTinh: '',
    },
  });

  // ============================================
  // CRUD STATE với useModal & Toast
  // ============================================
  const createModal = useModal();
  const editModal = useModal();
  const deleteModal = useModal();

  // ============================================
  // FORM INITIAL VALUES
  // ============================================
  const getInitialFormValues = (student?: Student | null): Partial<Student> => {
    if (student) {
      return {
        maHV: student.maHV,
        hoDem: student.hoDem,
        ten: student.ten,
        ngaySinh: formatDateToYYYYMMDD(student.ngaySinh),
        gioiTinh: student.gioiTinh,
        soGiayToTuyThan: student.soGiayToTuyThan,
        dienThoai: student.dienThoai,
        email: student.email,
        quocTich: student.quocTich || 'Việt Nam',
        danToc: student.danToc || 'Kinh',
        tonGiao: student.tonGiao || 'Không',
        maTrinhDoDaoTao: student.maTrinhDoDaoTao,
        maNganh: student.maNganh,
        trangThai: student.trangThai,
        ngayNhapHoc: formatDateToYYYYMMDD(student.ngayNhapHoc),
        namVaoTruong: student.namVaoTruong,
      };
    }

    return {
      maHV: '',
      hoDem: '',
      ten: '',
      ngaySinh: '',
      gioiTinh: 'Nam',
      soGiayToTuyThan: '',
      dienThoai: '',
      email: '',
      quocTich: 'Việt Nam',
      danToc: 'Kinh',
      tonGiao: 'Không',
      maTrinhDoDaoTao: '',
      maNganh: '',
      trangThai: 'DangHoc' as any,
      ngayNhapHoc: new Date().toISOString().split('T')[0],
      namVaoTruong: new Date().getFullYear(),
    };
  };

  // ============================================
  // FORM VALIDATION
  // ============================================
  const validateForm = (values: Partial<Student>): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!values.maHV?.trim()) errors.maHV = 'Mã học viên là bắt buộc';
    if (!values.hoDem?.trim()) errors.hoDem = 'Họ đệm là bắt buộc';
    if (!values.ten?.trim()) errors.ten = 'Tên là bắt buộc';
    if (!values.email?.trim()) errors.email = 'Email là bắt buộc';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errors.email = 'Email không hợp lệ';
    }
    if (!values.dienThoai?.trim()) errors.dienThoai = 'Số điện thoại là bắt buộc';
    if (!values.soGiayToTuyThan?.trim()) errors.soGiayToTuyThan = 'Số CMND/CCCD là bắt buộc';
    if (!values.maNganh?.trim()) errors.maNganh = 'Ngành học là bắt buộc';
    if (!values.maTrinhDoDaoTao?.trim()) errors.maTrinhDoDaoTao = 'Trình độ là bắt buộc';

    return errors;
  };

  // ============================================
  // CREATE FORM
  // ============================================
  const createForm = useForm<Partial<Student>>({
    initialValues: getInitialFormValues(),
    validate: validateForm,
    onSubmit: async (values) => {
      try {
        // Format dates before sending to API
        const payload = {
          ...values,
          ngaySinh: formatDateToYYYYMMDD(values.ngaySinh),
          ngayNhapHoc: formatDateToYYYYMMDD(values.ngayNhapHoc),
        };

        await studentService.create(payload);
        setToast({ message: '✅ Thêm học viên thành công!', type: 'success' });
        createModal.close();
        refresh();
      } catch (error: any) {
        setToast({ message: `❌ Lỗi: ${error.message}`, type: 'error' });
      }
    },
  });

  // ============================================
  // EDIT FORM
  // ============================================
  const editForm = useForm<Partial<Student>>({
    initialValues: getInitialFormValues(selectedStudent),
    validate: validateForm,
    onSubmit: async (values) => {
      if (!selectedStudent?.maHV) return;

      try {
        // Format dates before sending to API
        const payload = {
          ...values,
          ngaySinh: formatDateToYYYYMMDD(values.ngaySinh),
          ngayNhapHoc: formatDateToYYYYMMDD(values.ngayNhapHoc),
        };

        console.log('📤 Sending update request:', {
          maHV: selectedStudent.maHV,
          payload: payload
        });

        await studentService.update(selectedStudent.maHV, payload);

        console.log('✅ Update successful');
        setToast({ message: '✅ Cập nhật học viên thành công!', type: 'success' });
        editModal.close();
        setSelectedStudent(null);
        refresh();
      } catch (error: any) {
        console.error('❌ Update failed:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.status,
          data: error.data
        });

        // Show detailed error message
        let errorMessage = '❌ Lỗi: ';
        if (error.data?.errors) {
          // Laravel validation errors
          const validationErrors = Object.entries(error.data.errors)
            .map(([field, messages]: [string, any]) => {
              const msgs = Array.isArray(messages) ? messages : [messages];
              return `${field}: ${msgs.join(', ')}`;
            })
            .join('; ');
          errorMessage += validationErrors;
        } else if (error.data?.message) {
          errorMessage += error.data.message;
        } else {
          errorMessage += error.message;
        }

        setToast({ message: errorMessage, type: 'error' });
      }
    },
  });

  // ============================================
  // CRUD HANDLERS
  // ============================================
  const handleCreate = () => {
    createForm.reset();
    createModal.open();
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    editModal.open();
  };

  const handleDeleteClick = (student: Student) => {
    setSelectedStudent(student);
    deleteModal.open();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedStudent?.maHV) return;

    try {
      await studentService.delete(selectedStudent.maHV);
      setToast({ message: '✅ Xóa học viên thành công!', type: 'success' });
      deleteModal.close();
      setSelectedStudent(null);
      refresh();
    } catch (error: any) {
      setToast({ message: `❌ Lỗi: ${error.message}`, type: 'error' });
    }
  };

  // ============================================
  // EXPORT TO EXCEL
  // ============================================
  const handleExportToExcel = async () => {
    try {
      setIsExporting(true);
      setToast({ message: '⏳ Đang xuất dữ liệu...', type: 'info' });

      // Lấy tất cả học viên (không phân trang)
      const allStudentsResponse = await studentService.getStudentsPaginated({
        page: 1,
        per_page: 10000,
        search,
        filters,
      });

      const allStudents = allStudentsResponse.data;

      if (allStudents.length === 0) {
        setToast({ message: '⚠️ Không có dữ liệu để xuất!', type: 'warning' });
        setIsExporting(false);
        return;
      }

      // Chuẩn bị dữ liệu cho Excel
      const excelData = allStudents.map((student, index) => ({
        'STT': index + 1,
        'Mã học viên': student.maHV || '',
        'Họ đệm': student.hoDem || '',
        'Tên': student.ten || '',
        'Ngày sinh': student.ngaySinh || '',
        'Giới tính': student.gioiTinh || '',
        'Số điện thoại': student.dienThoai || '',
        'Email': student.email || '',
        'CMND/CCCD': student.soGiayToTuyThan || '',
        'Quốc tịch': student.quocTich || '',
        'Dân tộc': student.danToc || '',
        'Tôn giáo': student.tonGiao || '',
        'Ngành học': student.nganhHoc || student.nganh?.tenNganh || student.maNganh || '',
        'Mã ngành': student.maNganh || '',
        'Trình độ': student.trinhDoDaoTao?.tenTrinhDo || student.maTrinhDoDaoTao || '',
        'Năm vào trường': student.namVaotruong || student.namVaoTruong || '',
        'Ngày nhập học': student.ngayNhapHoc || '',
        'Trạng thái': student.trangThaiHoc || student.trangThai || '',
      }));

      // Tạo worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Tự động điều chỉnh độ rộng cột
      const columnWidths = [
        { wch: 5 },  { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 10 },
        { wch: 15 }, { wch: 30 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
        { wch: 35 }, { wch: 12 }, { wch: 20 }, { wch: 12 }, { wch: 15 }, { wch: 15 },
      ];
      worksheet['!cols'] = columnWidths;

      // Tạo workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách học viên');

      // Tạo tên file với timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const fileName = `Danh_sach_hoc_vien_${timestamp}.xlsx`;

      // Xuất file
      XLSX.writeFile(workbook, fileName);

      setToast({ message: `✅ Đã xuất ${allStudents.length} học viên ra file Excel!`, type: 'success' });
    } catch (error: any) {
      console.error('Export error:', error);
      setToast({ message: `❌ Lỗi khi xuất Excel: ${error.message}`, type: 'error' });
    } finally {
      setIsExporting(false);
    }
  };

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

  // Update edit form when selectedStudent changes
  useEffect(() => {
    if (selectedStudent && editModal.isOpen) {
      editForm.setFieldValue('maHV', selectedStudent.maHV);
      editForm.setFieldValue('hoDem', selectedStudent.hoDem);
      editForm.setFieldValue('ten', selectedStudent.ten);
      editForm.setFieldValue('ngaySinh', selectedStudent.ngaySinh);
      editForm.setFieldValue('gioiTinh', selectedStudent.gioiTinh);
      editForm.setFieldValue('soGiayToTuyThan', selectedStudent.soGiayToTuyThan);
      editForm.setFieldValue('dienThoai', selectedStudent.dienThoai);
      editForm.setFieldValue('email', selectedStudent.email);
      editForm.setFieldValue('quocTich', selectedStudent.quocTich || 'Việt Nam');
      editForm.setFieldValue('danToc', selectedStudent.danToc || 'Kinh');
      editForm.setFieldValue('tonGiao', selectedStudent.tonGiao || 'Không');
      editForm.setFieldValue('maTrinhDoDaoTao', selectedStudent.maTrinhDoDaoTao);
      editForm.setFieldValue('maNganh', selectedStudent.maNganh);
      editForm.setFieldValue('trangThai', selectedStudent.trangThai);
      editForm.setFieldValue('ngayNhapHoc', selectedStudent.ngayNhapHoc);
      editForm.setFieldValue('namVaoTruong', selectedStudent.namVaoTruong);
    }
  }, [selectedStudent, editModal.isOpen]);

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
    {
      key: 'actions',
      label: 'Hành động',
      render: (student: Student) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEdit(student)}
            leftIcon={<PencilIcon className="w-4 h-4" />}
          >
            Sửa
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleDeleteClick(student)}
            leftIcon={<TrashIcon className="w-4 h-4" />}
            className="text-red-600 hover:bg-red-50"
          >
            Xóa
          </Button>
        </div>
      ),
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

  // Generate year options dynamically
  const yearOptions: SelectOption[] = [{ value: '', label: 'Tất cả' }];
  const currentYear = new Date().getFullYear();
  for (let year = currentYear + 2; year >= currentYear - 10; year--) {
    yearOptions.push({ value: year.toString(), label: year.toString() });
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

        <Button variant="primary" onClick={handleCreate} leftIcon={<span>+</span>}>
          Thêm học viên
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

            {/* Năm vào */}
            <Select
              label="Năm vào trường"
              value={filters.namVao?.toString() || ''}
              onChange={(e) => handleFilter('namVao', e.target.value ? Number(e.target.value) : '')}
              options={yearOptions}
            />

            {/* Trình độ */}
            <Select
              label="Trình độ đào tạo"
              value={filters.trinhDo || ''}
              onChange={(e) => handleFilter('trinhDo', e.target.value)}
              options={trinhDoOptions}
            />

            {/* Giới tính */}
            <Select
              label="Giới tính"
              value={filters.gioiTinh || ''}
              onChange={(e) => handleFilter('gioiTinh', e.target.value)}
              options={GIOI_TINH_OPTIONS}
            />
          </div>

          {/* Ngành học */}
          <Select
            label="Ngành học"
            value={filters.maNganh || ''}
            onChange={(e) => handleFilter('maNganh', e.target.value)}
            options={nganhOptions}
          />

          {/* Clear filters button */}
          {(search || filters.gioiTinh || filters.trinhDo || filters.maNganh || filters.namVao) && (
            <div className="flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleClearFilters}
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
              {meta.total > 0 && (
                <span className="text-sm text-gray-500 ml-2">
                  (Hiển thị {meta.from}-{meta.to})
                </span>
              )}
            </h2>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={refresh}
              >
                🔄 Làm mới
              </Button>
              <Button
                variant="success"
                size="sm"
                onClick={handleExportToExcel}
                isLoading={isExporting}
                leftIcon={<DocumentArrowDownIcon className="w-4 h-4" />}
              >
                Xuất Excel
              </Button>
            </div>
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

      {/* Modals */}
      {/* Create Student Modal */}
      <Modal
        isOpen={createModal.isOpen}
        onClose={createModal.close}
        title="Thêm học viên mới"
        size="lg"
      >
        <form onSubmit={createForm.handleSubmit} noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Mã học viên"
              type="text"
              value={createForm.values.maHV || ''}
              onChange={(e) => createForm.handleChange('maHV', e.target.value)}
              onBlur={() => createForm.handleBlur('maHV')}
              error={createForm.errors.maHV}
              placeholder="Nhập mã học viên"
            />

            <Input
              label="Họ đệm"
              type="text"
              value={createForm.values.hoDem || ''}
              onChange={(e) => createForm.handleChange('hoDem', e.target.value)}
              onBlur={() => createForm.handleBlur('hoDem')}
              error={createForm.errors.hoDem}
              placeholder="Nhập họ đệm"
            />

            <Input
              label="Tên"
              type="text"
              value={createForm.values.ten || ''}
              onChange={(e) => createForm.handleChange('ten', e.target.value)}
              onBlur={() => createForm.handleBlur('ten')}
              error={createForm.errors.ten}
              placeholder="Nhập tên"
            />

            <Input
              label="Ngày sinh"
              type="date"
              value={createForm.values.ngaySinh || ''}
              onChange={(e) => createForm.handleChange('ngaySinh', e.target.value)}
              onBlur={() => createForm.handleBlur('ngaySinh')}
              error={createForm.errors.ngaySinh}
            />

            <Select
              label="Giới tính"
              value={createForm.values.gioiTinh || ''}
              onChange={(e) => createForm.handleChange('gioiTinh', e.target.value)}
              onBlur={() => createForm.handleBlur('gioiTinh')}
              error={createForm.errors.gioiTinh}
              options={GIOI_TINH_OPTIONS}
            />

            <Input
              label="Số điện thoại"
              type="text"
              value={createForm.values.dienThoai || ''}
              onChange={(e) => createForm.handleChange('dienThoai', e.target.value)}
              onBlur={() => createForm.handleBlur('dienThoai')}
              error={createForm.errors.dienThoai}
              placeholder="Nhập số điện thoại"
            />

            <Input
              label="Email"
              type="email"
              value={createForm.values.email || ''}
              onChange={(e) => createForm.handleChange('email', e.target.value)}
              onBlur={() => createForm.handleBlur('email')}
              error={createForm.errors.email}
              placeholder="Nhập email"
            />

            <Input
              label="CMND/CCCD"
              type="text"
              value={createForm.values.soGiayToTuyThan || ''}
              onChange={(e) => createForm.handleChange('soGiayToTuyThan', e.target.value)}
              onBlur={() => createForm.handleBlur('soGiayToTuyThan')}
              error={createForm.errors.soGiayToTuyThan}
              placeholder="Nhập số CMND/CCCD"
            />

            <Input
              label="Quốc tịch"
              type="text"
              value={createForm.values.quocTich || ''}
              onChange={(e) => createForm.handleChange('quocTich', e.target.value)}
              placeholder="Nhập quốc tịch"
            />

            <Input
              label="Dân tộc"
              type="text"
              value={createForm.values.danToc || ''}
              onChange={(e) => createForm.handleChange('danToc', e.target.value)}
              placeholder="Nhập dân tộc"
            />

            <Input
              label="Tôn giáo"
              type="text"
              value={createForm.values.tonGiao || ''}
              onChange={(e) => createForm.handleChange('tonGiao', e.target.value)}
              placeholder="Nhập tôn giáo"
            />

            <Select
              label="Ngành học"
              value={createForm.values.maNganh || ''}
              onChange={(e) => createForm.handleChange('maNganh', e.target.value)}
              onBlur={() => createForm.handleBlur('maNganh')}
              error={createForm.errors.maNganh}
              options={nganhOptions}
            />

            <Select
              label="Trình độ đào tạo"
              value={createForm.values.maTrinhDoDaoTao || ''}
              onChange={(e) => createForm.handleChange('maTrinhDoDaoTao', e.target.value)}
              onBlur={() => createForm.handleBlur('maTrinhDoDaoTao')}
              error={createForm.errors.maTrinhDoDaoTao}
              options={trinhDoOptions}
            />

            <Input
              label="Năm vào trường"
              type="number"
              value={createForm.values.namVaoTruong?.toString() || ''}
              onChange={(e) => createForm.handleChange('namVaoTruong', Number(e.target.value))}
              placeholder="Nhập năm vào trường"
            />

            <Input
              label="Ngày nhập học"
              type="date"
              value={createForm.values.ngayNhapHoc || ''}
              onChange={(e) => createForm.handleChange('ngayNhapHoc', e.target.value)}
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={createModal.close}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" isLoading={createForm.isSubmitting}>
              Thêm học viên
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Student Modal */}
      <Modal
        isOpen={editModal.isOpen}
        onClose={editModal.close}
        title="Chỉnh sửa thông tin học viên"
        size="lg"
      >
        <form onSubmit={editForm.handleSubmit} noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Mã học viên"
              type="text"
              value={editForm.values.maHV || ''}
              onChange={(e) => editForm.handleChange('maHV', e.target.value)}
              error={editForm.errors.maHV}
              placeholder="Nhập mã học viên"
              disabled
            />

            <Input
              label="Họ đệm"
              type="text"
              value={editForm.values.hoDem || ''}
              onChange={(e) => editForm.handleChange('hoDem', e.target.value)}
              onBlur={() => editForm.handleBlur('hoDem')}
              error={editForm.errors.hoDem}
              placeholder="Nhập họ đệm"
            />

            <Input
              label="Tên"
              type="text"
              value={editForm.values.ten || ''}
              onChange={(e) => editForm.handleChange('ten', e.target.value)}
              onBlur={() => editForm.handleBlur('ten')}
              error={editForm.errors.ten}
              placeholder="Nhập tên"
            />

            <Input
              label="Ngày sinh"
              type="date"
              value={editForm.values.ngaySinh || ''}
              onChange={(e) => editForm.handleChange('ngaySinh', e.target.value)}
              error={editForm.errors.ngaySinh}
            />

            <Select
              label="Giới tính"
              value={editForm.values.gioiTinh || ''}
              onChange={(e) => editForm.handleChange('gioiTinh', e.target.value)}
              error={editForm.errors.gioiTinh}
              options={GIOI_TINH_OPTIONS}
            />

            <Input
              label="Số điện thoại"
              type="text"
              value={editForm.values.dienThoai || ''}
              onChange={(e) => editForm.handleChange('dienThoai', e.target.value)}
              onBlur={() => editForm.handleBlur('dienThoai')}
              error={editForm.errors.dienThoai}
              placeholder="Nhập số điện thoại"
            />

            <Input
              label="Email"
              type="email"
              value={editForm.values.email || ''}
              onChange={(e) => editForm.handleChange('email', e.target.value)}
              onBlur={() => editForm.handleBlur('email')}
              error={editForm.errors.email}
              placeholder="Nhập email"
            />

            <Input
              label="CMND/CCCD"
              type="text"
              value={editForm.values.soGiayToTuyThan || ''}
              onChange={(e) => editForm.handleChange('soGiayToTuyThan', e.target.value)}
              onBlur={() => editForm.handleBlur('soGiayToTuyThan')}
              error={editForm.errors.soGiayToTuyThan}
              placeholder="Nhập số CMND/CCCD"
            />

            <Input
              label="Quốc tịch"
              type="text"
              value={editForm.values.quocTich || ''}
              onChange={(e) => editForm.handleChange('quocTich', e.target.value)}
              placeholder="Nhập quốc tịch"
            />

            <Input
              label="Dân tộc"
              type="text"
              value={editForm.values.danToc || ''}
              onChange={(e) => editForm.handleChange('danToc', e.target.value)}
              placeholder="Nhập dân tộc"
            />

            <Input
              label="Tôn giáo"
              type="text"
              value={editForm.values.tonGiao || ''}
              onChange={(e) => editForm.handleChange('tonGiao', e.target.value)}
              placeholder="Nhập tôn giáo"
            />

            <Select
              label="Ngành học"
              value={editForm.values.maNganh || ''}
              onChange={(e) => editForm.handleChange('maNganh', e.target.value)}
              onBlur={() => editForm.handleBlur('maNganh')}
              error={editForm.errors.maNganh}
              options={nganhOptions}
            />

            <Select
              label="Trình độ đào tạo"
              value={editForm.values.maTrinhDoDaoTao || ''}
              onChange={(e) => editForm.handleChange('maTrinhDoDaoTao', e.target.value)}
              onBlur={() => editForm.handleBlur('maTrinhDoDaoTao')}
              error={editForm.errors.maTrinhDoDaoTao}
              options={trinhDoOptions}
            />

            <Input
              label="Năm vào trường"
              type="number"
              value={editForm.values.namVaoTruong?.toString() || ''}
              onChange={(e) => editForm.handleChange('namVaoTruong', Number(e.target.value))}
              placeholder="Nhập năm vào trường"
            />

            <Input
              label="Ngày nhập học"
              type="date"
              value={editForm.values.ngayNhapHoc || ''}
              onChange={(e) => editForm.handleChange('ngayNhapHoc', e.target.value)}
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={editModal.close}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" isLoading={editForm.isSubmitting}>
              Cập nhật
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="Xác nhận xóa"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Bạn có chắc chắn muốn xóa học viên <strong>{selectedStudent?.maHV}</strong> -
            <strong> {selectedStudent?.hoDem} {selectedStudent?.ten}</strong>?
          </p>
          <p className="text-sm text-red-600">
            ⚠️ Hành động này không thể hoàn tác!
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={deleteModal.close}>
              Hủy
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              Xóa
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast Notifications */}
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
