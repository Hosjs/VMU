import { useEffect, useState } from 'react';
import { Card } from '~/components/ui/Card';
import { Table } from '~/components/ui/Table';
import { Pagination } from '~/components/ui/Pagination';
import { Button } from '~/components/ui/Button';
import { Badge } from '~/components/ui/Badge';
import { useTable } from '~/hooks/useTable';
import type { AuthUser } from '~/types/auth';
import type { TableQueryParams } from '~/types/common';

export default function AdminUsers() {
  const [users, setUsers] = useState<AuthUser[]>([]);

  const {
    data,
    isLoading,
    page,
    perPage,
    total,
    sortBy,
    sortDirection,
    search,
    setPage,
    setPerPage,
    handleSort,
    handleSearch,
    loadData,
  } = useTable<AuthUser>(
    async (params: TableQueryParams) => {
      // Mock data - replace with actual API call
      return {
        data: [
          {
            id: 1,
            name: 'Admin User',
            email: 'admin@example.com',
            phone: '0987654321',
            role_id: 1,
            role: { id: 1, name: 'admin', display_name: 'Quản trị viên', permissions: [] },
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
        ],
        meta: {
          current_page: params.page || 1,
          from: 1,
          last_page: 5,
          per_page: params.per_page || 10,
          to: 10,
          total: 50,
        },
      };
    },
    { defaultPerPage: 10 }
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      width: '80px',
    },
    {
      key: 'name',
      label: 'Tên',
      sortable: true,
      render: (user: AuthUser) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Số điện thoại',
      render: (user: AuthUser) => user.phone || '-',
    },
    {
      key: 'role',
      label: 'Vai trò',
      render: (user: AuthUser) => (
        <Badge variant="info">{user.role?.display_name || '-'}</Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Ngày tạo',
      sortable: true,
      render: (user: AuthUser) => new Date(user.created_at).toLocaleDateString('vi-VN'),
    },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (user: AuthUser) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost">
            Sửa
          </Button>
          <Button size="sm" variant="danger">
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
        <p className="text-gray-600 mt-2">Danh sách tất cả người dùng trong hệ thống</p>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button variant="primary">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Thêm người dùng
          </Button>
        </div>

        <Table
          columns={columns}
          data={data}
          isLoading={isLoading}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={handleSort}
        />

        <Pagination
          currentPage={page}
          totalPages={Math.ceil(total / perPage)}
          onPageChange={setPage}
          perPage={perPage}
          onPerPageChange={setPerPage}
          total={total}
        />
      </Card>
    </div>
  );
}
