<?php

namespace App\Helpers;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserHelper
{
    /**
     * Tạo user tự động cho giảng viên hoặc học sinh
     *
     * @param string $fullName Họ tên đầy đủ
     * @param string $email Email tự động tạo
     * @param int|null $lecturerId ID giảng viên (nếu là giảng viên)
     * @param int $roleId Role ID (2 = giảng viên, 3 = học sinh)
     * @return User
     */
    public static function createUserAccount(string $fullName, string $email, ?int $lecturerId = null, int $roleId = 3): User
    {
        // Xác định position dựa vào roleId
        $position = match($roleId) {
            2 => 'Giáo viên',
            3 => 'Học sinh',
            default => null,
        };

        // Kiểm tra xem user đã tồn tại chưa
        $existingUser = User::where('email', $email)->first();

        if ($existingUser) {
            // Nếu đã tồn tại, cập nhật thông tin
            $existingUser->update([
                'name' => $fullName,
                'lecturer_id' => $lecturerId,
                'role_id' => $roleId,
                'position' => $position,
                'is_active' => true,
            ]);
            return $existingUser;
        }

        // Tạo user mới
        $user = User::create([
            'name' => $fullName,
            'email' => $email,
            'password' => Hash::make('password'), // Mật khẩu mặc định
            'lecturer_id' => $lecturerId,
            'role_id' => $roleId,
            'position' => $position,
            'is_active' => true,
            'notes' => 'Tài khoản tự động tạo từ hệ thống',
        ]);

        return $user;
    }

    /**
     * Tạo email từ tên
     * Chuyển đổi tên tiếng Việt thành không dấu và tạo email
     *
     * @param string $fullName Họ tên đầy đủ
     * @param string $domain Domain email (mặc định: @st.vimaru.edu.vn)
     * @return string
     */
    public static function generateEmailFromName(string $fullName, string $domain = '@st.vimaru.edu.vn'): string
    {
        // Chuyển về chữ thường và loại bỏ dấu
        $email = self::removeVietnameseTones($fullName);

        // Loại bỏ ký tự đặc biệt, chỉ giữ chữ và số
        $email = preg_replace('/[^a-z0-9\s]/', '', $email);

        // Thay khoảng trắng bằng dấu chấm
        $email = preg_replace('/\s+/', '.', trim($email));

        // Thêm domain
        $email = $email . $domain;

        return strtolower($email);
    }

    /**
     * Loại bỏ dấu tiếng Việt
     *
     * @param string $str
     * @return string
     */
    private static function removeVietnameseTones(string $str): string
    {
        $str = strtolower($str);

        $vietnameseMap = [
            'á' => 'a', 'à' => 'a', 'ả' => 'a', 'ã' => 'a', 'ạ' => 'a',
            'ă' => 'a', 'ắ' => 'a', 'ằ' => 'a', 'ẳ' => 'a', 'ẵ' => 'a', 'ặ' => 'a',
            'â' => 'a', 'ấ' => 'a', 'ầ' => 'a', 'ẩ' => 'a', 'ẫ' => 'a', 'ậ' => 'a',
            'đ' => 'd',
            'é' => 'e', 'è' => 'e', 'ẻ' => 'e', 'ẽ' => 'e', 'ẹ' => 'e',
            'ê' => 'e', 'ế' => 'e', 'ề' => 'e', 'ể' => 'e', 'ễ' => 'e', 'ệ' => 'e',
            'í' => 'i', 'ì' => 'i', 'ỉ' => 'i', 'ĩ' => 'i', 'ị' => 'i',
            'ó' => 'o', 'ò' => 'o', 'ỏ' => 'o', 'õ' => 'o', 'ọ' => 'o',
            'ô' => 'o', 'ố' => 'o', 'ồ' => 'o', 'ổ' => 'o', 'ỗ' => 'o', 'ộ' => 'o',
            'ơ' => 'o', 'ớ' => 'o', 'ờ' => 'o', 'ở' => 'o', 'ỡ' => 'o', 'ợ' => 'o',
            'ú' => 'u', 'ù' => 'u', 'ủ' => 'u', 'ũ' => 'u', 'ụ' => 'u',
            'ư' => 'u', 'ứ' => 'u', 'ừ' => 'u', 'ử' => 'u', 'ữ' => 'u', 'ự' => 'u',
            'ý' => 'y', 'ỳ' => 'y', 'ỷ' => 'y', 'ỹ' => 'y', 'ỵ' => 'y',
        ];

        return strtr($str, $vietnameseMap);
    }
}
