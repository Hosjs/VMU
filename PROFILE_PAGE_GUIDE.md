# Hướng Dẫn Sử Dụng Trang Profile

## Tính Năng Mới Đã Thêm

### ✨ 1. Chỉnh Sửa Thông Tin Cá Nhân

Người dùng có thể cập nhật các thông tin sau:
- **Họ và tên** (bắt buộc)
- **Email** (bắt buộc)
- **Số điện thoại**
- **Ngày sinh**
- **Giới tính** (Nam/Nữ/Khác)
- **Địa chỉ**

**Cách sử dụng:**
1. Vào trang "Hồ sơ của tôi"
2. Click nút **"Chỉnh sửa hồ sơ"** (màu xanh, icon bút)
3. Cập nhật thông tin trong form
4. Click **"Lưu thay đổi"**
5. Thông tin sẽ được cập nhật và modal tự động đóng sau 1.5 giây

### 🔐 2. Đổi Mật Khẩu

Người dùng có thể đổi mật khẩu an toàn.

**Cách sử dụng:**
1. Vào trang "Hồ sơ của tôi"
2. Click nút **"Đổi mật khẩu"** (màu trắng, icon chìa khóa)
3. Nhập:
   - Mật khẩu hiện tại
   - Mật khẩu mới
   - Xác nhận mật khẩu mới
4. Click **"Đổi mật khẩu"**
5. Hệ thống sẽ xác thực và đổi mật khẩu

**Lưu ý:**
- Mật khẩu mới và xác nhận mật khẩu phải khớp nhau
- Mật khẩu hiện tại phải đúng mới có thể đổi

## Giao Diện

### Trang Profile
```
┌─────────────────────────────────────────────────┐
│  👤 Hồ sơ của tôi              [🔄 Làm mới]    │
│  Thông tin cá nhân và chi tiết tài khoản       │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  👤                  System Administrator       │
│  [Avatar]            System Administrator       │
│                      🟢 Đang hoạt động          │
│                                                 │
│            [🔑 Đổi mật khẩu] [✏️ Chỉnh sửa]   │
│─────────────────────────────────────────────────│
│  📧 Thông tin liên hệ                          │
│  📧 Email:          admin@example.com          │
│  📞 Số điện thoại:  0900000000                 │
│  📅 Ngày sinh:      Chưa cập nhật              │
│  👤 Giới tính:      Chưa cập nhật              │
│─────────────────────────────────────────────────│
│  💼 Thông tin công việc                        │
│  🆔 Mã nhân viên:   ADMIN-001                  │
│  🏢 Phòng ban:      Management                 │
│  📅 Ngày vào làm:   01/11/2025                 │
└─────────────────────────────────────────────────┘
```

### Modal Chỉnh Sửa
```
┌─────────────────────────────────────┐
│  Chỉnh sửa thông tin cá nhân    [X] │
├─────────────────────────────────────┤
│  Họ và tên *                        │
│  [____________________________]     │
│                                     │
│  Email *                            │
│  [____________________________]     │
│                                     │
│  Số điện thoại                      │
│  [____________________________]     │
│                                     │
│  Ngày sinh                          │
│  [____________________________]     │
│                                     │
│  Giới tính                          │
│  [▼ Chọn giới tính___________]     │
│                                     │
│  Địa chỉ                            │
│  [____________________________]     │
│                                     │
│  ─────────────────────────────────  │
│          [Hủy]  [Lưu thay đổi]     │
└─────────────────────────────────────┘
```

### Modal Đổi Mật Khẩu
```
┌─────────────────────────────────────┐
│  Đổi mật khẩu                   [X] │
├─────────────────────────────────────┤
│  Mật khẩu hiện tại *                │
│  [____________________________]     │
│                                     │
│  Mật khẩu mới *                     │
│  [____________________________]     │
│                                     │
│  Xác nhận mật khẩu mới *            │
│  [____________________________]     │
│                                     │
│  ─────────────────────────────────  │
│          [Hủy]  [Đổi mật khẩu]     │
└─────────────────────────────────────┘
```

## Technical Details

### Files Modified
1. **`/frontend/app/services/user.service.ts`**
   - Added `updateProfile()` method
   - Added `changePassword()` method

2. **`/frontend/app/routes/users/profiles.tsx`**
   - Added edit profile modal with form
   - Added change password modal with form
   - Added state management for forms
   - Added success/error notifications
   - Added action buttons

### API Endpoints Used
```
PUT  /api/users/{id}              - Update user profile
POST /api/auth/change-password    - Change password
```

### Form Validation
- **Edit Profile:**
  - Name: Required
  - Email: Required, must be valid email format
  - Phone: Optional
  - Birth date: Optional, date format
  - Gender: Optional, dropdown selection
  - Address: Optional

- **Change Password:**
  - Current password: Required
  - New password: Required
  - Confirmation: Required, must match new password

### Error Handling
- Network errors are caught and displayed
- Validation errors are shown in the form
- Success messages auto-dismiss after 1.5 seconds
- Password mismatch is validated on frontend

### State Management
- Uses `useForm` hook for form management
- Uses `useModal` hook for modal visibility
- Uses `useAsync` hook for API calls
- Separate state for submit errors and success messages

## Testing Checklist

### ✅ Edit Profile
- [ ] Open edit modal
- [ ] Edit all fields
- [ ] Submit with valid data → Success
- [ ] Submit with invalid email → Error
- [ ] Submit with empty required fields → Error
- [ ] Cancel and reopen → Form resets
- [ ] After save → Profile refreshes with new data

### ✅ Change Password
- [ ] Open password modal
- [ ] Enter wrong current password → Error
- [ ] Enter mismatched passwords → Error
- [ ] Enter valid passwords → Success
- [ ] Cancel and reopen → Form resets
- [ ] After success → Can login with new password

### ✅ UI/UX
- [ ] Buttons are properly styled
- [ ] Icons are displayed correctly
- [ ] Modals are centered
- [ ] Forms are responsive
- [ ] Loading states work
- [ ] Error messages are clear
- [ ] Success messages auto-dismiss

## Future Enhancements

Potential improvements:
1. **Avatar Upload** - Allow users to upload profile pictures
2. **Email Verification** - Verify new email addresses
3. **Password Strength Meter** - Show password strength indicator
4. **Two-Factor Authentication** - Add 2FA setup
5. **Activity Log** - Show recent account activities
6. **Notification Preferences** - Let users configure notifications

## Security Notes

- ✅ Current password is required to change password
- ✅ Passwords are sent over HTTPS
- ✅ Backend validates all changes
- ✅ Authentication token is required for all operations
- ✅ Users can only edit their own profile

## Support

If you encounter issues:
1. Clear browser cache (Cmd+Shift+R)
2. Check browser console for errors
3. Verify backend API is running
4. Check authentication token is valid

