// User utility functions
import type { AuthUser, Role } from '~/types/auth';

/**
 * Get role_id from user object
 * Backend stores role_id in user_roles pivot table, not directly in users table
 * This function handles multiple data structures to find the correct role_id
 *
 * @param user - User object from API
 * @param roles - Available roles list (used for fallback)
 * @returns role_id number
 */
export function getUserRoleId(user: AuthUser | null, roles: Role[] = []): number {
  if (!user) {
    return roles.length > 0 ? roles[0].id : 1;
  }

  // Try multiple sources for role_id (in order of priority)

  // 1. From user_role relationship (pivot table - PRIMARY SOURCE)
  // Backend: user_roles table has role_id column
  if ((user as any)?.user_role?.role_id) {
    return (user as any).user_role.role_id;
  }

  // 2. Alternative naming: userRole (camelCase)
  if ((user as any)?.userRole?.role_id) {
    return (user as any).userRole.role_id;
  }

  // 3. From role relationship object
  // Backend eager loads role via hasOneThrough
  if (user.role?.id) {
    return user.role.id;
  }

  // 4. Fallback: role_id directly on user object (if exists)
  if ((user as any)?.role_id) {
    return (user as any).role_id;
  }

  // Default: first role in list or 1
  return roles.length > 0 ? roles[0].id : 1;
}

/**
 * Check if user has a specific role
 *
 * @param user - User object
 * @param roleName - Role name to check (e.g., 'admin', 'manager')
 * @returns boolean
 */
export function hasRole(user: AuthUser | null, roleName: string): boolean {
  if (!user || !user.role) return false;
  return user.role.name === roleName;
}

/**
 * Check if user has one of multiple roles
 *
 * @param user - User object
 * @param roleNames - Array of role names to check
 * @returns boolean
 */
export function hasAnyRole(user: AuthUser | null, roleNames: string[]): boolean {
  if (!user || !user.role) return false;
  return roleNames.includes(user.role.name);
}

/**
 * Get user's role display name
 *
 * @param user - User object
 * @returns Role display name or empty string
 */
export function getUserRoleName(user: AuthUser | null): string {
  if (!user || !user.role) return '';
  return user.role.display_name || user.role.name;
}

/**
 * Check if user is active
 *
 * @param user - User object
 * @returns boolean
 */
export function isUserActive(user: AuthUser | null): boolean {
  if (!user) return false;
  return (user as any)?.is_active !== false;
}

/**
 * Get user's full info for display
 *
 * @param user - User object
 * @returns Object with formatted user info
 */
export function getUserDisplayInfo(user: AuthUser | null) {
  if (!user) {
    return {
      name: '',
      email: '',
      role: '',
      initials: '',
      isActive: false,
    };
  }

  return {
    name: user.name,
    email: user.email,
    role: getUserRoleName(user),
    initials: user.name.charAt(0).toUpperCase(),
    isActive: isUserActive(user),
  };
}

/**
 * Check if user is admin
 */
export function isAdmin(user: AuthUser | null): boolean {
  return hasRole(user, 'admin');
}

/**
 * Check if user is manager
 */
export function isManager(user: AuthUser | null): boolean {
  return hasRole(user, 'manager');
}

/**
 * Check if user is accountant
 */
export function isAccountant(user: AuthUser | null): boolean {
  return hasRole(user, 'accountant');
}

/**
 * Check if user is mechanic/technician
 */
export function isMechanic(user: AuthUser | null): boolean {
  return hasAnyRole(user, ['mechanic', 'technician']);
}

