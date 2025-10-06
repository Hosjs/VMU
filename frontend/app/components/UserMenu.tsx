import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '~/contexts/AuthContext';
import type { AuthUser } from '~/types/auth';

interface UserMenuProps {
  user: AuthUser;
}

export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-purple-100 text-purple-800';
      case 'accountant':
        return 'bg-green-100 text-green-800';
      case 'mechanic':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
      >
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-md">
          {user.name.charAt(0).toUpperCase()}
        </div>

        {/* User Info - Hidden on mobile */}
        <div className="hidden md:block text-left">
          <p className="text-sm font-semibold text-gray-900">{user.name}</p>
          <p className="text-xs text-gray-500">{user.role?.display_name}</p>
        </div>

        {/* Dropdown Icon */}
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 animate-slide-in-down">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                <p className="text-sm text-gray-500 truncate">{user.email}</p>
                <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role?.name)}`}>
                  {user.role?.display_name}
                </span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              to="/profile"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition"
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Thông tin cá nhân</span>
            </Link>

            <Link
              to="/settings"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition"
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Cài đặt</span>
            </Link>

            {user.role?.name === 'admin' && (
              <Link
                to="/admin/users"
                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition"
                onClick={() => setIsOpen(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>Quản lý người dùng</span>
              </Link>
            )}
          </div>

          {/* Logout */}
          <div className="border-t border-gray-100 pt-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition w-full"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-medium">Đăng xuất</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
import { Link } from 'react-router';
import { useAuth } from '~/contexts/AuthContext';
import { UserMenu } from './UserMenu';
import { TruongThangLogo } from './TruongThangLogo';

export function Header() {
  const { isAuthenticated, user } = useAuth();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <TruongThangLogo className="h-10 w-auto" />
            <div className="hidden md:block">
              <h1 className="text-xl font-bold text-gray-900">Thắng Trường</h1>
              <p className="text-xs text-gray-600">Trung tâm dịch vụ ô tô</p>
            </div>
          </Link>

          {/* Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-blue-600 font-medium transition"
            >
              Trang chủ
            </Link>
            <Link
              to="/services"
              className="text-gray-700 hover:text-blue-600 font-medium transition"
            >
              Dịch vụ
            </Link>
            <Link
              to="/products"
              className="text-gray-700 hover:text-blue-600 font-medium transition"
            >
              Sản phẩm
            </Link>
            <Link
              to="/about"
              className="text-gray-700 hover:text-blue-600 font-medium transition"
            >
              Về chúng tôi
            </Link>
            <Link
              to="/contact"
              className="text-gray-700 hover:text-blue-600 font-medium transition"
            >
              Liên hệ
            </Link>
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <>
                {/* Dashboard Link - Based on Role */}
                <Link
                  to={getDashboardPath(user.role?.name)}
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <span className="font-medium">Quản lý</span>
                </Link>

                {/* User Menu */}
                <UserMenu user={user} />
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button className="lg:hidden p-2 text-gray-600 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}

function getDashboardPath(role?: string): string {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'manager':
      return '/manager/dashboard';
    case 'accountant':
      return '/accountant/dashboard';
    case 'mechanic':
      return '/mechanic/dashboard';
    case 'employee':
      return '/employee/dashboard';
    default:
      return '/dashboard';
  }
}

