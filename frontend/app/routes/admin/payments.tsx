import { useState } from 'react';
import { Link } from 'react-router';
import { Card } from '~/components/ui/Card';
import { Badge } from '~/components/ui/Badge';
import { Button } from '~/components/ui/Button';

interface Payment {
  id: number;
  payment_number: string;
  invoice_number: string;
  customer_name: string;
  amount: number;
  payment_method: 'cash' | 'transfer' | 'card';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_date: string;
  reference_number?: string;
  notes?: string;
}

export default function Payments() {
  const [payments] = useState<Payment[]>([
    {
      id: 1,
      payment_number: 'PAY-2025-001',
      invoice_number: 'INV-2025-001',
      customer_name: 'Nguyễn Văn A',
      amount: 7000000,
      payment_method: 'transfer',
      status: 'completed',
      payment_date: '2025-10-05T14:30:00',
      reference_number: 'TRF123456789',
    },
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getMethodText = (method: string) => {
    const map: Record<string, string> = {
      cash: 'Tiền mặt',
      transfer: 'Chuyển khoản',
      card: 'Thẻ',
    };
    return map[method] || method;
  };

  const statusColors = {
    pending: 'warning',
    completed: 'success',
    failed: 'danger',
    refunded: 'info',
  } as const;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Thanh toán</h1>
          <p className="text-gray-600 mt-1">Quản lý các giao dịch thanh toán</p>
        </div>
        <Link to="/admin/payments/create">
          <Button variant="primary">
            <span className="mr-2">+</span>
            Ghi nhận thanh toán
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Tổng thu', value: '₫125M', icon: '💰', color: 'bg-green-100 text-green-800' },
          { label: 'Hôm nay', value: '₫8.5M', icon: '📅', color: 'bg-blue-100 text-blue-800' },
          { label: 'Chờ xác nhận', value: '₫3.2M', icon: '⏳', color: 'bg-yellow-100 text-yellow-800' },
          { label: 'Hoàn tiền', value: '₫500K', icon: '↩️', color: 'bg-red-100 text-red-800' },
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Mã TT</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Hóa đơn</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Khách hàng</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Số tiền</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Phương thức</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ngày TT</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Trạng thái</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <Link
                      to={`/admin/payments/${payment.id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {payment.payment_number}
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      to={`/admin/invoices/${payment.invoice_number}`}
                      className="text-blue-600 hover:underline"
                    >
                      {payment.invoice_number}
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-gray-900">{payment.customer_name}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-bold text-green-600">
                      {formatCurrency(payment.amount)}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant="info">{getMethodText(payment.payment_method)}</Badge>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {new Date(payment.payment_date).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={statusColors[payment.status]}>
                      {payment.status === 'completed' ? 'Thành công' : payment.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <Link to={`/admin/payments/${payment.id}`}>
                      <Button size="sm" variant="ghost">
                        Xem
                      </Button>
                    </Link>
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
