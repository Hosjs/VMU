/**
 * Permission Management Utilities
 * Xử lý kiểm tra quyền hạn của user dựa trên role v�� permissions
 */

import type { AuthUser, Role } from '~/types/auth';

/**
 * Định nghĩa cấu trúc permissions
 */
export interface Permission {
  module: string;
  actions: string[];
}

export type PermissionMap = Record<string, string[]>;

/**
 * ✅ Danh sách tất cả MODULES trong hệ thống (sync với backend)
 * Cập nhật theo PermissionModuleSeeder.php và StudentPermissionSeeder.php
 */
export const AVAILABLE_PERMISSIONS: PermissionMap = {
  // QUẢN TRỊ HỆ THỐNG
  dashboard: ['view', 'view_statistics'],
  users: ['view', 'create', 'edit', 'delete', 'view_salary', 'edit_salary'],
  roles: ['view', 'create', 'edit', 'delete', 'assign_permissions'],
  permissions: ['view', 'edit', 'assign_user'],
  settings: ['view', 'edit'],

  // QUẢN LÝ ĐÀO TẠO - EDUCATION MANAGEMENT
  students: ['view', 'create', 'edit', 'delete', 'export'],
  classes: ['view', 'create', 'edit', 'delete'],
  class_assignments: ['view', 'create', 'edit', 'delete'],
  teachers: ['view', 'create', 'edit', 'delete'],
  teaching_assignments: ['view', 'create', 'edit', 'delete'],
  teacher_salaries: ['view', 'create', 'edit', 'delete', 'approve'],
  courses: ['view', 'create', 'edit', 'delete'],
  training_levels: ['view', 'create', 'edit', 'delete'],
  majors: ['view', 'create', 'edit', 'delete'],
  classrooms: ['view', 'create', 'edit', 'delete'],
  semesters: ['view', 'create', 'edit', 'delete'],
  registration_packages: ['view', 'create', 'edit', 'delete'],
  course_registrations: ['view', 'create', 'edit', 'delete', 'approve'],
  study_plans: ['view', 'create', 'edit', 'delete'],
  schedules: ['view', 'create', 'edit', 'delete'],
  grades: ['view', 'create', 'edit', 'delete', 'approve'],
  tuition_fees: ['view', 'create', 'edit', 'delete', 'approve'],

  // KHÁCH HÀNG
  customers: ['view', 'create', 'edit', 'delete', 'export'],

  // PHƯƠNG TIỆN
  vehicles: ['view', 'create', 'edit', 'delete', 'view_history'],
  vehicle_brands: ['view', 'create', 'edit', 'delete'],
  vehicle_models: ['view', 'create', 'edit', 'delete'],
  vehicle_inspections: ['view', 'create', 'edit', 'delete'],

  // DỊCH VỤ
  service_requests: ['view', 'create', 'edit', 'delete', 'assign', 'approve', 'cancel', 'complete'],
  services: ['view', 'create', 'edit', 'delete'],
  warranties: ['view', 'create', 'edit', 'delete', 'activate'],

  // ĐỐI TÁC
  partner_quotes: ['view', 'create', 'edit', 'delete', 'approve'],
  partner_vehicle_handovers: ['view', 'create', 'edit', 'delete', 'confirm'],

  // BÁN HÀNG
  orders: ['view', 'create', 'edit', 'delete', 'approve', 'cancel', 'export'],
  direct_sales: ['view', 'create', 'edit', 'delete'],

  // TÀI CHÍNH
  invoices: ['view', 'create', 'edit', 'delete', 'approve', 'export', 'send_email'],
  payments: ['view', 'create', 'edit', 'delete', 'approve', 'refund'],
  settlements: ['view', 'create', 'edit', 'delete', 'approve'],

  // SẢN PHẨM & KHO
  products: ['view', 'create', 'edit', 'delete', 'view_cost', 'edit_price'],
  categories: ['view', 'create', 'edit', 'delete'],
  warehouses: ['view', 'create', 'edit', 'delete', 'view_stock', 'adjust_stock'],
  stock_transfers: ['view', 'create', 'edit', 'delete', 'approve', 'receive'],
  stock_movements: ['view', 'export'],
  providers: ['view', 'create', 'edit', 'delete'],

  // BÁO CÁO
  reports: ['view', 'view_revenue', 'view_profit', 'view_inventory', 'export'],

  // THÔNG BÁO
  notifications: ['view', 'create', 'delete', 'mark_read'],
};

