import { useState, useEffect, useCallback } from 'react';
import { Card } from '~/components/ui/Card';
import { Badge } from '~/components/ui/Badge';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { Select } from '~/components/ui/Select';
import { Modal } from '~/components/ui/Modal';
import { Table } from '~/components/ui/Table';
import { Pagination } from '~/components/ui/Pagination';
import { Toast } from '~/components/ui/Toast';
import { productService } from '~/services/product.service';
import { categoryService } from '~/services/category.service';
import { useTable } from '~/hooks/useTable';
import { useModal } from '~/hooks/useModal';
import { useForm } from '~/hooks/useForm';
import type { Product, Category } from '~/types/product';
import { formatters } from '~/utils/formatters';

export default function Products() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const createModal = useModal();
    const editModal = useModal();
    const deleteModal = useModal();

    const fetchProducts = useCallback(async (params: any) => {
        return await productService.getProducts(params);
    }, []);

    const {
        data: products,
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
    } = useTable<Product>({
        fetchData: fetchProducts,
        initialPerPage: 15,
        initialSortBy: 'created_at',
        initialSortDirection: 'desc',
    });

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const response = await categoryService.getCategories({ type: 'product', is_active: true });
            setCategories(response || []);
        } catch (error) {
            console.error('Error loading categories:', error);
            setCategories([]);
        }
    };

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    const handleCreate = () => {
        setSelectedProduct(null);
        createModal.open();
    };

    const handleEdit = (product: Product) => {
        setSelectedProduct(product);
        editModal.open();
    };

    const handleDeleteClick = (product: Product) => {
        setSelectedProduct(product);
        deleteModal.open();
    };

    const handleDeleteConfirm = async () => {
        if (!selectedProduct) return;

        try {
            await productService.deleteProduct(selectedProduct.id);
            showToast('success', 'Xóa sản phẩm thành công');
            deleteModal.close();
            refresh();
        } catch (error: any) {
            showToast('error', error.message || 'Không thể xóa sản phẩm');
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
            label: 'Tên sản phẩm',
            sortable: true,
            render: (product: Product) => (
                <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    {product.description && (
                        <p className="text-xs text-gray-500">{product.description}</p>
                    )}
                </div>
            ),
        },
        {
            key: 'category',
            label: 'Danh mục',
            render: (product: Product) => (
                <Badge variant="info">{product.category?.name || 'N/A'}</Badge>
            ),
        },
        {
            key: 'unit',
            label: 'Đơn vị',
            render: (product: Product) => (
                <span className="text-sm text-gray-700">{product.unit}</span>
            ),
        },
        {
            key: 'quote_price',
            label: 'Giá báo KH',
            sortable: true,
            render: (product: Product) => (
                <span className="font-semibold text-blue-600">
                    {formatters.currency(product.quote_price || 0)}
                </span>
            ),
        },
        {
            key: 'settlement_price',
            label: 'Giá QT',
            render: (product: Product) => (
                <span className="font-semibold text-gray-900">
                    {formatters.currency(product.settlement_price || 0)}
                </span>
            ),
        },
        {
            key: 'is_stockable',
            label: 'Quản lý tồn',
            render: (product: Product) => (
                <Badge variant={product.is_stockable ? 'success' : 'secondary'}>
                    {product.is_stockable ? 'Có' : 'Không'}
                </Badge>
            ),
        },
        {
            key: 'is_active',
            label: 'Trạng thái',
            render: (product: Product) => (
                <Badge variant={product.is_active ? 'success' : 'danger'}>
                    {product.is_active ? 'Hoạt động' : 'Ngừng'}
                </Badge>
            ),
        },
        {
            key: 'actions',
            label: 'Thao tác',
            render: (product: Product) => (
                <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(product)}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteClick(product)}>
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
                <h1 className="text-3xl font-bold text-gray-900">Sản phẩm</h1>
                <p className="text-gray-600 mt-2">Quản lý danh mục sản phẩm</p>
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
                        Thêm sản phẩm
                    </Button>
                </div>

                <Table
                    columns={columns}
                    data={products}
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

            <ProductFormModal
                isOpen={createModal.isOpen}
                onClose={createModal.close}
                onSuccess={() => {
                    createModal.close();
                    refresh();
                    showToast('success', 'Thêm sản phẩm thành công');
                }}
                categories={categories}
            />

            <ProductFormModal
                isOpen={editModal.isOpen}
                onClose={editModal.close}
                product={selectedProduct}
                onSuccess={() => {
                    editModal.close();
                    refresh();
                    showToast('success', 'Cập nhật sản phẩm thành công');
                }}
                categories={categories}
            />

            <Modal
                isOpen={deleteModal.isOpen}
                onClose={deleteModal.close}
                title="Xác nhận xóa"
                size="sm"
            >
                <div className="p-6">
                    <p className="text-gray-600 mb-6">
                        Bạn có chắc chắn muốn xóa sản phẩm <strong>{selectedProduct?.name}</strong>?
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

interface ProductFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    product?: Product | null;
    categories: Category[];
}

