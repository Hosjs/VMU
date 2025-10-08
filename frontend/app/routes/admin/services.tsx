import { useState, useEffect } from 'react';
import { Card } from '~/components/ui/Card';
import { Badge } from '~/components/ui/Badge';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { Select } from '~/components/ui/Select';
import { Modal } from '~/components/ui/Modal';
import { LoadingSpinner } from '~/components/LoadingSystem';
import { serviceService } from '~/services/service.service';
import { categoryService } from '~/services/category.service';
import type { Service } from '~/types/service';
import type { Category } from '~/types/product';
import type { TableQueryParams } from '~/types/common';

export default function Services() {
    const [services, setServices] = useState<Service[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
    });

    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        category_id: '',
        unit: 'lần',
        quote_price: '',
        settlement_price: '',
        description: '',
        is_active: true,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
        show: false,
        message: '',
        type: 'success',
    });

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        loadServices();
    }, [search, categoryFilter, statusFilter, sortBy, sortOrder, pagination.current_page]);

    const loadCategories = async () => {
        try {
            const response = await categoryService.getCategories({ page: 1, per_page: 100 });
            setCategories(response.data.filter(cat => cat.type === 'service'));
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const loadServices = async () => {
        setLoading(true);
        try {
            const params: TableQueryParams = {
                page: pagination.current_page,
                per_page: pagination.per_page,
                search,
                sort_by: sortBy,
                sort_direction: sortOrder,
                filters: {
                    ...(categoryFilter && { category_id: categoryFilter }),
                    ...(statusFilter && { is_active: statusFilter }),
                },
            };

            const response = await serviceService.getServices(params);
            setServices(response.data);
            setPagination({
                current_page: response.current_page,
                last_page: response.last_page,
                per_page: response.per_page,
                total: response.total,
            });
        } catch (error: any) {
            showToast(error.message || 'Không thể tải danh sách dịch vụ', 'error');
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
        setSelectedService(null);
        setFormData({
            name: '',
            code: '',
            category_id: '',
            unit: 'lần',
            quote_price: '',
            settlement_price: '',
            description: '',
            is_active: true,
        });
        setErrors({});
        setShowModal(true);
    };

    const handleEdit = (service: Service) => {
        setModalMode('edit');
        setSelectedService(service);
        setFormData({
            name: service.name,
            code: service.code,
            category_id: service.category_id?.toString() || '',
            unit: service.unit || 'lần',
            quote_price: service.quote_price?.toString() || '',
            settlement_price: service.settlement_price?.toString() || '',
            description: service.description || '',
            is_active: service.is_active,
        });
        setErrors({});
        setShowModal(true);
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) newErrors.name = 'Tên dịch vụ là bắt buộc';
        if (!formData.code.trim()) newErrors.code = 'Mã dịch vụ là bắt buộc';
        if (!formData.category_id) newErrors.category_id = 'Danh mục là bắt buộc';
        if (!formData.quote_price || parseFloat(formData.quote_price) <= 0) {
            newErrors.quote_price = 'Giá báo khách hàng phải lớn hơn 0';
        }
        if (!formData.settlement_price || parseFloat(formData.settlement_price) <= 0) {
            newErrors.settlement_price = 'Giá quyết toán phải lớn hơn 0';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const submitData = {
                ...formData,
                category_id: parseInt(formData.category_id),
                quote_price: parseFloat(formData.quote_price),
                settlement_price: parseFloat(formData.settlement_price),
            };

            if (modalMode === 'create') {
                await serviceService.createService(submitData);
                showToast('Thêm dịch vụ thành công', 'success');
            } else if (selectedService) {
                await serviceService.updateService(selectedService.id, submitData);
                showToast('Cập nhật dịch vụ thành công', 'success');
            }
            setShowModal(false);
            loadServices();
        } catch (error: any) {
            showToast(error.message || 'Có lỗi xảy ra', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (service: Service) => {
        if (!confirm(`Bạn có chắc muốn xóa dịch vụ "${service.name}"?`)) return;

        try {
            await serviceService.deleteService(service.id);
            showToast('Xóa dịch vụ thành công', 'success');
            loadServices();
        } catch (error: any) {
            showToast(error.message || 'Không thể xóa dịch vụ', 'error');
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dịch vụ</h1>
                    <p className="text-gray-600 mt-1">Quản lý danh mục dịch vụ</p>
                </div>
                <Button onClick={handleCreate} variant="primary">
                    <span className="mr-2">+</span>
                    Thêm dịch vụ
                </Button>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Input
                        placeholder="Tìm kiếm tên, mã..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                        <option value="">Tất cả danh mục</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </Select>
                    <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="">Tất cả trạng thái</option>
                        <option value="1">Hoạt động</option>
                        <option value="0">Ngừng hoạt động</option>
                    </Select>
                    <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="created_at">Ngày tạo</option>
                        <option value="name">Tên</option>
                        <option value="quote_price">Giá</option>
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
                ) : services.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Không tìm thấy dịch vụ nào</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Dịch vụ</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Danh mục</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Đơn vị</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Giá báo KH</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Giá QT</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Trạng thái</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {services.map((service) => (
                                        <tr key={service.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">{service.name}</p>
                                                    <p className="text-xs text-gray-500">{service.code}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <Badge variant="info">{service.category?.name || 'N/A'}</Badge>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm text-gray-700">{service.unit}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="font-semibold text-blue-600">
                                                    {formatCurrency(service.quote_price || 0)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="font-semibold text-gray-900">
                                                    {formatCurrency(service.settlement_price || 0)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <Badge variant={service.is_active ? 'success' : 'danger'}>
                                                    {service.is_active ? 'Hoạt động' : 'Ngừng'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="ghost" onClick={() => handleEdit(service)}>
                                                        Sửa
                                                    </Button>
                                                    <Button size="sm" variant="ghost" onClick={() => handleDelete(service)}>
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
                    title={modalMode === 'create' ? 'Thêm dịch vụ mới' : 'Chỉnh sửa dịch vụ'}
                >
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tên dịch vụ <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    error={errors.name}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mã dịch vụ <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    error={errors.code}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Danh mục <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    value={formData.category_id}
                                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                >
                                    <option value="">Chọn danh mục</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </Select>
                                {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị</label>
                                <Input
                                    value={formData.unit}
                                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Giá báo khách hàng <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="number"
                                    value={formData.quote_price}
                                    onChange={(e) => setFormData({ ...formData, quote_price: e.target.value })}
                                    error={errors.quote_price}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Giá quyết toán <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="number"
                                    value={formData.settlement_price}
                                    onChange={(e) => setFormData({ ...formData, settlement_price: e.target.value })}
                                    error={errors.settlement_price}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                            <textarea
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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

            {/* Toast */}
            {toast.show && (
                <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white z-50`}>
                    {toast.message}
                </div>
            )}
        </div>
    );
}
