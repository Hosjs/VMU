<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class KhoaHocSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $khoaHocs = [
            [
                'id' => 1,
                'ma_khoa_hoc' => '2022.1.1',
                'nam_hoc' => 2022,
                'hoc_ky' => 1,
                'dot' => 1,
                'ngay_bat_dau' => '2022-01-10',
                'ngay_ket_thuc' => '2022-05-30',
                'ghi_chu' => null,
            ],
            [
                'id' => 2,
                'ma_khoa_hoc' => '2022.2.1',
                'nam_hoc' => 2022,
                'hoc_ky' => 2,
                'dot' => 1,
                'ngay_bat_dau' => '2022-06-15',
                'ngay_ket_thuc' => '2022-10-01',
                'ghi_chu' => null,
            ],
            [
                'id' => 3,
                'ma_khoa_hoc' => '2023.1.1',
                'nam_hoc' => 2023,
                'hoc_ky' => 1,
                'dot' => 1,
                'ngay_bat_dau' => '2023-01-05',
                'ngay_ket_thuc' => '2023-05-25',
                'ghi_chu' => null,
            ],
            [
                'id' => 4,
                'ma_khoa_hoc' => '2025.1.1',
                'nam_hoc' => 2025,
                'hoc_ky' => 1,
                'dot' => 1,
                'ngay_bat_dau' => '2025-01-06',
                'ngay_ket_thuc' => '2025-05-25',
                'ghi_chu' => null,
            ],
            [
                'id' => 5,
                'ma_khoa_hoc' => '2025.1.2',
                'nam_hoc' => 2025,
                'hoc_ky' => 1,
                'dot' => 2,
                'ngay_bat_dau' => '2025-02-10',
                'ngay_ket_thuc' => '2025-06-20',
                'ghi_chu' => null,
            ],
            [
                'id' => 6,
                'ma_khoa_hoc' => '2025.2.1',
                'nam_hoc' => 2025,
                'hoc_ky' => 2,
                'dot' => 1,
                'ngay_bat_dau' => '2025-06-30',
                'ngay_ket_thuc' => '2025-10-15',
                'ghi_chu' => null,
            ],
            [
                'id' => 7,
                'ma_khoa_hoc' => '2025.2.2',
                'nam_hoc' => 2025,
                'hoc_ky' => 2,
                'dot' => 2,
                'ngay_bat_dau' => '2025-07-15',
                'ngay_ket_thuc' => '2025-10-30',
                'ghi_chu' => null,
            ],
            [
                'id' => 8,
                'ma_khoa_hoc' => '2025.3.1',
                'nam_hoc' => 2025,
                'hoc_ky' => 3,
                'dot' => 1,
                'ngay_bat_dau' => '2025-11-01',
                'ngay_ket_thuc' => '2025-12-31',
                'ghi_chu' => null,
            ],
        ];

        // Check if already seeded
        $existingCount = DB::table('khoa_hoc')->count();

        if ($existingCount > 0) {
            $this->command->info("⚠️  Khoa hoc already exist ({$existingCount} records). Skipping...");
            return;
        }

        DB::table('khoa_hoc')->insert($khoaHocs);

        $this->command->info('✅ Created 8 khoa hoc records');
    }
}
