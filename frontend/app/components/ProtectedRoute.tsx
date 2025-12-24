/**
 * ProtectedRoute Component
 * Bảo vệ routes yêu cầu permissions cụ thể
 * Redirect về dashboard nếu user không có quyền
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '~/contexts/AuthContext';
import { hasPermission, hasAnyPermission } from '~/utils/permissions';
import { Alert } from '~/components/ui';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * Permission yêu cầu (format: "module.action" hoặc ["module.action"])
   * VD: "users.view" hoặc ["users.view", "users.create"]
   */
  requiredPermission?: string | string[];
  /**
   * Nếu true, yêu cầu TẤT CẢ permissions trong array
   * Nếu false, chỉ cần MỘT trong các permissions (default)
   */
  requireAll?: boolean;
  /**
   * Custom message khi không có quyền
   */
  unauthorizedMessage?: string;
  /**
   * Redirect path khi không có quyền (default: /dashboard)
   */
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredPermission,
  requireAll = false,
  unauthorizedMessage = 'Bạn không có quyền truy cập trang này',
  redirectTo = '/dashboard',
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Đợi auth loading xong
    if (isLoading) return;

    // Chưa login -> redirect to login
    if (!isAuthenticated || !user) {
      navigate('/login', { replace: true });
      return;
    }

    // Không yêu cầu permission cụ thể -> cho phép truy cập
    if (!requiredPermission) return;

    // Kiểm tra permission
    let hasRequiredPermission = false;

    if (Array.isArray(requiredPermission)) {
      // Multiple permissions
      if (requireAll) {
        // Yêu cầu TẤT CẢ permissions
        hasRequiredPermission = requiredPermission.every(perm =>
          hasPermission(user, perm)
        );
      } else {
        // Chỉ cần MỘT permission
        hasRequiredPermission = hasAnyPermission(user, requiredPermission);
      }
    } else {
      // Single permission
      hasRequiredPermission = hasPermission(user, requiredPermission);
    }

    // Không có quyền -> redirect
    if (!hasRequiredPermission) {
      console.warn(`🚫 Access denied: User lacks required permission(s):`, requiredPermission);
      navigate(redirectTo, {
        replace: true,
        state: {
          unauthorized: true,
          message: unauthorizedMessage
        }
      });
    }
  }, [user, isLoading, isAuthenticated, requiredPermission, requireAll, navigate, redirectTo, unauthorizedMessage]);

  // Đang loading hoặc chưa có user
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Kiểm tra permission
  if (requiredPermission) {
    let hasRequiredPermission = false;

    if (Array.isArray(requiredPermission)) {
      if (requireAll) {
        hasRequiredPermission = requiredPermission.every(perm =>
          hasPermission(user, perm)
        );
      } else {
        hasRequiredPermission = hasAnyPermission(user, requiredPermission);
      }
    } else {
      hasRequiredPermission = hasPermission(user, requiredPermission);
    }

    // Hiển thị message tạm thời trước khi redirect
    if (!hasRequiredPermission) {
      return (
        <div className="container mx-auto px-4 py-8">
          <Alert
            type="error"
            title="Không có quyền truy cập"
            message={unauthorizedMessage}
            className="max-w-2xl mx-auto"
          />
          <div className="text-center mt-6">
            <button
              onClick={() => navigate(redirectTo)}
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              ← Quay lại trang chủ
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}

/**
 * HOC wrapper cho ProtectedRoute
 * Sử dụng khi cần wrap component trực tiếp
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission: string | string[],
  options?: {
    requireAll?: boolean;
    unauthorizedMessage?: string;
    redirectTo?: string;
  }
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute
        requiredPermission={requiredPermission}
        requireAll={options?.requireAll}
        unauthorizedMessage={options?.unauthorizedMessage}
        redirectTo={options?.redirectTo}
      >
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

