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
        // 3. TRAINING DATA (Categories)
        // =====================
        $this->command->info('📚 Creating Training Categories...');
        $this->call([
            TrinhDoDaoTaoSeeder::class,
            // NganhHocSeeder::class, // Removed: now using MajorsSeeder instead
        ]);
        $this->command->newLine();

        // =====================
        // 4. ACADEMIC STRUCTURE
        // =====================
        $this->command->info('🏫 Creating Academic Structure...');
        $this->call([
            KhoaHocSeeder::class,      // Khóa học/học kỳ
            MajorsSeeder::class,        // 58 majors with parent_id
        ]);
        $this->command->newLine();

        // =====================
        // 5. SUBJECTS
        // =====================
        $this->command->info('📖 Creating Subjects...');
        $this->call([
            SubjectsSeeder::class,      // Môn học
            MajorSubjectsSeeder::class, // Quan hệ major-subject
        ]);
        $this->command->newLine();

        // =====================
        // 6. CLASSES
        // =====================
        $this->command->info('🎒 Creating Classes...');
        $this->call([
            ClassesSeeder::class,       // 150+ classes
        ]);
        $this->command->newLine();

        // =====================
        // 7. LECTURERS
        // =====================
        $this->command->info('👨‍🏫 Creating Lecturers...');
        $this->call([
            LecturersSeeder::class,     // 349 lecturers
        ]);
        $this->command->newLine();

        // =====================
        // 8. STUDENTS
        // =====================
        $this->command->info('🎓 Creating Students...');
        $this->call([
            StudentsSeeder::class,      // 500+ students
        ]);
        $this->command->newLine();

        // =====================
        // 9. STUDENT PERMISSIONS
        // =====================
        $this->command->info('📋 Creating Student Permissions...');
        $this->call([
            StudentPermissionSeeder::class,
        ]);
        $this->command->newLine();

        // =====================
        // 10. CLASS-STUDENT RELATIONS
        // =====================
        $this->command->info('👥 Creating Class-Student Relations...');
        $this->call([
            ClassStudentsSeeder::class, // Assign students to classes
        ]);
        $this->command->newLine();

        // =====================
        // 11. SUBJECT ENROLLMENTS
        // =====================
        $this->command->info('📝 Creating Subject Enrollments...');
        $this->call([
            SubjectEnrollmentsSeeder::class, // Student subject enrollments
        ]);
        $this->command->newLine();

        // =====================
        // 12. TEACHING ASSIGNMENTS
        // =====================
        $this->command->info('📅 Creating Teaching Assignments...');
        $this->call([
            TeachingAssignmentsSeeder::class, // Lecturer teaching assignments
        ]);
        $this->command->newLine();

        // =====================
        // 13. ADMIN USER
        // =====================
        $this->command->info('👥 Creating Admin User...');

        $roles = Role::all()->keyBy('name');

        // Admin User - use firstOrCreate to avoid duplicates
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'System Administrator',
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
            ]
        );

        // Log into user_roles for audit trail
        UserRole::firstOrCreate(
            [
                'user_id' => $admin->id,
                'role_id' => $roles['admin']->id,
            ],
            [
                'assigned_by' => null, // System assigned
                'is_active' => true,
            ]
        );

        $action = $admin->wasRecentlyCreated ? 'created' : 'already exists';
        $this->command->info("✅ Admin user {$action}");
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
