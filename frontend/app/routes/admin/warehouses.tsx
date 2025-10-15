import { useState, useCallback } from 'react';
import type { Route } from './+types/warehouses';
import { Card } from '~/components/ui/Card';
import { Badge } from '~/components/ui/Badge';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { Select } from '~/components/ui/Select';
import { Modal } from '~/components/ui/Modal';
import { Table } from '~/components/ui/Table';
import { Pagination } from '~/components/ui/Pagination';
import { Toast } from '~/components/ui/Toast';
import { warehouseService } from '~/services/warehouse.service';
import { useTable } from '~/hooks/useTable';
import { useModal } from '~/hooks/useModal';
import { useForm } from '~/hooks/useForm';
import type { Warehouse } from '~/types/warehouse';
import { formatters } from '~/utils/formatters';
import { validators } from '~/utils/validators';

interface WarehouseFormData {
    code: string;
    name: string;
    type: 'main' | 'partner';
    address: string;
    district: string;
    province: string;
    contact_person?: string;
    phone?: string;
    email?: string;
    is_active: boolean;
}

// Export loader function for React Router v7
export async function loader({ request }: Route.LoaderArgs) {
  return null;
}

export default function Warehouses() {
    const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const createModal = useModal();
    const editModal = useModal();
    const deleteModal = useModal();

    const fetchWarehouses = useCallback(async (params: any) => {
        return await warehouseService.getAll(params);
    }, []);

    const {
        data: warehouses,
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
    } = useTable<Warehouse>({
        fetchData: fetchWarehouses,
        initialPerPage: 15,
        initialSortBy: 'created_at',
        initialSortDirection: 'desc',
    });

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    const handleCreate = () => {
        setSelectedWarehouse(null);
        createModal.open();
    };

    const handleEdit = (warehouse: Warehouse) => {
        setSelectedWarehouse(warehouse);
        editModal.open();
    };

    const handleDeleteClick = (warehouse: Warehouse) => {
        setSelectedWarehouse(warehouse);
        deleteModal.open();
    };

    const handleDeleteConfirm = async () => {
        if (!selectedWarehouse) return;

        try {
            await warehouseService.delete(selectedWarehouse.id);
            showToast('success', 'Xóa kho hàng thành công');
            deleteModal.close();
            refresh();
        } catch (error: any) {
            showToast('error', error.message || 'Không thể xóa kho hàng');
        }
    };

    const getTypeText = (type: string) => {
        return type === 'main' ? 'Kho chính' : 'Kho liên kết';
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
            label: 'Tên kho',
            sortable: true,
            render: (warehouse: Warehouse) => (
                <div>
                    <p className="font-medium text-gray-900">{warehouse.name}</p>
                    <p className="text-sm text-gray-600">{warehouse.code}</p>
                </div>
            ),
        },
        {
            key: 'type',
            label: 'Loại',
            render: (warehouse: Warehouse) => (
                <Badge variant={warehouse.type === 'main' ? 'success' : 'info'}>
                    {getTypeText(warehouse.type)}
                </Badge>
            ),
        },
        {
            key: 'location',
            label: 'Địa điểm',
            render: (warehouse: Warehouse) => (
                <div>
                    <p className="text-sm text-gray-900">{warehouse.address}</p>
                    <p className="text-xs text-gray-600">{warehouse.district}, {warehouse.province}</p>
                </div>
            ),
        },
        {
            key: 'contact_person',
            label: 'Người liên hệ',
            render: (warehouse: Warehouse) => (
                <div>
                    <p className="text-sm text-gray-900">{warehouse.contact_person || '-'}</p>
                    {warehouse.phone && (
                        <p className="text-xs text-gray-600">{formatters.phone(warehouse.phone)}</p>
                    )}
                </div>
            ),
        },
        {
            key: 'is_active',
            label: 'Trạng thái',
            render: (warehouse: Warehouse) => (
                <Badge variant={warehouse.is_active ? 'success' : 'danger'}>
                    {warehouse.is_active ? 'Hoạt động' : 'Ngừng'}
                </Badge>
            ),
        },
        {
            key: 'created_at',
            label: 'Ngày tạo',
            sortable: true,
            render: (warehouse: Warehouse) => formatters.date(warehouse.created_at),
        },
        {
            key: 'actions',
            label: 'Thao tác',
            render: (warehouse: Warehouse) => (
                <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(warehouse)}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteClick(warehouse)}>
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
                <h1 className="text-3xl font-bold text-gray-900">Quản lý kho hàng</h1>
                <p className="text-gray-600 mt-2">Quản lý các kho hàng và vị trí lưu trữ</p>
            </div>

            <Card>
                <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        <Input
                            placeholder="Tìm kiếm tên, mã kho..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full md:w-96"
                        />
                        <Select
                            value={filters.type || ''}
                            onChange={(e) => handleFilter('type', e.target.value || undefined)}
                            className="w-full md:w-48"
                        >
                            <option value="">Tất cả loại</option>
                            <option value="main">Kho chính</option>
                            <option value="partner">Kho liên kết</option>
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
                        Thêm kho hàng
                    </Button>
                </div>

                <Table
                    columns={columns}
                    data={warehouses}
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

            <WarehouseFormModal
                isOpen={createModal.isOpen}
                onClose={createModal.close}
                onSuccess={() => {
                    createModal.close();
                    refresh();
                    showToast('success', 'Thêm kho hàng thành công');
                }}
            />

            <WarehouseFormModal
                isOpen={editModal.isOpen}
                onClose={editModal.close}
                warehouse={selectedWarehouse}
                onSuccess={() => {
                    editModal.close();
                    refresh();
                    showToast('success', 'Cập nhật kho hàng thành công');
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
                        Bạn có chắc chắn muốn xóa kho hàng <strong>{selectedWarehouse?.name}</strong>?
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

interface WarehouseFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    warehouse?: Warehouse | null;
}

function WarehouseFormModal({ isOpen, onClose, onSuccess, warehouse }: WarehouseFormModalProps) {
    const isEdit = !!warehouse;

    const initialValues: WarehouseFormData = {
        code: warehouse?.code || '',
        name: warehouse?.name || '',
        type: warehouse?.type || 'partner',
        address: warehouse?.address || '',
        district: warehouse?.district || '',
        province: warehouse?.province || '',
        contact_person: warehouse?.contact_person || '',
        phone: warehouse?.phone || '',
        email: warehouse?.email || '',
        is_active: warehouse?.is_active !== false,
    };

    const validateForm = (values: WarehouseFormData): Record<string, string> => {
        const errors: Record<string, string> = {};
        if (!values.code?.trim()) errors.code = 'Mã kho là bắt buộc';
        if (!values.name?.trim()) errors.name = 'Tên kho là bắt buộc';
        if (!values.address?.trim()) errors.address = 'Địa chỉ là bắt buộc';
        if (!values.district?.trim()) errors.district = 'Quận/huyện là bắt buộc';
        if (!values.province?.trim()) errors.province = 'Tỉnh/thành là bắt buộc';
        if (values.phone && validators.phone(values.phone)) errors.phone = validators.phone(values.phone)!;
        if (values.email && validators.email(values.email)) errors.email = validators.email(values.email)!;
        return errors;
    };

    const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit, reset } = useForm<WarehouseFormData>({
        initialValues,
        validate: validateForm,
        onSubmit: async (values) => {
            try {
                if (isEdit && warehouse) {
                    await warehouseService.update(warehouse.id, values);
                } else {
                    await warehouseService.create(values);
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
        <Modal isOpen={isOpen} onClose={handleClose} title={isEdit ? 'Chỉnh sửa kho hàng' : 'Thêm kho hàng mới'} size="lg">
            <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Mã kho *" name="code" value={values.code} onChange={(e) => handleChange('code', e.target.value)} onBlur={() => handleBlur('code')} error={touched.code ? errors.code : undefined} />
                        <Input label="Tên kho *" name="name" value={values.name} onChange={(e) => handleChange('name', e.target.value)} onBlur={() => handleBlur('name')} error={touched.name ? errors.name : undefined} />
                    </div>
                    <Select label="Loại kho *" name="type" value={values.type} onChange={(e) => handleChange('type', e.target.value as 'main' | 'partner')}>
                        <option value="main">Kho chính</option>
                        <option value="partner">Kho liên kết</option>
                    </Select>
                    <Input label="Địa chỉ *" name="address" value={values.address} onChange={(e) => handleChange('address', e.target.value)} onBlur={() => handleBlur('address')} error={touched.address ? errors.address : undefined} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Quận/Huyện *" name="district" value={values.district} onChange={(e) => handleChange('district', e.target.value)} onBlur={() => handleBlur('district')} error={touched.district ? errors.district : undefined} />
                        <Input label="Tỉnh/Thành *" name="province" value={values.province} onChange={(e) => handleChange('province', e.target.value)} onBlur={() => handleBlur('province')} error={touched.province ? errors.province : undefined} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Người liên hệ" name="contact_person" value={values.contact_person} onChange={(e) => handleChange('contact_person', e.target.value)} />
                        <Input label="Số điện thoại" name="phone" value={values.phone} onChange={(e) => handleChange('phone', e.target.value)} onBlur={() => handleBlur('phone')} error={touched.phone ? errors.phone : undefined} />
                    </div>
                    <Input label="Email" type="email" name="email" value={values.email} onChange={(e) => handleChange('email', e.target.value)} onBlur={() => handleBlur('email')} error={touched.email ? errors.email : undefined} />
                    <div className="flex items-center">
                        <input type="checkbox" id="is_active" checked={values.is_active} onChange={(e) => handleChange('is_active', e.target.checked)} className="mr-2" />
                        <label htmlFor="is_active" className="text-sm text-gray-700">Hoạt động</label>
                    </div>
                </div>
                <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t">
                    <Button type="button" variant="ghost" onClick={handleClose} disabled={isSubmitting}>Hủy</Button>
                    <Button type="submit" variant="primary" disabled={isSubmitting}>{isSubmitting ? 'Đang xử lý...' : (isEdit ? 'Cập nhật' : 'Thêm mới')}</Button>
                </div>
            </form>
        </Modal>
    );
}
