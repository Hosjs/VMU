<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== Testing Teaching Assignments ===\n\n";

try {
    // Test database connection
    $dbName = env('DB_DATABASE');
    echo "Database: {$dbName}\n";

    // Check if table exists
    $tables = DB::select("SHOW TABLES LIKE 'teaching_assignments'");
    echo "Table exists: " . (count($tables) > 0 ? "YES" : "NO") . "\n\n";

    if (count($tables) > 0) {
        // Get total count
        $count = DB::table('teaching_assignments')->count();
        echo "Total teaching assignments: {$count}\n\n";

        if ($count > 0) {
            // Get sample records
            echo "Sample records:\n";
            $records = DB::table('teaching_assignments')
                ->limit(5)
                ->get();

            foreach ($records as $record) {
                echo "---\n";
                echo "ID: {$record->id}\n";
                echo "Lecturer ID: " . ($record->lecturer_id ?? 'NULL') . "\n";
                echo "Course: " . ($record->course_code ?? 'N/A') . " - " . ($record->course_name ?? 'N/A') . "\n";
                echo "Class: " . ($record->class_name ?? 'N/A') . "\n";
                echo "Lop ID: " . ($record->lop_id ?? 'NULL') . "\n";
                echo "Dates: " . ($record->start_date ?? 'N/A') . " to " . ($record->end_date ?? 'N/A') . "\n";
            }

            // Check lecturers
            echo "\n\n=== Checking Lecturers ===\n";
            $lecturers = DB::table('teaching_assignments')
                ->select('lecturer_id')
                ->distinct()
                ->whereNotNull('lecturer_id')
                ->get();
            echo "Distinct lecturers with assignments: " . count($lecturers) . "\n";
            echo "Lecturer IDs: " . implode(', ', $lecturers->pluck('lecturer_id')->toArray()) . "\n";

            // Check if we have lop_id relationships
            echo "\n\n=== Checking Class Relationships ===\n";
            $withLop = DB::table('teaching_assignments')
                ->whereNotNull('lop_id')
                ->count();
            echo "Assignments with lop_id: {$withLop}\n";

            // Join with classes table to check khoaHoc_id
            echo "\n\n=== Checking khoaHoc_id from classes ===\n";
            $classesCheck = DB::table('teaching_assignments')
                ->join('classes', 'teaching_assignments.lop_id', '=', 'classes.id')
                ->select('classes.khoaHoc_id', DB::raw('COUNT(*) as count'))
                ->groupBy('classes.khoaHoc_id')
                ->get();

            foreach ($classesCheck as $row) {
                echo "Year {$row->khoaHoc_id}: {$row->count} assignments\n";
            }
        }
    }

    echo "\n=== Test Complete ===\n";

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}

