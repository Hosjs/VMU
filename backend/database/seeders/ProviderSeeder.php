<?php

namespace Database\Seeders;

use App\Models\Provider;
use Illuminate\Database\Seeder;

class ProviderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Tạo PROVIDERS: cả nhà cung cấp (supplier) và gara liên kết (garage)
     */
    public function run(): void
    {
        $providers = [
            // ==================== GARA LIÊN KẾT ====================
            [
                'code' => 'GARAGE-001',
                'name' => 'Gara Bình Minh',
                'business_name' => 'Công ty TNHH Ô tô Bình Minh',
                'tax_code' => '0123456789',
                'provider_type' => 'garage',
                'contact_person' => 'Nguyễn Văn A',
                'phone' => '0901234567',
                'email' => 'binhminh@garage.com',
                'address' => '123 Đường Lê Lợi, Quận 1, TP.HCM',
                'website' => 'https://gara-binhminh.com',
                'bank_name' => 'Vietcombank',
                'bank_account' => '0123456789012',
                'bank_branch' => 'Chi nhánh TP.HCM',
                'service_types' => 'repair,maintenance,inspection',
                'specializations' => 'engine,transmission,brake',
                'commission_rate' => 15.00,
                'payment_terms' => 15,
                'credit_limit' => 50000000,
                'payment_method' => 'transfer',
                'rating' => 8.5,
                'completed_orders' => 45,
                'average_completion_time' => 4.5,
                'status' => 'active',
                'contract_start' => '2024-01-01',
                'contract_end' => '2025-12-31',
            ],
            [
                'code' => 'GARAGE-002',
                'name' => 'Gara Hoàng Long',
                'business_name' => 'Công ty TNHH Dịch vụ Ô tô Hoàng Long',
                'tax_code' => '0987654321',
                'provider_type' => 'garage',
                'contact_person' => 'Trần Văn B',
                'phone' => '0909876543',
                'email' => 'hoanglong@garage.com',
                'address' => '456 Đường Nguyễn Huệ, Quận 3, TP.HCM',
                'service_types' => 'repair,parts,maintenance',
                'specializations' => 'engine,electrical,bodywork',
                'commission_rate' => 12.00,
                'payment_terms' => 30,
                'credit_limit' => 100000000,
                'payment_method' => 'transfer',
                'rating' => 9.0,
                'completed_orders' => 78,
                'average_completion_time' => 3.8,
                'status' => 'active',
                'contract_start' => '2023-06-01',
                'contract_end' => '2025-05-31',
            ],
            [
                'code' => 'GARAGE-003',
                'name' => 'Gara Thành Công',
                'business_name' => 'Gara Ô tô Thành Công',
                'tax_code' => '0111222333',
                'provider_type' => 'garage',
                'contact_person' => 'Lê Văn C',
                'phone' => '0912345678',
                'email' => 'thanhcong@garage.com',
                'address' => '789 Đường Võ Văn Tần, Quận 10, TP.HCM',
                'service_types' => 'repair,inspection',
                'specializations' => 'suspension,brake,tire',
                'commission_rate' => 18.00,
                'payment_terms' => 7,
                'credit_limit' => 30000000,
                'payment_method' => 'transfer',
                'rating' => 7.5,
                'completed_orders' => 32,
                'average_completion_time' => 5.2,
                'status' => 'active',
                'contract_start' => '2024-03-01',
                'contract_end' => '2025-02-28',
            ],

            // ==================== NHÀ CUNG CẤP PHỤ TÙNG ====================
            [
                'code' => 'SUPPLIER-001',
                'name' => 'Công ty phụ tùng Đông Á',
                'business_name' => 'Công ty TNHH Phụ tùng Ô tô Đông Á',
                'tax_code' => '0333444555',
                'provider_type' => 'supplier',
                'contact_person' => 'Phạm Văn D',
                'phone' => '0923456789',
                'email' => 'dongaparts@supplier.com',
                'address' => '321 Đường Cộng Hòa, Quận Tân Bình, TP.HCM',
                'bank_name' => 'Techcombank',
                'bank_account' => '9876543210123',
                'bank_branch' => 'Chi nhánh Tân Bình',
                'service_types' => null,
                'specializations' => null,
                'commission_rate' => 0,
                'payment_terms' => 30,
                'credit_limit' => 200000000,
                'payment_method' => 'transfer',
                'rating' => 8.8,
                'completed_orders' => 156,
                'average_completion_time' => 0,
                'status' => 'active',
                'contract_start' => '2023-01-01',
                'contract_end' => '2025-12-31',
            ],
            [
                'code' => 'SUPPLIER-002',
                'name' => 'Công ty Dầu nhớt Việt Nam',
                'business_name' => 'Công ty CP Dầu nhớt và Hóa chất Việt Nam',
                'tax_code' => '0555666777',
                'provider_type' => 'supplier',
                'contact_person' => 'Hoàng Văn E',
                'phone' => '0934567890',
                'email' => 'vnmoil@supplier.com',
                'address' => '654 Đường Điện Biên Phủ, Quận Bình Thạnh, TP.HCM',
                'bank_name' => 'VPBank',
                'bank_account' => '5555666677778',
                'bank_branch' => 'Chi nhánh Bình Thạnh',
                'service_types' => null,
                'specializations' => null,
                'commission_rate' => 0,
                'payment_terms' => 15,
                'credit_limit' => 150000000,
                'payment_method' => 'transfer',
                'rating' => 9.2,
                'completed_orders' => 234,
                'average_completion_time' => 0,
                'status' => 'active',
                'contract_start' => '2022-06-01',
                'contract_end' => '2025-05-31',
            ],

            // ==================== CẢ HAI (Gara + Supplier) ====================
            [
                'code' => 'PARTNER-001',
                'name' => 'Trung tâm Ô tô Phương Nam',
                'business_name' => 'Công ty TNHH Ô tô Phương Nam',
                'tax_code' => '0777888999',
                'provider_type' => 'both',
                'contact_person' => 'Vũ Văn F',
                'phone' => '0945678901',
                'email' => 'phuongnam@partner.com',
                'address' => '987 Đường Lý Thường Kiệt, Quận 11, TP.HCM',
                'bank_name' => 'ACB',
                'bank_account' => '7777888899990',
                'bank_branch' => 'Chi nhánh Quận 11',
                'service_types' => 'repair,parts,maintenance,inspection',
                'specializations' => 'engine,electrical,transmission,suspension',
                'commission_rate' => 10.00,
                'payment_terms' => 30,
                'credit_limit' => 300000000,
                'payment_method' => 'transfer',
                'rating' => 9.5,
                'completed_orders' => 189,
                'average_completion_time' => 3.2,
                'status' => 'active',
                'contract_start' => '2022-01-01',
                'contract_end' => '2026-12-31',
            ],
        ];

        foreach ($providers as $provider) {
            Provider::create($provider);
        }

        $this->command->info('✅ Đã tạo ' . count($providers) . ' providers (garage + supplier + both)');
    }
}

