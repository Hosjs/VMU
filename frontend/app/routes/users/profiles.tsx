import { useEffect, useCallback, useState } from 'react';
import { useAuth } from '~/contexts/AuthContext';
import { userService } from '~/services/user.service';
import { useAsync } from '~/hooks/useAsync';
import { useModal } from '~/hooks/useModal';
import { useForm } from '~/hooks/useForm';
import { Card } from '~/components/ui/Card';
import { Badge } from '~/components/ui/Badge';
import { Button } from '~/components/ui/Button';
import { Modal } from '~/components/ui/Modal';
import { Input } from '~/components/ui/Input';
import { Select } from '~/components/ui/Select';
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  BuildingOffice2Icon,
  IdentificationIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';
import { LoadingSpinner } from '~/components/LoadingSystem';
import { Breadcrumb } from '~/layouts/Breadcrumb';

export default function UserProfilePage() {
  const { user: authUser } = useAuth();

  const fetchProfile = useCallback(async () => {
    if (!authUser?.id) {
      throw new Error('Không tìm thấy thông tin người dùng.');
    }
    return userService.getProfile(authUser.id);
  }, [authUser?.id]);

  const { data: user, error, isLoading, execute } = useAsync(fetchProfile, { immediate: false });

  const editModal = useModal();
  const passwordModal = useModal();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Form for editing profile
  const editForm = useForm({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      birth_date: user?.birth_date || '',
      gender: user?.gender || '',
      address: user?.address || '',
    },
    onSubmit: async (values) => {
      try {
        setSubmitError(null);
        setSubmitSuccess(null);
        if (!authUser?.id) return;

        await userService.updateProfile(authUser.id, values);
        setSubmitSuccess('Cập nhật thông tin thành công!');
        execute(); // Refresh profile data
        setTimeout(() => {
          editModal.close();
          setSubmitSuccess(null);
        }, 1500);
      } catch (err: any) {
        setSubmitError(err.message || 'Có lỗi xảy ra khi cập nhật thông tin');
      }
    },
  });

  // Form for changing password
  const passwordForm = useForm({
    initialValues: {
      current_password: '',
      new_password: '',
      new_password_confirmation: '',
    },
    onSubmit: async (values) => {
      try {
        setSubmitError(null);
        setSubmitSuccess(null);

        if (values.new_password !== values.new_password_confirmation) {
          setSubmitError('Mật khẩu mới và xác nhận mật khẩu không khớp');
          return;
        }

        await userService.changePassword(values);
        setSubmitSuccess('Đổi mật khẩu thành công!');
        setTimeout(() => {
          passwordModal.close();
          passwordForm.reset();
          setSubmitSuccess(null);
        }, 1500);
      } catch (err: any) {
        setSubmitError(err.message || 'Có lỗi xảy ra khi đổi mật khẩu');
      }
    },
  });

  // Update form values when user data changes
  useEffect(() => {
    if (user) {
      editForm.setFieldValue('name', user.name || '');
      editForm.setFieldValue('email', user.email || '');
      editForm.setFieldValue('phone', user.phone || '');
      editForm.setFieldValue('birth_date', user.birth_date || '');
      editForm.setFieldValue('gender', user.gender || '');
      editForm.setFieldValue('address', user.address || '');
    }
  }, [user]);

  useEffect(() => {
    if (authUser?.id) {
      execute();
    }
  }, [execute]);

  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return 'Chưa cập nhật';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch {
      return 'Chưa cập nhật';
    }
  };

  const renderDetailItem = (Icon: React.ElementType, label: string, value?: string | null, isDate?: boolean) => (
    <div>
      <dt className="flex items-center text-sm font-medium text-gray-500">
        <Icon className="w-5 h-5 mr-2 text-gray-400" />
        <span>{label}</span>
      </dt>
      <dd className="mt-1 text-sm text-gray-900">
        {isDate ? formatDate(value) : (value || 'Chưa cập nhật')}
      </dd>
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
              <div className="flex gap-2">
                <Button variant="outline" onClick={passwordModal.open}>
                  <KeyIcon className="w-4 h-4" />
                  Đổi mật khẩu
                </Button>
                <Button variant="primary" onClick={editModal.open}>
                  <PencilIcon className="w-4 h-4" />
                  Chỉnh sửa hồ sơ
                </Button>
              </div>
            </div>

            <div className="mt-8 border-t border-gray-200 pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin liên hệ</h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                {renderDetailItem(EnvelopeIcon, 'Địa chỉ Email', user.email)}
                {renderDetailItem(PhoneIcon, 'Số điện thoại', user.phone)}
                {renderDetailItem(CalendarIcon, 'Ngày sinh', user.birth_date, true)}
                {renderDetailItem(UserCircleIcon, 'Giới tính', user.gender)}
              </dl>
            </div>

             <div className="mt-8 border-t border-gray-200 pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin công việc</h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                {renderDetailItem(IdentificationIcon, 'Mã nhân viên', user.employee_code)}
                {renderDetailItem(BuildingOffice2Icon, 'Phòng ban', user.department)}
                {renderDetailItem(CalendarIcon, 'Ngày vào làm', user.hire_date, true)}
              </dl>
            </div>
          </div>
        )}
      </Card>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={editModal.isOpen}
        onClose={editModal.close}
        title="Chỉnh sửa thông tin cá nhân"
        size="lg"
      >
        <form onSubmit={editForm.handleSubmit} className="space-y-4">
          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {submitError}
            </div>
          )}
          {submitSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
              {submitSuccess}
            </div>
          )}

          <Input
            label="Họ và tên"
            name="name"
            value={editForm.values.name}
            onChange={(e) => editForm.handleChange('name', e.target.value)}
            placeholder="Nhập họ và tên"
            required
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={editForm.values.email}
            onChange={(e) => editForm.handleChange('email', e.target.value)}
            placeholder="Nhập email"
            required
          />

          <Input
            label="Số điện thoại"
            name="phone"
            value={editForm.values.phone}
            onChange={(e) => editForm.handleChange('phone', e.target.value)}
            placeholder="Nhập số điện thoại"
          />

          <Input
            label="Ngày sinh"
            name="birth_date"
            type="date"
            value={editForm.values.birth_date}
            onChange={(e) => editForm.handleChange('birth_date', e.target.value)}
          />

          <Select
            label="Giới tính"
            name="gender"
            value={editForm.values.gender}
            onChange={(e) => editForm.handleChange('gender', e.target.value)}
            options={[
              { value: '', label: 'Chọn giới tính' },
              { value: 'Nam', label: 'Nam' },
              { value: 'Nữ', label: 'Nữ' },
              { value: 'Khác', label: 'Khác' },
            ]}
          />

          <Input
            label="Địa chỉ"
            name="address"
            value={editForm.values.address}
            onChange={(e) => editForm.handleChange('address', e.target.value)}
            placeholder="Nhập địa chỉ"
          />

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={editModal.close}
              disabled={editForm.isSubmitting}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={editForm.isSubmitting}
            >
              {editForm.isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={passwordModal.isOpen}
        onClose={passwordModal.close}
        title="Đổi mật khẩu"
      >
        <form onSubmit={passwordForm.handleSubmit} className="space-y-4">
          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {submitError}
            </div>
          )}
          {submitSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
              {submitSuccess}
            </div>
          )}

          <Input
            label="Mật khẩu hiện tại"
            name="current_password"
            type="password"
            value={passwordForm.values.current_password}
            onChange={(e) => passwordForm.handleChange('current_password', e.target.value)}
            placeholder="Nhập mật khẩu hiện tại"
            required
          />

          <Input
            label="Mật khẩu mới"
            name="new_password"
            type="password"
            value={passwordForm.values.new_password}
            onChange={(e) => passwordForm.handleChange('new_password', e.target.value)}
            placeholder="Nhập mật khẩu mới"
            required
          />

          <Input
            label="Xác nhận mật khẩu mới"
            name="new_password_confirmation"
            type="password"
            value={passwordForm.values.new_password_confirmation}
            onChange={(e) => passwordForm.handleChange('new_password_confirmation', e.target.value)}
            placeholder="Nhập lại mật khẩu mới"
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                passwordModal.close();
                passwordForm.reset();
                setSubmitError(null);
                setSubmitSuccess(null);
              }}
              disabled={passwordForm.isSubmitting}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={passwordForm.isSubmitting}
            >
              {passwordForm.isSubmitting ? 'Đang đổi...' : 'Đổi mật khẩu'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
