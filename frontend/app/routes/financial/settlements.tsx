import { useState } from "react";
import { settlementService } from "~/services";
import type { Settlement } from "~/types/settlement";
import { useAuth } from "~/contexts/AuthContext";
import { useTable } from "~/hooks/useTable";
import { Table } from "~/components/ui/Table";
import { Pagination } from "~/components/ui/Pagination";
import { Badge } from "~/components/ui/Badge";
import { Toast, type ToastType } from "~/components/ui/Toast";
import { BanknotesIcon } from "@heroicons/react/24/outline";

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

export default function SettlementsPage() {
  const { hasPermission } = useAuth();

  // ✅ useTable hook
  const {
    data: settlements,
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
  } = useTable<Settlement>({
    fetchData: settlementService.getSettlements,
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

  const handleApprove = async (settlementId: number) => {
    if (!confirm("Bạn có chắc chắn muốn duyệt quyết toán này?")) return;

    try {
      await settlementService.approveSettlement(settlementId);
      showToast("Duyệt quyết toán thành công", "success");
      refresh();
    } catch (error: any) {
      showToast(error.data?.message || "Không thể duyệt quyết toán", "error");
    }
  };

  const columns = [
    {
      key: "id",
      label: "Mã QT",
      sortable: true,
      render: (settlement: Settlement) => (
        <div className="flex items-center">
          <BanknotesIcon className="w-5 h-5 text-gray-400 mr-2" />
          <span className="font-medium text-gray-900">QT-{settlement.id}</span>
        </div>
      ),
    },
    {
      key: "provider",
      label: "Nhà cung cấp",
      render: (settlement: Settlement) => settlement.provider?.name || "-",
    },
    {
      key: "type",
      label: "Loại",
      render: (settlement: Settlement) => {
        const typeLabels: Record<string, string> = {
          service: "Dịch vụ",
          product: "Sản phẩm",
          mixed: "Hỗn hợp",
        };
        return typeLabels[settlement.type] || settlement.type;
      },
    },
    {
      key: "settlement_subtotal",
      label: "Tổng tiền",
      sortable: true,
      render: (settlement: Settlement) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(settlement.settlement_subtotal || 0),
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (settlement: Settlement) => (
        <Badge variant={settlement.status === "approved" ? "success" : "warning"}>
          {settlement.status === "approved" ? "Đã duyệt" : "Chờ duyệt"}
        </Badge>
      ),
    },
    {
      key: "created_at",
      label: "Ngày tạo",
      sortable: true,
      render: (settlement: Settlement) => new Date(settlement.created_at).toLocaleDateString('vi-VN'),
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (settlement: Settlement) => (
        <div className="flex items-center space-x-2">
          {hasPermission("settlements.approve") && settlement.status === "pending" && (
            <button
              onClick={() => handleApprove(settlement.id)}
              className="text-green-600 hover:text-green-900 text-sm"
            >
              Duyệt
            </button>
          )}
        </div>
      ),
    },
  ];

  if (!hasPermission("settlements.view")) {
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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Quyết toán</h1>
          <p className="text-gray-600 mt-1">Quản lý và duyệt quyết toán</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Tìm kiếm quyết toán..."
            onChange={(e) => handleSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />

          <select
            onChange={(e) => handleFilter("status", e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table
          columns={columns}
          data={settlements}
          isLoading={isLoading}
          emptyMessage="Không có quyết toán nào"
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
