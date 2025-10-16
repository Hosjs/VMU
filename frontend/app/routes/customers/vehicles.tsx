/**
 * ============================================
 * VEHICLES PAGE
 * ============================================
 * Quản lý xe của khách hàng
 * Role: admin, manager, employee
 * Permissions: vehicles.view, vehicles.create, vehicles.edit, vehicles.delete
 */

import { useState, useEffect } from 'react';
import { usePermissions } from '~/hooks/usePermissions';
import { vehicleService } from '~/services';
import type { Vehicle } from '~/types/vehicle';
import type { PaginatedResponse } from '~/types/common';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, TruckIcon } from '@heroicons/react/24/outline';

export default function VehiclesPage() {
  const { hasPermission } = usePermissions();
  const [vehicles, setVehicles] = useState<PaginatedResponse<Vehicle> | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchVehicles();
  }, [currentPage, searchTerm]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await vehicleService.getVehicles({
        page: currentPage,
        per_page: 20,
        search: searchTerm
      });
      setVehicles(response);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa xe này?')) return;

    try {
      await vehicleService.deleteVehicle(id);
      fetchVehicles();
    } catch (error) {
      console.error('Failed to delete vehicle:', error);
      alert('Không thể xóa xe');
    }
  };

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
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <PlusIcon className="w-5 h-5 mr-2" />
            Thêm xe
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm biển số xe..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Biển số</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hãng xe</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dòng xe</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Năm SX</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Đang tải...
                </td>
              </tr>
            ) : vehicles?.data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              vehicles?.data.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <TruckIcon className="w-5 h-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">
                        {vehicle.license_plate}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {vehicle.brand}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {vehicle.model}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {vehicle.customer?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {vehicle.year || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      {hasPermission('vehicles.edit') && (
                        <button className="text-blue-600 hover:text-blue-900">
                          <PencilIcon className="w-5 h-5" />
                        </button>
                      )}
                      {hasPermission('vehicles.delete') && (
                        <button
                          onClick={() => handleDelete(vehicle.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {vehicles && vehicles.last_page > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Hiển thị <span className="font-medium">{vehicles.from}</span> đến{' '}
                <span className="font-medium">{vehicles.to}</span> trong{' '}
                <span className="font-medium">{vehicles.total}</span> kết quả
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded-md disabled:opacity-50"
                >
                  Trước
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(vehicles.last_page, prev + 1))}
                  disabled={currentPage === vehicles.last_page}
                  className="px-3 py-1 border rounded-md disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


