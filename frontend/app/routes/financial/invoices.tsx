import { useState } from "react";
import { invoiceService } from "~/services";
import type { Invoice } from "~/types/invoice";
import { useAuth } from "~/contexts/AuthContext";
import { useTable } from "~/hooks/useTable";
import { Table } from "~/components/ui/Table";
import { Pagination } from "~/components/ui/Pagination";
import { Badge } from "~/components/ui/Badge";
import { Toast, type ToastType } from "~/components/ui/Toast";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import type { Route } from "./+types/invoices";

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

const STATUS_LABELS: Record<string, { label: string; variant: "success" | "warning" | "info" | "danger" | "secondary" }> = {
  pending: { label: "Chờ thanh toán", variant: "warning" },
  paid: { label: "Đã thanh toán", variant: "success" },
  cancelled: { label: "Đã hủy", variant: "danger" },
};

export default function InvoicesPage() {
  const { hasPermission } = useAuth();

  // ✅ useTable hook
  const {
    data: invoices,
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
  } = useTable<Invoice>({
    fetchData: invoiceService.getInvoices,
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

  const handleUpdateStatus = async (invoiceId: number, status: string) => {
    try {
      await invoiceService.updateInvoiceStatus(invoiceId, status);
      showToast("Cập nhật trạng thái thành công", "success");
      refresh();
    } catch (error: any) {
      showToast(error.data?.message || "Không thể cập nhật trạng thái", "error");
    }
  };

  const columns = [
    {
      key: "invoice_number",
      label: "Số hóa đơn",
      sortable: true,
      render: (invoice: Invoice) => (
        <div className="flex items-center">
          <DocumentTextIcon className="w-5 h-5 text-gray-400 mr-2" />
          <span className="font-medium text-gray-900">{invoice.invoice_number || `INV-${invoice.id}`}</span>
        </div>
      ),
    },
    {
      key: "customer",
      label: "Khách hàng",
      render: (invoice: Invoice) => invoice.customer?.name || "-",
    },
    {
      key: "total_amount",
      label: "Tổng tiền",
      sortable: true,
      render: (invoice: Invoice) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(invoice.total_amount || 0),
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (invoice: Invoice) => {
        const statusInfo = STATUS_LABELS[invoice.status] || { label: invoice.status, variant: "secondary" };
        return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
      },
    },
    {
      key: "created_at",
      label: "Ngày tạo",
      sortable: true,
      render: (invoice: Invoice) => new Date(invoice.created_at).toLocaleDateString('vi-VN'),
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (invoice: Invoice) => (
        <div className="flex items-center space-x-2">
          {hasPermission("invoices.edit") && invoice.status === "pending" && (
            <button
              onClick={() => handleUpdateStatus(invoice.id, "paid")}
              className="text-green-600 hover:text-green-900 text-sm"
            >
              Đánh dấu đã trả
            </button>
          )}
        </div>
      ),
    },
  ];

  if (!hasPermission("invoices.view")) {
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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Hóa đơn</h1>
          <p className="text-gray-600 mt-1">Theo dõi và quản lý hóa đơn</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Tìm kiếm hóa đơn..."
            onChange={(e) => handleSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />

          <select
            onChange={(e) => handleFilter("status", e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ thanh toán</option>
            <option value="paid">Đã thanh toán</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table
          columns={columns}
          data={invoices}
          isLoading={isLoading}
          emptyMessage="Không có hóa đơn nào"
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
