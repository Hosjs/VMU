/**
 * ============================================
 * VEHICLES PAGE
 * ============================================
 * Quản lý xe của khách hàng
 * Role: admin, manager, employee
 * Permissions: vehicles.view, vehicles.create, vehicles.edit, vehicles.delete
 */

import { useState } from 'react';
import { useAuth } from '~/contexts/AuthContext';
import { vehicleService } from '~/services';
import type { Vehicle } from '~/types/vehicle';
import { useTable } from '~/hooks/useTable';
import { Table } from '~/components/ui/Table';
import { Pagination } from '~/components/ui/Pagination';
import { Button } from '~/components/ui/Button';
import { PlusIcon, PencilIcon, TrashIcon, TruckIcon } from '@heroicons/react/24/outline';

export default function VehiclesPage() {
  const { hasPermission } = useAuth();

  // ✅ SỬ DỤNG useTable hook
  const {
    data: vehicles,
    isLoading,
    meta,
    handlePageChange,
    handlePerPageChange,
    handleSort,
    handleSearch,
    refresh,
    sortBy,
    sortDirection,
  } = useTable<Vehicle>({
    fetchData: vehicleService.getVehicles,
    initialPerPage: 20,
    initialSortBy: 'created_at',
    initialSortDirection: 'desc',
  });

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa xe này?')) return;

    try {
      await vehicleService.deleteVehicle(id);
      refresh();
    } catch (error) {
      console.error('Failed to delete vehicle:', error);
      alert('Không thể xóa xe');
    }
  };

  // ✅ Định nghĩa columns
  const columns = [
    {
      key: 'license_plate',
      label: 'Biển số',
      sortable: true,
      render: (vehicle: Vehicle) => (
        <div className="flex items-center">
          <TruckIcon className="w-5 h-5 text-gray-400 mr-2" />
          <span className="text-sm font-medium text-gray-900">
            {vehicle.license_plate}
          </span>
        </div>
      ),
    },
    {
      key: 'brand',
      label: 'Hãng xe',
      render: (vehicle: Vehicle) => vehicle.brand?.name || '-',
    },
    {
      key: 'model',
      label: 'Dòng xe',
      render: (vehicle: Vehicle) => vehicle.model?.name || '-',
    },
    {
      key: 'customer',
      label: 'Khách hàng',
      render: (vehicle: Vehicle) => vehicle.customer?.name || '-',
    },
    {
      key: 'year',
      label: 'Năm SX',
      render: (vehicle: Vehicle) => vehicle.year || '-',
    },
    {
      key: 'color',
      label: 'Màu xe',
      render: (vehicle: Vehicle) => vehicle.color || '-',
    },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (vehicle: Vehicle) => (
        <div className="flex items-center space-x-2">
          {hasPermission('vehicles.edit') && (
            <button
              className="text-blue-600 hover:text-blue-900"
              title="Sửa"
            >
              <PencilIcon className="w-5 h-5" />
            </button>
          )}
          {hasPermission('vehicles.delete') && (
            <button
              onClick={() => handleDelete(vehicle.id)}
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

  if (!hasPermission('vehicles.view')) {
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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Xe</h1>
          <p className="text-gray-600 mt-1">Quản lý thông tin xe của khách hàng</p>
        </div>
        {hasPermission('vehicles.create') && (
          <Button>
            <PlusIcon className="w-5 h-5 mr-2" />
            Thêm xe
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <input
          type="text"
          placeholder="Tìm biển số xe..."
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table
          columns={columns}
          data={vehicles}
          isLoading={isLoading}
          onSort={handleSort}
          sortBy={sortBy}
          sortDirection={sortDirection}
          emptyMessage="Không có xe nào"
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
