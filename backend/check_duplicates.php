#!/usr/bin/env php
<?php

echo "Checking for duplicates in StudentsSeeder data...\n\n";

$file = __DIR__ . '/database/seeders/StudentsSeeder.php';
$content = file_get_contents($file);

// Extract all email and phone numbers
preg_match_all("/'([^']+@[^']+)'/", $content, $emails);
preg_match_all("/'(0\d{9,10})'/", $content, $phones);

$emailList = $emails[1];
$phoneList = $phones[1];

echo "📧 Total emails found: " . count($emailList) . "\n";
echo "📱 Total phones found: " . count($phoneList) . "\n\n";

// Check for duplicate emails
$duplicateEmails = array_filter(array_count_values($emailList), function($count) {
    return $count > 1;
});

if (count($duplicateEmails) > 0) {
    echo "❌ DUPLICATE EMAILS FOUND:\n";
    foreach ($duplicateEmails as $email => $count) {
        echo "  - $email (appears $count times)\n";
    }
    echo "\n";
} else {
    echo "✅ No duplicate emails\n\n";
}

// Check for duplicate phones
$duplicatePhones = array_filter(array_count_values($phoneList), function($count) {
    return $count > 1;
});

if (count($duplicatePhones) > 0) {
    echo "❌ DUPLICATE PHONES FOUND:\n";
    foreach ($duplicatePhones as $phone => $count) {
        echo "  - $phone (appears $count times)\n";
    }
    echo "\n";
} else {
    echo "✅ No duplicate phones\n\n";
}

// Check for duplicate maHV (student IDs)
preg_match_all("/\('([A-Z0-9]+)',/", $content, $maHVs);
$maHVList = $maHVs[1];

echo "🆔 Total student IDs found: " . count($maHVList) . "\n";

$duplicateMaHV = array_filter(array_count_values($maHVList), function($count) {
    return $count > 1;
});

if (count($duplicateMaHV) > 0) {
    echo "❌ DUPLICATE STUDENT IDs FOUND:\n";
    foreach ($duplicateMaHV as $maHV => $count) {
        echo "  - $maHV (appears $count times)\n";
    }
    echo "\n";
} else {
    echo "✅ No duplicate student IDs\n\n";
}

if (count($duplicateEmails) == 0 && count($duplicatePhones) == 0 && count($duplicateMaHV) == 0) {
    echo "✅ ALL CHECKS PASSED! No duplicates found.\n";
    exit(0);
} else {
    echo "❌ DUPLICATES FOUND! Please fix the data before seeding.\n";
    exit(1);
}

