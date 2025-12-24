import { useState, useEffect } from 'react';
import { userService } from '~/services/user.service';
import { roleService } from '~/services/role.service';
import { useTable } from '~/hooks/useTable';
import { useModal } from '~/hooks/useModal';
import { useForm } from '~/hooks/useForm';
import { ProtectedRoute } from '~/components/ProtectedRoute';
import type { User, UserFormData } from '~/types/user';
import type { Role } from '~/types/role';
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  FunnelIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  Button,
  Input,
  Select,
  Table,
  Badge,
  Card,
  Pagination,
  Modal,
  Toast,
} from '~/components/ui';
import type { ToastType } from '~/components/ui/Toast';

export function meta() {
  return [
    { title: 'Quản lý người dùng - VMU Training' },
    { name: 'description', content: 'Quản lý thông tin người dùng hệ thống' },
  ];
}

export default function UserManagements() {
  return (
    <ProtectedRoute
      requiredPermission="users.view"
      unauthorizedMessage="Bạn không có quyền xem danh sách người dùng"
    >
      <UserManagementsContent />
    </ProtectedRoute>
  );
}

function UserManagementsContent() {
  // ============================================
  // STATE & HOOKS
  // ============================================
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // ✅ SỬ DỤNG useTable HOOK
  const {
    data: users,
    isLoading,
    error,
    meta,
    page,
    perPage,
    search,
    filters,
    sortBy,
    sortDirection,
    handlePageChange,
    handlePerPageChange,
    handleSearch,
    handleFilter,
    handleClearFilters,
    handleSort,
    refresh,
  } = useTable<User>({
    fetchData: userService.getUsers,
    initialPage: 1,
    initialPerPage: 20,
    initialSortBy: 'created_at',
    initialSortDirection: 'desc',
    initialFilters: {
      role_id: '',
      is_active: '',
      department: '',
    },
  });

  // ============================================
  // MODALS
  // ============================================
  const createModal = useModal();
  const editModal = useModal();
  const deleteModal = useModal();

  // ============================================
  // LOAD ROLES
  // ============================================
  useEffect(() => {
    const loadRoles = async () => {
      try {
        const response = await roleService.getRoles({ per_page: 100 });
        setRoles(response.data || []);
      } catch (error) {
        console.error('Failed to load roles:', error);
      }
    };
    loadRoles();
  }, []);

  // ============================================
  // FORM INITIAL VALUES
  // ============================================
  const getInitialFormValues = (user?: User | null): UserFormData => {
    if (user) {
      return {
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        birth_date: user.birth_date || '',
        gender: (user.gender as 'male' | 'female' | 'other') || undefined,
        address: user.address || '',
        employee_code: user.employee_code || '',
        position: user.position || '',
        department: user.department || '',
        hire_date: user.hire_date || '',
        salary: user.salary || undefined,
        role_id: user.role_id || undefined,
        is_active: user.is_active ?? true,
        notes: user.notes || '',
      };
    }

    return {
      name: '',
      email: '',
      password: '',
      phone: '',
      birth_date: '',
      gender: undefined,
      address: '',
      employee_code: '',
      position: '',
      department: '',
      hire_date: '',
      salary: undefined,
      role_id: undefined,
      is_active: true,
      notes: '',
    };
  };

  // ============================================
  // FORM VALIDATION
  // ============================================
  const validateForm = (values: UserFormData): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!values.name?.trim()) errors.name = 'Họ tên là bắt buộc';
    if (!values.email?.trim()) errors.email = 'Email là bắt buộc';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errors.email = 'Email không hợp lệ';
    }

    // Password is required only for create
    if (!selectedUser && !values.password?.trim()) {
      errors.password = 'Mật khẩu là bắt buộc';
    }
    if (values.password && values.password.length < 8) {
      errors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    }

    return errors;
  };

  // ============================================
  // CREATE FORM
  // ============================================
  const createForm = useForm<UserFormData>({
    initialValues: getInitialFormValues(),
    validate: validateForm,
    onSubmit: async (values) => {
      try {
        await userService.createUser(values);
        setToast({ message: '✅ Thêm người dùng thành công!', type: 'success' });
        createModal.close();
        refresh();
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || error.message || 'Có lỗi xảy ra';
        setToast({ message: `❌ Lỗi: ${errorMessage}`, type: 'error' });
      }
    },
  });

  // ============================================
  // EDIT FORM
  // ============================================
  const editForm = useForm<UserFormData>({
    initialValues: getInitialFormValues(selectedUser),
    validate: validateForm,
    onSubmit: async (values) => {
      if (!selectedUser?.id) return;

      try {
        // Remove password if empty (don't update)
        const updateData = { ...values };
        if (!updateData.password) {
          delete updateData.password;
        }

        await userService.updateUser(selectedUser.id, updateData);
        setToast({ message: '✅ Cập nhật người dùng thành công!', type: 'success' });
        editModal.close();
        refresh();
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || error.message || 'Có lỗi xảy ra';
        setToast({ message: `❌ Lỗi: ${errorMessage}`, type: 'error' });
      }
    },
  });

  // ============================================
  // HANDLERS
  // ============================================
  const handleOpenCreate = () => {
    setSelectedUser(null);
    createForm.reset();
    createModal.open();
  };

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    // Set values manually instead of reset with argument
    Object.keys(getInitialFormValues(user)).forEach((key) => {
      editForm.setFieldValue(key as keyof UserFormData, getInitialFormValues(user)[key as keyof UserFormData]);
    });
    editModal.open();
  };

  const handleOpenDelete = (user: User) => {
    setSelectedUser(user);
    deleteModal.open();
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser?.id) return;

    try {
      await userService.deleteUser(selectedUser.id);
      setToast({ message: '✅ Xóa người dùng thành công!', type: 'success' });
      deleteModal.close();
      refresh();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Có lỗi xảy ra';
      setToast({ message: `❌ Lỗi: ${errorMessage}`, type: 'error' });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleSearch(e.target.value);
  };

  const handleFilterChange = (key: string, value: any) => {
    handleFilter(key, value);
  };

  // ============================================
  // TABLE COLUMNS
  // ============================================
  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      width: '80px',
    },
    {
      key: 'employee_code',
      label: 'Mã NV',
      sortable: true,
      render: (user: User) => user.employee_code || '-',
    },
    {
      key: 'name',
      label: 'Họ tên',
      sortable: true,
      render: (user: User) => (
        <div>
          <div className="font-medium text-gray-900">{user.name}</div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Số điện thoại',
      render: (user: User) => user.phone || '-',
    },
    {
      key: 'role',
      label: 'Vai trò',
      render: (user: User) => {
        if (user.role) {
          return (
            <Badge variant="info" size="sm">
              {user.role.display_name}
            </Badge>
          );
        }
        return <Badge variant="default" size="sm">Chưa phân quyền</Badge>;
      },
    },
    {
      key: 'department',
      label: 'Phòng ban',
      render: (user: User) => user.department || '-',
    },
    {
      key: 'position',
      label: 'Chức vụ',
      render: (user: User) => user.position || '-',
    },
    {
      key: 'is_active',
      label: 'Trạng thái',
      sortable: true,
      render: (user: User) => {
        return user.is_active ? (
          <Badge variant="success" size="sm">Hoạt động</Badge>
        ) : (
          <Badge variant="danger" size="sm">Vô hiệu hóa</Badge>
        );
      },
    },
    {
      key: 'actions',
      label: 'Thao tác',
      width: '150px',
      render: (user: User) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleOpenEdit(user)}
            title="Sửa"
          >
            <PencilIcon className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleOpenDelete(user)}
            title="Xóa"
          >
            <TrashIcon className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <UserGroupIcon className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
            <p className="text-gray-600 mt-1">Quản lý thông tin người dùng hệ thống</p>
          </div>
        </div>
        <Button onClick={handleOpenCreate} leftIcon={<PlusIcon className="w-5 h-5" />}>
          Thêm người dùng
        </Button>
      </div>

      {/* Filters & Search */}
      <Card className="!p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Tìm kiếm theo tên, email, mã nhân viên, số điện thoại..."
                value={search}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<FunnelIcon className="w-5 h-5" />}
            >
              {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <Select
                label="Vai trò"
                value={filters.role_id || ''}
                onChange={(e) => handleFilterChange('role_id', e.target.value)}
              >
                <option value="">Tất cả vai trò</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.display_name}
                  </option>
                ))}
              </Select>

              <Select
                label="Trạng thái"
                value={filters.is_active || ''}
                onChange={(e) => handleFilterChange('is_active', e.target.value)}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="1">Hoạt động</option>
                <option value="0">Vô hiệu hóa</option>
              </Select>

              <Input
                label="Phòng ban"
                value={filters.department || ''}
                onChange={(e) => handleFilterChange('department', e.target.value)}
                placeholder="Tìm theo phòng ban..."
              />

              <div className="md:col-span-3 flex justify-end">
                <Button variant="ghost" onClick={handleClearFilters}>
                  <XMarkIcon className="w-5 h-5 mr-2" />
                  Xóa bộ lọc
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <Table
          columns={columns}
          data={users}
          isLoading={isLoading}
          emptyMessage="Không có người dùng nào"
          onSort={handleSort}
          sortBy={sortBy}
          sortDirection={sortDirection}
        />

        <Pagination
          currentPage={page}
          totalPages={meta.last_page}
          onPageChange={handlePageChange}
          perPage={perPage}
          onPerPageChange={handlePerPageChange}
          total={meta.total}
        />
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={createModal.isOpen}
        onClose={createModal.close}
        title="Thêm người dùng mới"
        size="lg"
      >
        <form onSubmit={createForm.handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Info */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Thông tin cơ bản</h3>
            </div>

            <Input
              label="Họ tên"
              name="name"
              value={createForm.values.name}
              onChange={(e) => createForm.handleChange('name', e.target.value)}
              onBlur={() => createForm.handleBlur('name')}
              error={createForm.errors.name}
              required
            />

            <Input
              label="Email"
              name="email"
              type="email"
              value={createForm.values.email}
              onChange={(e) => createForm.handleChange('email', e.target.value)}
              onBlur={() => createForm.handleBlur('email')}
              error={createForm.errors.email}
              required
            />

            <Input
              label="Mật khẩu"
              name="password"
              type="password"
              value={createForm.values.password}
              onChange={(e) => createForm.handleChange('password', e.target.value)}
              onBlur={() => createForm.handleBlur('password')}
              error={createForm.errors.password}
              helperText="Tối thiểu 8 ký tự"
              required
            />

            <Input
              label="Số điện thoại"
              name="phone"
              value={createForm.values.phone}
              onChange={(e) => createForm.handleChange('phone', e.target.value)}
            />

            <Input
              label="Mã nhân viên"
              name="employee_code"
              value={createForm.values.employee_code}
              onChange={(e) => createForm.handleChange('employee_code', e.target.value)}
            />

            <Input
              label="Ngày sinh"
              name="birth_date"
              type="date"
              value={createForm.values.birth_date}
              onChange={(e) => createForm.handleChange('birth_date', e.target.value)}
            />

            <Select
              label="Giới tính"
              name="gender"
              value={createForm.values.gender || ''}
              onChange={(e) => createForm.handleChange('gender', e.target.value as any)}
            >
              <option value="">-- Chọn giới tính --</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </Select>

            <Input
              label="Địa chỉ"
              name="address"
              value={createForm.values.address}
              onChange={(e) => createForm.handleChange('address', e.target.value)}
              className="md:col-span-2"
            />

            {/* Work Info */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Thông tin công việc</h3>
            </div>

            <Input
              label="Chức vụ"
              name="position"
              value={createForm.values.position}
              onChange={(e) => createForm.handleChange('position', e.target.value)}
            />

            <Input
              label="Phòng ban"
              name="department"
              value={createForm.values.department}
              onChange={(e) => createForm.handleChange('department', e.target.value)}
            />

            <Input
              label="Ngày vào làm"
              name="hire_date"
              type="date"
              value={createForm.values.hire_date}
              onChange={(e) => createForm.handleChange('hire_date', e.target.value)}
            />

            <Input
              label="Lương"
              name="salary"
              type="number"
              value={createForm.values.salary || ''}
              onChange={(e) => createForm.handleChange('salary', e.target.value ? Number(e.target.value) : undefined)}
            />

            <Select
              label="Vai trò"
              name="role_id"
              value={createForm.values.role_id || ''}
              onChange={(e) => createForm.handleChange('role_id', e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">-- Chọn vai trò --</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.display_name}
                </option>
              ))}
            </Select>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active_create"
                checked={createForm.values.is_active}
                onChange={(e) => createForm.handleChange('is_active', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="is_active_create" className="text-sm font-medium text-gray-700">
                Trạng thái hoạt động
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ghi chú
              </label>
              <textarea
                name="notes"
                value={createForm.values.notes}
                onChange={(e) => createForm.handleChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="ghost" onClick={createModal.close}>
              Hủy
            </Button>
            <Button type="submit" isLoading={createForm.isSubmitting}>
              Thêm người dùng
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={editModal.isOpen}
        onClose={editModal.close}
        title="Chỉnh sửa người dùng"
        size="lg"
      >
        <form onSubmit={editForm.handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Info */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Thông tin cơ bản</h3>
            </div>

            <Input
              label="Họ tên"
              name="name"
              value={editForm.values.name}
              onChange={(e) => editForm.handleChange('name', e.target.value)}
              onBlur={() => editForm.handleBlur('name')}
              error={editForm.errors.name}
              required
            />

            <Input
              label="Email"
              name="email"
              type="email"
              value={editForm.values.email}
              onChange={(e) => editForm.handleChange('email', e.target.value)}
              onBlur={() => editForm.handleBlur('email')}
              error={editForm.errors.email}
              required
            />

            <Input
              label="Mật khẩu mới"
              name="password"
              type="password"
              value={editForm.values.password}
              onChange={(e) => editForm.handleChange('password', e.target.value)}
              helperText="Để trống nếu không muốn đổi mật khẩu"
            />

            <Input
              label="Số điện thoại"
              name="phone"
              value={editForm.values.phone}
              onChange={(e) => editForm.handleChange('phone', e.target.value)}
            />

            <Input
              label="Mã nhân viên"
              name="employee_code"
              value={editForm.values.employee_code}
              onChange={(e) => editForm.handleChange('employee_code', e.target.value)}
            />

            <Input
              label="Ngày sinh"
              name="birth_date"
              type="date"
              value={editForm.values.birth_date}
              onChange={(e) => editForm.handleChange('birth_date', e.target.value)}
            />

            <Select
              label="Giới tính"
              name="gender"
              value={editForm.values.gender || ''}
              onChange={(e) => editForm.handleChange('gender', e.target.value as any)}
            >
              <option value="">-- Chọn giới tính --</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </Select>

            <Input
              label="Địa chỉ"
              name="address"
              value={editForm.values.address}
              onChange={(e) => editForm.handleChange('address', e.target.value)}
              className="md:col-span-2"
            />

            {/* Work Info */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Thông tin công việc</h3>
            </div>

            <Input
              label="Chức vụ"
              name="position"
              value={editForm.values.position}
              onChange={(e) => editForm.handleChange('position', e.target.value)}
            />

            <Input
              label="Phòng ban"
              name="department"
              value={editForm.values.department}
              onChange={(e) => editForm.handleChange('department', e.target.value)}
            />

            <Input
              label="Ngày vào làm"
              name="hire_date"
              type="date"
              value={editForm.values.hire_date}
              onChange={(e) => editForm.handleChange('hire_date', e.target.value)}
            />

            <Input
              label="Lương"
              name="salary"
              type="number"
              value={editForm.values.salary || ''}
              onChange={(e) => editForm.handleChange('salary', e.target.value ? Number(e.target.value) : undefined)}
            />

            <Select
              label="Vai trò"
              name="role_id"
              value={editForm.values.role_id || ''}
              onChange={(e) => editForm.handleChange('role_id', e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">-- Chọn vai trò --</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.display_name}
                </option>
              ))}
            </Select>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active_edit"
                checked={editForm.values.is_active}
                onChange={(e) => editForm.handleChange('is_active', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="is_active_edit" className="text-sm font-medium text-gray-700">
                Trạng thái hoạt động
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ghi chú
              </label>
              <textarea
                name="notes"
                value={editForm.values.notes}
                onChange={(e) => editForm.handleChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="ghost" onClick={editModal.close}>
              Hủy
            </Button>
            <Button type="submit" isLoading={editForm.isSubmitting}>
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
          <p className="text-gray-600">
            Bạn có chắc chắn muốn xóa người dùng{' '}
            <span className="font-semibold text-gray-900">{selectedUser?.name}</span>?
          </p>
          <p className="text-sm text-red-600">
            ⚠️ Hành động này không thể hoàn tác!
          </p>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="ghost" onClick={deleteModal.close}>
              Hủy
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              Xóa
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast Notification */}
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

