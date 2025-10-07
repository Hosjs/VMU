<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Hỗ trợ đăng kiểm',
                'slug' => 'ho-tro-dang-kiem',
                'description' => 'Dịch vụ hỗ trợ nhận xe, xếp hàng đăng kiểm, đăng kiểm và giao trả xe tất cả các ngày trong tuần theo giờ hành chính',
                'type' => 'service',
                'image' => '/images/services/dang-kiem.jpg',
                'sort_order' => 1,
                'is_active' => true,
                'children' => [
                    ['name' => 'Đăng kiểm xe con', 'slug' => 'dang-kiem-xe-con', 'description' => 'Đăng kiểm xe con dưới 9 chỗ', 'type' => 'service', 'sort_order' => 1],
                    ['name' => 'Đăng kiểm xe tải', 'slug' => 'dang-kiem-xe-tai', 'description' => 'Đăng kiểm xe tải các loại', 'type' => 'service', 'sort_order' => 2],
                    ['name' => 'Đăng kiểm xe khách', 'slug' => 'dang-kiem-xe-khach', 'description' => 'Đăng kiểm xe khách từ 9 chỗ trở lên', 'type' => 'service', 'sort_order' => 3],
                ]
            ],
            [
                'name' => 'Bảo hiểm xe',
                'slug' => 'bao-hiem-xe',
                'description' => 'Dịch vụ mua bảo hiểm TNDS và bảo hiểm vật chất cho xe',
                'type' => 'service',
                'image' => '/images/services/bao-hiem.jpg',
                'sort_order' => 2,
                'is_active' => true,
                'children' => [
                    ['name' => 'Bảo hiểm TNDS', 'slug' => 'bao-hiem-tnds', 'description' => 'Bảo hiểm trách nhiệm dân sự bắt buộc', 'type' => 'service', 'sort_order' => 1],
                    ['name' => 'Bảo hiểm vật chất', 'slug' => 'bao-hiem-vat-chat', 'description' => 'Bảo hiểm thân vỏ, phụ kiện xe', 'type' => 'service', 'sort_order' => 2],
                ]
            ],
            [
                'name' => 'Sơn sửa bảo hiểm',
                'slug' => 'son-sua-bao-hiem',
                'description' => 'Dịch vụ sơn, sửa chữa xe thông qua bảo hiểm',
                'type' => 'service',
                'image' => '/images/services/son-sua-bao-hiem.jpg',
                'sort_order' => 3,
                'is_active' => true,
                'children' => [
                    ['name' => 'Sơn toàn bộ xe', 'slug' => 'son-toan-bo-xe', 'description' => 'Sơn lại toàn bộ thân xe', 'type' => 'service', 'sort_order' => 1],
                    ['name' => 'Sơn từng bộ phận', 'slug' => 'son-tung-bo-phan', 'description' => 'Sơn từng phần như cánh, nóc, cốp...', 'type' => 'service', 'sort_order' => 2],
                    ['name' => 'Sửa chữa va chạm', 'slug' => 'sua-chua-va-cham', 'description' => 'Sửa chữa xe sau va chạm giao thông', 'type' => 'service', 'sort_order' => 3],
                ]
            ],
            [
                'name' => 'Phụ tùng ô tô',
                'slug' => 'phu-tung-o-to',
                'description' => 'Bán phụ tùng, linh kiện ô tô chính hãng',
                'type' => 'product',
                'image' => '/images/products/phu-tung.jpg',
                'sort_order' => 4,
                'is_active' => true,
                'children' => [
                    ['name' => 'Phụ tùng động cơ', 'slug' => 'phu-tung-dong-co', 'description' => 'Phụ tùng động cơ, hộp số', 'type' => 'product', 'sort_order' => 1],
                    ['name' => 'Phụ tùng điện', 'slug' => 'phu-tung-dien', 'description' => 'Bóng đèn, cầu chì, ắc quy...', 'type' => 'product', 'sort_order' => 2],
                    ['name' => 'Phụ tùng gầm', 'slug' => 'phu-tung-gam', 'description' => 'Phanh, lốp, giảm xóc...', 'type' => 'product', 'sort_order' => 3],
                    ['name' => 'Dầu nhớt', 'slug' => 'dau-nhot', 'description' => 'Dầu nhớt động cơ các loại', 'type' => 'product', 'sort_order' => 4],
                ]
            ],
            [
                'name' => 'Bảo dưỡng định kỳ',
                'slug' => 'bao-duong-dinh-ky',
                'description' => 'Dịch vụ bảo dưỡng định kỳ theo cấp độ',
                'type' => 'service',
                'image' => '/images/services/bao-duong.jpg',
                'sort_order' => 5,
                'is_active' => true,
                'children' => [
                    ['name' => 'Bảo dưỡng 5.000km', 'slug' => 'bao-duong-5000km', 'description' => 'Bảo dưỡng cơ bản sau 5.000km', 'type' => 'service', 'sort_order' => 1],
                    ['name' => 'Bảo dưỡng 10.000km', 'slug' => 'bao-duong-10000km', 'description' => 'Bảo dưỡng tiêu chuẩn sau 10.000km', 'type' => 'service', 'sort_order' => 2],
                    ['name' => 'Bảo dưỡng 20.000km', 'slug' => 'bao-duong-20000km', 'description' => 'Bảo dưỡng nâng cao sau 20.000km', 'type' => 'service', 'sort_order' => 3],
                    ['name' => 'Bảo dưỡng 40.000km', 'slug' => 'bao-duong-40000km', 'description' => 'Bảo dưỡng toàn diện sau 40.000km', 'type' => 'service', 'sort_order' => 4],
                ]
            ],
            [
                'name' => 'Sửa chữa tổng hợp',
                'slug' => 'sua-chua-tong-hop',
                'description' => 'Kiểm tra, sửa chữa, sơn gò ngoài bảo hiểm',
                'type' => 'service',
                'image' => '/images/services/sua-chua.jpg',
                'sort_order' => 6,
                'is_active' => true,
                'children' => [
                    ['name' => 'Sửa chữa động cơ', 'slug' => 'sua-chua-dong-co', 'description' => 'Sửa chữa động cơ, hộp số', 'type' => 'service', 'sort_order' => 1],
                    ['name' => 'Sửa chữa điện', 'slug' => 'sua-chua-dien', 'description' => 'Sửa chữa hệ thống điện, điện tử', 'type' => 'service', 'sort_order' => 2],
                    ['name' => 'Sửa chữa gầm', 'slug' => 'sua-chua-gam', 'description' => 'Sửa chữa hệ thống phanh, lái, treo', 'type' => 'service', 'sort_order' => 3],
                    ['name' => 'Sơn gò xe', 'slug' => 'son-go-xe', 'description' => 'Dịch vụ sơn và gò thân xe ngoài bảo hiểm', 'type' => 'service', 'sort_order' => 4],
                ]
            ],
        ];

        $this->createCategoriesRecursive($categories);
    }

    private function createCategoriesRecursive($categories, $parentId = null)
    {
        foreach ($categories as $categoryData) {
            $children = $categoryData['children'] ?? [];
            unset($categoryData['children']);

            $category = Category::updateOrCreate(
                ['slug' => $categoryData['slug']],
                array_merge($categoryData, ['parent_id' => $parentId])
            );

            if (!empty($children)) {
                $this->createCategoriesRecursive($children, $category->id);
            }
        }
    }
}

