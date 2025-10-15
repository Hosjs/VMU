<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            [
                'name' => 'admin',
                'display_name' => 'Admin',
                'description' => 'System Administrator - Full Access',
                'permissions' => json_encode([
                    'users' => ['view', 'create', 'edit', 'delete'],
                    'roles' => ['view', 'create', 'edit', 'delete'],
                    'customers' => ['view', 'create', 'edit', 'delete'],
                    'vehicles' => ['view', 'create', 'edit', 'delete'],
                    'products' => ['view', 'create', 'edit', 'delete'],
                    'services' => ['view', 'create', 'edit', 'delete'],
                    'categories' => ['view', 'create', 'edit', 'delete'],
                    'orders' => ['view', 'create', 'edit', 'delete', 'approve', 'cancel'],
                    'invoices' => ['view', 'create', 'edit', 'delete', 'approve'],
                    'payments' => ['view', 'create', 'edit', 'delete', 'confirm', 'verify'],
                    'settlements' => ['view', 'create', 'edit', 'delete', 'approve'],
                    'warehouses' => ['view', 'create', 'edit', 'delete'],
                    'stocks' => ['view', 'create', 'edit', 'delete', 'transfer'],
                    'providers' => ['view', 'create', 'edit', 'delete'],
                    'reports' => ['view', 'export'],
                    'settings' => ['view', 'edit'],
                ]),
                'is_active' => true,
            ],
            [
                'name' => 'manager',
                'display_name' => 'Manager',
                'description' => 'Garage Manager - Manage operations',
                'permissions' => json_encode([
                    'users' => ['view', 'create', 'edit'],
                    'customers' => ['view', 'create', 'edit', 'delete'],
                    'vehicles' => ['view', 'create', 'edit', 'delete'],
                    'products' => ['view', 'create', 'edit'],
                    'services' => ['view', 'create', 'edit'],
                    'categories' => ['view'],
                    'orders' => ['view', 'create', 'edit', 'approve', 'cancel'],
                    'invoices' => ['view', 'create', 'edit', 'approve'],
                    'payments' => ['view', 'create', 'edit', 'confirm'],
                    'settlements' => ['view', 'create', 'edit', 'approve'],
                    'warehouses' => ['view', 'create', 'edit'],
                    'stocks' => ['view', 'create', 'edit', 'transfer'],
                    'providers' => ['view', 'create', 'edit'],
                    'reports' => ['view', 'export'],
                    'settings' => ['view'],
                ]),
                'is_active' => true,
            ],
            [
                'name' => 'accountant',
                'display_name' => 'Accountant',
                'description' => 'Accountant - Financial management',
                'permissions' => json_encode([
                    'customers' => ['view'],
                    'vehicles' => ['view'],
                    'products' => ['view'],
                    'services' => ['view'],
                    'orders' => ['view'],
                    'invoices' => ['view', 'create', 'edit', 'approve'],
                    'payments' => ['view', 'create', 'edit', 'delete', 'confirm', 'verify'],
                    'settlements' => ['view', 'create', 'edit', 'delete', 'approve'],
                    'reports' => ['view', 'export'],
                ]),
                'is_active' => true,
            ],
            [
                'name' => 'mechanic',
                'display_name' => 'Mechanic',
                'description' => 'Technician - Perform repairs',
                'permissions' => json_encode([
                    'customers' => ['view'],
                    'vehicles' => ['view'],
                    'products' => ['view'],
                    'services' => ['view'],
                    'orders' => ['view', 'edit'],
                    'stocks' => ['view'],
                ]),
                'is_active' => true,
            ],
            [
                'name' => 'employee',
                'display_name' => 'Employee',
                'description' => 'Service Employee - Handle requests',
                'permissions' => json_encode([
                    'customers' => ['view', 'create', 'edit'],
                    'vehicles' => ['view', 'create', 'edit'],
                    'products' => ['view'],
                    'services' => ['view'],
                    'orders' => ['view', 'create', 'edit'],
                    'invoices' => ['view'],
                ]),
                'is_active' => true,
            ],
            [
                'name' => 'warehouse',
                'display_name' => 'Warehouse Staff',
                'description' => 'Warehouse Staff - Manage inventory',
                'permissions' => json_encode([
                    'products' => ['view', 'create', 'edit'],
                    'categories' => ['view'],
                    'warehouses' => ['view', 'create', 'edit', 'delete'],
                    'stocks' => ['view', 'create', 'edit', 'delete', 'transfer'],
                    'providers' => ['view'],
                ]),
                'is_active' => true,
            ],
        ];

        foreach ($roles as $role) {
            Role::create($role);
        }

        $this->command->info('Created ' . count($roles) . ' roles with permissions');
    }
}
