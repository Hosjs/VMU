<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Lecturer;

class UpdateLecturerUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Update user ID 14 (Giảng viên test) to have lecturer_id = 351
        $user = User::find(14);
        if ($user) {
            $user->lecturer_id = 351;
            $user->save();
            $this->command->info("✅ Updated user ID 14: {$user->name} with lecturer_id = 351");
        }

        // Optionally: Auto-match other users with lecturers by name
        $this->command->info("\n📋 Matching users with lecturers by name...");

        $users = User::whereNull('lecturer_id')->get();
        foreach ($users as $user) {
            $lecturer = Lecturer::where('hoTen', $user->name)->first();
            if ($lecturer) {
                $user->lecturer_id = $lecturer->id;
                $user->save();
                $this->command->info("✅ Matched user '{$user->name}' with lecturer ID {$lecturer->id}");
            }
        }

        $this->command->info("\n✅ Lecturer-User matching completed!");
    }
}

