<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;

// Update user ID 14 to have lecturer_id = 351
$user = User::find(14);
if ($user) {
    $user->lecturer_id = 351;
    $user->save();
    echo "✅ User ID 14 updated successfully!\n";
    echo "User: {$user->name}\n";
    echo "Email: {$user->email}\n";
    echo "Lecturer ID: {$user->lecturer_id}\n";
} else {
    echo "❌ User ID 14 not found\n";
}

// Also check if there are any other users that might need updating
echo "\n📋 All users:\n";
$users = User::all();
foreach ($users as $u) {
    echo "ID: {$u->id} | Name: {$u->name} | Email: {$u->email} | Lecturer ID: " . ($u->lecturer_id ?? 'NULL') . "\n";
}

