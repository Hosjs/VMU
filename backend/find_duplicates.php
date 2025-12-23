#!/usr/bin/env php
<?php

echo "Finding duplicate entries in StudentsSeeder...\n\n";

$file = __DIR__ . '/database/seeders/StudentsSeeder.php';
$lines = file($file);

$duplicates = [
    'emails' => [
        'buiphuonghpvina@gmail.com',
        'truongthao1501@gmail.com',
        'tranhuyentrang200891@gmail.com',
        'ngothihathu1999@gmail.com'
    ],
    'phones' => [
        '0888737939',
        '0846943789',
        '0932052149',
        '0000000000',
        '0989581958',
        '0985654516',
        '0948484299'
    ]
];

echo "🔍 Searching for duplicate entries...\n\n";

foreach ($lines as $lineNum => $line) {
    foreach ($duplicates['emails'] as $email) {
        if (strpos($line, $email) !== false) {
            echo "Line " . ($lineNum + 1) . " - Email: $email\n";
            echo "  " . trim($line) . "\n\n";
        }
    }

    foreach ($duplicates['phones'] as $phone) {
        if (strpos($line, "'$phone'") !== false) {
            // Extract student ID from line
            preg_match("/\('([A-Z0-9]+)',/", $line, $matches);
            $maHV = $matches[1] ?? 'UNKNOWN';
            echo "Line " . ($lineNum + 1) . " - Phone: $phone (Student: $maHV)\n";
            echo "  " . trim($line) . "\n\n";
        }
    }
}

echo "\n💡 SUGGESTED FIXES:\n";
echo "1. For duplicate emails: Add number suffix like email1@, email2@\n";
echo "2. For duplicate phones: Change last digits or use pattern like 098558195X\n";
echo "3. For 0000000000: Replace with unique fake numbers like 0900000001, 0900000002, etc.\n";

