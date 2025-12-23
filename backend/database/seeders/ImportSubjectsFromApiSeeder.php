<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use App\Models\Major;
use App\Models\Subject;

class ImportSubjectsFromApiSeeder extends Seeder
{
    private $externalApiUrl = 'http://203.162.246.113:8088';

    /**
     * Run the database seeds.
     *
     * Cách sử dụng:
     * php artisan db:seed --class=ImportSubjectsFromApiSeeder
     *
     * Lưu ý: Bạn cần cung cấp đúng API endpoint để lấy môn học.
     * Hiện tại seeder sẽ sử dụng dữ liệu mẫu nếu không tìm thấy API môn học.
     */
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        echo "🚀 Bắt đầu import môn học từ API...\n\n";

        // Bước 1: Lấy danh sách ngành Thạc sỹ và Tiến sỹ
        $allMajors = $this->getAllMajors();

        if (empty($allMajors)) {
            echo "❌ Không tìm thấy ngành nào từ API. Sử dụng dữ liệu mẫu...\n";
            $allMajors = $this->getSampleMajors();
        }

        echo "✅ Tìm thấy " . count($allMajors) . " ngành học\n\n";

        $totalSubjects = 0;
        $totalRelations = 0;
        $majorCount = 0;

        foreach ($allMajors as $majorData) {
            $majorCount++;
            $maNganh = $majorData['maNganh'];
            $tenNganh = $majorData['tenNganh'];

            echo "[$majorCount/" . count($allMajors) . "] 🔄 Đang xử lý ngành: $tenNganh ($maNganh)...\n";

            // Bước 2: Tạo hoặc cập nhật ngành trong database
            $major = $this->createOrUpdateMajor($majorData);

            if (!$major) {
                echo "   ⚠️  Không thể tạo ngành $maNganh\n";
                continue;
            }

            // Bước 3: Lấy danh sách môn học của ngành từ API
            $subjects = $this->getSubjectsForMajor($maNganh);

            if (empty($subjects)) {
                echo "   ℹ️  Không có môn học nào từ API\n";
                continue;
            }

            $subjectCount = 0;

            // Bước 4: Import từng môn học
            foreach ($subjects as $subjectData) {
                try {
                    // Tạo hoặc lấy môn học
                    $subject = Subject::firstOrCreate(
                        ['maMon' => $subjectData['maMon']],
                        [
                            'tenMon' => $subjectData['tenMon'],
                            'soTinChi' => $subjectData['soTinChi'],
                            'moTa' => $subjectData['moTa'] ?? null,
                        ]
                    );

                    // Liên kết môn học với ngành
                    DB::table('major_subjects')->updateOrInsert(
                        [
                            'major_id' => $major->id,
                            'subject_id' => $subject->id,
                        ],
                        [
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]
                    );

                    $subjectCount++;
                    $totalRelations++;

                    if ($subject->wasRecentlyCreated) {
                        $totalSubjects++;
                    }

                } catch (\Exception $e) {
                    echo "   ❌ Lỗi khi import môn {$subjectData['maMon']}: " . $e->getMessage() . "\n";
                }
            }

            echo "   ✅ Đã import $subjectCount môn học\n";
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        echo "\n" . str_repeat("=", 60) . "\n";
        echo "🎉 HOÀN THÀNH!\n";
        echo "📊 Tổng kết:\n";
        echo "   - Số ngành đã xử lý: " . count($allMajors) . "\n";
        echo "   - Số môn học mới tạo: $totalSubjects\n";
        echo "   - Tổng số liên kết ngành-môn học: $totalRelations\n";
        echo str_repeat("=", 60) . "\n";
    }

    /**
     * Lấy tất cả danh sách ngành từ API
     */
    private function getAllMajors(): array
    {
        echo "📥 Đang lấy danh sách ngành từ API...\n";

        $allMajors = [];

        // Lấy ngành Thạc sỹ
        $thacSyMajors = $this->getMajorsFromApi('ThacSy');
        if (!empty($thacSyMajors)) {
            $allMajors = array_merge($allMajors, $thacSyMajors);
        }

        // Lấy ngành Tiến sỹ
        $tienSyMajors = $this->getMajorsFromApi('TienSy');
        if (!empty($tienSyMajors)) {
            $allMajors = array_merge($allMajors, $tienSyMajors);
        }

        return $allMajors;
    }

    /**
     * Lấy danh sách ngành từ API
     */
    private function getMajorsFromApi(string $type): array
    {
        try {
            $response = Http::timeout(30)->get("{$this->externalApiUrl}/NganhHoc/{$type}");

            if ($response->successful() && !empty($response->json())) {
                return $response->json();
            }

            return [];

        } catch (\Exception $e) {
            echo "   ⚠️  Lỗi khi gọi API ngành $type: " . $e->getMessage() . "\n";
            return [];
        }
    }

