import { useEffect, useCallback } from 'react';
import { useAuth } from '~/contexts/AuthContext';
import { userService } from '~/services/user.service';
import { useAsync } from '~/hooks/useAsync';
import { Card } from '~/components/ui/Card';
import { Badge } from '~/components/ui/Badge';
import { Button } from '~/components/ui/Button';
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  BuildingOffice2Icon,
  IdentificationIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { LoadingSpinner } from '~/components/LoadingSystem';
export function meta() {
  return [
    { title: 'Hồ sơ của tôi - VMU Training' },
    { name: 'description', content: 'Xem và quản lý thông tin hồ sơ cá nhân của bạn.' },
  ];
}

export default function UserProfilePage() {
  const { user: authUser } = useAuth();

  const fetchProfile = useCallback(async () => {
    if (!authUser?.id) {
      throw new Error('Không tìm thấy thông tin người dùng.');
    }
    return userService.getProfile(authUser.id);
  }, [authUser?.id]);

  const { data: user, error, isLoading, execute } = useAsync(fetchProfile, { immediate: false });

  useEffect(() => {
    if (authUser?.id) {
      execute();
    }
  }, [execute]);

  const renderDetailItem = (Icon: React.ElementType, label: string, value?: string | null) => (
    <div>
      <dt className="flex items-center text-sm font-medium text-gray-500">
        <Icon className="w-5 h-5 mr-2 text-gray-400" />
        <span>{label}</span>
      </dt>
      <dd className="mt-1 text-sm text-gray-900">{value || 'Chưa cập nhật'}</dd>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <UserCircleIcon className="w-8 h-8 text-blue-600" />
            Hồ sơ của tôi
          </h1>
          <p className="text-gray-600 mt-1">
            Thông tin cá nhân và chi tiết tài khoản của bạn.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={execute}
          disabled={isLoading}
        >
          <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      <Card>
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">
              Đã xảy ra lỗi
            </h3>
            <p className="text-gray-600">{error.message}</p>
          </div>
        )}

        {user && (
          <div className="p-6">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <UserCircleIcon className="w-24 h-24 text-gray-300" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                <p className="text-gray-500">{user.position || 'Chưa có chức vụ'}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant={user.is_active ? 'success' : 'danger'}>
                    {user.is_active ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                  </Badge>
                </div>
              </div>
              <Button variant="primary">
                Chỉnh sửa hồ sơ
              </Button>
            </div>

            <div className="mt-8 border-t border-gray-200 pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin liên hệ</h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                {renderDetailItem(EnvelopeIcon, 'Địa chỉ Email', user.email)}
                {renderDetailItem(PhoneIcon, 'Số điện thoại', user.phone)}
                {renderDetailItem(CalendarIcon, 'Ngày sinh', user.birth_date ? new Date(user.birth_date).toLocaleDateString('vi-VN') : null)}
                {renderDetailItem(UserCircleIcon, 'Giới tính', user.gender)}
              </dl>
            </div>

             <div className="mt-8 border-t border-gray-200 pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin công việc</h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                {renderDetailItem(IdentificationIcon, 'Mã nhân viên', user.employee_code)}
                {renderDetailItem(BuildingOffice2Icon, 'Phòng ban', user.department)}
                {renderDetailItem(CalendarIcon, 'Ngày vào làm', user.hire_date ? new Date(user.hire_date).toLocaleDateString('vi-VN') : null)}
              </dl>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
