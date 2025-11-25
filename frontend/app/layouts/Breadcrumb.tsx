import { Link, useLocation } from 'react-router';
import { useMemo, useEffect, useState } from 'react';

export function Breadcrumb() {
  const location = useLocation();
  const [gradeContext, setGradeContext] = useState<any>(null);

  // Listen for custom event from grade-management page
  useEffect(() => {
    const handleGradeContext = (event: CustomEvent) => {
      setGradeContext(event.detail);
    };

    window.addEventListener('grade-context-update' as any, handleGradeContext);
    return () => {
      window.removeEventListener('grade-context-update' as any, handleGradeContext);
    };
  }, []);

  // Mapping path to readable names
  const pathNameMap: Record<string, string> = {
    // Admin routes
    'admin': 'Quản trị',
    'dashboard': 'Tổng quan',
    'users': 'Người dùng',
    'roles': 'Vai trò',
    'settings': 'Cài đặt',
    'management': 'Quản lý',
    'reports': 'Báo cáo',

    // Categories
    'categories': 'Danh mục',
    'training-levels': 'Trình độ đào tạo',
    'majors': 'Ngành học',
    'subjects': 'Môn học',
    'courses': 'Học phần',
    'course': 'Học phần',
    'classrooms': 'Phòng học',
    'rooms': 'Phòng học',

    // Students
    'students': 'Học viên',
    'student': 'Học viên',
    'list': 'Danh sách',
    'classes': 'Lớp học',
    'class-assignments': 'Phân lớp',
    'class-student': 'Học viên theo lớp',
    'class-students': 'Danh sách học viên',

    // Teachers/Lecturers
    'teachers': 'Giảng viên',
    'lecturer': 'Giảng viên',
    'lecturers': 'Giảng viên',
    'assignments': 'Phân công giảng dạy',
    'teaching-assignments': 'Phân công giảng dạy',
    'salaries': 'Lương giảng viên',

    // Training
    'training': 'Đào tạo',
    'semesters': 'Học kỳ',
    'registration-packages': 'Gói đăng ký',
    'course-registrations': 'Đăng ký học phần',
    'study-plans': 'Kế hoạch học tập',
    'schedules': 'Thời khóa biểu',
    'education-levels': 'Trình độ đào tạo',

    // Academic & Financial
    'grades': 'Quản lý điểm',
    'grade-management': 'Quản lý điểm',
    'transcripts': 'Bảng điểm',
    'certificates': 'Chứng chỉ',
    'financial': 'Tài chính',
    'tuition-fees': 'Học phí',
    'payments': 'Thanh toán',
    'invoices': 'Hóa đơn',

    // Common actions
    'create': 'Tạo mới',
    'edit': 'Chỉnh sửa',
    'view': 'Xem chi tiết',
    'detail': 'Chi tiết',
    'new': 'Tạo mới',
    'update': 'Cập nhật',
    'delete': 'Xóa',
  };

  // Generate breadcrumb items từ pathname
  const breadcrumbItems = useMemo(() => {
    const paths = location.pathname.split('/').filter(Boolean);

    if (paths.length === 0) {
      return [{ name: 'Trang chủ', path: '/' }];
    }

    // Special handling for grade management routes
    if (paths[0] === 'academic' && paths[1] === 'grades') {
      const items: any[] = [
        { name: 'Quản lý điểm', path: '/academic/grades', isNumeric: false },
      ];

      // Add major if present
      if (paths[2] && gradeContext?.major) {
        items.push({
          name: gradeContext.major.tenNganh || paths[2],
          path: `/academic/grades/${paths[2]}`,
          isNumeric: false,
        });
      }

      // Add class if present
      if (paths[3] && gradeContext?.class) {
        items.push({
          name: gradeContext.class.tenLop || `Lớp ${paths[3]}`,
          path: `/academic/grades/${paths[2]}/${paths[3]}`,
          isNumeric: false,
        });
      }

      // Add subject if present
      if (paths[4] && gradeContext?.subject) {
        items.push({
          name: gradeContext.subject.tenMon || `Môn ${paths[4]}`,
          path: `/academic/grades/${paths[2]}/${paths[3]}/${paths[4]}`,
          isNumeric: false,
        });
      }

      return items;
    }

    // Default breadcrumb generation
    const items = paths.map((path, index) => {
      const fullPath = '/' + paths.slice(0, index + 1).join('/');

      // Kiểm tra nếu là số (ID) thì bỏ qua hoặc thay bằng "Chi tiết"
      if (/^\d+$/.test(path)) {
        return {
          name: 'Chi tiết',
          path: fullPath,
          isNumeric: true,
        };
      }

      const name = pathNameMap[path] || path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');

      return {
        name,
        path: fullPath,
        isNumeric: false,
      };
    });

    return items;
  }, [location.pathname, gradeContext]);

  // Không hiển thị breadcrumb nếu chỉ có 1 item hoặc đang ở trang chủ
  if (breadcrumbItems.length <= 1 && location.pathname === '/') {
    return null;
  }

  return (
    <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3">
      <nav className="flex items-center space-x-2 text-sm" aria-label="Breadcrumb">
        {/* Home icon */}
        <Link
          to="/"
          className="text-gray-500 hover:text-blue-600 transition-colors"
          aria-label="Trang chủ"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </Link>

        {/* Breadcrumb items */}
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;

          return (
            <div key={item.path} className="flex items-center space-x-2">
              {/* Separator */}
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>

              {/* Link hoặc text nếu là item cuối */}
              {isLast ? (
                <span className="font-semibold text-blue-600">{item.name}</span>
              ) : (
                <Link
                  to={item.path}
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  {item.name}
                </Link>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
