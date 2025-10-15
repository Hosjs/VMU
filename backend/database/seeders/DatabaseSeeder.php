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
        // 2. USERS (Admin)
        // =====================
        $this->command->info('👤 Đang tạo Admin user...');

        $adminRole = Role::where('name', 'admin')->first();

        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@gara.com',
            'password' => Hash::make('password'),
            'phone' => '0901234567',
            'employee_code' => 'EMP-001',
            'position' => 'Quản trị viên',
            'department' => 'Quản lý',
            'hire_date' => now()->subYears(2),
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        if ($adminRole) {
            UserRole::create([
                'user_id' => $admin->id,
                'role_id' => $adminRole->id,
            ]);
        }

        $this->command->info('✅ Đã tạo Admin: admin@gara.com / password');
        $this->command->newLine();

        // =====================
        // 3. VEHICLE BRANDS & MODELS
        // =====================
        $this->command->info('🚗 Đang tạo Vehicle Brands & Models...');
        $this->call([
            VehicleBrandSeeder::class,
            VehicleModelSeeder::class,
        ]);
        $this->command->newLine();

        // =====================
        // 4. CATEGORIES (CHỈ PHỤ TÙNG)
        // =====================
        $this->command->info('📦 Đang tạo Categories (phụ tùng)...');
        $this->call([
            CategorySeeder::class,
        ]);
        $this->command->newLine();

        // =====================
        // 5. SERVICES (6 DỊCH VỤ CHÍNH - ĐỘC LẬP)
        // =====================
        $this->command->info('🔧 Đang tạo Services (độc lập)...');
        $this->call([
            ServiceSeeder::class,
        ]);
        $this->command->newLine();

        // =====================
        // 6. PROVIDERS (GARA + NHÀ CUNG CẤP)
        // =====================
        $this->command->info('🏢 Đang tạo Providers...');
        $this->call([
            ProviderSeeder::class,
        ]);
        $this->command->newLine();

        // =====================
        // 7. WAREHOUSES
        // =====================
        $this->command->info('🏭 Đang tạo Warehouses...');
        $this->call([
            WarehouseSeeder::class,
        ]);
        $this->command->newLine();

        // =====================
        // 8. PRODUCTS (PHỤ TÙNG)
        // =====================
        $this->command->info('📦 Đang tạo Products...');
        $this->call([
            ProductSeeder::class,
        ]);
        $this->command->newLine();

        // =====================
        // 9. COMPLETE WORKFLOW DATA
        // =====================
        $this->command->info('📊 Đang tạo dữ liệu workflow hoàn chỉnh...');
        $this->call([
            CompleteDataSeeder::class,
        ]);
        $this->command->newLine();

        // =====================
        // HOÀN TẤT
        // =====================
        $this->command->info('✅ Seed database hoàn tất!');
        $this->command->newLine();
        $this->command->info('📊 TỔNG KẾT:');
        $this->command->info('   - Roles: ' . Role::count());
        $this->command->info('   - Users: ' . User::count());
        $this->command->info('   - Categories: ' . \App\Models\Category::count() . ' (CHỈ phụ tùng)');
        $this->command->info('   - Services: ' . \App\Models\Service::count() . ' (6 dịch vụ chính - độc lập)');
        $this->command->info('   - Vehicle Brands: ' . \App\Models\VehicleBrand::count());
        $this->command->info('   - Vehicle Models: ' . \App\Models\VehicleModel::count());
        $this->command->info('   - Providers: ' . \App\Models\Provider::count() . ' (gara + supplier)');
        $this->command->info('   - Warehouses: ' . \App\Models\Warehouse::count());
        $this->command->info('   - Products: ' . \App\Models\Product::count());
        $this->command->info('   - Customers: ' . \App\Models\Customer::count());
        $this->command->info('   - Vehicles: ' . \App\Models\Vehicle::count());
        $this->command->info('   - Service Requests: ' . \App\Models\ServiceRequest::count());
        $this->command->info('   - Orders: ' . \App\Models\Order::count());
        $this->command->info('   - Order Items: ' . \App\Models\OrderItem::count());
        $this->command->info('   - Vehicle Service History: ' . \App\Models\VehicleServiceHistory::count());
        $this->command->newLine();
        $this->command->info('🎉 Database đã sẵn sàng với dữ liệu test hoàn chỉnh!');
    }
}
