import { useState } from "react";
import { warehouseService, type WarehouseFormData } from "~/services";
import type { Warehouse } from "~/types/warehouse";
import { useAuth } from "~/contexts/AuthContext";
import { useTable } from "~/hooks/useTable";
import { useModal } from "~/hooks/useModal";
import { useForm } from "~/hooks/useForm";
import { Table } from "~/components/ui/Table";
import { Pagination } from "~/components/ui/Pagination";
import { Button } from "~/components/ui/Button";
import { Toast, type ToastType } from "~/components/ui/Toast";
import { PlusIcon, PencilIcon, BuildingOfficeIcon } from "@heroicons/react/24/outline";

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

export default function WarehousesPage() {
  const { hasPermission } = useAuth();

  // ✅ useTable hook
  const {
    data: warehouses,
    isLoading,
    meta,
    handlePageChange,
    handlePerPageChange,
    handleSort,
    handleSearch,
    refresh,
    sortBy,
    sortDirection,
  } = useTable<Warehouse>({
    fetchData: warehouseService.getWarehouses,
    initialPerPage: 20,
    initialSortBy: 'created_at',
    initialSortDirection: 'desc',
  });

  // ✅ useModal hook
  const createEditModal = useModal(false);

  // States
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // ✅ useForm hook
  const {
    values: formData,
    isSubmitting,
    handleChange: handleFormChange,
    handleSubmit: handleFormSubmit,
    reset,
  } = useForm<WarehouseFormData>({
    initialValues: {
      name: "",
      code: "",
      location: "",
      capacity: 0,
      manager_id: 0,
    },
    onSubmit: async (values) => {
      try {
        if (editingWarehouse) {
          await warehouseService.updateWarehouse(editingWarehouse.id, values);
          showToast("Cập nhật kho thành công", "success");
        } else {
          await warehouseService.createWarehouse(values);
          showToast("Tạo kho thành công", "success");
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
    setEditingWarehouse(null);
    reset();
    createEditModal.open();
  };

  const handleEdit = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    reset();
    handleFormChange('name', warehouse.name);
    handleFormChange('code', warehouse.code);
    handleFormChange('location', warehouse.location);
    handleFormChange('capacity', warehouse.capacity || 0);
    handleFormChange('manager_id', warehouse.manager_id || 0);
    createEditModal.open();
  };

  const columns = [
    {
      key: "code",
      label: "Mã kho",
      sortable: true,
      render: (warehouse: Warehouse) => (
        <div className="flex items-center">
          <BuildingOfficeIcon className="w-5 h-5 text-gray-400 mr-2" />
          <span className="font-medium text-gray-900">{warehouse.code}</span>
        </div>
      ),
    },
    {
      key: "name",
      label: "Tên kho",
      sortable: true,
    },
    {
      key: "location",
      label: "Vị trí",
      render: (warehouse: Warehouse) => warehouse.location || "-",
    },
    {
      key: "capacity",
      label: "Sức chứa",
      render: (warehouse: Warehouse) => warehouse.capacity ? `${warehouse.capacity} m³` : "-",
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (warehouse: Warehouse) => (
        <div className="flex items-center space-x-2">
          {hasPermission("warehouses.edit") && (
            <button onClick={() => handleEdit(warehouse)} className="text-blue-600 hover:text-blue-900" title="Sửa">
              <PencilIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  if (!hasPermission("warehouses.view")) {
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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Kho</h1>
          <p className="text-gray-600 mt-1">Quản lý kho hàng và vị trí lưu trữ</p>
        </div>
        {hasPermission("warehouses.create") && (
          <Button onClick={handleCreate}>
            <PlusIcon className="w-5 h-5 mr-2" />
            Thêm kho
          </Button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <input
          type="text"
          placeholder="Tìm kiếm kho..."
          onChange={(e) => handleSearch(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full md:w-1/3"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table
          columns={columns}
          data={warehouses}
          isLoading={isLoading}
          emptyMessage="Không có kho nào"
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
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingWarehouse ? "Sửa kho" : "Thêm kho mới"}
              </h2>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên kho <span className="text-red-500">*</span>
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
                      Mã kho <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={(e) => handleFormChange('code', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vị trí <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => handleFormChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sức chứa (m³)
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => handleFormChange('capacity', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={createEditModal.close}>
                    Hủy
                  </Button>
                  <Button type="submit" variant="primary" disabled={isSubmitting}>
                    {isSubmitting ? "Đang xử lý..." : (editingWarehouse ? "Cập nhật" : "Tạo mới")}
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