interface ProductFormData {
    name: string;
    code: string;
    category_id: number | string;
    unit: string;
    quote_price: string | number;
    settlement_price: string | number;
    description: string;
    is_stockable: boolean;
    is_active: boolean;
}

function ProductFormModal({ isOpen, onClose, onSuccess, product, categories }: ProductFormModalProps) {
    const isEdit = !!product;

    const initialValues: ProductFormData = {
        name: product?.name || '',
        code: product?.code || '',
        category_id: product?.category_id || '',
        unit: product?.unit || 'cái',
        quote_price: product?.quote_price || '',
        settlement_price: product?.settlement_price || '',
        description: product?.description || '',
        is_stockable: product?.is_stockable !== false,
        is_active: product?.is_active !== false,
    };

    const validateForm = (values: ProductFormData): Record<string, string> => {
        const errors: Record<string, string> = {};
        if (!values.name?.trim()) errors.name = 'Tên sản phẩm là bắt buộc';
        if (!values.code?.trim()) errors.code = 'Mã sản phẩm là bắt buộc';
        if (!values.category_id) errors.category_id = 'Danh mục là bắt buộc';
        if (!values.quote_price || Number(values.quote_price) <= 0) {
            errors.quote_price = 'Giá báo khách hàng phải lớn hơn 0';
        }
        if (!values.settlement_price || Number(values.settlement_price) <= 0) {
            errors.settlement_price = 'Giá quyết toán phải lớn hơn 0';
        }
        return errors;
    };

    const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit, reset } = useForm<ProductFormData>({
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
                if (isEdit && product) {
                    await productService.updateProduct(product.id, submitData);
                } else {
                    await productService.createProduct(submitData);
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
        <Modal isOpen={isOpen} onClose={handleClose} title={isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'} size="lg">
            <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Tên sản phẩm *" name="name" value={values.name} onChange={(e) => handleChange('name', e.target.value)} onBlur={() => handleBlur('name')} error={touched.name ? errors.name : undefined} />
                        <Input label="Mã sản phẩm *" name="code" value={values.code} onChange={(e) => handleChange('code', e.target.value)} onBlur={() => handleBlur('code')} error={touched.code ? errors.code : undefined} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select label="Danh mục *" name="category_id" value={values.category_id} onChange={(e) => handleChange('category_id', e.target.value)} error={touched.category_id ? errors.category_id : undefined}>
                            <option value="">Chọn danh mục</option>
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </Select>
                        <Input label="Đơn vị" name="unit" value={values.unit} onChange={(e) => handleChange('unit', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Giá báo khách hàng *" type="number" name="quote_price" value={values.quote_price} onChange={(e) => handleChange('quote_price', e.target.value)} onBlur={() => handleBlur('quote_price')} error={touched.quote_price ? errors.quote_price : undefined} />
                        <Input label="Giá quyết toán *" type="number" name="settlement_price" value={values.settlement_price} onChange={(e) => handleChange('settlement_price', e.target.value)} onBlur={() => handleBlur('settlement_price')} error={touched.settlement_price ? errors.settlement_price : undefined} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                        <textarea className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" rows={3} value={values.description} onChange={(e) => handleChange('description', e.target.value)} />
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center">
                            <input type="checkbox" id="is_stockable" checked={values.is_stockable} onChange={(e) => handleChange('is_stockable', e.target.checked)} className="mr-2" />
                            <label htmlFor="is_stockable" className="text-sm text-gray-700">Quản lý tồn kho</label>
                        </div>
                        <div className="flex items-center">
                            <input type="checkbox" id="is_active" checked={values.is_active} onChange={(e) => handleChange('is_active', e.target.checked)} className="mr-2" />
                            <label htmlFor="is_active" className="text-sm text-gray-700">Hoạt động</label>
                        </div>
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
