<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Service;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $serviceCategory = Category::where('code', 'SERVICE')->first();

        if (!$serviceCategory) {
            $this->command->error('Service category not found! Please run CategorySeeder first.');
            return;
        }

        $services = [
            [
                'name' => 'Engine Repair',
                'code' => 'SV-ENGINE',
                'description' => 'Complete engine repair and overhaul services',
                'category_id' => $serviceCategory->id,
                'unit' => 'service',
                'estimated_time' => 480,
                'has_warranty' => true,
                'warranty_months' => 6,
                'is_active' => true,
            ],
            [
                'name' => 'Transmission Repair',
                'code' => 'SV-TRANSMISSION',
                'description' => 'Automatic and manual transmission repair',
                'category_id' => $serviceCategory->id,
                'unit' => 'service',
                'estimated_time' => 360,
                'has_warranty' => true,
                'warranty_months' => 6,
                'is_active' => true,
            ],
            [
                'name' => 'Brake System Repair',
                'code' => 'SV-BRAKE',
                'description' => 'Complete brake system maintenance and repair',
                'category_id' => $serviceCategory->id,
                'unit' => 'service',
                'estimated_time' => 120,
                'has_warranty' => true,
                'warranty_months' => 3,
                'is_active' => true,
            ],
            [
                'name' => 'Electrical System Repair',
                'code' => 'SV-ELECTRICAL',
                'description' => 'Electrical diagnostics and repair',
                'category_id' => $serviceCategory->id,
                'unit' => 'service',
                'estimated_time' => 180,
                'has_warranty' => true,
                'warranty_months' => 3,
                'is_active' => true,
            ],
            [
                'name' => 'Body Work & Painting',
                'code' => 'SV-BODY',
                'description' => 'Body repair and professional painting',
                'category_id' => $serviceCategory->id,
                'unit' => 'service',
                'estimated_time' => 240,
                'has_warranty' => true,
                'warranty_months' => 3,
                'is_active' => true,
            ],
            [
                'name' => 'Regular Maintenance',
                'code' => 'SV-MAINTENANCE',
                'description' => 'Scheduled maintenance and inspection',
                'category_id' => $serviceCategory->id,
                'unit' => 'service',
                'estimated_time' => 90,
                'has_warranty' => false,
                'warranty_months' => 0,
                'is_active' => true,
            ],
        ];

        foreach ($services as $service) {
            Service::create($service);
        }

        $this->command->info('Created ' . count($services) . ' services');
    }
}
