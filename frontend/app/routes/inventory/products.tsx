import { useState } from "react";
import { productService, type ProductFormData } from "~/services";
import type { Product } from "~/types/product";
import { useAuth } from "~/contexts/AuthContext";
import { useTable } from "~/hooks/useTable";
import { useModal } from "~/hooks/useModal";
import { useForm } from "~/hooks/useForm";
import { Table } from "~/components/ui/Table";
import { Pagination } from "~/components/ui/Pagination";
import { Button } from "~/components/ui/Button";
import { Badge } from "~/components/ui/Badge";
import { Toast, type ToastType } from "~/components/ui/Toast";
import { PlusIcon, PencilIcon, TrashIcon, CubeIcon } from "@heroicons/react/24/outline";

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

export default function ProductsPage() {
  const { hasPermission } = useAuth();

  // ✅ useTable hook
  const {
    data: products,
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
  } = useTable<Product>({
    fetchData: productService.getProducts,
    initialPerPage: 20,
    initialSortBy: 'created_at',
    initialSortDirection: 'desc',
  });

  // ✅ useModal hook
  const createEditModal = useModal(false);

  // States
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // ✅ useForm hook
  const {
    values: formData,
    errors,
    touched,
    isSubmitting,
    handleChange: handleFormChange,
    handleBlur,
    handleSubmit: handleFormSubmit,
    reset,
  } = useForm<ProductFormData>({
    initialValues: {
      name: "",
      sku: "",
      category_id: 0,
      unit: "",
      price: 0,
      stock_quantity: 0,
      min_stock_level: 0,
      description: "",
    },
    onSubmit: async (values) => {
      try {
        if (editingProduct) {
          await productService.updateProduct(editingProduct.id, values);
          showToast("Cập nhật sản phẩm thành công", "success");
        } else {
          await productService.createProduct(values);
          showToast("Tạo sản phẩm thành công", "success");
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
    setEditingProduct(null);
    reset();
    createEditModal.open();
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    reset();
    handleFormChange('name', product.name);
    handleFormChange('sku', product.sku);
    handleFormChange('category_id', product.category_id);
    handleFormChange('unit', product.unit);
    handleFormChange('price', product.price);
    handleFormChange('stock_quantity', product.stock_quantity);
    handleFormChange('min_stock_level', product.min_stock_level || 0);
    handleFormChange('description', product.description || "");
    createEditModal.open();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;

    try {
      await productService.deleteProduct(id);
      showToast("Xóa sản phẩm thành công", "success");
      refresh();
    } catch (error: any) {
      showToast(error.data?.message || "Không thể xóa sản phẩm", "error");
    }
  };

  const columns = [
    {
      key: "sku",
      label: "Mã SP",
      sortable: true,
      render: (product: Product) => (
        <div className="flex items-center">
          <CubeIcon className="w-5 h-5 text-gray-400 mr-2" />
          <span className="font-medium text-gray-900">{product.sku}</span>
        </div>
      ),
    },
    {
      key: "name",
      label: "Tên sản phẩm",
      sortable: true,
    },
    {
      key: "category",
      label: "Danh mục",
      render: (product: Product) => product.category?.name || "-",
    },
    {
      key: "price",
      label: "Đơn giá",
      sortable: true,
      render: (product: Product) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price),
    },
    {
      key: "stock_quantity",
      label: "Tồn kho",
      sortable: true,
      render: (product: Product) => (
        <Badge variant={product.stock_quantity > (product.min_stock_level || 0) ? "success" : "danger"}>
          {product.stock_quantity} {product.unit}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (product: Product) => (
        <div className="flex items-center space-x-2">
          {hasPermission("products.edit") && (
            <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-900" title="Sửa">
              <PencilIcon className="w-5 h-5" />
            </button>
          )}
          {hasPermission("products.delete") && (
            <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900" title="Xóa">
              <TrashIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  if (!hasPermission("products.view")) {
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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Sản phẩm</h1>
          <p className="text-gray-600 mt-1">Quản lý sản phẩm và tồn kho</p>
        </div>
        {hasPermission("products.create") && (
          <Button onClick={handleCreate}>
            <PlusIcon className="w-5 h-5 mr-2" />
            Thêm sản phẩm
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            onChange={(e) => handleSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table
          columns={columns}
          data={products}
          isLoading={isLoading}
          emptyMessage="Không có sản phẩm nào"
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

      {/* Create/Edit Modal */}
      {createEditModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
              </h2>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên sản phẩm <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      onBlur={() => handleBlur('name')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mã SKU <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.sku}
                      onChange={(e) => handleFormChange('sku', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Đơn vị <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.unit}
                      onChange={(e) => handleFormChange('unit', e.target.value)}
                      placeholder="Cái, Hộp, Kg..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giá <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => handleFormChange('price', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số lượng tồn kho
                    </label>
                    <input
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) => handleFormChange('stock_quantity', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tồn kho tối thiểu
                    </label>
                    <input
                      type="number"
                      value={formData.min_stock_level}
                      onChange={(e) => handleFormChange('min_stock_level', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={createEditModal.close}>
                    Hủy
                  </Button>
                  <Button type="submit" variant="primary" disabled={isSubmitting}>
                    {isSubmitting ? "Đang xử lý..." : (editingProduct ? "Cập nhật" : "Tạo mới")}
                  </Button>
                </div>
              </form>
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
