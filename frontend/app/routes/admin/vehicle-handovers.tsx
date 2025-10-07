import { useState } from 'react';
import { Link } from 'react-router';
import { Card } from '~/components/ui/Card';
import { Badge } from '~/components/ui/Badge';
import { Button } from '~/components/ui/Button';

interface VehicleHandover {
  id: number;
  handover_number: string;
  order_number: string;
  customer_name: string;
  vehicle_info: string;
  partner_name: string;
  handover_date: string;
  expected_return_date: string;
  actual_return_date?: string;
  status: 'pending' | 'handed_over' | 'in_service' | 'returned' | 'completed';
  condition_notes?: string;
}

export default function VehicleHandovers() {
  const [handovers] = useState<VehicleHandover[]>([
    {
      id: 1,
      handover_number: 'HO-2025-001',
      order_number: 'ORD-2025-001',
      customer_name: 'Nguyễn Văn A',
      vehicle_info: 'Toyota Camry - 30A-12345',
      partner_name: 'Garage Việt Nga',
      handover_date: '2025-10-05T08:00:00',
      expected_return_date: '2025-10-07',
      status: 'in_service',
      condition_notes: 'Xe trong tình trạng tốt, không trầy xước',
    },
  ]);

  const statusColors = {
    pending: 'warning',
    handed_over: 'info',
    in_service: 'primary',
    returned: 'success',
    completed: 'success',
  } as const;

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      pending: 'Chờ bàn giao',
      handed_over: 'Đã bàn giao',
      in_service: 'Đang sửa chữa',
      returned: 'Đã trả xe',
      completed: 'Hoàn thành',
    };
    return map[status] || status;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bàn giao xe</h1>
          <p className="text-gray-600 mt-1">Quản lý bàn giao xe cho garage liên kết</p>
        </div>
        <Link to="/admin/vehicle-handovers/create">
          <Button variant="primary">
            <span className="mr-2">+</span>
            Tạo phiếu bàn giao
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Tổng bàn giao', value: '89', icon: '🚙', color: 'bg-blue-100 text-blue-800' },
          { label: 'Chờ bàn giao', value: '5', icon: '⏳', color: 'bg-yellow-100 text-yellow-800' },
          { label: 'Đang sửa', value: '12', icon: '🔧', color: 'bg-purple-100 text-purple-800' },
          { label: 'Đã trả xe', value: '72', icon: '✅', color: 'bg-green-100 text-green-800' },
        ].map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center text-2xl`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Mã BG</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Khách hàng</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Xe</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Garage</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ngày BG</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Dự kiến trả</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Trạng thái</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {handovers.map((handover) => (
                <tr key={handover.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <Link
                      to={`/admin/vehicle-handovers/${handover.id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {handover.handover_number}
                    </Link>
                    <p className="text-xs text-gray-500">
                      <Link to={`/admin/orders/${handover.order_number}`} className="hover:underline">
                        {handover.order_number}
                      </Link>
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-gray-900">{handover.customer_name}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-900">{handover.vehicle_info}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-gray-900">{handover.partner_name}</p>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {new Date(handover.handover_date).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {new Date(handover.expected_return_date).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={statusColors[handover.status]}>
                      {getStatusText(handover.status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Link to={`/admin/vehicle-handovers/${handover.id}`}>
                        <Button size="sm" variant="ghost">
                          Xem
                        </Button>
                      </Link>
                      {handover.status === 'in_service' && (
                        <Button size="sm" variant="success">
                          Trả xe
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

