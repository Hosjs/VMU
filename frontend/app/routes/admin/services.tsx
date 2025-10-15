import { useState, useEffect, useCallback, useRef } from 'react';
import type { Route } from './+types/services';
import { Card } from '~/components/ui/Card';
import { Badge } from '~/components/ui/Badge';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { Select } from '~/components/ui/Select';
import { Modal } from '~/components/ui/Modal';
import { Table } from '~/components/ui/Table';
import { Pagination } from '~/components/ui/Pagination';
import { Toast } from '~/components/ui/Toast';
import { serviceService } from '~/services/service.service';
import { categoryService } from '~/services/category.service';
import { useTable } from '~/hooks/useTable';
import { useModal } from '~/hooks/useModal';
import { useForm } from '~/hooks/useForm';
import type { Service } from '~/types/service';
import type { Category } from '~/types/product';
import { formatters } from '~/utils/formatters';
import { validators } from '~/utils/validators';

// Export loader function for React Router v7
export async function loader({ request }: Route.LoaderArgs) {
  return null;
}

export default function Services() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // ✅ Sử dụng useRef để tránh gọi API 2 lần
    const isInitializedRef = useRef(false);

    const createModal = useModal();
    const editModal = useModal();
    const deleteModal = useModal();

    // Memoize fetchData to prevent infinite loop
    const fetchServices = useCallback(async (params: any) => {
        return await serviceService.getServices(params);
    }, []);

    // Use the reusable useTable hook
    const {
        data: services,
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
    } = useTable<Service>({
        fetchData: fetchServices,
        initialPerPage: 15,
        initialSortBy: 'created_at',
        initialSortDirection: 'desc',
    });

    useEffect(() => {
        // ✅ Check ref để tránh gọi lặp trong React Strict Mode
        if (isInitializedRef.current) {
            console.log('⚠️ Skipping duplicate initialization call (services)');
            return;
        }

        isInitializedRef.current = true;
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const response = await categoryService.getCategories({ type: 'service', is_active: true });
            setCategories(response || []);
        } catch (error) {
            console.error('Error loading categories:', error);
            setCategories([]);
            isInitializedRef.current = false; // ✅ Reset để có thể retry
        }
    };

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    const handleCreate = () => {
        setSelectedService(null);
        createModal.open();
    };

    const handleEdit = (service: Service) => {
        setSelectedService(service);
        editModal.open();
    };

    const handleDeleteClick = (service: Service) => {
        setSelectedService(service);
        deleteModal.open();
    };

    const handleDeleteConfirm = async () => {
        if (!selectedService) return;

        try {
            await serviceService.deleteService(selectedService.id);
            showToast('success', 'Xóa dịch vụ thành công');
            deleteModal.close();
            refresh();
        } catch (error: any) {
            showToast('error', error.message || 'Không thể xóa dịch vụ');
        }
    };

    const columns = [
        {
            key: 'code',
            label: 'Mã',
            sortable: true,
            width: '100px',
        },
        {
            key: 'name',
            label: 'Tên dịch vụ',
            sortable: true,
            render: (service: Service) => (
                <div>
                    <p className="font-medium text-gray-900">{service.name}</p>
                    {service.description && (
                        <p className="text-xs text-gray-500">{service.description}</p>
                    )}
                </div>
            ),
        },
        {
            key: 'category',
            label: 'Danh mục',
            render: (service: Service) => (
                <Badge variant="info">{service.category?.name || 'N/A'}</Badge>
            ),
        },
        {
            key: 'unit',
            label: 'Đơn vị',
            render: (service: Service) => (
                <span className="text-sm text-gray-700">{service.unit}</span>
            ),
        },
        {
            key: 'quote_price',
            label: 'Giá báo KH',
            sortable: true,
            render: (service: Service) => (
                <span className="font-semibold text-blue-600">
                    {formatters.currency(service.quote_price || 0)}
                </span>
            ),
        },
        {
            key: 'settlement_price',
            label: 'Giá QT',
            render: (service: Service) => (
                <span className="font-semibold text-gray-900">
                    {formatters.currency(service.settlement_price || 0)}
                </span>
            ),
        },
        {
            key: 'is_active',
            label: 'Trạng thái',
            render: (service: Service) => (
                <Badge variant={service.is_active ? 'success' : 'danger'}>
                    {service.is_active ? 'Hoạt động' : 'Ngừng'}
                </Badge>
            ),
        },
        {
            key: 'actions',
            label: 'Thao tác',
            render: (service: Service) => (
                <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(service)}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteClick(service)}>
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
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dịch vụ</h1>
                <p className="text-gray-600 mt-2">Quản lý danh mục dịch vụ</p>
            </div>

            <Card>
                <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        <Input
                            placeholder="Tìm kiếm tên, mã..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full md:w-96"
                        />
                        <Select
                            value={filters.category_id || ''}
                            onChange={(e) => handleFilter('category_id', e.target.value || undefined)}
                            className="w-full md:w-48"
                        >
                            <option value="">Tất cả danh mục</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </Select>
                        <Select
                            value={filters.is_active || ''}
                            onChange={(e) => handleFilter('is_active', e.target.value || undefined)}
                            className="w-full md:w-48"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="1">Hoạt động</option>
                            <option value="0">Ngừng hoạt động</option>
                        </Select>
                    </div>
                    <Button variant="primary" onClick={handleCreate}>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Thêm dịch vụ
                    </Button>
                </div>

                <Table
                    columns={columns}
                    data={services}
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

            {/* Create Modal */}
            <ServiceFormModal
                isOpen={createModal.isOpen}
                onClose={createModal.close}
                onSuccess={() => {
                    createModal.close();
                    refresh();
                    showToast('success', 'Thêm dịch vụ thành công');
                }}
                categories={categories}
            />

            {/* Edit Modal */}
            <ServiceFormModal
                isOpen={editModal.isOpen}
                onClose={editModal.close}
                service={selectedService}
                onSuccess={() => {
                    editModal.close();
                    refresh();
                    showToast('success', 'Cập nhật dịch vụ thành công');
                }}
                categories={categories}
            />

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModal.isOpen}
                onClose={deleteModal.close}
                title="Xác nhận xóa"
                size="sm"
            >
                <div className="p-6">
                    <p className="text-gray-600 mb-6">
                        Bạn có chắc chắn muốn xóa dịch vụ <strong>{selectedService?.name}</strong>?
                    </p>
                    <div className="flex items-center justify-end gap-3">
                        <Button variant="ghost" onClick={deleteModal.close}>
                            Hủy
                        </Button>
                        <Button variant="danger" onClick={handleDeleteConfirm}>
                            Xóa
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Toast Notification */}
            {toast && (
                <Toast
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}

// Service Form Modal Component
interface ServiceFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    service?: Service | null;
    categories: Category[];
}

