<?php
/**
 * Script import môn học từ API thực tế
 * Chạy: php import_subjects_from_real_api.php
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

echo "🚀 Bắt đầu import môn học từ API thực tế...\n\n";

$apiUrl = 'http://203.162.246.113:8088';

// Lấy tất cả ngành từ database
$majors = DB::table('majors')->get();

echo "📊 Tìm thấy " . count($majors) . " ngành trong database\n";
echo str_repeat("=", 60) . "\n\n";

$totalSubjects = 0;
$totalRelations = 0;
$majorCount = 0;
$subjectsCache = []; // Cache để tránh insert trùng

DB::beginTransaction();

try {
    foreach ($majors as $major) {
        $majorCount++;
        $maNganh = $major->maNganh;
        $tenNganh = $major->tenNganh;

        echo "[$majorCount/" . count($majors) . "] 🔄 Ngành: $tenNganh ($maNganh)\n";

        // Xác định loại đào tạo
        $loaiDaoTao = 'ThacSy';
        if (str_starts_with($maNganh, '9') || str_starts_with($maNganh, '62')) {
            $loaiDaoTao = 'TienSy';
        }

        // Thử các năm khác nhau
        $years = [2024, 2023, 2022, 2021, 2020, 2019];
        $subjectsFound = false;

        foreach ($years as $year) {
            try {
                $response = Http::timeout(30)->get("{$apiUrl}/HoSoHocVien/{$loaiDaoTao}", [
                    'NamVao' => $year,
                    'MaNganh' => $maNganh
                ]);

                if (!$response->successful() || empty($response->json())) {
                    continue;
                }

                $data = $response->json();

                // Kiểm tra xem response có phải là danh sách môn học không
                if (!isset($data[0]) || !is_array($data[0])) {
                    continue;
                }

                $firstItem = $data[0];

                // Nếu có các field môn học thì tiếp tục
                if (!isset($firstItem['hocPhanSo']) && !isset($firstItem['tenMon'])) {
                    continue;
                }

                echo "   ✅ Tìm thấy " . count($data) . " môn học (năm $year)\n";
                $subjectsFound = true;

                $subjectCount = 0;

                foreach ($data as $item) {
                    // Bỏ qua nếu không có đủ thông tin
                    if (!isset($item['tenMon']) || empty($item['tenMon'])) {
                        continue;
                    }

                    // Tạo mã môn từ hocPhanChu hoặc hocPhanSo
                    $maMon = $item['hocPhanChu'] ?? $item['hocPhanSo'] ?? null;
                    if (!$maMon) {
                        continue;
                    }

                    $maMon = trim($maMon);
                    $tenMon = trim($item['tenMon']);
                    $soTinChi = $item['soTinChi'] ?? 2;

                    // Tạo mô tả chi tiết
                    $moTa = [];
                    if (isset($item['loaiHocPhan'])) {
                        $loaiHP = [
                            'CH' => 'Chính trị',
                            'CN' => 'Chuyên ngành',
                            'TC' => 'Tự chọn',
                            'CS' => 'Cơ sở'
                        ];
                        $moTa[] = 'Loại: ' . ($loaiHP[$item['loaiHocPhan']] ?? $item['loaiHocPhan']);
                    }
                    if (isset($item['baiTapLon']) && $item['baiTapLon']) {
                        $moTa[] = 'Có bài tập lớn';
                    }
                    $moTaText = !empty($moTa) ? implode(', ', $moTa) : null;

                    // Insert subject nếu chưa có trong cache
                    if (!isset($subjectsCache[$maMon])) {
                        try {
                            DB::statement(
                                "INSERT IGNORE INTO subjects (maMon, tenMon, soTinChi, moTa, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())",
                                [$maMon, $tenMon, $soTinChi, $moTaText]
                            );

                            $subjectsCache[$maMon] = true;
                            $totalSubjects++;
                        } catch (\Exception $e) {
                            // Bỏ qua lỗi duplicate
                        }
                    }

                    // Lấy subject ID
                    $subject = DB::table('subjects')->where('maMon', $maMon)->first();

                    if ($subject) {
                        // Link major-subject
                        try {
                            DB::statement(
                                "INSERT IGNORE INTO major_subjects (major_id, subject_id) VALUES (?, ?)",
                                [$major->id, $subject->id]
                            );

                            $subjectCount++;
                            $totalRelations++;
                        } catch (\Exception $e) {
                            // Bỏ qua lỗi duplicate
                        }
                    }
                }

                if ($subjectCount > 0) {
                    echo "   📚 Đã liên kết $subjectCount môn học với ngành này\n";
                }

                // Đã tìm thấy dữ liệu, không cần thử năm khác
                break;

            } catch (\Exception $e) {
                // Tiếp tục thử năm khác
                continue;
            }
        }

        if (!$subjectsFound) {
            echo "   ℹ️  Không tìm thấy môn học\n";
        }

        echo "\n";

        // Sleep ngắn để tránh quá tải API
        usleep(100000); // 0.1 giây
    }

    DB::commit();

    echo str_repeat("=", 60) . "\n";
    echo "🎉 HOÀN THÀNH!\n";
    echo "📊 Tổng kết:\n";
    echo "   - Số ngành đã xử lý: $majorCount\n";
    echo "   - Số môn học mới tạo: $totalSubjects\n";
    echo "   - Tổng số liên kết ngành-môn học: $totalRelations\n";
    echo str_repeat("=", 60) . "\n";

} catch (\Exception $e) {
    DB::rollBack();
    echo "\n❌ Lỗi: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}

