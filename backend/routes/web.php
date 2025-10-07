<?php

use Illuminate\Support\Facades\Route;

// Redirect root to frontend or API documentation
Route::get('/', function () {
    return response()->json([
        'success' => true,
        'message' => 'Garage Management API',
        'version' => '1.0.0',
        'documentation' => 'See API documentation for available endpoints',
        'endpoints' => [
            'auth' => '/api/auth/*',
            'health' => '/up',
        ]
    ]);
});