interface ServiceFormData {
    name: string;
    code: string;
    category_id: number | string;
    unit: string;
    quote_price: string | number;
    settlement_price: string | number;
    description: string;
    is_active: boolean;
}

function ServiceFormModal({
    isOpen,
    onClose,
    onSuccess,
    service,
    categories,
}: ServiceFormModalProps) {
    const isEdit = !!service;

    const initialValues: ServiceFormData = {
        name: service?.name || '',
        code: service?.code || '',
        category_id: service?.category_id || '',
        unit: service?.unit || 'lần',
        quote_price: service?.quote_price || '',
        settlement_price: service?.settlement_price || '',
        description: service?.description || '',
        is_active: service?.is_active !== false,
    };

    const validateForm = (values: ServiceFormData): Record<string, string> => {
        const errors: Record<string, string> = {};

        if (!values.name?.trim()) errors.name = 'Tên dịch vụ là bắt buộc';
        if (!values.code?.trim()) errors.code = 'Mã dịch vụ là bắt buộc';
        if (!values.category_id) errors.category_id = 'Danh mục là bắt buộc';
        if (!values.quote_price || Number(values.quote_price) <= 0) {
            errors.quote_price = 'Giá báo khách hàng phải lớn hơn 0';
        }
        if (!values.settlement_price || Number(values.settlement_price) <= 0) {
            errors.settlement_price = 'Giá quyết toán phải lớn hơn 0';
        }

        return errors;
    };

    const {
        values,
        errors,
        touched,
        isSubmitting,
        handleChange,
        handleBlur,
        handleSubmit,
        reset,
    } = useForm<ServiceFormData>({
        initialValues,
        validate: validateForm,
        onSubmit: async (values) => {
            try {
                const submitData = {
                    ...values,
                    category_id: Number(values.category_id),
                    quote_price: Number(values.quote_price),
                    settlement_price: Number(values.settlement_price),
                };

                if (isEdit && service) {
                    await serviceService.updateService(service.id, submitData);
                } else {
                    await serviceService.createService(submitData);
                }
                reset();
                onSuccess();
            } catch (error: any) {
                throw new Error(error?.message || 'Có lỗi xảy ra');
            }
        },
    });

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={isEdit ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}
            size="lg"
        >
            <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Tên dịch vụ *"
                            name="name"
                            value={values.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            onBlur={() => handleBlur('name')}
                            error={touched.name ? errors.name : undefined}
                        />
                        <Input
                            label="Mã dịch vụ *"
                            name="code"
                            value={values.code}
                            onChange={(e) => handleChange('code', e.target.value)}
                            onBlur={() => handleBlur('code')}
                            error={touched.code ? errors.code : undefined}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label="Danh mục *"
                            name="category_id"
                            value={values.category_id}
                            onChange={(e) => handleChange('category_id', e.target.value)}
                            error={touched.category_id ? errors.category_id : undefined}
                        >
                            <option value="">Chọn danh mục</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </Select>
                        <Input
                            label="Đơn vị"
                            name="unit"
                            value={values.unit}
                            onChange={(e) => handleChange('unit', e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Giá báo khách hàng *"
                            type="number"
                            name="quote_price"
                            value={values.quote_price}
                            onChange={(e) => handleChange('quote_price', e.target.value)}
                            onBlur={() => handleBlur('quote_price')}
                            error={touched.quote_price ? errors.quote_price : undefined}
                        />
                        <Input
                            label="Giá quyết toán *"
                            type="number"
                            name="settlement_price"
                            value={values.settlement_price}
                            onChange={(e) => handleChange('settlement_price', e.target.value)}
                            onBlur={() => handleBlur('settlement_price')}
                            error={touched.settlement_price ? errors.settlement_price : undefined}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                        <textarea
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            value={values.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                        />
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={values.is_active}
                            onChange={(e) => handleChange('is_active', e.target.checked)}
                            className="mr-2"
                        />
                        <label htmlFor="is_active" className="text-sm text-gray-700">Hoạt động</label>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t">
                    <Button type="button" variant="ghost" onClick={handleClose} disabled={isSubmitting}>
                        Hủy
                    </Button>
                    <Button type="submit" variant="primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Đang xử lý...' : (isEdit ? 'Cập nhật' : 'Thêm mới')}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
