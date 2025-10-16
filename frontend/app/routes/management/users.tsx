import { useState } from "react";
import { userService, roleService, type UserFormData } from "~/services";
import type { AuthUser, Role } from "~/types/auth";
import { Table } from "~/components/ui/Table";
import { Pagination } from "~/components/ui/Pagination";
import { Button } from "~/components/ui/Button";
import { Badge } from "~/components/ui/Badge";
import { Toast, type ToastType } from "~/components/ui/Toast";
import { Modal } from "~/components/ui/Modal"; // ✅ Import Modal
import { Input } from "~/components/ui/Input"; // ✅ Import Input
import { Select } from "~/components/ui/Select"; // ✅ Import Select
import { useAuth } from "~/contexts/AuthContext";
import { useTable, useAsync, useModal } from "~/hooks"; // ✅ Import useModal
import { PlusIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

export default function UsersPage() {
  const { hasPermission } = useAuth();

  // ✅ SỬ DỤNG useTable hook
  const {
    data: users,
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
  } = useTable<AuthUser>({
    fetchData: userService.getUsers,
    initialPerPage: 20,
    initialSortBy: 'created_at',
    initialSortDirection: 'desc',
  });

  // ✅ SỬ DỤNG useAsync để load data
  const { data: rolesData } = useAsync(
    () => roleService.getRoles({ page: 1, per_page: 100 }),
    { immediate: true }
  );

  const { data: departmentsData } = useAsync(
    () => userService.getDepartments(),
    { immediate: true }
  );

  const { data: positionsData } = useAsync(
    () => userService.getPositions(),
    { immediate: true }
  );

  // Extract data with safe defaults
  const roles = rolesData?.data || [];
  const departments = departmentsData || [];
  const positions = positionsData || [];

  // ✅ SỬ DỤNG useModal hook
  const modal = useModal(false);

  // States
  const [editingUser, setEditingUser] = useState<AuthUser | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    password: "",
    phone: "",
    role_id: 0,
    employee_code: "",
    position: "",
    department: "",
    is_active: true,
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: ToastType = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleCreate = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      role_id: roles[0]?.id || 0,
      employee_code: "",
      position: "",
      department: "",
      is_active: true,
    });
    modal.open(); // ✅ Dùng modal.open()
  };

  const handleEdit = (user: AuthUser) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      phone: user.phone || "",
      role_id: user.role_id,
      employee_code: user.employee_code || "",
      position: user.position || "",
      department: user.department || "",
      is_active: user.is_active ?? true,
    });
    modal.open(); // ✅ Dùng modal.open()
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingUser) {
        await userService.updateUser(editingUser.id, formData);
        showToast("Cập nhật người dùng thành công", "success");
      } else {
        await userService.createUser(formData);
        showToast("Tạo người dùng thành công", "success");
      }
      modal.close(); // ✅ Dùng modal.close()
      refresh();
    } catch (error: any) {
      showToast(error.data?.message || "Có lỗi xảy ra", "error");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;

    try {
      await userService.deleteUser(id);
      showToast("Xóa người dùng thành công", "success");
      refresh();
    } catch (error: any) {
      showToast(error.data?.message || "Không thể xóa người dùng", "error");
    }
  };

  // ✅ Định nghĩa columns
  const columns = [
    {
      key: "name",
      label: "Tên",
      sortable: true,
      render: (user: AuthUser) => (
        <div>
          <div className="font-medium text-gray-900">{user.name}</div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
      ),
    },
    {
      key: "employee_code",
      label: "Mã NV",
      sortable: true,
      render: (user: AuthUser) => user.employee_code || "-",
    },
    {
      key: "role",
      label: "Vai trò",
      render: (user: AuthUser) => (
        <Badge variant="info">{user.role?.display_name || "-"}</Badge>
      ),
    },
    {
      key: "position",
      label: "Chức vụ",
      render: (user: AuthUser) => user.position || "-",
    },
    {
      key: "department",
      label: "Phòng ban",
      render: (user: AuthUser) => user.department || "-",
    },
    {
      key: "is_active",
      label: "Trạng thái",
      render: (user: AuthUser) => (
        <Badge variant={user.is_active ? "success" : "danger"}>
          {user.is_active ? "Hoạt động" : "Ngưng"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (user: AuthUser) => (
        <div className="flex items-center space-x-2">
          {hasPermission("users.edit") && (
            <button
              onClick={() => handleEdit(user)}
              className="text-blue-600 hover:text-blue-900"
              title="Sửa"
            >
              <PencilSquareIcon className="w-5 h-5" />
            </button>
          )}
          {hasPermission("users.delete") && (
            <button
              onClick={() => handleDelete(user.id)}
              className="text-red-600 hover:text-red-900"
              title="Xóa"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  if (!hasPermission("users.view")) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Bạn không có quyền truy cập trang này</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Người dùng</h1>
          <p className="text-gray-600 mt-1">Quản lý tài khoản và phân quyền</p>
        </div>
        {hasPermission("users.create") && (
          <Button onClick={handleCreate}>
            <PlusIcon className="w-5 h-5 mr-2" />
            Thêm người dùng
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            type="text"
            placeholder="Tìm kiếm..."
            onChange={(e) => handleSearch(e.target.value)}
          />

          <Select onChange={(e) => handleFilter("role_id", e.target.value)}>
            <option value="">Tất cả vai trò</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.display_name}
              </option>
            ))}
          </Select>

          <Select onChange={(e) => handleFilter("department", e.target.value)}>
            <option value="">Tất cả phòng ban</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </Select>

          <Select onChange={(e) => handleFilter("status", e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="1">Hoạt động</option>
            <option value="0">Ngưng</option>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table
          columns={columns}
          data={users}
          isLoading={isLoading}
          onSort={handleSort}
          sortBy={sortBy}
          sortDirection={sortDirection}
          emptyMessage="Không có người dùng nào"
        />

        <Pagination
          currentPage={meta.current_page}
          totalPages={meta.last_page}
          onPageChange={handlePageChange}
          perPage={meta.per_page}
          onPerPageChange={handlePerPageChange}
          total={meta.total}
        />
      </div>

      {/* ✅ SỬ DỤNG Modal Component */}
      <Modal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title={editingUser ? "Sửa người dùng" : "Thêm người dùng mới"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Tên"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <Input
              label="Email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={`Mật khẩu${!editingUser ? '' : ' (để trống nếu không đổi)'}`}
              type="password"
              required={!editingUser}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={editingUser ? "Để trống nếu không đổi" : ""}
            />

            <Input
              label="Số điện thoại"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Vai trò"
              required
              value={formData.role_id}
              onChange={(e) => setFormData({ ...formData, role_id: parseInt(e.target.value) })}
            >
              <option value="">Chọn vai trò</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.display_name || role.name}
                </option>
              ))}
            </Select>

            <Input
              label="Mã nhân viên"
              type="text"
              value={formData.employee_code}
              onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Phòng ban"
              type="text"
              list="departments-list"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />
            <datalist id="departments-list">
              {departments.map((dept) => (
                <option key={dept} value={dept} />
              ))}
            </datalist>

            <Input
              label="Chức vụ"
              type="text"
              list="positions-list"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            />
            <datalist id="positions-list">
              {positions.map((pos) => (
                <option key={pos} value={pos} />
              ))}
            </datalist>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              Tài khoản hoạt động
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={modal.close}>
              Hủy
            </Button>
            <Button type="submit" variant="primary">
              {editingUser ? "Cập nhật" : "Tạo mới"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Toast notifications */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}
