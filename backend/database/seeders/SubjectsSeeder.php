<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SubjectsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Cách sử dụng:
     * php artisan db:seed --class=SubjectsSeeder
     */
    public function run(): void
    {
        DB::beginTransaction();

        try {
            echo "🚀 Bắt đầu import môn học...\n\n";

            // Dữ liệu môn học mẫu cho các ngành
            $subjectsData = $this->getSubjectsData();

            $totalSubjects = 0;
            $totalRelations = 0;

            foreach ($subjectsData as $item) {
                $maMon = $item['maMon'];
                $tenMon = $item['tenMon'];
                $soTinChi = $item['soTinChi'];
                $moTa = $item['moTa'] ?? null;
                $maNganhList = $item['maNganh'] ?? [];

                echo "📚 Môn: $tenMon ($maMon)\n";

                // Insert môn học
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
                    }
                }

                echo "   ✅ Liên kết với " . count($maNganhList) . " ngành\n";
            }

            DB::commit();

            echo "\n" . str_repeat("=", 60) . "\n";
            echo "🎉 HOÀN THÀNH!\n";
            echo "📊 Tổng kết:\n";
            echo "   - Số môn học: $totalSubjects\n";
            echo "   - Tổng số liên kết: $totalRelations\n";
            echo str_repeat("=", 60) . "\n";

        } catch (\Exception $e) {
            DB::rollBack();
            echo "\n❌ Lỗi: " . $e->getMessage() . "\n";
        }
    }

    /**
     * Dữ liệu môn học mẫu
     */
    private function getSubjectsData(): array
    {
        return [
            // ========== MÔN CHUNG CHO TẤT CẢ NGÀNH ==========
            [
                'maMon' => 'COMMON01',
                'tenMon' => 'Triết học',
                'soTinChi' => 3,
                'moTa' => 'Môn học bắt buộc về triết học',
                'maNganh' => ['8310110', '83101101', '8480201', '8520116', '8520216', '8520320', '8580201', '8580202', '8840103', '8840106'],
            ],
            [
                'maMon' => 'COMMON02',
                'tenMon' => 'Tiếng Anh nâng cao',
                'soTinChi' => 3,
                'moTa' => 'Tiếng Anh cho học viên sau đại học',
                'maNganh' => ['8310110', '83101101', '8480201', '8520116', '8520216', '8520320', '8580201', '8580202', '8840103', '8840106'],
            ],
            [
                'maMon' => 'COMMON03',
                'tenMon' => 'Phương pháp nghiên cứu khoa học',
                'soTinChi' => 2,
                'moTa' => 'Phương pháp luận nghiên cứu khoa học',
                'maNganh' => ['8310110', '83101101', '8480201', '8520116', '8520216', '8520320', '8580201', '8580202', '8840103', '8840106'],
            ],

            // ========== QUẢN LÝ KINH TẾ (8310110) ==========
            [
                'maMon' => 'QL01',
                'tenMon' => 'Kinh tế vi mô nâng cao',
                'soTinChi' => 3,
                'moTa' => 'Lý thuyết kinh tế vi mô ở trình độ sau đại học',
                'maNganh' => ['8310110', '9310110'],
            ],
            [
                'maMon' => 'QL02',
                'tenMon' => 'Kinh tế vĩ mô nâng cao',
                'soTinChi' => 3,
                'moTa' => 'Lý thuyết kinh tế vĩ mô ở trình độ sau đại học',
                'maNganh' => ['8310110', '9310110'],
            ],
            [
                'maMon' => 'QL03',
                'tenMon' => 'Kinh tế lượng',
                'soTinChi' => 3,
                'moTa' => 'Phương pháp định lượng trong kinh tế',
                'maNganh' => ['8310110', '83101101', '9310110'],
            ],
            [
                'maMon' => 'QL04',
                'tenMon' => 'Quản trị chiến lược',
                'soTinChi' => 3,
                'moTa' => 'Chiến lược và quản trị doanh nghiệp',
                'maNganh' => ['8310110', '8310110-1', '9310110'],
            ],
            [
                'maMon' => 'QL05',
                'tenMon' => 'Quản trị dự án',
                'soTinChi' => 3,
                'moTa' => 'Kỹ năng quản lý dự án',
                'maNganh' => ['8310110', '8310110-1', '85802011'],
            ],

            // ========== QUẢN LÝ TÀI CHÍNH (83101101) ==========
            [
                'maMon' => 'TC01',
                'tenMon' => 'Quản trị tài chính doanh nghiệp nâng cao',
                'soTinChi' => 3,
                'moTa' => 'Quản lý tài chính trong tổ chức',
                'maNganh' => ['83101101', '8310110'],
            ],
            [
                'maMon' => 'TC02',
                'tenMon' => 'Thị trường tài chính',
                'soTinChi' => 3,
                'moTa' => 'Phân tích thị trường tài chính và chứng khoán',
                'maNganh' => ['83101101'],
            ],
            [
                'maMon' => 'TC03',
                'tenMon' => 'Phân tích đầu tư',
                'soTinChi' => 3,
                'moTa' => 'Phương pháp phân tích và định giá đầu tư',
                'maNganh' => ['83101101'],
            ],
            [
                'maMon' => 'TC04',
                'tenMon' => 'Quản trị rủi ro tài chính',
                'soTinChi' => 3,
                'moTa' => 'Nhận diện và quản lý rủi ro tài chính',
                'maNganh' => ['83101101'],
            ],

            // ========== CÔNG NGHỆ THÔNG TIN (8480201) ==========
            [
                'maMon' => 'CNTT01',
                'tenMon' => 'Thuật toán nâng cao',
                'soTinChi' => 3,
                'moTa' => 'Thiết kế và phân tích thuật toán',
                'maNganh' => ['8480201', '9480201', '9480101'],
            ],
            [
                'maMon' => 'CNTT02',
                'tenMon' => 'Cơ sở dữ liệu nâng cao',
                'soTinChi' => 3,
                'moTa' => 'Hệ quản trị cơ sở dữ liệu và tối ưu hóa',
                'maNganh' => ['8480201', '9480201', '9480101'],
            ],
            [
                'maMon' => 'CNTT03',
                'tenMon' => 'Trí tuệ nhân tạo',
                'soTinChi' => 3,
                'moTa' => 'Machine Learning và Deep Learning',
                'maNganh' => ['8480201', '9480201', '9480101'],
            ],
            [
                'maMon' => 'CNTT04',
                'tenMon' => 'Khai phá dữ liệu',
                'soTinChi' => 3,
                'moTa' => 'Kỹ thuật khai thác tri thức từ dữ liệu',
                'maNganh' => ['8480201', '9480201', '9480101'],
            ],
            [
                'maMon' => 'CNTT05',
                'tenMon' => 'An toàn và bảo mật thông tin',
                'soTinChi' => 3,
                'moTa' => 'Các kỹ thuật bảo mật hệ thống',
                'maNganh' => ['8480201', '9480201'],
            ],

            // ========== KỸ THUẬT TÀU THỦY (8520116) ==========
            [
                'maMon' => 'TT01',
                'tenMon' => 'Lý thuyết tàu',
                'soTinChi' => 3,
                'moTa' => 'Cơ sở lý thuyết về thiết kế và vận hành tàu thủy',
                'maNganh' => ['8520116', '9520116', '9520117'],
            ],
            [
                'maMon' => 'TT02',
                'tenMon' => 'Kết cấu tàu nâng cao',
                'soTinChi' => 3,
                'moTa' => 'Thiết kế và tính toán kết cấu tàu',
                'maNganh' => ['8520116', '9520116', '9520120'],
            ],
            [
                'maMon' => 'TT03',
                'tenMon' => 'Động lực tàu thủy',
                'soTinChi' => 3,
                'moTa' => 'Hệ thống động lực và năng lượng tàu',
                'maNganh' => ['8520116', '85201162', '9520115', '9520119'],
            ],
            [
                'maMon' => 'TT04',
                'tenMon' => 'Khai thác và bảo dưỡng tàu',
                'soTinChi' => 3,
                'moTa' => 'Quản lý khai thác và bảo trì tàu thủy',
                'maNganh' => ['8520116', '85201161', '9520117'],
            ],

            // ========== KỸ THUẬT ĐIỀU KHIỂN VÀ TỰ ĐỘNG HÓA (8520216) ==========
            [
                'maMon' => 'DK01',
                'tenMon' => 'Lý thuyết điều khiển hiện đại',
                'soTinChi' => 3,
                'moTa' => 'Các phương pháp điều khiển nâng cao',
                'maNganh' => ['8520216', '9520216', '9520218'],
            ],
            [
                'maMon' => 'DK02',
                'tenMon' => 'Hệ thống nhúng',
                'soTinChi' => 3,
                'moTa' => 'Thiết kế và lập trình hệ thống nhúng',
                'maNganh' => ['8520216', '9520216'],
            ],
            [
                'maMon' => 'DK03',
                'tenMon' => 'PLC và SCADA',
                'soTinChi' => 3,
                'moTa' => 'Lập trình PLC và giám sát SCADA',
                'maNganh' => ['8520216', '9520216', '9520218'],
            ],
            [
                'maMon' => 'DK04',
                'tenMon' => 'Robot công nghiệp',
                'soTinChi' => 3,
                'moTa' => 'Điều khiển và lập trình robot',
                'maNganh' => ['8520216', '9520216'],
            ],

            // ========== KỸ THUẬT MÔI TRƯỜNG (8520320) ==========
            [
                'maMon' => 'MT01',
                'tenMon' => 'Quản lý môi trường',
                'soTinChi' => 3,
                'moTa' => 'Quản lý tài nguyên và môi trường',
                'maNganh' => ['8520320', '85203201', '9520320', '9440301'],
            ],
            [
                'maMon' => 'MT02',
                'tenMon' => 'Xử lý nước thải',
                'soTinChi' => 3,
                'moTa' => 'Công nghệ xử lý nước thải',
                'maNganh' => ['8520320', '9520320'],
            ],
            [
                'maMon' => 'MT03',
                'tenMon' => 'Đánh giá tác động môi trường',
                'soTinChi' => 3,
                'moTa' => 'Phương pháp ĐTM',
                'maNganh' => ['8520320', '85203201', '9520320'],
            ],

            // ========== KỸ THUẬT XÂY DỰNG (8580201, 8580202) ==========
            [
                'maMon' => 'XD01',
                'tenMon' => 'Kết cấu bê tông cốt thép nâng cao',
                'soTinChi' => 3,
                'moTa' => 'Tính toán và thiết kế BTCT',
                'maNganh' => ['8580201', '8580202', '9580203', '9580202'],
            ],
            [
                'maMon' => 'XD02',
                'tenMon' => 'Cơ học đất',
                'soTinChi' => 3,
                'moTa' => 'Nghiên cứu tính chất đất nền',
                'maNganh' => ['8580201', '8580202', '9580203', '9580202'],
            ],
            [
                'maMon' => 'XD03',
                'tenMon' => 'Quản lý dự án xây dựng',
                'soTinChi' => 3,
                'moTa' => 'Quản lý thi công và giám sát công trình',
                'maNganh' => ['8580201', '85802011', '9580203', '9580201'],
            ],
            [
                'maMon' => 'XD04',
                'tenMon' => 'Công trình thủy',
                'soTinChi' => 3,
                'moTa' => 'Thiết kế công trình thủy lợi và hàng hải',
                'maNganh' => ['8580202', '9580202'],
            ],

            // ========== QUẢN LÝ VẬN TẢI VÀ LOGISTICS (8840103) ==========
            [
                'maMon' => 'VT01',
                'tenMon' => 'Quản lý chuỗi cung ứng',
                'soTinChi' => 3,
                'moTa' => 'Supply Chain Management',
                'maNganh' => ['8840103', '9340111', '9340411', '9340412'],
            ],
            [
                'maMon' => 'VT02',
                'tenMon' => 'Logistics quốc tế',
                'soTinChi' => 3,
                'moTa' => 'Quản lý logistics trong thương mại quốc tế',
                'maNganh' => ['8840103', '9340111'],
            ],
            [
                'maMon' => 'VT03',
                'tenMon' => 'Quản trị kho và vận tải',
                'soTinChi' => 3,
                'moTa' => 'Tối ưu hóa kho bãi và vận chuyển',
                'maNganh' => ['8840103', '9340411', '9340412'],
            ],

            // ========== QUẢN LÝ HÀNG HẢI (8840106) ==========
            [
                'maMon' => 'HH01',
                'tenMon' => 'Luật hàng hải quốc tế',
                'soTinChi' => 3,
                'moTa' => 'Các công ước và luật hàng hải',
                'maNganh' => ['8840106', '88401061', '9380111'],
            ],
            [
                'maMon' => 'HH02',
                'tenMon' => 'Quản lý cảng biển',
                'soTinChi' => 3,
                'moTa' => 'Vận hành và quản lý cảng',
                'maNganh' => ['8840106', '88401061', '9520184'],
            ],
            [
                'maMon' => 'HH03',
                'tenMon' => 'An toàn hàng hải',
                'soTinChi' => 3,
                'moTa' => 'Các tiêu chuẩn an toàn ISM, ISPS',
                'maNganh' => ['8840106', '88401061', '9520184'],
            ],
        ];
    }
}

