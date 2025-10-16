import { useState } from "react";
import { orderService } from "~/services";
import type { Order } from "~/types/order";
import { useAuth } from "~/contexts/AuthContext";
import { useTable } from "~/hooks/useTable";
import { Table } from "~/components/ui/Table";
import { Pagination } from "~/components/ui/Pagination";
import { Badge } from "~/components/ui/Badge";
import { Toast, type ToastType } from "~/components/ui/Toast";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

const STATUS_LABELS: Record<string, { label: string; variant: "success" | "warning" | "info" | "danger" | "secondary" }> = {
  pending: { label: "Chờ xử lý", variant: "warning" },
  in_progress: { label: "Đang xử lý", variant: "info" },
  completed: { label: "Hoàn thành", variant: "success" },
  cancelled: { label: "Đã hủy", variant: "danger" },
};

export default function OrdersPage() {
  const { hasPermission } = useAuth();

  // ✅ useTable hook
  const {
    data: orders,
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
  } = useTable<Order>({
    fetchData: orderService.getOrders,
    initialPerPage: 20,
    initialSortBy: 'created_at',
    initialSortDirection: 'desc',
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: ToastType = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleUpdateStatus = async (orderId: number, status: string) => {
    try {
      await orderService.updateOrderStatus(orderId, status);
      showToast("Cập nhật trạng thái thành công", "success");
      refresh();
    } catch (error: any) {
      showToast(error.data?.message || "Không thể cập nhật trạng thái", "error");
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    const reason = prompt("Lý do hủy đơn:");
    if (!reason) return;

    try {
      await orderService.cancelOrder(orderId, reason);
      showToast("Hủy đơn hàng thành công", "success");
      refresh();
    } catch (error: any) {
      showToast(error.data?.message || "Không thể hủy đơn hàng", "error");
    }
  };

  const columns = [
    {
      key: "order_code",
      label: "Mã đơn",
      sortable: true,
      render: (order: Order) => (
        <div className="flex items-center">
          <ShoppingCartIcon className="w-5 h-5 text-gray-400 mr-2" />
          <span className="font-medium text-gray-900">{order.order_code || `DH-${order.id}`}</span>
        </div>
      ),
    },
    {
      key: "customer",
      label: "Khách hàng",
      render: (order: Order) => (
        <div>
          <div className="font-medium text-gray-900">{order.customer?.name || "-"}</div>
          <div className="text-sm text-gray-500">{order.customer?.phone || "-"}</div>
        </div>
      ),
    },
    {
      key: "vehicle",
      label: "Xe",
      render: (order: Order) => order.vehicle?.license_plate || "-",
    },
    {
      key: "total_amount",
      label: "Tổng tiền",
      sortable: true,
      render: (order: Order) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_amount || 0),
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (order: Order) => {
        const statusInfo = STATUS_LABELS[order.status] || { label: order.status, variant: "secondary" };
        return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
      },
    },
    {
      key: "created_at",
      label: "Ngày tạo",
      sortable: true,
      render: (order: Order) => new Date(order.created_at).toLocaleDateString('vi-VN'),
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (order: Order) => (
        <div className="flex items-center space-x-2">
          {hasPermission("orders.edit") && order.status === "pending" && (
            <select
              onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
              value=""
            >
              <option value="">Cập nhật trạng thái</option>
              <option value="in_progress">Đang xử lý</option>
              <option value="completed">Hoàn thành</option>
            </select>
          )}
          {hasPermission("orders.delete") && order.status !== "cancelled" && order.status !== "completed" && (
            <button
              onClick={() => handleCancelOrder(order.id)}
              className="text-red-600 hover:text-red-900 text-sm"
            >
              Hủy
            </button>
          )}
        </div>
      ),
    },
  ];

  if (!hasPermission("orders.view")) {
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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Đơn hàng</h1>
          <p className="text-gray-600 mt-1">Quản lý đơn hàng và theo dõi trạng thái</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Tìm kiếm đơn hàng..."
            onChange={(e) => handleSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />

          <select
            onChange={(e) => handleFilter("status", e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="in_progress">Đang xử lý</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table
          columns={columns}
          data={orders}
          isLoading={isLoading}
          emptyMessage="Không có đơn hàng nào"
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
