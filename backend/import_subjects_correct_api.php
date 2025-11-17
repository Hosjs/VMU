<?php
/**
 * Script import môn học từ API endpoint đúng
 * Chạy: php import_subjects_correct_api.php
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

echo "🚀 Bắt đầu import môn học từ API...\n\n";

$apiUrl = 'http://203.162.246.113:8088';

// Thử các endpoint có thể có để lấy môn học
$possibleEndpoints = [
    '/DanhMucHocPhan',
    '/MonHoc',
    '/HocPhan',
    '/ChuongTrinhDaoTao',
];

// Lấy tất cả ngành từ database
$majors = DB::table('majors')->get();

echo "📊 Tìm thấy " . count($majors) . " ngành trong database\n";
echo "🔍 Đang thử tìm endpoint đúng...\n\n";

$correctEndpoint = null;

// Thử tìm endpoint đúng với ngành 8480201
foreach ($possibleEndpoints as $endpoint) {
    try {
        echo "   Thử: $endpoint\n";
        $response = Http::timeout(10)->get($apiUrl . $endpoint, [
            'maNganh' => '8480201',
            'khoaHoc' => 2022
        ]);

        if ($response->successful() && !empty($response->json())) {
            $data = $response->json();
            if (isset($data[0]['tenMon']) || isset($data[0]['hocPhanChu'])) {
                $correctEndpoint = $endpoint;
                echo "   ✅ Tìm thấy endpoint đúng: $endpoint\n\n";
                break;
            }
        }
    } catch (\Exception $e) {
        continue;
    }
}

if (!$correctEndpoint) {
    echo "❌ Không tìm thấy endpoint API phù hợp!\n";
    echo "\n💡 GỢI Ý: Hãy cung cấp endpoint chính xác để lấy danh sách môn học.\n";
    echo "Ví dụ: http://203.162.246.113:8088/DanhMucHocPhan?maNganh=8480201&khoaHoc=2022\n\n";
    echo "Hoặc tôi sẽ import dữ liệu mẫu từ JSON bạn đã cung cấp...\n\n";

    // Import dữ liệu mẫu từ JSON đã cung cấp
    importFromSampleData();
    exit(0);
}

$totalSubjects = 0;
$totalRelations = 0;
$majorCount = 0;

DB::beginTransaction();

try {
    foreach ($majors as $major) {
        $majorCount++;
        $maNganh = $major->maNganh;
        $tenNganh = $major->tenNganh;

        echo "[$majorCount/" . count($majors) . "] 🔄 Ngành: $tenNganh ($maNganh)\n";

        // Thử các năm khác nhau
        $years = [2024, 2023, 2022, 2021, 2020];
        $subjectsFound = false;

        foreach ($years as $year) {
            try {
                $response = Http::timeout(30)->get($apiUrl . $correctEndpoint, [
                    'maNganh' => $maNganh,
                    'khoaHoc' => $year
                ]);

                if (!$response->successful() || empty($response->json())) {
                    continue;
                }

                $data = $response->json();

                if (empty($data)) {
                    continue;
                }

                echo "   ✅ Tìm thấy " . count($data) . " môn học (năm $year)\n";
                $subjectsFound = true;

                $subjectCount = 0;

                foreach ($data as $item) {
                    if (!isset($item['tenMon']) || empty($item['tenMon'])) {
                        continue;
                    }

                    $maMon = trim($item['hocPhanChu'] ?? $item['hocPhanSo'] ?? '');
                    if (!$maMon) continue;

                    $tenMon = trim($item['tenMon']);
                    $soTinChi = $item['soTinChi'] ?? 2;

                    // Tạo mô tả
                    $moTa = [];
                    if (isset($item['loaiHocPhan'])) {
                        $loaiMap = [
                            'CH' => 'Chính trị',
                            'CN' => 'Chuyên ngành',
                            'TC' => 'Tự chọn',
                            'CS' => 'Cơ sở',
                        ];
                        $moTa[] = 'Loại: ' . ($loaiMap[$item['loaiHocPhan']] ?? $item['loaiHocPhan']);
                    }
                    if (isset($item['baiTapLon']) && $item['baiTapLon']) {
                        $moTa[] = 'Có bài tập lớn';
                    }
                    $moTaText = !empty($moTa) ? implode(', ', $moTa) : null;

                    // Insert subject
                    DB::statement(
                        "INSERT IGNORE INTO subjects (maMon, tenMon, soTinChi, moTa, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())",
                        [$maMon, $tenMon, $soTinChi, $moTaText]
                    );

                    $subject = DB::table('subjects')->where('maMon', $maMon)->first();

                    if ($subject) {
                        DB::statement(
                            "INSERT IGNORE INTO major_subjects (major_id, subject_id) VALUES (?, ?)",
                            [$major->id, $subject->id]
                        );

                        $subjectCount++;
                        $totalRelations++;
                    }
                }

                if ($subjectCount > 0) {
                    echo "   📚 Đã liên kết $subjectCount môn học\n";
                    $totalSubjects += $subjectCount;
                }

                break;

            } catch (\Exception $e) {
                continue;
            }
        }

        if (!$subjectsFound) {
            echo "   ℹ️  Không tìm thấy môn học\n";
        }

        echo "\n";
        usleep(100000);
    }

    DB::commit();

    echo str_repeat("=", 60) . "\n";
    echo "🎉 HOÀN THÀNH!\n";
    echo "📊 Tổng kết:\n";
    echo "   - Số ngành đã xử lý: $majorCount\n";
    echo "   - Số môn học đã tạo: $totalSubjects\n";
    echo "   - Tổng số liên kết: $totalRelations\n";
    echo str_repeat("=", 60) . "\n";

} catch (\Exception $e) {
    DB::rollBack();
    echo "\n❌ Lỗi: " . $e->getMessage() . "\n";
}

/**
 * Import dữ liệu mẫu từ JSON đã cung cấp
 */
