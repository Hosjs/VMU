<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Services', 'code' => 'SERVICE', 'slug' => 'services', 'type' => 'service', 'description' => 'Auto repair services', 'parent_id' => null, 'is_active' => true],
            ['name' => 'Parts', 'code' => 'PARTS', 'slug' => 'parts', 'type' => 'product', 'description' => 'Auto parts and accessories', 'parent_id' => null, 'is_active' => true],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }

        $partsCategory = Category::where('code', 'PARTS')->first();

        $partCategories = [
            ['name' => 'Engine', 'code' => 'ENGINE', 'slug' => 'engine', 'type' => 'product', 'parent_id' => $partsCategory->id, 'is_active' => true],
            ['name' => 'Cooling System', 'code' => 'COOLING', 'slug' => 'cooling', 'type' => 'product', 'parent_id' => $partsCategory->id, 'is_active' => true],
            ['name' => 'Fuel System', 'code' => 'FUEL', 'slug' => 'fuel', 'type' => 'product', 'parent_id' => $partsCategory->id, 'is_active' => true],
            ['name' => 'Exhaust System', 'code' => 'EXHAUST', 'slug' => 'exhaust', 'type' => 'product', 'parent_id' => $partsCategory->id, 'is_active' => true],
            ['name' => 'Transmission', 'code' => 'TRANSMISSION', 'slug' => 'transmission', 'type' => 'product', 'parent_id' => $partsCategory->id, 'is_active' => true],
            ['name' => 'Drivetrain', 'code' => 'DRIVETRAIN', 'slug' => 'drivetrain', 'type' => 'product', 'parent_id' => $partsCategory->id, 'is_active' => true],
            ['name' => 'Brake System', 'code' => 'BRAKE', 'slug' => 'brake', 'type' => 'product', 'parent_id' => $partsCategory->id, 'is_active' => true],
            ['name' => 'Suspension', 'code' => 'SUSPENSION', 'slug' => 'suspension', 'type' => 'product', 'parent_id' => $partsCategory->id, 'is_active' => true],
            ['name' => 'Steering', 'code' => 'STEERING', 'slug' => 'steering', 'type' => 'product', 'parent_id' => $partsCategory->id, 'is_active' => true],
            ['name' => 'Electrical', 'code' => 'ELECTRICAL', 'slug' => 'electrical', 'type' => 'product', 'parent_id' => $partsCategory->id, 'is_active' => true],
            ['name' => 'Lighting', 'code' => 'LIGHTING', 'slug' => 'lighting', 'type' => 'product', 'parent_id' => $partsCategory->id, 'is_active' => true],
            ['name' => 'Body Parts', 'code' => 'BODY', 'slug' => 'body', 'type' => 'product', 'parent_id' => $partsCategory->id, 'is_active' => true],
            ['name' => 'Glass', 'code' => 'GLASS', 'slug' => 'glass', 'type' => 'product', 'parent_id' => $partsCategory->id, 'is_active' => true],
            ['name' => 'Interior', 'code' => 'INTERIOR', 'slug' => 'interior', 'type' => 'product', 'parent_id' => $partsCategory->id, 'is_active' => true],
            ['name' => 'HVAC', 'code' => 'HVAC', 'slug' => 'hvac', 'type' => 'product', 'parent_id' => $partsCategory->id, 'is_active' => true],
            ['name' => 'Tires', 'code' => 'TIRES', 'slug' => 'tires', 'type' => 'product', 'parent_id' => $partsCategory->id, 'is_active' => true],
            ['name' => 'Wheels', 'code' => 'WHEELS', 'slug' => 'wheels', 'type' => 'product', 'parent_id' => $partsCategory->id, 'is_active' => true],
            ['name' => 'Oil & Lubricants', 'code' => 'OIL', 'slug' => 'oil', 'type' => 'product', 'parent_id' => $partsCategory->id, 'is_active' => true],
            ['name' => 'Filters', 'code' => 'FILTERS', 'slug' => 'filters', 'type' => 'product', 'parent_id' => $partsCategory->id, 'is_active' => true],
            ['name' => 'Accessories', 'code' => 'ACCESSORIES', 'slug' => 'accessories', 'type' => 'product', 'parent_id' => $partsCategory->id, 'is_active' => true],
        ];

        foreach ($partCategories as $category) {
            Category::create($category);
        }

        $this->command->info('Created ' . Category::count() . ' categories');
    }
}