    /**
     * Lấy danh sách môn học của một ngành từ API
     *
     * TODO: Cần cập nhật endpoint đúng để lấy môn học
     * Hiện tại API /HoSoHocVien/ThacSy trả về thông tin học viên, không phải môn học
     */
    private function getSubjectsForMajor(string $maNganh): array
    {
        try {
            // TODO: Thay thế bằng endpoint đúng để lấy môn học
            // Ví dụ: /MonHoc/{maNganh} hoặc /KhoaHoc/{maNganh}

            $years = [2024, 2023, 2022, 2021, 2020];

            foreach ($years as $year) {
                // Thử với endpoint khác nếu có
                $endpoints = [
                    "/MonHoc/ByNganh?MaNganh={$maNganh}",
                    "/KhoaHoc/ByNganh?MaNganh={$maNganh}&NamVao={$year}",
                    "/ChuongTrinhDaoTao/ThacSy?MaNganh={$maNganh}",
                ];

                foreach ($endpoints as $endpoint) {
                    try {
                        $response = Http::timeout(30)->get($this->externalApiUrl . $endpoint);

                        if ($response->successful() && !empty($response->json())) {
                            $data = $response->json();

                            // Kiểm tra xem response có chứa thông tin môn học không
                            if ($this->isSubjectData($data)) {
                                return $this->parseSubjectData($data);
                            }
                        }
                    } catch (\Exception $e) {
                        continue;
                    }
                }
            }

            return [];

        } catch (\Exception $e) {
            return [];
        }
    }

    /**
     * Kiểm tra xem dữ liệu có phải là môn học không
     */
    private function isSubjectData($data): bool
    {
        if (!is_array($data) || empty($data)) {
            return false;
        }

        $firstItem = $data[0];

        // Kiểm tra các trường đặc trưng của môn học
        return isset($firstItem['maMon']) ||
               isset($firstItem['tenMon']) ||
               isset($firstItem['soTinChi']);
    }

    /**
     * Parse dữ liệu môn học từ API
     */
    private function parseSubjectData($data): array
    {
        $subjects = [];

        foreach ($data as $item) {
            if (isset($item['maMon']) && isset($item['tenMon'])) {
                $maMon = $item['maMon'];
                $subjects[$maMon] = [
                    'maMon' => $maMon,
                    'tenMon' => $item['tenMon'],
                    'soTinChi' => $item['soTinChi'] ?? 3,
                    'moTa' => $item['moTa'] ?? $item['ghiChu'] ?? null,
                ];
            }
        }

        return array_values($subjects);
    }

    /**
     * Tạo hoặc cập nhật ngành trong database
     */
    private function createOrUpdateMajor(array $majorData): ?Major
    {
        try {
            $maNganh = $majorData['maNganh'];

            $major = Major::updateOrCreate(
                ['maNganh' => $maNganh],
                [
                    'tenNganh' => $majorData['tenNganh'],
                    'ghiChu' => $majorData['moTa'] ?? $majorData['ghiChu'] ?? 'Import từ API',
                    'thoi_gian_dao_tao' => $this->getThoiGianDaoTao($maNganh),
                ]
            );

            return $major;

        } catch (\Exception $e) {
            echo "   ❌ Lỗi khi tạo ngành: " . $e->getMessage() . "\n";
            return null;
        }
    }

    /**
     * Xác định thời gian đào tạo dựa trên mã ngành
     */
    private function getThoiGianDaoTao(string $maNganh): float
    {
        // Thạc sỹ (mã bắt đầu bằng 8): 2 năm
        if (str_starts_with($maNganh, '8')) {
            return 2.0;
        }

        // Tiến sỹ (mã bắt đầu bằng 9): 4 năm
        if (str_starts_with($maNganh, '9')) {
            return 4.0;
        }

        return 2.0; // Mặc định
    }

    /**
     * Dữ liệu ngành mẫu (fallback nếu API không hoạt động)
     */
    private function getSampleMajors(): array
    {
        return [
            [
                'maNganh' => '8310110',
                'tenNganh' => 'Kỹ thuật Điện tử, Truyền thông',
                'moTa' => 'Ngành đào tạo về điện tử và truyền thông',
            ],
            [
                'maNganh' => '8480101',
                'tenNganh' => 'Kinh tế',
                'moTa' => 'Ngành đào tạo về kinh tế',
            ],
            [
                'maNganh' => '8520101',
                'tenNganh' => 'Quản trị kinh doanh',
                'moTa' => 'Ngành đào tạo về quản trị',
            ],
        ];
    }
}
