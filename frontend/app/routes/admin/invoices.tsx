import { useState } from 'react';
import { Link } from 'react-router';
import { Card } from '~/components/ui/Card';
import { Badge } from '~/components/ui/Badge';
import { Button } from '~/components/ui/Button';

interface Invoice {
  id: number;
  invoice_number: string;
  customer_name: string;
  total_amount: number;
  paid_amount: number;
  status: 'draft' | 'pending' | 'paid' | 'partial' | 'overdue' | 'cancelled';
  issue_date: string;
  due_date: string;
  payment_method?: string;
}

const statusConfig = {
  draft: { label: 'Nháp', color: 'gray' },
  pending: { label: 'Chờ thanh toán', color: 'warning' },
  paid: { label: 'Đã thanh toán', color: 'success' },
  partial: { label: 'Thanh toán 1 phần', color: 'info' },
  overdue: { label: 'Quá hạn', color: 'danger' },
  cancelled: { label: 'Đã hủy', color: 'danger' },
} as const;

export default function Invoices() {
  const [invoices] = useState<Invoice[]>([
    {
      id: 1,
      invoice_number: 'INV-2025-001',
      customer_name: 'Nguyễn Văn A',
      total_amount: 7000000,
      paid_amount: 7000000,
      status: 'paid',
      issue_date: '2025-10-01',
      due_date: '2025-10-15',
      payment_method: 'Chuyển khoản',
    },
    {
      id: 2,
      invoice_number: 'INV-2025-002',
      customer_name: 'Trần Thị B',
      total_amount: 5500000,
      paid_amount: 3000000,
      status: 'partial',
      issue_date: '2025-10-03',
      due_date: '2025-10-17',
    },
    {
      id: 3,
      invoice_number: 'INV-2025-003',
      customer_name: 'Lê Văn C',
      total_amount: 9200000,
      paid_amount: 0,
      status: 'pending',
      issue_date: '2025-10-05',
      due_date: '2025-10-20',
    },
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý hóa đơn</h1>
          <p className="text-gray-600 mt-1">Quản lý hóa đơn bán hàng và thanh toán</p>
        </div>
        <Button variant="primary">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tạo hóa đơn mới
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-blue-50 border-blue-200">
          <div className="text-sm text-blue-600 font-medium">Tổng hóa đơn</div>
          <div className="text-2xl font-bold text-blue-900 mt-1">152</div>
          <div className="text-xs text-blue-500 mt-1">+12 so với tháng trước</div>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <div className="text-sm text-green-600 font-medium">Đã thanh toán</div>
          <div className="text-2xl font-bold text-green-900 mt-1">128</div>
          <div className="text-xs text-green-500 mt-1">84.2% tổng số</div>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <div className="text-sm text-yellow-600 font-medium">Chờ thanh toán</div>
          <div className="text-2xl font-bold text-yellow-900 mt-1">18</div>
          <div className="text-xs text-yellow-500 mt-1">11.8% tổng số</div>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <div className="text-sm text-red-600 font-medium">Quá hạn</div>
          <div className="text-2xl font-bold text-red-900 mt-1">6</div>
          <div className="text-xs text-red-500 mt-1">Cần xử lý gấp</div>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Tìm kiếm theo số hóa đơn, khách hàng..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select className="px-4 py-2 border border-gray-300 rounded-lg">
                <option value="">Tất cả trạng thái</option>
                <option value="paid">Đã thanh toán</option>
                <option value="pending">Chờ thanh toán</option>
                <option value="overdue">Quá hạn</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số hóa đơn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đã thanh toán
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày phát hành
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hạn thanh toán
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      to={`/admin/invoices/${invoice.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {invoice.invoice_number}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{invoice.customer_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatCurrency(invoice.total_amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatCurrency(invoice.paid_amount)}
                    </div>
                    {invoice.paid_amount < invoice.total_amount && (
                      <div className="text-xs text-red-600">
                        Còn nợ: {formatCurrency(invoice.total_amount - invoice.paid_amount)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={statusConfig[invoice.status].color as any}>
                      {statusConfig[invoice.status].label}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(invoice.issue_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(invoice.due_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button className="text-blue-600 hover:text-blue-900" title="Xem chi tiết">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button className="text-green-600 hover:text-green-900" title="In hóa đơn">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                      </button>
                      <button className="text-red-600 hover:text-red-900" title="Xóa">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Hiển thị <span className="font-medium">1</span> đến <span className="font-medium">3</span> trong tổng số{' '}
              <span className="font-medium">152</span> hóa đơn
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Trước
              </Button>
              <Button variant="outline" size="sm">
                Sau
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

