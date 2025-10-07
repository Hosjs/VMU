import { useState } from 'react';
import { Card } from '~/components/ui/Card';
import { Button } from '~/components/ui/Button';

export default function Reports() {
  const [dateRange, setDateRange] = useState({
    from: new Date().toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Báo cáo & Thống kê</h1>
        <p className="text-gray-600 mt-1">Báo cáo doanh thu và hiệu suất kinh doanh</p>
      </div>

      {/* Date Range Filter */}
      <Card className="mb-6">
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="mt-6">
            <Button variant="primary">Xem báo cáo</Button>
          </div>
          <div className="mt-6">
            <Button variant="secondary">📥 Xuất Excel</Button>
          </div>
        </div>
      </Card>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {[
          {
            label: 'Tổng doanh thu',
            value: formatCurrency(125000000),
            change: '+12.5%',
            icon: '💰',
            color: 'bg-blue-100 text-blue-800',
            changeColor: 'text-green-600'
          },
          {
            label: 'Chi phí quyết toán',
            value: formatCurrency(85000000),
            change: '+8.2%',
            icon: '💳',
            color: 'bg-red-100 text-red-800',
            changeColor: 'text-red-600'
          },
          {
            label: 'Lợi nhuận ròng',
            value: formatCurrency(40000000),
            change: '+18.3%',
            icon: '📈',
            color: 'bg-green-100 text-green-800',
            changeColor: 'text-green-600'
          },
          {
            label: 'Tỷ suất LN',
            value: '32%',
            change: '+2.1%',
            icon: '📊',
            color: 'bg-purple-100 text-purple-800',
            changeColor: 'text-green-600'
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-start justify-between mb-2">
              <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center text-2xl`}>
                {stat.icon}
              </div>
              <span className={`text-sm font-semibold ${stat.changeColor}`}>
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card title="Doanh thu theo tháng">
          <div className="h-80 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-4xl mb-2">📊</p>
              <p>Biểu đồ doanh thu</p>
              <p className="text-sm">(Tích hợp Chart.js hoặc Recharts)</p>
            </div>
          </div>
        </Card>

        <Card title="Phân bổ doanh thu theo nguồn">
          <div className="h-80 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-4xl mb-2">🥧</p>
              <p>Biểu đồ tròn</p>
              <p className="text-sm">(Dịch vụ vs Sản phẩm)</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card title="Top 5 Dịch vụ bán chạy">
          <div className="space-y-3">
            {[
              { name: 'Bảo dưỡng định kỳ', revenue: 25000000, count: 45 },
              { name: 'Thay má phanh', revenue: 18000000, count: 32 },
              { name: 'Thay nhớt', revenue: 15000000, count: 68 },
              { name: 'Kiểm tra tổng thể', revenue: 12000000, count: 28 },
              { name: 'Sửa hệ thống điện', revenue: 10000000, count: 15 },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.count} lượt</p>
                  </div>
                </div>
                <p className="font-bold text-green-600">{formatCurrency(item.revenue)}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Top 5 Sản phẩm bán chạy">
          <div className="space-y-3">
            {[
              { name: 'Lọc dầu Toyota', revenue: 8000000, count: 120 },
              { name: 'Má phanh Honda', revenue: 6500000, count: 45 },
              { name: 'Nhớt Shell 5W-30', revenue: 5500000, count: 85 },
              { name: 'Ắc quy GS 60Ah', revenue: 4800000, count: 28 },
              { name: 'Lốp Michelin 195/65', revenue: 4200000, count: 15 },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.count} sản phẩm</p>
                  </div>
                </div>
                <p className="font-bold text-green-600">{formatCurrency(item.revenue)}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Partner Performance */}
      <Card title="Hiệu suất đối tác">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Đối tác</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Đơn hàng</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Doanh thu</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Chi phí QT</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Lợi nhuận</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tỷ suất</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {[
                { name: 'Garage Việt Nga', orders: 45, revenue: 85000000, cost: 68000000 },
                { name: 'Garage Thành Đạt', orders: 32, cost: 45000000, revenue: 58000000 },
                { name: 'Garage Minh Phát', orders: 28, revenue: 42000000, cost: 34000000 },
              ].map((partner, index) => {
                const profit = partner.revenue - partner.cost;
                const margin = (profit / partner.revenue * 100).toFixed(1);
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-4 font-medium text-gray-900">{partner.name}</td>
                    <td className="px-4 py-4">{partner.orders}</td>
                    <td className="px-4 py-4 font-semibold text-blue-600">{formatCurrency(partner.revenue)}</td>
                    <td className="px-4 py-4 font-semibold text-red-600">{formatCurrency(partner.cost)}</td>
                    <td className="px-4 py-4 font-semibold text-green-600">{formatCurrency(profit)}</td>
                    <td className="px-4 py-4 font-semibold text-purple-600">{margin}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

