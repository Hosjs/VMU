import { useState } from "react";
import { paymentService, type Payment } from "~/services";
import { useAuth } from "~/contexts/AuthContext";
import { useTable } from "~/hooks/useTable";
import { Table } from "~/components/ui/Table";
import { Pagination } from "~/components/ui/Pagination";
import { Badge } from "~/components/ui/Badge";
import { Toast, type ToastType } from "~/components/ui/Toast";
import { CreditCardIcon } from "@heroicons/react/24/outline";

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

export default function PaymentsPage() {
  const { hasPermission } = useAuth();

  // ✅ useTable hook
  const {
    data: payments,
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
  } = useTable<Payment>({
    fetchData: paymentService.getPayments,
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

  const handleConfirmPayment = async (paymentId: number) => {
    try {
      await paymentService.confirmPayment(paymentId);
      showToast("Xác nhận thanh toán thành công", "success");
      refresh();
    } catch (error: any) {
      showToast(error.data?.message || "Không thể xác nhận thanh toán", "error");
    }
  };

  const columns = [
    {
      key: "id",
      label: "ID",
      sortable: true,
      render: (payment: Payment) => (
        <div className="flex items-center">
          <CreditCardIcon className="w-5 h-5 text-gray-400 mr-2" />
          <span className="font-medium text-gray-900">#{payment.id}</span>
        </div>
      ),
    },
    {
      key: "payment_method",
      label: "Phương thức",
      render: (payment: Payment) => payment.payment_method || "-",
    },
    {
      key: "amount",
      label: "Số tiền",
      sortable: true,
      render: (payment: Payment) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(payment.amount),
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (payment: Payment) => (
        <Badge variant={payment.status === "confirmed" ? "success" : "warning"}>
          {payment.status === "confirmed" ? "Đã xác nhận" : "Chờ xác nhận"}
        </Badge>
      ),
    },
    {
      key: "created_at",
      label: "Ngày tạo",
      sortable: true,
      render: (payment: Payment) => new Date(payment.created_at).toLocaleDateString('vi-VN'),
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (payment: Payment) => (
        <div className="flex items-center space-x-2">
          {hasPermission("payments.edit") && payment.status === "pending" && (
            <button
              onClick={() => handleConfirmPayment(payment.id)}
              className="text-green-600 hover:text-green-900 text-sm"
            >
              Xác nhận
            </button>
          )}
        </div>
      ),
    },
  ];

  if (!hasPermission("payments.view")) {
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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Thanh toán</h1>
          <p className="text-gray-600 mt-1">Theo dõi và xác nhận thanh toán</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Tìm kiếm thanh toán..."
            onChange={(e) => handleSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />

          <select
            onChange={(e) => handleFilter("status", e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="confirmed">Đã xác nhận</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table
          columns={columns}
          data={payments}
          isLoading={isLoading}
          emptyMessage="Không có thanh toán nào"
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
