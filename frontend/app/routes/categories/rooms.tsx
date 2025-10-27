import { useMemo } from 'react';
import { roomService } from '~/services/room.service';
import { useTable } from '~/hooks/useTable';
import { useForm } from '~/hooks/useForm';
import type { Room } from '~/types/room';
import type { TableQueryParams, PaginatedResponse } from '~/types/common';
import {
  AcademicCapIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { Card } from '~/components/ui/Card';
import { Badge } from '~/components/ui/Badge';
import { Table } from '~/components/ui/Table';
import { Pagination } from '~/components/ui/Pagination';

export function meta() {
  return [
    { title: "Danh sách phòng học - VMU Training" },
    { name: "description", content: "Quản lý thông tin phòng học/lớp học" },
  ];
}

export default function RoomPage() {
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
          {item.tenLop || '-'}
        </div>
      ),
    },
    {
      key: 'khoaHoc',
      label: 'Khóa học',
      sortable: true,
      width: '100px',
      render: (item: Room) => (
        <Badge variant="info">
          {item.khoaHoc}
        </Badge>
      ),
    },
    {
      key: 'maNganhHoc',
      label: 'Mã ngành',
      width: '120px',
      render: (item: Room) => (
        <span className="text-sm text-gray-600">
          {item.maNganhHoc || '-'}
        </span>
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
  ], [table.meta.current_page, table.meta.per_page]);

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
            <h1 className="text-2xl font-bold text-gray-900">Danh sách phòng học</h1>
            <p className="text-sm text-gray-500">Quản lý thông tin phòng học/lớp học</p>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={() => table.refresh()}
          disabled={table.isLoading}
        >
          <ArrowPathIcon className={`w-5 h-5 mr-2 ${table.isLoading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
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
                Tìm kiếm phòng học
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Tìm theo tên lớp, GVCN, mã ngành, khóa học..."
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
              Danh sách phòng học
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
                ? `Không tìm thấy phòng học nào với từ khóa "${searchForm.values.search}"`
                : 'Chưa có dữ liệu phòng học'
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
    </div>
  );
}

