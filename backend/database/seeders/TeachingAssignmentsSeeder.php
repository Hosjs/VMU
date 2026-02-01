<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TeachingAssignmentsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Seed teaching assignments data
     */
    public function run(): void
    {
        // Check if already seeded
        $existingCount = DB::table('teaching_assignments')->count();
        if ($existingCount > 0) {
            $this->command->info("⚠️  Teaching assignments already exist ({$existingCount} records). Skipping...");
            return;
        }

        $this->command->info("📚 Creating demo teaching assignments for calendar testing...");

        // Get valid IDs from database
        $lecturers = DB::table('lecturers')->select('id')->get();
        $classes = DB::table('classes')->select('id')->get();

        if ($lecturers->isEmpty() || $classes->isEmpty()) {
            $this->command->error("❌ Missing required data! Please seed lecturers and classes first.");
            return;
        }

        // Sample courses for demo
        $courses = [
            ['code' => 'CNTT1', 'name' => 'Lập trình căn bản', 'credits' => 3],
            ['code' => 'CNTT2', 'name' => 'Cơ sở dữ liệu', 'credits' => 3],
            ['code' => 'CNTT3', 'name' => 'Lập trình Web', 'credits' => 4],
            ['code' => 'TOAN1', 'name' => 'Toán cao cấp 1', 'credits' => 3],
            ['code' => 'TOAN2', 'name' => 'Toán rời rạc', 'credits' => 3],
            ['code' => 'ANH1', 'name' => 'Tiếng Anh 1', 'credits' => 2],
            ['code' => 'ANH2', 'name' => 'Tiếng Anh 2', 'credits' => 2],
            ['code' => 'VL1', 'name' => 'Vật lý đại cương', 'credits' => 3],
            ['code' => 'GDTC1', 'name' => 'Giáo dục thể chất 1', 'credits' => 1],
            ['code' => 'KTCT', 'name' => 'Kinh tế chính trị', 'credits' => 2],
        ];

        // Valid enum values after migration 2026_01_26_000001
        $daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        $statuses = ['in_progress', 'in_exam', 'paid']; // Only valid enum values

        $assignments = [];
        $now = Carbon::now();

        // Create 10-15 teaching assignments spread across Jan-Mar 2026
        for ($i = 0; $i < min(15, count($courses)); $i++) {
            $course = $courses[$i % count($courses)];

            // Random selections
            $lecturer = $lecturers->random();
            $class = $classes->random();

            // Spread across different months (Jan, Feb, Mar 2026)
            $monthOffset = $i % 3;
            $startDay = rand(1, 10);
            $startDate = Carbon::create(2026, 1 + $monthOffset, $startDay);
            $endDate = $startDate->copy()->addWeeks(rand(6, 10));

            // Determine status based on dates
            $status = 'in_progress'; // Default status
            if ($endDate < $now) {
                // Past courses: either in_exam or paid
                $status = ($i % 2 === 0) ? 'in_exam' : 'paid';
            }

            // Random time slots
            $startHour = rand(7, 14);
            $duration = rand(2, 4);

            $assignments[] = [
                'lecturer_id' => $lecturer->id,
                'class_id' => $class->id,
                'lop_id' => null, // Old field, not used
                'course_code' => $course['code'],
                'course_name' => $course['name'],
                'credits' => $course['credits'],
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
                'day_of_week' => $daysOfWeek[array_rand($daysOfWeek)],
                'start_time' => sprintf('%02d:00:00', $startHour),
                'end_time' => sprintf('%02d:00:00', $startHour + $duration),
                'room' => 'P' . rand(101, 305),
                'class_name' => 'Lớp ' . $course['code'],
                'student_count' => rand(15, 45),
                'status' => $status,
                'notes' => "Demo assignment for calendar testing",
                'created_at' => $now,
                'updated_at' => $now,
                'deleted_at' => null,
            ];

            $this->command->info("✅ Prepared: {$course['name']} - {$startDate->format('M Y')} ({$status})");
        }

        // Insert all assignments
        if (!empty($assignments)) {
            $chunks = array_chunk($assignments, 50);
            $total = 0;

            foreach ($chunks as $chunk) {
                try {
                    DB::table('teaching_assignments')->insert($chunk);
                    $total += count($chunk);
                } catch (\Exception $e) {
                    $this->command->error("❌ Error inserting chunk: " . $e->getMessage());
                }
            }

            $this->command->info("✅ Successfully inserted {$total} teaching assignments");
            $this->command->info("ℹ️  Next step: Run 'php artisan sessions:generate' to create teaching sessions");
        } else {
            $this->command->error("❌ No valid teaching assignments to insert!");
        }
    }
}

