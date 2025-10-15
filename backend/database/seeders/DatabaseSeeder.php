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
        // 3. CATEGORIES
        // =====================
        $this->command->info('📦 Đang tạo Categories...');
        $this->call([
            CategorySeeder::class,
        ]);
        $this->command->newLine();

        // =====================
        // 4. VEHICLE BRANDS & MODELS
        // =====================
        $this->command->info('🚗 Đang tạo Vehicle Brands & Models...');
        $this->call([
            VehicleBrandSeeder::class,
            VehicleModelSeeder::class,
        ]);
        $this->command->newLine();

        // =====================
        // 5. SERVICES
        // =====================
        $this->command->info('🔧 Đang tạo Services...');
        $this->call([
            ServiceSeeder::class,
        ]);
        $this->command->newLine();

        // =====================
        // HOÀN TẤT
        // =====================
        $this->command->info('✅ Seed database hoàn tất!');
        $this->command->newLine();
        $this->command->info('📊 Tổng kết:');
        $this->command->info('   - Roles: ' . Role::count());
        $this->command->info('   - Users: ' . User::count());
        $this->command->info('   - Categories: ' . \App\Models\Category::count());
        $this->command->info('   - Vehicle Brands: ' . \App\Models\VehicleBrand::count());
        $this->command->info('   - Vehicle Models: ' . \App\Models\VehicleModel::count());
        $this->command->info('   - Services: ' . \App\Models\Service::count());
    }
}
