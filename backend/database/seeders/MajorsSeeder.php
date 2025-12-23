<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MajorsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $majors = [
            ['id' => 1, 'maNganh' => '8310110', 'tenNganh' => 'Quản lý kinh tế - ThS', 'thoi_gian_dao_tao' => 2.0, 'ghiChu' => 'Import auto', 'parent_id' => null],
            ['id' => 2, 'maNganh' => '83101101', 'tenNganh' => 'Quản lý tài chính - ThS', 'thoi_gian_dao_tao' => 2.0, 'ghiChu' => 'Import auto', 'parent_id' => null],
            ['id' => 3, 'maNganh' => '8310110-1', 'tenNganh' => 'Quản lý kinh tế - Doanh nghiệp - ThS', 'thoi_gian_dao_tao' => 2.0, 'ghiChu' => 'Import auto', 'parent_id' => null],
            ['id' => 4, 'maNganh' => '8480201', 'tenNganh' => 'Công nghệ thông tin - ThS', 'thoi_gian_dao_tao' => 2.0, 'ghiChu' => 'Import auto', 'parent_id' => null],
            ['id' => 5, 'maNganh' => '8520116', 'tenNganh' => 'Kỹ thuật tàu thủy - ThS', 'thoi_gian_dao_tao' => 2.0, 'ghiChu' => 'Import auto', 'parent_id' => null],
            ['id' => 6, 'maNganh' => '85201161', 'tenNganh' => 'Khai thác, bảo trì tàu thủy - ThS', 'thoi_gian_dao_tao' => 2.0, 'ghiChu' => 'Import auto', 'parent_id' => null],
            ['id' => 7, 'maNganh' => '85201162', 'tenNganh' => 'Máy và thiết bị tàu thủy / Cơ khí động lực - ThS', 'thoi_gian_dao_tao' => 2.0, 'ghiChu' => 'Import auto', 'parent_id' => null],
            ['id' => 8, 'maNganh' => '85201163', 'tenNganh' => 'Quản lý sản xuất công nghiệp / Quản lý công nghiệp - ThS', 'thoi_gian_dao_tao' => 2.0, 'ghiChu' => 'Import auto', 'parent_id' => null],
            ['id' => 9, 'maNganh' => '8520203', 'tenNganh' => 'Kỹ thuật điện tử - viễn thông - ThS', 'thoi_gian_dao_tao' => 2.0, 'ghiChu' => 'Import auto', 'parent_id' => null],
            ['id' => 10, 'maNganh' => '8520216', 'tenNganh' => 'Kỹ thuật điều khiển và tự động hóa - ThS', 'thoi_gian_dao_tao' => 2.0, 'ghiChu' => 'Import auto', 'parent_id' => null],
            ['id' => 11, 'maNganh' => '8520320', 'tenNganh' => 'Kỹ thuật môi trường / Khoa học và công nghệ môi trường - ThS', 'thoi_gian_dao_tao' => 2.0, 'ghiChu' => 'Import auto', 'parent_id' => null],
            ['id' => 12, 'maNganh' => '85203201', 'tenNganh' => 'Quản lý môi trường - ThS', 'thoi_gian_dao_tao' => 2.0, 'ghiChu' => 'Import auto', 'parent_id' => null],
            ['id' => 13, 'maNganh' => '8580201', 'tenNganh' => 'Kỹ thuật xây dựng công trình DD&CN - ThS', 'thoi_gian_dao_tao' => 2.0, 'ghiChu' => 'Import auto', 'parent_id' => null],
            ['id' => 14, 'maNganh' => '85802011', 'tenNganh' => 'Quản lý dự án đầu tư và xây dựng / Kỹ thuật xây dựng - ThS', 'thoi_gian_dao_tao' => 2.0, 'ghiChu' => 'Import auto', 'parent_id' => null],
            ['id' => 15, 'maNganh' => '8580202', 'tenNganh' => 'Kỹ thuật xây dựng công trình thuỷ - ThS', 'thoi_gian_dao_tao' => 2.0, 'ghiChu' => 'Import auto', 'parent_id' => null],
            ['id' => 16, 'maNganh' => '8840103', 'tenNganh' => 'Quản lý vận tải và Logistics / Logistics quốc tế - ThS', 'thoi_gian_dao_tao' => 2.0, 'ghiChu' => 'Import auto', 'parent_id' => null],
            ['id' => 17, 'maNganh' => '8840106', 'tenNganh' => 'Quản lý hàng hải / Luật hàng hải - ThS', 'thoi_gian_dao_tao' => 2.0, 'ghiChu' => 'Import auto', 'parent_id' => null],
            ['id' => 18, 'maNganh' => '88401061', 'tenNganh' => 'Quản lý cảng và an toàn hàng hải / Bảo đảm an toàn hàng hải - ThS', 'thoi_gian_dao_tao' => 2.0, 'ghiChu' => 'Import auto', 'parent_id' => null],
            ['id' => 19, 'maNganh' => '9310110', 'tenNganh' => 'Quản lý kinh tế - TS', 'thoi_gian_dao_tao' => 4.0, 'ghiChu' => 'Import auto', 'parent_id' => 1],
            ['id' => 20, 'maNganh' => '9480201', 'tenNganh' => 'Công nghệ thông tin - TS', 'thoi_gian_dao_tao' => 4.0, 'ghiChu' => 'Import auto', 'parent_id' => 4],
            ['id' => 21, 'maNganh' => '9520116', 'tenNganh' => 'Kỹ thuật tàu thủy - TS', 'thoi_gian_dao_tao' => 4.0, 'ghiChu' => 'Import auto', 'parent_id' => 5],
            ['id' => 22, 'maNganh' => '9520117', 'tenNganh' => 'Khai thác, bảo trì tàu thủy - TS', 'thoi_gian_dao_tao' => 4.0, 'ghiChu' => 'Import auto', 'parent_id' => 6],
            ['id' => 23, 'maNganh' => '9520115', 'tenNganh' => 'Máy và thiết bị tàu thủy / Cơ khí động lực - TS', 'thoi_gian_dao_tao' => 4.0, 'ghiChu' => 'Import auto', 'parent_id' => 7],
            ['id' => 24, 'maNganh' => '9340410', 'tenNganh' => 'Quản lý sản xuất công nghiệp / Quản lý công nghiệp - TS', 'thoi_gian_dao_tao' => 4.0, 'ghiChu' => 'Import auto', 'parent_id' => 8],
            ['id' => 25, 'maNganh' => '9520213', 'tenNganh' => 'Kỹ thuật điện tử - viễn thông - TS', 'thoi_gian_dao_tao' => 4.0, 'ghiChu' => 'Import auto', 'parent_id' => 9],
            ['id' => 26, 'maNganh' => '9520216', 'tenNganh' => 'Kỹ thuật điều khiển và tự động hóa - TS', 'thoi_gian_dao_tao' => 4.0, 'ghiChu' => 'Import auto', 'parent_id' => 10],
            ['id' => 27, 'maNganh' => '9520320', 'tenNganh' => 'Kỹ thuật môi trường / Khoa học và công nghệ môi trường - TS', 'thoi_gian_dao_tao' => 4.0, 'ghiChu' => 'Import auto', 'parent_id' => 11],
            ['id' => 28, 'maNganh' => '9440301', 'tenNganh' => 'Quản lý môi trường - TS', 'thoi_gian_dao_tao' => 4.0, 'ghiChu' => 'Import auto', 'parent_id' => 12],
            ['id' => 29, 'maNganh' => '9580203', 'tenNganh' => 'Kỹ thuật xây dựng công trình DD&CN - TS', 'thoi_gian_dao_tao' => 4.0, 'ghiChu' => 'Import auto', 'parent_id' => 13],
            ['id' => 30, 'maNganh' => '9580201', 'tenNganh' => 'Kỹ thuật xây dựng - TS', 'thoi_gian_dao_tao' => 4.0, 'ghiChu' => 'Import auto', 'parent_id' => 14],
            ['id' => 31, 'maNganh' => '9580202', 'tenNganh' => 'Kỹ thuật xây dựng công trình thuỷ - TS', 'thoi_gian_dao_tao' => 4.0, 'ghiChu' => 'Import auto', 'parent_id' => 15],
            ['id' => 32, 'maNganh' => '9520182', 'tenNganh' => 'Khoa học hàng hải / Kỹ thuật hàng hải - TS', 'thoi_gian_dao_tao' => 2.0, 'ghiChu' => 'Import auto', 'parent_id' => null],
            ['id' => 33, 'maNganh' => '9340111', 'tenNganh' => 'Logistics quốc tế - TS', 'thoi_gian_dao_tao' => 4.0, 'ghiChu' => 'Import auto', 'parent_id' => 16],
            ['id' => 34, 'maNganh' => '9380111', 'tenNganh' => 'Luật hàng hải - TS', 'thoi_gian_dao_tao' => 4.0, 'ghiChu' => 'Import auto', 'parent_id' => 17],
            ['id' => 35, 'maNganh' => '9520184', 'tenNganh' => 'Bảo đảm an toàn hàng hải - TS', 'thoi_gian_dao_tao' => 4.0, 'ghiChu' => 'Import auto', 'parent_id' => 18],
            ['id' => 36, 'maNganh' => '9380107', 'tenNganh' => 'Luật - TS', 'thoi_gian_dao_tao' => 4.0, 'ghiChu' => 'Import auto', 'parent_id' => null],
            ['id' => 37, 'maNganh' => '9520123', 'tenNganh' => 'Kỹ thuật tàu thủy và công trình ngoài khơi - TS', 'thoi_gian_dao_tao' => 4.0, 'ghiChu' => 'Import auto', 'parent_id' => null],
            ['id' => 38, 'maNganh' => '9310103', 'tenNganh' => 'Kinh tế học (Toán kinh tế) - TS', 'thoi_gian_dao_tao' => 4.0, 'ghiChu' => 'Import auto', 'parent_id' => null],
            ['id' => 39, 'maNganh' => '9440111', 'tenNganh' => 'Vật lý - TS', 'thoi_gian_dao_tao' => 4.0, 'ghiChu' => 'Import auto', 'parent_id' => null],
            ['id' => 40, 'maNganh' => '9440302', 'tenNganh' => 'Quản lý tài nguyên và môi trường - TS', 'thoi_gian_dao_tao' => 4.0, 'ghiChu' => 'Import auto', 'parent_id' => null],
            ['id' => 41, 'maNganh' => '9480101', 'tenNganh' => 'Khoa học máy tính - TS', 'thoi_gian_dao_tao' => 4.0, 'ghiChu' => 'Import auto', 'parent_id' => 4],
            ['id' => 42, 'maNganh' => '9520302', 'tenNganh' => 'Kỹ thuật vật liệu - TS', 'thoi_gian_dao_tao' => 4.0, 'ghiChu' => 'Import auto', 'parent_id' => null],
            ['id' => 43, 'maNganh' => '9520215', 'tenNganh' => 'Kỹ thuật điện - điều khiển - TS', 'thoi_gian_dao_tao' => 4.0, 'ghiChu' => 'Import auto', 'parent_id' => 9],
            ['id' => 44, 'maNganh' => '9520214', 'tenNganh' => 'Viễn thông, xử lý tín hiệu - TS', 'thoi_gian_dao_tao' => 4.0, 'ghiChu' => 'Import auto', 'parent_id' => 9],
            ['id' => 45, 'maNganh' => '9340101', 'tenNganh' => 'Quản trị kinh doanh - TS', 'thoi_gian_dao_tao' => 4.0, 'ghiChu' => 'Import auto', 'parent_id' => null],
            ['id' => 46, 'maNganh' => '9340201', 'tenNganh' => 'Tài chính - TS', 'thoi_gian_dao_tao' => 4.0, 'ghiChu' => 'Import auto', 'parent_id' => null],
            ['id' => 47, 'maNganh' => '9340202', 'tenNganh' => 'Tài chính - Ngân hàng - TS', 'thoi_gian_dao_tao' => 4.0, 'ghiChu' => 'Import auto', 'parent_id' => null],
            ['id' => 48, 'maNganh' => '9340408', 'tenNganh' => 'Quản trị nhân lực - TS', 'thoi_gian_dao_tao' => 4.0, 'ghiChu' => 'Import auto', 'parent_id' => null],
            ['id' => 49, 'maNganh' => '9340411', 'tenNganh' => 'Quản trị logistics - TS', 'thoi_gian_dao_tao' => 4.0, 'ghiChu' => 'Import auto', 'parent_id' => 16],
            ['id' => 50, 'maNganh' => '9340412', 'tenNganh' => 'Tổ chức và quản lý vận tải - TS', 'thoi_gian_dao_tao' => 4.0, 'ghiChu' => 'Import auto', 'parent_id' => 16],
            ['id' => 51, 'maNganh' => '9520218', 'tenNganh' => 'Tự động hóa và điều khiển các quá trình công nghệ - TS', 'thoi_gian_dao_tao' => 4.0, 'ghiChu' => 'Import auto', 'parent_id' => 10],
            ['id' => 52, 'maNganh' => '9520119', 'tenNganh' => 'Thiết bị năng lượng tàu thủy - TS', 'thoi_gian_dao_tao' => 4.0, 'ghiChu' => 'Import auto', 'parent_id' => 5],
            ['id' => 53, 'maNganh' => '9520120', 'tenNganh' => 'Thiết kế và kết cấu tàu thủy - TS', 'thoi_gian_dao_tao' => 4.0, 'ghiChu' => 'Import auto', 'parent_id' => 5],
            ['id' => 54, 'maNganh' => '9520303', 'tenNganh' => 'Vật liệu công trình - TS', 'thoi_gian_dao_tao' => 4.0, 'ghiChu' => 'Import auto', 'parent_id' => null],
            ['id' => 55, 'maNganh' => '9520304', 'tenNganh' => 'Vật lý kỹ thuật - TS', 'thoi_gian_dao_tao' => 4.0, 'ghiChu' => 'Import auto', 'parent_id' => null],
            ['id' => 56, 'maNganh' => '9520503', 'tenNganh' => 'Kỹ thuật trắc địa - bản đồ - TS', 'thoi_gian_dao_tao' => 4.0, 'ghiChu' => 'Import auto', 'parent_id' => null],
            ['id' => 57, 'maNganh' => '9310901', 'tenNganh' => 'Triết học - TS', 'thoi_gian_dao_tao' => 4.0, 'ghiChu' => 'Import auto', 'parent_id' => null],
            ['id' => 58, 'maNganh' => '9140111', 'tenNganh' => 'Giảng dạy tiếng Anh - TS', 'thoi_gian_dao_tao' => 4.0, 'ghiChu' => 'Import auto', 'parent_id' => null],
        ];

        // Check if already seeded
        $existingCount = DB::table('majors')->count();

        if ($existingCount > 0) {
            $this->command->info("⚠️  Majors already exist ({$existingCount} records). Skipping...");
            return;
        }

        DB::table('majors')->insert($majors);

        $this->command->info('✅ Created 58 major records');
    }
}

