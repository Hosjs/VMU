<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Category;
use App\Models\VehicleBrand;
use App\Models\VehicleModel;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Tạo PHỤ TÙNG mẫu - phân loại theo danh mục, hãng xe, dòng xe
     */
    public function run(): void
    {
        // Lấy categories
        $engineOilCat = Category::where('code', 'ENGINE_OIL')->first();
        $oilFilterCat = Category::where('code', 'OIL_FILTER')->first();
        $airFilterCat = Category::where('code', 'AIR_FILTER')->first();
        $brakeCat = Category::where('code', 'BRAKE')->first();
        $tireCat = Category::where('code', 'TIRE')->first();

        // Lấy brands
        $toyota = VehicleBrand::where('name', 'Toyota')->first();
        $honda = VehicleBrand::where('name', 'Honda')->first();
        $mazda = VehicleBrand::where('name', 'Mazda')->first();

        // Lấy models
        $vios = VehicleModel::where('name', 'Vios')->first();
        $camry = VehicleModel::where('name', 'Camry')->first();
        $civic = VehicleModel::where('name', 'Civic')->first();
        $crv = VehicleModel::where('name', 'CR-V')->first();

        $products = [
            // ==================== DẦU ĐỘNG CƠ ====================
            [
                'name' => 'Dầu động cơ Castrol 5W-30 (Toyota)',
                'code' => 'OIL-CASTROL-5W30-TOY',
                'sku' => 'CASTROL-5W30-4L',
                'description' => 'Dầu động cơ tổng hợp cao cấp Castrol 5W-30 dành cho Toyota',
                'category_id' => $engineOilCat->id,
                'vehicle_brand_id' => $toyota->id,
                'vehicle_model_id' => null, // Dùng chung cho tất cả dòng Toyota
                'compatible_years' => '2015,2016,2017,2018,2019,2020,2021,2022,2023,2024',
                'is_universal' => false,
                'cost_price' => 320000, // Giá nhập
                'suggested_price' => 450000, // Giá đề xuất bán
                'unit' => 'lít',
                'is_stockable' => true,
                'track_stock' => true,
                'has_warranty' => false,
                'warranty_months' => 0,
                'min_stock_level' => 10,
                'max_stock_level' => 100,
                'reorder_point' => 15,
                'is_active' => true,
            ],
            [
                'name' => 'Dầu động cơ Shell Helix 5W-40 (Honda)',
                'code' => 'OIL-SHELL-5W40-HON',
                'sku' => 'SHELL-5W40-4L',
                'description' => 'Dầu động cơ tổng hợp Shell Helix 5W-40 cho Honda',
                'category_id' => $engineOilCat->id,
                'vehicle_brand_id' => $honda->id,
                'vehicle_model_id' => null,
                'compatible_years' => '2015,2016,2017,2018,2019,2020,2021,2022,2023,2024',
                'is_universal' => false,
                'cost_price' => 350000,
                'suggested_price' => 480000,
                'unit' => 'lít',
                'is_stockable' => true,
                'track_stock' => true,
                'has_warranty' => false,
                'min_stock_level' => 10,
                'max_stock_level' => 100,
                'reorder_point' => 15,
                'is_active' => true,
            ],
            [
                'name' => 'Dầu động cơ Mobil 1 0W-20 (Cao cấp)',
                'code' => 'OIL-MOBIL-0W20-UNI',
                'sku' => 'MOBIL1-0W20-4L',
                'description' => 'Dầu động cơ tổng hợp toàn phần Mobil 1, dùng chung cho nhiều hãng xe',
                'category_id' => $engineOilCat->id,
                'vehicle_brand_id' => null,
                'vehicle_model_id' => null,
                'compatible_years' => null,
                'is_universal' => true, // Dùng chung
                'cost_price' => 450000,
                'suggested_price' => 620000,
                'unit' => 'lít',
                'is_stockable' => true,
                'track_stock' => true,
                'has_warranty' => false,
                'min_stock_level' => 5,
                'max_stock_level' => 50,
                'reorder_point' => 10,
                'is_active' => true,
            ],

            // ==================== LỌC DẦU ====================
            [
                'name' => 'Lọc dầu Toyota Vios 2018-2023',
                'code' => 'FILTER-OIL-VIOS-18',
                'sku' => 'TOY-VIOS-OILF-001',
                'description' => 'Lọc dầu chính hãng Toyota cho Vios đời 2018-2023',
                'category_id' => $oilFilterCat->id,
                'vehicle_brand_id' => $toyota->id,
                'vehicle_model_id' => $vios->id,
                'compatible_years' => '2018,2019,2020,2021,2022,2023',
                'is_universal' => false,
                'cost_price' => 45000,
                'suggested_price' => 75000,
                'unit' => 'cái',
                'is_stockable' => true,
                'track_stock' => true,
                'has_warranty' => true,
                'warranty_months' => 6,
                'min_stock_level' => 20,
                'max_stock_level' => 200,
                'reorder_point' => 30,
                'is_active' => true,
            ],
            [
                'name' => 'Lọc dầu Toyota Camry 2019-2024',
                'code' => 'FILTER-OIL-CAMRY-19',
                'sku' => 'TOY-CAMRY-OILF-001',
                'description' => 'Lọc dầu chính hãng Toyota cho Camry đời 2019-2024',
                'category_id' => $oilFilterCat->id,
                'vehicle_brand_id' => $toyota->id,
                'vehicle_model_id' => $camry->id,
                'compatible_years' => '2019,2020,2021,2022,2023,2024',
                'is_universal' => false,
                'cost_price' => 55000,
                'suggested_price' => 90000,
                'unit' => 'cái',
                'is_stockable' => true,
                'track_stock' => true,
                'has_warranty' => true,
                'warranty_months' => 6,
                'min_stock_level' => 15,
                'max_stock_level' => 150,
                'reorder_point' => 25,
                'is_active' => true,
            ],
            [
                'name' => 'Lọc dầu Honda Civic 2016-2023',
                'code' => 'FILTER-OIL-CIVIC-16',
                'sku' => 'HON-CIVIC-OILF-001',
                'description' => 'Lọc dầu chính hãng Honda cho Civic đời 2016-2023',
                'category_id' => $oilFilterCat->id,
                'vehicle_brand_id' => $honda->id,
                'vehicle_model_id' => $civic->id,
                'compatible_years' => '2016,2017,2018,2019,2020,2021,2022,2023',
                'is_universal' => false,
                'cost_price' => 48000,
                'suggested_price' => 80000,
                'unit' => 'cái',
                'is_stockable' => true,
                'track_stock' => true,
                'has_warranty' => true,
                'warranty_months' => 6,
                'min_stock_level' => 20,
                'max_stock_level' => 180,
                'reorder_point' => 30,
                'is_active' => true,
            ],

            // ==================== LỌC GIÓ ====================
            [
                'name' => 'Lọc gió động cơ Toyota Vios 2018-2023',
                'code' => 'FILTER-AIR-VIOS-18',
                'sku' => 'TOY-VIOS-AIRF-001',
                'description' => 'Lọc gió động cơ chính hãng Toyota cho Vios đời 2018-2023',
                'category_id' => $airFilterCat->id,
                'vehicle_brand_id' => $toyota->id,
                'vehicle_model_id' => $vios->id,
                'compatible_years' => '2018,2019,2020,2021,2022,2023',
                'is_universal' => false,
                'cost_price' => 85000,
                'suggested_price' => 140000,
                'unit' => 'cái',
                'is_stockable' => true,
                'track_stock' => true,
                'has_warranty' => true,
                'warranty_months' => 12,
                'min_stock_level' => 15,
                'max_stock_level' => 120,
                'reorder_point' => 20,
                'is_active' => true,
            ],
            [
                'name' => 'Lọc gió động cơ Honda CR-V 2017-2023',
                'code' => 'FILTER-AIR-CRV-17',
                'sku' => 'HON-CRV-AIRF-001',
                'description' => 'Lọc gió động cơ chính hãng Honda cho CR-V đời 2017-2023',
                'category_id' => $airFilterCat->id,
                'vehicle_brand_id' => $honda->id,
                'vehicle_model_id' => $crv->id,
                'compatible_years' => '2017,2018,2019,2020,2021,2022,2023',
                'is_universal' => false,
                'cost_price' => 95000,
                'suggested_price' => 155000,
                'unit' => 'cái',
                'is_stockable' => true,
                'track_stock' => true,
                'has_warranty' => true,
                'warranty_months' => 12,
                'min_stock_level' => 10,
                'max_stock_level' => 100,
                'reorder_point' => 15,
                'is_active' => true,
            ],

            // ==================== MÁ PHANH ====================
            [
                'name' => 'Má phanh trước Toyota Vios (Bộ 4 má)',
                'code' => 'BRAKE-PAD-VIOS-F',
                'sku' => 'TOY-VIOS-BRKP-F01',
                'description' => 'Má phanh trước chính hãng Toyota cho Vios, bộ 4 má',
                'category_id' => $brakeCat->id,
                'vehicle_brand_id' => $toyota->id,
                'vehicle_model_id' => $vios->id,
                'compatible_years' => '2015,2016,2017,2018,2019,2020,2021,2022,2023',
                'is_universal' => false,
                'cost_price' => 380000,
                'suggested_price' => 550000,
                'unit' => 'bộ',
                'is_stockable' => true,
                'track_stock' => true,
                'has_warranty' => true,
                'warranty_months' => 12,
                'min_stock_level' => 5,
                'max_stock_level' => 50,
                'reorder_point' => 10,
                'is_active' => true,
            ],
            [
                'name' => 'Má phanh sau Toyota Vios (Bộ 4 má)',
                'code' => 'BRAKE-PAD-VIOS-R',
                'sku' => 'TOY-VIOS-BRKP-R01',
                'description' => 'Má phanh sau chính hãng Toyota cho Vios, bộ 4 má',
                'category_id' => $brakeCat->id,
                'vehicle_brand_id' => $toyota->id,
                'vehicle_model_id' => $vios->id,
                'compatible_years' => '2015,2016,2017,2018,2019,2020,2021,2022,2023',
                'is_universal' => false,
                'cost_price' => 320000,
                'suggested_price' => 480000,
                'unit' => 'bộ',
                'is_stockable' => true,
                'track_stock' => true,
                'has_warranty' => true,
                'warranty_months' => 12,
                'min_stock_level' => 5,
                'max_stock_level' => 50,
                'reorder_point' => 10,
                'is_active' => true,
            ],

            // ==================== LỐP XE ====================
            [
                'name' => 'Lốp Bridgestone 185/60R15 (Toyota Vios)',
                'code' => 'TIRE-BRIDGE-185-60-15',
                'sku' => 'BRIDGE-185-60-R15',
                'description' => 'Lốp Bridgestone Turanza T001 185/60R15 cho Toyota Vios',
                'category_id' => $tireCat->id,
                'vehicle_brand_id' => $toyota->id,
                'vehicle_model_id' => $vios->id,
                'compatible_years' => '2015,2016,2017,2018,2019,2020,2021,2022,2023',
                'is_universal' => false,
                'cost_price' => 850000,
                'suggested_price' => 1150000,
                'unit' => 'cái',
                'is_stockable' => true,
                'track_stock' => true,
                'has_warranty' => true,
                'warranty_months' => 36,
                'min_stock_level' => 8,
                'max_stock_level' => 40,
                'reorder_point' => 12,
                'is_active' => true,
            ],
            [
                'name' => 'Lốp Michelin 215/55R17 (Honda CR-V)',
                'code' => 'TIRE-MICHELIN-215-55-17',
                'sku' => 'MICHELIN-215-55-R17',
                'description' => 'Lốp Michelin Primacy SUV 215/55R17 cho Honda CR-V',
                'category_id' => $tireCat->id,
                'vehicle_brand_id' => $honda->id,
                'vehicle_model_id' => $crv->id,
                'compatible_years' => '2017,2018,2019,2020,2021,2022,2023',
                'is_universal' => false,
                'cost_price' => 1450000,
                'suggested_price' => 1950000,
                'unit' => 'cái',
                'is_stockable' => true,
                'track_stock' => true,
                'has_warranty' => true,
                'warranty_months' => 48,
                'min_stock_level' => 4,
                'max_stock_level' => 24,
                'reorder_point' => 8,
                'is_active' => true,
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }

        $this->command->info('✅ Đã tạo ' . count($products) . ' sản phẩm mẫu (phân loại theo danh mục, hãng, dòng xe)');
    }
}

