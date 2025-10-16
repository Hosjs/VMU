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
 * Danh sách tất cả permissions có sẵn trong hệ thống
 */
export const AVAILABLE_PERMISSIONS: PermissionMap = {
  dashboard: ['view'],
  users: ['view', 'create', 'edit', 'delete'],
  roles: ['view', 'create', 'edit', 'delete'],
  customers: ['view', 'create', 'edit', 'delete'],
  vehicles: ['view', 'create', 'edit', 'delete'],
  products: ['view', 'create', 'edit', 'delete'],
  services: ['view', 'create', 'edit', 'delete'],
  categories: ['view', 'create', 'edit', 'delete'],
  orders: ['view', 'create', 'edit', 'delete', 'approve', 'cancel'],
  invoices: ['view', 'create', 'edit', 'delete', 'approve'],
  payments: ['view', 'create', 'edit', 'delete', 'confirm', 'verify'],
  settlements: ['view', 'create', 'edit', 'delete', 'approve'],
  warehouses: ['view', 'create', 'edit', 'delete'],
  stocks: ['view', 'create', 'edit', 'delete', 'transfer'],
  providers: ['view', 'create', 'edit', 'delete'],
  reports: ['view', 'export'],
  settings: ['view', 'edit'],
};

/**
 * Parse permissions từ role object
 * Backend lưu permissions dưới dạng JSON string hoặc object
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
    return role.permissions as unknown as PermissionMap;
  }

  return {};
}

/**
 * Lấy permissions thực tế của user (kết hợp role permissions và custom permissions)
 * Custom permissions sẽ ghi đè role permissions
 */
export function getEffectivePermissions(user: AuthUser | null): PermissionMap {
  if (!user) return {};

  // Admin có full quyền
  if (user.role?.name === 'admin') {
    return AVAILABLE_PERMISSIONS;
  }

  // Lấy permissions từ role
  const rolePermissions = parsePermissions(user.role);

  // Nếu user có custom_permissions, merge với role permissions
  if (user.custom_permissions && Object.keys(user.custom_permissions).length > 0) {
    return {
      ...rolePermissions,
      ...user.custom_permissions,
    };
  }

  return rolePermissions;
}

/**
 * Kiểm tra user có quyền cụ thể hay không
 *
 * @param user - User object
 * @param permission - Permission string dạng "module.action" (vd: "users.create")
 * @returns boolean
 */
export function hasPermission(user: AuthUser | null, permission: string): boolean {
  if (!user || !user.role) return false;

  // Admin có full quyền
  if (user.role.name === 'admin') return true;

  const [module, action] = permission.split('.');
  if (!module || !action) return false;

  // Sử dụng effective permissions (đã merge custom_permissions)
  const permissions = getEffectivePermissions(user);
  const modulePermissions = permissions[module];

  if (!modulePermissions || !Array.isArray(modulePermissions)) return false;

  return modulePermissions.includes(action);
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
