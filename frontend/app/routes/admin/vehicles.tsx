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
import { vehicleService } from '~/services/vehicle.service';
import { customerService } from '~/services/customer.service';
import { useTable } from '~/hooks/useTable';
import { useModal } from '~/hooks/useModal';
import { useForm } from '~/hooks/useForm';
import type { Vehicle, VehicleBrand, VehicleModel, CreateVehicleData } from '~/types/vehicle';
import type { Customer } from '~/types/customer';
import { formatters } from '~/utils/formatters';

export default function Vehicles() {
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [brands, setBrands] = useState<VehicleBrand[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // ✅ Sử dụng useRef để tránh gọi API 2 lần
    const isInitializedRef = useRef(false);

    const createModal = useModal();
    const editModal = useModal();
    const deleteModal = useModal();

    const fetchVehicles = useCallback(async (params: any) => {
        return await vehicleService.getVehicles(params);
    }, []);

    const {
        data: vehicles,
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
    } = useTable<Vehicle>({
        fetchData: fetchVehicles,
        initialPerPage: 15,
        initialSortBy: 'created_at',
        initialSortDirection: 'desc',
    });

    useEffect(() => {
        // ✅ Check ref để tránh gọi lặp trong React Strict Mode
        if (isInitializedRef.current) {
            console.log('⚠️ Skipping duplicate initialization call (vehicles)');
            return;
        }

        isInitializedRef.current = true;
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            const [brandsData, customersData] = await Promise.all([
                vehicleService.getBrands({ per_page: 100, is_active: true }),
                customerService.getCustomers({ per_page: 100, is_active: true }),
            ]);
            setBrands(brandsData.data || []);
            setCustomers(customersData.data || []);
        } catch (error) {
            console.error('Error loading initial data:', error);
            isInitializedRef.current = false; // ✅ Reset để có thể retry
        }
    };

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    const handleCreate = () => {
        setSelectedVehicle(null);
        createModal.open();
    };

    const handleEdit = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        editModal.open();
    };

    const handleDeleteClick = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        deleteModal.open();
    };

    const handleDeleteConfirm = async () => {
        if (!selectedVehicle) return;

        try {
            await vehicleService.deleteVehicle(selectedVehicle.id);
            showToast('success', 'Xóa xe thành công');
            deleteModal.close();
            refresh();
        } catch (error: any) {
            showToast('error', error.message || 'Không thể xóa xe');
        }
    };

    const columns = [
        {
            key: 'license_plate',
            label: 'Biển số',
            sortable: true,
            render: (vehicle: Vehicle) => (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 font-bold rounded">
                    {vehicle.license_plate}
                </span>
            ),
        },
        {
            key: 'name',
            label: 'Xe',
            sortable: true,
            render: (vehicle: Vehicle) => (
                <div>
                    <p className="font-medium text-gray-900">
                        {vehicle.brand?.name} {vehicle.model?.name}
                    </p>
                    {vehicle.year && (
                        <p className="text-sm text-gray-600">Năm {vehicle.year}</p>
                    )}
                </div>
            ),
        },
        {
            key: 'customer',
            label: 'Chủ xe',
            render: (vehicle: Vehicle) => (
                <div>
                    <p className="text-sm text-gray-900">{vehicle.customer?.name || '-'}</p>
                    {vehicle.customer?.phone && (
                        <p className="text-xs text-gray-600">{formatters.phone(vehicle.customer.phone)}</p>
                    )}
                </div>
            ),
        },
        {
            key: 'mileage',
            label: 'Km đã đi',
            sortable: true,
            render: (vehicle: Vehicle) => (
                <span className="text-sm text-gray-700">{formatters.number(vehicle.mileage)} km</span>
            ),
        },
        {
            key: 'is_active',
            label: 'Trạng thái',
            render: (vehicle: Vehicle) => (
                <Badge variant={vehicle.is_active ? 'success' : 'danger'}>
                    {vehicle.is_active ? 'Hoạt động' : 'Ngừng'}
                </Badge>
            ),
        },
        {
            key: 'created_at',
            label: 'Ngày tạo',
            sortable: true,
            render: (vehicle: Vehicle) => formatters.date(vehicle.created_at),
        },
        {
            key: 'actions',
            label: 'Thao tác',
            render: (vehicle: Vehicle) => (
                <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(vehicle)}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteClick(vehicle)}>
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
                <h1 className="text-3xl font-bold text-gray-900">Quản lý xe</h1>
                <p className="text-gray-600 mt-2">Quản lý thông tin xe của khách hàng</p>
            </div>

            <Card>
                <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        <Input
                            placeholder="Tìm kiếm biển số, chủ xe..."
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
                        Thêm xe
                    </Button>
                </div>

                <Table
                    columns={columns}
                    data={vehicles}
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

            <VehicleFormModal
                isOpen={createModal.isOpen}
                onClose={createModal.close}
                onSuccess={() => {
                    createModal.close();
                    refresh();
                    showToast('success', 'Thêm xe thành công');
                }}
                brands={brands}
                customers={customers}
            />

            <VehicleFormModal
                isOpen={editModal.isOpen}
                onClose={editModal.close}
                vehicle={selectedVehicle}
                onSuccess={() => {
                    editModal.close();
                    refresh();
                    showToast('success', 'Cập nhật xe thành công');
                }}
                brands={brands}
                customers={customers}
            />

            <Modal
                isOpen={deleteModal.isOpen}
                onClose={deleteModal.close}
                title="Xác nhận xóa"
                size="sm"
            >
                <div className="p-6">
                    <p className="text-gray-600 mb-6">
                        Bạn có chắc chắn muốn xóa xe <strong>{selectedVehicle?.license_plate}</strong>?
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

interface VehicleFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    vehicle?: Vehicle | null;
    brands: VehicleBrand[];
    customers: Customer[];
}