/**
 * Parse permissions từ role hoặc user
 * Backend trả về permissions dưới dạng JSON object
 * Format: {"users": ["view", "create"], "orders": ["view"]}
 */
export function parsePermissions(role: Role | null | undefined): PermissionMap {
  if (!role) return {};

  // Nếu permissions là string, parse JSON
  if (typeof role.permissions === 'string') {
    try {
      return JSON.parse(role.permissions);
    } catch {
      return {};
    }
  }

  // Nếu permissions là object, return trực tiếp
  if (role.permissions && typeof role.permissions === 'object') {
    // Nếu là array (old format), convert sang object
    if (Array.isArray(role.permissions)) {
      return {};
    }
    return role.permissions as PermissionMap;
  }

  return {};
}

/**
 * ✅ Lấy ALL PERMISSIONS của user (Role + Custom Permissions)
 * Backend đã xử lý merge logic, frontend chỉ cần lấy từ API
 */
export function getEffectivePermissions(user: AuthUser | null): PermissionMap {
  if (!user) return {};

  // Admin có full quyền
  if (user.role?.name === 'admin') {
    return AVAILABLE_PERMISSIONS;
  }

  // ✅ Nếu user có all_permissions từ API (đã merge sẵn)
  if (user.all_permissions) {
    return user.all_permissions;
  }

  // Fallback: Lấy từ role permissions
  const rolePermissions = parsePermissions(user.role);

  // Merge với custom_permissions nếu có
  if (user.custom_permissions && Object.keys(user.custom_permissions).length > 0) {
    const merged = { ...rolePermissions };

    // Merge custom permissions (thêm vào existing permissions)
    Object.keys(user.custom_permissions).forEach(module => {
      const customActions = user.custom_permissions![module];
      if (merged[module]) {
        // Merge với existing
        merged[module] = Array.from(new Set([...merged[module], ...customActions]));
      } else {
        // Thêm mới
        merged[module] = customActions;
      }
    });

    return merged;
  }

  return rolePermissions;
}

/**
 * ✅ Kiểm tra quyền theo format mới: module.action
 * VD: hasPermission(user, "users", "create") hoặc hasPermission(user, "users.create")
 */
export function hasPermission(user: AuthUser | null, moduleOrPermission: string, action?: string): boolean {
  if (!user || !user.role) return false;

  // Admin có full quyền
  if (user.role.name === 'admin') return true;

  let module: string;
  let targetAction: string;

  // Support cả 2 format: hasPermission(user, "users", "create") hoặc hasPermission(user, "users.create")
  if (action) {
    module = moduleOrPermission;
    targetAction = action;
  } else {
    const parts = moduleOrPermission.split('.');
    if (parts.length !== 2) return false;
    [module, targetAction] = parts;
  }

  // Sử dụng effective permissions (đã merge)
  const permissions = getEffectivePermissions(user);
  const modulePermissions = permissions[module];

  if (!modulePermissions || !Array.isArray(modulePermissions)) return false;

  return modulePermissions.includes(targetAction);
}

/**
 * Kiểm tra user có bất kỳ quyền nào trong danh sách
 *
 * @param user - User object
 * @param permissions - Array of permission strings
 * @returns boolean
 */
export function hasAnyPermission(user: AuthUser | null, permissions: string[]): boolean {
  if (!user) return false;
  if (user.role?.name === 'admin') return true;

  return permissions.some(permission => hasPermission(user, permission));
}

/**
 * Kiểm tra user có tất cả quyền trong danh sách
 *
 * @param user - User object
 * @param permissions - Array of permission strings
 * @returns boolean
 */
export function hasAllPermissions(user: AuthUser | null, permissions: string[]): boolean {
  if (!user) return false;
  if (user.role?.name === 'admin') return true;

  return permissions.every(permission => hasPermission(user, permission));
}

/**
 * Kiểm tra user có quyền truy cập module
 * (có ít nhất 1 action trong module)
 *
 * @param user - User object
 * @param module - Module name (vd: "users", "orders")
 * @returns boolean
 */
export function canAccessModule(user: AuthUser | null, module: string): boolean {
  if (!user || !user.role) return false;
  if (user.role.name === 'admin') return true;

  const permissions = parsePermissions(user.role);
  const modulePermissions = permissions[module];

  return modulePermissions && Array.isArray(modulePermissions) && modulePermissions.length > 0;
}

/**
 * Lấy tất cả permissions của user
 *
 * @param user - User object
 * @returns PermissionMap
 */
