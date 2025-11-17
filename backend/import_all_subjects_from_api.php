<?php
/**
 * Script import tất cả môn học từ API KeHoachDaoTao
 * Endpoint: http://203.162.246.113:8088/KeHoachDaoTao/ThacSy?NamVao=2022&MaNganh=8310110
 *
 * Cách chạy: php import_all_subjects_from_api.php
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

echo "🚀 Bắt đầu import TẤT CẢ môn học từ API KeHoachDaoTao...\n\n";

$apiUrl = 'http://203.162.246.113:8088';

// Lấy tất cả ngành từ database
$majors = DB::table('majors')->get();

echo "📊 Tìm thấy " . count($majors) . " ngành trong database\n";
echo str_repeat("=", 60) . "\n\n";

$totalSubjects = 0;
$totalRelations = 0;
$totalMajorsWithSubjects = 0;
$majorCount = 0;
$subjectsCache = []; // Cache để tránh insert trùng

DB::beginTransaction();

try {
    foreach ($majors as $major) {
        $majorCount++;
        $maNganh = $major->maNganh;
        $tenNganh = $major->tenNganh;

        echo "[$majorCount/" . count($majors) . "] 🔄 Ngành: $tenNganh ($maNganh)\n";

        // Xác định loại đào tạo dựa trên mã ngành
        $loaiDaoTao = 'ThacSy';
        if (str_starts_with($maNganh, '9') || str_starts_with($maNganh, '62')) {
            $loaiDaoTao = 'TienSy';
        }

        // Thử các năm khác nhau để tìm dữ liệu
        $years = [2024, 2023, 2022, 2021, 2020, 2019];
        $subjectsFound = false;

        foreach ($years as $year) {
            try {
                $response = Http::timeout(30)->get("{$apiUrl}/KeHoachDaoTao/{$loaiDaoTao}", [
                    'NamVao' => $year,
                    'MaNganh' => $maNganh
                ]);

                if (!$response->successful() || empty($response->json())) {
                    continue;
                }

                $data = $response->json();

                // Kiểm tra xem có dữ liệu hợp lệ không
                if (empty($data) || !isset($data[0]['tenMon'])) {
                    continue;
                }

                echo "   ✅ Tìm thấy " . count($data) . " môn học (năm $year)\n";
                $subjectsFound = true;

                $subjectCount = 0;

                foreach ($data as $item) {
                    // Bỏ qua nếu không có tên môn
                    if (!isset($item['tenMon']) || empty($item['tenMon'])) {
                        continue;
                    }

                    // Lấy mã môn từ hocPhanChu hoặc hocPhanSo
                    $maMon = trim($item['hocPhanChu'] ?? '');
                    if (empty($maMon)) {
                        $maMon = 'HP' . $item['hocPhanSo'];
                    }

                    $tenMon = trim($item['tenMon']);
                    $soTinChi = $item['soTinChi'] ?? 2;

                    // Tạo mô tả chi tiết từ các trường
                    $moTaParts = [];

                    if (isset($item['loaiHocPhan'])) {
                        $loaiHocPhanMap = [
                            'CH' => 'Chính trị',
                            'CN' => 'Chuyên ngành',
                            'TC' => 'Tự chọn',
                            'CS' => 'Cơ sở',
                        ];
                        $loaiText = $loaiHocPhanMap[$item['loaiHocPhan']] ?? $item['loaiHocPhan'];
                        $moTaParts[] = "Loại: $loaiText";
                    }

                    if (isset($item['baiTapLon']) && $item['baiTapLon']) {
                        $moTaParts[] = 'Có bài tập lớn';
                    }

                    if (isset($item['hocPhanSo'])) {
                        $moTaParts[] = "Học phần số: " . $item['hocPhanSo'];
                    }

                    $moTa = !empty($moTaParts) ? implode(', ', $moTaParts) : null;

                    // Insert môn học nếu chưa có trong cache
                    if (!isset($subjectsCache[$maMon])) {
                        try {
                            DB::statement(
                                "INSERT INTO subjects (maMon, tenMon, soTinChi, moTa, created_at, updated_at)
                                 VALUES (?, ?, ?, ?, NOW(), NOW())
                                 ON DUPLICATE KEY UPDATE
                                 tenMon = VALUES(tenMon),
                                 soTinChi = VALUES(soTinChi),
                                 moTa = VALUES(moTa),
                                 updated_at = NOW()",
                                [$maMon, $tenMon, $soTinChi, $moTa]
                            );

                            $subjectsCache[$maMon] = true;
                            $totalSubjects++;
                        } catch (\Exception $e) {
                            // Môn đã tồn tại
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
                    $totalMajorsWithSubjects++;
                }

                // Đã tìm thấy dữ liệu cho năm này, không cần thử năm khác
                break;

            } catch (\Exception $e) {
                // Tiếp tục thử năm khác
                continue;
            }
        }

        if (!$subjectsFound) {
            echo "   ℹ️  Không tìm thấy môn học (đã thử " . count($years) . " năm)\n";
        }

        echo "\n";

        // Sleep ngắn để tránh quá tải API
        usleep(200000); // 0.2 giây
    }

    DB::commit();

    echo str_repeat("=", 60) . "\n";
    echo "🎉 HOÀN THÀNH!\n";
    echo "📊 Tổng kết:\n";
    echo "   - Tổng số ngành đã xử lý: $majorCount\n";
    echo "   - Số ngành có môn học: $totalMajorsWithSubjects\n";
    echo "   - Số môn học mới tạo: $totalSubjects\n";
    echo "   - Tổng số liên kết ngành-môn học: $totalRelations\n";
    echo str_repeat("=", 60) . "\n";

    // Thống kê chi tiết
    echo "\n📈 Thống kê chi tiết:\n";
    $stats = DB::select("
        SELECT
            m.maNganh,
            m.tenNganh,
            COUNT(ms.id) as so_mon_hoc
        FROM majors m
        LEFT JOIN major_subjects ms ON m.id = ms.major_id
        GROUP BY m.id, m.maNganh, m.tenNganh
        HAVING so_mon_hoc > 0
        ORDER BY so_mon_hoc DESC
        LIMIT 10
    ");

    echo "\n🔝 Top 10 ngành có nhiều môn học nhất:\n";
    foreach ($stats as $stat) {
        echo "   - {$stat->tenNganh} ({$stat->maNganh}): {$stat->so_mon_hoc} môn\n";
    }

} catch (\Exception $e) {
    DB::rollBack();
    echo "\n❌ Lỗi: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}

