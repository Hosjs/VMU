<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== Testing Lecturer Payment Routes ===\n\n";

// Test 1: Check if controllers exist
echo "1. Checking if LecturerPaymentController exists...\n";
if (class_exists('App\Http\Controllers\Api\LecturerPaymentController')) {
    echo "   ✓ LecturerPaymentController found\n";
} else {
    echo "   ✗ LecturerPaymentController NOT found\n";
}

echo "\n2. Checking if PaymentRateController exists...\n";
if (class_exists('App\Http\Controllers\Api\PaymentRateController')) {
    echo "   ✓ PaymentRateController found\n";
} else {
    echo "   ✗ PaymentRateController NOT found\n";
}

// Test 2: Check if models exist
echo "\n3. Checking if LecturerPayment model exists...\n";
if (class_exists('App\Models\LecturerPayment')) {
    echo "   ✓ LecturerPayment model found\n";

    // Check table exists
    try {
        $count = \App\Models\LecturerPayment::count();
        echo "   ✓ Table 'lecturer_payments' exists with {$count} records\n";
    } catch (\Exception $e) {
        echo "   ✗ Error accessing table: " . $e->getMessage() . "\n";
    }
} else {
    echo "   ✗ LecturerPayment model NOT found\n";
}

echo "\n4. Checking if PaymentRate model exists...\n";
if (class_exists('App\Models\PaymentRate')) {
    echo "   ✓ PaymentRate model found\n";

    // Check table exists
    try {
        $count = \App\Models\PaymentRate::count();
        echo "   ✓ Table 'payment_rates' exists with {$count} records\n";
    } catch (\Exception $e) {
        echo "   ✗ Error accessing table: " . $e->getMessage() . "\n";
    }
} else {
    echo "   ✗ PaymentRate model NOT found\n";
}

// Test 3: List all routes with 'lecturer-payment' or 'payment-rate'
echo "\n5. Checking registered routes...\n";
$routes = \Illuminate\Support\Facades\Route::getRoutes();
$lecturerPaymentRoutes = [];
$paymentRateRoutes = [];

foreach ($routes as $route) {
    $uri = $route->uri();
    if (strpos($uri, 'lecturer-payment') !== false) {
        $lecturerPaymentRoutes[] = $route->methods()[0] . ' ' . $uri;
    }
    if (strpos($uri, 'payment-rate') !== false) {
        $paymentRateRoutes[] = $route->methods()[0] . ' ' . $uri;
    }
}

if (count($lecturerPaymentRoutes) > 0) {
    echo "   ✓ Found " . count($lecturerPaymentRoutes) . " lecturer-payment routes:\n";
    foreach ($lecturerPaymentRoutes as $route) {
        echo "     - {$route}\n";
    }
} else {
    echo "   ✗ No lecturer-payment routes found\n";
}

if (count($paymentRateRoutes) > 0) {
    echo "   ✓ Found " . count($paymentRateRoutes) . " payment-rate routes:\n";
    foreach ($paymentRateRoutes as $route) {
        echo "     - {$route}\n";
    }
} else {
    echo "   ✗ No payment-rate routes found\n";
}

echo "\n=== Test Complete ===\n";

