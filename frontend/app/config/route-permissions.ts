/**
 * Route Permissions Configuration
 * Định nghĩa permissions yêu cầu cho mỗi route
 *
 * Format:
 * - Single permission: "module.action"
 * - Multiple permissions (ANY): ["module.action1", "module.action2"]
 * - Multiple permissions (ALL): { permissions: [...], requireAll: true }
 */

export interface RoutePermissionConfig {
  /** Route path (match với routes.ts) */
  path: string;
  /** Permission(s) yêu cầu */
  permission: string | string[] | {
    permissions: string[];
    requireAll: boolean;
  };
  /** Custom message khi không có quyền */
  unauthorizedMessage?: string;
  /** Redirect path (default: /dashboard) */
  redirectTo?: string;
}

/**
 * ✅ DANH SÁCH PERMISSIONS CHO TẤT CẢ ROUTES
 * Sync với backend permissions và menu sidebar
 */
export const ROUTE_PERMISSIONS: Record<string, RoutePermissionConfig> = {
  // ==========================================
  // SYSTEM MANAGEMENT - QUẢN TRỊ HỆ THỐNG
  // ==========================================
  'users/user-managements': {
    path: '/users/user-managements',
    permission: 'users.view',
    unauthorizedMessage: 'Bạn không có quyền xem danh sách người dùng',
  },
  'users/roles': {
    path: '/users/roles',
    permission: 'roles.view',
    unauthorizedMessage: 'Bạn không có quyền xem danh sách vai trò',
  },
  'users/profile': {
    path: '/users/profile',
    permission: [], // Mọi user đã login đều có thể xem profile của mình
  },

  // ==========================================
  // STUDENT MANAGEMENT - QUẢN LÝ HỌC VIÊN
  // ==========================================
  'students': {
    path: '/students',
    permission: 'students.view',
    unauthorizedMessage: 'Bạn không có quyền xem danh sách học viên',
  },
  'rooms': {
    path: '/rooms',
    permission: 'classrooms.view',
    unauthorizedMessage: 'Bạn không có quyền xem danh sách phòng học',
  },
  'subject-management': {
    path: '/subject-management',
    permission: 'courses.view',
    unauthorizedMessage: 'Bạn không có quyền xem danh sách môn học',
  },

  // ==========================================
  // LECTURER MANAGEMENT - QUẢN LÝ GIẢNG VIÊN
  // ==========================================
  'lecturers': {
    path: '/lecturers',
    permission: 'teachers.view',
    unauthorizedMessage: 'Bạn không có quyền xem danh sách giảng viên',
  },
  'lecturer/assignments': {
    path: '/lecturer/assignments',
    permission: 'teaching_assignments.view',
    unauthorizedMessage: 'Bạn không có quyền xem lịch giảng dạy',
  },
  'teachers/salaries': {
    path: '/teachers/salaries',
    permission: 'teacher_salaries.view',
    unauthorizedMessage: 'Bạn không có quyền xem thông tin lương giảng viên',
  },

  // ==========================================
  // TRAINING MANAGEMENT - QUẢN LÝ ĐÀO TẠO
  // ==========================================
  'training/course-registrations': {
    path: '/training/course-registrations',
    permission: 'course_registrations.view',
    unauthorizedMessage: 'Bạn không có quyền xem đăng ký học phần',
  },
  'training/study-plans': {
    path: '/training/study-plans',
    permission: 'study_plans.view',
    unauthorizedMessage: 'Bạn không có quyền xem kế hoạch học tập',
  },
  'training/schedules': {
    path: '/training/schedules',
    permission: 'schedules.view',
    unauthorizedMessage: 'Bạn không có quyền xem thời khóa biểu',
  },

  // ==========================================
  // CATEGORIES - DANH MỤC
  // ==========================================
  'majors': {
    path: '/majors',
    permission: 'majors.view',
    unauthorizedMessage: 'Bạn không có quyền xem danh sách ngành học',
  },
  'education_levels': {
    path: '/education_levels',
    permission: 'training_levels.view',
    unauthorizedMessage: 'Bạn không có quyền xem trình độ đào tạo',
  },
  'courses': {
    path: '/courses',
    permission: 'courses.view',
    unauthorizedMessage: 'Bạn không có quyền xem danh sách khóa học',
  },

  // ==========================================
  // ACADEMIC - HỌC VỤ
  // ==========================================
  'academic/grades': {
    path: '/academic/grades',
    permission: 'grades.view',
    unauthorizedMessage: 'Bạn không có quyền xem điểm',
  },

  // ==========================================
  // REPORTS - BÁO CÁO
  // ==========================================
  'reports/dashboard': {
    path: '/reports/dashboard',
    permission: 'reports.view',
    unauthorizedMessage: 'Bạn không có quyền xem báo cáo',
  },

  // ==========================================
  // SETTINGS - CÀI ĐẶT
  // ==========================================
  'admin/settings': {
    path: '/admin/settings',
    permission: 'settings.view',
    unauthorizedMessage: 'Bạn không có quyền truy cập cài đặt hệ thống',
  },

  // ==========================================
  // DASHBOARD - Tất cả user đã login đều truy cập được
  // ==========================================
  'dashboard': {
    path: '/dashboard',
    permission: [], // No specific permission required, just authentication
  },
};

/**
 * Get permission config for a route
 */
export function getRoutePermission(routePath: string): RoutePermissionConfig | undefined {
  // Remove leading slash
  const normalizedPath = routePath.startsWith('/') ? routePath.slice(1) : routePath;

  // Find exact match first
  if (ROUTE_PERMISSIONS[normalizedPath]) {
    return ROUTE_PERMISSIONS[normalizedPath];
  }

  // Find wildcard match
  for (const [key, config] of Object.entries(ROUTE_PERMISSIONS)) {
    if (key.includes('*')) {
      const pattern = key.replace('*', '.*');
      const regex = new RegExp(`^${pattern}$`);
      if (regex.test(normalizedPath)) {
        return config;
      }
    }
  }

  return undefined;
}

/**
 * Check if route requires permission
 */
export function routeRequiresPermission(routePath: string): boolean {
  const config = getRoutePermission(routePath);
  if (!config) return false;

  if (Array.isArray(config.permission)) {
    return config.permission.length > 0;
  }

  if (typeof config.permission === 'object') {
    return config.permission.permissions.length > 0;
  }

  return config.permission !== '';
}

