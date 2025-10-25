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
                'moTa' => 'Ngành đào tạo về điện tử và truyền thông',
                'trangThai' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'maNganh' => '8480101',
                'tenNganh' => 'Kinh tế',
                'moTa' => 'Ngành đào tạo về kinh tế',
                'trangThai' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'maNganh' => '8520101',
                'tenNganh' => 'Quản trị kinh doanh',
                'moTa' => 'Ngành đào tạo về quản trị',
                'trangThai' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('nganh_hoc')->insert($nganhs);

        $this->command->info('✅ Created 3 majors');
    }
}

