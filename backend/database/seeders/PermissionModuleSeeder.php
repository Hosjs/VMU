<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PermissionModule;
use App\Models\PermissionAction;

class PermissionModuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Xóa dữ liệu cũ
        PermissionAction::truncate();
        PermissionModule::truncate();

        // Định nghĩa các modules và actions
        $modules = [
            [
                'name' => 'dashboard',
                'display_name' => 'Tổng quan',
                'description' => 'Xem dashboard và thống kê tổng quan',
                'icon' => 'HomeIcon',
                'sort_order' => 1,
                'actions' => [
                    ['action' => 'view', 'display_name' => 'Xem'],
                    ['action' => 'export', 'display_name' => 'Xuất dữ liệu'],
                ],
            ],
            [
                'name' => 'users',
                'display_name' => 'Người dùng',
                'description' => 'Quản lý người dùng hệ thống',
                'icon' => 'UsersIcon',
                'sort_order' => 2,
                'actions' => [
                    ['action' => 'view', 'display_name' => 'Xem'],
                    ['action' => 'create', 'display_name' => 'Tạo mới'],
                    ['action' => 'edit', 'display_name' => 'Sửa'],
                    ['action' => 'delete', 'display_name' => 'Xóa'],
                ],
            ],
            [
                'name' => 'roles',
                'display_name' => 'Vai trò & Quyền',
                'description' => 'Quản lý vai trò và phân quyền',
                'icon' => 'ShieldCheckIcon',
                'sort_order' => 3,
                'actions' => [
                    ['action' => 'view', 'display_name' => 'Xem'],
                    ['action' => 'create', 'display_name' => 'Tạo mới'],
                    ['action' => 'edit', 'display_name' => 'Sửa'],
                    ['action' => 'delete', 'display_name' => 'Xóa'],
                ],
            ],
            [
                'name' => 'students',
                'display_name' => 'Học viên',
                'description' => 'Quản lý học viên',
                'icon' => 'UserGroupIcon',
                'sort_order' => 10,
                'actions' => [
                    ['action' => 'view', 'display_name' => 'Xem'],
                    ['action' => 'create', 'display_name' => 'Tạo mới'],
                    ['action' => 'edit', 'display_name' => 'Sửa'],
                    ['action' => 'delete', 'display_name' => 'Xóa'],
                    ['action' => 'import', 'display_name' => 'Import'],
                    ['action' => 'export', 'display_name' => 'Export'],
                ],
            ],
            [
                'name' => 'classrooms',
                'display_name' => 'Phòng học',
                'description' => 'Quản lý phòng học',
                'icon' => 'BuildingLibraryIcon',
                'sort_order' => 11,
                'actions' => [
                    ['action' => 'view', 'display_name' => 'Xem'],
                    ['action' => 'create', 'display_name' => 'Tạo mới'],
                    ['action' => 'edit', 'display_name' => 'Sửa'],
                    ['action' => 'delete', 'display_name' => 'Xóa'],
                ],
            ],
            [
                'name' => 'class_assignments',
                'display_name' => 'Phân lớp',
                'description' => 'Phân lớp học viên',
                'icon' => 'ClipboardDocumentCheckIcon',
                'sort_order' => 12,
                'actions' => [
                    ['action' => 'view', 'display_name' => 'Xem'],
                    ['action' => 'create', 'display_name' => 'Phân lớp'],
                    ['action' => 'edit', 'display_name' => 'Sửa'],
                    ['action' => 'delete', 'display_name' => 'Xóa'],
                ],
            ],
            [
                'name' => 'majors',
                'display_name' => 'Ngành học',
                'description' => 'Quản lý ngành học',
                'icon' => 'BuildingLibraryIcon',
                'sort_order' => 20,
                'actions' => [
                    ['action' => 'view', 'display_name' => 'Xem'],
                    ['action' => 'create', 'display_name' => 'Tạo mới'],
                    ['action' => 'edit', 'display_name' => 'Sửa'],
                    ['action' => 'delete', 'display_name' => 'Xóa'],
                ],
            ],
            [
                'name' => 'education_levels',
                'display_name' => 'Trình độ đào tạo',
                'description' => 'Quản lý trình độ đào tạo',
                'icon' => 'AcademicCapIcon',
                'sort_order' => 21,
                'actions' => [
                    ['action' => 'view', 'display_name' => 'Xem'],
                    ['action' => 'create', 'display_name' => 'Tạo mới'],
                    ['action' => 'edit', 'display_name' => 'Sửa'],
                    ['action' => 'delete', 'display_name' => 'Xóa'],
                ],
            ],
            [
                'name' => 'courses',
                'display_name' => 'Học phần',
                'description' => 'Quản lý học phần',
                'icon' => 'BookOpenIcon',
                'sort_order' => 22,
                'actions' => [
                    ['action' => 'view', 'display_name' => 'Xem'],
                    ['action' => 'create', 'display_name' => 'Tạo mới'],
                    ['action' => 'edit', 'display_name' => 'Sửa'],
                    ['action' => 'delete', 'display_name' => 'Xóa'],
                ],
            ],
            [
                'name' => 'teachers',
                'display_name' => 'Giảng viên',
                'description' => 'Quản lý giảng viên',
                'icon' => 'AcademicCapIcon',
                'sort_order' => 30,
                'actions' => [
                    ['action' => 'view', 'display_name' => 'Xem'],
                    ['action' => 'create', 'display_name' => 'Tạo mới'],
                    ['action' => 'edit', 'display_name' => 'Sửa'],
                    ['action' => 'delete', 'display_name' => 'Xóa'],
                ],
            ],
            [
                'name' => 'teaching_assignments',
                'display_name' => 'Phân công giảng dạy',
                'description' => 'Phân công giảng viên giảng dạy',
                'icon' => 'ClipboardDocumentListIcon',
                'sort_order' => 31,
                'actions' => [
                    ['action' => 'view', 'display_name' => 'Xem'],
                    ['action' => 'create', 'display_name' => 'Tạo mới'],
                    ['action' => 'edit', 'display_name' => 'Sửa'],
                    ['action' => 'delete', 'display_name' => 'Xóa'],
                ],
            ],
            [
                'name' => 'teacher_salaries',
                'display_name' => 'Lương giảng viên',
                'description' => 'Quản lý lương giảng viên',
                'icon' => 'BanknotesIcon',
                'sort_order' => 32,
                'actions' => [
                    ['action' => 'view', 'display_name' => 'Xem'],
                    ['action' => 'create', 'display_name' => 'Tạo mới'],
                    ['action' => 'edit', 'display_name' => 'Sửa'],
                    ['action' => 'delete', 'display_name' => 'Xóa'],
                    ['action' => 'approve', 'display_name' => 'Duyệt'],
                ],
            ],
            [
                'name' => 'semesters',
                'display_name' => 'Học kỳ',
                'description' => 'Quản lý học kỳ',
                'icon' => 'CalendarDaysIcon',
                'sort_order' => 40,
                'actions' => [
                    ['action' => 'view', 'display_name' => 'Xem'],
                    ['action' => 'create', 'display_name' => 'Tạo mới'],
                    ['action' => 'edit', 'display_name' => 'Sửa'],
                    ['action' => 'delete', 'display_name' => 'Xóa'],
                ],
            ],
            [
                'name' => 'registration_packages',
                'display_name' => 'Gói đăng ký',
                'description' => 'Quản lý gói đăng ký học phần',
                'icon' => 'DocumentTextIcon',
                'sort_order' => 41,
                'actions' => [
                    ['action' => 'view', 'display_name' => 'Xem'],
                    ['action' => 'create', 'display_name' => 'Tạo mới'],
                    ['action' => 'edit', 'display_name' => 'Sửa'],
                    ['action' => 'delete', 'display_name' => 'Xóa'],
                ],
            ],
            [
                'name' => 'course_registrations',
                'display_name' => 'Đăng ký học phần',
                'description' => 'Quản lý đăng ký học phần',
                'icon' => 'ClipboardDocumentCheckIcon',
                'sort_order' => 42,
                'actions' => [
                    ['action' => 'view', 'display_name' => 'Xem'],
                    ['action' => 'create', 'display_name' => 'Tạo mới'],
                    ['action' => 'edit', 'display_name' => 'Sửa'],
                    ['action' => 'delete', 'display_name' => 'Xóa'],
                    ['action' => 'approve', 'display_name' => 'Duyệt'],
                ],
            ],
            [
                'name' => 'study_plans',
                'display_name' => 'Kế hoạch học tập',
                'description' => 'Quản lý kế hoạch học tập',
                'icon' => 'ClipboardDocumentListIcon',
                'sort_order' => 43,
                'actions' => [
                    ['action' => 'view', 'display_name' => 'Xem'],
                    ['action' => 'create', 'display_name' => 'Tạo mới'],
                    ['action' => 'edit', 'display_name' => 'Sửa'],
                    ['action' => 'delete', 'display_name' => 'Xóa'],
                ],
            ],
            [
                'name' => 'schedules',
                'display_name' => 'Thời khóa biểu',
                'description' => 'Quản lý thời khóa biểu',
                'icon' => 'CalendarDaysIcon',
                'sort_order' => 44,
                'actions' => [
                    ['action' => 'view', 'display_name' => 'Xem'],
                    ['action' => 'create', 'display_name' => 'Tạo mới'],
                    ['action' => 'edit', 'display_name' => 'Sửa'],
                    ['action' => 'delete', 'display_name' => 'Xóa'],
                ],
            ],
            [
                'name' => 'grades',
                'display_name' => 'Điểm học tập',
                'description' => 'Quản lý điểm học tập',
                'icon' => 'PresentationChartBarIcon',
                'sort_order' => 50,
                'actions' => [
                    ['action' => 'view', 'display_name' => 'Xem'],
                    ['action' => 'create', 'display_name' => 'Nhập điểm'],
                    ['action' => 'edit', 'display_name' => 'Sửa điểm'],
                    ['action' => 'delete', 'display_name' => 'Xóa'],
                    ['action' => 'approve', 'display_name' => 'Duyệt điểm'],
                    ['action' => 'export', 'display_name' => 'Xuất báo cáo'],
                ],
            ],
            [
                'name' => 'tuition_fees',
                'display_name' => 'Học phí',
                'description' => 'Quản lý học phí',
                'icon' => 'CurrencyDollarIcon',
                'sort_order' => 51,
                'actions' => [
                    ['action' => 'view', 'display_name' => 'Xem'],
                    ['action' => 'create', 'display_name' => 'Tạo mới'],
                    ['action' => 'edit', 'display_name' => 'Sửa'],
                    ['action' => 'delete', 'display_name' => 'Xóa'],
                    ['action' => 'approve', 'display_name' => 'Duyệt'],
                ],
            ],
            [
                'name' => 'reports',
                'display_name' => 'Báo cáo',
                'description' => 'Xem và xuất báo cáo',
                'icon' => 'ChartBarIcon',
                'sort_order' => 60,
                'actions' => [
                    ['action' => 'view', 'display_name' => 'Xem'],
                    ['action' => 'export', 'display_name' => 'Xuất báo cáo'],
                ],
            ],
            [
                'name' => 'settings',
                'display_name' => 'Cài đặt',
                'description' => 'Cài đặt hệ thống',
                'icon' => 'Cog6ToothIcon',
                'sort_order' => 70,
                'actions' => [
                    ['action' => 'view', 'display_name' => 'Xem'],
                    ['action' => 'edit', 'display_name' => 'Sửa'],
                ],
            ],
        ];

        // Tạo modules và actions
        foreach ($modules as $moduleData) {
            $actions = $moduleData['actions'];
            unset($moduleData['actions']);

            $module = PermissionModule::create($moduleData);

            // Tạo actions cho module
            foreach ($actions as $index => $actionData) {
                PermissionAction::create([
                    'module_id' => $module->id,
                    'action' => $actionData['action'],
                    'display_name' => $actionData['display_name'],
                    'description' => $actionData['description'] ?? null,
                    'sort_order' => $index + 1,
                    'is_active' => true,
                ]);
            }
        }

        $this->command->info('Permission modules and actions seeded successfully!');
    }
}

