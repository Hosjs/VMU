import { useState, useEffect, useCallback } from 'react';
import { roleService } from '~/services/role.service';
import type { Role, RoleFormData, PermissionModule, PermissionMap } from '~/types/role';
import { useAuth } from '~/contexts/AuthContext';
import { ProtectedRoute } from '~/components/ProtectedRoute';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  XMarkIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

export default function RoleManagement() {
  return (
    <ProtectedRoute
      requiredPermission="roles.view"
      unauthorizedMessage="Bạn không có quyền xem danh sách vai trò"
    >
      <RoleManagementContent />
    </ProtectedRoute>
  );
}

function RoleManagementContent() {
  const { hasPermission } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissionModules, setPermissionModules] = useState<PermissionModule[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Form state
  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    display_name: '',
    description: '',
    is_active: true,
  });

  // Permission state
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionMap>({});

  // Load roles
  const loadRoles = useCallback(async () => {
    setLoading(true);
    try {
      // Use public endpoint for loading roles list (no auth required)
      const response = await roleService.getRoles({
        page: currentPage,
        per_page: 15,
        search: searchTerm,
      });

      setRoles(response.data || []);
      setTotalPages(response.last_page || 1);
    } catch (error: any) {
      console.error('Error loading roles:', error);
      setRoles([]);
      alert(error.message || 'Lỗi khi tải danh sách vai trò');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  // Load permission modules
  const loadPermissions = useCallback(async () => {
    try {
      const modules = await roleService.getPermissions();
      setPermissionModules(modules);
    } catch (error: any) {
      console.error('Error loading permissions:', error);
    }
  }, []);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadRoles();
  };

  // Handle create
  const handleCreate = () => {
    setEditingRole(null);
    setFormData({
      name: '',
      display_name: '',
      description: '',
      is_active: true,
    });
    setShowModal(true);
  };

  // Handle edit
  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      display_name: role.display_name,
      description: role.description || '',
      is_active: role.is_active,
    });
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = async (role: Role) => {
    if (role.is_system) {
      alert('Không thể xóa vai trò hệ thống');
      return;
    }

    if (!confirm(`Bạn có chắc muốn xóa vai trò "${role.display_name}"?`)) {
      return;
    }

    try {
      await roleService.deleteRole(role.id);
      alert('Xóa vai trò thành công');
      loadRoles();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Lỗi khi xóa vai trò');
    }
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingRole) {
        await roleService.updateRole(editingRole.id, formData);
        alert('Cập nhật vai trò thành công');
      } else {
        await roleService.createRole(formData);
        alert('Tạo vai trò thành công');
      }
      setShowModal(false);
      loadRoles();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Lỗi khi lưu vai trò');
    }
  };

  // Handle manage permissions
  const handleManagePermissions = async (role: Role) => {
    setSelectedRole(role);
    setSelectedPermissions(role.permissions || {});
    setShowPermissionModal(true);
  };

  // Handle toggle permission
  const handleTogglePermission = (moduleName: string, action: string) => {
    setSelectedPermissions((prev) => {
      const modulePermissions = prev[moduleName] || [];
      const hasPermission = modulePermissions.includes(action);

      if (hasPermission) {
        // Remove permission
        const newPermissions = modulePermissions.filter((a) => a !== action);
        if (newPermissions.length === 0) {
          const { [moduleName]: _, ...rest } = prev;
          return rest;
        }
        return { ...prev, [moduleName]: newPermissions };
      } else {
        // Add permission
        return { ...prev, [moduleName]: [...modulePermissions, action] };
      }
    });
  };

  // Handle toggle all module permissions
  const handleToggleModule = (moduleName: string, allActions: string[]) => {
    setSelectedPermissions((prev) => {
      const modulePermissions = prev[moduleName] || [];
      const hasAll = allActions.every((action) => modulePermissions.includes(action));

      if (hasAll) {
        // Remove all
        const { [moduleName]: _, ...rest } = prev;
        return rest;
      } else {
        // Add all
        return { ...prev, [moduleName]: allActions };
      }
    });
  };

  // Handle save permissions
  const handleSavePermissions = async () => {
    if (!selectedRole) return;

    try {
      await roleService.updatePermissions(selectedRole.id, selectedPermissions);
      alert('Cập nhật quyền thành công');
      setShowPermissionModal(false);
      loadRoles();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Lỗi khi cập nhật quyền');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
          Quản lý Vai trò & Phân quyền
        </h1>
        <p className="text-gray-600 mt-2">
          Quản lý vai trò người dùng và phân quyền động theo module
        </p>
      </div>

      {/* Search & Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm vai trò..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </form>

          {hasPermission('roles.create') && (
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              Tạo vai trò mới
            </button>
          )}
        </div>
      </div>

      {/* Roles Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Đang tải dữ liệu...
          </div>
        ) : roles.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Không tìm thấy vai trò nào
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vai trò
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mô tả
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số người dùng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quyền hạn
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {roles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          role.is_system ? 'bg-purple-100' : 'bg-blue-100'
                        }`}>
                          <ShieldCheckIcon className={`w-6 h-6 ${
                            role.is_system ? 'text-purple-600' : 'text-blue-600'
                          }`} />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {role.display_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {role.name}
                            {role.is_system && (
                              <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                                Hệ thống
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-xs">
                        {role.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <UserGroupIcon className="w-5 h-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {role.users_count || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        role.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {role.is_active ? 'Hoạt động' : 'Vô hiệu'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleManagePermissions(role)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {role.permissions
                          ? `${Object.keys(role.permissions).length} modules`
                          : 'Chưa có quyền'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {hasPermission('roles.edit') && (
                          <button
                            onClick={() => handleEdit(role)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Sửa"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                        )}
                        {hasPermission('roles.delete') && !role.is_system && (
                          <button
                            onClick={() => handleDelete(role)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Trước
            </button>
            <span className="text-sm text-gray-600">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Sau
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingRole ? 'Sửa vai trò' : 'Tạo vai trò mới'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên vai trò (Code) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="admin, manager, staff..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={editingRole?.is_system}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên hiển thị *
                </label>
                <input
                  type="text"
                  required
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  placeholder="Quản trị viên, Quản lý..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Mô tả vai trò..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">
                  Kích hoạt vai trò
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingRole ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permission Management Modal */}
      {showPermissionModal && selectedRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Phân quyền: {selectedRole.display_name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Chọn các quyền truy cập cho vai trò này
                  </p>
                </div>
                <button
                  onClick={() => setShowPermissionModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {permissionModules.map((module) => {
                  const allActions = module.actions.map((a) => a.action);
                  const modulePermissions = selectedPermissions[module.name] || [];
                  const hasAll = allActions.every((action) =>
                    modulePermissions.includes(action)
                  );

                  return (
                    <div
                      key={module.id}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={hasAll}
                            onChange={() => handleToggleModule(module.name, allActions)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {module.display_name}
                            </h3>
                            {module.description && (
                              <p className="text-xs text-gray-500">{module.description}</p>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {modulePermissions.length}/{allActions.length} quyền
                        </span>
                      </div>

                      <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                        {module.actions.map((action) => {
                          const isChecked = modulePermissions.includes(action.action);
                          return (
                            <label
                              key={action.id}
                              className="flex items-center gap-2 cursor-pointer group"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() =>
                                  handleTogglePermission(module.name, action.action)
                                }
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700 group-hover:text-gray-900">
                                {action.display_name}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                type="button"
                onClick={() => setShowPermissionModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSavePermissions}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <CheckIcon className="w-5 h-5" />
                Lưu phân quyền
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
