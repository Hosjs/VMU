<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     * CHỈ QUẢN LÝ PHỤ TÙNG/SẢN PHẨM
     * Phân loại: Dầu máy, Lốp xe, Động cơ, Phanh, Lọc, Ắc quy, Đèn, Phụ kiện...
     */
    public function run(): void
    {
        $categories = [
            // DANH MỤC CẤP 1 - NHÓM CHÍNH
            [
                'name' => 'Dầu nhớt và dung dịch',
                'code' => 'OIL',
                'slug' => 'dau-nhot-va-dung-dich',
                'description' => 'Dầu động cơ, dầu hộp số, dầu phanh, nước làm mát',
                'parent_id' => null,
                'sort_order' => 1,
            ],
            [
                'name' => 'Lốp xe',
                'code' => 'TIRE',
                'slug' => 'lop-xe',
                'description' => 'Lốp ô tô các loại, mâm xe',
                'parent_id' => null,
                'sort_order' => 2,
            ],
            [
                'name' => 'Hệ thống động cơ',
                'code' => 'ENGINE',
                'slug' => 'he-thong-dong-co',
                'description' => 'Phụ tùng động cơ: piston, xy lanh, cam...',
                'parent_id' => null,
                'sort_order' => 3,
            ],
            [
                'name' => 'Hệ thống phanh',
                'code' => 'BRAKE',
                'slug' => 'he-thong-phanh',
                'description' => 'Má phanh, đĩa phanh, dầu phanh',
                'parent_id' => null,
                'sort_order' => 4,
            ],
            [
                'name' => 'Hệ thống lọc',
                'code' => 'FILTER',
                'slug' => 'he-thong-loc',
                'description' => 'Lọc gió, lọc dầu, lọc xăng, lọc điều hòa',
                'parent_id' => null,
                'sort_order' => 5,
            ],
            [
                'name' => 'Hệ thống điện',
                'code' => 'ELECTRIC',
                'slug' => 'he-thong-dien',
                'description' => 'Ắc quy, bóng đèn, cầu chì, dây điện',
                'parent_id' => null,
                'sort_order' => 6,
            ],
            [
                'name' => 'Hệ thống treo và giảm xóc',
                'code' => 'SUSPENSION',
                'slug' => 'he-thong-treo-va-giam-xoc',
                'description' => 'Giảm xóc, lò xo, cân bằng',
                'parent_id' => null,
                'sort_order' => 7,
            ],
            [
                'name' => 'Phụ kiện nội thất',
                'code' => 'INTERIOR',
                'slug' => 'phu-kien-noi-that',
                'description' => 'Thảm lót sàn, bọc ghế, phim cách nhiệt',
                'parent_id' => null,
                'sort_order' => 8,
            ],
            [
                'name' => 'Phụ kiện ngoại thất',
                'code' => 'EXTERIOR',
                'slug' => 'phu-kien-ngoai-that',
                'description' => 'Gương chiếu hậu, ốp body kit, cản xe',
                'parent_id' => null,
                'sort_order' => 9,
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }

        // DANH MỤC CẤP 2 - CHI TIẾT DẦU NHỚT
        $oilCategory = Category::where('code', 'OIL')->first();
        $oilSubCategories = [
            [
                'name' => 'Dầu động cơ',
                'code' => 'ENGINE_OIL',
                'slug' => 'dau-dong-co',
                'description' => 'Dầu động cơ tổng hợp, bán tổng hợp, k광물',
                'parent_id' => $oilCategory->id,
                'sort_order' => 1,
            ],
            [
                'name' => 'Dầu hộp số',
                'code' => 'TRANSMISSION_OIL',
                'slug' => 'dau-hop-so',
                'description' => 'Dầu hộp số tự động, số sàn',
                'parent_id' => $oilCategory->id,
                'sort_order' => 2,
            ],
            [
                'name' => 'Dầu phanh',
                'code' => 'BRAKE_FLUID',
                'slug' => 'dau-phanh',
                'description' => 'Dầu phanh DOT3, DOT4, DOT5',
                'parent_id' => $oilCategory->id,
                'sort_order' => 3,
            ],
            [
                'name' => 'Nước làm mát',
                'code' => 'COOLANT',
                'slug' => 'nuoc-lam-mat',
                'description' => 'Nước làm mát động cơ',
                'parent_id' => $oilCategory->id,
                'sort_order' => 4,
            ],
        ];

        foreach ($oilSubCategories as $subCat) {
            Category::create($subCat);
        }

        // DANH MỤC CẤP 2 - CHI TIẾT HỆ THỐNG LỌC
        $filterCategory = Category::where('code', 'FILTER')->first();
        $filterSubCategories = [
            [
                'name' => 'Lọc gió động cơ',
                'code' => 'AIR_FILTER',
                'slug' => 'loc-gio-dong-co',
                'description' => 'Lọc gió động cơ các loại',
                'parent_id' => $filterCategory->id,
                'sort_order' => 1,
            ],
            [
                'name' => 'Lọc dầu động cơ',
                'code' => 'OIL_FILTER',
                'slug' => 'loc-dau-dong-co',
                'description' => 'Lọc dầu động cơ',
                'parent_id' => $filterCategory->id,
                'sort_order' => 2,
            ],
            [
                'name' => 'Lọc xăng',
                'code' => 'FUEL_FILTER',
                'slug' => 'loc-xang',
                'description' => 'Lọc xăng, lọc dầu diesel',
                'parent_id' => $filterCategory->id,
                'sort_order' => 3,
            ],
            [
                'name' => 'Lọc gió điều hòa',
                'code' => 'CABIN_FILTER',
                'slug' => 'loc-gio-dieu-hoa',
                'description' => 'Lọc gió điều hòa cabin',
                'parent_id' => $filterCategory->id,
                'sort_order' => 4,
            ],
        ];

        foreach ($filterSubCategories as $subCat) {
            Category::create($subCat);
        }

        $this->command->info('✅ Đã tạo ' . Category::count() . ' categories (CHỈ phụ tùng/sản phẩm)');
    }
}

