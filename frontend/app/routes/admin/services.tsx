import { useState, useCallback } from 'react';
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
import { useTable } from '~/hooks/useTable';
import { useModal } from '~/hooks/useModal';
import { useForm } from '~/hooks/useForm';
import type { Service } from '~/types/service';

export async function loader({ request }: Route.LoaderArgs) {
  return null;
}

export default function Services() {
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const createModal = useModal();
    const editModal = useModal();
    const deleteModal = useModal();

    const fetchServices = useCallback(async (params: any) => {
        return await serviceService.getServices(params);
    }, []);

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
        initialSortBy: 'name',
        initialSortDirection: 'asc',
    });

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
            width: '120px',
        },
        {
            key: 'name',
            label: 'Tên dịch vụ',
            sortable: true,
            render: (service: Service) => (
                <div>
                    <p className="font-medium text-gray-900">{service.name}</p>
                    {service.description && (
                        <p className="text-xs text-gray-500 line-clamp-2">{service.description}</p>
                    )}
                </div>
            ),
        },
        {
            key: 'unit',
            label: 'Đơn vị',
            width: '100px',
            render: (service: Service) => (
                <span className="text-sm text-gray-700">{service.unit}</span>
            ),
        },
        {
            key: 'estimated_time',
            label: 'Thời gian ƯT',
            width: '120px',
            render: (service: Service) => (
                <span className="text-sm text-gray-600">{service.estimated_time} phút</span>
            ),
        },
        {
            key: 'has_warranty',
            label: 'Bảo hành',
            width: '100px',
            render: (service: Service) => (
                <Badge variant={service.has_warranty ? 'success' : 'secondary'}>
                    {service.has_warranty ? `${service.warranty_months} tháng` : 'Không'}
                </Badge>
            ),
        },
        {
            key: 'is_active',
            label: 'Trạng thái',
            width: '120px',
            render: (service: Service) => (
                <Badge variant={service.is_active ? 'success' : 'danger'}>
                    {service.is_active ? 'Hoạt động' : 'Ngừng'}
                </Badge>
            ),
        },
        {
            key: 'actions',
            label: 'Thao tác',
            width: '100px',
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
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">6 Dịch vụ chính</h1>
                <p className="text-gray-600 mt-2">Quản lý các dịch vụ độc lập (không thuộc danh mục)</p>
            </div>

            <Card>
                <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        <Input
                            placeholder="Tìm kiếm tên, mã, mô tả..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full md:w-96"
                        />
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

            <ServiceFormModal
                isOpen={createModal.isOpen}
                onClose={createModal.close}
                onSuccess={() => {
                    createModal.close();
                    refresh();
                    showToast('success', 'Thêm dịch vụ thành công');
                }}
            />

            <ServiceFormModal
                isOpen={editModal.isOpen}
                onClose={editModal.close}
                service={selectedService}
                onSuccess={() => {
                    editModal.close();
                    refresh();
                    showToast('success', 'Cập nhật dịch vụ thành công');
                }}
            />

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
                        <Button variant="ghost" onClick={deleteModal.close}>Hủy</Button>
                        <Button variant="danger" onClick={handleDeleteConfirm}>Xóa</Button>
                    </div>
                </div>
            </Modal>

            {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
        </div>
    );
}

interface ServiceFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    service?: Service | null;
}

interface ServiceFormData {
    name: string;
    code: string;
    description: string;
    unit: string;
    estimated_time: number | string;
    has_warranty: boolean;
    warranty_months: number | string;
    notes: string;
    is_active: boolean;
}

function ServiceFormModal({ isOpen, onClose, onSuccess, service }: ServiceFormModalProps) {
    const isEdit = !!service;

    const initialValues: ServiceFormData = {
        name: service?.name || '',
        code: service?.code || '',
        description: service?.description || '',
        unit: service?.unit || 'lần',
        estimated_time: service?.estimated_time || 60,
        has_warranty: service?.has_warranty || false,
        warranty_months: service?.warranty_months || 0,
        notes: service?.notes || '',
        is_active: service?.is_active !== false,
    };

    const validateForm = (values: ServiceFormData): Record<string, string> => {
        const errors: Record<string, string> = {};
        if (!values.name?.trim()) errors.name = 'Tên dịch vụ là bắt buộc';
        if (!values.code?.trim()) errors.code = 'Mã dịch vụ là bắt buộc';
        if (values.estimated_time && Number(values.estimated_time) <= 0) {
            errors.estimated_time = 'Thời gian ước tính phải lớn hơn 0';
        }
        if (values.has_warranty && (!values.warranty_months || Number(values.warranty_months) <= 0)) {
            errors.warranty_months = 'Số tháng bảo hành phải lớn hơn 0 khi có bảo hành';
        }
        return errors;
    };

    const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit, reset } = useForm<ServiceFormData>({
        initialValues,
        validate: validateForm,
        onSubmit: async (values) => {
            try {
                const submitData = {
                    name: values.name,
                    code: values.code,
                    description: values.description,
                    unit: values.unit,
                    estimated_time: Number(values.estimated_time),
                    has_warranty: values.has_warranty,
                    warranty_months: Number(values.warranty_months),
                    notes: values.notes,
                    is_active: values.is_active,
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
        <Modal isOpen={isOpen} onClose={handleClose} title={isEdit ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'} size="lg">
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
                            placeholder="VD: Bảo dưỡng định kỳ"
                        />
                        <Input
                            label="Mã dịch vụ *"
                            name="code"
                            value={values.code}
                            onChange={(e) => handleChange('code', e.target.value)}
                            onBlur={() => handleBlur('code')}
                            error={touched.code ? errors.code : undefined}
                            placeholder="VD: MAINTENANCE"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Đơn vị"
                            name="unit"
                            value={values.unit}
                            onChange={(e) => handleChange('unit', e.target.value)}
                            placeholder="VD: lần, giờ"
                        />
                        <Input
                            label="Thời gian ước tính (phút)"
                            type="number"
                            name="estimated_time"
                            value={values.estimated_time}
                            onChange={(e) => handleChange('estimated_time', e.target.value)}
                            onBlur={() => handleBlur('estimated_time')}
                            error={touched.estimated_time ? errors.estimated_time : undefined}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                        <textarea
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            value={values.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder="Mô tả chi tiết về dịch vụ"
                        />
                    </div>

                    <div className="border-t pt-4">
                        <div className="flex items-center mb-4">
                            <input
                                type="checkbox"
                                id="has_warranty"
                                checked={values.has_warranty}
                                onChange={(e) => handleChange('has_warranty', e.target.checked)}
                                className="mr-2 h-4 w-4"
                            />
                            <label htmlFor="has_warranty" className="text-sm font-medium text-gray-700">
                                Có bảo hành
                            </label>
                        </div>

                        {values.has_warranty && (
                            <Input
                                label="Số tháng bảo hành *"
                                type="number"
                                name="warranty_months"
                                value={values.warranty_months}
                                onChange={(e) => handleChange('warranty_months', e.target.value)}
                                onBlur={() => handleBlur('warranty_months')}
                                error={touched.warranty_months ? errors.warranty_months : undefined}
                            />
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
                        <textarea
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            rows={2}
                            value={values.notes}
                            onChange={(e) => handleChange('notes', e.target.value)}
                            placeholder="Ghi chú thêm về dịch vụ"
                        />
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={values.is_active}
                            onChange={(e) => handleChange('is_active', e.target.checked)}
                            className="mr-2 h-4 w-4"
                        />
                        <label htmlFor="is_active" className="text-sm text-gray-700">Kích hoạt dịch vụ</label>
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

