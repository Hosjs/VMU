import { Link, useLocation } from 'react-router';
import { useState, useMemo, useCallback } from 'react';
import type { AuthUser } from '~/types/auth';
import { useAuth } from '~/contexts/AuthContext';
import {
  HomeIcon,
  UsersIcon,
  AcademicCapIcon,
  BuildingLibraryIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
  ClipboardDocumentCheckIcon,
  BanknotesIcon,
  IdentificationIcon,
  PresentationChartBarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

interface MenuItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  badge?: string | number;
  badgeKey?: 'orders' | 'invoices' | 'service_requests' | 'work_orders' | 'notifications';
  requiredPermissions?: string[];
  requireAll?: boolean;
}

interface MenuGroup {
  title: string;
  icon: React.ReactNode;
  items: MenuItem[];
  requiredPermissions?: string[];
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser;
}

export function Sidebar({ isOpen, onClose, user }: SidebarProps) {
  const location = useLocation();
  const { hasAnyPermission } = useAuth();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['system', 'categories', 'students', 'teachers', 'training', 'academic']);

  const toggleGroup = useCallback((groupTitle: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupTitle)
        ? prev.filter(g => g !== groupTitle)
        : [...prev, groupTitle]
    );
  }, []);

  const menuGroups: (MenuItem | MenuGroup)[] = useMemo(() => [
    {
      title: 'Tổng quan',
      path: '/dashboard',
      icon: <HomeIcon className="w-5 h-5" />,
      requiredPermissions: ['dashboard.view'],
    },
    {
      title: 'Quản trị hệ thống',
      icon: <ShieldCheckIcon className="w-5 h-5" />,
      items: [
        {
          title: 'Người dùng',
          path: '/users/list',
          icon: <UsersIcon className="w-5 h-5" />,
          requiredPermissions: ['users.view'], // ❌ Manager không có
        },
        {
          title: 'Vai trò & Quyền',
          path: '/users/roles',
          icon: <ShieldCheckIcon className="w-5 h-5" />,
          requiredPermissions: ['roles.view'], // ❌ Manager không có
        },
      ],
    },
    {
      title: 'Danh mục',
      icon: <BuildingLibraryIcon className="w-5 h-5" />,
      items: [
        {
          title: 'Trình độ đào tạo',
          path: '/education_levels',
          icon: <AcademicCapIcon className="w-5 h-5" />,
          requiredPermissions: ['education_levels.view'],
        },
        {
          title: 'Ngành học',
          path: '/majors',
          icon: <BuildingLibraryIcon className="w-5 h-5" />,
          requiredPermissions: ['majors.view'],
        },
        {
          title: 'Khoá học',
          path: '/courses',
          icon: <BookOpenIcon className="w-5 h-5" />,
          requiredPermissions: ['courses.view'],
        },
      ],
    },
    {
      title: 'Học viên',
      icon: <UserGroupIcon className="w-5 h-5" />,
      items: [
        {
          title: 'Danh sách học viên',
          path: '/students',
          icon: <UserGroupIcon className="w-5 h-5" />,
          requiredPermissions: ['students.view'], // ✅ Manager có
        },
        {
          title: 'Phòng học',
          path: '/rooms',
          icon: <BuildingLibraryIcon className="w-5 h-5" />,
          requiredPermissions: ['classrooms.view'], // ✅ Manager có
        },
        {
          title: 'Phân lớp',
          path: '/class-assignments',
          icon: <ClipboardDocumentCheckIcon className="w-5 h-5" />,
          requiredPermissions: ['class_assignments.view'], // ✅ Manager có
        },
      ],
    },
    {
      title: 'Giảng viên',
      icon: <AcademicCapIcon className="w-5 h-5" />,
      items: [
        {
          title: 'Danh sách giảng viên',
          path: '/lecturers',
          icon: <AcademicCapIcon className="w-5 h-5" />,
          requiredPermissions: ['teachers.view'], // ✅ Manager có
        },
        {
          title: 'Hợp đồng giảng dạy',
          path: '/teachers/contracts',
          icon: <IdentificationIcon className="w-5 h-5" />,
          requiredPermissions: ['teaching_contracts.view'], // ❌ Manager không có
        },
        {
          title: 'Phân công giảng dạy',
          path: '/lecturer/assignments',
          icon: <ClipboardDocumentListIcon className="w-5 h-5" />,
          requiredPermissions: ['teaching_assignments.view'], // ✅ Manager có
        },
        {
          title: 'Lương giảng viên',
          path: '/teachers/salaries',
          icon: <BanknotesIcon className="w-5 h-5" />,
          requiredPermissions: ['teacher_salaries.view'], // ❌ Manager không có
        },
      ],
    },
    {
      title: 'Đào tạo',
      icon: <CalendarDaysIcon className="w-5 h-5" />,
      items: [
        {
          title: 'Học kỳ',
          path: '/training/semesters',
          icon: <CalendarDaysIcon className="w-5 h-5" />,
          requiredPermissions: ['semesters.view'], // ❌ Manager không có
        },
        {
          title: 'Gói đăng ký',
          path: '/training/registration-packages',
          icon: <DocumentTextIcon className="w-5 h-5" />,
          requiredPermissions: ['registration_packages.view'], // ❌ Manager không có
        },
        {
          title: 'Đăng ký học phần',
          path: '/training/course-registrations',
          icon: <ClipboardDocumentCheckIcon className="w-5 h-5" />,
          requiredPermissions: ['course_registrations.view'], // ❌ Manager không có
        },
        {
          title: 'Kế hoạch học tập',
          path: '/training/study-plans',
          icon: <ClipboardDocumentListIcon className="w-5 h-5" />,
          requiredPermissions: ['study_plans.view'], // ❌ Manager không có
        },
        {
          title: 'Thời khóa biểu',
          path: '/training/schedules',
          icon: <CalendarDaysIcon className="w-5 h-5" />,
          requiredPermissions: ['schedules.view'], // ✅ Manager có
        },
      ],
    },
    {
      title: 'Học tập & Tài chính',
      icon: <PresentationChartBarIcon className="w-5 h-5" />,
      items: [
        {
          title: 'Điểm học tập',
          path: '/academic/grades',
          icon: <PresentationChartBarIcon className="w-5 h-5" />,
          requiredPermissions: ['grades.view'], // ✅ Manager có (chỉ xem)
        },
        {
          title: 'Học phí',
          path: '/financial/tuition-fees',
          icon: <CurrencyDollarIcon className="w-5 h-5" />,
          requiredPermissions: ['tuition_fees.view'], // ❌ Manager không có
        },
      ],
    },
    {
      title: 'Báo cáo',
      path: '/reports/dashboard',
      icon: <ChartBarIcon className="w-5 h-5" />,
      requiredPermissions: ['reports.view'], // ✅ Manager có
    },
    {
      title: 'Cài đặt',
      path: '/admin/settings',
      icon: <Cog6ToothIcon className="w-5 h-5" />,
      requiredPermissions: ['settings.view'], // ❌ Manager không có
    },
  ], []);

  const visibleMenuGroups = useMemo(() => {
    return menuGroups.filter(item => {
      if ('items' in item) {
        // It's a group
        const visibleItems = item.items.filter(subItem => {
          if (!subItem.requiredPermissions || subItem.requiredPermissions.length === 0) {
            return true;
          }
          return hasAnyPermission(subItem.requiredPermissions);
        });
        return visibleItems.length > 0;
      } else {
        // It's a single item
        if (!item.requiredPermissions || item.requiredPermissions.length === 0) {
          return true;
        }
        return hasAnyPermission(item.requiredPermissions);
      }
    }).map(item => {
      if ('items' in item) {
        return {
          ...item,
          items: item.items.filter(subItem => {
            if (!subItem.requiredPermissions || subItem.requiredPermissions.length === 0) {
              return true;
            }
            return hasAnyPermission(subItem.requiredPermissions);
          }),
        };
      }
      return item;
    });
  }, [menuGroups, hasAnyPermission]);

  const handleMenuClick = useCallback(() => {
    onClose();
  }, [onClose]);

  const renderMenuItem = (item: MenuItem) => {
    const isActive = location.pathname === item.path;

    const handleClick = () => {
      // Debug log đã tắt
      // console.log('🖱️ [SIDEBAR] Menu clicked:', {
      //   title: item.title,
      //   path: item.path,
      //   currentPath: location.pathname,
      //   hasPermissions: item.requiredPermissions,
      // });
      handleMenuClick();
    };

    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={handleClick}
        className={`
          flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
          ${isActive 
            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/50 scale-[1.02]' 
            : 'text-gray-300 hover:bg-gray-800/70 hover:text-white hover:scale-[1.01]'
          }
        `}
      >
        <div className="flex items-center gap-3">
          {item.icon}
          <span className="font-medium text-sm">{item.title}</span>
        </div>
      </Link>
    );
  };

  const renderMenuGroup = (group: MenuGroup) => {
    const isExpanded = expandedGroups.includes(group.title.toLowerCase().replace(/\s+/g, '-'));
    const hasActiveItem = group.items.some(item => location.pathname === item.path);

    return (
      <div key={group.title}>
        <button
          onClick={() => toggleGroup(group.title.toLowerCase().replace(/\s+/g, '-'))}
          className={`
            w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
            ${hasActiveItem
              ? 'bg-gray-800/70 text-white'
              : 'text-gray-300 hover:bg-gray-800/70 hover:text-white'
            }
          `}
        >
          <div className="flex items-center gap-3">
            {group.icon}
            <span className="font-medium text-sm">{group.title}</span>
          </div>
          {isExpanded ? (
            <ChevronDownIcon className="w-4 h-4" />
          ) : (
            <ChevronRightIcon className="w-4 h-4" />
          )}
        </button>
        {isExpanded && (
          <div className="ml-4 mt-1 space-y-1">
            {group.items.map(item => renderMenuItem(item))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          bg-gradient-to-b from-gray-900 to-gray-800 text-white w-64 shadow-2xl
        `}
      >
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-700/50">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-lg shadow-lg">
            VMU
          </div>
          <div>
            <h1 className="font-bold text-lg">VMU Training</h1>
            <p className="text-xs text-gray-400">
              {user?.role?.display_name || 'System'}
            </p>
          </div>
        </div>

        <div className="px-4 py-4 mx-2 mt-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-base shadow-lg">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate text-sm">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email || ''}</p>
            </div>
          </div>
        </div>

        <nav className="px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 hover:scrollbar-thumb-gray-500" style={{ maxHeight: 'calc(100vh - 280px)' }}>
          {visibleMenuGroups.map((item) => {
            if ('items' in item) {
              return renderMenuGroup(item);
            } else {
              return renderMenuItem(item);
            }
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700/50 bg-gray-900/50">
          <div className="text-center">
            <p className="text-xs text-gray-500">Version 1.0.0</p>
            <p className="text-xs text-gray-600 mt-1">© 2025 Đại học Hàng Hải Việt Nam</p>
          </div>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-gray-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
}
