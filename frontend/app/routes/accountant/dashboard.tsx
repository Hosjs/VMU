import { Card } from '~/components/ui/Card';
import { Badge } from '~/components/ui/Badge';

export default function AccountantDashboard() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const stats = [
    { label: 'Doanh thu tháng', value: formatCurrency(125000000), icon: '💰', color: 'bg-green-100 text-green-800' },
    { label: 'Chi phí tháng', value: formatCurrency(85000000), icon: '💳', color: 'bg-red-100 text-red-800' },
    { label: 'Lợi nhuận', value: formatCurrency(40000000), icon: '📈', color: 'bg-blue-100 text-blue-800' },
    { label: 'Công nợ', value: formatCurrency(15000000), icon: '⚠️', color: 'bg-yellow-100 text-yellow-800' },
  ];

  const pendingInvoices = [
    { id: 1, number: 'INV-2025-001', customer: 'Nguyễn Văn A', amount: 7000000, dueDate: '2025-10-10' },
    { id: 2, number: 'INV-2025-002', customer: 'Trần Thị B', amount: 5000000, dueDate: '2025-10-12' },
    { id: 3, number: 'INV-2025-003', customer: 'Lê Văn C', amount: 8500000, dueDate: '2025-10-15' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard Kế toán</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center text-2xl`}>{stat.icon}</div>
              <div>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Hóa đơn chưa thanh toán">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Số HĐ</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Khách hàng</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Số tiền</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Hạn TT</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pendingInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-blue-600">{invoice.number}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{invoice.customer}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(invoice.amount)}</td>
                    <td className="px-4 py-3 text-sm text-red-600">{new Date(invoice.dueDate).toLocaleDateString('vi-VN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card title="Quyết toán chờ duyệt">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">STL-2025-00{i}</p>
                  <p className="text-sm text-gray-600">Garage Việt Nga</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatCurrency(i * 10000000)}</p>
                  <Badge variant="warning">Chờ duyệt</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

