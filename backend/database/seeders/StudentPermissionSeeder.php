<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\PermissionModule;
use App\Models\PermissionAction;

class StudentPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Students module - use firstOrCreate
        $module = PermissionModule::firstOrCreate(
            ['name' => 'students'],
            [
                'display_name' => 'Quản lý học viên',
                'description' => 'Quản lý thông tin học viên, hồ sơ, phân lớp',
            ]
        );

        // Create actions for Students module
        $actions = [
            ['action' => 'view', 'display_name' => 'Xem danh sách học viên', 'description' => 'Cho phép xem danh sách và thông tin học viên'],
            ['action' => 'create', 'display_name' => 'Thêm học viên', 'description' => 'Cho phép thêm học viên mới'],
            ['action' => 'edit', 'display_name' => 'Sửa học viên', 'description' => 'Cho phép chỉnh sửa thông tin học viên'],
            ['action' => 'delete', 'display_name' => 'Xóa học viên', 'description' => 'Cho phép xóa học viên'],
            ['action' => 'export', 'display_name' => 'Xuất dữ liệu', 'description' => 'Cho phép xuất danh sách học viên ra Excel/PDF'],
        ];

        foreach ($actions as $action) {
            PermissionAction::firstOrCreate(
                [
                    'module_id' => $module->id,
                    'action' => $action['action'],
                ],
                [
                    'display_name' => $action['display_name'],
                    'description' => $action['description'],
                ]
            );
        }

        // Update admin role to have all students permissions
        $adminRole = DB::table('roles')->where('name', 'admin')->first();
        if ($adminRole) {
            $permissions = json_decode($adminRole->permissions, true) ?? [];
            $permissions['students'] = ['view', 'create', 'edit', 'delete', 'export'];

            DB::table('roles')->where('id', $adminRole->id)->update([
                'permissions' => json_encode($permissions),
                'updated_at' => now(),
            ]);
        }

        $this->command->info('✅ Created students permissions and updated admin role');
    }
}
