<?php

namespace Database\Seeders;

use App\Models\Warehouse;
use App\Models\Provider;
use Illuminate\Database\Seeder;

class WarehouseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Tạo KHO: kho chính (Việt Nga) và kho của gara liên kết
     */
    public function run(): void
    {
        $providers = Provider::where('provider_type', '!=', 'supplier')->get();

        $warehouses = [
            // KHO CHÍNH - VIỆT NGA (Thắng Trường)
            [
                'code' => 'VN-MAIN',
                'name' => 'Kho chính Việt Nga',
                'type' => 'main',
                'address' => '100 Đường Nguyễn Trãi, Quận 5, TP.HCM',
                'ward' => 'Phường 10',
                'district' => 'Quận 5',
                'province' => 'TP.HCM',
                'postal_code' => '700000',
                'contact_person' => 'Quản lý kho Việt Nga',
                'phone' => '0900000001',
                'email' => 'kho@vietnga.com',
                'provider_id' => null,
                'is_main_warehouse' => true,
                'can_receive_transfers' => true,
                'can_send_transfers' => true,
                'priority_order' => 1,
                'tax_exempt_transfers' => true,
                'is_active' => true,
            ],
        ];

        // Tạo kho cho từng gara liên kết
        $priority = 2;
        foreach ($providers as $provider) {
            $warehouses[] = [
                'code' => strtoupper($provider->code) . '-WH',
                'name' => 'Kho ' . $provider->name,
                'type' => 'partner',
                'address' => $provider->address,
                'ward' => null,
                'district' => explode(',', $provider->address)[1] ?? 'Quận 1',
                'province' => 'TP.HCM',
                'postal_code' => null,
                'contact_person' => $provider->contact_person,
                'phone' => $provider->phone,
                'email' => $provider->email,
                'provider_id' => $provider->id,
                'is_main_warehouse' => false,
                'can_receive_transfers' => true,
                'can_send_transfers' => false,
                'priority_order' => $priority++,
                'tax_exempt_transfers' => true,
                'is_active' => true,
            ];
        }

        foreach ($warehouses as $warehouse) {
            Warehouse::create($warehouse);
        }

        $this->command->info('✅ Đã tạo ' . count($warehouses) . ' warehouses (1 main + ' . ($priority - 2) . ' partner)');
    }
}

