import { Navigate, useLocation } from 'react-router';
import { useAuth } from '~/contexts/AuthContext';
import { LoadingOverlay } from './ui/Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requirePermission?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  requirePermission
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated, hasRole, hasPermission } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingOverlay message="Đang xác thực..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role permissions
  if (allowedRoles && allowedRoles.length > 0) {
    const hasAllowedRole = allowedRoles.some(role => hasRole(role));
    if (!hasAllowedRole) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Không có quyền truy cập</h1>
            <p className="text-gray-600 mb-6">Bạn không có quyền truy cập trang này.</p>
            <a href="/" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
              Về trang chủ
            </a>
          </div>
        </div>
      );
    }
  }

  // Check specific permission
  if (requirePermission && !hasPermission(requirePermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Không có quyền thực hiện</h1>
          <p className="text-gray-600 mb-6">Bạn không có quyền thực hiện chức năng này.</p>
          <a href="/" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
            Về trang chủ
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

