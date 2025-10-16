import { useState } from "react";
import { serviceRequestService, type ServiceRequest } from "~/services";
import { useAuth } from "~/contexts/AuthContext";
import { useTable } from "~/hooks/useTable";
import { Table } from "~/components/ui/Table";
import { Pagination } from "~/components/ui/Pagination";
import { Badge } from "~/components/ui/Badge";
import { Toast, type ToastType } from "~/components/ui/Toast";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

const STATUS_LABELS: Record<string, { label: string; variant: "success" | "warning" | "info" | "danger" | "secondary" }> = {
  pending: { label: "Chờ duyệt", variant: "warning" },
  approved: { label: "Đã duyệt", variant: "info" },
  in_progress: { label: "Đang xử lý", variant: "info" },
  completed: { label: "Hoàn thành", variant: "success" },
  cancelled: { label: "Đã hủy", variant: "danger" },
};

const PRIORITY_LABELS: Record<string, { label: string; variant: "success" | "warning" | "info" | "danger" | "secondary" }> = {
  low: { label: "Thấp", variant: "secondary" },
  medium: { label: "Trung bình", variant: "info" },
  high: { label: "Cao", variant: "warning" },
  urgent: { label: "Khẩn cấp", variant: "danger" },
};

export default function ServiceRequestsPage() {
  const { hasPermission } = useAuth();

  // ✅ useTable hook
  const {
    data: serviceRequests,
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
  } = useTable<ServiceRequest>({
    fetchData: serviceRequestService.getServiceRequests,
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

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa yêu cầu này?")) return;

    try {
      await serviceRequestService.deleteServiceRequest(id);
      showToast("Xóa yêu cầu thành công", "success");
      refresh();
    } catch (error: any) {
      showToast(error.data?.message || "Không thể xóa yêu cầu", "error");
    }
  };

  const columns = [
    {
      key: "id",
      label: "Mã YC",
      sortable: true,
      render: (request: ServiceRequest) => (
        <div className="flex items-center">
          <ClipboardDocumentListIcon className="w-5 h-5 text-gray-400 mr-2" />
          <span className="font-medium text-gray-900">YC-{request.id}</span>
        </div>
      ),
    },
    {
      key: "customer",
      label: "Khách hàng",
      render: (request: ServiceRequest) => (
        <div>
          <div className="font-medium text-gray-900">{request.customer?.name || "-"}</div>
          <div className="text-sm text-gray-500">{request.customer?.phone || "-"}</div>
        </div>
      ),
    },
    {
      key: "vehicle",
      label: "Xe",
      render: (request: ServiceRequest) => request.vehicle?.license_plate || "-",
    },
    {
      key: "service_type",
      label: "Loại dịch vụ",
      render: (request: ServiceRequest) => request.service_type || "-",
    },
    {
      key: "priority",
      label: "Ưu tiên",
      render: (request: ServiceRequest) => {
        const priorityInfo = PRIORITY_LABELS[request.priority] || { label: request.priority, variant: "secondary" };
        return <Badge variant={priorityInfo.variant}>{priorityInfo.label}</Badge>;
      },
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (request: ServiceRequest) => {
        const statusInfo = STATUS_LABELS[request.status] || { label: request.status, variant: "secondary" };
        return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
      },
    },
    {
      key: "requested_date",
      label: "Ngày yêu cầu",
      sortable: true,
      render: (request: ServiceRequest) => new Date(request.requested_date).toLocaleDateString('vi-VN'),
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (request: ServiceRequest) => (
        <div className="flex items-center space-x-2">
          {hasPermission("service-requests.delete") && request.status === "pending" && (
            <button
              onClick={() => handleDelete(request.id)}
              className="text-red-600 hover:text-red-900 text-sm"
            >
              Xóa
            </button>
          )}
        </div>
      ),
    },
  ];

  if (!hasPermission("service-requests.view")) {
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
          <h1 className="text-2xl font-bold text-gray-900">Yêu cầu Dịch vụ</h1>
          <p className="text-gray-600 mt-1">Quản lý yêu cầu dịch vụ từ khách hàng</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Tìm kiếm yêu cầu..."
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
            <option value="in_progress">Đang xử lý</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>

          <select
            onChange={(e) => handleFilter("priority", e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả độ ưu tiên</option>
            <option value="low">Thấp</option>
            <option value="medium">Trung bình</option>
            <option value="high">Cao</option>
            <option value="urgent">Khẩn cấp</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table
          columns={columns}
          data={serviceRequests}
          isLoading={isLoading}
          emptyMessage="Không có yêu cầu dịch vụ nào"
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
