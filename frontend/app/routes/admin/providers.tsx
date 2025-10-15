import { useState, useCallback, useEffect, useRef } from 'react';
import { Card } from '~/components/ui/Card';
import { Badge } from '~/components/ui/Badge';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { Select } from '~/components/ui/Select';
import { Modal } from '~/components/ui/Modal';
import { Table } from '~/components/ui/Table';
import { Pagination } from '~/components/ui/Pagination';
import { Toast } from '~/components/ui/Toast';
import { providerService, type Provider, type ProviderFormData } from '~/services/provider.service';
import { useTable } from '~/hooks/useTable';
import { useModal } from '~/hooks/useModal';
import { useForm } from '~/hooks/useForm';
import { formatters } from '~/utils/formatters';
import { validators } from '~/utils/validators';
import type { Route } from './+types/providers';

// Export loader function for React Router v7
export async function loader({ request }: Route.LoaderArgs) {
  return null;
}

export default function Providers() {
    const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // ✅ Sử dụng useRef để tránh gọi API 2 lần
    const isInitializedRef = useRef(false);

    const createModal = useModal();
    const editModal = useModal();
    const deleteModal = useModal();

    const fetchProviders = useCallback(async (params: any) => {
        return await providerService.getProviders(params);
    }, []);

    const {
        data: providers,
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
    } = useTable<Provider>({
        fetchData: fetchProviders,
        initialPerPage: 15,
        initialSortBy: 'created_at',
        initialSortDirection: 'desc',
    });

    // ❌ KHÔNG CẦN gọi refresh() ở đây vì useTable đã tự động fetch data khi mount
    // useEffect(() => {
    //     refresh();
    // }, []);

    // ✅ Nếu cần load thêm data khác, làm như sau:
    useEffect(() => {
        if (isInitializedRef.current) {
            console.log('⚠️ Skipping duplicate initialization call (providers)');
            return;
        }

        isInitializedRef.current = true;
        // Load additional data here if needed
        // useTable sẽ tự động fetch providers data
    }, []);

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    const handleCreate = () => {
        setSelectedProvider(null);
        createModal.open();
    };

    const handleEdit = (provider: Provider) => {
        setSelectedProvider(provider);
        editModal.open();
    };

    const handleDeleteClick = (provider: Provider) => {
        setSelectedProvider(provider);
        deleteModal.open();
    };

    const handleDeleteConfirm = async () => {
        if (!selectedProvider) return;

        try {
            await providerService.deleteProvider(selectedProvider.id);
            showToast('success', 'Xóa đối tác thành công');
            deleteModal.close();
            refresh();
        } catch (error: any) {
            showToast('error', error.message || 'Không thể xóa đối tác');
        }
    };

    const getStatusText = (status: string) => {
        const map: Record<string, string> = {
            active: 'Hoạt động',
            inactive: 'Không hoạt động',
            suspended: 'Tạm dừng',
            blacklisted: 'Danh sách đen',
        };
        return map[status] || status;
    };

    const getStatusVariant = (status: string) => {
        const map: Record<string, 'success' | 'danger' | 'warning'> = {
            active: 'success',
            inactive: 'danger',
            suspended: 'warning',
            blacklisted: 'danger',
        };
        return map[status] || 'secondary';
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
            label: 'Đối tác',
            sortable: true,
            render: (provider: Provider) => (
                <div>
                    <p className="font-medium text-gray-900">{provider.name}</p>
                    <p className="text-sm text-gray-600">{provider.code}</p>
                </div>
            ),
        },
        {
            key: 'contact_person',
            label: 'Liên hệ',
            render: (provider: Provider) => (
                <div>
                    <p className="text-sm text-gray-900">{provider.contact_person || '-'}</p>
                    {provider.phone && (
                        <p className="text-sm text-gray-600">{formatters.phone(provider.phone)}</p>
                    )}
                </div>
            ),
        },
        {
            key: 'rating',
            label: 'Đánh giá',
            render: (provider: Provider) => {
                const rating = provider.rating ? parseFloat(String(provider.rating)) : 0;
                const displayRating = isNaN(rating) ? 0 : rating;
                return (
                    <span className="text-sm text-gray-700">⭐ {displayRating.toFixed(1)}</span>
                );
            },
        },
        {
            key: 'status',
            label: 'Trạng thái',
            render: (provider: Provider) => (
                <Badge variant={getStatusVariant(provider.status)}>
                    {getStatusText(provider.status)}
                </Badge>
            ),
        },
        {
            key: 'created_at',
            label: 'Ngày tạo',
            sortable: true,
            render: (provider: Provider) => formatters.date(provider.created_at),
        },
        {
            key: 'actions',
            label: 'Thao tác',
            render: (provider: Provider) => (
                <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(provider)}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteClick(provider)}>
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
                <h1 className="text-3xl font-bold text-gray-900">Garage liên kết</h1>
                <p className="text-gray-600 mt-2">Quản lý các đối tác garage liên kết</p>
            </div>

            <Card>
                <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        <Input
                            placeholder="Tìm kiếm tên, mã, SĐT..."
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
                            <option value="active">Hoạt động</option>
                            <option value="inactive">Không hoạt động</option>
                            <option value="suspended">Tạm dừng</option>
                            <option value="blacklisted">Danh sách đen</option>
                        </Select>
                    </div>
                    <Button variant="primary" onClick={handleCreate}>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Thêm đối tác
                    </Button>
                </div>

                <Table
                    columns={columns}
                    data={providers}
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

            <ProviderFormModal
                isOpen={createModal.isOpen}
                onClose={createModal.close}
                onSuccess={() => {
                    createModal.close();
                    refresh();
                    showToast('success', 'Thêm đối tác thành công');
                }}
            />

            <ProviderFormModal
                isOpen={editModal.isOpen}
                onClose={editModal.close}
                provider={selectedProvider}
                onSuccess={() => {
                    editModal.close();
                    refresh();
                    showToast('success', 'Cập nhật đối tác thành công');
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
                        Bạn có chắc chắn muốn xóa đối tác <strong>{selectedProvider?.name}</strong>?
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

interface ProviderFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    provider?: Provider | null;
}

function ProviderFormModal({ isOpen, onClose, onSuccess, provider }: ProviderFormModalProps) {
    const isEdit = !!provider;

    const initialValues: ProviderFormData = {
        name: provider?.name || '',
        code: provider?.code || '',
        contact_person: provider?.contact_person || '',
        phone: provider?.phone || '',
        email: provider?.email || '',
        address: provider?.address || '',
        status: provider?.status || 'active',
        is_active: provider?.is_active !== false,
    };

    const validateForm = (values: ProviderFormData): Record<string, string> => {
        const errors: Record<string, string> = {};
        if (!values.name?.trim()) errors.name = 'Tên đối tác là bắt buộc';
        if (!values.code?.trim()) errors.code = 'Mã đối tác là bắt buộc';
        if (values.phone && validators.phone(values.phone)) errors.phone = validators.phone(values.phone)!;
        if (values.email && validators.email(values.email)) errors.email = validators.email(values.email)!;
        return errors;
    };

    const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit, reset } = useForm<ProviderFormData>({
        initialValues,
        validate: validateForm,
        onSubmit: async (values) => {
            try {
                if (isEdit && provider) {
                    await providerService.updateProvider(provider.id, values);
                } else {
                    await providerService.createProvider(values);
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
        <Modal isOpen={isOpen} onClose={handleClose} title={isEdit ? 'Chỉnh sửa đối tác' : 'Thêm đối tác mới'} size="lg">
            <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Tên đối tác *" name="name" value={values.name} onChange={(e) => handleChange('name', e.target.value)} onBlur={() => handleBlur('name')} error={touched.name ? errors.name : undefined} />
                        <Input label="Mã đối tác *" name="code" value={values.code} onChange={(e) => handleChange('code', e.target.value)} onBlur={() => handleBlur('code')} error={touched.code ? errors.code : undefined} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Người liên hệ" name="contact_person" value={values.contact_person} onChange={(e) => handleChange('contact_person', e.target.value)} />
                        <Input label="Số điện thoại" name="phone" value={values.phone} onChange={(e) => handleChange('phone', e.target.value)} onBlur={() => handleBlur('phone')} error={touched.phone ? errors.phone : undefined} />
                    </div>
                    <Input label="Email" type="email" name="email" value={values.email} onChange={(e) => handleChange('email', e.target.value)} onBlur={() => handleBlur('email')} error={touched.email ? errors.email : undefined} />
                    <Input label="Địa chỉ" name="address" value={values.address} onChange={(e) => handleChange('address', e.target.value)} />
                    <Select label="Trạng thái" name="status" value={values.status} onChange={(e) => handleChange('status', e.target.value)}>
                        <option value="active">Hoạt động</option>
                        <option value="inactive">Không hoạt động</option>
                        <option value="suspended">Tạm dừng</option>
                        <option value="blacklisted">Danh sách đen</option>
                    </Select>
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
