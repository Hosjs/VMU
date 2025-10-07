import { Outlet, Link, useLocation } from 'react-router';
import { useState } from 'react';
import { useAuth } from '~/contexts/AuthContext';

export default function ManagerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { title: 'Dashboard', icon: '📊', path: '/manager/dashboard' },
    { title: 'Đơn hàng', icon: '📦', path: '/manager/orders' },
    { title: 'Khách hàng', icon: '👥', path: '/manager/customers' },
    { title: 'Kho hàng', icon: '🏪', path: '/manager/inventory' },
    { title: 'Báo cáo', icon: '📈', path: '/manager/reports' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <aside className={`fixed left-0 top-0 h-full bg-gray-900 text-white transition-all duration-300 z-40 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold">QL</div>
            {sidebarOpen && <div><h1 className="font-bold text-lg">Quản lý</h1></div>}
          </div>
        </div>
        <nav className="p-4">
          {menuItems.map((item) => (
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
          ))}
        </nav>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute bottom-4 left-4 right-4 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg transition"
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>
      </aside>

      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Quản lý - {user?.name}</h2>
            <button
              onClick={() => logout()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Đăng xuất
            </button>
          </div>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

