import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import type { Route } from './+types/users';
import { Card } from '~/components/ui/Card';
import { Table } from '~/components/ui/Table';
import { Pagination } from '~/components/ui/Pagination';
import { Button } from '~/components/ui/Button';
import { Badge } from '~/components/ui/Badge';
import { Modal } from '~/components/ui/Modal';
import { Input } from '~/components/ui/Input';
import { Select } from '~/components/ui/Select';
import { useTable } from '~/hooks/useTable';
import { useModal } from '~/hooks/useModal';
import { useForm } from '~/hooks/useForm';
import { userService, type UserFormData } from '~/services/user.service';
import { roleService } from '~/services/role.service';
import type { AuthUser, Role } from '~/types/auth';
import { formatters } from '~/utils/formatters';
import { validators } from '~/utils/validators';
import { getUserRoleId } from '~/utils/user';
import { Toast } from '~/components/ui/Toast';
import { PermissionSelector } from '~/components/permissions';
import { parsePermissions } from '~/utils/permissions';

// Export loader function for React Router v7
export async function loader({ request }: Route.LoaderArgs) {
  // React Router v7 data loader - return null vì chúng ta load data trong component
  return null;
}

export default function AdminUsers() {
  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [positions, setPositions] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<Array<{ value: string; label: string; description: string }>>([]);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [initError, setInitError] = useState<string | null>(null);

  // ✅ Sử dụng useRef thay vì useState để tránh re-render và gọi lặp
  const isInitializedRef = useRef(false);

  const createModal = useModal();
  const editModal = useModal();
  const deleteModal = useModal();

  // Load roles, departments, positions on mount - CHỈ GỌI 1 LẦN
  useEffect(() => {
    // ✅ Check ref để tránh gọi lặp trong React Strict Mode
    if (isInitializedRef.current) {
      console.log('⚠️ Skipping duplicate initialization call');
      return;
    }

    isInitializedRef.current = true; // ✅ Đánh dấu ngay lập tức

    const initData = async () => {
      try {
        console.log('🔵 Loading initial data for Users page...');
        await Promise.all([
          loadRoles(),
          loadDepartments(),
          loadPositions(),
          loadStatuses(),
        ]);
        console.log('✅ Initial data loaded successfully');
      } catch (error) {
        console.error('❌ Failed to initialize users page:', error);
        setInitError('Không thể tải dữ liệu khởi tạo. Vui lòng refresh trang.');
        isInitializedRef.current = false; // ✅ Reset để có thể retry
      }
    };

    initData();
  }, []); // ← Empty dependency array, chỉ chạy 1 lần khi mount

  const loadRoles = async () => {
    try {
      const data = await roleService.getRoles({ is_active: true });
      setRoles(data || []);
      console.log('✅ Roles loaded:', data?.length || 0);
    } catch (error) {
      console.error('❌ Failed to load roles:', error);
      setRoles([]); // Set empty array thay vì crash
    }
  };

  const loadDepartments = async () => {
    try {
      const data = await userService.getDepartments();
      setDepartments(data || []);
      console.log('✅ Departments loaded:', data?.length || 0);
    } catch (error) {
      console.error('❌ Failed to load departments:', error);
      setDepartments([]); // Set empty array thay vì crash
    }
  };

  const loadPositions = async () => {
    try {
      const data = await userService.getPositions();
      setPositions(data || []);
      console.log('✅ Positions loaded:', data?.length || 0);
    } catch (error) {
      console.error('❌ Failed to load positions:', error);
      setPositions([]); // Set empty array thay vì crash
    }
  };

  const loadStatuses = async () => {
    try {
      const data = await userService.getStatuses();
      setStatuses(data || []);
      console.log('✅ Statuses loaded:', data?.length || 0);
    } catch (error) {
      console.error('❌ Failed to load statuses:', error);
      setStatuses([]); // Set empty array thay vì crash
    }
  };

  const {
    data,
    isLoading,
    meta,
    handlePageChange,
    handlePerPageChange,
    handleSort,
    handleSearch,
    handleFilter,
    refresh,
    sortBy,
    sortDirection,
    search,
    filters,
  } = useTable<AuthUser>({
    fetchData: async (params) => {
      try {
        console.log('🔵 Fetching users with params:', params);
        const result = await userService.getUsers(params);
        console.log('✅ Users fetched:', result.data?.length || 0);
        return result;
      } catch (error) {
        console.error('❌ Failed to fetch users:', error);
        throw error; // Throw error instead of returning empty result
      }
    },
    initialPerPage: 15,
    initialSortBy: 'created_at',
    initialSortDirection: 'desc',
  });

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreate = () => {
    setSelectedUser(null);
    createModal.open();
  };

  const handleEdit = (user: AuthUser) => {
    setSelectedUser(user);
    editModal.open();
  };

  const handleDeleteClick = (user: AuthUser) => {
    setSelectedUser(user);
    deleteModal.open();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;

    try {
      await userService.deleteUser(selectedUser.id);
      showToast('success', 'Xóa người dùng thành công');
      deleteModal.close();
      refresh();
    } catch (error) {
      showToast('error', 'Có lỗi xảy ra khi xóa người dùng');
    }
  };

  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      width: '80px',
    },
    {
      key: 'name',
      label: 'Thông tin',
      sortable: true,
      render: (user: AuthUser) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-600">{user.email}</p>
            {user.phone && (
              <p className="text-sm text-gray-500">{formatters.phone(user.phone)}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Vai trò',
      render: (user: AuthUser) => (
        <Badge variant="info">{user.role?.display_name || '-'}</Badge>
      ),
    },
    {
      key: 'employee_code',
      label: 'Mã NV',
      render: (user: any) => user.employee_code || '-',
    },
    {
      key: 'department',
      label: 'Phòng ban',
      render: (user: any) => user.department || '-',
    },
    {
      key: 'is_active',
      label: 'Trạng thái',
      render: (user: any) => (
        <Badge variant={user.is_active ? 'success' : 'danger'}>
          {user.is_active ? 'Hoạt động' : 'Khóa'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Ngày tạo',
      sortable: true,
      render: (user: AuthUser) => formatters.date(user.created_at),
    },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (user: AuthUser) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => handleEdit(user)}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleDeleteClick(user)}>
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
        <p className="text-gray-600 mt-2">Danh sách tất cả người dùng trong hệ thống</p>
      </div>

      <Card>
        <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <Input
              type="text"
              placeholder="Tìm kiếm theo tên, email, số điện thoại..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full md:w-96"
            />
            <Select
              value={filters.role_id || ''}
              onChange={(e) => handleFilter('role_id', e.target.value || undefined)}
              className="w-full md:w-48"
            >
              <option value="">Tất cả vai trò</option>
              {(roles || []).map((role) => (
                <option key={role.id} value={role.id}>
                  {role.display_name}
                </option>
              ))}
            </Select>
            <Select
              value={filters.is_active || ''}
              onChange={(e) => handleFilter('is_active', e.target.value || undefined)}
              className="w-full md:w-48"
            >
              <option value="">Tất cả trạng thái</option>
              {(statuses || []).map((status) => (
                <option key={status.value} value={status.value} title={status.description}>
                  {status.label}
                </option>
              ))}
            </Select>
          </div>
          <Button variant="primary" onClick={handleCreate}>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Thêm người dùng
          </Button>
        </div>

        {initError ? (
          <div className="p-4 text-red-600 bg-red-50 border border-red-200 rounded-lg">
            {initError}
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              data={data}
              isLoading={isLoading}
              sortBy={sortBy}
              sortDirection={sortDirection}
              onSort={handleSort}
            />

            <Pagination
              currentPage={meta.current_page}
              totalPages={meta.last_page}
              onPageChange={handlePageChange}
              perPage={meta.per_page}
              onPerPageChange={handlePerPageChange}
              total={meta.total}
            />
          </>
        )}
      </Card>

      {/* Create Modal */}
      <UserFormModal
        isOpen={createModal.isOpen}
        onClose={createModal.close}
        onSuccess={() => {
          createModal.close();
          refresh();
          showToast('success', 'Tạo người dùng thành công');
        }}
        roles={roles || []}
        departments={departments || []}
        positions={positions || []}
      />

      {/* Edit Modal */}
      <UserFormModal
        isOpen={editModal.isOpen}
        onClose={editModal.close}
        user={selectedUser}
        onSuccess={() => {
          editModal.close();
          refresh();
          showToast('success', 'Cập nhật người dùng thành công');
        }}
        roles={roles || []}
        departments={departments || []}
        positions={positions || []}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="Xác nhận xóa"
        size="sm"
      >
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Bạn có chắc chắn muốn xóa người dùng <strong>{selectedUser?.name}</strong>?
            Hành động này sẽ vô hiệu hóa tài khoản.
          </p>
          <div className="flex items-center justify-end gap-3">
            <Button variant="ghost" onClick={deleteModal.close}>
              Hủy
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              Xóa
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

// User Form Modal Component
interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: AuthUser | null;
  roles: Role[];
  departments: string[];
  positions: string[];
}

function UserFormModal({
  isOpen,
  onClose,
  onSuccess,
  user,
  roles,
  departments,
  positions,
}: UserFormModalProps) {
  const isEdit = !!user;

  const initialValues: UserFormData = useMemo(() => ({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    phone: user?.phone || '',
    role_id: getUserRoleId(user || null),
    employee_code: (user as any)?.employee_code || '',
    position: (user as any)?.position || '',
    department: (user as any)?.department || '',
    hire_date: formatters.dateForInput((user as any)?.hire_date),
    salary: (user as any)?.salary || undefined,
    birth_date: formatters.dateForInput((user as any)?.birth_date),
    gender: (user as any)?.gender || 'male',
    address: user?.address || '',
    is_active: (user as any)?.is_active !== false,
    notes: (user as any)?.notes || '',
    custom_permissions: (user as any)?.custom_permissions || {},
  }), [user]);

  const validateForm = (values: UserFormData): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!values.name?.trim()) errors.name = 'Tên là bắt buộc';
    if (!values.email?.trim()) errors.email = 'Email là bắt buộc';
    else if (validators.email(values.email)) errors.email = validators.email(values.email)!;

    if (!isEdit && !values.password) errors.password = 'Mật khẩu là bắt buộc';
    else if (!isEdit && values.password && values.password.length < 8) {
      errors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    }

    if (values.phone && validators.phone(values.phone)) {
      errors.phone = validators.phone(values.phone)!;
    }

    if (!values.role_id) errors.role_id = 'Vai trò là bắt buộc';

    return errors;
  };

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setValues,
  } = useForm<UserFormData>({
    initialValues,
    validate: validateForm,
    onSubmit: async (values) => {
      try {
        if (isEdit && user) {
          const updateData = { ...values };
          if (!updateData.password) delete updateData.password;
          await userService.updateUser(user.id, updateData);
        } else {
          await userService.createUser(values);
        }
        reset();
        onSuccess();
      } catch (error: any) {
        throw new Error(error?.message || 'Có lỗi xảy ra');
      }
    },
  });

  // Reset form khi user thay đổi hoặc modal mở/đóng
  useEffect(() => {
    if (isOpen) {
      console.log('🔵 Modal opened with user:', user);

      const newValues: UserFormData = {
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        phone: user?.phone || '',
        role_id: getUserRoleId(user || null),
        employee_code: (user as any)?.employee_code || '',
        position: (user as any)?.position || '',
        department: (user as any)?.department || '',
        hire_date: formatters.dateForInput((user as any)?.hire_date),
        salary: (user as any)?.salary || undefined,
        birth_date: formatters.dateForInput((user as any)?.birth_date),
        gender: (user as any)?.gender || 'male',
        address: user?.address || '',
        is_active: (user as any)?.is_active !== false,
        notes: (user as any)?.notes || '',
        custom_permissions: (user as any)?.custom_permissions || {},
      };

      setValues(newValues);
    }
  }, [isOpen, user, setValues]);

  // Get selected role's permissions để hiển thị mặc định
  const selectedRole = useMemo(() => {
    return roles.find(r => r.id === values.role_id);
  }, [roles, values.role_id]);

  const selectedRolePermissions = useMemo(() => {
    if (!selectedRole) return {};
    return parsePermissions(selectedRole);
  }, [selectedRole]);

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEdit ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Họ và tên *"
                name="name"
                value={values.name}
                onChange={(e) => handleChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                error={touched.name ? errors.name : undefined}
              />
              <Input
                label="Email *"
                type="email"
                name="email"
                value={values.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                error={touched.email ? errors.email : undefined}
              />
              <Input
                label={isEdit ? 'Mật khẩu (để trống nếu không đổi)' : 'Mật khẩu *'}
                type="password"
                name="password"
                value={values.password}
                onChange={(e) => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                error={touched.password ? errors.password : undefined}
              />
              <Input
                label="Số điện thoại"
                name="phone"
                value={values.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                onBlur={() => handleBlur('phone')}
                error={touched.phone ? errors.phone : undefined}
              />
            </div>
          </div>

          {/* Employee Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin nhân viên</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Vai trò *"
                name="role_id"
                value={values.role_id}
                onChange={(e) => handleChange('role_id', Number(e.target.value))}
                error={touched.role_id ? errors.role_id : undefined}
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.display_name}
                  </option>
                ))}
              </Select>
              <Input
                label="Mã nhân viên"
                name="employee_code"
                value={values.employee_code}
                onChange={(e) => handleChange('employee_code', e.target.value)}
              />
              <Select
                label="Phòng ban"
                name="department"
                value={values.department}
                onChange={(e) => handleChange('department', e.target.value)}
              >
                <option value="">Chọn phòng ban</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </Select>
              <Select
                label="Chức vụ"
                name="position"
                value={values.position}
                onChange={(e) => handleChange('position', e.target.value)}
              >
                <option value="">Chọn chức vụ</option>
                {positions.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </Select>
              <Input
                label="Ngày vào làm"
                type="date"
                name="hire_date"
                value={values.hire_date}
                onChange={(e) => handleChange('hire_date', e.target.value)}
              />
              <Input
                label="Lương"
                type="number"
                name="salary"
                value={values.salary || ''}
                onChange={(e) => handleChange('salary', e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
          </div>

          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cá nhân</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Ngày sinh"
                type="date"
                name="birth_date"
                value={values.birth_date}
                onChange={(e) => handleChange('birth_date', e.target.value)}
              />
              <Select
                label="Giới tính"
                name="gender"
                value={values.gender}
                onChange={(e) => handleChange('gender', e.target.value as 'male' | 'female' | 'other')}
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </Select>
              <div className="md:col-span-2">
                <Input
                  label="Địa chỉ"
                  name="address"
                  value={values.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Status & Notes */}
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={values.is_active}
                onChange={(e) => handleChange('is_active', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-900">
                Kích hoạt tài khoản
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú
              </label>
              <textarea
                name="notes"
                rows={3}
                value={values.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Custom Permissions Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Quyền hạn tùy chỉnh</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedRole ? (
                    <>
                      Vai trò <strong>{selectedRole.display_name}</strong> có các quyền mặc định.
                      Bạn có thể tùy chỉnh quyền riêng cho user này.
                    </>
                  ) : (
                    'Chọn vai trò để xem quyền mặc định'
                  )}
                </p>
              </div>
              {values.custom_permissions && Object.keys(values.custom_permissions).length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleChange('custom_permissions', {})}
                >
                  Xóa tùy chỉnh
                </Button>
              )}
            </div>

            {selectedRole && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>💡 Lưu ý:</strong> Quyền tùy chỉnh sẽ ghi đè quyền mặc định của vai trò.
                  Nếu không tick gì, user sẽ sử dụng quyền mặc định của vai trò <strong>{selectedRole.display_name}</strong>.
                </p>
              </div>
            )}

            <PermissionSelector
              value={values.custom_permissions || {}}
              onChange={(permissions) => handleChange('custom_permissions', permissions)}
              mode="compact"
            />
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {errors.submit}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Đang xử lý...' : isEdit ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
