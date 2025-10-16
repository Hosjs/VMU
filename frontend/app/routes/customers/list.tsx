/**
 * ============================================
 * CUSTOMERS LIST PAGE
 * ============================================
 * Danh sách khách hàng với CRUD operations
 * Role: admin, manager, employee
 * Permissions: customers.view, customers.create, customers.edit, customers.delete
 */

import { useState } from 'react';
import { useAuth } from '~/contexts/AuthContext';
import { customerService } from '~/services';
import type { Customer } from '~/types/customer';
import { useTable } from '~/hooks/useTable';
import { Table } from '~/components/ui/Table';
import { Pagination } from '~/components/ui/Pagination';
import { Badge } from '~/components/ui/Badge';
import { Button } from '~/components/ui/Button';
import { PlusIcon, PencilIcon, TrashIcon, UserIcon } from '@heroicons/react/24/outline';

export default function CustomersList() {
  const { hasPermission } = useAuth();

  // ✅ SỬ DỤNG useTable hook
  const {
    data: customers,
    isLoading,
    meta,
    handlePageChange,
    handlePerPageChange,
    handleSort,
    handleSearch,
    refresh,
    sortBy,
    sortDirection,
  } = useTable<Customer>({
    fetchData: customerService.getCustomers,
    initialPerPage: 20,
    initialSortBy: 'created_at',
    initialSortDirection: 'desc',
  });

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa khách hàng này?')) return;

    try {
      await customerService.deleteCustomer(id);
      refresh(); // ✅ Refresh từ useTable
    } catch (error) {
      console.error('Failed to delete customer:', error);
      alert('Không thể xóa khách hàng');
    }
  };

  // ✅ Định nghĩa columns
  const columns = [
    {
      key: 'customer_code',
      label: 'Mã KH',
      sortable: true,
      render: (customer: Customer) => (
        <div className="flex items-center">
          <UserIcon className="w-5 h-5 text-gray-400 mr-2" />
          <span className="font-medium text-gray-900">
            {customer.customer_code || `KH-${customer.id}`}
          </span>
        </div>
      ),
    },
    {
      key: 'name',
      label: 'Tên khách hàng',
      sortable: true,
      render: (customer: Customer) => (
        <div>
          <div className="font-medium text-gray-900">{customer.name}</div>
          <div className="text-sm text-gray-500">{customer.phone}</div>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (customer: Customer) => customer.email || '-',
    },
    {
      key: 'address',
      label: 'Địa chỉ',
      render: (customer: Customer) => (
        <div className="max-w-xs truncate" title={customer.address}>
          {customer.address || '-'}
        </div>
      ),
    },
    {
      key: 'vehicles_count',
      label: 'Số xe',
      render: (customer: Customer) => (
        <Badge variant="info">{customer.vehicles_count || 0} xe</Badge>
      ),
    },
    {
      key: 'is_active',
      label: 'Trạng thái',
      render: (customer: Customer) => (
        <Badge variant={customer.is_active ? 'success' : 'danger'}>
          {customer.is_active ? 'Hoạt động' : 'Ngưng'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (customer: Customer) => (
        <div className="flex items-center space-x-2">
          {hasPermission('customers.edit') && (
            <button
              onClick={() => alert('Edit modal - coming soon')}
              className="text-blue-600 hover:text-blue-900"
              title="Sửa"
            >
              <PencilIcon className="w-5 h-5" />
            </button>
          )}
          {hasPermission('customers.delete') && (
            <button
              onClick={() => handleDelete(customer.id)}
              className="text-red-600 hover:text-red-900"
              title="Xóa"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  if (!hasPermission('customers.view')) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Bạn không có quyền truy cập trang này</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Danh sách Khách hàng</h1>
          <p className="text-gray-600 mt-1">Quản lý thông tin khách hàng</p>
        </div>
        {hasPermission('customers.create') && (
          <Button onClick={() => alert('Create modal - coming soon')}>
            <PlusIcon className="w-5 h-5 mr-2" />
            Thêm khách hàng
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <input
          type="text"
          placeholder="Tìm kiếm khách hàng..."
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table
          columns={columns}
          data={customers}
          isLoading={isLoading}
          onSort={handleSort}
          sortBy={sortBy}
          sortDirection={sortDirection}
          emptyMessage="Không có khách hàng nào"
        />

        {/* Pagination */}
        <Pagination
          currentPage={meta.current_page}
          totalPages={meta.last_page}
          onPageChange={handlePageChange}
          perPage={meta.per_page}
          onPerPageChange={handlePerPageChange}
          total={meta.total}
        />
      </div>
    </div>
  );
}
