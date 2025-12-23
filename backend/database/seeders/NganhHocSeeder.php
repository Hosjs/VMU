<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NganhHocSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $nganhs = [
            [
                'maNganh' => '8310110',
                'tenNganh' => 'Kỹ thuật Điện tử, Truyền thông',
                'ghiChu' => 'Ngành đào tạo về điện tử và truyền thông',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'maNganh' => '8480101',
                'tenNganh' => 'Kinh tế',
                'ghiChu' => 'Ngành đào tạo về kinh tế',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'maNganh' => '8520101',
                'tenNganh' => 'Quản trị kinh doanh',
                'ghiChu' => 'Ngành đào tạo về quản trị',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        // Check if already seeded
        $existingCount = DB::table('majors')->count();

        if ($existingCount > 0) {
            $this->command->info("⚠️  Majors already exist ({$existingCount} records). Skipping...");
            return;
        }

        DB::table('majors')->insert($nganhs);

        $this->command->info('✅ Created 3 majors (nganh_hoc)');
    }
}

