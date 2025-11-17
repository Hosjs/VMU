<?php
/**
 * Script nhanh để import môn học từ API vào database
 * Chạy: php import_subjects.php
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

echo "🚀 Bắt đầu import môn học từ API...\n\n";

$apiUrl = 'http://203.162.246.113:8088';

// Hàm lấy danh sách ngành
function getMajors($apiUrl, $type) {
    try {
        echo "📥 Đang lấy danh sách ngành $type...\n";
        $response = Http::timeout(30)->get("$apiUrl/NganhHoc/$type");

        if ($response->successful() && !empty($response->json())) {
            $data = $response->json();
            echo "   ✅ Tìm thấy " . count($data) . " ngành $type\n";
            return $data;
        }
        echo "   ⚠️  API trả về rỗng\n";
        return [];
    } catch (Exception $e) {
        echo "   ❌ Lỗi: " . $e->getMessage() . "\n";
        return [];
    }
}

// Hàm lấy môn học của ngành (thử nhiều endpoint)
function getSubjects($apiUrl, $maNganh) {
    $years = [2024, 2023, 2022, 2021, 2020, 2019, 2018];

    foreach ($years as $year) {
        try {
            // Thử endpoint HoSoHocVien - có thể chứa thông tin môn học
            $response = Http::timeout(30)->get("$apiUrl/HoSoHocVien/ThacSy", [
                'NamVao' => $year,
                'MaNganh' => $maNganh
            ]);

            if ($response->successful() && !empty($response->json())) {
                $data = $response->json();

                // Kiểm tra xem có field môn học không
                if (isset($data[0])) {
                    $firstItem = $data[0];

                    // Nếu có thông tin môn học (dựa vào các field đặc trưng)
                    if (isset($firstItem['maMon']) || isset($firstItem['tenMon'])) {
                        return $data;
                    }
                }
            }
        } catch (Exception $e) {
            continue;
        }
    }

    return [];
}

// Lấy danh sách ngành
$thacSyMajors = getMajors($apiUrl, 'ThacSy');
$tienSyMajors = getMajors($apiUrl, 'TienSy');
$allMajors = array_merge($thacSyMajors, $tienSyMajors);

if (empty($allMajors)) {
    echo "❌ Không tìm thấy ngành nào. Vui lòng kiểm tra API.\n";
    echo "\nℹ️  Bạn có thể thử thủ công:\n";
    echo "   curl 'http://203.162.246.113:8088/NganhHoc/ThacSy'\n";
    exit(1);
}

echo "\n✅ Tổng cộng: " . count($allMajors) . " ngành\n";
echo str_repeat("=", 60) . "\n\n";

$totalSubjects = 0;
$totalRelations = 0;
$majorCount = 0;

foreach ($allMajors as $majorData) {
    $majorCount++;
    $maNganh = $majorData['ma'] ?? $majorData['maNganh'] ?? null;
    $tenNganh = $majorData['tenNganhHoc'] ?? $majorData['tenNganh'] ?? null;

    if (!$maNganh || !$tenNganh) {
        echo "[$majorCount/" . count($allMajors) . "] ⚠️  Bỏ qua: Thiếu mã hoặc tên ngành\n\n";
        continue;
    }

    echo "[$majorCount/" . count($allMajors) . "] 🔄 Ngành: $tenNganh ($maNganh)\n";

    // Tạo hoặc cập nhật ngành
    try {
        $thoiGian = str_starts_with($maNganh, '8') ? 2.0 : 4.0;

        $major = DB::table('majors')->updateOrInsert(
            ['maNganh' => $maNganh],
            [
                'tenNganh' => $tenNganh,
                'ghiChu' => $majorData['moTa'] ?? $majorData['ghiChu'] ?? 'Import từ API',
                'thoi_gian_dao_tao' => $thoiGian,
                'updated_at' => now(),
            ]
        );

        // Lấy ID của major
        $majorRecord = DB::table('majors')->where('maNganh', $maNganh)->first();

        if (!$majorRecord) {
            echo "   ⚠️  Không thể tạo ngành\n";
            continue;
        }

    } catch (Exception $e) {
        echo "   ❌ Lỗi tạo ngành: " . $e->getMessage() . "\n";
        continue;
    }

    // Lấy môn học
    $subjectsData = getSubjects($apiUrl, $maNganh);

    if (empty($subjectsData)) {
        echo "   ℹ️  Không tìm thấy môn học\n\n";
        continue;
    }

    $subjectCount = 0;

    foreach ($subjectsData as $item) {
        // Kiểm tra xem item có phải là môn học không
        if (!isset($item['maMon']) || !isset($item['tenMon'])) {
            continue;
        }

        try {
            $maMon = $item['maMon'];
            $tenMon = $item['tenMon'];
            $soTinChi = $item['soTinChi'] ?? 3;

            // Insert subject
            DB::table('subjects')->insertOrIgnore([
                'maMon' => $maMon,
                'tenMon' => $tenMon,
                'soTinChi' => $soTinChi,
                'moTa' => $item['moTa'] ?? $item['ghiChu'] ?? null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $subject = DB::table('subjects')->where('maMon', $maMon)->first();

            if ($subject) {
                // Link major-subject
                DB::table('major_subjects')->insertOrIgnore([
                    'major_id' => $majorRecord->id,
                    'subject_id' => $subject->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $subjectCount++;
                $totalRelations++;
            }

        } catch (Exception $e) {
            echo "   ⚠️  Lỗi môn {$item['maMon']}: " . $e->getMessage() . "\n";
        }
    }

    if ($subjectCount > 0) {
        echo "   ✅ Import thành công $subjectCount môn học\n";
        $totalSubjects += $subjectCount;
    }

    echo "\n";
}

echo str_repeat("=", 60) . "\n";
echo "🎉 HOÀN THÀNH!\n";
echo "📊 Tổng kết:\n";
echo "   - Số ngành đã xử lý: $majorCount\n";
echo "   - Tổng số môn học: $totalSubjects\n";
echo "   - Tổng số liên kết: $totalRelations\n";
echo str_repeat("=", 60) . "\n";
