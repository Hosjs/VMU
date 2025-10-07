<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

/*
|--------------------------------------------------------------------------
| API Routes - JWT Passport Authentication
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// =====================
// PUBLIC AUTH ROUTES (No authentication required)
// =====================

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->name('api.auth.register');
    Route::post('/login', [AuthController::class, 'login'])->name('api.auth.login');
});

// =====================
// PROTECTED ROUTES (Require JWT authentication)
// =====================

Route::middleware('auth:api')->group(function () {
    // Auth routes
    Route::prefix('auth')->group(function () {
        Route::get('/me', [AuthController::class, 'me'])->name('api.auth.me');
        Route::post('/logout', [AuthController::class, 'logout'])->name('api.auth.logout');
        Route::post('/refresh', [AuthController::class, 'refresh'])->name('api.auth.refresh');
        Route::post('/change-password', [AuthController::class, 'changePassword'])->name('api.auth.change-password');
    });

    // TODO: Add more protected API routes here
    // Example:
    // Route::apiResource('services', ServiceController::class);
    // Route::apiResource('products', ProductController::class);
    // Route::apiResource('categories', CategoryController::class);
    // Route::apiResource('customers', CustomerController::class);
    // Route::apiResource('vehicles', VehicleController::class);
    // Route::apiResource('orders', OrderController::class);
});
