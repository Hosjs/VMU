<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if already seeded
        $existingCount = DB::table('users')->count();

        if ($existingCount > 0) {
            $this->command->info("⚠️  Users already exist ({$existingCount} records). Skipping...");
            return;
        }

        $now = now();
        $password = Hash::make('password'); // Default password for all users

        $users = [
            [
                'id' => 1,
                'name' => 'System Administrator',
                'email' => 'admin@example.com',
                'phone' => '0900000000',
                'avatar' => null,
                'birth_date' => null,
                'gender' => null,
                'address' => null,
                'employee_code' => 'ADMIN-001',
                'position' => 'System Administrator',
                'department' => 'Management',
                'hire_date' => '2025-11-01',
                'salary' => 30000000.00,
                'role_id' => 1,
                'lecturer_id' => null,
                'custom_permissions' => null,
                'is_active' => 1,
                'notes' => null,
                'email_verified_at' => '2025-10-31 18:54:09',
                'password' => $password,
                'remember_token' => null,
                'created_at' => '2025-10-31 18:54:09',
                'updated_at' => '2025-10-31 18:54:09',
                'deleted_at' => null,
            ],
            [
                'id' => 2,
                'name' => 'Giáo Vụ',
                'email' => 'giaovu@example.com',
                'phone' => null,
                'avatar' => null,
                'birth_date' => '2025-10-01',
                'gender' => 'male',
                'address' => null,
                'employee_code' => null,
                'position' => null,
                'department' => null,
                'hire_date' => null,
                'salary' => null,
                'role_id' => 2,
                'lecturer_id' => null,
                'custom_permissions' => null,
                'is_active' => 1,
                'notes' => null,
                'email_verified_at' => null,
                'password' => $password,
                'remember_token' => null,
                'created_at' => $now,
                'updated_at' => $now,
                'deleted_at' => null,
            ],
            [
                'id' => 3,
                'name' => 'Lã Xuân Anh',
                'email' => 'anhlx@vimaru.edu.vn',
                'phone' => null,
                'avatar' => null,
                'birth_date' => '2025-11-19',
                'gender' => 'male',
                'address' => null,
                'employee_code' => null,
                'position' => null,
                'department' => null,
                'hire_date' => null,
                'salary' => null,
                'role_id' => 5,
                'lecturer_id' => null,
                'custom_permissions' => null,
                'is_active' => 1,
                'notes' => null,
                'email_verified_at' => null,
                'password' => $password,
                'remember_token' => null,
                'created_at' => $now,
                'updated_at' => $now,
                'deleted_at' => null,
            ],
            [
                'id' => 14,
                'name' => 'Giảng viên test',
                'email' => 'teacher@gmail.com',
                'phone' => '0913456788',
                'avatar' => null,
                'birth_date' => '1995-12-22',
                'gender' => 'male',
                'address' => '123',
                'employee_code' => 'TC001',
                'position' => 'Giảng viên test',
                'department' => 'Khoa CNTT',
                'hire_date' => '2025-12-01',
                'salary' => null,
                'role_id' => 5,
                'lecturer_id' => 351,
                'custom_permissions' => null,
                'is_active' => 1,
                'notes' => null,
                'email_verified_at' => '2025-12-09 01:30:03',
                'password' => $password,
                'remember_token' => null,
                'created_at' => '2025-12-09 01:30:03',
                'updated_at' => '2025-12-08 20:15:05',
                'deleted_at' => null,
            ],
            [
                'id' => 15,
                'name' => 'teacher2',
                'email' => 'teacher2@example.com',
                'phone' => '0988123456',
                'avatar' => null,
                'birth_date' => '2015-12-01',
                'gender' => 'female',
                'address' => 'qưe',
                'employee_code' => 'TC2001',
                'position' => 'Giáo viên',
                'department' => 'vavkn',
                'hire_date' => '2025-12-01',
                'salary' => 100000000.00,
                'role_id' => 4,
                'lecturer_id' => null,
                'custom_permissions' => null,
                'is_active' => 1,
                'notes' => null,
                'email_verified_at' => '2025-12-08 01:30:03',
                'password' => $password,
                'remember_token' => null,
                'created_at' => $now,
                'updated_at' => $now,
                'deleted_at' => null,
            ],
        ];

        // Validate lecturer_id exists before inserting
        $validLecturerIds = DB::table('lecturers')->pluck('id')->toArray();
        $validLecturerIdsSet = array_flip($validLecturerIds);

        $validUsers = [];
        $invalidLecturerCount = 0;

        foreach ($users as $user) {
            $lecturerId = $user['lecturer_id'];

            // Check if lecturer_id exists (if not null)
            if ($lecturerId !== null && !isset($validLecturerIdsSet[$lecturerId])) {
                $this->command->warn("⚠️  User '{$user['name']}' - lecturer_id {$lecturerId} not found, setting to null");
                // Set lecturer_id to null instead of skipping the user
                $user['lecturer_id'] = null;
                $invalidLecturerCount++;
            }

            $validUsers[] = $user;
        }

        if (empty($validUsers)) {
            $this->command->error("❌ No valid users to insert!");
            return;
        }

        DB::table('users')->insert($validUsers);

        $this->command->info("✅ Created " . count($validUsers) . " user records");
        if ($invalidLecturerCount > 0) {
            $this->command->warn("⚠️  {$invalidLecturerCount} user(s) had invalid lecturer_id (set to null)");
        }

        // Display login credentials
        $this->command->newLine();
        $this->command->info("🔑 Default Login Credentials:");
        $this->command->info("─────────────────────────────────────");
        $this->command->info("Email: admin@example.com");
        $this->command->info("Password: password");
        $this->command->info("─────────────────────────────────────");
        $this->command->info("All users have the same password: password");
        $this->command->newLine();
    }
}

