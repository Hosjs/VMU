#!/usr/bin/env php
<?php

/**
 * Test Badge API Endpoints
 * Run: php test-badge-api.php
 */

$baseUrl = 'http://localhost:8000/api';
$token = ''; // Thay bằng token thực tế sau khi login

// Colors for terminal output
function colorize($text, $color) {
    $colors = [
        'green' => "\033[32m",
        'red' => "\033[31m",
        'yellow' => "\033[33m",
        'blue' => "\033[34m",
        'reset' => "\033[0m"
    ];
    return $colors[$color] . $text . $colors['reset'];
}

function makeRequest($url, $token) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $token,
        'Accept: application/json'
    ]);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return [
        'code' => $httpCode,
        'body' => json_decode($response, true)
    ];
}

echo colorize("\n=== BADGE API TEST ===\n\n", 'blue');

// Test 1: Get All Badge Counts
echo colorize("Test 1: GET /api/badges/counts\n", 'yellow');
$result = makeRequest($baseUrl . '/badges/counts', $token);
if ($result['code'] === 200) {
    echo colorize("✓ Success\n", 'green');
    echo "Response:\n";
    print_r($result['body']);
} else {
    echo colorize("✗ Failed (HTTP {$result['code']})\n", 'red');
    print_r($result['body']);
}
echo "\n";

// Test 2: Get Orders Count
echo colorize("Test 2: GET /api/badges/count/orders\n", 'yellow');
$result = makeRequest($baseUrl . '/badges/count/orders', $token);
if ($result['code'] === 200) {
    echo colorize("✓ Success\n", 'green');
    echo "Response:\n";
    print_r($result['body']);
} else {
    echo colorize("✗ Failed (HTTP {$result['code']})\n", 'red');
    print_r($result['body']);
}
echo "\n";

// Test 3: Get Invoices Count
echo colorize("Test 3: GET /api/badges/count/invoices\n", 'yellow');
$result = makeRequest($baseUrl . '/badges/count/invoices', $token);
if ($result['code'] === 200) {
    echo colorize("✓ Success\n", 'green');
    echo "Response:\n";
    print_r($result['body']);
} else {
    echo colorize("✗ Failed (HTTP {$result['code']})\n", 'red');
    print_r($result['body']);
}
echo "\n";

// Test 4: Get Service Requests Count
echo colorize("Test 4: GET /api/badges/count/service_requests\n", 'yellow');
$result = makeRequest($baseUrl . '/badges/count/service_requests', $token);
if ($result['code'] === 200) {
    echo colorize("✓ Success\n", 'green');
    echo "Response:\n";
    print_r($result['body']);
} else {
    echo colorize("✗ Failed (HTTP {$result['code']})\n", 'red');
    print_r($result['body']);
}
echo "\n";

echo colorize("=== TEST COMPLETED ===\n\n", 'blue');
echo colorize("Note: Nếu gặp lỗi 401, hãy thay \$token bằng token thực tế\n", 'yellow');
echo colorize("Lấy token bằng cách login: POST /api/auth/login\n", 'yellow');

