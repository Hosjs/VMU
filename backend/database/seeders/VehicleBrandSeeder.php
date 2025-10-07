<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\VehicleBrand;
use App\Models\VehicleModel;

class VehicleBrandSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $brands = [
            [
                'name' => 'Toyota',
                'slug' => 'toyota',
                'country' => 'Japan',
                'description' => 'Thương hiệu ô tô hàng đầu Nhật Bản',
                'is_active' => true,
                'models' => [
                    ['name' => 'Vios', 'type' => 'sedan', 'fuel_type' => 'gasoline'],
                    ['name' => 'Camry', 'type' => 'sedan', 'fuel_type' => 'gasoline'],
                    ['name' => 'Fortuner', 'type' => 'suv', 'fuel_type' => 'diesel'],
                    ['name' => 'Innova', 'type' => 'mpv', 'fuel_type' => 'gasoline'],
                    ['name' => 'Corolla Altis', 'type' => 'sedan', 'fuel_type' => 'gasoline'],
                ],
            ],
            [
                'name' => 'Honda',
                'slug' => 'honda',
                'country' => 'Japan',
                'description' => 'Thương hiệu ô tô uy tín Nhật Bản',
                'is_active' => true,
                'models' => [
                    ['name' => 'City', 'type' => 'sedan', 'fuel_type' => 'gasoline'],
                    ['name' => 'Civic', 'type' => 'sedan', 'fuel_type' => 'gasoline'],
                    ['name' => 'CR-V', 'type' => 'suv', 'fuel_type' => 'gasoline'],
                    ['name' => 'Accord', 'type' => 'sedan', 'fuel_type' => 'gasoline'],
                    ['name' => 'HR-V', 'type' => 'crossover', 'fuel_type' => 'gasoline'],
                ],
            ],
            [
                'name' => 'Hyundai',
                'slug' => 'hyundai',
                'country' => 'South Korea',
                'description' => 'Thương hiệu ô tô hàng đầu Hàn Quốc',
                'is_active' => true,
                'models' => [
                    ['name' => 'i10', 'type' => 'hatchback', 'fuel_type' => 'gasoline'],
                    ['name' => 'Grand i10', 'type' => 'hatchback', 'fuel_type' => 'gasoline'],
                    ['name' => 'Accent', 'type' => 'sedan', 'fuel_type' => 'gasoline'],
                    ['name' => 'Elantra', 'type' => 'sedan', 'fuel_type' => 'gasoline'],
                    ['name' => 'Santa Fe', 'type' => 'suv', 'fuel_type' => 'diesel'],
                    ['name' => 'Tucson', 'type' => 'suv', 'fuel_type' => 'gasoline'],
                ],
            ],
            [
                'name' => 'Mazda',
                'slug' => 'mazda',
                'country' => 'Japan',
                'description' => 'Thương hiệu ô tô Nhật Bản với công nghệ Skyactiv',
                'is_active' => true,
                'models' => [
                    ['name' => 'Mazda 2', 'type' => 'hatchback', 'fuel_type' => 'gasoline'],
                    ['name' => 'Mazda 3', 'type' => 'sedan', 'fuel_type' => 'gasoline'],
                    ['name' => 'Mazda 6', 'type' => 'sedan', 'fuel_type' => 'gasoline'],
                    ['name' => 'CX-5', 'type' => 'suv', 'fuel_type' => 'gasoline'],
                    ['name' => 'CX-8', 'type' => 'suv', 'fuel_type' => 'diesel'],
                ],
            ],
            [
                'name' => 'Ford',
                'slug' => 'ford',
                'country' => 'USA',
                'description' => 'Thương hiệu ô tô Mỹ lâu đời',
                'is_active' => true,
                'models' => [
                    ['name' => 'Ranger', 'type' => 'pickup', 'fuel_type' => 'diesel'],
                    ['name' => 'Everest', 'type' => 'suv', 'fuel_type' => 'diesel'],
                    ['name' => 'EcoSport', 'type' => 'crossover', 'fuel_type' => 'gasoline'],
                    ['name' => 'Territory', 'type' => 'suv', 'fuel_type' => 'gasoline'],
                ],
            ],
            [
                'name' => 'Kia',
                'slug' => 'kia',
                'country' => 'South Korea',
                'description' => 'Thương hiệu ô tô Hàn Quốc',
                'is_active' => true,
                'models' => [
                    ['name' => 'Morning', 'type' => 'hatchback', 'fuel_type' => 'gasoline'],
                    ['name' => 'Soluto', 'type' => 'sedan', 'fuel_type' => 'gasoline'],
                    ['name' => 'Cerato', 'type' => 'sedan', 'fuel_type' => 'gasoline'],
                    ['name' => 'Seltos', 'type' => 'suv', 'fuel_type' => 'gasoline'],
                    ['name' => 'Sorento', 'type' => 'suv', 'fuel_type' => 'diesel'],
                ],
            ],
            [
                'name' => 'VinFast',
                'slug' => 'vinfast',
                'country' => 'Vietnam',
                'description' => 'Thương hiệu ô tô Việt Nam',
                'is_active' => true,
                'models' => [
                    ['name' => 'Fadil', 'type' => 'hatchback', 'fuel_type' => 'gasoline'],
                    ['name' => 'Lux A2.0', 'type' => 'sedan', 'fuel_type' => 'gasoline'],
                    ['name' => 'Lux SA2.0', 'type' => 'suv', 'fuel_type' => 'gasoline'],
                    ['name' => 'VF e34', 'type' => 'crossover', 'fuel_type' => 'electric'],
                    ['name' => 'VF 8', 'type' => 'suv', 'fuel_type' => 'electric'],
                ],
            ],
        ];

        foreach ($brands as $brandData) {
            $models = $brandData['models'] ?? [];
            unset($brandData['models']);

            $brand = VehicleBrand::updateOrCreate(
                ['slug' => $brandData['slug']],
                $brandData
            );

            foreach ($models as $modelData) {
                VehicleModel::updateOrCreate(
                    [
                        'brand_id' => $brand->id,
                        'slug' => \Illuminate\Support\Str::slug($modelData['name']),
                    ],
                    array_merge($modelData, [
                        'brand_id' => $brand->id,
                        'slug' => \Illuminate\Support\Str::slug($modelData['name']),
                        'is_active' => true,
                    ])
                );
            }
        }

        $this->command->info('Đã tạo ' . count($brands) . ' hãng xe và các dòng xe thành công!');
    }
}

