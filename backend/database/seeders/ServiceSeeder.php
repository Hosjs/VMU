<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 6 DỊCH VỤ CHÍNH - QUẢN LÝ ĐỘC LẬP, KHÔNG THUỘC DANH MỤC
     */
    public function run(): void
    {
        $services = [
            [
                'name' => 'Bảo dưỡng định kỳ',
                'code' => 'MAINTENANCE',
                'description' => 'Bảo dưỡng định kỳ theo km: thay dầu động cơ, lọc gió, kiểm tra tổng quát',
                'unit' => 'lần',
                'estimated_time' => 90, // 1.5 giờ
                'has_warranty' => true,
                'warranty_months' => 3,
                'is_active' => true,
            ],
            [
                'name' => 'Sửa chữa động cơ',
                'code' => 'ENGINE_REPAIR',
                'description' => 'Sửa chữa, đại tu động cơ: thay piston, xi lanh, đại tu tổng thể',
                'unit' => 'lần',
                'estimated_time' => 480, // 8 giờ
                'has_warranty' => true,
                'warranty_months' => 12,
                'is_active' => true,
            ],
            [
                'name' => 'Sửa chữa hệ thống phanh',
                'code' => 'BRAKE_REPAIR',
                'description' => 'Thay má phanh, đĩa phanh, bơm phanh, sửa chữa hệ thống phanh',
                'unit' => 'lần',
                'estimated_time' => 120, // 2 giờ
                'has_warranty' => true,
                'warranty_months' => 6,
                'is_active' => true,
            ],
            [
                'name' => 'Kiểm tra và chẩn đoán',
                'code' => 'INSPECTION',
                'description' => 'Kiểm tra tổng quát, chẩn đoán lỗi bằng máy scan, đánh giá tình trạng xe',
                'unit' => 'lần',
                'estimated_time' => 60, // 1 giờ
                'has_warranty' => false,
                'warranty_months' => 0,
                'is_active' => true,
            ],
            [
                'name' => 'Sửa chữa điện - điện tử',
                'code' => 'ELECTRIC_REPAIR',
                'description' => 'Sửa chữa hệ thống điện, thay ắc quy, sửa đèn, điều hòa',
                'unit' => 'lần',
                'estimated_time' => 180, // 3 giờ
                'has_warranty' => true,
                'warranty_months' => 6,
                'is_active' => true,
            ],
            [
                'name' => 'Thay lốp và cân chỉnh',
                'code' => 'TIRE_SERVICE',
                'description' => 'Thay lốp, vá lốp, cân bằng lốp, cân chỉnh góc đặt bánh xe',
                'unit' => 'lần',
                'estimated_time' => 90, // 1.5 giờ
                'has_warranty' => true,
                'warranty_months' => 6,
                'is_active' => true,
            ],
        ];

        foreach ($services as $service) {
            Service::create($service);
        }

        $this->command->info('✅ Đã tạo 6 dịch vụ chính (độc lập, không thuộc danh mục)');
    }
}

