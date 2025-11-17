<?php
/**
 * Script import môn học thủ công từ dữ liệu mẫu
 * Chạy: php import_subjects_manual.php
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "🚀 Bắt đầu import môn học từ dữ liệu mẫu...\n\n";

// Dữ liệu mẫu môn học cho ngành 8310110 (Quản lý kinh tế)
$subjectsData = [
    // Thêm môn học của bạn vào đây
    [
        'maMon' => 'QL01',
        'tenMon' => 'Kinh tế vi mô nâng cao',
        'soTinChi' => 3,
        'moTa' => 'Nghiên cứu về hành vi của cá nhân và doanh nghiệp trong nền kinh tế',
        'maNganh' => ['8310110'],
    ],
    [
        'maMon' => 'QL02',
        'tenMon' => 'Kinh tế vĩ mô nâng cao',
        'soTinChi' => 3,
        'moTa' => 'Phân tích các vấn đề kinh tế ở cấp độ quốc gia',
        'maNganh' => ['8310110'],
    ],
    [
        'maMon' => 'QL03',
        'tenMon' => 'Phương pháp nghiên cứu khoa học',
        'soTinChi' => 2,
        'moTa' => 'Các phương pháp nghiên cứu trong kinh tế',
        'maNganh' => ['8310110', '83101101'],
    ],
    [
        'maMon' => 'TC01',
        'tenMon' => 'Quản trị tài chính doanh nghiệp',
        'soTinChi' => 3,
        'moTa' => 'Quản lý tài chính trong doanh nghiệp',
        'maNganh' => ['83101101'],
    ],
    [
        'maMon' => 'TC02',
        'tenMon' => 'Thị trường tài chính',
        'soTinChi' => 3,
        'moTa' => 'Nghiên cứu về thị trường tài chính và chứng khoán',
        'maNganh' => ['83101101'],
    ],
];

echo "📊 Dữ liệu: " . count($subjectsData) . " môn học\n\n";

$totalSubjects = 0;
$totalRelations = 0;

DB::beginTransaction();

try {
    foreach ($subjectsData as $item) {
        $maMon = $item['maMon'];
        $tenMon = $item['tenMon'];
        $soTinChi = $item['soTinChi'];
        $moTa = $item['moTa'] ?? null;
        $maNganhList = $item['maNganh'] ?? [];

        echo "🔄 Đang xử lý môn: $tenMon ($maMon)...\n";

        // Insert hoặc update môn học
        DB::table('subjects')->insertOrIgnore([
            'maMon' => $maMon,
            'tenMon' => $tenMon,
            'soTinChi' => $soTinChi,
            'moTa' => $moTa,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $subject = DB::table('subjects')->where('maMon', $maMon)->first();

        if (!$subject) {
            echo "   ⚠️  Không thể tạo môn học\n";
            continue;
        }

        $totalSubjects++;

        // Liên kết với các ngành
        foreach ($maNganhList as $maNganh) {
            $major = DB::table('majors')->where('maNganh', $maNganh)->first();

            if ($major) {
                DB::table('major_subjects')->insertOrIgnore([
                    'major_id' => $major->id,
                    'subject_id' => $subject->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $totalRelations++;
                echo "   ✅ Liên kết với ngành $maNganh\n";
            } else {
                echo "   ⚠️  Không tìm thấy ngành $maNganh\n";
            }
        }

        echo "\n";
    }

    DB::commit();

    echo str_repeat("=", 60) . "\n";
    echo "🎉 HOÀN THÀNH!\n";
    echo "📊 Tổng kết:\n";
    echo "   - Số môn học đã tạo: $totalSubjects\n";
    echo "   - Tổng số liên kết ngành-môn học: $totalRelations\n";
    echo str_repeat("=", 60) . "\n";

} catch (Exception $e) {
    DB::rollBack();
    echo "\n❌ Lỗi: " . $e->getMessage() . "\n";
}

