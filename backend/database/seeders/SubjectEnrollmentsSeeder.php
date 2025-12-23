<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SubjectEnrollmentsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * NOTE: Subject enrollments are typically created when students register for courses
     * This seeder provides sample data only
     */
    public function run(): void
    {
        $data = $this->getSampleEnrollments();

        if (empty($data)) {
            $this->command->warn("⚠️  No sample enrollments. Students will register via application.");
            return;
        }

        $this->command->info("💾 Inserting " . count($data) . " enrollments...");

        $chunks = array_chunk($data, 100);
        $total = 0;

        foreach ($chunks as $chunk) {
            DB::table('subject_enrollments')->insert($chunk);
            $total += count($chunk);
        }

        $this->command->info("✅ Successfully inserted {$total} subject enrollments");
    }

    private function getSampleEnrollments(): array
    {
        $timestamp = now();

        // Sample enrollments - format: [maHV, subject_id, major_id, namHoc, hocKy, trangThai]
        $enrollments = [
            // Add sample enrollments here or leave empty
            // ['CN2421001', 4, 4, 2025, '1', 'DangHoc'],
        ];

        $result = [];
        foreach ($enrollments as $index => $enroll) {
            $result[] = [
                'id' => $index + 1,
                'maHV' => $enroll[0],
                'subject_id' => $enroll[1],
                'major_id' => $enroll[2],
                'namHoc' => $enroll[3],
                'hocKy' => $enroll[4],
                'trangThai' => $enroll[5],
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
                'deleted_at' => null,
            ];
        }

        return $result;
    }
}


