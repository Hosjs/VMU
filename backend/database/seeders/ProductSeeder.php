<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Category;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // Lấy các categories
        $dongCoCategory = Category::where('slug', 'phu-tung-dong-co')->first();
        $dienCategory = Category::where('slug', 'phu-tung-dien')->first();
        $gamCategory = Category::where('slug', 'phu-tung-gam')->first();
        $dauNhotCategory = Category::where('slug', 'dau-nhot')->first();

        $products = [
            // Phụ tùng động cơ
            ['name' => 'Lọc dầu động cơ - Toyota', 'code' => 'PT-DC-LD-TOY', 'sku' => 'LD-TOY-001', 'description' => 'Lọc dầu động cơ chính hãng Toyota', 'category_id' => $dongCoCategory->id, 'quote_price' => 150000, 'settlement_price' => 100000, 'unit' => 'cái', 'track_stock' => true, 'has_warranty' => true, 'warranty_months' => 6, 'supplier_name' => 'Toyota Việt Nam', 'is_active' => true],
            ['name' => 'Lọc dầu động cơ - Honda', 'code' => 'PT-DC-LD-HON', 'sku' => 'LD-HON-001', 'description' => 'Lọc dầu động cơ chính hãng Honda', 'category_id' => $dongCoCategory->id, 'quote_price' => 180000, 'settlement_price' => 120000, 'unit' => 'cái', 'track_stock' => true, 'has_warranty' => true, 'warranty_months' => 6, 'supplier_name' => 'Honda Việt Nam', 'is_active' => true],
            ['name' => 'Lọc gió động cơ - Hyundai', 'code' => 'PT-DC-LG-HYU', 'sku' => 'LG-HYU-001', 'description' => 'Lọc gió động cơ chính hãng Hyundai', 'category_id' => $dongCoCategory->id, 'quote_price' => 250000, 'settlement_price' => 180000, 'unit' => 'cái', 'track_stock' => true, 'has_warranty' => true, 'warranty_months' => 12, 'supplier_name' => 'Hyundai Thành Công', 'is_active' => true],
            ['name' => 'Bugi NGK Iridium', 'code' => 'PT-DC-BUGI-NGK', 'sku' => 'BUGI-NGK-001', 'description' => 'Bugi NGK Iridium IX cao cấp', 'category_id' => $dongCoCategory->id, 'quote_price' => 400000, 'settlement_price' => 300000, 'unit' => 'bộ 4', 'track_stock' => true, 'has_warranty' => true, 'warranty_months' => 24, 'supplier_name' => 'NGK Japan', 'is_active' => true],
            ['name' => 'Dây curoa răng cam - Gates', 'code' => 'PT-DC-CUROA-GATES', 'sku' => 'CUROA-GATES-001', 'description' => 'Dây curoa răng cam chính hãng Gates', 'category_id' => $dongCoCategory->id, 'quote_price' => 1200000, 'settlement_price' => 900000, 'unit' => 'bộ', 'track_stock' => true, 'has_warranty' => true, 'warranty_months' => 12, 'supplier_name' => 'Gates Corporation', 'is_active' => true],

            // Phụ tùng điện
            ['name' => 'Ắc quy GS 55AH (NS60)', 'code' => 'PT-DIEN-ACQ-GS55', 'sku' => 'ACQ-GS-55AH', 'description' => 'Ắc quy GS 55AH chính hãng', 'category_id' => $dienCategory->id, 'quote_price' => 1800000, 'settlement_price' => 1500000, 'unit' => 'cái', 'track_stock' => true, 'has_warranty' => true, 'warranty_months' => 12, 'supplier_name' => 'GS Battery', 'is_active' => true],
            ['name' => 'Ắc quy Varta 70AH', 'code' => 'PT-DIEN-ACQ-VAR70', 'sku' => 'ACQ-VAR-70AH', 'description' => 'Ắc quy Varta 70AH cao cấp', 'category_id' => $dienCategory->id, 'quote_price' => 3500000, 'settlement_price' => 3000000, 'unit' => 'cái', 'track_stock' => true, 'has_warranty' => true, 'warranty_months' => 24, 'supplier_name' => 'Varta Vietnam', 'is_active' => true],
            ['name' => 'Bóng đèn LED Philips H7', 'code' => 'PT-DIEN-DEN-PHI-H7', 'sku' => 'DEN-PHI-H7', 'description' => 'Bóng đèn LED Philips H7', 'category_id' => $dienCategory->id, 'quote_price' => 850000, 'settlement_price' => 650000, 'unit' => 'cặp', 'track_stock' => true, 'has_warranty' => true, 'warranty_months' => 36, 'supplier_name' => 'Philips Vietnam', 'is_active' => true],
            ['name' => 'Cầu chì xe ô tô - Bộ 20 cái', 'code' => 'PT-DIEN-CAUCHI-BO20', 'sku' => 'CAUCHI-BO20', 'description' => 'Bộ 20 cầu chì các loại ampere', 'category_id' => $dienCategory->id, 'quote_price' => 150000, 'settlement_price' => 100000, 'unit' => 'bộ', 'track_stock' => true, 'has_warranty' => false, 'warranty_months' => 0, 'supplier_name' => 'Việt Nhật', 'is_active' => true],

            // Phụ tùng gầm
            ['name' => 'Má phanh Toyota Camry', 'code' => 'PT-GAM-MP-CAMRY', 'sku' => 'MP-CAMRY-001', 'description' => 'Má phanh trước Toyota Camry', 'category_id' => $gamCategory->id, 'quote_price' => 1200000, 'settlement_price' => 900000, 'unit' => 'bộ', 'track_stock' => true, 'has_warranty' => true, 'warranty_months' => 6, 'supplier_name' => 'Toyota Genuine Parts', 'is_active' => true],
            ['name' => 'Phanh đĩa Brembo', 'code' => 'PT-GAM-PD-BREMBO', 'sku' => 'PD-BREMBO-001', 'description' => 'Phanh đĩa cao cấp Brembo', 'category_id' => $gamCategory->id, 'quote_price' => 2500000, 'settlement_price' => 2000000, 'unit' => 'bộ', 'track_stock' => true, 'has_warranty' => true, 'warranty_months' => 12, 'supplier_name' => 'Brembo Italia', 'is_active' => true],
            ['name' => 'Lốp Michelin 205/55R16', 'code' => 'PT-GAM-LOP-MICH-205', 'sku' => 'LOP-MICH-205', 'description' => 'Lốp xe Michelin Primacy 4', 'category_id' => $gamCategory->id, 'quote_price' => 2800000, 'settlement_price' => 2400000, 'unit' => 'cái', 'track_stock' => true, 'has_warranty' => true, 'warranty_months' => 60, 'supplier_name' => 'Michelin Vietnam', 'is_active' => true],
            ['name' => 'Lốp Bridgestone 215/60R16', 'code' => 'PT-GAM-LOP-BRID-215', 'sku' => 'LOP-BRID-215', 'description' => 'Lốp Bridgestone Turanza T005', 'category_id' => $gamCategory->id, 'quote_price' => 2500000, 'settlement_price' => 2100000, 'unit' => 'cái', 'track_stock' => true, 'has_warranty' => true, 'warranty_months' => 48, 'supplier_name' => 'Bridgestone Vietnam', 'is_active' => true],
            ['name' => 'Giảm xóc KYB Excel-G', 'code' => 'PT-GAM-GX-KYB', 'sku' => 'GX-KYB-001', 'description' => 'Giảm xóc KYB Excel-G', 'category_id' => $gamCategory->id, 'quote_price' => 3500000, 'settlement_price' => 2800000, 'unit' => 'bộ 2', 'track_stock' => true, 'has_warranty' => true, 'warranty_months' => 12, 'supplier_name' => 'KYB Japan', 'is_active' => true],

            // Dầu nhớt
            ['name' => 'Dầu nhớt Shell Helix Ultra 5W-40', 'code' => 'PT-DN-SHELL-5W40', 'sku' => 'DN-SHELL-5W40', 'description' => 'Dầu nhớt toàn tổng hợp Shell', 'category_id' => $dauNhotCategory->id, 'quote_price' => 850000, 'settlement_price' => 700000, 'unit' => 'chai 4L', 'track_stock' => true, 'has_warranty' => false, 'warranty_months' => 0, 'supplier_name' => 'Shell Vietnam', 'is_active' => true],
            ['name' => 'Dầu nhớt Castrol Magnatec 10W-40', 'code' => 'PT-DN-CAST-10W40', 'sku' => 'DN-CAST-10W40', 'description' => 'Dầu nhớt bán tổng hợp Castrol', 'category_id' => $dauNhotCategory->id, 'quote_price' => 650000, 'settlement_price' => 520000, 'unit' => 'chai 4L', 'track_stock' => true, 'has_warranty' => false, 'warranty_months' => 0, 'supplier_name' => 'Castrol BP', 'is_active' => true],
            ['name' => 'Dầu nhớt Mobil 1 0W-40', 'code' => 'PT-DN-MOBIL-0W40', 'sku' => 'DN-MOBIL-0W40', 'description' => 'Dầu nhớt toàn tổng hợp cao cấp Mobil 1', 'category_id' => $dauNhotCategory->id, 'quote_price' => 1200000, 'settlement_price' => 1000000, 'unit' => 'chai 4L', 'track_stock' => true, 'has_warranty' => false, 'warranty_months' => 0, 'supplier_name' => 'ExxonMobil', 'is_active' => true],
            ['name' => 'Dầu hộp số ATF Castrol', 'code' => 'PT-DN-CAST-ATF', 'sku' => 'DN-CAST-ATF', 'description' => 'Dầu hộp số tự động Castrol ATF', 'category_id' => $dauNhotCategory->id, 'quote_price' => 180000, 'settlement_price' => 150000, 'unit' => 'chai 1L', 'track_stock' => true, 'has_warranty' => false, 'warranty_months' => 0, 'supplier_name' => 'Castrol BP', 'is_active' => true],
            ['name' => 'Dầu phanh DOT 4', 'code' => 'PT-DN-PHANH-DOT4', 'sku' => 'DN-PHANH-DOT4', 'description' => 'Dầu phanh DOT 4 chính hãng', 'category_id' => $dauNhotCategory->id, 'quote_price' => 120000, 'settlement_price' => 90000, 'unit' => 'chai 500ml', 'track_stock' => true, 'has_warranty' => false, 'warranty_months' => 0, 'supplier_name' => 'Bosch', 'is_active' => true],
        ];

        foreach ($products as $productData) {
            Product::updateOrCreate(['code' => $productData['code']], $productData);
        }

        $this->command->info('Đã tạo ' . count($products) . ' sản phẩm thành công!');
    }
}

