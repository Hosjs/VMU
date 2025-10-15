<?php

namespace Database\Seeders;

use App\Models\VehicleBrand;
use App\Models\VehicleModel;
use Illuminate\Database\Seeder;

class VehicleModelSeeder extends Seeder
{
    public function run(): void
    {
        $modelsData = [
            'Toyota' => [
                ['name' => 'Vios', 'type' => 'sedan', 'year_start' => 2003, 'fuel_type' => 'Petrol'],
                ['name' => 'Camry', 'type' => 'sedan', 'year_start' => 2006, 'fuel_type' => 'Petrol'],
                ['name' => 'Fortuner', 'type' => 'suv', 'year_start' => 2009, 'fuel_type' => 'Diesel'],
                ['name' => 'Innova', 'type' => 'mpv', 'year_start' => 2006, 'fuel_type' => 'Petrol'],
                ['name' => 'Hilux', 'type' => 'pickup', 'year_start' => 2006, 'fuel_type' => 'Diesel'],
            ],
            'Honda' => [
                ['name' => 'City', 'type' => 'sedan', 'year_start' => 2009, 'fuel_type' => 'Petrol'],
                ['name' => 'Civic', 'type' => 'sedan', 'year_start' => 2006, 'fuel_type' => 'Petrol'],
                ['name' => 'CR-V', 'type' => 'suv', 'year_start' => 2007, 'fuel_type' => 'Petrol'],
                ['name' => 'Accord', 'type' => 'sedan', 'year_start' => 2008, 'fuel_type' => 'Petrol'],
            ],
            'Mazda' => [
                ['name' => 'Mazda3', 'type' => 'sedan', 'year_start' => 2009, 'fuel_type' => 'Petrol'],
                ['name' => 'CX-5', 'type' => 'suv', 'year_start' => 2012, 'fuel_type' => 'Petrol'],
                ['name' => 'CX-8', 'type' => 'suv', 'year_start' => 2019, 'fuel_type' => 'Diesel'],
            ],
            'Hyundai' => [
                ['name' => 'Accent', 'type' => 'sedan', 'year_start' => 2011, 'fuel_type' => 'Petrol'],
                ['name' => 'Tucson', 'type' => 'suv', 'year_start' => 2010, 'fuel_type' => 'Petrol'],
                ['name' => 'Santa Fe', 'type' => 'suv', 'year_start' => 2007, 'fuel_type' => 'Diesel'],
            ],
            'Ford' => [
                ['name' => 'Ranger', 'type' => 'pickup', 'year_start' => 2009, 'fuel_type' => 'Diesel'],
                ['name' => 'Everest', 'type' => 'suv', 'year_start' => 2009, 'fuel_type' => 'Diesel'],
            ],
            'VinFast' => [
                ['name' => 'Fadil', 'type' => 'hatchback', 'year_start' => 2019, 'fuel_type' => 'Petrol'],
                ['name' => 'VF 8', 'type' => 'suv', 'year_start' => 2022, 'fuel_type' => 'Electric'],
                ['name' => 'VF 9', 'type' => 'suv', 'year_start' => 2022, 'fuel_type' => 'Electric'],
            ],
        ];

        $totalModels = 0;
        foreach ($modelsData as $brandName => $models) {
            $brand = VehicleBrand::where('name', $brandName)->first();
            if (!$brand) continue;

            foreach ($models as $model) {
                VehicleModel::create([
                    'name' => $model['name'],
                    'slug' => \Illuminate\Support\Str::slug($brandName . '-' . $model['name']),
                    'brand_id' => $brand->id,
                    'type' => $model['type'],
                    'year_start' => $model['year_start'],
                    'fuel_type' => $model['fuel_type'],
                    'is_active' => true,
                ]);
                $totalModels++;
            }
        }

        $this->command->info('Created ' . $totalModels . ' vehicle models');
    }
}

