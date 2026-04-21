import { useMemo, useState, useEffect } from 'react';
import { courseService } from '~/services/course.service';
import { majorService } from '~/services/major.service';
import { useTable } from '~/hooks/useTable';
import { useForm } from '~/hooks/useForm';
import type { Course, CourseFormData, CreateClassRequest } from '~/types/course';
import type { Major } from '~/types/major';
import type { TableQueryParams, PaginatedResponse } from '~/types/common';
import {
    CalendarDaysIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowPathIcon,
    PlusCircleIcon,
    PencilIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { Card } from '~/components/ui/Card';
import { Badge } from '~/components/ui/Badge';
import { Table } from '~/components/ui/Table';
import { Pagination } from '~/components/ui/Pagination';
import { Modal } from '~/components/ui/Modal';
import { formatters } from '~/utils/formatters';

export default function CoursePage() {
    const [majors, setMajors] = useState<Major[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCreateClassModal, setShowCreateClassModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load majors
    useEffect(() => {
        const loadMajors = async () => {
            try {
                const majorsList = await majorService.getAllMajors();
                setMajors(majorsList);
            } catch (error) {
                console.error('Error loading majors:', error);
            }
        };
        loadMajors();
    }, []);

    // Form for creating new course
    const addForm = useForm<CourseFormData>({
        initialValues: {
            nam_hoc: new Date().getFullYear(),
            dot: 1,
            ngay_bat_dau: '',
            ngay_ket_thuc: '',
            ghi_chu: '',
        },
        onSubmit: async (values) => {
            setIsSubmitting(true);
            try {
                await courseService.createCourse(values);
                alert(`✅ Tạo năm học ${values.nam_hoc}.${values.dot} thành công!`);
                setShowAddModal(false);
                addForm.reset();
                table.refresh();
            } catch (error: any) {
                alert(`❌ Lỗi: ${error.message || 'Không thể tạo năm học'}`);
            } finally {
                setIsSubmitting(false);
            }
        },
    });

    // Form for editing course
    const editForm = useForm<Partial<CourseFormData>>({
        initialValues: {
            ngay_bat_dau: '',
            ngay_ket_thuc: '',
            ghi_chu: '',
        },
        onSubmit: async (values) => {
            if (!selectedCourse) return;
            setIsSubmitting(true);
            try {
                await courseService.updateCourse(selectedCourse.id, values);
                alert('✅ Cập nhật năm học thành công!');
                setShowEditModal(false);
                setSelectedCourse(null);
                table.refresh();
            } catch (error: any) {
                alert(`❌ Lỗi: ${error.message || 'Không thể cập nhật năm học'}`);
            } finally {
                setIsSubmitting(false);
            }
        },
    });

    // Form for creating class
    const createClassForm = useForm<CreateClassRequest>({
        initialValues: {
            khoa_hoc_id: 0,
            major_id: 0,
            trinh_do: 'THS',
            phu_trach_lop: ""
        },
        onSubmit: async (values) => {
            setIsSubmitting(true);
            try {
                const result = await courseService.createClass(values);
                alert(`✅ ${result.message || 'Tạo lớp học thành công!'}`);
                setShowCreateClassModal(false);
                createClassForm.reset();
            } catch (error: any) {
                alert(`❌ Lỗi: ${error.message || 'Không thể tạo lớp học'}`);
            } finally {
                setIsSubmitting(false);
            }
        },
    });

    // Search form
    const searchForm = useForm({
        initialValues: {search: ''},
        onSubmit: async (values) => {
            table.handleSearch(values.search);
        },
    });

    // Table hook
    const fetchCoursesData = async (params: TableQueryParams): Promise<PaginatedResponse<Course>> => {
        try {
            return await courseService.getCourses(params);
        } catch (error) {
            console.error('❌ Error fetching courses:', error);
            throw error;
        }
    };

    const table = useTable<Course>({
        fetchData: fetchCoursesData,
        initialPage: 1,
        initialPerPage: 10,
        initialSortBy: 'id',
        initialSortDirection: 'desc',
    });

    // Handlers
    const handleEdit = (course: Course) => {
        setSelectedCourse(course);
        editForm.setValues({
            ngay_bat_dau: course.ngay_bat_dau || '',
            ngay_ket_thuc: course.ngay_ket_thuc || '',
            ghi_chu: course.ghi_chu || '',
        });
        setShowEditModal(true);
    };

    const handleDelete = async (course: Course) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa năm học ${formatters.courseCode(course)}?`)) return;
        try {
            await courseService.deleteCourse(course.id);
            alert('✅ Xóa năm học thành công!');
            table.refresh();
        } catch (error: any) {
            alert(`❌ Lỗi: ${error.message || 'Không thể xóa năm học'}`);
        }
    };

    // Table columns
    const columns = useMemo(() => [
        {
            key: 'stt',
            label: 'STT',
            width: '60px',
            render: (_: Course, index: number) => (
                <span className="text-gray-900">
                    {(table.meta.current_page - 1) * table.meta.per_page + index + 1}
                </span>
            ),
        },
        {
            key: 'ma_khoa_hoc',
            label: 'Mã năm học',
            sortable: true,
            width: '120px',
            render: (item: Course) => (
                <span className="font-semibold text-blue-600">
                    {formatters.courseCode(item)}
                </span>
            ),
        },
        {
            key: 'nam_hoc',
            label: 'Năm học',
            sortable: true,
            width: '100px',
            render: (item: Course) => (
                <Badge variant="info">{item.nam_hoc}</Badge>
            ),
        },
        {
            key: 'dot',
            label: 'Đợt',
            width: '70px',
            render: (item: Course) => (
                <Badge variant="default">Đợt {item.dot}</Badge>
            ),
        },
        {
            key: 'ngay_bat_dau',
            label: 'Ngày bắt đầu',
            width: '120px',
            render: (item: Course) => {
                if (!item.ngay_bat_dau) return <span className="text-sm text-gray-700">-</span>;
                const date = new Date(item.ngay_bat_dau);
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                return <span className="text-sm text-gray-700">{`${day}-${month}-${year}`}</span>;
            },
        },
        {
            key: 'ngay_ket_thuc',
            label: 'Ngày kết thúc',
            width: '120px',
            render: (item: Course) => {
                if (!item.ngay_ket_thuc) return <span className="text-sm text-gray-700">-</span>;
                const date = new Date(item.ngay_ket_thuc);
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                return <span className="text-sm text-gray-700">{`${day}-${month}-${year}`}</span>;
            },
        },
        {
            key: 'ghi_chu',
            label: 'Ghi chú',
            render: (item: Course) => (
                <span className="text-sm text-gray-600">
                    {item.ghi_chu || '-'}
                </span>
            ),
        },
        {
            key: 'actions',
            label: 'Thao tác',
            width: '100px',
            render: (item: Course) => (
                <div className="flex gap-2">
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleEdit(item)}
                    >
                        <PencilIcon className="w-4 h-4"/>
                    </Button>
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(item)}
                    >
                        <TrashIcon className="w-4 h-4"/>
                    </Button>
                </div>
            ),
        },
    ], [table.meta.current_page, table.meta.per_page]);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div
                        className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <CalendarDaysIcon className="w-6 h-6 text-white"/>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Quản lý năm học</h1>
                        <p className="text-sm text-gray-500">Quản lý thông tin năm học và tạo lớp học</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="success"
                        onClick={() => setShowAddModal(true)}
                    >
                        <PlusCircleIcon className="w-5 h-5 mr-2"/>
                        Thêm năm học
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => table.refresh()}
                        disabled={table.isLoading}
                    >
                        <ArrowPathIcon className={`w-5 h-5 mr-2 ${table.isLoading ? 'animate-spin' : ''}`}/>
                        Làm mới
                    </Button>
                </div>
            </div>

            {/* Search & Filters */}
            <Card>
                <div className="p-4 space-y-4">
                    <div className="flex items-center gap-2 text-gray-700 font-semibold">
                        <FunnelIcon className="w-5 h-5"/>
                        <span>Tìm kiếm & Lọc</span>
                    </div>

                    <form onSubmit={searchForm.handleSubmit} className="flex gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <MagnifyingGlassIcon
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                                <Input
                                    type="text"
                                    placeholder="Tìm theo mã năm học, năm học, ghi chú..."
                                    value={searchForm.values.search}
                                    onChange={(e) => searchForm.handleChange('search', e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Button type="submit" variant="primary">
                            Tìm kiếm
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                                searchForm.reset();
                                table.handleSearch('');
                            }}
                        >
                            Xóa lọc
                        </Button>
                    </form>
                </div>
            </Card>

            {/* Table */}
            <Card>
                <div className="p-4">
                    <Table
                        columns={columns}
                        data={table.data || []}
                        isLoading={table.isLoading}
                        emptyMessage="Không có năm học nào"
                        onSort={table.handleSort}
                        sortBy={table.sortBy}
                        sortDirection={table.sortDirection}
                    />
                </div>
            </Card>

            {/* Pagination */}
            {table.meta.total > 0 && (
                <div className="flex justify-center">
                    <Pagination
                        currentPage={table.meta.current_page}
                        totalPages={table.meta.last_page}
                        onPageChange={table.handlePageChange}
                    />
                </div>
            )}

            {/* Add Course Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Thêm năm học mới"
            >
                <form onSubmit={addForm.handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Năm học <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="number"
                                value={addForm.values.nam_hoc}
                                onChange={(e) => addForm.handleChange('nam_hoc', parseInt(e.target.value))}
                                min={2020}
                                max={2100}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Đợt <span className="text-red-500">*</span>
                            </label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                value={addForm.values.dot}
                                onChange={(e) => addForm.handleChange('dot', parseInt(e.target.value))}
                            >
                                <option value={1}>Đợt 1</option>
                                <option value={2}>Đợt 2</option>
                                <option value={3}>Đợt 3</option>
                                <option value={4}>Đợt 4</option>
                                <option value={5}>Đợt 5</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ngày bắt đầu
                            </label>
                            <Input
                                type="date"
                                value={addForm.values.ngay_bat_dau}
                                onChange={(e) => addForm.handleChange('ngay_bat_dau', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ngày kết thúc
                            </label>
                            <Input
                                type="date"
                                value={addForm.values.ngay_ket_thuc}
                                onChange={(e) => addForm.handleChange('ngay_ket_thuc', e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ghi chú
                        </label>
                        <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            value={addForm.values.ghi_chu}
                            onChange={(e) => addForm.handleChange('ghi_chu', e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setShowAddModal(false)}
                        >
                            Hủy
                        </Button>
                            <Button
                            type="submit"
                            variant="primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Đang tạo...' : 'Tạo năm học'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Course Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title={`Chỉnh sửa năm học ${formatters.courseCode(selectedCourse || '')}`}
            >
                <form onSubmit={editForm.handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ngày bắt đầu
                            </label>
                            <Input
                                type="date"
                                value={editForm.values.ngay_bat_dau}
                                onChange={(e) => editForm.handleChange('ngay_bat_dau', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ngày kết thúc
                            </label>
                            <Input
                                type="date"
                                value={editForm.values.ngay_ket_thuc}
                                onChange={(e) => editForm.handleChange('ngay_ket_thuc', e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ghi chú
                        </label>
                        <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            value={editForm.values.ghi_chu}
                            onChange={(e) => editForm.handleChange('ghi_chu', e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setShowEditModal(false)}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Create Class Modal */}
            <Modal
                isOpen={showCreateClassModal}
                onClose={() => setShowCreateClassModal(false)}
                title={`Tạo lớp học cho năm học ${formatters.courseCode(selectedCourse || '')}`}
            >
                <form onSubmit={createClassForm.handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ngành học <span className="text-red-500">*</span>
                        </label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            value={createClassForm.values.major_id}
                            onChange={(e) => createClassForm.handleChange('major_id', parseInt(e.target.value))}
                            required
                        >
                            <option value={0}>-- Chọn ngành học --</option>
                            {majors.map(major => (
                                <option key={major.id} value={major.id}>
                                    {major.maNganh} - {major.tenNganh}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            Tên lớp sẽ được tạo theo format: {'{'}Mã ngành{'}'} {formatters.courseCode(selectedCourse || '')}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Trình độ đào tạo <span className="text-red-500">*</span>
                        </label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            value={createClassForm.values.trinh_do}
                            onChange={(e) => createClassForm.handleChange('trinh_do', e.target.value)}
                            required
                        >
                            <option value="THS">Thạc sĩ</option>
                            <option value="TS">Tiến sĩ</option>
                            <option value="CH">Cử nhân</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setShowCreateClassModal(false)}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            variant="success"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Đang tạo...' : 'Tạo lớp học'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
