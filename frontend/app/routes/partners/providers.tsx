import { useState } from "react";
import { providerService, type ProviderFormData } from "~/services";
import type { Provider } from "~/types/provider";
import { useAuth } from "~/contexts/AuthContext";
import { useTable } from "~/hooks/useTable";
import { useModal } from "~/hooks/useModal";
import { useForm } from "~/hooks/useForm";
import { Table } from "~/components/ui/Table";
import { Pagination } from "~/components/ui/Pagination";
import { Button } from "~/components/ui/Button";
import { Badge } from "~/components/ui/Badge";
import { Toast, type ToastType } from "~/components/ui/Toast";
import { PlusIcon, PencilIcon, TrashIcon, BuildingStorefrontIcon } from "@heroicons/react/24/outline";

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

export default function ProvidersPage() {
  const { hasPermission } = useAuth();

  // ✅ useTable hook
  const {
    data: providers,
    isLoading,
    meta,
    handlePageChange,
    handlePerPageChange,
    handleSort,
    handleSearch,
    refresh,
    sortBy,
    sortDirection,
  } = useTable<Provider>({
    fetchData: providerService.getProviders,
    initialPerPage: 20,
    initialSortBy: 'created_at',
    initialSortDirection: 'desc',
  });

  // ✅ useModal hook
  const createEditModal = useModal(false);

  // States
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // ✅ useForm hook
  const {
    values: formData,
    isSubmitting,
    handleChange: handleFormChange,
    handleSubmit: handleFormSubmit,
    reset,
  } = useForm<ProviderFormData>({
    initialValues: {
      name: "",
      code: "",
      contact_person: "",
      phone: "",
      email: "",
      address: "",
      tax_code: "",
      commission_rate: 0,
    },
    onSubmit: async (values) => {
      try {
        if (editingProvider) {
          await providerService.updateProvider(editingProvider.id, values);
          showToast("Cập nhật nhà cung cấp thành công", "success");
        } else {
          await providerService.createProvider(values);
          showToast("Tạo nhà cung cấp thành công", "success");
        }
        createEditModal.close();
        refresh();
      } catch (error: any) {
        showToast(error.data?.message || "Có lỗi xảy ra", "error");
      }
    },
  });

  const showToast = (message: string, type: ToastType = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleCreate = () => {
    setEditingProvider(null);
    reset();
    createEditModal.open();
  };

  const handleEdit = (provider: Provider) => {
    setEditingProvider(provider);
    reset();
    handleFormChange('name', provider.name);
    handleFormChange('code', provider.code);
    handleFormChange('contact_person', provider.contact_person || "");
    handleFormChange('phone', provider.phone || "");
    handleFormChange('email', provider.email || "");
    handleFormChange('address', provider.address || "");
    handleFormChange('tax_code', provider.tax_code || "");
    handleFormChange('commission_rate', provider.commission_rate || 0);
    createEditModal.open();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa nhà cung cấp này?")) return;

    try {
      await providerService.deleteProvider(id);
      showToast("Xóa nhà cung cấp thành công", "success");
      refresh();
    } catch (error: any) {
      showToast(error.data?.message || "Không thể xóa nhà cung cấp", "error");
    }
  };

  const columns = [
    {
      key: "code",
      label: "Mã NCC",
      sortable: true,
      render: (provider: Provider) => (
        <div className="flex items-center">
          <BuildingStorefrontIcon className="w-5 h-5 text-gray-400 mr-2" />
          <span className="font-medium text-gray-900">{provider.code}</span>
        </div>
      ),
    },
    {
      key: "name",
      label: "Tên nhà cung cấp",
      sortable: true,
    },
    {
      key: "contact_person",
      label: "Người liên hệ",
      render: (provider: Provider) => (
        <div>
          <div className="text-sm text-gray-900">{provider.contact_person || "-"}</div>
          <div className="text-sm text-gray-500">{provider.phone || "-"}</div>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (provider: Provider) => provider.email || "-",
    },
    {
      key: "commission_rate",
      label: "Tỷ lệ hoa hồng",
      render: (provider: Provider) => provider.commission_rate ? `${provider.commission_rate}%` : "-",
    },
    {
      key: "rating",
      label: "Đánh giá",
      render: (provider: Provider) => (
        <Badge variant="info">{provider.rating || 0}/5 ⭐</Badge>
      ),
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (provider: Provider) => (
        <div className="flex items-center space-x-2">
          {hasPermission("providers.edit") && (
            <button onClick={() => handleEdit(provider)} className="text-blue-600 hover:text-blue-900" title="Sửa">
              <PencilIcon className="w-5 h-5" />
            </button>
          )}
          {hasPermission("providers.delete") && (
            <button onClick={() => handleDelete(provider.id)} className="text-red-600 hover:text-red-900" title="Xóa">
              <TrashIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  if (!hasPermission("providers.view")) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Bạn không có quyền truy cập trang này</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Nhà cung cấp</h1>
          <p className="text-gray-600 mt-1">Quản lý nhà cung cấp và đối tác</p>
        </div>
        {hasPermission("providers.create") && (
          <Button onClick={handleCreate}>
            <PlusIcon className="w-5 h-5 mr-2" />
            Thêm nhà cung cấp
          </Button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <input
          type="text"
          placeholder="Tìm kiếm nhà cung cấp..."
          onChange={(e) => handleSearch(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full md:w-1/3"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table
          columns={columns}
          data={providers}
          isLoading={isLoading}
          emptyMessage="Không có nhà cung cấp nào"
          onSort={handleSort}
          sortBy={sortBy}
          sortDirection={sortDirection}
        />

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

      {createEditModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingProvider ? "Sửa nhà cung cấp" : "Thêm nhà cung cấp mới"}
              </h2>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên NCC <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mã NCC <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={(e) => handleFormChange('code', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Người liên hệ
                    </label>
                    <input
                      type="text"
                      value={formData.contact_person}
                      onChange={(e) => handleFormChange('contact_person', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Điện thoại
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleFormChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleFormChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mã số thuế
                    </label>
                    <input
                      type="text"
                      value={formData.tax_code}
                      onChange={(e) => handleFormChange('tax_code', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => handleFormChange('address', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tỷ lệ hoa hồng (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.commission_rate}
                    onChange={(e) => handleFormChange('commission_rate', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={createEditModal.close}>
                    Hủy
                  </Button>
                  <Button type="submit" variant="primary" disabled={isSubmitting}>
                    {isSubmitting ? "Đang xử lý..." : (editingProvider ? "Cập nhật" : "Tạo mới")}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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
