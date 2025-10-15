<?php

namespace Database\Seeders;

use App\Models\VehicleBrand;
use Illuminate\Database\Seeder;

class VehicleBrandSeeder extends Seeder
{
    public function run(): void
    {
        $brands = [
            ['name' => 'Toyota', 'slug' => 'toyota', 'country' => 'Japan', 'is_active' => true],
            ['name' => 'Honda', 'slug' => 'honda', 'country' => 'Japan', 'is_active' => true],
            ['name' => 'Mazda', 'slug' => 'mazda', 'country' => 'Japan', 'is_active' => true],
            ['name' => 'Mitsubishi', 'slug' => 'mitsubishi', 'country' => 'Japan', 'is_active' => true],
            ['name' => 'Suzuki', 'slug' => 'suzuki', 'country' => 'Japan', 'is_active' => true],
            ['name' => 'Nissan', 'slug' => 'nissan', 'country' => 'Japan', 'is_active' => true],
            ['name' => 'Hyundai', 'slug' => 'hyundai', 'country' => 'Korea', 'is_active' => true],
            ['name' => 'Kia', 'slug' => 'kia', 'country' => 'Korea', 'is_active' => true],
            ['name' => 'Ford', 'slug' => 'ford', 'country' => 'USA', 'is_active' => true],
            ['name' => 'Chevrolet', 'slug' => 'chevrolet', 'country' => 'USA', 'is_active' => true],
            ['name' => 'Mercedes-Benz', 'slug' => 'mercedes-benz', 'country' => 'Germany', 'is_active' => true],
            ['name' => 'BMW', 'slug' => 'bmw', 'country' => 'Germany', 'is_active' => true],
            ['name' => 'Volkswagen', 'slug' => 'volkswagen', 'country' => 'Germany', 'is_active' => true],
            ['name' => 'Audi', 'slug' => 'audi', 'country' => 'Germany', 'is_active' => true],
            ['name' => 'VinFast', 'slug' => 'vinfast', 'country' => 'Vietnam', 'is_active' => true],
            ['name' => 'BYD', 'slug' => 'byd', 'country' => 'China', 'is_active' => true],
        ];

        foreach ($brands as $brand) {
            VehicleBrand::create($brand);
        }

        $this->command->info('Created ' . count($brands) . ' vehicle brands');
    }
}

