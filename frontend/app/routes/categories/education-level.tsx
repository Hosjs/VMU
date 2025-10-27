import { useMemo } from 'react';
import { educationLevelService } from '~/services/education-level.service';
import { useTable } from '~/hooks/useTable';
import { useForm } from '~/hooks/useForm';
import type { EducationLevel } from '~/types/education-level';
import {
  AcademicCapIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { Card } from '~/components/ui/Card';
import { Badge } from '~/components/ui/Badge';
import { Table } from '~/components/ui/Table';
import { Pagination } from '~/components/ui/Pagination';

export function meta() {
  return [
    { title: "Danh sách trình độ đào tạo - VMU Training" },
    { name: "description", content: "Quản lý thông tin trình độ đào tạo" },
  ];
}

export default function EducationLevelPage() {
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
  const table = useTable<EducationLevel>({
    fetchData: educationLevelService.getList.bind(educationLevelService),
    initialPage: 1,
    initialPerPage: 10,
    initialSortBy: 'maTrinhDoDaoTao',
    initialSortDirection: 'asc',
  });

  // ============================================
  // TABLE COLUMNS CONFIGURATION
  // ============================================
  const columns = useMemo(() => [
    {
      key: 'stt',
      label: 'STT',
      width: '60px',
      render: (_: EducationLevel, index: number) => (
        <span className="text-gray-900">
          {(table.meta.current_page - 1) * table.meta.per_page + index + 1}
        </span>
      ),
    },
    {
      key: 'maTrinhDoDaoTao',
      label: 'Mã trình độ',
      sortable: true,
      width: '120px',
      render: (item: EducationLevel) => (
        <span className="font-semibold text-blue-600">
          {item.maTrinhDoDaoTao}
        </span>
      ),
    },
    {
      key: 'tenTrinhDo',
      label: 'Tên trình độ',
      sortable: true,
      render: (item: EducationLevel) => (
        <div className="text-sm font-medium text-gray-900">
          {item.tenTrinhDo}
        </div>
      ),
    },
    {
      key: 'moTa',
      label: 'Mô tả',
      render: (item: EducationLevel) => (
        <div className="text-sm text-gray-600 max-w-md truncate">
          {item.moTa || '-'}
        </div>
      ),
    },
    {
      key: 'trangThai',
      label: 'Trạng thái',
      width: '120px',
      render: (item: EducationLevel) => (
        <div className="flex items-center justify-center">
          {item.trangThai ? (
            <Badge variant="success">
              <span className="inline-flex items-center gap-1">
                <CheckCircleIcon className="w-4 h-4" />
                Hoạt động
              </span>
            </Badge>
          ) : (
            <Badge variant="default">
              <span className="inline-flex items-center gap-1">
                <XCircleIcon className="w-4 h-4" />
                Ngừng
              </span>
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'created_at',
      label: 'Ngày tạo',
      sortable: true,
      width: '150px',
      render: (item: EducationLevel) => (
        <div className="text-sm text-gray-600">
          {item.created_at ? new Date(item.created_at).toLocaleDateString('vi-VN') : '-'}
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
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <AcademicCapIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Danh sách trình độ đào tạo</h1>
            <p className="text-sm text-gray-500">Quản lý thông tin trình độ đào tạo từ database</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
                Tìm kiếm trình độ đào tạo
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Tìm theo mã, tên trình độ, mô tả..."
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600 mb-1">Tổng số trình độ</div>
            <div className="text-2xl font-bold text-indigo-600">{table.meta.total || 0}</div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600 mb-1">Hiển thị</div>
            <div className="text-2xl font-bold text-blue-600">
              {table.meta.from || 0} - {table.meta.to || 0}
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600 mb-1">Trang hiện tại</div>
            <div className="text-2xl font-bold text-purple-600">
              {table.meta.current_page} / {table.meta.last_page}
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600 mb-1">Trạng thái</div>
            <div className="text-lg font-semibold text-gray-700">
              {table.isLoading ? (
                <span className="text-yellow-600">Đang tải...</span>
              ) : (
                <span className="text-green-600">✓ Đã tải</span>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Table Card */}
      <Card>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Danh sách trình độ đào tạo
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
                ? `Không tìm thấy trình độ đào tạo nào với từ khóa "${searchForm.values.search}"`
                : 'Chưa có dữ liệu trình độ đào tạo'
            }
            onSort={table.handleSort}
            sortBy={table.sortBy}
            sortDirection={table.sortDirection}
            keyExtractor={(item) => item.maTrinhDoDaoTao}
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
