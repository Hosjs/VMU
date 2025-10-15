import { useState, useCallback } from 'react';
import type { Route } from './+types/orders';
import { Card } from '~/components/ui/Card';
import { Badge } from '~/components/ui/Badge';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { Select } from '~/components/ui/Select';
import { Modal } from '~/components/ui/Modal';
import { Table } from '~/components/ui/Table';
import { Pagination } from '~/components/ui/Pagination';
import { Toast } from '~/components/ui/Toast';
import { orderService } from '~/services/order.service';
import { useTable } from '~/hooks/useTable';
import { useModal } from '~/hooks/useModal';
import type { Order } from '~/types/order';
import { formatters } from '~/utils/formatters';

// Export loader function for React Router v7
export async function loader({ request }: Route.LoaderArgs) {
  return null;
}

export default function Orders() {
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const viewModal = useModal();
    const deleteModal = useModal();

    const fetchOrders = useCallback(async (params: any) => {
        return await orderService.getAll(params);
    }, []);

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
        search,
        filters,
    } = useTable<Order>({
        fetchData: fetchOrders,
        initialPerPage: 15,
        initialSortBy: 'created_at',
        initialSortDirection: 'desc',
    });

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    const handleView = (order: Order) => {
        setSelectedOrder(order);
        viewModal.open();
    };

    const handleDeleteClick = (order: Order) => {
        setSelectedOrder(order);
        deleteModal.open();
    };

    const handleDeleteConfirm = async () => {
        if (!selectedOrder) return;

        try {
            await orderService.delete(selectedOrder.id);
            showToast('success', 'Xóa đơn hàng thành công');
            deleteModal.close();
            refresh();
        } catch (error: any) {
            showToast('error', error.message || 'Không thể xóa đơn hàng');
        }
    };

    const handleStatusChange = async (orderId: number, newStatus: Order['status']) => {
        try {
            await orderService.updateStatus(orderId, newStatus);
            showToast('success', 'Cập nhật trạng thái thành công');
            refresh();
        } catch (error: any) {
            showToast('error', error.message || 'Không thể cập nhật trạng thái');
        }
    };

    const getStatusText = (status: string) => {
        const map: Record<string, string> = {
            draft: 'Nháp',
            quoted: 'Đã báo giá',
            confirmed: 'Đã xác nhận',
            in_progress: 'Đang thực hiện',
            completed: 'Hoàn thành',
            delivered: 'Đã giao',
            paid: 'Đã thanh toán',
            cancelled: 'Đã hủy',
        };
        return map[status] || status;
    };

    const getStatusVariant = (status: string): 'success' | 'warning' | 'danger' | 'info' | 'secondary' => {
        const map: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'secondary'> = {
            draft: 'secondary',
            quoted: 'info',
            confirmed: 'info',
            in_progress: 'warning',
            completed: 'success',
            delivered: 'success',
            paid: 'success',
            cancelled: 'danger',
        };
        return map[status] || 'secondary';
    };

    const getTypeText = (type: string) => {
        const map: Record<string, string> = {
            service: 'Dịch vụ',
            product: 'Sản phẩm',
            mixed: 'Hỗn hợp',
        };
        return map[type] || type;
    };

    const columns = [
        {
            key: 'order_number',
            label: 'Mã đơn',
            sortable: true,
            width: '120px',
            render: (order: Order) => (
                <span className="font-semibold text-blue-600">{order.order_number}</span>
            ),
        },
        {
            key: 'customer',
            label: 'Khách hàng',
            render: (order: Order) => (
                <div>
                    <p className="font-medium text-gray-900">{order.customer?.name || '-'}</p>
                    {order.customer?.phone && (
                        <p className="text-xs text-gray-600">{formatters.phone(order.customer.phone)}</p>
                    )}
                </div>
            ),
        },
        {
            key: 'vehicle',
            label: 'Xe',
            render: (order: Order) => (
                <div>
                    {order.vehicle ? (
                        <>
                            <p className="text-sm font-medium text-gray-900">{order.vehicle.license_plate}</p>
                            <p className="text-xs text-gray-600">
                                {order.vehicle.brand?.name} {order.vehicle.model?.name}
                            </p>
                        </>
                    ) : (
                        <span className="text-sm text-gray-500">-</span>
                    )}
                </div>
            ),
        },
        {
            key: 'type',
            label: 'Loại',
            render: (order: Order) => (
                <Badge variant="info">{getTypeText(order.type)}</Badge>
            ),
        },
        {
            key: 'final_amount',
            label: 'Tổng tiền',
            sortable: true,
            render: (order: Order) => (
                <span className="font-semibold text-gray-900">
                    {formatters.currency(order.final_amount || 0)}
                </span>
            ),
        },
        {
            key: 'status',
            label: 'Trạng thái',
            render: (order: Order) => (
                <Badge variant={getStatusVariant(order.status)}>
                    {getStatusText(order.status)}
                </Badge>
            ),
        },
        {
            key: 'payment_status',
            label: 'Thanh toán',
            render: (order: Order) => {
                const paymentMap: Record<string, { text: string; variant: 'success' | 'warning' | 'danger' | 'secondary' }> = {
                    pending: { text: 'Chưa TT', variant: 'secondary' },
                    partial: { text: 'TT 1 phần', variant: 'warning' },
                    paid: { text: 'Đã TT', variant: 'success' },
                    refunded: { text: 'Hoàn tiền', variant: 'danger' },
                };
                const payment = paymentMap[order.payment_status] || { text: order.payment_status, variant: 'secondary' };
                return <Badge variant={payment.variant}>{payment.text}</Badge>;
            },
        },
        {
            key: 'created_at',
            label: 'Ngày tạo',
            sortable: true,
            render: (order: Order) => formatters.date(order.created_at),
        },
        {
            key: 'actions',
            label: 'Thao tác',
            render: (order: Order) => (
                <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleView(order)}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteClick(order)}>
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Quản lý đơn hàng</h1>
                <p className="text-gray-600 mt-2">Quản lý tất cả các đơn hàng trong hệ thống</p>
            </div>

            <Card>
                <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        <Input
                            placeholder="Tìm kiếm mã đơn, khách hàng..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full md:w-96"
                        />
                        <Select
                            value={filters.status || ''}
                            onChange={(e) => handleFilter('status', e.target.value || undefined)}
                            className="w-full md:w-48"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="draft">Nháp</option>
                            <option value="quoted">Đã báo giá</option>
                            <option value="confirmed">Đã xác nhận</option>
                            <option value="in_progress">Đang thực hiện</option>
                            <option value="completed">Hoàn thành</option>
                            <option value="delivered">Đã giao</option>
                            <option value="paid">Đã thanh toán</option>
                            <option value="cancelled">Đã hủy</option>
                        </Select>
                        <Select
                            value={filters.type || ''}
                            onChange={(e) => handleFilter('type', e.target.value || undefined)}
                            className="w-full md:w-48"
                        >
                            <option value="">Tất cả loại</option>
                            <option value="service">Dịch vụ</option>
                            <option value="product">Sản phẩm</option>
                            <option value="mixed">Hỗn hợp</option>
                        </Select>
                        <Select
                            value={filters.payment_status || ''}
                            onChange={(e) => handleFilter('payment_status', e.target.value || undefined)}
                            className="w-full md:w-48"
                        >
                            <option value="">TT tất cả</option>
                            <option value="pending">Chưa thanh toán</option>
                            <option value="partial">TT một phần</option>
                            <option value="paid">Đã thanh toán</option>
                            <option value="refunded">Hoàn tiền</option>
                        </Select>
                    </div>
                    <Button variant="primary" onClick={() => window.location.href = '/admin/orders/create'}>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Tạo đơn hàng
                    </Button>
                </div>

                <Table
                    columns={columns}
                    data={orders}
                    isLoading={isLoading}
                    sortBy={sortBy}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                />

                <Pagination
                    currentPage={meta.current_page}
                    totalPages={meta.last_page}
                    onPageChange={handlePageChange}
                    perPage={meta.per_page}
                    onPerPageChange={handlePerPageChange}
                    total={meta.total}
                />
            </Card>

            {/* View Order Modal */}
            <Modal
                isOpen={viewModal.isOpen}
                onClose={viewModal.close}
                title={`Chi tiết đơn hàng ${selectedOrder?.order_number || ''}`}
                size="lg"
            >
                {selectedOrder && (
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Khách hàng</p>
                                <p className="font-medium text-gray-900">{selectedOrder.customer?.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Số điện thoại</p>
                                <p className="font-medium text-gray-900">{formatters.phone(selectedOrder.customer?.phone)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Xe</p>
                                <p className="font-medium text-gray-900">
                                    {selectedOrder.vehicle?.license_plate || '-'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Loại đơn</p>
                                <p className="font-medium text-gray-900">{getTypeText(selectedOrder.type)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Trạng thái</p>
                                <Badge variant={getStatusVariant(selectedOrder.status)}>
                                    {getStatusText(selectedOrder.status)}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Tổng tiền</p>
                                <p className="font-semibold text-lg text-blue-600">
                                    {formatters.currency(selectedOrder.final_amount)}
                                </p>
                            </div>
                        </div>

                        {selectedOrder.items && selectedOrder.items.length > 0 && (
                            <div>
                                <h4 className="font-semibold mb-3">Chi tiết sản phẩm/dịch vụ</h4>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-3 py-2 text-left">Tên</th>
                                                <th className="px-3 py-2 text-right">SL</th>
                                                <th className="px-3 py-2 text-right">Đơn giá</th>
                                                <th className="px-3 py-2 text-right">Thành tiền</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {selectedOrder.items.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="px-3 py-2">{item.item_name}</td>
                                                    <td className="px-3 py-2 text-right">{item.quantity} {item.unit}</td>
                                                    <td className="px-3 py-2 text-right">{formatters.currency(item.quote_unit_price)}</td>
                                                    <td className="px-3 py-2 text-right font-medium">{formatters.currency(item.quote_total_price)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button variant="ghost" onClick={viewModal.close}>Đóng</Button>
                            <Button variant="primary" onClick={() => window.location.href = `/admin/orders/${selectedOrder.id}/edit`}>
                                Chỉnh sửa
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModal.isOpen}
                onClose={deleteModal.close}
                title="Xác nhận xóa"
                size="sm"
            >
                <div className="p-6">
                    <p className="text-gray-600 mb-6">
                        Bạn có chắc chắn muốn xóa đơn hàng <strong>{selectedOrder?.order_number}</strong>?
                    </p>
                    <div className="flex items-center justify-end gap-3">
                        <Button variant="ghost" onClick={deleteModal.close}>Hủy</Button>
                        <Button variant="danger" onClick={handleDeleteConfirm}>Xóa</Button>
                    </div>
                </div>
            </Modal>

            {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
        </div>
    );
}
