<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Service;
use App\Models\Category;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        // Lấy categories
        $dangKiemXeConCat = Category::where('slug', 'dang-kiem-xe-con')->first();
        $dangKiemXeTaiCat = Category::where('slug', 'dang-kiem-xe-tai')->first();
        $dangKiemXeKhachCat = Category::where('slug', 'dang-kiem-xe-khach')->first();
        $baoHiemTNDSCat = Category::where('slug', 'bao-hiem-tnds')->first();
        $baoHiemVatChatCat = Category::where('slug', 'bao-hiem-vat-chat')->first();
        $sonToanBoCat = Category::where('slug', 'son-toan-bo-xe')->first();
        $sonTungBoPhanCat = Category::where('slug', 'son-tung-bo-phan')->first();
        $suaVaChamCat = Category::where('slug', 'sua-chua-va-cham')->first();
        $baoDuong5kCat = Category::where('slug', 'bao-duong-5000km')->first();
        $baoDuong10kCat = Category::where('slug', 'bao-duong-10000km')->first();
        $baoDuong20kCat = Category::where('slug', 'bao-duong-20000km')->first();
        $baoDuong40kCat = Category::where('slug', 'bao-duong-40000km')->first();
        $suaDongCoCat = Category::where('slug', 'sua-chua-dong-co')->first();
        $suaDienCat = Category::where('slug', 'sua-chua-dien')->first();
        $suaGamCat = Category::where('slug', 'sua-chua-gam')->first();
        $sonGoCat = Category::where('slug', 'son-go-xe')->first();

        $services = [
            // Đăng kiểm
            ['name' => 'Hỗ trợ đăng kiểm xe con (dưới 9 chỗ)', 'code' => 'DK-XC-001', 'description' => 'Dịch vụ toàn diện: Nhận xe tận nơi, xếp hàng đăng kiểm, đăng kiểm và giao trả xe', 'category_id' => $dangKiemXeConCat->id, 'quote_price' => 500000, 'settlement_price' => 400000, 'unit' => 'lần', 'estimated_time' => 240, 'has_warranty' => true, 'warranty_months' => 12, 'is_active' => true],
            ['name' => 'Hỗ trợ đăng kiểm xe tải', 'code' => 'DK-XT-001', 'description' => 'Hỗ trợ đăng kiểm xe tải các loại trọng tải', 'category_id' => $dangKiemXeTaiCat->id, 'quote_price' => 800000, 'settlement_price' => 650000, 'unit' => 'lần', 'estimated_time' => 300, 'has_warranty' => true, 'warranty_months' => 12, 'is_active' => true],
            ['name' => 'Hỗ trợ đăng kiểm xe khách (từ 9 chỗ)', 'code' => 'DK-XK-001', 'description' => 'Dịch vụ đăng kiểm xe khách, xe buýt', 'category_id' => $dangKiemXeKhachCat->id, 'quote_price' => 900000, 'settlement_price' => 750000, 'unit' => 'lần', 'estimated_time' => 360, 'has_warranty' => true, 'warranty_months' => 12, 'is_active' => true],

            // Bảo hiểm
            ['name' => 'Bảo hiểm TNDS xe con (dưới 9 chỗ)', 'code' => 'BH-TNDS-XC', 'description' => 'Bảo hiểm trách nhiệm dân sự bắt buộc cho xe con', 'category_id' => $baoHiemTNDSCat->id, 'quote_price' => 650000, 'settlement_price' => 580000, 'unit' => 'năm', 'estimated_time' => 60, 'has_warranty' => false, 'warranty_months' => 0, 'is_active' => true],
            ['name' => 'Bảo hiểm TNDS xe tải', 'code' => 'BH-TNDS-XT', 'description' => 'Bảo hiểm TNDS cho xe tải', 'category_id' => $baoHiemTNDSCat->id, 'quote_price' => 1200000, 'settlement_price' => 1050000, 'unit' => 'năm', 'estimated_time' => 60, 'has_warranty' => false, 'warranty_months' => 0, 'is_active' => true],
            ['name' => 'Bảo hiểm vật chất mức 1 (50-100 triệu)', 'code' => 'BH-VC-M1', 'description' => 'Bảo hiểm thân vỏ xe giá trị 50-100 triệu', 'category_id' => $baoHiemVatChatCat->id, 'quote_price' => 2500000, 'settlement_price' => 2200000, 'unit' => 'năm', 'estimated_time' => 90, 'has_warranty' => false, 'warranty_months' => 0, 'is_active' => true],
            ['name' => 'Bảo hiểm vật chất mức 2 (100-300 triệu)', 'code' => 'BH-VC-M2', 'description' => 'Bảo hiểm thân vỏ xe giá trị 100-300 triệu', 'category_id' => $baoHiemVatChatCat->id, 'quote_price' => 4500000, 'settlement_price' => 4000000, 'unit' => 'năm', 'estimated_time' => 90, 'has_warranty' => false, 'warranty_months' => 0, 'is_active' => true],
            ['name' => 'Bảo hiểm vật chất mức 3 (trên 300 triệu)', 'code' => 'BH-VC-M3', 'description' => 'Bảo hiểm thân vỏ xe giá trị trên 300 triệu', 'category_id' => $baoHiemVatChatCat->id, 'quote_price' => 7000000, 'settlement_price' => 6200000, 'unit' => 'năm', 'estimated_time' => 90, 'has_warranty' => false, 'warranty_months' => 0, 'is_active' => true],

            // Sơn sửa bảo hiểm
            ['name' => 'Sơn toàn bộ xe (4-7 chỗ)', 'code' => 'SS-BH-FULL-01', 'description' => 'Sơn lại toàn bộ thân xe qua bảo hiểm', 'category_id' => $sonToanBoCat->id, 'quote_price' => 25000000, 'settlement_price' => 20000000, 'unit' => 'lần', 'estimated_time' => 10080, 'has_warranty' => true, 'warranty_months' => 24, 'is_active' => true],
            ['name' => 'Sơn cánh xe trước/sau', 'code' => 'SS-BH-CANH-01', 'description' => 'Sơn từng cánh xe qua bảo hiểm', 'category_id' => $sonTungBoPhanCat->id, 'quote_price' => 3500000, 'settlement_price' => 2800000, 'unit' => 'cánh', 'estimated_time' => 1440, 'has_warranty' => true, 'warranty_months' => 12, 'is_active' => true],
            ['name' => 'Sơn nắp capo/cốp xe', 'code' => 'SS-BH-NAP-01', 'description' => 'Sơn nắp capo hoặc cốp xe qua bảo hiểm', 'category_id' => $sonTungBoPhanCat->id, 'quote_price' => 4000000, 'settlement_price' => 3200000, 'unit' => 'cái', 'estimated_time' => 1440, 'has_warranty' => true, 'warranty_months' => 12, 'is_active' => true],
            ['name' => 'Sửa chữa va chạm nhẹ', 'code' => 'SS-BH-VC-LIGHT', 'description' => 'Sửa chữa va chạm nhẹ qua bảo hiểm', 'category_id' => $suaVaChamCat->id, 'quote_price' => 8000000, 'settlement_price' => 6500000, 'unit' => 'lần', 'estimated_time' => 2880, 'has_warranty' => true, 'warranty_months' => 6, 'is_active' => true],
            ['name' => 'Sửa chữa va chạm nặng', 'code' => 'SS-BH-VC-HEAVY', 'description' => 'Sửa chữa va chạm nặng qua bảo hiểm', 'category_id' => $suaVaChamCat->id, 'quote_price' => 35000000, 'settlement_price' => 28000000, 'unit' => 'lần', 'estimated_time' => 14400, 'has_warranty' => true, 'warranty_months' => 12, 'is_active' => true],

            // Bảo dưỡng
            ['name' => 'Bảo dưỡng 5.000km - Xe con', 'code' => 'BD-5K-XC', 'description' => 'Thay dầu động cơ, lọc dầu. Kiểm tra toàn bộ hệ thống', 'category_id' => $baoDuong5kCat->id, 'quote_price' => 1200000, 'settlement_price' => 950000, 'unit' => 'lần', 'estimated_time' => 120, 'has_warranty' => true, 'warranty_months' => 3, 'is_active' => true],
            ['name' => 'Bảo dưỡng 10.000km - Xe con', 'code' => 'BD-10K-XC', 'description' => 'Thay dầu, lọc dầu, lọc gió, lọc điều hòa', 'category_id' => $baoDuong10kCat->id, 'quote_price' => 2500000, 'settlement_price' => 2000000, 'unit' => 'lần', 'estimated_time' => 180, 'has_warranty' => true, 'warranty_months' => 6, 'is_active' => true],
            ['name' => 'Bảo dưỡng 20.000km - Xe con', 'code' => 'BD-20K-XC', 'description' => 'Bảo dưỡng toàn bộ: thay dầu, lọc, má phanh, bugi', 'category_id' => $baoDuong20kCat->id, 'quote_price' => 4500000, 'settlement_price' => 3600000, 'unit' => 'lần', 'estimated_time' => 240, 'has_warranty' => true, 'warranty_months' => 6, 'is_active' => true],
            ['name' => 'Bảo dưỡng 40.000km - Xe con', 'code' => 'BD-40K-XC', 'description' => 'Bảo dưỡng lớn: thay dầu hộp số, dầu phanh, làm mát', 'category_id' => $baoDuong40kCat->id, 'quote_price' => 7500000, 'settlement_price' => 6000000, 'unit' => 'lần', 'estimated_time' => 360, 'has_warranty' => true, 'warranty_months' => 12, 'is_active' => true],

            // Sửa chữa
            ['name' => 'Sửa chữa động cơ - Đại tu', 'code' => 'SC-DC-DAITU', 'description' => 'Đại tu động cơ: mài xy lanh, thay pit-tông', 'category_id' => $suaDongCoCat->id, 'quote_price' => 25000000, 'settlement_price' => 20000000, 'unit' => 'lần', 'estimated_time' => 7200, 'has_warranty' => true, 'warranty_months' => 12, 'is_active' => true],
            ['name' => 'Sửa hộp số tự động', 'code' => 'SC-DC-HOPSOTD', 'description' => 'Sửa chữa hộp số tự động', 'category_id' => $suaDongCoCat->id, 'quote_price' => 15000000, 'settlement_price' => 12000000, 'unit' => 'lần', 'estimated_time' => 4320, 'has_warranty' => true, 'warranty_months' => 6, 'is_active' => true],
            ['name' => 'Sửa chữa hệ thống điện', 'code' => 'SC-DIEN-001', 'description' => 'Chẩn đoán và sửa chữa các sự cố về điện', 'category_id' => $suaDienCat->id, 'quote_price' => 3000000, 'settlement_price' => 2400000, 'unit' => 'lần', 'estimated_time' => 240, 'has_warranty' => true, 'warranty_months' => 3, 'is_active' => true],
            ['name' => 'Thay ắc quy', 'code' => 'SC-DIEN-ACQUY', 'description' => 'Thay ắc quy mới, kiểm tra hệ thống sạc', 'category_id' => $suaDienCat->id, 'quote_price' => 2500000, 'settlement_price' => 2000000, 'unit' => 'cái', 'estimated_time' => 60, 'has_warranty' => true, 'warranty_months' => 12, 'is_active' => true],
            ['name' => 'Thay phanh đĩa/má phanh', 'code' => 'SC-GAM-PHANH', 'description' => 'Thay phanh đĩa hoặc má phanh các bánh', 'category_id' => $suaGamCat->id, 'quote_price' => 3500000, 'settlement_price' => 2800000, 'unit' => 'bộ', 'estimated_time' => 180, 'has_warranty' => true, 'warranty_months' => 6, 'is_active' => true],
            ['name' => 'Thay giảm xóc', 'code' => 'SC-GAM-GIAMXOC', 'description' => 'Thay giảm xóc trước/sau', 'category_id' => $suaGamCat->id, 'quote_price' => 8000000, 'settlement_price' => 6500000, 'unit' => 'bộ', 'estimated_time' => 240, 'has_warranty' => true, 'warranty_months' => 12, 'is_active' => true],
            ['name' => 'Sơn gò ngoài bảo hiểm - Nhỏ', 'code' => 'SC-SONGO-SMALL', 'description' => 'Sơn gò các vết trầy xước nhỏ', 'category_id' => $sonGoCat->id, 'quote_price' => 2000000, 'settlement_price' => 1600000, 'unit' => 'lần', 'estimated_time' => 720, 'has_warranty' => true, 'warranty_months' => 6, 'is_active' => true],
            ['name' => 'Sơn gò ngoài bảo hiểm - Lớn', 'code' => 'SC-SONGO-LARGE', 'description' => 'Sơn gò móp méo lớn', 'category_id' => $sonGoCat->id, 'quote_price' => 5000000, 'settlement_price' => 4000000, 'unit' => 'lần', 'estimated_time' => 2880, 'has_warranty' => true, 'warranty_months' => 6, 'is_active' => true],
        ];

        foreach ($services as $serviceData) {
            Service::updateOrCreate(['code' => $serviceData['code']], $serviceData);
        }

        $this->command->info('Đã tạo ' . count($services) . ' dịch vụ thành công!');
    }
}

