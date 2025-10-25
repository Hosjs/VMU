<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TrinhDoDaoTaoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $trinhDos = [
            [
                'maTrinhDoDaoTao' => 'CuNhan',
                'tenTrinhDo' => 'Cử nhân',
                'moTa' => 'Trình độ đại học',
                'trangThai' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'maTrinhDoDaoTao' => 'ThacSi',
                'tenTrinhDo' => 'Thạc sỹ',
                'moTa' => 'Trình độ sau đại học',
                'trangThai' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'maTrinhDoDaoTao' => 'TienSi',
                'tenTrinhDo' => 'Tiến sỹ',
                'moTa' => 'Trình độ nghiên cứu sinh',
                'trangThai' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('trinh_do_dao_tao')->insert($trinhDos);

        $this->command->info('✅ Created 3 training levels');
    }
}

