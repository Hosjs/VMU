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
        // 2. USERS WITH ROLES
        // =====================
        $this->command->info('👥 Đang tạo Users với Roles...');

        $roles = Role::all()->keyBy('name');

        // Admin User - FULL QUYỀN
        $admin = User::create([
            'name' => 'Nguyễn Văn Admin',
            'email' => 'admin@gara.com',
            'password' => Hash::make('password'),
            'phone' => '0901234567',
            'employee_code' => 'EMP-001',
            'position' => 'Quản trị viên hệ thống',
            'department' => 'Quản lý',
            'hire_date' => now()->subYears(3),
            'salary' => 30000000,
            'role_id' => $roles['admin']->id, // ✅ Gán role trực tiếp
            'custom_permissions' => null, // Admin không cần custom permissions
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        // Log vào user_roles cho audit trail
        UserRole::create([
            'user_id' => $admin->id,
            'role_id' => $roles['admin']->id,
            'assigned_by' => null, // System assigned
            'is_active' => true,
        ]);

        // Manager User
        $manager = User::create([
            'name' => 'Trần Thị Manager',
            'email' => 'manager@gara.com',
            'password' => Hash::make('password'),
            'phone' => '0902345678',
            'employee_code' => 'EMP-002',
            'position' => 'Giám đốc điều hành',
            'department' => 'Quản lý',
            'hire_date' => now()->subYears(2),
            'salary' => 25000000,
            'role_id' => $roles['manager']->id, // ✅ Gán role trực tiếp
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        UserRole::create([
            'user_id' => $manager->id,
            'role_id' => $roles['manager']->id,
            'assigned_by' => $admin->id,
            'is_active' => true,
        ]);

        // Accountant User
        $accountant = User::create([
            'name' => 'Lê Văn Kế Toán',
            'email' => 'accountant@gara.com',
            'password' => Hash::make('password'),
            'phone' => '0903456789',
            'employee_code' => 'EMP-003',
            'position' => 'Kế toán trưởng',
            'department' => 'Kế toán',
            'hire_date' => now()->subYears(2),
            'salary' => 15000000,
            'role_id' => $roles['accountant']->id, // ✅ Gán role trực tiếp
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        UserRole::create([
            'user_id' => $accountant->id,
            'role_id' => $roles['accountant']->id,
            'assigned_by' => $admin->id,
            'is_active' => true,
        ]);

        // Mechanic Users
        $mechanic1 = User::create([
            'name' => 'Phạm Văn Sửa',
            'email' => 'mechanic1@gara.com',
            'password' => Hash::make('password'),
            'phone' => '0904567890',
            'employee_code' => 'EMP-004',
            'position' => 'Thợ cơ khí chính',
            'department' => 'Kỹ thuật',
            'hire_date' => now()->subYear(),
            'salary' => 12000000,
            'role_id' => $roles['mechanic']->id, // ✅ Gán role trực tiếp
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        UserRole::create([
            'user_id' => $mechanic1->id,
            'role_id' => $roles['mechanic']->id,
            'assigned_by' => $admin->id,
            'is_active' => true,
        ]);

        $mechanic2 = User::create([
            'name' => 'Hoàng Văn Điện',
            'email' => 'mechanic2@gara.com',
            'password' => Hash::make('password'),
            'phone' => '0905678901',
            'employee_code' => 'EMP-005',
            'position' => 'Thợ điện',
            'department' => 'Kỹ thuật',
            'hire_date' => now()->subMonths(6),
            'salary' => 10000000,
            'role_id' => $roles['mechanic']->id, // ✅ Gán role trực tiếp
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        UserRole::create([
            'user_id' => $mechanic2->id,
            'role_id' => $roles['mechanic']->id,
            'assigned_by' => $admin->id,
            'is_active' => true,
        ]);

        // Employee Users
        $employee1 = User::create([
            'name' => 'Ngô Thị Tư Vấn',
            'email' => 'employee1@gara.com',
            'password' => Hash::make('password'),
            'phone' => '0906789012',
            'employee_code' => 'EMP-006',
            'position' => 'Nhân viên tư vấn',
            'department' => 'Dịch vụ khách hàng',
            'hire_date' => now()->subMonths(8),
            'salary' => 8000000,
            'role_id' => $roles['employee']->id, // ✅ Gán role trực tiếp
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        UserRole::create([
            'user_id' => $employee1->id,
            'role_id' => $roles['employee']->id,
            'assigned_by' => $admin->id,
            'is_active' => true,
        ]);

        // Warehouse User
        $warehouse = User::create([
            'name' => 'Đỗ Văn Kho',
            'email' => 'warehouse@gara.com',
            'password' => Hash::make('password'),
            'phone' => '0907890123',
            'employee_code' => 'EMP-007',
            'position' => 'Quản lý kho',
            'department' => 'Kho vận',
            'hire_date' => now()->subMonths(10),
            'salary' => 9000000,
            'role_id' => $roles['warehouse']->id, // ✅ Gán role trực tiếp
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        UserRole::create([
            'user_id' => $warehouse->id,
            'role_id' => $roles['warehouse']->id,
            'assigned_by' => $admin->id,
            'is_active' => true,
        ]);

        $this->command->info('✅ Đã tạo 7 users với roles');
        $this->command->table(
            ['Email', 'Role', 'Position'],
            [
                [$admin->email, 'Admin', $admin->position],
                [$manager->email, 'Manager', $manager->position],
                [$accountant->email, 'Accountant', $accountant->position],
                [$mechanic1->email, 'Mechanic', $mechanic1->position],
                [$mechanic2->email, 'Mechanic', $mechanic2->position],
                [$employee1->email, 'Employee', $employee1->position],
                [$warehouse->email, 'Warehouse', $warehouse->position],
            ]
        );
        $this->command->newLine();

        // =====================
        // 3. MASTER DATA
        // =====================
        $this->command->info('📦 Đang tạo Master Data...');
        $this->call([
            // Tạo Brands và Models TRƯỚC để Products và Vehicles có thể reference
            VehicleBrandSeeder::class,
            VehicleModelSeeder::class,

            // Sau đó mới tạo Categories, Products, Services
            CategorySeeder::class,
            ServiceSeeder::class,
            ProductSeeder::class,

            // Cuối cùng tạo Customers, Vehicles, Warehouses, Providers
            WarehouseSeeder::class,
            ProviderSeeder::class,
            CustomerSeeder::class,
            VehicleSeeder::class,
        ]);

        $this->command->newLine();
        $this->command->info('✅ Seed database hoàn tất!');
        $this->command->newLine();

        // Display login credentials
        $this->command->table(
            ['Role', 'Email', 'Password'],
            [
                ['Admin', 'admin@gara.com', 'password'],
                ['Manager', 'manager@gara.com', 'password'],
                ['Accountant', 'accountant@gara.com', 'password'],
                ['Mechanic', 'mechanic1@gara.com', 'password'],
                ['Mechanic', 'mechanic2@gara.com', 'password'],
                ['Employee', 'employee1@gara.com', 'password'],
                ['Employee', 'employee2@gara.com', 'password'],
                ['Warehouse', 'warehouse@gara.com', 'password'],
                ['Custom', 'custom@gara.com', 'password'],
            ]
        );
    }
}
