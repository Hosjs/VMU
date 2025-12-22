<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$payments = DB::table('lecturer_payments')->get(['id', 'total_amount', 'insurance_amount', 'net_amount', 'lecturer_id', 'semester_code']);

if ($payments->count() > 0) {
    echo "All payments in database:\n";
    foreach ($payments as $p) {
        $total = number_format($p->total_amount, 0, '.', '.');
        $insurance = number_format($p->insurance_amount, 0, '.', '.');
        $net = number_format($p->net_amount, 0, '.', '.');

        echo "ID: {$p->id} | Lecturer: {$p->lecturer_id} | Semester: {$p->semester_code}\n";
        echo "  Total: {$total} đ | Insurance: {$insurance} đ | Net: {$net} đ\n";

        if ($p->total_amount > 1000000000) {
            echo "  ⚠️  WARNING: Amount exceeds 1 billion!\n";
        }
        echo "\n";
    }
} else {
    echo "No payments found in database.\n";
}

