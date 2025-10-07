import { Card } from '~/components/ui/Card';
import { Badge } from '~/components/ui/Badge';

export default function Debts() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const debts = [
    { id: 1, customer: 'Nguyễn Văn A', invoice: 'INV-2025-001', total: 15000000, paid: 7000000, remaining: 8000000, dueDate: '2025-10-20', overdue: false },
    { id: 2, customer: 'Trần Thị B', invoice: 'INV-2025-002', total: 8000000, paid: 3000000, remaining: 5000000, dueDate: '2025-10-05', overdue: true },
    { id: 3, customer: 'Lê Văn C', invoice: 'INV-2025-003', total: 12000000, paid: 0, remaining: 12000000, dueDate: '2025-10-25', overdue: false },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Công nợ phải thu</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {[
          { label: 'Tổng công nợ', value: formatCurrency(25000000), color: 'bg-yellow-100 text-yellow-800', icon: '📋' },
          { label: 'Quá hạn', value: formatCurrency(5000000), color: 'bg-red-100 text-red-800', icon: '⚠️' },
          { label: 'Trong hạn', value: formatCurrency(20000000), color: 'bg-green-100 text-green-800', icon: '✅' },
        ].map((stat) => (
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

      <Card title="Danh sách công nợ">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Khách hàng</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Hóa đơn</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Tổng tiền</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Đã trả</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Còn lại</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Hạn thanh toán</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Trạng thái</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {debts.map((debt) => (
                <tr key={debt.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{debt.customer}</td>
                  <td className="px-4 py-3 text-sm text-blue-600">{debt.invoice}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{formatCurrency(debt.total)}</td>
                  <td className="px-4 py-3 font-semibold text-green-600">{formatCurrency(debt.paid)}</td>
                  <td className="px-4 py-3 font-semibold text-red-600">{formatCurrency(debt.remaining)}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={debt.overdue ? 'text-red-600 font-semibold' : 'text-gray-700'}>
                      {new Date(debt.dueDate).toLocaleDateString('vi-VN')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={debt.overdue ? 'danger' : 'warning'}>
                      {debt.overdue ? 'Quá hạn' : 'Chưa trả'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                      Nhắc nợ
                    </button>
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
