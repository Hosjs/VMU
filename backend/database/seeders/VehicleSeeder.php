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

        if ($customers->isEmpty()) {
            $this->command->warn('No customers found. Please run CustomerSeeder first.');
            return;
        }

        // Tìm theo tên thay vì slug để đảm bảo tìm được
        $toyotaVios = VehicleModel::whereHas('brand', fn($q) => $q->where('name', 'Toyota'))->where('name', 'Vios')->first();
        $toyotaFortune = VehicleModel::whereHas('brand', fn($q) => $q->where('name', 'Toyota'))->where('name', 'Fortuner')->first();
        $toyotaCamry = VehicleModel::whereHas('brand', fn($q) => $q->where('name', 'Toyota'))->where('name', 'Camry')->first();
        $hondaCity = VehicleModel::whereHas('brand', fn($q) => $q->where('name', 'Honda'))->where('name', 'City')->first();
        $hondaCivic = VehicleModel::whereHas('brand', fn($q) => $q->where('name', 'Honda'))->where('name', 'Civic')->first();
        $hondaCRV = VehicleModel::whereHas('brand', fn($q) => $q->where('name', 'Honda'))->where('name', 'CR-V')->first();
        $hyundaiAccent = VehicleModel::whereHas('brand', fn($q) => $q->where('name', 'Hyundai'))->where('name', 'Accent')->first();
        $hyundaiSantaFe = VehicleModel::whereHas('brand', fn($q) => $q->where('name', 'Hyundai'))->where('name', 'Santa Fe')->first();
        $mazda3 = VehicleModel::whereHas('brand', fn($q) => $q->where('name', 'Mazda'))->where('name', 'Mazda 3')->first();
        $mazdaCX5 = VehicleModel::whereHas('brand', fn($q) => $q->where('name', 'Mazda'))->where('name', 'CX-5')->first();
        $fordRanger = VehicleModel::whereHas('brand', fn($q) => $q->where('name', 'Ford'))->where('name', 'Ranger')->first();

        // Nếu không có vehicle models thì return
        if (!$toyotaVios && !$hondaCity && !$toyotaFortune) {
            $this->command->warn('No vehicle models found. Please check VehicleModelSeeder data.');
            $this->command->info('Available models: ' . VehicleModel::count());
            return;
        }

        $vehicles = [];

        // Chỉ thêm vehicle nếu model tồn tại
        if ($toyotaVios && isset($customers[0])) {
            $vehicles[] = [
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
            ];
        }

        if ($hondaCity && isset($customers[1])) {
            $vehicles[] = [
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
            ];
        }

        if ($toyotaFortune && isset($customers[2])) {
            $vehicles[] = [
                'customer_id' => $customers[2]->id,
                'brand_id' => $toyotaFortune->brand_id,
                'model_id' => $toyotaFortune->id,
                'license_plate' => '51C-11111',
                'vin' => 'VNKKH3J04N0345678',
                'engine_number' => '2GD3456789',
                'year' => 2022,
                'color' => 'Đen',
                'mileage' => 15000,
                'insurance_company' => 'Bảo Minh',
                'insurance_number' => 'BM-2024-007890',
                'insurance_expiry' => '2025-11-30',
                'registration_number' => '51-DK-345678',
                'registration_expiry' => '2026-09-15',
                'last_maintenance' => '2024-07-10',
                'next_maintenance' => '2024-10-10',
                'maintenance_interval' => 10000,
                'notes' => 'Xe SUV cao cấp',
                'is_active' => true,
            ];
        }

        if ($hondaCivic && isset($customers[3])) {
            $vehicles[] = [
                'customer_id' => $customers[3]->id,
                'brand_id' => $hondaCivic->brand_id,
                'model_id' => $hondaCivic->id,
                'license_plate' => '51D-22222',
                'vin' => 'VNKKH4J05N0456789',
                'engine_number' => 'L15B4567890',
                'year' => 2019,
                'color' => 'Xám',
                'mileage' => 65000,
                'insurance_company' => 'Bảo Việt',
                'insurance_number' => 'BV-2024-009012',
                'insurance_expiry' => '2025-08-20',
                'registration_number' => '51-DK-456789',
                'registration_expiry' => '2026-07-25',
                'last_maintenance' => '2024-08-05',
                'next_maintenance' => '2024-11-05',
                'maintenance_interval' => 10000,
                'notes' => 'Xe đã qua sử dụng lâu',
                'is_active' => true,
            ];
        }

        if ($toyotaCamry && isset($customers[4])) {
            $vehicles[] = [
                'customer_id' => $customers[4]->id,
                'brand_id' => $toyotaCamry->brand_id,
                'model_id' => $toyotaCamry->id,
                'license_plate' => '51E-33333',
                'vin' => 'VNKKH5J06N0567890',
                'engine_number' => '2AR5678901',
                'year' => 2023,
                'color' => 'Bạc',
                'mileage' => 8000,
                'insurance_company' => 'PVI',
                'insurance_number' => 'PVI-2024-010123',
                'insurance_expiry' => '2026-01-15',
                'registration_number' => '51-DK-567890',
                'registration_expiry' => '2027-01-10',
                'last_maintenance' => '2024-09-01',
                'next_maintenance' => '2024-12-01',
                'maintenance_interval' => 10000,
                'notes' => 'Xe sedan cao cấp, mới',
                'is_active' => true,
            ];
        }

        foreach ($vehicles as $vehicle) {
            Vehicle::create($vehicle);
        }

        $this->command->info('✅ Đã tạo ' . count($vehicles) . ' vehicles (chỉ tạo nếu có vehicle models)');
    }
}
