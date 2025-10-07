import { Outlet, Link, useLocation } from 'react-router';
import { useState } from 'react';
import { useAuth } from '~/contexts/AuthContext';

export default function MechanicLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { title: 'Dashboard', icon: '📊', path: '/mechanic/dashboard' },
    { title: 'Công việc của tôi', icon: '🔧', path: '/mechanic/my-tasks' },
    { title: 'Lịch sử sửa chữa', icon: '📝', path: '/mechanic/repair-history' },
    { title: 'Kiểm tra xe', icon: '🚗', path: '/mechanic/inspections' },
    { title: 'Báo cáo', icon: '📋', path: '/mechanic/reports' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <aside className={`fixed left-0 top-0 h-full bg-gray-900 text-white transition-all duration-300 z-40 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center font-bold">TM</div>
            {sidebarOpen && <div><h1 className="font-bold text-lg">Thợ máy</h1></div>}
          </div>
        </div>
        <nav className="p-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition mb-1 ${
                location.pathname === item.path 
                  ? 'bg-orange-600 text-white' 
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
            <h2 className="text-xl font-semibold text-gray-800">Thợ máy - {user?.name}</h2>
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
