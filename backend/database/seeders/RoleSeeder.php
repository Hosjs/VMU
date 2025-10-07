<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Role;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'name' => 'admin',
                'display_name' => 'Quản trị viên',
                'description' => 'Có toàn quyền truy cập và quản lý hệ thống',
                'permissions' => json_encode([
                    'users' => ['view', 'create', 'edit', 'delete'],
                    'roles' => ['view', 'create', 'edit', 'delete'],
                    'customers' => ['view', 'create', 'edit', 'delete'],
                    'vehicles' => ['view', 'create', 'edit', 'delete'],
                    'orders' => ['view', 'create', 'edit', 'delete', 'approve'],
                    'invoices' => ['view', 'create', 'edit', 'delete', 'approve'],
                    'payments' => ['view', 'create', 'edit', 'delete', 'verify'],
                    'settlements' => ['view', 'create', 'edit', 'delete', 'approve'],
                    'warehouses' => ['view', 'create', 'edit', 'delete'],
                    'products' => ['view', 'create', 'edit', 'delete'],
                    'services' => ['view', 'create', 'edit', 'delete'],
                    'providers' => ['view', 'create', 'edit', 'delete'],
                    'reports' => ['view', 'export'],
                    'settings' => ['view', 'edit'],
                ]),
                'is_active' => true,
            ],
            [
                'name' => 'manager',
                'display_name' => 'Quản lý',
                'description' => 'Quản lý hoạt động kinh doanh và nhân sự',
                'permissions' => json_encode([
                    'users' => ['view', 'edit'],
                    'customers' => ['view', 'create', 'edit'],
                    'vehicles' => ['view', 'create', 'edit'],
                    'orders' => ['view', 'create', 'edit', 'approve'],
                    'invoices' => ['view', 'create', 'edit'],
                    'payments' => ['view', 'create'],
                    'settlements' => ['view', 'create', 'edit'],
                    'warehouses' => ['view', 'edit'],
                    'products' => ['view', 'create', 'edit'],
                    'services' => ['view', 'create', 'edit'],
                    'providers' => ['view', 'create', 'edit'],
                    'reports' => ['view', 'export'],
                ]),
                'is_active' => true,
            ],
            [
                'name' => 'accountant',
                'display_name' => 'Kế toán',
                'description' => 'Quản lý tài chính, hóa đơn và thanh toán',
                'permissions' => json_encode([
                    'customers' => ['view'],
                    'orders' => ['view', 'edit'],
                    'invoices' => ['view', 'create', 'edit', 'approve'],
                    'payments' => ['view', 'create', 'edit', 'verify'],
                    'settlements' => ['view', 'create', 'edit', 'approve'],
                    'warehouses' => ['view'],
                    'products' => ['view'],
                    'services' => ['view'],
                    'providers' => ['view'],
                    'reports' => ['view', 'export'],
                ]),
                'is_active' => true,
            ],
            [
                'name' => 'employee',
                'display_name' => 'Nhân viên',
                'description' => 'Nhân viên bán hàng và chăm sóc khách hàng',
                'permissions' => json_encode([
                    'customers' => ['view', 'create', 'edit'],
                    'vehicles' => ['view', 'create', 'edit'],
                    'orders' => ['view', 'create', 'edit'],
                    'invoices' => ['view', 'create'],
                    'payments' => ['view', 'create'],
                    'warehouses' => ['view'],
                    'products' => ['view'],
                    'services' => ['view'],
                ]),
                'is_active' => true,
            ],
            [
                'name' => 'mechanic',
                'display_name' => 'Thợ máy',
                'description' => 'Kỹ thuật viên sửa chữa và bảo dưỡng xe',
                'permissions' => json_encode([
                    'customers' => ['view'],
                    'vehicles' => ['view', 'edit'],
                    'orders' => ['view', 'edit'],
                    'order_items' => ['view', 'edit'],
                    'inspections' => ['view', 'create', 'edit'],
                    'warehouses' => ['view'],
                    'products' => ['view'],
                    'services' => ['view'],
                ]),
                'is_active' => true,
            ],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(
                ['name' => $role['name']],
                $role
            );
        }
    }
}

