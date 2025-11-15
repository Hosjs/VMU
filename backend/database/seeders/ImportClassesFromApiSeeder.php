<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class ImportClassesFromApiSeeder extends Seeder
{
    /**
     * Mapping mã trình độ từ API sang database
     */
    private function mapTrinhDoDaoTao($maTrinhDoAPI)
    {
        $mapping = [
            '01' => 'CuNhan',
            '02' => 'ThacSi',
            '03' => 'ThacSi',
            '04' => 'ThacSi',
            '05' => 'TienSi',
        ];

        return $mapping[$maTrinhDoAPI] ?? 'ThacSi'; // Mặc định là ThacSi
    }

    /**
     * Run the database seeds.
     *
     * Cách sử dụng:
     * php artisan db:seed --class=ImportClassesFromApiSeeder
     */
    public function run(): void
    {
        // Tắt foreign key check tạm thời
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        echo "🚀 Bắt đầu import dữ liệu từ API...\n";

        $classIds = [ 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
            31, 32, 33, 34, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49,
            51, 52, 53, 54, 55, 56, 57, 58, 59, 60,
            61, 62, 63, 64, 65, 66, 67, 68, 69, 70,
            71, 72, 73, 74, 75, 76, 77, 78, 79, 80,
            81, 82, 83, 84, 85, 86, 87, 88, 89, 90,
            91, 92, 93, 94, 95, 96, 97, 98, 99, 100,
            101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111];

        $externalApiUrl = 'http://203.162.246.113:8088';
        $successCount = 0;
        $errorCount = 0;

        foreach ($classIds as $classId) {
            try {
                echo "📥 Đang import lớp ID: {$classId}...\n";

                // 1. Lấy thông tin lớp học
                $classResponse = Http::timeout(15)->get("{$externalApiUrl}/LopHoc/MaLop", [
                    'ID' => $classId
                ]);

                if (!$classResponse->successful() || empty($classResponse->json())) {
                    echo "❌ Không tìm thấy lớp ID: {$classId}\n";
                    $errorCount++;
                    continue;
                }

                $classData = $classResponse->json()[0];

                // 2. Map mã trình độ từ API sang database
                $maTrinhDoAPI = $classData['maTrinhDoDaoTao'] ?? '04';
                $maTrinhDoDB = $this->mapTrinhDoDaoTao($maTrinhDoAPI);

                // 3. Kiểm tra và tạo major nếu chưa có
                $maNganhHoc = $classData['maNganhHoc'] ?? '8520216';
                if (!DB::table('majors')->where('maNganh', $maNganhHoc)->exists()) {
                    DB::table('majors')->insert([
                        'maNganh' => $maNganhHoc,
                        'tenNganh' => 'Ngành ' . $maNganhHoc . ' (Auto)',
                        'moTa' => 'Tự động tạo từ import',
                        'trangThai' => 1,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    echo "   ➕ Đã tạo ngành học: {$maNganhHoc}\n";
                }

                $khoaHoc = $classData['khoaHoc'] ?? date('Y');

                DB::table('classes')->updateOrInsert(
                    ['id' => $classData['id']],
                    [
                        'class_name' => $classData['tenLop'],
                        'maTrinhDoDaoTao' => $maTrinhDoDB,
                        'major_id' => $maNganhHoc,
                        'khoaHoc_id' => $khoaHoc,
                        'lecurer_id' => null,
                        'trangThai' => 'DangHoc',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );

                echo "✅ Đã import lớp: {$classData['tenLop']} (Trình độ: {$maTrinhDoDB})\n";

                $studentsResponse = Http::timeout(15)->get("{$externalApiUrl}/LopHoc/HocVien", [
                    'LopID' => $classId
                ]);

                if ($studentsResponse->successful() && !empty($studentsResponse->json())) {
                    $students = $studentsResponse->json();
                    $studentCount = count($students);

                    echo "   📋 Tìm thấy {$studentCount} học viên\n";

                    foreach ($students as $student) {
                        $maHV = $student['maHV'] ?? $student['mahv'] ?? null;

                        if (!$maHV) {
                            echo "   ⚠️ Bỏ qua học viên không có mã\n";
                            continue;
                        }

                        // Map trình độ của học viên
                        $studentMaTrinhDoAPI = $student['maTrinhDoDaoTao'] ?? $student['matrinhdodaotao'] ?? $maTrinhDoAPI;
                        $studentMaTrinhDoDB = $this->mapTrinhDoDaoTao($studentMaTrinhDoAPI);

                        // Kiểm tra và tạo ngành của học viên nếu chưa có
                        $studentMaNganh = $student['maNganhHoc'] ?? $student['manganhhoc'] ?? $maNganhHoc;
                        if (!DB::table('majors')->where('maNganh', $studentMaNganh)->exists()) {
                            DB::table('majors')->insert([
                                'maNganh' => $studentMaNganh,
                                'tenNganh' => 'Ngành ' . $studentMaNganh . ' (Auto)',
                                'moTa' => 'Tự động tạo từ import',
                                'trangThai' => 1,
                                'created_at' => now(),
                                'updated_at' => now(),
                            ]);
                        }

                        // Tách họ đệm và tên (xử lý cả hoTen, hodem, ten)
                        $fullName = $student['hoTen'] ?? $student['hoten'] ?? '';
                        $hoDem = $student['hoDem'] ?? $student['hodem'] ?? '';
                        $ten = $student['ten'] ?? '';

                        // Nếu có fullName thì tách, nếu không thì dùng hoDem và ten riêng
                        if ($fullName && !$hoDem && !$ten) {
                            $nameParts = explode(' ', trim($fullName));
                            $ten = array_pop($nameParts);
                            $hoDem = implode(' ', $nameParts);
                        }

                        // Xử lý ngày sinh
                        $ngaySinh = $student['ngaySinh'] ?? $student['ngaysinh'] ?? null;
                        $ngaySinhFormatted = $ngaySinh ? date('Y-m-d', strtotime($ngaySinh)) : '1990-01-01';

                        // Xử lý các trường khác
                        $gioiTinh = $student['gioiTinh'] ?? $student['gioitinh'] ?? 'Khác';
                        $soGiayTo = $student['soGiayToTuyThan'] ?? $student['socmnd'] ?? '000000000';
                        $dienThoai = $student['dienThoai'] ?? $student['dienthoai'] ?? '0000000000';
                        $email = $student['email'] ?? $maHV . '@example.com';

                        // Insert học viên vào bảng students với idLop
                        DB::table('students')->updateOrInsert(
                            ['maHV' => $maHV],
                            [
                                'hoDem' => $hoDem ?: 'Chưa cập nhật',
                                'ten' => $ten ?: 'Chưa cập nhật',
                                'ngaySinh' => $ngaySinhFormatted,
                                'gioiTinh' => $gioiTinh,
                                'soGiayToTuyThan' => $soGiayTo,
                                'dienThoai' => $dienThoai,
                                'email' => $email,
                                'quocTich' => $student['quocTich'] ?? $student['quoctich'] ?? 'Việt Nam',
                                'danToc' => $student['danToc'] ?? $student['dantoc'] ?? null,
                                'tonGiao' => $student['tonGiao'] ?? $student['tongiao'] ?? null,
                                'maTrinhDoDaoTao' => $studentMaTrinhDoDB,
                                'maNganh' => $studentMaNganh,
                                'trangThai' => $student['trangThai'] ?? $student['trangthai'] ?? 'DangHoc',
                                'ngayNhapHoc' => now(),
                                'namVaoTruong' => $student['khoaHoc'] ?? $student['khoahoc'] ?? date('Y'),
                                'idLop' => $classId,
                                'created_at' => now(),
                                'updated_at' => now(),
                            ]
                        );
                    }

                    echo "   ✅ Đã import {$studentCount} học viên\n";
                }

                $successCount++;

            } catch (\Exception $e) {
                echo "❌ Lỗi khi import lớp ID {$classId}: " . $e->getMessage() . "\n";
                $errorCount++;
            }
        }

        // Bật lại foreign key check
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        echo "\n🎉 Hoàn thành!\n";
        echo "✅ Thành công: {$successCount} lớp\n";
        if ($errorCount > 0) {
            echo "❌ Lỗi: {$errorCount} lớp\n";
        }
    }
}
