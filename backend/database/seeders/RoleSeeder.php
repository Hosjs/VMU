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
                'display_name' => 'Quản trị viên',
                'description' => 'Toàn quyền truy cập hệ thống',
                'permissions' => [
                    'dashboard' => ['view', 'export'],
                    'users' => ['view', 'create', 'edit', 'delete'],
                    'roles' => ['view', 'create', 'edit', 'delete'],
                    'students' => ['view', 'create', 'edit', 'delete', 'import', 'export'],
                    'classrooms' => ['view', 'create', 'edit', 'delete'],
                    'class_assignments' => ['view', 'create', 'edit', 'delete'],
                    'majors' => ['view', 'create', 'edit', 'delete'],
                    'education_levels' => ['view', 'create', 'edit', 'delete'],
                    'courses' => ['view', 'create', 'edit', 'delete'],
                    'teachers' => ['view', 'create', 'edit', 'delete'],
                    'teaching_assignments' => ['view', 'create', 'edit', 'delete'],
                    'teacher_salaries' => ['view', 'create', 'edit', 'delete', 'approve'],
                    'semesters' => ['view', 'create', 'edit', 'delete'],
                    'registration_packages' => ['view', 'create', 'edit', 'delete'],
                    'course_registrations' => ['view', 'create', 'edit', 'delete', 'approve'],
                    'study_plans' => ['view', 'create', 'edit', 'delete'],
                    'schedules' => ['view', 'create', 'edit', 'delete'],
                    'grades' => ['view', 'create', 'edit', 'delete', 'approve', 'export'],
                    'tuition_fees' => ['view', 'create', 'edit', 'delete', 'approve'],
                    'reports' => ['view', 'export'],
                    'settings' => ['view', 'edit'],
                ],
                'is_active' => true,
                'is_system' => true,
            ],
            [
                'name' => 'manager',
                'display_name' => 'Quản lý',
                'description' => 'Quyền quản lý đào tạo',
                'permissions' => [
                    'dashboard' => ['view'],
                    'students' => ['view', 'edit', 'export'],
                    'classrooms' => ['view', 'create', 'edit'],
                    'class_assignments' => ['view', 'create', 'edit'],
                    'courses' => ['view', 'edit'],
                    'teachers' => ['view'],
                    'teaching_assignments' => ['view', 'create', 'edit'],
                    'schedules' => ['view', 'create', 'edit'],
                    'grades' => ['view', 'export'],
                    'reports' => ['view', 'export'],
                ],
                'is_active' => true,
                'is_system' => false,
            ],
            [
                'name' => 'accountant',
                'display_name' => 'Kế toán',
                'description' => 'Quyền quản lý tài chính',
                'permissions' => [
                    'dashboard' => ['view'],
                    'students' => ['view'],
                    'teacher_salaries' => ['view', 'create', 'edit'],
                    'tuition_fees' => ['view', 'create', 'edit', 'approve'],
                    'reports' => ['view', 'export'],
                ],
                'is_active' => true,
                'is_system' => false,
            ],
            [
                'name' => 'teacher',
                'display_name' => 'Giảng viên',
                'description' => 'Quyền giảng viên',
                'permissions' => [
                    'dashboard' => ['view'],
                    'students' => ['view'],
                    'schedules' => ['view'],
                    'grades' => ['view', 'create', 'edit'],
                ],
                'is_active' => true,
                'is_system' => false,
            ],
            [
                'name' => 'student',
                'display_name' => 'Học viên',
                'description' => 'Quyền học viên cơ bản',
                'permissions' => [
                    'dashboard' => ['view'],
                    'students' => ['view'],
                    'classrooms' => ['view'],
                    'schedules' => ['view', 'create', 'edit', 'delete'],
                ],
                'is_active' => true,
                'is_system' => false,
            ],
            [
                'name' => 'homeroom_teacher',
                'display_name' => 'Giáo viên chủ nhiệm',
                'description' => 'Quyền của giáo viên chủ nhiệm',
                'permissions' => [
                    'dashboard' => ['view'],
                    'students' => ['view', 'edit'],
                    'classrooms' => ['view', 'edit'],
                    'schedules' => ['view'],
                    'grades' => ['view', 'create', 'edit'],
                ],
                'is_active' => true,
                'is_system' => false,
            ],
        ];

        foreach ($roles as $roleData) {
            $role = Role::updateOrCreate(
                ['name' => $roleData['name']], // Find by name
                $roleData // Update or create with this data
            );

            $action = $role->wasRecentlyCreated ? 'Created' : 'Updated';
            $this->command->info("✅ {$action} role: {$roleData['display_name']}");
        }

        $this->command->info("✅ Total roles: " . Role::count());
    }
}
