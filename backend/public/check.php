<?php
/**
 * File debug tạm thời — XÓA SAU KHI KIỂM TRA XONG
 * Truy cập: https://www.sdtvimaru.com/api/check.php
 */

echo "<pre>";
echo "=== DEBUG INFO ===\n\n";
echo "__DIR__          : " . __DIR__ . "\n";
echo "../../laravel    : " . realpath(__DIR__ . '/../../laravel_backend') . "\n";
echo "../laravel       : " . realpath(__DIR__ . '/../laravel_backend') . "\n\n";

$path2 = __DIR__ . '/../../laravel_backend';
$path1 = __DIR__ . '/../laravel_backend';

echo "Path ../../laravel_backend EXISTS : " . (is_dir($path2) ? "YES ✅" : "NO ❌") . "\n";
echo "Path ../laravel_backend  EXISTS   : " . (is_dir($path1) ? "YES ✅" : "NO ❌") . "\n\n";

echo "vendor (../../) EXISTS : " . (file_exists($path2 . '/vendor/autoload.php') ? "YES ✅" : "NO ❌") . "\n";
echo "vendor (../)    EXISTS : " . (file_exists($path1 . '/vendor/autoload.php') ? "YES ✅" : "NO ❌") . "\n\n";

echo "PHP Version : " . PHP_VERSION . "\n";
echo "</pre>";

