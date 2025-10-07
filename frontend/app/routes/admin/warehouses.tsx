import { useState } from 'react';
import { Card } from '~/components/ui/Card';
import { Badge } from '~/components/ui/Badge';
import { Button } from '~/components/ui/Button';

interface Warehouse {
  id: number;
  code: string;
  name: string;
  location: string;
  manager_name: string;
  capacity: number;
  current_stock: number;
  status: 'active' | 'inactive' | 'maintenance';
  phone?: string;
}

const statusConfig = {
  active: { label: 'Hoạt động', color: 'success' },
  inactive: { label: 'Ngừng hoạt động', color: 'danger' },
  maintenance: { label: 'Bảo trì', color: 'warning' },
} as const;

export default function Warehouses() {
  const [warehouses] = useState<Warehouse[]>([
    {
      id: 1,
      code: 'WH-001',
      name: 'Kho trung tâm',
      location: 'Quận 1, TP.HCM',
      manager_name: 'Nguyễn Văn A',
      capacity: 10000,
      current_stock: 7500,
      status: 'active',
      phone: '0901234567',
    },
    {
      id: 2,
      code: 'WH-002',
      name: 'Kho chi nhánh 1',
      location: 'Quận 7, TP.HCM',
      manager_name: 'Trần Thị B',
      capacity: 5000,
      current_stock: 3200,
      status: 'active',
      phone: '0902345678',
    },
    {
      id: 3,
      code: 'WH-003',
      name: 'Kho phụ tùng',
      location: 'Bình Thạnh, TP.HCM',
      manager_name: 'Lê Văn C',
      capacity: 3000,
      current_stock: 0,
      status: 'maintenance',
      phone: '0903456789',
    },
  ]);

  const calculateUsagePercent = (current: number, capacity: number) => {
    return Math.round((current / capacity) * 100);
  };

  const getUsageColor = (percent: number) => {
    if (percent >= 90) return 'text-red-600';
    if (percent >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý kho hàng</h1>
          <p className="text-gray-600 mt-1">Quản lý các kho hàng và vị trí lưu trữ</p>
        </div>
        <Button variant="primary">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm kho mới
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-blue-50 border-blue-200">
          <div className="text-sm text-blue-600 font-medium">Tổng kho</div>
          <div className="text-2xl font-bold text-blue-900 mt-1">3</div>
          <div className="text-xs text-blue-500 mt-1">Đang quản lý</div>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <div className="text-sm text-green-600 font-medium">Đang hoạt động</div>
          <div className="text-2xl font-bold text-green-900 mt-1">2</div>
          <div className="text-xs text-green-500 mt-1">66.7% tổng số</div>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <div className="text-sm text-yellow-600 font-medium">Tổng sức chứa</div>
          <div className="text-2xl font-bold text-yellow-900 mt-1">18,000</div>
          <div className="text-xs text-yellow-500 mt-1">Đơn vị sản phẩm</div>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <div className="text-sm text-purple-600 font-medium">Đang lưu trữ</div>
          <div className="text-2xl font-bold text-purple-900 mt-1">10,700</div>
          <div className="text-xs text-purple-500 mt-1">59.4% sức chứa</div>
        </Card>
      </div>

      {/* Warehouses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {warehouses.map((warehouse) => {
          const usagePercent = calculateUsagePercent(warehouse.current_stock, warehouse.capacity);
          return (
            <Card key={warehouse.id} className="hover:shadow-lg transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{warehouse.name}</h3>
                    <p className="text-sm text-gray-500">{warehouse.code}</p>
                  </div>
                  <Badge variant={statusConfig[warehouse.status].color as any}>
                    {statusConfig[warehouse.status].label}
                  </Badge>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {warehouse.location}
                </div>

                {/* Manager */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {warehouse.manager_name}
                </div>

                {/* Phone */}
                {warehouse.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {warehouse.phone}
                  </div>
                )}

                {/* Capacity Progress */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Sức chứa</span>
                    <span className={`text-sm font-bold ${getUsageColor(usagePercent)}`}>
                      {usagePercent}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${
                        usagePercent >= 90 ? 'bg-red-600' :
                        usagePercent >= 70 ? 'bg-yellow-600' :
                        'bg-green-600'
                      }`}
                      style={{ width: `${usagePercent}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{warehouse.current_stock.toLocaleString()} / {warehouse.capacity.toLocaleString()}</span>
                    <span>{warehouse.capacity - warehouse.current_stock} còn trống</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <Button variant="outline" size="sm" className="flex-1">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Xem
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Sửa
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add New Warehouse Card */}
      <Card className="mt-6 border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors cursor-pointer">
        <div className="p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Thêm kho hàng mới</h3>
          <p className="text-sm text-gray-500">Click để tạo kho hàng mới cho hệ thống</p>
        </div>
      </Card>
    </div>
  );
}

