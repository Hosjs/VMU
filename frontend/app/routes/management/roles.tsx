import { useState } from "react";
import { roleService, type RoleFormData } from "~/services";
import type { Role } from "~/types/auth";
import { Table } from "~/components/ui/Table";
import { Pagination } from "~/components/ui/Pagination";
import { Button } from "~/components/ui/Button";
import { Badge } from "~/components/ui/Badge";
import { Toast, type ToastType } from "~/components/ui/Toast";
import { useAuth } from "~/contexts/AuthContext";
import { useTable } from "~/hooks/useTable";
import { useModal } from "~/hooks/useModal";
import { useForm } from "~/hooks/useForm";
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

export default function RolesPage() {
  const { hasPermission } = useAuth();

  // ✅ SỬ DỤNG useTable hook thay vì custom state
  const {
    data: roles,
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
  } = useTable<Role>({
    fetchData: roleService.getRoles,
    initialPerPage: 20,
    initialSortBy: 'created_at',
    initialSortDirection: 'desc',
  });

  // ✅ SỬ DỤNG useModal hook cho modal tạo/sửa
  const createEditModal = useModal(false);

  // ✅ SỬ DỤNG useModal hook cho modal xem chi tiết
  const viewModal = useModal(false);

  // States
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [viewingRole, setViewingRole] = useState<Role | null>(null);

  // ✅ SỬ DỤNG useForm hook cho form management
  const {
    values: formData,
    errors,
    touched,
    isSubmitting,
    handleChange: handleFormChange,
    handleBlur,
    handleSubmit: handleFormSubmit,
    reset,
  } = useForm<RoleFormData>({
    initialValues: {
      name: "",
      display_name: "",
      description: "",
      permissions: {},
      is_active: true,
    },
    onSubmit: async (values) => {
      try {
        if (editingRole) {
          await roleService.updateRole(editingRole.id, values);
          showToast("Cập nhật vai trò thành công", "success");
        } else {
          await roleService.createRole(values);
          showToast("Tạo vai trò thành công", "success");
        }
        createEditModal.close();
        refresh(); // ✅ Sử dụng refresh từ useTable
      } catch (error: any) {
        showToast(error.data?.message || "Có lỗi xảy ra", "error");
      }
    },
  });

  // Toast
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: ToastType = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleCreate = () => {
    setEditingRole(null);
    reset();
    createEditModal.open();
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);

    // Parse permissions từ role
    let permissions = {};
    if (typeof role.permissions === "string") {
      try {
        permissions = JSON.parse(role.permissions);
      } catch (e) {
        permissions = {};
      }
    } else if (typeof role.permissions === "object") {
      permissions = role.permissions || {};
    }

    // Reset form với giá trị mới
    reset();
    handleFormChange('name', role.name);
    handleFormChange('display_name', role.display_name);
    handleFormChange('description', role.description || "");
    handleFormChange('permissions', permissions);
    handleFormChange('is_active', true);

    createEditModal.open();
  };

  const handleView = async (role: Role) => {
    try {
      const detailRole = await roleService.getRoleById(role.id);
      setViewingRole(detailRole);
      viewModal.open();
    } catch (error: any) {
      showToast(error.message || "Không thể xem chi tiết vai trò", "error");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa vai trò này?")) return;

    try {
      await roleService.deleteRole(id);
      showToast("Xóa vai trò thành công", "success");
      refresh(); // ✅ Sử dụng refresh từ useTable
    } catch (error: any) {
      showToast(error.data?.message || "Không thể xóa vai trò", "error");
    }
  };

  const getPermissionCount = (role: Role): number => {
    try {
      if (typeof role.permissions === "string") {
        const parsed = JSON.parse(role.permissions);
        if (Array.isArray(parsed)) return parsed.length;
        if (typeof parsed === "object") {
          return Object.values(parsed).flat().length;
        }
      } else if (Array.isArray(role.permissions)) {
        return role.permissions.length;
      } else if (typeof role.permissions === "object" && role.permissions) {
        return Object.values(role.permissions).flat().length;
      }
    } catch (e) {
      return 0;
    }
    return 0;
  };

  // ✅ Định nghĩa columns cho Table component
  const columns = [
    {
      key: "name",
      label: "Mã vai trò",
      sortable: true,
      width: "150px",
    },
    {
      key: "display_name",
      label: "Tên hiển thị",
      sortable: true,
      width: "200px",
    },
    {
      key: "description",
      label: "Mô tả",
      render: (role: Role) => role.description || "-",
      width: "300px",
    },
    {
      key: "permissions",
      label: "Số quyền",
      render: (role: Role) => (
        <Badge variant="info">{getPermissionCount(role)} quyền</Badge>
      ),
      width: "120px",
    },
    {
      key: "users_count",
      label: "Số người dùng",
      render: (role: any) => (
        <Badge variant="secondary">{role.users_count || 0} người</Badge>
      ),
      width: "150px",
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (role: Role) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleView(role)}
            className="text-gray-600 hover:text-gray-900"
            title="Xem"
          >
            <EyeIcon className="w-5 h-5" />
          </button>
          {hasPermission("roles.edit") && (
            <button
              onClick={() => handleEdit(role)}
              className="text-blue-600 hover:text-blue-900"
              title="Sửa"
            >
              <PencilIcon className="w-5 h-5" />
            </button>
          )}
          {hasPermission("roles.delete") && (
            <button
              onClick={() => handleDelete(role.id)}
              className="text-red-600 hover:text-red-900"
              title="Xóa"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      ),
      width: "200px",
    },
  ];

  if (!hasPermission("roles.view")) {
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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý vai trò & quyền</h1>
          <p className="text-gray-600 mt-1">Quản lý vai trò và phân quyền hệ thống</p>
        </div>
        {hasPermission("roles.create") && (
          <Button onClick={handleCreate}>
            <PlusIcon className="w-5 h-5 mr-2" />
            Thêm vai trò mới
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Tìm kiếm vai trò..."
            onChange={(e) => handleSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <select
            onChange={(e) => handleFilter("is_active", e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="1">Hoạt động</option>
            <option value="0">Vô hiệu</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table
          columns={columns}
          data={roles}
          isLoading={isLoading}
          emptyMessage="Không có vai trò nào"
          onSort={handleSort}
          sortBy={sortBy}
          sortDirection={sortDirection}
        />

        {/* Pagination */}
        {meta.total > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <Pagination
              currentPage={meta.current_page}
              totalPages={meta.last_page}
              perPage={meta.per_page}
              total={meta.total}
              onPageChange={handlePageChange}
              onPerPageChange={handlePerPageChange}
            />
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {createEditModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingRole ? "Sửa vai trò" : "Thêm vai trò mới"}
              </h2>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mã vai trò <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    onBlur={() => handleBlur('name')}
                    placeholder="admin, manager, staff..."
                    disabled={!!editingRole}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                  {touched.name && errors.name && (
                    <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Chỉ chữ thường, không dấu, không khoảng trắng</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên hiển thị <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.display_name}
                    onChange={(e) => handleFormChange('display_name', e.target.value)}
                    onBlur={() => handleBlur('display_name')}
                    placeholder="Quản trị viên, Giám đốc..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  {touched.display_name && errors.display_name && (
                    <p className="text-xs text-red-500 mt-1">{errors.display_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    rows={3}
                    placeholder="Mô tả vai trò và trách nhiệm..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phân quyền
                  </label>
                  <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.permissions?.["*"]?.includes("*")}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleFormChange('permissions', { "*": ["*"] });
                            } else {
                              handleFormChange('permissions', {});
                            }
                          }}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm font-semibold">Tất cả quyền (Admin)</span>
                      </label>
                      <p className="text-xs text-gray-500 ml-6">
                        Lưu ý: Đây là phân quyền đơn giản. Để cấu hình chi tiết, vui lòng chỉnh sửa trực tiếp trong database.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => handleFormChange('is_active', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                    Vai trò hoạt động
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={createEditModal.close}
                  >
                    Hủy
                  </Button>
                  <Button type="submit" variant="primary" disabled={isSubmitting}>
                    {isSubmitting ? "Đang xử lý..." : (editingRole ? "Cập nhật" : "Tạo mới")}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewModal.isOpen && viewingRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold">{viewingRole.display_name}</h2>
                  <p className="text-gray-600 text-sm">Mã: {viewingRole.name}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={viewModal.close}
                >
                  Đóng
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <p className="text-gray-900">{viewingRole.description || "-"}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số người dùng
                  </label>
                  <p className="text-gray-900">{(viewingRole as any).users_count || 0} người</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quyền hạn
                  </label>
                  <div className="border border-gray-300 rounded-lg p-4">
                    <Badge variant="info">{getPermissionCount(viewingRole)} quyền</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Messages */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
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
