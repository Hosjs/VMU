import { useState, useEffect } from 'react';
import { Card } from '~/components/ui/Card';
import { Badge } from '~/components/ui/Badge';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { Select } from '~/components/ui/Select';
import { Modal } from '~/components/ui/Modal';
import { LoadingSpinner } from '~/components/LoadingSystem';
import { customerService } from '~/services/customer.service';
import type { Customer } from '~/types/customer';
import type { TableQueryParams } from '~/types/common';

export default function Customers() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
    });

    // Filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        notes: '',
        is_active: true,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
        show: false,
        message: '',
        type: 'success',
    });

    useEffect(() => {
        loadCustomers();
    }, [search, statusFilter, sortBy, sortOrder, pagination.current_page]);

    const loadCustomers = async () => {
        setLoading(true);
        try {
            const params: TableQueryParams = {
                page: pagination.current_page,
                per_page: pagination.per_page,
                search,
                sort_by: sortBy,
                sort_direction: sortOrder,
                filters: statusFilter ? { is_active: statusFilter } : {},
            };

            const response = await customerService.getCustomers(params);
            setCustomers(response.data);
            setPagination({
                current_page: response.current_page,
                last_page: response.last_page,
                per_page: response.per_page,
                total: response.total,
            });
        } catch (error: any) {
            showToast(error.message || 'Không thể tải danh sách khách hàng', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleCreate = () => {
        setModalMode('create');
        setSelectedCustomer(null);
        setFormData({
            name: '',
            phone: '',
            email: '',
            address: '',
            notes: '',
            is_active: true,
        });
        setErrors({});
        setShowModal(true);
    };

    const handleEdit = (customer: Customer) => {
        setModalMode('edit');
        setSelectedCustomer(customer);
        setFormData({
            name: customer.name,
            phone: customer.phone,
            email: customer.email || '',
            address: customer.address || '',
            notes: customer.notes || '',
            is_active: customer.is_active,
        });
        setErrors({});
        setShowModal(true);
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) newErrors.name = 'Tên khách hàng là bắt buộc';
        if (!formData.phone.trim()) newErrors.phone = 'Số điện thoại là bắt buộc';
        else if (!/^[0-9]{10,11}$/.test(formData.phone)) newErrors.phone = 'Số điện thoại không hợp lệ';

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            if (modalMode === 'create') {
                await customerService.createCustomer(formData);
                showToast('Thêm khách hàng thành công', 'success');
            } else if (selectedCustomer) {
                await customerService.updateCustomer(selectedCustomer.id, formData);
                showToast('Cập nhật khách hàng thành công', 'success');
            }
            setShowModal(false);
            loadCustomers();
        } catch (error: any) {
            showToast(error.message || 'Có lỗi xảy ra', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (customer: Customer) => {
        if (!confirm(`Bạn có chắc muốn xóa khách hàng "${customer.name}"?`)) return;

        try {
            await customerService.deleteCustomer(customer.id);
            showToast('Xóa khách hàng thành công', 'success');
            loadCustomers();
        } catch (error: any) {
            showToast(error.message || 'Không thể xóa khách hàng', 'error');
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('vi-VN');
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Khách hàng</h1>
                    <p className="text-gray-600 mt-1">Quản lý thông tin khách hàng</p>
                </div>
                <Button onClick={handleCreate} variant="primary">
                    <span className="mr-2">+</span>
                    Thêm khách hàng
                </Button>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Input
                        placeholder="Tìm kiếm tên, SĐT, email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="1">Hoạt động</option>
                        <option value="0">Ngừng hoạt động</option>
                    </Select>
                    <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="created_at">Ngày tạo</option>
                        <option value="name">Tên</option>
                        <option value="total_spent">Tổng chi tiêu</option>
                    </Select>
                    <Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}>
                        <option value="desc">Giảm dần</option>
                        <option value="asc">Tăng dần</option>
                    </Select>
                </div>
            </Card>

            {/* Table */}
            <Card>
                {loading ? (
                    <div className="text-center py-12">
                        <LoadingSpinner size="lg" />
                        <p className="mt-4 text-gray-600">Đang tải...</p>
                    </div>
                ) : customers.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Không tìm thấy khách hàng nào</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Khách hàng</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Liên hệ</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Xe/Đơn</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tổng chi</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Trạng thái</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {customers.map((customer) => (
                                        <tr key={customer.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                                        {customer.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{customer.name}</p>
                                                        <p className="text-xs text-gray-500">KH-{customer.id.toString().padStart(5, '0')}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="text-sm text-gray-900">{customer.phone}</p>
                                                {customer.email && <p className="text-xs text-gray-500">{customer.email}</p>}
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="text-sm text-gray-900">{customer.vehicles_count || 0} xe</p>
                                                <p className="text-xs text-gray-500">{customer.orders_count || 0} đơn</p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="font-semibold text-blue-600">{formatCurrency(customer.total_spent || 0)}</p>
                                                {customer.last_visit && (
                                                    <p className="text-xs text-gray-500">Lần cuối: {formatDate(customer.last_visit)}</p>
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                <Badge variant={customer.is_active ? 'success' : 'danger'}>
                                                    {customer.is_active ? 'Hoạt động' : 'Ngừng'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="ghost" onClick={() => handleEdit(customer)}>
                                                        Sửa
                                                    </Button>
                                                    <Button size="sm" variant="ghost" onClick={() => handleDelete(customer)}>
                                                        Xóa
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between px-4 py-3 border-t">
                            <p className="text-sm text-gray-600">
                                Hiển thị {((pagination.current_page - 1) * pagination.per_page) + 1} đến{' '}
                                {Math.min(pagination.current_page * pagination.per_page, pagination.total)} trong tổng số {pagination.total}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page - 1 }))}
                                    disabled={pagination.current_page === 1}
                                >
                                    Trước
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page + 1 }))}
                                    disabled={pagination.current_page === pagination.last_page}
                                >
                                    Sau
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </Card>

            {/* Modal Form */}
            {showModal && (
                <Modal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    title={modalMode === 'create' ? 'Thêm khách hàng mới' : 'Chỉnh sửa khách hàng'}
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tên khách hàng <span className="text-red-500">*</span>
                            </label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                error={errors.name}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Số điện thoại <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    error={errors.phone}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    error={errors.email}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                            <Input
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                            <textarea
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                rows={3}
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={formData.is_active}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                className="mr-2"
                            />
                            <label htmlFor="is_active" className="text-sm text-gray-700">Hoạt động</label>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button variant="outline" onClick={() => setShowModal(false)} disabled={submitting}>
                                Hủy
                            </Button>
                            <Button onClick={handleSubmit} disabled={submitting}>
                                {submitting ? <LoadingSpinner size="sm" /> : (modalMode === 'create' ? 'Thêm' : 'Cập nhật')}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Toast Notification */}
            {toast.show && (
                <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                    {toast.message}
                </div>
            )}
        </div>
    );
}