export function getUserPermissions(user: AuthUser | null): PermissionMap {
  if (!user || !user.role) return {};

  // Admin có full quyền
  if (user.role.name === 'admin') {
    return AVAILABLE_PERMISSIONS;
  }

  // Sử dụng effective permissions (đã merge custom_permissions)
  return getEffectivePermissions(user);
}

/**
 * Lấy danh sách modules mà user có quyền truy cập
 *
 * @param user - User object
 * @returns Array of module names
 */
export function getAccessibleModules(user: AuthUser | null): string[] {
  if (!user || !user.role) return [];

  if (user.role.name === 'admin') {
    return Object.keys(AVAILABLE_PERMISSIONS);
  }

  // Sử dụng effective permissions (đã merge custom_permissions)
  const permissions = getEffectivePermissions(user);
  return Object.keys(permissions).filter(module => {
    const actions = permissions[module];
    return actions && Array.isArray(actions) && actions.length > 0;
  });
}

/**
 * Kiểm tra user có phải admin không
 *
 * @param user - User object
 * @returns boolean
 */
export function isAdmin(user: AuthUser | null): boolean {
  return user?.role?.name === 'admin';
}

/**
 * Kiểm tra user có phải manager không
 *
 * @param user - User object
 * @returns boolean
 */
export function isManager(user: AuthUser | null): boolean {
  return user?.role?.name === 'manager';
}

/**
 * Kiểm tra user có role cụ thể
 *
 * @param user - User object
 * @param roleName - Role name to check
 * @returns boolean
 */
export function hasRole(user: AuthUser | null, roleName: string): boolean {
  return user?.role?.name === roleName;
}

/**
 * Kiểm tra user có một trong các roles
 *
 * @param user - User object
 * @param roleNames - Array of role names
 * @returns boolean
 */
export function hasAnyRole(user: AuthUser | null, roleNames: string[]): boolean {
  if (!user?.role) return false;
  return roleNames.includes(user.role.name);
}

/**
 * Format permission string để hiển thị
 *
 * @param permission - Permission string (vd: "users.create")
 * @returns Formatted string (vd: "Tạo người dùng")
 */
export function formatPermission(permission: string): string {
  const [module, action] = permission.split('.');

  const moduleNames: Record<string, string> = {
    users: 'người dùng',
    roles: 'vai trò',
    customers: 'khách hàng',
    vehicles: 'phương tiện',
    products: 'sản phẩm',
    services: 'dịch vụ',
    categories: 'danh mục',
    orders: 'đơn hàng',
    invoices: 'hóa đơn',
    payments: 'thanh toán',
    settlements: 'đối soát',
    warehouses: 'kho',
    stocks: 'tồn kho',
    providers: 'nhà cung cấp',
    reports: 'báo cáo',
    settings: 'cài đặt',
  };

  const actionNames: Record<string, string> = {
    view: 'Xem',
    create: 'Tạo',
    edit: 'Sửa',
    delete: 'Xóa',
    approve: 'Duyệt',
    cancel: 'Hủy',
    confirm: 'Xác nhận',
    verify: 'Xác minh',
    transfer: 'Chuyển kho',
    export: 'Xuất',
  };

  const moduleName = moduleNames[module] || module;
  const actionName = actionNames[action] || action;

  return `${actionName} ${moduleName}`;
}

/**
 * Lấy label cho module
 */
export function getModuleLabel(module: string): string {
  const moduleLabels: Record<string, string> = {
    users: 'Người dùng',
    roles: 'Vai trò',
    customers: 'Khách hàng',
    vehicles: 'Phương tiện',
    products: 'Sản phẩm',
    services: 'Dịch vụ',
    categories: 'Danh mục',
    orders: 'Đơn hàng',
    invoices: 'Hóa đơn',
    payments: 'Thanh toán',
    settlements: 'Đối soát',
    warehouses: 'Kho',
    stocks: 'Tồn kho',
    providers: 'Nhà cung cấp',
    reports: 'Báo cáo',
    settings: 'Cài đặt',
  };

  return moduleLabels[module] || module;
}

/**
 * Lấy label cho action
 */
export function getActionLabel(action: string): string {
  const actionLabels: Record<string, string> = {
    view: 'Xem',
    create: 'Tạo mới',
    edit: 'Chỉnh sửa',
    delete: 'Xóa',
    approve: 'Phê duyệt',
    cancel: 'Hủy',
    confirm: 'Xác nhận',
    verify: 'Xác minh',
    transfer: 'Chuyển kho',
    export: 'Xuất file',
  };

  return actionLabels[action] || action;
}
