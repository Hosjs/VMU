<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ImportClassStudentsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Import existing students into class_students table based on their idLop
     */
    public function run(): void
    {
        echo "🔄 Starting to import students into class_students table...\n";

        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Truncate existing data
        DB::table('class_students')->truncate();
        echo "✅ Cleared existing class_students data\n";

        // Get all students with their class (idLop)
        $students = DB::table('students')
            ->whereNotNull('idLop')
            ->whereNull('deleted_at')
            ->select('maHV', 'idLop')
            ->get();

        if ($students->isEmpty()) {
            echo "⚠️ No students found with idLop\n";
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
            return;
        }

        echo "📊 Found {$students->count()} students to import\n";

        $imported = 0;
        $skipped = 0;

        foreach ($students as $student) {
            // Verify class exists
            $classExists = DB::table('classes')->where('id', $student->idLop)->exists();

            if (!$classExists) {
                echo "⚠️ Skipping student {$student->maHV} - class {$student->idLop} not found\n";
                $skipped++;
                continue;
            }

            // Check if already exists
            $exists = DB::table('class_students')
                ->where('class_id', $student->idLop)
                ->where('student_id', $student->maHV)
                ->exists();

            if (!$exists) {
                DB::table('class_students')->insert([
                    'class_id' => $student->idLop,
                    'student_id' => $student->maHV,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $imported++;

                if ($imported % 100 == 0) {
                    echo "   ✓ Imported {$imported} students...\n";
                }
            }
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        echo "\n✅ Import completed!\n";
        echo "   ➕ Imported: {$imported} students\n";
        echo "   ⏭️  Skipped: {$skipped} students\n";
    }
}

