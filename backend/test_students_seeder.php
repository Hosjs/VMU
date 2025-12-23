<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Testing StudentsSeeder...\n";

try {
    // Check current count
    $beforeCount = DB::table('students')->count();
    echo "Students before: $beforeCount\n";

    // Run seeder
    $seeder = new \Database\Seeders\StudentsSeeder();
    $seeder->setCommand(new class {
        public function info($msg) { echo "INFO: $msg\n"; }
        public function warn($msg) { echo "WARN: $msg\n"; }
        public function error($msg) { echo "ERROR: $msg\n"; }
        public function confirm($msg, $default) { return true; } // Auto yes
    });

    $seeder->run();

    // Check after count
    $afterCount = DB::table('students')->count();
    echo "Students after: $afterCount\n";
    echo "✅ Successfully tested!\n";

} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}

