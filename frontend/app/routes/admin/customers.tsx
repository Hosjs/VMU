import { useState, useCallback } from 'react';
import { Card } from '~/components/ui/Card';
import { Badge } from '~/components/ui/Badge';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { Select } from '~/components/ui/Select';
import { Modal } from '~/components/ui/Modal';
import { Table } from '~/components/ui/Table';
import { Pagination } from '~/components/ui/Pagination';
import { Toast } from '~/components/ui/Toast';
import { customerService } from '~/services/customer.service';
import { useTable } from '~/hooks/useTable';
import { useModal } from '~/hooks/useModal';
import { useForm } from '~/hooks/useForm';
import type { Customer } from '~/types/customer';
import { formatters } from '~/utils/formatters';
import { validators } from '~/utils/validators';

export default function Customers() {
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const createModal = useModal();
    const editModal = useModal();
    const deleteModal = useModal();

    const fetchCustomers = useCallback(async (params: any) => {
        return await customerService.getCustomers(params);
    }, []);

    const {
        data: customers,
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
    } = useTable<Customer>({
        fetchData: fetchCustomers,
        initialPerPage: 15,
        initialSortBy: 'created_at',
        initialSortDirection: 'desc',
    });

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    const handleCreate = () => {
        setSelectedCustomer(null);
        createModal.open();
    };

    const handleEdit = (customer: Customer) => {
        setSelectedCustomer(customer);
        editModal.open();
    };

    const handleDeleteClick = (customer: Customer) => {
        setSelectedCustomer(customer);
        deleteModal.open();
    };

    const handleDeleteConfirm = async () => {
        if (!selectedCustomer) return;

        try {
            await customerService.deleteCustomer(selectedCustomer.id);
            showToast('success', 'Xóa khách hàng thành công');
            deleteModal.close();
            refresh();
        } catch (error: any) {
            showToast('error', error.message || 'Không thể xóa khách hàng');
        }
    };

    const columns = [
        {
            key: 'name',
            label: 'Thông tin',
            sortable: true,
            render: (customer: Customer) => (
                <div>
                    <p className="font-medium text-gray-900">{customer.name}</p>
                    <p className="text-sm text-gray-600">{formatters.phone(customer.phone)}</p>
                    {customer.email && (
                        <p className="text-xs text-gray-500">{customer.email}</p>
                    )}
                </div>
            ),
        },
        {
            key: 'address',
            label: 'Địa chỉ',
            render: (customer: Customer) => (
                <span className="text-sm text-gray-700">{customer.address || '-'}</span>
            ),
        },
        {
            key: 'is_active',
            label: 'Trạng thái',
            render: (customer: Customer) => (
                <Badge variant={customer.is_active ? 'success' : 'danger'}>
                    {customer.is_active ? 'Hoạt động' : 'Ngừng'}
                </Badge>
            ),
        },
        {
            key: 'created_at',
            label: 'Ngày tạo',
            sortable: true,
            render: (customer: Customer) => formatters.date(customer.created_at),
        },
        {
            key: 'actions',
            label: 'Thao tác',
            render: (customer: Customer) => (
                <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(customer)}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteClick(customer)}>
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
                <h1 className="text-3xl font-bold text-gray-900">Khách hàng</h1>
                <p className="text-gray-600 mt-2">Quản lý danh sách khách hàng</p>
            </div>

            <Card>
                <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        <Input
                            placeholder="Tìm kiếm tên, số điện thoại..."
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
                        Thêm khách hàng
                    </Button>
                </div>

                <Table
                    columns={columns}
                    data={customers}
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

            <CustomerFormModal
                isOpen={createModal.isOpen}
                onClose={createModal.close}
                onSuccess={() => {
                    createModal.close();
                    refresh();
                    showToast('success', 'Thêm khách hàng thành công');
                }}
            />

            <CustomerFormModal
                isOpen={editModal.isOpen}
                onClose={editModal.close}
                customer={selectedCustomer}
                onSuccess={() => {
                    editModal.close();
                    refresh();
                    showToast('success', 'Cập nhật khách hàng thành công');
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
                        Bạn có chắc chắn muốn xóa khách hàng <strong>{selectedCustomer?.name}</strong>?
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

interface CustomerFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    customer?: Customer | null;
}

interface CustomerFormData {
    name: string;
    phone: string;
    email: string;
    address: string;
    notes: string;
    is_active: boolean;
}

function CustomerFormModal({ isOpen, onClose, onSuccess, customer }: CustomerFormModalProps) {
    const isEdit = !!customer;

    const initialValues: CustomerFormData = {
        name: customer?.name || '',
        phone: customer?.phone || '',
        email: customer?.email || '',
        address: customer?.address || '',
        notes: customer?.notes || '',
        is_active: customer?.is_active !== false,
    };

    const validateForm = (values: CustomerFormData): Record<string, string> => {
        const errors: Record<string, string> = {};
        if (!values.name?.trim()) errors.name = 'Tên khách hàng là bắt buộc';
        if (!values.phone?.trim()) errors.phone = 'Số điện thoại là bắt buộc';
        else if (validators.phone(values.phone)) errors.phone = validators.phone(values.phone)!;
        if (values.email && validators.email(values.email)) errors.email = validators.email(values.email)!;
        return errors;
    };

    const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit, reset } = useForm<CustomerFormData>({
        initialValues,
        validate: validateForm,
        onSubmit: async (values) => {
            try {
                if (isEdit && customer) {
                    await customerService.updateCustomer(customer.id, values);
                } else {
                    await customerService.createCustomer(values);
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
        <Modal isOpen={isOpen} onClose={handleClose} title={isEdit ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'} size="lg">
            <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Tên khách hàng *" name="name" value={values.name} onChange={(e) => handleChange('name', e.target.value)} onBlur={() => handleBlur('name')} error={touched.name ? errors.name : undefined} />
                        <Input label="Số điện thoại *" name="phone" value={values.phone} onChange={(e) => handleChange('phone', e.target.value)} onBlur={() => handleBlur('phone')} error={touched.phone ? errors.phone : undefined} />
                    </div>
                    <Input label="Email" type="email" name="email" value={values.email} onChange={(e) => handleChange('email', e.target.value)} onBlur={() => handleBlur('email')} error={touched.email ? errors.email : undefined} />
                    <Input label="Địa chỉ" name="address" value={values.address} onChange={(e) => handleChange('address', e.target.value)} />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
                        <textarea className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" rows={3} value={values.notes} onChange={(e) => handleChange('notes', e.target.value)} />
                    </div>
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
