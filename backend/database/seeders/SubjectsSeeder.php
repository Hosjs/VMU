<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SubjectsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Seed common subjects for graduate programs
     */
    public function run(): void
    {
        // Check if already seeded
        $existingCount = DB::table('subjects')->count();

        if ($existingCount > 0) {
            $this->command->info("⚠️  Subjects already exist ({$existingCount} records). Skipping...");
            return;
        }

        $data = $this->getSubjectsData();

        $this->command->info("💾 Inserting " . count($data) . " subjects...");

        $chunks = array_chunk($data, 50);
        $total = 0;

        foreach ($chunks as $chunk) {
            DB::table('subjects')->insert($chunk);
            $total += count($chunk);
        }

        $this->command->info("✅ Successfully inserted {$total} subjects");
    }

    private function getSubjectsData(): array
    {
        $timestamp = '2025-11-16 23:35:20';

        return [
            // Common subjects
            ['id' => 4, 'maMon' => 'COMMON01', 'tenMon' => 'Triết học', 'soTinChi' => 3, 'moTa' => 'Môn học bắt buộc về triết học', 'created_at' => $timestamp, 'updated_at' => $timestamp, 'soTiet' => null, 'loaiMon' => null, 'hocKy' => null],
            ['id' => 5, 'maMon' => 'COMMON02', 'tenMon' => 'Tiếng Anh nâng cao', 'soTinChi' => 3, 'moTa' => 'Tiếng Anh cho học viên sau đại học', 'created_at' => $timestamp, 'updated_at' => $timestamp, 'soTiet' => null, 'loaiMon' => null, 'hocKy' => null],
            ['id' => 6, 'maMon' => 'COMMON03', 'tenMon' => 'Phương pháp nghiên cứu khoa học', 'soTinChi' => 2, 'moTa' => 'Phương pháp luận nghiên cứu khoa học', 'created_at' => $timestamp, 'updated_at' => $timestamp, 'soTiet' => null, 'loaiMon' => null, 'hocKy' => null],

            // Management subjects
            ['id' => 7, 'maMon' => 'QL01', 'tenMon' => 'Kinh tế vi mô nâng cao', 'soTinChi' => 3, 'moTa' => 'Lý thuyết kinh tế vi mô ở trình độ sau đại học', 'created_at' => $timestamp, 'updated_at' => $timestamp, 'soTiet' => null, 'loaiMon' => null, 'hocKy' => null],
            ['id' => 8, 'maMon' => 'QL02', 'tenMon' => 'Kinh tế vĩ mô nâng cao', 'soTinChi' => 3, 'moTa' => 'Lý thuyết kinh tế vĩ mô ở trình độ sau đại học', 'created_at' => $timestamp, 'updated_at' => $timestamp, 'soTiet' => null, 'loaiMon' => null, 'hocKy' => null],
            ['id' => 9, 'maMon' => 'QL03', 'tenMon' => 'Kinh tế lượng', 'soTinChi' => 3, 'moTa' => 'Phương pháp định lượng trong kinh tế', 'created_at' => $timestamp, 'updated_at' => $timestamp, 'soTiet' => null, 'loaiMon' => null, 'hocKy' => null],
            ['id' => 10, 'maMon' => 'QL04', 'tenMon' => 'Quản trị chiến lược', 'soTinChi' => 3, 'moTa' => 'Chiến lược và quản trị doanh nghiệp', 'created_at' => $timestamp, 'updated_at' => $timestamp, 'soTiet' => null, 'loaiMon' => null, 'hocKy' => null],
            ['id' => 11, 'maMon' => 'QL05', 'tenMon' => 'Quản trị dự án', 'soTinChi' => 3, 'moTa' => 'Kỹ năng quản lý dự án', 'created_at' => $timestamp, 'updated_at' => $timestamp, 'soTiet' => null, 'loaiMon' => null, 'hocKy' => null],

            // Finance subjects
            ['id' => 12, 'maMon' => 'TC01', 'tenMon' => 'Quản trị tài chính doanh nghiệp nâng cao', 'soTinChi' => 3, 'moTa' => 'Quản lý tài chính trong tổ chức', 'created_at' => $timestamp, 'updated_at' => $timestamp, 'soTiet' => null, 'loaiMon' => null, 'hocKy' => null],
            ['id' => 13, 'maMon' => 'TC02', 'tenMon' => 'Thị trường tài chính', 'soTinChi' => 3, 'moTa' => 'Phân tích thị trường tài chính và chứng khoán', 'created_at' => $timestamp, 'updated_at' => $timestamp, 'soTiet' => null, 'loaiMon' => null, 'hocKy' => null],
            ['id' => 14, 'maMon' => 'TC03', 'tenMon' => 'Phân tích đầu tư', 'soTinChi' => 3, 'moTa' => 'Phương pháp phân tích và định giá đầu tư', 'created_at' => $timestamp, 'updated_at' => $timestamp, 'soTiet' => null, 'loaiMon' => null, 'hocKy' => null],
            ['id' => 15, 'maMon' => 'TC04', 'tenMon' => 'Quản trị rủi ro tài chính', 'soTinChi' => 3, 'moTa' => 'Nhận diện và quản lý rủi ro tài chính', 'created_at' => $timestamp, 'updated_at' => $timestamp, 'soTiet' => null, 'loaiMon' => null, 'hocKy' => null],

            // IT subjects
            ['id' => 16, 'maMon' => 'CNTT01', 'tenMon' => 'Thuật toán nâng cao', 'soTinChi' => 3, 'moTa' => 'Thiết kế và phân tích thuật toán', 'created_at' => $timestamp, 'updated_at' => $timestamp, 'soTiet' => null, 'loaiMon' => null, 'hocKy' => null],
            ['id' => 17, 'maMon' => 'CNTT02', 'tenMon' => 'Cơ sở dữ liệu nâng cao', 'soTinChi' => 3, 'moTa' => 'Hệ quản trị cơ sở dữ liệu và tối ưu hóa', 'created_at' => $timestamp, 'updated_at' => $timestamp, 'soTiet' => null, 'loaiMon' => null, 'hocKy' => null],
            ['id' => 18, 'maMon' => 'CNTT03', 'tenMon' => 'Trí tuệ nhân tạo', 'soTinChi' => 3, 'moTa' => 'Machine Learning và Deep Learning', 'created_at' => $timestamp, 'updated_at' => $timestamp, 'soTiet' => null, 'loaiMon' => null, 'hocKy' => null],
            ['id' => 19, 'maMon' => 'CNTT04', 'tenMon' => 'Khai phá dữ liệu', 'soTinChi' => 3, 'moTa' => 'Kỹ thuật khai thác tri thức từ dữ liệu', 'created_at' => $timestamp, 'updated_at' => $timestamp, 'soTiet' => null, 'loaiMon' => null, 'hocKy' => null],
            ['id' => 20, 'maMon' => 'CNTT05', 'tenMon' => 'An toàn và bảo mật thông tin', 'soTinChi' => 3, 'moTa' => 'Các kỹ thuật bảo mật hệ thống', 'created_at' => $timestamp, 'updated_at' => $timestamp, 'soTiet' => null, 'loaiMon' => null, 'hocKy' => null],

            // Add more subjects as needed
        ];
    }
}


