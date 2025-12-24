#!/usr/bin/env php
<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "Testing TeachingAssignmentsSeeder...\n\n";

// Check lecturers
$lecturerCount = DB::table('lecturers')->count();
echo "✓ Lecturers: {$lecturerCount}\n";

// Check classes
$classCount = DB::table('classes')->count();
echo "✓ Classes: {$classCount}\n";

// Check teaching assignments before
$beforeCount = DB::table('teaching_assignments')->count();
echo "✓ Teaching Assignments (before): {$beforeCount}\n\n";

// Run seeder
try {
    $seeder = new \Database\Seeders\TeachingAssignmentsSeeder();
    $seeder->setCommand(new class {
        public function info($msg) { echo "[INFO] $msg\n"; }
        public function warn($msg) { echo "[WARN] $msg\n"; }
        public function error($msg) { echo "[ERROR] $msg\n"; }
    });

    $seeder->run();

    // Check after
    $afterCount = DB::table('teaching_assignments')->count();
    echo "\n✓ Teaching Assignments (after): {$afterCount}\n";
    echo "✓ Inserted: " . ($afterCount - $beforeCount) . " records\n";

} catch (\Exception $e) {
    echo "\n✗ Error: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}

