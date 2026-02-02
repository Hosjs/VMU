import { useMemo, useState, useEffect } from 'react';
import { roomService } from '~/services/room.service';
import { majorService } from '~/services/major.service';
import { academicYearService } from '~/services/academic-year.service';
import { useTable } from '~/hooks/useTable';
import { useForm } from '~/hooks/useForm';
import type { Room } from '~/types/room';
import type { Major } from '~/types/major';
import type { TableQueryParams, PaginatedResponse } from '~/types/common';
import {
    AcademicCapIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowPathIcon,
    UserGroupIcon,
    PlusCircleIcon,
    CalendarIcon
} from '@heroicons/react/24/outline';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { Card } from '~/components/ui/Card';
import { Badge } from '~/components/ui/Badge';
import { Table } from '~/components/ui/Table';
import { Pagination } from '~/components/ui/Pagination';

export function meta() {
    return [
        { title: "Danh sách lớp học - VMU Training" },
        { name: "description", content: "Quản lý thông tin lớp học theo ngành và khóa học" },
    ];
}

export default function RoomPage() {
    // State for majors list
    const [majors, setMajors] = useState<Major[]>([]);

    // State for academic year modal
    const [showAddYearModal, setShowAddYearModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load majors on component mount
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

    // ============================================
    // FORM for academic year with major selection
    // ============================================
    const yearForm = useForm({
        initialValues: {
            nam_hoc: new Date().getFullYear(),
            selected_majors: [] as string[], // List of major IDs to create classes for
        },
        onSubmit: async (values) => {
            if (values.selected_majors.length === 0) {
                alert('⚠️ Vui lòng chọn ít nhất một ngành học để tạo lớp');
                return;
            }

            setIsSubmitting(true);
            try {
                await academicYearService.createAcademicYear({
                    nam_hoc: values.nam_hoc,
                    ten_khoa_hoc: `Năm học ${values.nam_hoc}-${values.nam_hoc + 1}`,
                    major_ids: values.selected_majors,
                });

                const majorCount = values.selected_majors.length;
                alert(`✅ Đã thêm năm học ${values.nam_hoc}-${values.nam_hoc + 1} thành công!\n📚 Đã tạo lớp cho ${majorCount} ngành học.`);
                setShowAddYearModal(false);
                yearForm.reset();
                table.refresh();
            } catch (error: any) {
                alert(`❌ Lỗi: ${error.message || 'Không thể thêm năm học'}`);
            } finally {
                setIsSubmitting(false);
            }
        },
    });

    // Handle major selection toggle
    const handleMajorToggle = (majorId: string) => {
        const currentSelection = yearForm.values.selected_majors;
        if (currentSelection.includes(majorId)) {
            yearForm.handleChange('selected_majors', currentSelection.filter(id => id !== majorId));
        } else {
            yearForm.handleChange('selected_majors', [...currentSelection, majorId]);
        }
    };

    // Select all majors
    const handleSelectAllMajors = () => {
        if (yearForm.values.selected_majors.length === majors.length) {
            yearForm.handleChange('selected_majors', []);
        } else {
            yearForm.handleChange('selected_majors', majors.map(m => m.maNganh || m.id.toString()));
        }
    };

    // ============================================
    // FORM for search
    // ============================================
    const searchForm = useForm({
        initialValues: { search: '' },
        onSubmit: async (values) => {
            handleSearch(values.search);
        },
    });

    // ============================================
    // TABLE HOOK - Fetch data with pagination
    // ============================================
    const fetchRoomsData = async (params: TableQueryParams): Promise<PaginatedResponse<Room>> => {
        try {
            const allData = await roomService.getDanhSach();

            // Client-side filtering
            let filtered = allData;
            if (params.search) {
                const keyword = params.search.toLowerCase().trim();
                filtered = allData.filter(room =>
                    room.tenLop?.toLowerCase().includes(keyword) ||
                    room.giaoVienChuNhiem?.toLowerCase().includes(keyword) ||
                    room.maNganhHoc?.toLowerCase().includes(keyword) ||
                    room.khoaHoc?.toString().includes(keyword)
                );
            }

            // Client-side sorting
            if (params.sort_by) {
                filtered = [...filtered].sort((a, b) => {
                    const aVal = (a as any)[params.sort_by!];
                    const bVal = (b as any)[params.sort_by!];

                    if (params.sort_direction === 'desc') {
                        return bVal > aVal ? 1 : -1;
                    }
                    return aVal > bVal ? 1 : -1;
                });
            }

            // Client-side pagination
            const page = params.page || 1;
            const perPage = params.per_page || 10;
            const start = (page - 1) * perPage;
            const end = start + perPage;
            const paginatedData = filtered.slice(start, end);
            const lastPage = Math.ceil(filtered.length / perPage);

            return {
                data: paginatedData,
                current_page: page,
                last_page: lastPage,
                per_page: perPage,
                total: filtered.length,
                from: start + 1,
                to: Math.min(end, filtered.length),
                first_page_url: '',
                last_page_url: '',
                next_page_url: page < lastPage ? '' : null,
                prev_page_url: page > 1 ? '' : null,
                path: '',
            };
        } catch (error) {
            console.error('Error fetching rooms:', error);
            throw error;
        }
    };

    const table = useTable<Room>({
        fetchData: fetchRoomsData,
        initialPage: 1,
        initialPerPage: 10,
        initialSortBy: 'khoaHoc',
        initialSortDirection: 'desc',
    });

    // ============================================
    // HELPERS
    // ============================================
    const getMajorName = (room: Room): string => {
        // Prioritize major_name from API join
        if (room.major_name) {
            return room.major_name;
        }

        // Fallback to local mapping if needed
        const majorId = room.major_id || room.maNganhHoc;
        if (!majorId) return '-';

        // Try to find major by ID or code
        const major = majors.find(m =>
            m.id.toString() === majorId.toString() ||
            m.ma === majorId ||
            m.maNganh === majorId
        );

        if (major) {
            return major.tenNganhHoc || major.tenNganh || majorId;
        }

        return majorId;
    };

    const getAcademicYear = (room: Room): string => {
        // Prioritize nam_hoc from API join
        if (room.nam_hoc) {
            // Display single year (e.g., 2024)
            return room.nam_hoc.toString();
        }

        // Fallback for old data
        const year = room.khoaHoc_id || room.khoaHoc;
        if (!year) return '-';

        // If year looks like a full year (>= 2000), use it
        if (year >= 2000) {
            return year.toString();
        }

        // Otherwise it's probably a course ID, show as is
        return `Khóa ${year}`;
    };

    // ============================================
    // TABLE COLUMNS CONFIGURATION
    // ============================================
    const columns = useMemo(() => [
        {
            key: 'stt',
            label: 'STT',
            width: '60px',
            render: (_: Room, index: number) => (
                <span className="text-gray-900">
          {(table.meta.current_page - 1) * table.meta.per_page + index + 1}
        </span>
            ),
        },
        {
            key: 'id',
            label: 'ID',
            sortable: true,
            width: '80px',
            render: (item: Room) => (
                <span className="font-semibold text-blue-600">
          {item.id}
        </span>
            ),
        },
        {
            key: 'tenLop',
            label: 'Tên lớp',
            sortable: true,
            render: (item: Room) => (
                <div className="text-sm font-medium text-gray-900">
                    {item.tenLop || item.class_name || '-'}
                </div>
            ),
        },
        {
            key: 'khoaHoc',
            label: 'Năm học',
            sortable: true,
            width: '120px',
            render: (item: Room) => (
                <Badge variant="info">
                    {getAcademicYear(item)}
                </Badge>
            ),
        },
        {
            key: 'maNganhHoc',
            label: 'Ngành học',
            width: '200px',
            render: (item: Room) => (
                <div className="text-sm text-gray-700 font-medium">
                    {getMajorName(item)}
                </div>
            ),
        },
        {
            key: 'maTrinhDoDaoTao',
            label: 'Trình độ',
            width: '100px',
            render: (item: Room) => (
                <Badge variant="default">
                    {item.maTrinhDoDaoTao || '-'}
                </Badge>
            ),
        },
        {
            key: 'giaoVienChuNhiem',
            label: 'GVCN',
            render: (item: Room) => (
                <div className="text-sm text-gray-700">
                    {item.giaoVienChuNhiem || '-'}
                </div>
            ),
        },
        {
            key: 'soLuongHocVien',
            label: 'Sĩ số',
            width: '80px',
            render: (item: Room) => (
                <div className="text-center">
                    <div className="inline-flex items-center gap-1 text-sm">
                        <UserGroupIcon className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold text-gray-900">
              {item.phanLops?.length || 0}
            </span>
                    </div>
                </div>
            ),
        },
    ], [table.meta.current_page, table.meta.per_page, majors]);

    // ============================================
    // HANDLERS
    // ============================================
    const handleSearch = (searchTerm: string) => {
        table.handleSearch(searchTerm);
    };

    const handleClearSearch = () => {
        searchForm.reset();
        table.handleSearch('');
    };

    // ============================================
    // RENDER
    // ============================================
    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
                        <AcademicCapIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Danh sách lớp học</h1>
                        <p className="text-sm text-gray-500">Quản lý thông tin lớp học theo ngành và năm học</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="success"
                        onClick={() => setShowAddYearModal(true)}
                    >
                        <PlusCircleIcon className="w-5 h-5 mr-2" />
                        Thêm kỳ học
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => table.refresh()}
                        disabled={table.isLoading}
                    >
                        <ArrowPathIcon className={`w-5 h-5 mr-2 ${table.isLoading ? 'animate-spin' : ''}`} />
                        Làm mới
                    </Button>
                </div>
            </div>

            {/* Search & Filters */}
            <Card>
                <div className="p-4 space-y-4">
                    <div className="flex items-center gap-2 text-gray-700 font-semibold">
                        <FunnelIcon className="w-5 h-5" />
                        <span>Tìm kiếm & Lọc</span>
                    </div>

                    <form onSubmit={searchForm.handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search Input */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tìm kiếm lớp học
                            </label>
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Tìm theo tên lớp, GVCN, ngành học, năm học..."
                                    value={searchForm.values.search}
                                    onChange={(e) => searchForm.handleChange('search', e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            searchForm.handleSubmit();
                                        }
                                    }}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-end gap-2">
                            <Button
                                type="submit"
                                variant="primary"
                                className="flex-1"
                                disabled={table.isLoading}
                            >
                                <MagnifyingGlassIcon className="w-4 h-4 mr-1" />
                                Tìm kiếm
                            </Button>
                            {searchForm.values.search && (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleClearSearch}
                                >
                                    Xóa
                                </Button>
                            )}
                        </div>
                    </form>
                </div>
            </Card>

            {/* Error Message */}
            {table.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    ⚠️ {table.error.message}
                    <button
                        onClick={() => table.refresh()}
                        className="ml-4 underline hover:no-underline"
                    >
                        Thử lại
                    </button>
                </div>
            )}

            {/* Table Card */}
            <Card>
                <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Danh sách lớp học
                        </h2>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>Hiển thị:</span>
                            <select
                                value={table.meta.per_page}
                                onChange={(e) => table.handlePerPageChange(Number(e.target.value))}
                                className="border border-gray-300 rounded px-2 py-1"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            <span>/ trang</span>
                        </div>
                    </div>

                    {/* Table with UI component */}
                    <Table
                        columns={columns}
                        data={table.data}
                        isLoading={table.isLoading}
                        emptyMessage={
                            searchForm.values.search
                                ? `Không tìm thấy lớp học nào với từ khóa "${searchForm.values.search}"`
                                : 'Chưa có dữ liệu lớp học'
                        }
                        onSort={table.handleSort}
                        sortBy={table.sortBy}
                        sortDirection={table.sortDirection}
                        keyExtractor={(item) => item.id?.toString() || ''}
                    />

                    {/* Pagination */}
                    {!table.isLoading && table.data.length > 0 && (
                        <div className="flex justify-center mt-4">
                            <Pagination
                                currentPage={table.meta.current_page}
                                totalPages={table.meta.last_page}
                                onPageChange={table.handlePageChange}
                            />
                        </div>
                    )}
                </div>
            </Card>

            {/* Add Academic Year Modal */}
            {showAddYearModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <CalendarIcon className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Thêm kỳ học mới</h3>
                                    <p className="text-sm text-gray-500">Tạo năm học và các lớp cho ngành học</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={yearForm.handleSubmit} className="p-6 space-y-6">
                            {/* Year Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Năm học <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="number"
                                    min="2000"
                                    max="2100"
                                    value={yearForm.values.nam_hoc}
                                    onChange={(e) => yearForm.handleChange('nam_hoc', parseInt(e.target.value))}
                                    placeholder="VD: 2026"
                                    required
                                />
                                <p className="mt-1 text-sm text-gray-500">
                                    Năm học sẽ hiển thị là: <strong>{yearForm.values.nam_hoc}-{yearForm.values.nam_hoc + 1}</strong>
                                </p>
                            </div>

                            {/* Major Selection */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Chọn ngành học để tạo lớp <span className="text-red-500">*</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleSelectAllMajors}
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        {yearForm.values.selected_majors.length === majors.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                                    </button>
                                </div>

                                <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                                    {majors.length === 0 ? (
                                        <div className="p-4 text-center text-gray-500">
                                            Đang tải danh sách ngành...
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-100">
                                            {majors.map((major) => {
                                                const majorId = major.maNganh || major.id.toString();
                                                const isSelected = yearForm.values.selected_majors.includes(majorId);

                                                return (
                                                    <label
                                                        key={major.id}
                                                        className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                                                            isSelected ? 'bg-blue-50' : ''
                                                        }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => handleMajorToggle(majorId)}
                                                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-medium text-gray-900 text-sm">
                                                                {major.tenNganhHoc || major.tenNganh || major.ma}
                                                            </div>
                                                            {major.ma && (
                                                                <div className="text-xs text-gray-500">
                                                                    Mã: {major.ma}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {yearForm.values.selected_majors.length > 0 && (
                                    <p className="mt-2 text-sm text-green-600">
                                        ✓ Đã chọn {yearForm.values.selected_majors.length} ngành học
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => {
                                        setShowAddYearModal(false);
                                        yearForm.reset();
                                    }}
                                    disabled={isSubmitting}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={isSubmitting || yearForm.values.selected_majors.length === 0}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                                            Đang tạo lớp...
                                        </>
                                    ) : (
                                        <>
                                            <PlusCircleIcon className="w-4 h-4 mr-2" />
                                            Tạo {yearForm.values.selected_majors.length > 0 ? `${yearForm.values.selected_majors.length} lớp` : 'kỳ học'}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

