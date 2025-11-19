<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ImportSubjectStudentsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Import students into subject_students table based on their major and subjects
     */
    public function run(): void
    {
        echo "🔄 Starting to import students into subject_students table...\n";

        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Truncate existing data
        DB::table('subject_students')->truncate();
        echo "✅ Cleared existing subject_students data\n";

        // Get all students
        $students = DB::table('students')
            ->whereNull('deleted_at')
            ->select('maHV', 'maNganh')
            ->get();

        if ($students->isEmpty()) {
            echo "⚠️ No students found\n";
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
            return;
        }

        echo "📊 Found {$students->count()} students to process\n";

        $imported = 0;
        $skipped = 0;
        $errors = 0;

        foreach ($students as $student) {
            if (!$student->maNganh) {
                $skipped++;
                continue;
            }

            // Find major
            $major = DB::table('majors')
                ->where('maNganh', $student->maNganh)
                ->first();

            if (!$major) {
                echo "⚠️ Major not found for student {$student->maHV} (maNganh: {$student->maNganh})\n";
                $skipped++;
                continue;
            }

            // Get all subjects for this major
            $subjectIds = DB::table('major_subjects')
                ->where('major_id', $major->id)
                ->pluck('subject_id');

            if ($subjectIds->isEmpty()) {
                // echo "⚠️ No subjects found for major {$major->maNganh}\n";
                $skipped++;
                continue;
            }

            // Enroll student in all subjects of their major
            foreach ($subjectIds as $subjectId) {
                try {
                    // Check if already exists
                    $exists = DB::table('subject_students')
                        ->where('student_id', $student->maHV)
                        ->where('subject_id', $subjectId)
                        ->exists();

                    if (!$exists) {
                        DB::table('subject_students')->insert([
                            'student_id' => $student->maHV,
                            'subject_id' => $subjectId,
                            'x' => null,
                            'y' => null,
                            'z' => null,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                        $imported++;

                        if ($imported % 500 == 0) {
                            echo "   ✓ Imported {$imported} enrollments...\n";
                        }
                    }
                } catch (\Exception $e) {
                    echo "❌ Error enrolling student {$student->maHV} in subject {$subjectId}: {$e->getMessage()}\n";
                    $errors++;
                }
            }
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        echo "\n✅ Import completed!\n";
        echo "   ➕ Imported: {$imported} enrollments\n";
        echo "   ⏭️  Skipped: {$skipped} students (no major or no subjects)\n";
        if ($errors > 0) {
            echo "   ❌ Errors: {$errors}\n";
        }
    }
}