function importFromSampleData() {
    echo "📝 Đang import dữ liệu mẫu từ JSON...\n\n";

    // Dữ liệu mẫu cho ngành 8480201 (CNTT)
    $cnttSubjects = [
        ['maMon' => 'TH', 'tenMon' => 'Triết học', 'soTinChi' => 3, 'moTa' => 'Loại: Chính trị, Có bài tập lớn'],
        ['maMon' => 'TA', 'tenMon' => 'Tiếng Anh', 'soTinChi' => 3, 'moTa' => 'Loại: Chính trị'],
        ['maMon' => 'ITAI', 'tenMon' => 'Trí tuệ nhân tạo nâng cao', 'soTinChi' => 2, 'moTa' => 'Loại: Chuyên ngành, Có bài tập lớn'],
        ['maMon' => 'ITBD', 'tenMon' => 'Phân tích dữ liệu lớn', 'soTinChi' => 2, 'moTa' => 'Loại: Chuyên ngành, Có bài tập lớn'],
        ['maMon' => 'ITKB', 'tenMon' => 'Hệ cơ sở tri thức nâng cao', 'soTinChi' => 2, 'moTa' => 'Loại: Chuyên ngành, Có bài tập lớn'],
        ['maMon' => 'ITPM', 'tenMon' => 'Quản trị dự án công nghệ thông tin', 'soTinChi' => 2, 'moTa' => 'Loại: Chuyên ngành, Có bài tập lớn'],
        ['maMon' => 'ITIS', 'tenMon' => 'An toàn bảo mật thông tin', 'soTinChi' => 2, 'moTa' => 'Loại: Chuyên ngành, Có bài tập lớn'],
        ['maMon' => 'ITCV', 'tenMon' => 'Thị giác máy tính', 'soTinChi' => 2, 'moTa' => 'Loại: Chuyên ngành, Có bài tập lớn'],
        ['maMon' => 'ITPP', 'tenMon' => 'Nguyên lí các ngôn ngữ lập trình', 'soTinChi' => 2, 'moTa' => 'Loại: Tự chọn, Có bài tập lớn'],
        ['maMon' => 'ITCA', 'tenMon' => 'Kiến trúc máy tính tiên tiến', 'soTinChi' => 2, 'moTa' => 'Loại: Tự chọn, Có bài tập lớn'],
        ['maMon' => 'ITKH', 'tenMon' => 'Phương pháp nghiên cứu khoa học', 'soTinChi' => 2, 'moTa' => 'Loại: Cơ sở, Có bài tập lớn'],
        ['maMon' => 'ITMA', 'tenMon' => 'Các phương pháp phân tích thiết kế phần mềm tiên tiến', 'soTinChi' => 2, 'moTa' => 'Loại: Cơ sở, Có bài tập lớn'],
        ['maMon' => 'ITBT', 'tenMon' => 'Công nghệ Chuỗi khối', 'soTinChi' => 2, 'moTa' => 'Loại: Tự chọn, Có bài tập lớn'],
        ['maMon' => 'ITOS', 'tenMon' => 'Các hệ thống mã nguồn mở và di động', 'soTinChi' => 2, 'moTa' => 'Loại: Tự chọn, Có bài tập lớn'],
        ['maMon' => 'ITHC', 'tenMon' => 'Tương tác người- máy', 'soTinChi' => 2, 'moTa' => 'Loại: Tự chọn, Có bài tập lớn'],
        ['maMon' => 'ITTQ', 'tenMon' => 'Kiểm thử và đảm bảo chất lượng phần mềm', 'soTinChi' => 2, 'moTa' => 'Loại: Tự chọn, Có bài tập lớn'],
        ['maMon' => 'ITCC', 'tenMon' => 'Điện toán đám mây', 'soTinChi' => 2, 'moTa' => 'Loại: Tự chọn, Có bài tập lớn'],
        ['maMon' => 'ITDL', 'tenMon' => 'Kĩ thuật học sâu và ứng dụng', 'soTinChi' => 2, 'moTa' => 'Loại: Tự chọn, Có bài tập lớn'],
        ['maMon' => 'ITDT', 'tenMon' => 'Siêu dữ liệu', 'soTinChi' => 2, 'moTa' => 'Loại: Tự chọn, Có bài tập lớn'],
        ['maMon' => 'ITSA', 'tenMon' => 'Kiến trúc phần mềm tiên tiến', 'soTinChi' => 2, 'moTa' => 'Loại: Tự chọn, Có bài tập lớn'],
        ['maMon' => 'ITML', 'tenMon' => 'Học máy', 'soTinChi' => 2, 'moTa' => 'Loại: Tự chọn, Có bài tập lớn'],
        ['maMon' => 'ITNLP', 'tenMon' => 'Xử lý ngôn ngữ tự nhiên', 'soTinChi' => 2, 'moTa' => 'Loại: Tự chọn, Có bài tập lớn'],
        ['maMon' => 'ITTN', 'tenMon' => 'Thực tập tốt nghiệp', 'soTinChi' => 7, 'moTa' => 'Loại: Chuyên ngành'],
    ];

    // Dữ liệu mẫu cho ngành 8310110 (Quản lý kinh tế)
    $qlktSubjects = [
        ['maMon' => 'TH', 'tenMon' => 'Triết học', 'soTinChi' => 3, 'moTa' => 'Loại: Chính trị, Có bài tập lớn'],
        ['maMon' => 'TA', 'tenMon' => 'Tiếng Anh', 'soTinChi' => 3, 'moTa' => 'Loại: Chính trị'],
        ['maMon' => 'QLCO', 'tenMon' => 'Quản lý công', 'soTinChi' => 2, 'moTa' => 'Loại: Chuyên ngành, Có bài tập lớn'],
        ['maMon' => 'QLĐT', 'tenMon' => 'Đầu tư', 'soTinChi' => 2, 'moTa' => 'Loại: Chuyên ngành, Có bài tập lớn'],
        ['maMon' => 'QLCT', 'tenMon' => 'Quản trị công ty', 'soTinChi' => 2, 'moTa' => 'Loại: Chuyên ngành, Có bài tập lớn'],
        ['maMon' => 'QLTC', 'tenMon' => 'Quản trị tài chính', 'soTinChi' => 2, 'moTa' => 'Loại: Chuyên ngành, Có bài tập lớn'],
        ['maMon' => 'QLCS', 'tenMon' => 'Phân tích chính sách kinh tế - xã hội', 'soTinChi' => 2, 'moTa' => 'Loại: Chuyên ngành, Có bài tập lớn'],
        ['maMon' => 'QLCL', 'tenMon' => 'Quản trị chiến lược', 'soTinChi' => 2, 'moTa' => 'Loại: Chuyên ngành, Có bài tập lớn'],
        ['maMon' => 'QLTK', 'tenMon' => 'Thống kê kinh tế', 'soTinChi' => 2, 'moTa' => 'Loại: Tự chọn, Có bài tập lớn'],
        ['maMon' => 'QLKTH', 'tenMon' => 'Kinh tế học', 'soTinChi' => 2, 'moTa' => 'Loại: Cơ sở, Có bài tập lớn'],
        ['maMon' => 'QLPT', 'tenMon' => 'Phân tích hoạt động kinh tế', 'soTinChi' => 2, 'moTa' => 'Loại: Cơ sở, Có bài tập lớn'],
        ['maMon' => 'QLKH', 'tenMon' => 'Phương pháp nghiên cứu khoa học', 'soTinChi' => 2, 'moTa' => 'Loại: Tự chọn, Có bài tập lớn'],
        ['maMon' => 'QLLD', 'tenMon' => 'Lãnh đạo', 'soTinChi' => 2, 'moTa' => 'Loại: Tự chọn, Có bài tập lớn'],
        ['maMon' => 'QLKQ', 'tenMon' => 'Kế toán quản trị', 'soTinChi' => 2, 'moTa' => 'Loại: Tự chọn, Có bài tập lớn'],
        ['maMon' => 'QLMA', 'tenMon' => 'Marketing', 'soTinChi' => 2, 'moTa' => 'Loại: Tự chọn, Có bài tập lớn'],
        ['maMon' => 'QLLU', 'tenMon' => 'Luật kinh tế', 'soTinChi' => 2, 'moTa' => 'Loại: Tự chọn, Có bài tập lớn'],
        ['maMon' => 'QLTL', 'tenMon' => 'Quản trị tiền lương', 'soTinChi' => 2, 'moTa' => 'Loại: Tự chọn, Có bài tập lớn'],
        ['maMon' => 'QLQĐ', 'tenMon' => 'Kỹ năng ra quyết định trong quản lý', 'soTinChi' => 2, 'moTa' => 'Loại: Tự chọn, Có bài tập lớn'],
        ['maMon' => 'QLTH', 'tenMon' => 'Quản lý thuế', 'soTinChi' => 2, 'moTa' => 'Loại: Tự chọn, Có bài tập lớn'],
        ['maMon' => 'QLNN', 'tenMon' => 'Quản lý Nhà nước về kinh tế', 'soTinChi' => 2, 'moTa' => 'Loại: Chuyên ngành, Có bài tập lớn'],
        ['maMon' => 'QLNL', 'tenMon' => 'Quản lý nguồn nhân lực', 'soTinChi' => 2, 'moTa' => 'Loại: Chuyên ngành, Có bài tập lớn'],
        ['maMon' => 'TTTN', 'tenMon' => 'Thực tập tốt nghiệp', 'soTinChi' => 7, 'moTa' => 'Loại: Chuyên ngành'],
    ];

    DB::beginTransaction();

    try {
        $totalImported = 0;

        // Import CNTT
        $major8480201 = DB::table('majors')->where('maNganh', '8480201')->first();
        if ($major8480201) {
            echo "📚 Import môn học cho ngành Công nghệ thông tin (8480201)...\n";
            foreach ($cnttSubjects as $subject) {
                DB::statement(
                    "INSERT IGNORE INTO subjects (maMon, tenMon, soTinChi, moTa, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())",
                    [$subject['maMon'], $subject['tenMon'], $subject['soTinChi'], $subject['moTa']]
                );

                $subj = DB::table('subjects')->where('maMon', $subject['maMon'])->first();
                if ($subj) {
                    DB::statement(
                        "INSERT IGNORE INTO major_subjects (major_id, subject_id) VALUES (?, ?)",
                        [$major8480201->id, $subj->id]
                    );
                    $totalImported++;
                }
            }
            echo "   ✅ Đã import " . count($cnttSubjects) . " môn học\n\n";
        }

        // Import Quản lý kinh tế
        $major8310110 = DB::table('majors')->where('maNganh', '8310110')->first();
        if ($major8310110) {
            echo "📚 Import môn học cho ngành Quản lý kinh tế (8310110)...\n";
            foreach ($qlktSubjects as $subject) {
                DB::statement(
                    "INSERT IGNORE INTO subjects (maMon, tenMon, soTinChi, moTa, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())",
                    [$subject['maMon'], $subject['tenMon'], $subject['soTinChi'], $subject['moTa']]
                );

                $subj = DB::table('subjects')->where('maMon', $subject['maMon'])->first();
                if ($subj) {
                    DB::statement(
                        "INSERT IGNORE INTO major_subjects (major_id, subject_id) VALUES (?, ?)",
                        [$major8310110->id, $subj->id]
                    );
                    $totalImported++;
                }
            }
            echo "   ✅ Đã import " . count($qlktSubjects) . " môn học\n\n";
        }

        DB::commit();

        echo str_repeat("=", 60) . "\n";
        echo "🎉 HOÀN THÀNH!\n";
        echo "📊 Đã import thành công $totalImported môn học cho 2 ngành mẫu\n";
        echo str_repeat("=", 60) . "\n";

    } catch (\Exception $e) {
        DB::rollBack();
        echo "❌ Lỗi: " . $e->getMessage() . "\n";
    }
}

