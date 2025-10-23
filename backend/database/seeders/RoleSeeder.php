<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Seed the roles table.
     */
    public function run(): void
    {
        $roles = [
            [
                'name' => 'admin',
                'display_name' => 'Administrator',
                'description' => 'Full system access with all permissions',
                'permissions' => [
                    'users' => ['view', 'create', 'edit', 'delete'],
                    'roles' => ['view', 'create', 'edit', 'delete'],
                    'vehicles' => ['view', 'create', 'edit', 'delete'],
                    'service_requests' => ['view', 'create', 'edit', 'delete'],
                    'orders' => ['view', 'create', 'edit', 'delete'],
                    'reports' => ['view', 'export'],
                    'settings' => ['view', 'edit'],
                ],
                'is_active' => true,
                'is_system' => true,
            ],
            [
                'name' => 'manager',
                'display_name' => 'Manager',
                'description' => 'Management level access',
                'permissions' => [
                    'users' => ['view'],
                    'vehicles' => ['view', 'edit'],
                    'service_requests' => ['view', 'edit'],
                    'orders' => ['view', 'edit'],
                    'reports' => ['view', 'export'],
                ],
                'is_active' => true,
                'is_system' => false,
            ],
            [
                'name' => 'accountant',
                'display_name' => 'Accountant',
                'description' => 'Financial and accounting access',
                'permissions' => [
                    'orders' => ['view', 'edit'],
                    'reports' => ['view', 'export'],
                ],
                'is_active' => true,
                'is_system' => false,
            ],
            [
                'name' => 'mechanic',
                'display_name' => 'Mechanic',
                'description' => 'Technical service access',
                'permissions' => [
                    'service_requests' => ['view', 'edit'],
                    'vehicles' => ['view'],
                ],
                'is_active' => true,
                'is_system' => false,
            ],
            [
                'name' => 'employee',
                'display_name' => 'Employee',
                'description' => 'Basic employee access',
                'permissions' => [
                    'service_requests' => ['view'],
                    'vehicles' => ['view'],
                ],
                'is_active' => true,
                'is_system' => false,
            ],
        ];

        foreach ($roles as $roleData) {
            Role::create($roleData);
            $this->command->info("✅ Created role: {$roleData['display_name']}");
        }
    }
}