function VehicleFormModal({ isOpen, onClose, onSuccess, vehicle, brands, customers }: VehicleFormModalProps) {
    const isEdit = !!vehicle;
    const [models, setModels] = useState<VehicleModel[]>([]);

    const initialValues: CreateVehicleData = {
        customer_id: vehicle?.customer_id || 0,
        brand_id: vehicle?.brand_id || 0,
        model_id: vehicle?.model_id || 0,
        license_plate: vehicle?.license_plate || '',
        vin: vehicle?.vin || '',
        engine_number: vehicle?.engine_number || '',
        year: vehicle?.year || new Date().getFullYear(),
        color: vehicle?.color || '',
        mileage: vehicle?.mileage || 0,
        notes: vehicle?.notes || '',
    };

    const validateForm = (values: CreateVehicleData): Record<string, string> => {
        const errors: Record<string, string> = {};
        if (!values.customer_id) errors.customer_id = 'Chủ xe là bắt buộc';
        if (!values.brand_id) errors.brand_id = 'Hãng xe là bắt buộc';
        if (!values.model_id) errors.model_id = 'Dòng xe là bắt buộc';
        if (!values.license_plate?.trim()) errors.license_plate = 'Biển số xe là bắt buộc';
        return errors;
    };

    const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit, reset } = useForm<CreateVehicleData>({
        initialValues,
        validate: validateForm,
        onSubmit: async (values) => {
            try {
                if (isEdit && vehicle) {
                    await vehicleService.updateVehicle(vehicle.id, values);
                } else {
                    await vehicleService.createVehicle(values);
                }
                reset();
                onSuccess();
            } catch (error: any) {
                throw new Error(error?.message || 'Có lỗi xảy ra');
            }
        },
    });

    useEffect(() => {
        if (values.brand_id) {
            loadModels(values.brand_id);
        }
    }, [values.brand_id]);

    const loadModels = async (brandId: number) => {
        try {
            const data = await vehicleService.getModelsByBrand(brandId);
            setModels(data || []);
        } catch (error) {
            console.error('Error loading models:', error);
            setModels([]);
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={isEdit ? 'Chỉnh sửa xe' : 'Thêm xe mới'} size="lg">
            <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-6">
                    <Select label="Chủ xe *" name="customer_id" value={values.customer_id} onChange={(e) => handleChange('customer_id', Number(e.target.value))} error={touched.customer_id ? errors.customer_id : undefined}>
                        <option value="">Chọn chủ xe</option>
                        {customers.map(c => <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>)}
                    </Select>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select label="Hãng xe *" name="brand_id" value={values.brand_id} onChange={(e) => handleChange('brand_id', Number(e.target.value))} error={touched.brand_id ? errors.brand_id : undefined}>
                            <option value="">Chọn hãng xe</option>
                            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </Select>
                        <Select label="Dòng xe *" name="model_id" value={values.model_id} onChange={(e) => handleChange('model_id', Number(e.target.value))} error={touched.model_id ? errors.model_id : undefined}>
                            <option value="">Chọn dòng xe</option>
                            {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </Select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Biển số xe *" name="license_plate" value={values.license_plate} onChange={(e) => handleChange('license_plate', e.target.value)} onBlur={() => handleBlur('license_plate')} error={touched.license_plate ? errors.license_plate : undefined} />
                        <Input label="Năm sản xuất" type="number" name="year" value={values.year} onChange={(e) => handleChange('year', Number(e.target.value))} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Số khung (VIN)" name="vin" value={values.vin} onChange={(e) => handleChange('vin', e.target.value)} />
                        <Input label="Số máy" name="engine_number" value={values.engine_number} onChange={(e) => handleChange('engine_number', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Màu sắc" name="color" value={values.color} onChange={(e) => handleChange('color', e.target.value)} />
                        <Input label="Số km đã đi" type="number" name="mileage" value={values.mileage} onChange={(e) => handleChange('mileage', Number(e.target.value))} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
                        <textarea className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" rows={3} value={values.notes} onChange={(e) => handleChange('notes', e.target.value)} />
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
