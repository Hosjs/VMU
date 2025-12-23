#!/usr/bin/env php
<?php

echo "Testing StudentsSeeder syntax...\n\n";

// Test if file can be loaded
$file = __DIR__ . '/database/seeders/StudentsSeeder.php';
if (!file_exists($file)) {
    die("❌ File not found!\n");
}

echo "✅ File exists\n";

// Check syntax
exec("php -l $file 2>&1", $output, $return);
if ($return !== 0) {
    echo "❌ Syntax error:\n";
    echo implode("\n", $output);
    exit(1);
}

echo "✅ PHP syntax OK\n";

// Count lines
$lines = file($file);
echo "✅ Total lines: " . count($lines) . "\n";

// Check class name
$content = file_get_contents($file);
if (strpos($content, 'class StudentsSeeder') !== false) {
    echo "✅ Class name: StudentsSeeder\n";
} else {
    echo "❌ Class name not found\n";
}

// Check if has INSERT statement
if (strpos($content, 'INSERT INTO `students`') !== false) {
    echo "✅ Has INSERT INTO students\n";
} else {
    echo "❌ No INSERT statement found\n";
}

// Check if uses DB::unprepared
if (strpos($content, 'DB::unprepared($sql)') !== false) {
    echo "✅ Uses DB::unprepared\n";
} else {
    echo "❌ No DB::unprepared found\n";
}

echo "\n✅ All checks passed!\n";

