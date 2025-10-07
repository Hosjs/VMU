<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use App\Models\UserRole;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->command->info('🌱 Bắt đầu seed database...');
        $this->command->newLine();

        // =====================
        // 1. ROLES & PERMISSIONS
        // =====================
        $this->command->info('📋 Đang tạo Roles & Permissions...');
        $this->call([
            RoleSeeder::class,
        ]);
        $this->command->newLine();

        // =====================
        // 2. USERS
        // =====================
        $this->command->info('👥 Đang tạo Users mặc định...');

        // Tạo admin user mặc định
        $adminUser = User::firstOrCreate(
            ['email' => 'admin@garage.com'],
            [
                'name' => 'Administrator',
                'password' => Hash::make('password123'),
                'phone' => '0901234567',
                'employee_code' => 'ADM001',
                'position' => 'Administrator',
                'department' => 'Management',
                'is_active' => true,
            ]
        );

        // Gán role admin
        $adminRole = Role::where('name', 'admin')->first();
        if ($adminRole && !$adminUser->userRole) {
            UserRole::create([
                'user_id' => $adminUser->id,
                'role_id' => $adminRole->id,
                'is_active' => true,
            ]);
        }

        // Tạo manager user mặc định
        $managerUser = User::firstOrCreate(
            ['email' => 'manager@garage.com'],
            [
                'name' => 'Manager',
                'password' => Hash::make('password123'),
                'phone' => '0901234568',
                'employee_code' => 'MNG001',
                'position' => 'Manager',
                'department' => 'Operations',
                'is_active' => true,
            ]
        );

        $managerRole = Role::where('name', 'manager')->first();
        if ($managerRole && !$managerUser->userRole) {
            UserRole::create([
                'user_id' => $managerUser->id,
                'role_id' => $managerRole->id,
                'is_active' => true,
            ]);
        }

        // Tạo accountant user
        $accountantUser = User::firstOrCreate(
            ['email' => 'accountant@garage.com'],
            [
                'name' => 'Kế Toán',
                'password' => Hash::make('password123'),
                'phone' => '0901234569',
                'employee_code' => 'ACC001',
                'position' => 'Accountant',
                'department' => 'Finance',
                'is_active' => true,
            ]
        );

        $accountantRole = Role::where('name', 'accountant')->first();
        if ($accountantRole && !$accountantUser->userRole) {
            UserRole::create([
                'user_id' => $accountantUser->id,
                'role_id' => $accountantRole->id,
                'is_active' => true,
            ]);
        }

        // Tạo mechanic user
        $mechanicUser = User::firstOrCreate(
            ['email' => 'mechanic@garage.com'],
            [
                'name' => 'Thợ Máy',
                'password' => Hash::make('password123'),
                'phone' => '0901234570',
                'employee_code' => 'MEC001',
                'position' => 'Mechanic',
                'department' => 'Technical',
                'is_active' => true,
            ]
        );

        $mechanicRole = Role::where('name', 'mechanic')->first();
        if ($mechanicRole && !$mechanicUser->userRole) {
            UserRole::create([
                'user_id' => $mechanicUser->id,
                'role_id' => $mechanicRole->id,
                'is_active' => true,
            ]);
        }

        $this->command->newLine();

        // =====================
        // 3. VEHICLE BRANDS & MODELS
        // =====================
        $this->command->info('🚗 Đang tạo Vehicle Brands & Models...');
        $this->call([
            VehicleBrandSeeder::class,
        ]);
        $this->command->newLine();

        // =====================
        // 4. WAREHOUSES
        // =====================
        $this->command->info('🏭 Đang tạo Warehouses...');
        $this->call([
            WarehouseSeeder::class,
        ]);
        $this->command->newLine();

        // =====================
        // 5. PROVIDERS (ĐỐI TÁC)
        // =====================
        $this->command->info('🤝 Đang tạo Providers...');
        $this->call([
            ProviderSeeder::class,
        ]);
        $this->command->newLine();

        // =====================
        // 6. CATEGORIES
        // =====================
        $this->command->info('📁 Đang tạo Categories...');
        $this->call([
            CategorySeeder::class,
        ]);
        $this->command->newLine();

        // =====================
        // 7. SERVICES (6 DỊCH VỤ CHÍNH)
        // =====================
        $this->command->info('⚙️  Đang tạo Services (6 dịch vụ chính)...');
        $this->call([
            ServiceSeeder::class,
        ]);
        $this->command->newLine();

        // =====================
        // 8. PRODUCTS (PHỤ TÙNG Ô TÔ)
        // =====================
        $this->command->info('📦 Đang tạo Products (Phụ tùng ô tô)...');
        $this->call([
            ProductSeeder::class,
        ]);
        $this->command->newLine();

        // =====================
        // HOÀN TẤT
        // =====================
        $this->command->info('✅ Database seeded successfully!');
        $this->command->newLine();
        $this->command->info('═══════════════════════════════════════════════════════════');
        $this->command->info('📧 TÀI KHOẢN MẶC ĐỊNH:');
        $this->command->info('═══════════════════════════════════════════════════════════');
        $this->command->info('👤 Admin:      admin@garage.com      | Password: password123');
        $this->command->info('👤 Manager:    manager@garage.com    | Password: password123');
        $this->command->info('👤 Accountant: accountant@garage.com | Password: password123');
        $this->command->info('👤 Mechanic:   mechanic@garage.com   | Password: password123');
        $this->command->info('═══════════════════════════════════════════════════════════');
        $this->command->newLine();
        $this->command->info('📊 DỮ LIỆU ĐÃ TẠO:');
        $this->command->info('═══════════════════════════════════════════════════════════');
        $this->command->info('✓ 5 Roles với permissions chi tiết');
        $this->command->info('✓ 4 Users mặc định');
        $this->command->info('✓ 7 Hãng xe + 35+ Dòng xe');
        $this->command->info('✓ 4 Kho/Garage');
        $this->command->info('✓ 6 Đối tác (4 garage + 2 bảo hiểm)');
        $this->command->info('✓ 6 Categories chính + 22 Categories con');
        $this->command->info('✓ 30+ Dịch vụ (6 loại dịch vụ chính)');
        $this->command->info('✓ 25+ Sản phẩm phụ tùng');
        $this->command->info('═══════════════════════════════════════════════════════════');
        $this->command->newLine();
        $this->command->info('🎯 6 DỊCH VỤ CHÍNH:');
        $this->command->info('═══════════════════════════════════════════════════════════');
        $this->command->info('1. ✅ Hỗ trợ đăng kiểm (nhận xe, xếp hàng, đăng kiểm, giao xe)');
        $this->command->info('2. 🛡️  Bảo hiểm xe (TNDS + Vật chất)');
        $this->command->info('3. 🎨 Sơn sửa bảo hiểm');
        $this->command->info('4. 📦 Phụ tùng ô tô');
        $this->command->info('5. 🔧 Bảo dưỡng định kỳ (5K, 10K, 20K, 40K km)');
        $this->command->info('6. 🔨 Sửa chữa tổng hợp (động cơ, điện, gầm, sơn gò)');
        $this->command->info('═══════════════════════════════════════════════════════════');
    }
}
