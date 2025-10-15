<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Vehicle;
use App\Models\Customer;
use App\Models\VehicleModel;
use Illuminate\Support\Facades\DB;

class VehicleSeeder extends Seeder
{
    /**
     * Seed phương tiện mẫu
     */
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Vehicle::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Lấy customers và models
        $customers = Customer::all();
        $toyotaVios = VehicleModel::whereHas('brand', fn($q) => $q->where('slug', 'toyota'))->where('slug', 'vios')->first();
        $toyotaFortune = VehicleModel::whereHas('brand', fn($q) => $q->where('slug', 'toyota'))->where('slug', 'fortuner')->first();
        $toyotaCamry = VehicleModel::whereHas('brand', fn($q) => $q->where('slug', 'toyota'))->where('slug', 'camry')->first();
        $hondaCity = VehicleModel::whereHas('brand', fn($q) => $q->where('slug', 'honda'))->where('slug', 'city')->first();
        $hondaCivic = VehicleModel::whereHas('brand', fn($q) => $q->where('slug', 'honda'))->where('slug', 'civic')->first();
        $hondaCRV = VehicleModel::whereHas('brand', fn($q) => $q->where('slug', 'honda'))->where('slug', 'cr-v')->first();
        $hyundaiAccent = VehicleModel::whereHas('brand', fn($q) => $q->where('slug', 'hyundai'))->where('slug', 'accent')->first();
        $hyundaiSantaFe = VehicleModel::whereHas('brand', fn($q) => $q->where('slug', 'hyundai'))->where('slug', 'santa-fe')->first();
        $mazda3 = VehicleModel::whereHas('brand', fn($q) => $q->where('slug', 'mazda'))->where('slug', 'mazda-3')->first();
        $mazdaCX5 = VehicleModel::whereHas('brand', fn($q) => $q->where('slug', 'mazda'))->where('slug', 'cx-5')->first();
        $fordRanger = VehicleModel::whereHas('brand', fn($q) => $q->where('slug', 'ford'))->where('slug', 'ranger')->first();

