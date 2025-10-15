<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Support\Facades\DB;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Product::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Lấy các categories
        $dongCoCategory = Category::where('slug', 'phu-tung-dong-co')->first();
        $dienCategory = Category::where('slug', 'phu-tung-dien')->first();
        $gamCategory = Category::where('slug', 'phu-tung-gam')->first();
        $dauNhotCategory = Category::where('slug', 'dau-nhot')->first();

        $products = [
            // ============================================
            // PHỤ TÙNG ĐỘNG CƠ - Ghi rõ hãng xe trong tên và description
            // ============================================

            // TOYOTA
            ['name' => 'Lọc dầu động cơ Toyota Vios/Yaris', 'code' => 'PT-TOY-LD-VIOS', 'sku' => 'LD-TOY-VIOS', 'description' => 'Lọc dầu động cơ chính hãng Toyota cho Vios, Yaris', 'category_id' => $dongCoCategory->id, 'quote_price' => 150000, 'settlement_price' => 100000, 'unit' => 'cái', 'track_stock' => true, 'has_warranty' => true, 'warranty_months' => 6, 'supplier_name' => 'Toyota Việt Nam', 'is_active' => true],
            ['name' => 'Lọc dầu động cơ Toyota Camry/Fortuner', 'code' => 'PT-TOY-LD-CAMRY', 'sku' => 'LD-TOY-CAMRY', 'description' => 'Lọc dầu động cơ chính hãng Toyota cho Camry, Fortuner', 'category_id' => $dongCoCategory->id, 'quote_price' => 200000, 'settlement_price' => 150000, 'unit' => 'cái', 'track_stock' => true, 'has_warranty' => true, 'warranty_months' => 6, 'supplier_name' => 'Toyota Việt Nam', 'is_active' => true],
            ['name' => 'Lọc gió động cơ Toyota Vios', 'code' => 'PT-TOY-LG-VIOS', 'sku' => 'LG-TOY-VIOS', 'description' => 'Lọc gió động cơ chính hãng Toyota Vios', 'category_id' => $dongCoCategory->id, 'quote_price' => 280000, 'settlement_price' => 200000, 'unit' => 'cái', 'track_stock' => true, 'has_warranty' => true, 'warranty_months' => 12, 'supplier_name' => 'Toyota Việt Nam', 'is_active' => true],
            ['name' => 'Bugi NGK cho Toyota Vios/Yaris', 'code' => 'PT-TOY-BUGI-VIOS', 'sku' => 'BUGI-TOY-VIOS', 'description' => 'Bugi NGK Iridium cho Toyota Vios, Yaris', 'category_id' => $dongCoCategory->id, 'quote_price' => 350000, 'settlement_price' => 280000, 'unit' => 'bộ 4', 'track_stock' => true, 'has_warranty' => true, 'warranty_months' => 24, 'supplier_name' => 'NGK Japan', 'is_active' => true],
            ['name' => 'Dây curoa răng cam Toyota Vios', 'code' => 'PT-TOY-CUROA-VIOS', 'sku' => 'CUROA-TOY-VIOS', 'description' => 'Dây curoa răng cam chính hãng Toyota Vios', 'category_id' => $dongCoCategory->id, 'quote_price' => 1500000, 'settlement_price' => 1200000, 'unit' => 'bộ', 'track_stock' => true, 'has_warranty' => true, 'warranty_months' => 12, 'supplier_name' => 'Toyota Việt Nam', 'is_active' => true],

            // HONDA
            ['name' => 'Lọc dầu động cơ Honda City/Civic', 'code' => 'PT-HON-LD-CITY', 'sku' => 'LD-HON-CITY', 'description' => 'Lọc dầu động cơ chính hãng Honda City, Civic', 'category_id' => $dongCoCategory->id, 'quote_price' => 180000, 'settlement_price' => 120000, 'unit' => 'cái', 'track_stock' => true, 'has_warranty' => true, 'warranty_months' => 6, 'supplier_name' => 'Honda Việt Nam', 'is_active' => true],
            ['name' => 'Lọc dầu động cơ Honda CR-V/Accord', 'code' => 'PT-HON-LD-CRV', 'sku' => 'LD-HON-CRV', 'description' => 'Lọc dầu động cơ chính hãng Honda CR-V, Accord', 'category_id' => $dongCoCategory->id, 'quote_price' => 220000, 'settlement_price' => 160000, 'unit' => 'cái', 'track_stock' => true, 'has_warranty' => true, 'warranty_months' => 6, 'supplier_name' => 'Honda Việt Nam', 'is_active' => true],
            ['name' => 'Lọc gió động cơ Honda City', 'code' => 'PT-HON-LG-CITY', 'sku' => 'LG-HON-CITY', 'description' => 'Lọc gió động cơ chính hãng Honda City', 'category_id' => $dongCoCategory->id, 'quote_price' => 300000, 'settlement_price' => 220000, 'unit' => 'cái', 'track_stock' => true, 'has_warranty' => true, 'warranty_months' => 12, 'supplier_name' => 'Honda Việt Nam', 'is_active' => true],
            ['name' => 'Bugi NGK cho Honda City/Civic', 'code' => 'PT-HON-BUGI-CITY', 'sku' => 'BUGI-HON-CITY', 'description' => 'Bugi NGK Iridium cho Honda City, Civic', 'category_id' => $dongCoCategory->id, 'quote_price' => 400000, 'settlement_price' => 320000, 'unit' => 'bộ 4', 'track_stock' => true, 'has_warranty' => true, 'warranty_months' => 24, 'supplier_name' => 'NGK Japan', 'is_active' => true],

            // HYUNDAI
            ['name' => 'Lọc dầu động cơ Hyundai i10/Accent', 'code' => 'PT-HYU-LD-I10', 'sku' => 'LD-HYU-I10', 'description' => 'Lọc dầu động cơ chính hãng Hyundai i10, Accent', 'category_id' => $dongCoCategory->id, 'quote_price' => 160000, 'settlement_price' => 110000, 'unit' => 'cái', 'track_stock' => true, 'has_warranty' => true, 'warranty_months' => 6, 'supplier_name' => 'Hyundai Thành Công', 'is_active' => true],
            ['name' => 'Lọc gió động cơ Hyundai Accent', 'code' => 'PT-HYU-LG-ACCENT', 'sku' => 'LG-HYU-ACCENT', 'description' => 'Lọc gió động cơ chính hãng Hyundai Accent', 'category_id' => $dongCoCategory->id, 'quote_price' => 250000, 'settlement_price' => 180000, 'unit' => 'cái', 'track_stock' => true, 'has_warranty' => true, 'warranty_months' => 12, 'supplier_name' => 'Hyundai Thành Công', 'is_active' => true],
            ['name' => 'Bugi NGK cho Hyundai i10/Grand i10', 'code' => 'PT-HYU-BUGI-I10', 'sku' => 'BUGI-HYU-I10', 'description' => 'Bugi NGK cho Hyundai i10, Grand i10', 'category_id' => $dongCoCategory->id, 'quote_price' => 320000, 'settlement_price' => 250000, 'unit' => 'bộ 4', 'track_stock' => true, 'has_warranty' => true, 'warranty_months' => 24, 'supplier_name' => 'NGK Japan', 'is_active' => true],

            // MAZDA
            ['name' => 'Lọc dầu động cơ Mazda 3/CX-5', 'code' => 'PT-MAZ-LD-3', 'sku' => 'LD-MAZ-3', 'description' => 'Lọc dầu động cơ chính hãng Mazda 3, CX-5', 'category_id' => $dongCoCategory->id, 'quote_price' => 190000, 'settlement_price' => 140000, 'unit' => 'cái', 'track_stock' => true, 'has_warranty' => true, 'warranty_months' => 6, 'supplier_name' => 'Thaco Mazda', 'is_active' => true],
            ['name' => 'Lọc gió động cơ Mazda 3', 'code' => 'PT-MAZ-LG-3', 'sku' => 'LG-MAZ-3', 'description' => 'Lọc gió động cơ chính hãng Mazda 3', 'category_id' => $dongCoCategory->id, 'quote_price' => 270000, 'settlement_price' => 200000, 'unit' => 'cái', 'track_stock' => true, 'has_warranty' => true, 'warranty_months' => 12, 'supplier_name' => 'Thaco Mazda', 'is_active' => true],

            // ============================================
            // PHỤ TÙNG ĐIỆN - Đa năng
            // ============================================
            ['name' => 'Ắc quy GS 55AH cho xe Toyota/Honda', 'code' => 'PT-ACQ-GS-55', 'sku' => 'ACQ-GS-55AH', 'description' => 'Ắc quy GS 55AH phù hợp xe con Toyota, Honda', 'category_id' => $dienCategory->id, 'quote_price' => 1800000, 'settlement_price' => 1500000, 'unit' => 'cái', 'track_stock' => true, 'has_warranty' => true, 'warranty_months' => 12, 'supplier_name' => 'GS Battery', 'is_active' => true],
            ['name' => 'Ắc quy Varta 70AH cho SUV/Bán tải', 'code' => 'PT-ACQ-VAR-70', 'sku' => 'ACQ-VAR-70AH', 'description' => 'Ắc quy Varta 70AH cao cấp cho SUV, bán tải', 'category_id' => $dienCategory->id, 'quote_price' => 3500000, 'settlement_price' => 3000000, 'unit' => 'cái', 'track_stock' => true, 'has_warranty' => true, 'warranty_months' => 24, 'supplier_name' => 'Varta Vietnam', 'is_active' => true],
            ['name' => 'Bóng đèn LED Philips H7 - Đa năng', 'code' => 'PT-DEN-PHI-H7', 'sku' => 'DEN-PHI-H7', 'description' => 'Bóng đèn LED Philips H7 phù hợp đa dạng xe', 'category_id' => $dienCategory->id, 'quote_price' => 850000, 'settlement_price' => 650000, 'unit' => 'cặp', 'track_stock' => true, 'has_warranty' => true, 'warranty_months' => 36, 'supplier_name' => 'Philips Vietnam', 'is_active' => true],
            ['name' => 'Bóng đèn LED Philips H4 - Đa năng', 'code' => 'PT-DEN-PHI-H4', 'sku' => 'DEN-PHI-H4', 'description' => 'Bóng đèn LED Philips H4 phù hợp đa dạng xe', 'category_id' => $dienCategory->id, 'quote_price' => 900000, 'settlement_price' => 700000, 'unit' => 'cặp', 'track_stock' => true, 'has_warranty' => true, 'warranty_months' => 36, 'supplier_name' => 'Philips Vietnam', 'is_active' => true],

            // ============================================
            // PHỤ TÙNG GẦM - Phân loại theo hãng xe
            // ============================================

            // TOYOTA
            ['name' => 'Má phanh Toyota Vios (trước)', 'code' => 'PT-TOY-MP-VIOS', 'sku' => 'MP-TOY-VIOS', 'description' => 'Má phanh trước Toyota Vios chính hãng', 'category_id' => $gamCategory->id, 'quote_price' => 900000, 'settlement_price' => 700000, 'unit' => 'bộ', 'track_stock' => true, 'has_warranty' => true, 'warranty_months' => 6, 'supplier_name' => 'Toyota Genuine Parts', 'is_active' => true],
            ['name' => 'Má phanh Toyota Camry/Fortuner', 'code' => 'PT-TOY-MP-CAMRY', 'sku' => 'MP-TOY-CAMRY', 'description' => 'Má phanh trước Toyota Camry, Fortuner', 'category_id' => $gamCategory->id, 'quote_price' => 1200000, 'settlement_price' => 900000, 'unit' => 'bộ', 'track_stock' => true, 'has_warranty' => true, 'warranty_months' => 6, 'supplier_name' => 'Toyota Genuine Parts', 'is_active' => true],
            ['name' => 'Giảm xóc trước Toyota Vios (KYB)', 'code' => 'PT-TOY-GX-VIOS', 'sku' => 'GX-TOY-VIOS', 'description' => 'Giảm xóc trước KYB cho Toyota Vios', 'category_id' => $gamCategory->id, 'quote_price' => 2800000, 'settlement_price' => 2200000, 'unit' => 'cặp', 'track_stock' => true, 'has_warranty' => true, 'warranty_months' => 12, 'supplier_name' => 'KYB Japan', 'is_active' => true],

            // HONDA
            ['name' => 'Má phanh Honda City/Civic (trước)', 'code' => 'PT-HON-MP-CITY', 'sku' => 'MP-HON-CITY', 'description' => 'Má phanh trước Honda City, Civic chính hãng', 'category_id' => $gamCategory->id, 'quote_price' => 950000, 'settlement_price' => 750000, 'unit' => 'bộ', 'track_stock' => true, 'has_warranty' => true, 'warranty_months' => 6, 'supplier_name' => 'Honda Genuine Parts', 'is_active' => true],
            ['name' => 'Má phanh Honda CR-V/Accord', 'code' => 'PT-HON-MP-CRV', 'sku' => 'MP-HON-CRV', 'description' => 'Má phanh trước Honda CR-V, Accord', 'category_id' => $gamCategory->id, 'quote_price' => 1300000, 'settlement_price' => 1000000, 'unit' => 'bộ', 'track_stock' => true, 'has_warranty' => true, 'warranty_months' => 6, 'supplier_name' => 'Honda Genuine Parts', 'is_active' => true],
            ['name' => 'Giảm xóc trước Honda City (KYB)', 'code' => 'PT-HON-GX-CITY', 'sku' => 'GX-HON-CITY', 'description' => 'Giảm xóc trước KYB cho Honda City', 'category_id' => $gamCategory->id, 'quote_price' => 3000000, 'settlement_price' => 2400000, 'unit' => 'cặp', 'track_stock' => true, 'has_warranty' => true, 'warranty_months' => 12, 'supplier_name' => 'KYB Japan', 'is_active' => true],

            // LỐP XE - Theo size phổ biến
            ['name' => 'Lốp Michelin 185/60R15 (Vios, City)', 'code' => 'PT-LOP-MICH-185', 'sku' => 'LOP-MICH-185', 'description' => 'Lốp Michelin Primacy 4 size 185/60R15 cho Vios, City', 'category_id' => $gamCategory->id, 'quote_price' => 2200000, 'settlement_price' => 1900000, 'unit' => 'cái', 'track_stock' => true, 'has_warranty' => true, 'warranty_months' => 60, 'supplier_name' => 'Michelin Vietnam', 'is_active' => true],
            ['name' => 'Lốp Michelin 205/55R16 (Civic, Mazda3)', 'code' => 'PT-LOP-MICH-205', 'sku' => 'LOP-MICH-205', 'description' => 'Lốp Michelin Primacy 4 size 205/55R16', 'category_id' => $gamCategory->id, 'quote_price' => 2800000, 'settlement_price' => 2400000, 'unit' => 'cái', 'track_stock' => true, 'has_warranty' => true, 'warranty_months' => 60, 'supplier_name' => 'Michelin Vietnam', 'is_active' => true],
            ['name' => 'Lốp Bridgestone 215/60R17 (CR-V, CX-5)', 'code' => 'PT-LOP-BRID-215', 'sku' => 'LOP-BRID-215', 'description' => 'Lốp Bridgestone Turanza T005 size 215/60R17', 'category_id' => $gamCategory->id, 'quote_price' => 3200000, 'settlement_price' => 2800000, 'unit' => 'cái', 'track_stock' => true, 'has_warranty' => true, 'warranty_months' => 48, 'supplier_name' => 'Bridgestone Vietnam', 'is_active' => true],
            ['name' => 'Lốp Bridgestone 265/60R18 (Fortuner)', 'code' => 'PT-LOP-BRID-265', 'sku' => 'LOP-BRID-265', 'description' => 'Lốp Bridgestone Dueler size 265/60R18 cho SUV', 'category_id' => $gamCategory->id, 'quote_price' => 3800000, 'settlement_price' => 3300000, 'unit' => 'cái', 'track_stock' => true, 'has_warranty' => true, 'warranty_months' => 48, 'supplier_name' => 'Bridgestone Vietnam', 'is_active' => true],

            // ============================================
            // DẦU NHỚT - Đa năng cho mọi hãng xe
            // ============================================
            ['name' => 'Dầu nhớt Shell Helix Ultra 5W-40 (Toàn tổng hợp)', 'code' => 'PT-DN-SHELL-5W40', 'sku' => 'DN-SHELL-5W40', 'description' => 'Dầu nhớt toàn tổng hợp Shell Helix Ultra cho xe cao cấp', 'category_id' => $dauNhotCategory->id, 'quote_price' => 850000, 'settlement_price' => 700000, 'unit' => 'chai 4L', 'track_stock' => true, 'has_warranty' => false, 'warranty_months' => 0, 'supplier_name' => 'Shell Vietnam', 'is_active' => true],
            ['name' => 'Dầu nhớt Castrol Magnatec 10W-40 (Bán tổng hợp)', 'code' => 'PT-DN-CAST-10W40', 'sku' => 'DN-CAST-10W40', 'description' => 'Dầu nhớt bán tổng hợp Castrol Magnatec phổ thông', 'category_id' => $dauNhotCategory->id, 'quote_price' => 650000, 'settlement_price' => 520000, 'unit' => 'chai 4L', 'track_stock' => true, 'has_warranty' => false, 'warranty_months' => 0, 'supplier_name' => 'Castrol BP', 'is_active' => true],
            ['name' => 'Dầu nhớt Mobil 1 0W-40 (Toàn tổng hợp cao cấp)', 'code' => 'PT-DN-MOBIL-0W40', 'sku' => 'DN-MOBIL-0W40', 'description' => 'Dầu nhớt toàn tổng hợp cao cấp Mobil 1', 'category_id' => $dauNhotCategory->id, 'quote_price' => 1200000, 'settlement_price' => 1000000, 'unit' => 'chai 4L', 'track_stock' => true, 'has_warranty' => false, 'warranty_months' => 0, 'supplier_name' => 'ExxonMobil', 'is_active' => true],
            ['name' => 'Dầu nhớt Total Quartz 9000 5W-30', 'code' => 'PT-DN-TOTAL-5W30', 'sku' => 'DN-TOTAL-5W30', 'description' => 'Dầu nhớt toàn tổng hợp Total Quartz', 'category_id' => $dauNhotCategory->id, 'quote_price' => 780000, 'settlement_price' => 650000, 'unit' => 'chai 4L', 'track_stock' => true, 'has_warranty' => false, 'warranty_months' => 0, 'supplier_name' => 'Total Vietnam', 'is_active' => true],
            ['name' => 'Dầu hộp số ATF Castrol Transmax', 'code' => 'PT-DN-CAST-ATF', 'sku' => 'DN-CAST-ATF', 'description' => 'Dầu hộp số tự động Castrol ATF', 'category_id' => $dauNhotCategory->id, 'quote_price' => 180000, 'settlement_price' => 150000, 'unit' => 'chai 1L', 'track_stock' => true, 'has_warranty' => false, 'warranty_months' => 0, 'supplier_name' => 'Castrol BP', 'is_active' => true],
            ['name' => 'Dầu phanh DOT 4 Bosch', 'code' => 'PT-DN-PHANH-DOT4', 'sku' => 'DN-PHANH-DOT4', 'description' => 'Dầu phanh DOT 4 chính hãng Bosch', 'category_id' => $dauNhotCategory->id, 'quote_price' => 120000, 'settlement_price' => 90000, 'unit' => 'chai 500ml', 'track_stock' => true, 'has_warranty' => false, 'warranty_months' => 0, 'supplier_name' => 'Bosch', 'is_active' => true],
            ['name' => 'Nước làm mát động cơ Toyota (Đỏ)', 'code' => 'PT-NLC-TOY-RED', 'sku' => 'NLC-TOY-RED', 'description' => 'Nước làm mát chính hãng Toyota màu đỏ', 'category_id' => $dauNhotCategory->id, 'quote_price' => 250000, 'settlement_price' => 200000, 'unit' => 'chai 1L', 'track_stock' => true, 'has_warranty' => false, 'warranty_months' => 0, 'supplier_name' => 'Toyota Việt Nam', 'is_active' => true],
            ['name' => 'Nước làm mát động cơ Honda (Xanh)', 'code' => 'PT-NLC-HON-BLUE', 'sku' => 'NLC-HON-BLUE', 'description' => 'Nước làm mát chính hãng Honda màu xanh', 'category_id' => $dauNhotCategory->id, 'quote_price' => 280000, 'settlement_price' => 220000, 'unit' => 'chai 1L', 'track_stock' => true, 'has_warranty' => false, 'warranty_months' => 0, 'supplier_name' => 'Honda Việt Nam', 'is_active' => true],
        ];

        foreach ($products as $productData) {
            Product::updateOrCreate(['code' => $productData['code']], $productData);
        }

        $this->command->info('✅ Đã tạo ' . count($products) . ' sản phẩm phụ tùng (phân loại theo hãng xe trong tên/mô tả)');
    }
}
