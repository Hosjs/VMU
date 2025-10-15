import { useState, useEffect, useCallback, useRef } from 'react';
import type { Route } from './+types/categories';
import { Card } from '~/components/ui/Card';
import { Badge } from '~/components/ui/Badge';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { Select } from '~/components/ui/Select';
import { Modal } from '~/components/ui/Modal';
import { Table } from '~/components/ui/Table';
import { Pagination } from '~/components/ui/Pagination';
import { Toast } from '~/components/ui/Toast';
import { categoryService } from '~/services/category.service';
import { useTable } from '~/hooks/useTable';
import { useModal } from '~/hooks/useModal';
import { useForm } from '~/hooks/useForm';
import type { Category } from '~/types/product';

export async function loader({ request }: Route.LoaderArgs) {
  return null;
}

export default function Categories() {
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [parentCategories, setParentCategories] = useState<Category[]>([]);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const isInitializedRef = useRef(false);

    const createModal = useModal();
    const editModal = useModal();
    const deleteModal = useModal();

    const fetchCategories = useCallback(async (params: any) => {
        return categoryService.getCategoriesPaginated(params);
    }, []);

    const {
        data: categories,
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
    } = useTable<Category>({
        fetchData: fetchCategories,
        initialPerPage: 50,
        initialSortBy: 'sort_order',
        initialSortDirection: 'asc',
    });

    useEffect(() => {
        if (isInitializedRef.current) {
            console.log('⚠️ Skipping duplicate initialization call (categories)');
            return;
        }

        isInitializedRef.current = true;
        loadParentCategories();
    }, []);

    const loadParentCategories = async () => {
        try {
            const response = await categoryService.getCategories({ is_active: true });
            setParentCategories(response || []);
        } catch (error) {
            console.error('Error loading parent categories:', error);
            setParentCategories([]);
            isInitializedRef.current = false;
        }
    };

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    const handleCreate = () => {
        setSelectedCategory(null);
        createModal.open();
    };

    const handleEdit = (category: Category) => {
        setSelectedCategory(category);
        editModal.open();
    };

    const handleDeleteClick = (category: Category) => {
        setSelectedCategory(category);
        deleteModal.open();
    };

    const handleDeleteConfirm = async () => {
        if (!selectedCategory) return;

        try {
            await categoryService.deleteCategory(selectedCategory.id);
            showToast('success', 'Xóa danh mục thành công');
            deleteModal.close();
            refresh();
            loadParentCategories();
        } catch (error: any) {
            showToast('error', error.message || 'Không thể xóa danh mục');
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
            label: 'Tên danh mục',
            sortable: true,
            render: (category: Category) => (
                <div>
                    <p className="font-medium text-gray-900">{category.name}</p>
                    {category.description && (
                        <p className="text-xs text-gray-500 line-clamp-1">{category.description}</p>
                    )}
                </div>
            ),
        },
        {
            key: 'parent',
            label: 'Danh mục cha',
            render: (category: Category) => (
                category.parent ? (
                    <Badge variant="info">{category.parent.name}</Badge>
                ) : (
                    <span className="text-xs text-gray-400">Root</span>
                )
            ),
        },
        {
            key: 'products_count',
            label: 'Số sản phẩm',
            width: '120px',
            render: (category: Category) => (
                <span className="text-sm font-medium text-gray-700">
                    {category.products_count || 0}
                </span>
            ),
        },
        {
            key: 'sort_order',
            label: 'Thứ tự',
            sortable: true,
            width: '100px',
            render: (category: Category) => (
                <span className="text-sm text-gray-600">{category.sort_order}</span>
            ),
        },
        {
            key: 'is_active',
            label: 'Trạng thái',
            width: '120px',
            render: (category: Category) => (
                <Badge variant={category.is_active ? 'success' : 'danger'}>
                    {category.is_active ? 'Hoạt động' : 'Ngừng'}
                </Badge>
            ),
        },
        {
            key: 'actions',
            label: 'Thao tác',
            width: '100px',
            render: (category: Category) => (
                <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(category)}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteClick(category)}>
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
                <h1 className="text-3xl font-bold text-gray-900">Danh mục sản phẩm</h1>
                <p className="text-gray-600 mt-2">Quản lý danh mục phụ tùng (hỗ trợ phân cấp)</p>
            </div>

            <Card>
                <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        <Input
                            placeholder="Tìm kiếm tên, mã, slug..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full md:w-96"
                        />
                        <Select
                            value={filters.parent_id || ''}
                            onChange={(e) => handleFilter('parent_id', e.target.value || undefined)}
                            className="w-full md:w-48"
                        >
                            <option value="">Tất cả cấp</option>
                            <option value="0">Root (cấp 1)</option>
                            {parentCategories.map(cat => (
                                <option key={cat.id} value={cat.id}>Con của: {cat.name}</option>
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
                        Thêm danh mục
                    </Button>
                </div>

                <Table
                    columns={columns}
                    data={categories}
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

            <CategoryFormModal
                isOpen={createModal.isOpen}
                onClose={createModal.close}
                onSuccess={() => {
                    createModal.close();
                    refresh();
                    loadParentCategories();
                    showToast('success', 'Thêm danh mục thành công');
                }}
                parentCategories={parentCategories}
            />

            <CategoryFormModal
                isOpen={editModal.isOpen}
                onClose={editModal.close}
                category={selectedCategory}
                onSuccess={() => {
                    editModal.close();
                    refresh();
                    loadParentCategories();
                    showToast('success', 'Cập nhật danh mục thành công');
                }}
                parentCategories={parentCategories}
            />

            <Modal
                isOpen={deleteModal.isOpen}
                onClose={deleteModal.close}
                title="Xác nhận xóa"
                size="sm"
            >
                <div className="p-6">
                    <p className="text-gray-600 mb-6">
                        Bạn có chắc chắn muốn xóa danh mục <strong>{selectedCategory?.name}</strong>?
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

interface CategoryFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    category?: Category | null;
    parentCategories: Category[];
}

interface CategoryFormData {
    name: string;
    code: string;
    slug: string;
    description: string;
    parent_id: number | string;
    image: string;
    sort_order: number | string;
    is_active: boolean;
}

function CategoryFormModal({ isOpen, onClose, onSuccess, category, parentCategories }: CategoryFormModalProps) {
    const isEdit = !!category;

    const initialValues: CategoryFormData = {
        name: category?.name || '',
        code: category?.code || '',
        slug: category?.slug || '',
        description: category?.description || '',
        parent_id: category?.parent_id || '',
        image: category?.image || '',
        sort_order: category?.sort_order || 0,
        is_active: category?.is_active !== false,
    };

    const validateForm = (values: CategoryFormData): Record<string, string> => {
        const errors: Record<string, string> = {};
        if (!values.name?.trim()) errors.name = 'Tên danh mục là bắt buộc';
        if (!values.code?.trim()) errors.code = 'Mã danh mục là bắt buộc';
        if (!values.slug?.trim()) errors.slug = 'Slug là bắt buộc';
        return errors;
    };

    const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit, reset } = useForm<CategoryFormData>({
        initialValues,
        validate: validateForm,
        onSubmit: async (values) => {
            try {
                const submitData = {
                    name: values.name,
                    code: values.code,
                    slug: values.slug,
                    description: values.description,
                    parent_id: values.parent_id ? Number(values.parent_id) : undefined,
                    image: values.image || undefined,
                    sort_order: Number(values.sort_order),
                    is_active: values.is_active,
                };

                if (isEdit && category) {
                    await categoryService.updateCategory(category.id, submitData);
                } else {
                    await categoryService.createCategory(submitData);
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

    // Auto-generate slug from name
    const handleNameChange = (value: string) => {
        handleChange('name', value);
        if (!isEdit) {
            const slug = value
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/đ/g, 'd')
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();
            handleChange('slug', slug);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={isEdit ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'} size="lg">
            <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Tên danh mục *"
                            name="name"
                            value={values.name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            onBlur={() => handleBlur('name')}
                            error={touched.name ? errors.name : undefined}
                            placeholder="VD: Dầu máy"
                        />
                        <Input
                            label="Mã danh mục *"
                            name="code"
                            value={values.code}
                            onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                            onBlur={() => handleBlur('code')}
                            error={touched.code ? errors.code : undefined}
                            placeholder="VD: OIL"
                        />
                    </div>

                    <Input
                        label="Slug (URL-friendly) *"
                        name="slug"
                        value={values.slug}
                        onChange={(e) => handleChange('slug', e.target.value)}
                        onBlur={() => handleBlur('slug')}
                        error={touched.slug ? errors.slug : undefined}
                        placeholder="VD: dau-may"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label="Danh mục cha"
                            name="parent_id"
                            value={values.parent_id}
                            onChange={(e) => handleChange('parent_id', e.target.value)}
                        >
                            <option value="">Không có (Root)</option>
                            {parentCategories
                                .filter(cat => !category || cat.id !== category.id)
                                .map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                        </Select>

                        <Input
                            label="Thứ tự sắp xếp"
                            type="number"
                            name="sort_order"
                            value={values.sort_order}
                            onChange={(e) => handleChange('sort_order', e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                        <textarea
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            value={values.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder="Mô tả về danh mục"
                        />
                    </div>

                    <Input
                        label="URL hình ảnh"
                        name="image"
                        value={values.image}
                        onChange={(e) => handleChange('image', e.target.value)}
                        placeholder="https://example.com/image.jpg"
                    />

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={values.is_active}
                            onChange={(e) => handleChange('is_active', e.target.checked)}
                            className="mr-2 h-4 w-4"
                        />
                        <label htmlFor="is_active" className="text-sm text-gray-700">Kích hoạt danh mục</label>
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

