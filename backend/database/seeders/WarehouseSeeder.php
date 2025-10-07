<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Warehouse;

class WarehouseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $warehouses = [
            [
                'code' => 'VN',
                'name' => 'Kho Việt Nga',
                'type' => 'main',
                'address' => '123 Đường Lê Văn Việt, Phường Tăng Nhơn Phú A',
                'ward' => 'Tăng Nhơn Phú A',
                'district' => 'Quận 9',
                'province' => 'TP. Hồ Chí Minh',
                'postal_code' => '700000',
                'contact_person' => 'Nguyễn Văn Nam',
                'phone' => '0901234567',
                'email' => 'kho.vietnga@garage.com',
                'is_main_warehouse' => true,
                'can_receive_transfers' => true,
                'can_send_transfers' => true,
                'priority_order' => 1,
                'tax_exempt_transfers' => true,
                'is_active' => true,
                'operating_hours' => 'Mon:08:00-17:00|Tue:08:00-17:00|Wed:08:00-17:00|Thu:08:00-17:00|Fri:08:00-17:00|Sat:08:00-12:00',
                'notes' => 'Kho chính của Việt Nga, chuyên cung cấp phụ tùng ô tô',
            ],
            [
                'code' => 'TT',
                'name' => 'Garage Thắng Trường',
                'type' => 'partner',
                'address' => '456 Đường Quốc Lộ 1A, Phường Linh Xuân',
                'ward' => 'Linh Xuân',
                'district' => 'Thủ Đức',
                'province' => 'TP. Hồ Chí Minh',
                'postal_code' => '700000',
                'contact_person' => 'Trần Văn Thắng',
                'phone' => '0912345678',
                'email' => 'thangtruong@garage.com',
                'is_main_warehouse' => false,
                'can_receive_transfers' => true,
                'can_send_transfers' => true,
                'priority_order' => 2,
                'tax_exempt_transfers' => true,
                'is_active' => true,
                'operating_hours' => 'Mon:08:00-18:00|Tue:08:00-18:00|Wed:08:00-18:00|Thu:08:00-18:00|Fri:08:00-18:00|Sat:08:00-17:00|Sun:08:00-12:00',
                'notes' => 'Garage liên kết chính, chuyên sửa chữa và bảo dưỡng',
            ],
            [
                'code' => 'GT1',
                'name' => 'Garage Liên Kết 1',
                'type' => 'partner',
                'address' => '789 Đường Võ Văn Ngân, Phường Linh Chiểu',
                'ward' => 'Linh Chiểu',
                'district' => 'Thủ Đức',
                'province' => 'TP. Hồ Chí Minh',
                'postal_code' => '700000',
                'contact_person' => 'Lê Văn Đức',
                'phone' => '0923456789',
                'email' => 'garage1@partner.com',
                'is_main_warehouse' => false,
                'can_receive_transfers' => true,
                'can_send_transfers' => false,
                'priority_order' => 3,
                'tax_exempt_transfers' => true,
                'is_active' => true,
                'operating_hours' => 'Mon:08:00-17:00|Tue:08:00-17:00|Wed:08:00-17:00|Thu:08:00-17:00|Fri:08:00-17:00|Sat:08:00-12:00',
                'notes' => 'Garage liên kết khu vực Thủ Đức',
            ],
            [
                'code' => 'GT2',
                'name' => 'Garage Liên Kết 2',
                'type' => 'partner',
                'address' => '321 Đường Nguyễn Văn Linh, Phường Tân Phú',
                'ward' => 'Tân Phú',
                'district' => 'Quận 7',
                'province' => 'TP. Hồ Chí Minh',
                'postal_code' => '700000',
                'contact_person' => 'Phạm Văn Hùng',
                'phone' => '0934567890',
                'email' => 'garage2@partner.com',
                'is_main_warehouse' => false,
                'can_receive_transfers' => true,
                'can_send_transfers' => false,
                'priority_order' => 4,
                'tax_exempt_transfers' => true,
                'is_active' => true,
                'operating_hours' => 'Mon:08:00-17:00|Tue:08:00-17:00|Wed:08:00-17:00|Thu:08:00-17:00|Fri:08:00-17:00',
                'notes' => 'Garage liên kết khu vực Quận 7',
            ],
        ];

        foreach ($warehouses as $warehouseData) {
            Warehouse::updateOrCreate(
                ['code' => $warehouseData['code']],
                $warehouseData
            );
        }

        $this->command->info('Đã tạo ' . count($warehouses) . ' kho/garage thành công!');
    }
}

