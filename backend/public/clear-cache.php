<?php
/**
 * Clear Laravel cache - XÓA FILE NÀY SAU KHI DÙNG XONG
 * Truy cập: https://www.sdtvimaru.com/api/clear-cache.php
 */

// Bảo vệ bằng token đơn giản
if (!isset($_GET['token']) || $_GET['token'] !== 'vmu2026clear') {
    die('Unauthorized');
}

$laravelPath = __DIR__ . '/../../laravel_backend';
require $laravelPath . '/vendor/autoload.php';
$app = require_once $laravelPath . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

$commands = [
    'config:clear',
    'route:clear',
    'view:clear',
    'cache:clear',
];

echo "<pre>";
echo "=== Laravel Cache Clear ===\n\n";
foreach ($commands as $command) {
    $kernel->call($command);
    echo "✅ {$command}\n";
}
echo "\nDone! Hãy XÓA file này ngay.\n";
echo "</pre>";

