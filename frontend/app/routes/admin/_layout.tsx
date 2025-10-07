import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { useState } from 'react';
import { useAuth } from '~/contexts/AuthContext';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      title: 'Dashboard',
      icon: '📊',
      path: '/admin/dashboard',
    },
    {
      title: 'Quản lý',
      items: [
        { title: 'Người dùng', icon: '👥', path: '/admin/users' },
        { title: 'Vai trò', icon: '🔐', path: '/admin/roles' },
        { title: 'Khách hàng', icon: '👤', path: '/admin/customers' },
        { title: 'Xe', icon: '🚗', path: '/admin/vehicles' },
      ],
    },
    {
      title: 'Yêu cầu & Đơn hàng',
      items: [
        { title: 'Yêu cầu dịch vụ', icon: '📝', path: '/admin/service-requests' },
        { title: 'Đơn hàng', icon: '📋', path: '/admin/orders' },
        { title: 'Quyết toán', icon: '💰', path: '/admin/settlements' },
      ],
    },
    {
      title: 'Dịch vụ & Sản phẩm',
      items: [
        { title: 'Dịch vụ', icon: '🔧', path: '/admin/services' },
        { title: 'Sản phẩm', icon: '📦', path: '/admin/products' },
        { title: 'Danh mục', icon: '📂', path: '/admin/categories' },
      ],
    },
    {
      title: 'Kho & Tồn kho',
      items: [
        { title: 'Kho hàng', icon: '🏪', path: '/admin/warehouses' },
        { title: 'Tồn kho', icon: '📊', path: '/admin/stocks' },
        { title: 'Chuyển kho', icon: '🔄', path: '/admin/stock-transfers' },
        { title: 'Bán trực tiếp', icon: '💵', path: '/admin/direct-sales' },
      ],
    },
    {
      title: 'Đối tác',
      items: [
        { title: 'Garage liên kết', icon: '🤝', path: '/admin/providers' },
        { title: 'Bàn giao xe', icon: '🚙', path: '/admin/vehicle-handovers' },
      ],
    },
    {
      title: 'Tài chính',
      items: [
        { title: 'Hóa đơn', icon: '🧾', path: '/admin/invoices' },
        { title: 'Thanh toán', icon: '💳', path: '/admin/payments' },
        { title: 'Báo cáo', icon: '📈', path: '/admin/reports' },
      ],
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-gray-900 text-white transition-all duration-300 z-40 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold">
              TT
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-lg">Thắng Trường</h1>
                <p className="text-xs text-gray-400">Admin Panel</p>
              </div>
            )}
          </div>
        </div>

        {/* Menu */}
        <nav className="p-4 overflow-y-auto h-[calc(100vh-200px)]">
          {menuItems.map((section, idx) => (
            <div key={idx} className="mb-6">
              {section.title && sidebarOpen && (
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2 px-2">
                  {section.title}
                </h3>
              )}

              {section.path ? (
                <Link
                  to={section.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                    location.pathname === section.path
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <span className="text-xl">{section.icon}</span>
                  {sidebarOpen && <span>{section.title}</span>}
                </Link>
              ) : (
                section.items?.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition mb-1 ${
                      location.pathname === item.path
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {sidebarOpen && <span className="text-sm">{item.title}</span>}
                  </Link>
                ))
              )}
            </div>
          ))}
        </nav>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute bottom-4 left-4 right-4 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg transition"
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top Bar */}
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                {menuItems
                  .flatMap((s) => s.items || [s])
                  .find((i) => i.path === location.pathname)?.title || 'Dashboard'}
              </h2>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-gray-800">
                🔔
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Menu */}
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-lg">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="text-sm">
                  <p className="font-semibold">{user?.name}</p>
                  <p className="text-xs text-gray-600">{user?.role?.display_name}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-2 text-red-600 hover:text-red-800"
                  title="Đăng xuất"
                >
                  🚪
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
