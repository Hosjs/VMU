<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TeachingAssignmentsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Seed teaching assignments data
     */
    public function run(): void
    {
        $data = $this->getTeachingAssignmentsData();

        if (empty($data)) {
            $this->command->warn("⚠️  No teaching assignment data available");
            return;
        }

        $this->command->info("💾 Inserting " . count($data) . " teaching assignments...");

        // Insert in chunks
        $chunks = array_chunk($data, 50);
        $total = 0;

        foreach ($chunks as $chunk) {
            DB::table('teaching_assignments')->insert($chunk);
            $total += count($chunk);
            $this->command->info("✅ Inserted {$total} / " . count($data) . " assignments");
        }

        $this->command->info("✅ Successfully inserted {$total} teaching assignments");
    }

    private function getTeachingAssignmentsData(): array
    {
        // Sample teaching assignments
        // In production, you can add more records or import from external source
        return [
            [
                'id' => 4,
                'lecturer_id' => 256,
                'lop_id' => 34,
                'class_id' => 34,
                'course_code' => '513 ITKB',
                'course_name' => 'Hệ cơ sở tri thức nâng cao',
                'credits' => 2,
                'start_date' => '2025-11-15',
                'end_date' => '2026-01-18',
                'day_of_week' => 'saturday',
                'start_time' => '08:00:00',
                'end_time' => '12:00:00',
                'room' => 'A101',
                'class_name' => null,
                'student_count' => 20,
                'status' => 'scheduled',
                'notes' => null,
                'created_at' => '2025-11-10 18:47:48',
                'updated_at' => '2025-11-10 18:47:48',
                'deleted_at' => null,
            ],
            [
                'id' => 5,
                'lecturer_id' => 256,
                'lop_id' => 34,
                'class_id' => 34,
                'course_code' => '513 ITKB',
                'course_name' => 'Hệ cơ sở tri thức nâng cao',
                'credits' => 2,
                'start_date' => '2025-11-15',
                'end_date' => '2026-01-18',
                'day_of_week' => 'sunday',
                'start_time' => '08:00:00',
                'end_time' => '12:00:00',
                'room' => 'A101',
                'class_name' => null,
                'student_count' => 20,
                'status' => 'scheduled',
                'notes' => null,
                'created_at' => '2025-11-10 18:47:48',
                'updated_at' => '2025-11-11 18:39:36',
                'deleted_at' => null,
            ],
            [
                'id' => 6,
                'lecturer_id' => 12,
                'lop_id' => null,
                'class_id' => null,
                'course_code' => '502 HPTA',
                'course_name' => 'Tiếng Anh',
                'credits' => 3,
                'start_date' => '2025-11-15',
                'end_date' => '2026-02-22',
                'day_of_week' => 'saturday',
                'start_time' => '08:00:00',
                'end_time' => '17:00:00',
                'room' => 'A101',
                'class_name' => 'âcsc',
                'student_count' => 13,
                'status' => 'scheduled',
                'notes' => null,
                'created_at' => '2025-11-10 19:50:19',
                'updated_at' => '2025-11-11 18:39:36',
                'deleted_at' => null,
            ],
            [
                'id' => 7,
                'lecturer_id' => 21,
                'lop_id' => null,
                'class_id' => null,
                'course_code' => '508 TTCF',
                'course_name' => 'Lý thuyết và ứng dụng CFD trong lĩnh vực đóng tàu',
                'credits' => 2,
                'start_date' => '2025-11-15',
                'end_date' => '2025-11-16',
                'day_of_week' => 'saturday',
                'start_time' => '08:00:00',
                'end_time' => '17:00:00',
                'room' => 'ádasd',
                'class_name' => 'HS123',
                'student_count' => 3,
                'status' => 'scheduled',
                'notes' => null,
                'created_at' => '2025-11-11 18:57:00',
                'updated_at' => '2025-11-11 18:57:00',
                'deleted_at' => null,
            ],
            [
                'id' => 13,
                'lecturer_id' => 351,
                'lop_id' => null,
                'class_id' => null,
                'course_code' => '529 ITHC',
                'course_name' => 'Tương tác người- máy nâng cao',
                'credits' => 2,
                'start_date' => '2025-12-04',
                'end_date' => '2026-01-11',
                'day_of_week' => 'saturday',
                'start_time' => '08:00:00',
                'end_time' => '12:00:00',
                'room' => 'A101',
                'class_name' => 'TTNM01',
                'student_count' => 0,
                'status' => 'scheduled',
                'notes' => null,
                'created_at' => '2025-12-08 19:08:25',
                'updated_at' => '2025-12-08 19:08:25',
                'deleted_at' => null,
            ],
            // Add more teaching assignments as needed
        ];
    }
}