        $vehicles = [
            [
                'customer_id' => $customers[0]->id,
                'brand_id' => $toyotaVios->brand_id,
                'model_id' => $toyotaVios->id,
                'license_plate' => '51A-12345',
                'vin' => 'VNKKH1J02N0123456',
                'engine_number' => '2NZ1234567',
                'year' => 2020,
                'color' => 'Trắng',
                'mileage' => 45000,
                'insurance_company' => 'Bảo Việt',
                'insurance_number' => 'BV-2024-001234',
                'insurance_expiry' => '2025-12-31',
                'registration_number' => '51-DK-123456',
                'registration_expiry' => '2026-06-30',
                'last_maintenance' => '2024-09-15',
                'next_maintenance' => '2024-12-15',
                'maintenance_interval' => 10000,
                'notes' => 'Xe được bảo dưỡng định kỳ tốt',
                'is_active' => true,
            ],
            [
                'customer_id' => $customers[1]->id,
                'brand_id' => $hondaCity->brand_id,
                'model_id' => $hondaCity->id,
                'license_plate' => '51B-67890',
                'vin' => 'VNKKH2J03N0234567',
                'engine_number' => 'L15A2345678',
                'year' => 2021,
                'color' => 'Đỏ',
                'mileage' => 32000,
                'insurance_company' => 'PVI',
                'insurance_number' => 'PVI-2024-005678',
                'insurance_expiry' => '2025-10-15',
                'registration_number' => '51-DK-234567',
                'registration_expiry' => '2026-08-30',
                'last_maintenance' => '2024-08-20',
                'next_maintenance' => '2024-11-20',
                'maintenance_interval' => 10000,
                'notes' => 'Xe còn mới, ít hư hỏng',
                'is_active' => true,
            ],
            [
                'customer_id' => $customers[2]->id,
                'brand_id' => $toyotaFortune->brand_id,
                'model_id' => $toyotaFortune->id,
                'license_plate' => '51C-11111',
                'vin' => 'VNKKH3J04N0345678',
                'engine_number' => '2GD3456789',
                'year' => 2022,
                'color' => 'Đen',
                'mileage' => 28000,
                'insurance_company' => 'Liberty',
                'insurance_number' => 'LIB-2024-009012',
                'insurance_expiry' => '2026-01-20',
                'registration_number' => '51-DK-345678',
                'registration_expiry' => '2026-12-31',
                'last_maintenance' => '2024-09-10',
                'next_maintenance' => '2025-01-10',
                'maintenance_interval' => 10000,
                'notes' => 'SUV 7 chỗ, gia đình sử dụng',
                'is_active' => true,
            ],
            [
                'customer_id' => $customers[2]->id,
                'brand_id' => $toyotaCamry->brand_id,
                'model_id' => $toyotaCamry->id,
                'license_plate' => '51D-22222',
                'vin' => 'VNKKH4J05N0456789',
                'engine_number' => '2AR4567890',
                'year' => 2023,
                'color' => 'Bạc',
                'mileage' => 15000,
                'insurance_company' => 'Liberty',
                'insurance_number' => 'LIB-2024-009013',
                'insurance_expiry' => '2026-01-20',
                'registration_number' => '51-DK-456789',
                'registration_expiry' => '2027-01-31',
                'last_maintenance' => '2024-10-05',
                'next_maintenance' => '2025-02-05',
                'maintenance_interval' => 10000,
                'notes' => 'Xe công ty, sử dụng đón tiếp khách',
                'is_active' => true,
            ],
            [
                'customer_id' => $customers[3]->id,
                'brand_id' => $hyundaiAccent->brand_id,
                'model_id' => $hyundaiAccent->id,
                'license_plate' => '51E-33333',
                'vin' => 'VNKKH5J06N0567890',
                'engine_number' => 'G4FA5678901',
                'year' => 2019,
                'color' => 'Xanh',
                'mileage' => 65000,
                'insurance_company' => 'MIC',
                'insurance_number' => 'MIC-2024-003456',
                'insurance_expiry' => '2025-11-30',
                'registration_number' => '51-DK-567890',
                'registration_expiry' => '2025-12-31',
                'last_maintenance' => '2024-08-15',
                'next_maintenance' => '2024-11-15',
                'maintenance_interval' => 10000,
                'notes' => 'Xe gia đình, cần bảo dưỡng thường xuyên',
                'is_active' => true,
            ],
            [
                'customer_id' => $customers[4]->id,
                'brand_id' => $hondaCivic->brand_id,
                'model_id' => $hondaCivic->id,
                'license_plate' => '51F-44444',
                'vin' => 'VNKKH6J07N0678901',
                'engine_number' => 'L15B6789012',
                'year' => 2018,
                'color' => 'Trắng',
                'mileage' => 95000,
                'insurance_company' => 'Bảo Minh',
                'insurance_number' => 'BM-2024-007890',
                'insurance_expiry' => '2025-09-15',
                'registration_number' => '51-DK-678901',
                'registration_expiry' => '2025-10-31',
                'last_maintenance' => '2024-09-01',
                'next_maintenance' => '2024-12-01',
                'maintenance_interval' => 10000,
                'notes' => 'Xe taxi, chạy nhiều',
                'is_active' => true,
            ],
            [
                'customer_id' => $customers[5]->id,
                'brand_id' => $mazdaCX5->brand_id,
                'model_id' => $mazdaCX5->id,
                'license_plate' => '51G-55555',
                'vin' => 'VNKKH7J08N0789012',
                'engine_number' => 'SKYG7890123',
                'year' => 2021,
                'color' => 'Xám',
                'mileage' => 38000,
                'insurance_company' => 'PJICO',
                'insurance_number' => 'PJI-2024-001122',
                'insurance_expiry' => '2026-03-31',
                'registration_number' => '51-DK-789012',
                'registration_expiry' => '2026-09-30',
                'last_maintenance' => '2024-09-20',
                'next_maintenance' => '2024-12-20',
                'maintenance_interval' => 10000,
                'notes' => 'SUV 5 chỗ, trạng thái tốt',
                'is_active' => true,
            ],
            [
                'customer_id' => $customers[6]->id,
                'brand_id' => $fordRanger->brand_id,
                'model_id' => $fordRanger->id,
                'license_plate' => '51H-66666',
                'vin' => 'VNKKH8J09N0890123',
                'engine_number' => 'PUMA8901234',
                'year' => 2020,
                'color' => 'Xanh đen',
                'mileage' => 72000,
                'insurance_company' => 'VietinBank Insurance',
                'insurance_number' => 'VBI-2024-004567',
                'insurance_expiry' => '2025-08-31',
                'registration_number' => '51-DK-890123',
                'registration_expiry' => '2025-11-30',
                'last_maintenance' => '2024-08-25',
                'next_maintenance' => '2024-11-25',
                'maintenance_interval' => 10000,
                'notes' => 'Xe bán tải, sử dụng chở hàng',
                'is_active' => true,
            ],
            [
                'customer_id' => $customers[7]->id,
                'brand_id' => $hyundaiSantaFe->brand_id,
                'model_id' => $hyundaiSantaFe->id,
                'license_plate' => '51K-77777',
                'vin' => 'VNKKH9J10N0901234',
                'engine_number' => 'D4HA9012345',
                'year' => 2022,
                'color' => 'Nâu',
                'mileage' => 25000,
                'insurance_company' => 'BIDV Insurance',
                'insurance_number' => 'BIC-2024-008901',
                'insurance_expiry' => '2025-12-15',
                'registration_number' => '51-DK-901234',
                'registration_expiry' => '2027-02-28',
                'last_maintenance' => '2024-09-30',
                'next_maintenance' => '2025-01-30',
                'maintenance_interval' => 10000,
                'notes' => 'SUV cao cấp, chăm sóc kỹ',
                'is_active' => true,
            ],
            [
                'customer_id' => $customers[8]->id,
                'brand_id' => $mazda3->brand_id,
                'model_id' => $mazda3->id,
                'license_plate' => '51L-88888',
                'vin' => 'VNKKH0J11N0012345',
                'engine_number' => 'SKYG0123456',
                'year' => 2021,
                'color' => 'Đỏ pha lê',
                'mileage' => 42000,
                'insurance_company' => 'PTI',
                'insurance_number' => 'PTI-2024-002345',
                'insurance_expiry' => '2026-02-28',
                'registration_number' => '51-DK-012345',
                'registration_expiry' => '2026-10-31',
                'last_maintenance' => '2024-09-12',
                'next_maintenance' => '2024-12-12',
                'maintenance_interval' => 10000,
                'notes' => 'Sedan thể thao, yêu thích tốc độ',
                'is_active' => true,
            ],
            [
                'customer_id' => $customers[9]->id,
                'brand_id' => $hondaCRV->brand_id,
                'model_id' => $hondaCRV->id,
                'license_plate' => '51M-99999',
                'vin' => 'VNKKH1J12N0123457',
                'engine_number' => 'K20C1234567',
                'year' => 2023,
                'color' => 'Trắng ngọc trai',
                'mileage' => 18000,
                'insurance_company' => 'BSH',
                'insurance_number' => 'BSH-2024-006789',
                'insurance_expiry' => '2025-10-31',
                'registration_number' => '51-DK-123457',
                'registration_expiry' => '2027-03-31',
                'last_maintenance' => '2024-10-08',
                'next_maintenance' => '2025-02-08',
                'maintenance_interval' => 10000,
                'notes' => 'Xe mới, còn bảo hành hãng',
                'is_active' => true,
            ],
        ];

        foreach ($vehicles as $vehicleData) {
            Vehicle::create($vehicleData);
        }

        $this->command->info('✅ Đã tạo ' . count($vehicles) . ' phương tiện mẫu');
    }
}

