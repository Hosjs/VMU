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
        $this->command->info('🌱 Starting database seeding...');
        $this->command->newLine();

        // =====================
        // 1. ROLES & PERMISSIONS
        // =====================
        $this->command->info('📋 Creating Roles & Permissions...');
        $this->call([
            RoleSeeder::class,
        ]);
        $this->command->newLine();

        // =====================
        // 2. PASSPORT OAUTH CLIENTS
        // =====================
        $this->command->info('🔐 Setting up Passport...');
        $this->call([
            PassportClientSeeder::class,
        ]);
        $this->command->newLine();

        // =====================
        // 3. ADMIN USER
        // =====================
        $this->command->info('👥 Creating Admin User...');

        $roles = Role::all()->keyBy('name');

        // Admin User
        $admin = User::create([
            'name' => 'System Administrator',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'phone' => '0900000000',
            'employee_code' => 'ADMIN-001',
            'position' => 'System Administrator',
            'department' => 'Management',
            'hire_date' => now(),
            'salary' => 30000000,
            'role_id' => $roles['admin']->id,
            'custom_permissions' => null,
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        // Log into user_roles for audit trail
        UserRole::create([
            'user_id' => $admin->id,
            'role_id' => $roles['admin']->id,
            'assigned_by' => null, // System assigned
            'is_active' => true,
        ]);

        $this->command->info('✅ Admin user created successfully');
        $this->command->table(
            ['Email', 'Password', 'Role'],
            [
                ['admin@example.com', 'password', 'Admin'],
            ]
        );
        $this->command->newLine();

        $this->command->info('✅ Database seeding completed!');
    }
}
