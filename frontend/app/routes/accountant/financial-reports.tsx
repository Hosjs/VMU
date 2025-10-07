import { Card } from '~/components/ui/Card';
import { Badge } from '~/components/ui/Badge';

export default function FinancialReports() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const monthlyData = [
    { month: 'Tháng 10', revenue: 125000000, cost: 85000000, profit: 40000000 },
    { month: 'Tháng 9', revenue: 118000000, cost: 82000000, profit: 36000000 },
    { month: 'Tháng 8', revenue: 132000000, cost: 88000000, profit: 44000000 },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Báo cáo tài chính</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {[
          { label: 'Doanh thu tháng', value: formatCurrency(125000000), color: 'bg-green-100 text-green-800', icon: '💰' },
          { label: 'Chi phí tháng', value: formatCurrency(85000000), color: 'bg-red-100 text-red-800', icon: '💳' },
          { label: 'Lợi nhuận tháng', value: formatCurrency(40000000), color: 'bg-blue-100 text-blue-800', icon: '📈' },
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

      <Card title="Báo cáo theo tháng">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Tháng</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Doanh thu</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Chi phí</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Lợi nhuận</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Tỷ suất LN</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {monthlyData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{row.month}</td>
                  <td className="px-4 py-3 font-semibold text-green-600">{formatCurrency(row.revenue)}</td>
                  <td className="px-4 py-3 font-semibold text-red-600">{formatCurrency(row.cost)}</td>
                  <td className="px-4 py-3 font-semibold text-blue-600">{formatCurrency(row.profit)}</td>
                  <td className="px-4 py-3">
                    <Badge variant="success">{((row.profit / row.revenue) * 100).toFixed(1)}%</Badge>
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

