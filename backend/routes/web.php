<?php

use Illuminate\Support\Facades\Route;

// Redirect root to frontend or API documentation
Route::get('/', function () {
    return response()->json([
        'success' => true,
    ]);
});
