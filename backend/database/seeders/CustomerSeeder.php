<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Customer;
use Illuminate\Support\Facades\DB;

class CustomerSeeder extends Seeder
{
    /**
     * Seed khách hàng mẫu
     */
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Customer::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $customers = [
            [
                'name' => 'Nguyễn Văn An',
                'phone' => '0901234567',
                'email' => 'nva@gmail.com',
                'address' => '123 Nguyễn Trãi, Quận 1, TP.HCM',
                'birth_date' => '1985-05-15',
                'gender' => 'male',
                'insurance_company' => 'Bảo Việt',
                'insurance_number' => 'BV-2024-001234',
                'insurance_expiry' => '2025-12-31',
                'notes' => 'Khách hàng VIP, thường xuyên sử dụng dịch vụ',
                'is_active' => true,
            ],
            [
                'name' => 'Trần Thị Bích',
                'phone' => '0912345678',
                'email' => 'ttb@gmail.com',
                'address' => '456 Lê Lợi, Quận 3, TP.HCM',
                'birth_date' => '1990-08-20',
                'gender' => 'female',
                'insurance_company' => 'PVI',
                'insurance_number' => 'PVI-2024-005678',
                'insurance_expiry' => '2025-10-15',
                'notes' => 'Khách hàng mới, quan tâm đến chất lượng dịch vụ',
                'is_active' => true,
            ],
            [
                'name' => 'Lê Minh Cường',
                'phone' => '0923456789',
                'email' => 'lmc@gmail.com',
                'address' => '789 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM',
                'birth_date' => '1982-03-10',
                'gender' => 'male',
                'insurance_company' => 'Liberty',
                'insurance_number' => 'LIB-2024-009012',
                'insurance_expiry' => '2026-01-20',
                'notes' => 'Chủ doanh nghiệp, có 3 xe',
                'is_active' => true,
            ],
            [
                'name' => 'Phạm Thị Diễm',
                'phone' => '0934567890',
                'email' => 'ptd@gmail.com',
                'address' => '321 Võ Văn Tần, Quận 3, TP.HCM',
                'birth_date' => '1995-11-25',
                'gender' => 'female',
                'insurance_company' => 'MIC',
                'insurance_number' => 'MIC-2024-003456',
                'insurance_expiry' => '2025-11-30',
                'notes' => 'Quan tâm đến bảo dưỡng định kỳ',
                'is_active' => true,
            ],
            [
                'name' => 'Hoàng Văn Em',
                'phone' => '0945678901',
                'email' => 'hve@gmail.com',
                'address' => '654 Trường Chinh, Quận Tân Bình, TP.HCM',
                'birth_date' => '1988-07-30',
                'gender' => 'male',
                'insurance_company' => 'Bảo Minh',
                'insurance_number' => 'BM-2024-007890',
                'insurance_expiry' => '2025-09-15',
                'notes' => 'Lái xe taxi, thường xuyên cần bảo dưỡng',
                'is_active' => true,
            ],
            [
                'name' => 'Vũ Thị Hoa',
                'phone' => '0956789012',
                'email' => 'vth@gmail.com',
                'address' => '987 Phan Văn Trị, Quận Gò Vấp, TP.HCM',
                'birth_date' => '1992-12-05',
                'gender' => 'female',
                'insurance_company' => 'PJICO',
                'insurance_number' => 'PJI-2024-001122',
                'insurance_expiry' => '2026-03-31',
                'notes' => 'Khách hàng trung thành, giới thiệu nhiều người',
                'is_active' => true,
            ],
            [
                'name' => 'Đặng Quốc Khánh',
                'phone' => '0967890123',
                'email' => 'dqk@gmail.com',
                'address' => '159 Nguyễn Văn Cừ, Quận 5, TP.HCM',
                'birth_date' => '1980-04-18',
                'gender' => 'male',
                'insurance_company' => 'VietinBank Insurance',
                'insurance_number' => 'VBI-2024-004567',
                'insurance_expiry' => '2025-08-31',
                'notes' => 'Thợ cơ khí, am hiểu về xe',
                'is_active' => true,
            ],
            [
                'name' => 'Bùi Thị Lan',
                'phone' => '0978901234',
                'email' => 'btl@gmail.com',
                'address' => '753 Lý Thường Kiệt, Quận 10, TP.HCM',
                'birth_date' => '1987-09-22',
                'gender' => 'female',
                'insurance_company' => 'BIDV Insurance',
                'insurance_number' => 'BIC-2024-008901',
                'insurance_expiry' => '2025-12-15',
                'notes' => 'Khách hàng doanh nghiệp',
                'is_active' => true,
            ],
            [
                'name' => 'Ngô Văn Minh',
                'phone' => '0989012345',
                'email' => 'nvm@gmail.com',
                'address' => '852 Cách Mạng Tháng 8, Quận Tân Bình, TP.HCM',
                'birth_date' => '1993-06-14',
                'gender' => 'male',
                'insurance_company' => 'PTI',
                'insurance_number' => 'PTI-2024-002345',
                'insurance_expiry' => '2026-02-28',
                'notes' => 'Thích xe thể thao',
                'is_active' => true,
            ],
            [
                'name' => 'Đỗ Thị Nga',
                'phone' => '0990123456',
                'email' => 'dtn@gmail.com',
                'address' => '951 Hồng Bàng, Quận 6, TP.HCM',
                'birth_date' => '1991-02-08',
                'gender' => 'female',
                'insurance_company' => 'BSH',
                'insurance_number' => 'BSH-2024-006789',
                'insurance_expiry' => '2025-10-31',
                'notes' => 'Khách hàng thân thiết',
                'is_active' => true,
            ],
        ];

        foreach ($customers as $customerData) {
            Customer::create($customerData);
        }

        $this->command->info('✅ Đã tạo ' . count($customers) . ' khách hàng mẫu');
    }
}

