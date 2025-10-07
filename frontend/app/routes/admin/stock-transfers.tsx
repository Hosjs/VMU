import { useState } from 'react';
import { Link } from 'react-router';
import { Card } from '~/components/ui/Card';
import { Badge } from '~/components/ui/Badge';
import { Button } from '~/components/ui/Button';

interface StockTransfer {
  id: number;
  transfer_number: string;
  from_warehouse: string;
  to_warehouse: string;
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled';
  items_count: number;
  total_value: number;
  requested_by: string;
  created_at: string;
  completed_at?: string;
}

const statusColors = {
  pending: 'warning',
  in_transit: 'info',
  completed: 'success',
  cancelled: 'danger',
} as const;

export default function StockTransfers() {
  const [transfers] = useState<StockTransfer[]>([
    {
      id: 1,
      transfer_number: 'TRF-2025-001',
      from_warehouse: 'Kho Việt Nga',
      to_warehouse: 'Garage Thành Đạt',
      status: 'in_transit',
      items_count: 12,
      total_value: 15000000,
      requested_by: 'Admin',
      created_at: '2025-10-05T10:00:00',
    },
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      pending: 'Chờ xử lý',
      in_transit: 'Đang chuyển',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy',
    };
    return map[status] || status;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chuyển kho</h1>
          <p className="text-gray-600 mt-1">Quản lý chuyển kho giữa các kho</p>
        </div>
        <Link to="/admin/stock-transfers/create">
          <Button variant="primary">
            <span className="mr-2">+</span>
            Tạo phiếu chuyển kho
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Tổng phiếu', value: '156', icon: '📋', color: 'bg-blue-100 text-blue-800' },
          { label: 'Chờ xử lý', value: '8', icon: '⏳', color: 'bg-yellow-100 text-yellow-800' },
          { label: 'Đang chuyển', value: '12', icon: '🚚', color: 'bg-purple-100 text-purple-800' },
          { label: 'Hoàn thành', value: '136', icon: '✅', color: 'bg-green-100 text-green-800' },
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Mã phiếu</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Từ kho</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Đến kho</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Số mặt hàng</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Giá trị</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Người tạo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Trạng thái</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {transfers.map((transfer) => (
                <tr key={transfer.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <Link
                      to={`/admin/stock-transfers/${transfer.id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {transfer.transfer_number}
                    </Link>
                    <p className="text-xs text-gray-500">
                      {new Date(transfer.created_at).toLocaleDateString('vi-VN')}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-gray-900">{transfer.from_warehouse}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-gray-900">{transfer.to_warehouse}</p>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="inline-flex items-center justify-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold">
                      {transfer.items_count}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(transfer.total_value)}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    {transfer.requested_by}
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={statusColors[transfer.status]}>
                      {getStatusText(transfer.status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Link to={`/admin/stock-transfers/${transfer.id}`}>
                        <Button size="sm" variant="ghost">
                          Xem
                        </Button>
                      </Link>
                      {transfer.status === 'pending' && (
                        <Button size="sm" variant="primary">
                          Duyệt
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

