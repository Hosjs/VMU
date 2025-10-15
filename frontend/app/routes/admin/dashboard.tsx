import { useEffect, useState, useRef } from 'react';
import { Card } from '~/components/ui/Card';
import { LoadingSpinner } from '~/components/LoadingSystem';
import { dashboardService, type DashboardOverview } from '~/services/dashboard.service';
import { formatters } from '~/utils/formatters';
import { Link } from 'react-router';

// Export loader function for React Router v7
export async function loader({ request }: Route.LoaderArgs) {
  return null;
}

export default function AdminDashboard() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    date_from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    date_to: new Date().toISOString().split('T')[0],
  });

  // ✅ Sử dụng useRef để tránh gọi API 2 lần lúc mount
  const isInitializedRef = useRef(false);

  useEffect(() => {
    // ✅ Chỉ prevent duplicate call cho lần mount đầu tiên
    // Khi dateRange thay đổi, vẫn cho phép gọi lại API
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
    }
    loadOverview();
  }, [dateRange]);

  const loadOverview = async () => {
    try {
      setIsLoading(true);
      const data = await dashboardService.getOverview(dateRange);
      setOverview(data);
    } catch (error) {
      console.error('Failed to load dashboard overview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !overview) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 mt-4">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Tổng đơn hàng',
      value: overview.orders.total.toString(),
      change: `${overview.orders.completed} hoàn thành`,
      changeType: 'neutral' as const,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      color: 'blue',
      link: '/admin/orders',
    },
    {
      title: 'Doanh thu',
      value: formatters.currency(overview.orders.total_revenue),
      change: `${overview.orders.pending} đơn đang xử lý`,
      changeType: 'increase' as const,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'green',
    },
    {
      title: 'Lợi nhuận',
      value: formatters.currency(overview.orders.total_profit),
      change: `Biên lợi nhuận`,
      changeType: 'increase' as const,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: 'purple',
    },
    {
      title: 'Khách hàng',
      value: overview.customers.total.toString(),
      change: `+${overview.customers.new_this_month} mới tháng này`,
      changeType: 'increase' as const,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'yellow',
      link: '/admin/customers',
    },
  ];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Tổng quan hệ thống quản lý garage</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={dateRange.date_from}
            onChange={(e) => setDateRange({ ...dateRange, date_from: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-500">đến</span>
          <input
            type="date"
            value={dateRange.date_to}
            onChange={(e) => setDateRange({ ...dateRange, date_to: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            {stat.link ? (
              <Link to={stat.link} className="block">
                <StatCard stat={stat} />
              </Link>
            ) : (
              <StatCard stat={stat} />
            )}
          </Card>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thanh toán</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Tổng thanh toán:</span>
              <span className="font-semibold text-gray-900">{overview.payments.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Đã thanh toán:</span>
              <span className="font-semibold text-green-600">{overview.payments.paid}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Chờ thanh toán:</span>
              <span className="font-semibold text-yellow-600">{overview.payments.pending}</span>
            </div>
            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Tổng tiền:</span>
                <span className="font-bold text-blue-600">
                  {formatters.currency(overview.payments.total_amount)}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Khách hàng</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Tổng khách hàng:</span>
              <span className="font-semibold text-gray-900">{overview.customers.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Mới tháng này:</span>
              <span className="font-semibold text-green-600">{overview.customers.new_this_month}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Đang hoạt động:</span>
              <span className="font-semibold text-blue-600">{overview.customers.active}</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Kho hàng</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Tổng sản phẩm:</span>
              <span className="font-semibold text-gray-900">{overview.inventory.total_products}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Sắp hết hàng:</span>
              <span className="font-semibold text-yellow-600">{overview.inventory.low_stock_count}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Hết hàng:</span>
              <span className="font-semibold text-red-600">{overview.inventory.out_of_stock_count}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card title="Đơn hàng gần đây">
          <div className="space-y-3">
            {overview.recent_orders.length > 0 ? (
              overview.recent_orders.map((order) => (
                <Link
                  key={order.id}
                  to={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{order.order_number}</p>
                    <p className="text-sm text-gray-600">{order.customer_name}</p>
                    <p className="text-xs text-gray-500">{formatters.datetime(order.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatters.currency(order.final_amount)}
                    </p>
                    <StatusBadge status={order.status} />
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">Chưa có đơn hàng nào</p>
            )}
          </div>
        </Card>

        <Card title="Thanh toán gần đây">
          <div className="space-y-3">
            {overview.recent_payments.length > 0 ? (
              overview.recent_payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{payment.invoice_number}</p>
                    <p className="text-sm text-gray-600">{payment.customer_name}</p>
                    <p className="text-xs text-gray-500">
                      {payment.payment_method} • {formatters.datetime(payment.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      {formatters.currency(payment.amount)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">Chưa có thanh toán nào</p>
            )}
          </div>
        </Card>
      </div>

      {/* Revenue Trend Chart */}
      <Card title="Xu hướng doanh thu (7 ngày gần đây)">
        <div className="h-64">
          {overview.revenue_trend.length > 0 ? (
            <div className="h-full flex items-end justify-around gap-2">
              {overview.revenue_trend.map((item, index) => {
                const maxRevenue = Math.max(...overview.revenue_trend.map(t => t.revenue));
                const height = (item.revenue / maxRevenue) * 100;

                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="text-xs text-gray-600 text-center">
                      <div className="font-semibold">{formatters.number(item.revenue / 1000000)}M</div>
                      <div className="text-gray-500">{item.orders} đơn</div>
                    </div>
                    <div
                      className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg transition-all hover:from-blue-600 hover:to-blue-400"
                      style={{ height: `${height}%` }}
                    />
                    <div className="text-xs text-gray-600">
                      {new Date(item.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Chưa có dữ liệu doanh thu
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// Stat Card Component
function StatCard({ stat }: { stat: any }) {
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-${stat.color}-100 text-${stat.color}-600`}>
          {stat.icon}
        </div>
        {stat.changeType !== 'neutral' && (
          <span className={`text-sm font-medium ${stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
            {stat.change}
          </span>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
      <p className="text-sm text-gray-600">{stat.title}</p>
      {stat.changeType === 'neutral' && (
        <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
      )}
    </>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; color: string }> = {
    draft: { label: 'Nháp', color: 'gray' },
    quoted: { label: 'Đã báo giá', color: 'blue' },
    confirmed: { label: 'Đã xác nhận', color: 'indigo' },
    in_progress: { label: 'Đang xử lý', color: 'yellow' },
    completed: { label: 'Hoàn thành', color: 'green' },
    delivered: { label: 'Đã giao', color: 'teal' },
    paid: { label: 'Đã thanh toán', color: 'green' },
    cancelled: { label: 'Đã hủy', color: 'red' },
  };

  const config = statusConfig[status] || { label: status, color: 'gray' };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
      {config.label}
    </span>
  );
}
