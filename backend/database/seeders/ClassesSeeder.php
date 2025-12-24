<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
class ClassesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if already seeded
        $existingCount = DB::table('classes')->count();
        if ($existingCount > 0) {
            $this->command->info("⚠️  Classes already exist ({$existingCount} records). Skipping...");
            return;
        }
        // Get khoaHoc mapping: nam_hoc => id
        $khoaHocMap = DB::table('khoa_hoc')
            ->pluck('id', 'nam_hoc')
            ->toArray();
        $now = now();
        $classesData = [
            ['class_name' => 'QLDA 2022.1.1', 'year' => 2022],
            ['class_name' => 'QLHH 2022.1.1', 'year' => 2022],
            ['class_name' => 'QLHH 2022.1.2', 'year' => 2022],
            ['class_name' => 'QLKT 2022.2.1', 'year' => 2022],
            ['class_name' => 'QLKT 2022.2.2', 'year' => 2022],
            ['class_name' => 'QLKT 2022.2.3', 'year' => 2022],
            ['class_name' => 'QLKT 2022.2.4', 'year' => 2022],
            ['class_name' => 'QLKT 2022.2.5', 'year' => 2022],
            ['class_name' => 'QLKT 2022.2.6', 'year' => 2022],
            ['class_name' => 'QLKT 2022.1.1', 'year' => 2022],
            ['class_name' => 'QLTC 2022.2.1', 'year' => 2022],
            ['class_name' => 'QLKT 2022.1.3', 'year' => 2022],
            ['class_name' => 'QLKT 2022.1.2', 'year' => 2022],
            ['class_name' => 'QLMT2022.1.1', 'year' => 2022],
            ['class_name' => 'QLVT 2021.1.1', 'year' => 2021],
            ['class_name' => 'QLKT 2023.1.1', 'year' => 2023],
            ['class_name' => 'QLKT 2023.1.2', 'year' => 2023],
            ['class_name' => 'CNTT 2023.1.1', 'year' => 2023],
            ['class_name' => 'KTĐH 2023.1.1', 'year' => 2023],
            ['class_name' => 'QLHH 2023.1.1', 'year' => 2023],
            ['class_name' => 'QLTC 2023.1.1', 'year' => 2023],
            ['class_name' => 'QLKT 2023.1.3', 'year' => 2023],
            ['class_name' => 'QLKT 2023.1.4', 'year' => 2023],
            ['class_name' => 'QLVT 2023.1.1', 'year' => 2023],
            ['class_name' => 'KTMT 2023.1.1', 'year' => 2023],
            ['class_name' => 'QLMT 2023.1.1', 'year' => 2023],
            ['class_name' => 'KTTT 2023.1.1', 'year' => 2023],
            ['class_name' => 'QLSX 2023.1.1', 'year' => 2023],
            ['class_name' => 'QLDA 2023.1.1', 'year' => 2023],
            ['class_name' => 'BĐAT 2022.1.1', 'year' => 2022],
            ['class_name' => 'QLMT 2022.1.1', 'year' => 2022],
            ['class_name' => 'CNTT 2022.1.1', 'year' => 2022],
            ['class_name' => 'KTĐH 2022.1.1', 'year' => 2022],
            ['class_name' => 'KTĐT 2022.1.1', 'year' => 2022],
            ['class_name' => 'KTTT 2022.1.1', 'year' => 2022],
            ['class_name' => 'QLSX 2022.1.1', 'year' => 2022],
            ['class_name' => 'QLVT 2022.1.1', 'year' => 2022],
            ['class_name' => 'QLTC 2022.1.1', 'year' => 2022],
            ['class_name' => 'CNTT 2022.2.1', 'year' => 2022],
            ['class_name' => 'KTĐT 2022.2.1', 'year' => 2022],
            ['class_name' => 'KTĐH 2022.2.1', 'year' => 2022],
            ['class_name' => 'QLKT 2023.2.1', 'year' => 2023],
            ['class_name' => 'QLKT 2023.2.2', 'year' => 2023],
            ['class_name' => 'QLKT 2023.2.3', 'year' => 2023],
            ['class_name' => 'QLTC 2023.2.1', 'year' => 2023],
            ['class_name' => 'QLVT 2023.2.1', 'year' => 2023],
            ['class_name' => 'CNTT 2023.2.1', 'year' => 2023],
            ['class_name' => 'KTĐH 2023.2.1', 'year' => 2023],
            ['class_name' => 'QLHH 2023.2.1', 'year' => 2023],
            ['class_name' => 'QLHH 2023.2.2', 'year' => 2023],
            ['class_name' => 'QLDA 2023.2.1', 'year' => 2023],
            ['class_name' => 'QLSX 2023.2.1', 'year' => 2023],
            ['class_name' => 'KTTT 2023.2.1', 'year' => 2023],
            ['class_name' => 'KTĐT 2023.2.1', 'year' => 2023],
            ['class_name' => 'QLMT 2023.2.1', 'year' => 2023],
            ['class_name' => 'XDDD 2023.2.1', 'year' => 2023],
            ['class_name' => 'XDCT 2023.2.1', 'year' => 2023],
            ['class_name' => 'BĐAT 2023.2.1', 'year' => 2023],
            ['class_name' => 'QKTH 2023.2.1', 'year' => 2023],
            ['class_name' => 'QLHH 2022.2', 'year' => 2022],
            ['class_name' => 'QLMT 2022.2', 'year' => 2022],
            ['class_name' => 'CNTT 2024.1.1', 'year' => 2024],
            ['class_name' => 'KTĐT 2024.1.1', 'year' => 2024],
            ['class_name' => 'KTĐH 2024.1.1', 'year' => 2024],
            ['class_name' => 'QLMT 2024.1.1', 'year' => 2024],
            ['class_name' => 'QLDA 2024.1.1', 'year' => 2024],
            ['class_name' => 'KTTT 2024.1.1', 'year' => 2024],
            ['class_name' => 'QLSX 2024.1.1', 'year' => 2024],
            ['class_name' => 'QKTH 2024.1.1', 'year' => 2024],
            ['class_name' => 'QLTB 2024.1.1', 'year' => 2024],
            ['class_name' => 'QLTC 2024.1.1', 'year' => 2024],
            ['class_name' => 'QLHH 2024.1.1', 'year' => 2024],
            ['class_name' => 'QLHH 2024.1.2', 'year' => 2024],
            ['class_name' => 'QLVT 2024.1.1', 'year' => 2024],
            ['class_name' => 'QLVT 2024.1.2', 'year' => 2024],
            ['class_name' => 'QLVT 2024.1.3', 'year' => 2024],
            ['class_name' => 'QLKT 2024.1.1', 'year' => 2024],
            ['class_name' => 'QLKT 2024.1.2', 'year' => 2024],
            ['class_name' => 'QLKT 2024.1.3', 'year' => 2024],
            ['class_name' => 'QLKT 2024.1.4', 'year' => 2024],
            ['class_name' => 'QLDA 2022.2.1', 'year' => 2022],
            ['class_name' => 'QLVT 2022.2.1', 'year' => 2022],
            ['class_name' => 'QLSX 2022.2.1', 'year' => 2022],
            ['class_name' => 'KTTT 2022.2.1', 'year' => 2022],
            ['class_name' => 'CNTT 2024.2.1', 'year' => 2024],
            ['class_name' => 'KTDH 2024.2.1', 'year' => 2024],
            ['class_name' => 'KTDT 2024.2.1', 'year' => 2024],
            ['class_name' => 'QLDA 2024.2.1', 'year' => 2024],
            ['class_name' => 'QLCA 2024.2.1', 'year' => 2024],
            ['class_name' => 'XDCT 2024.2.1', 'year' => 2024],
            ['class_name' => 'KTTT 2024.2.1', 'year' => 2024],
            ['class_name' => 'QKTH 2024.2.1', 'year' => 2024],
            ['class_name' => 'QLNL 2024.2.1', 'year' => 2024],
            ['class_name' => 'QLSX 2024.2.1', 'year' => 2024],
            ['class_name' => 'QLMT 2024.2.1', 'year' => 2024],
            ['class_name' => 'QLHH 2024.2.1', 'year' => 2024],
            ['class_name' => 'QLHH 2024.2.2', 'year' => 2024],
            ['class_name' => 'QLHH 2024.2.3', 'year' => 2024],
            ['class_name' => 'QLKT 2024.2.1', 'year' => 2024],
            ['class_name' => 'QLKT 2024.2.2', 'year' => 2024],
            ['class_name' => 'QLKT 2024.2.3', 'year' => 2024],
            ['class_name' => 'QLHH 2024.2.4', 'year' => 2024],
            ['class_name' => 'QLTC 2024.2.1', 'year' => 2024],
            ['class_name' => 'QLVT 2024.2.1', 'year' => 2024],
            ['class_name' => 'QLVT 2024.2.2', 'year' => 2024],
            ['class_name' => 'CNTT 2025.1.1', 'year' => 2025],
            ['class_name' => 'KTĐT 2025.1.1', 'year' => 2025],
            ['class_name' => 'KTĐH 2025.1.1', 'year' => 2025],
            ['class_name' => 'QLMT 2025.1.1', 'year' => 2025],
            ['class_name' => 'QLDA 2025.1.1', 'year' => 2025],
            ['class_name' => 'KTTT 2025.1.1', 'year' => 2025],
            ['class_name' => 'QLSX 2025.1.1', 'year' => 2025],
            ['class_name' => 'QKTH 2025.1.1', 'year' => 2025],
            ['class_name' => 'QLTB 2025.1.1', 'year' => 2025],
            ['class_name' => 'QLTC 2025.1.1', 'year' => 2025],
            ['class_name' => 'QLHH 2025.1.1', 'year' => 2025],
            ['class_name' => 'QLHH 2025.1.2', 'year' => 2025],
            ['class_name' => 'QLVT 2025.1.1', 'year' => 2025],
            ['class_name' => 'QLVT 2025.1.2', 'year' => 2025],
            ['class_name' => 'QLVT 2025.1.3', 'year' => 2025],
            ['class_name' => 'QLKT 2025.1.1', 'year' => 2025],
            ['class_name' => 'QLKT 2025.1.2', 'year' => 2025],
            ['class_name' => 'QLKT 2025.1.3', 'year' => 2025],
            ['class_name' => 'QLKT 2025.1.4', 'year' => 2025],
            ['class_name' => 'CNTT 2025.2.1', 'year' => 2025],
            ['class_name' => 'KTDH 2025.2.1', 'year' => 2025],
            ['class_name' => 'KTDT 2025.2.1', 'year' => 2025],
            ['class_name' => 'QLDA 2025.2.1', 'year' => 2025],
            ['class_name' => 'QLCA 2025.2.1', 'year' => 2025],
            ['class_name' => 'XDCT 2025.2.1', 'year' => 2025],
            ['class_name' => 'KTTT 2025.2.1', 'year' => 2025],
            ['class_name' => 'QKTH 2025.2.1', 'year' => 2025],
            ['class_name' => 'QLNL 2025.2.1', 'year' => 2025],
            ['class_name' => 'QLSX 2025.2.1', 'year' => 2025],
            ['class_name' => 'QLMT 2025.2.1', 'year' => 2025],
            ['class_name' => 'QLHH 2025.2.1', 'year' => 2025],
            ['class_name' => 'QLHH 2025.2.2', 'year' => 2025],
            ['class_name' => 'QLHH 2025.2.3', 'year' => 2025],
            ['class_name' => 'QLKT 2025.2.1', 'year' => 2025],
            ['class_name' => 'QLKT 2025.2.2', 'year' => 2025],
            ['class_name' => 'QLKT 2025.2.3', 'year' => 2025],
            ['class_name' => 'QLHH 2025.2.4', 'year' => 2025],
            ['class_name' => 'QLTC 2025.2.1', 'year' => 2025],
            ['class_name' => 'QLVT 2025.2.1', 'year' => 2025],
            ['class_name' => 'QLVT 2025.2.2', 'year' => 2025],
        ];
        $classes = [];
        foreach ($classesData as $data) {
            $year = $data['year'];
            $khoaHocId = $khoaHocMap[$year] ?? null;
            if (!$khoaHocId) {
                $this->command->warn("⚠️  Skipping class '{$data['class_name']}' - no khoaHoc for year {$year}");
                continue;
            }
            // Extract major code from class name (e.g., "QLDA" from "QLDA 2022.1.1")
            preg_match('/^([A-Z]+)/', $data['class_name'], $matches);
            $majorPrefix = $matches[1] ?? '';
            // Map major prefixes to major_id
            $majorMap = [
                'QLDA' => '85802011',
                'QLHH' => '8840106',
                'QLKT' => '8310110',
                'QLTC' => '83101101',
                'QLMT' => '85203201',
                'QLVT' => '8840103',
                'CNTT' => '8480201',
                'KTĐH' => '8520216',
                'KTDH' => '8520216',
                'KTĐT' => '8520203',
                'KTDT' => '8520203',
                'KTMT' => '8520320',
                'KTTT' => '8520116',
                'QLSX' => '85201163',
                'BĐAT' => '88401061',
                'XDDD' => '8580201',
                'XDCT' => '8580202',
                'QKTH' => '85201161',
                'QLTB' => '85201162',
                'QLCA' => '88401061',
                'QLNL' => '85201162',
            ];
            $majorId = $majorMap[$majorPrefix] ?? '8310110'; // Default to QLKT
            $classes[] = [
                'class_name' => $data['class_name'],
                'maTrinhDoDaoTao' => 'ThacSi',
                'major_id' => $majorId,
                'khoaHoc_id' => $khoaHocId,
                'lecurer_id' => null,
                'trangThai' => 'DangHoc',
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        if (empty($classes)) {
            $this->command->error('❌ No classes to seed!');
            return;
        }
        DB::table('classes')->insert($classes);
        $this->command->info('✅ Created ' . count($classes) . ' class records');
    }
}
