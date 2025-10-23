<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Management\Users\UserController;
use App\Http\Controllers\Api\Management\Roles\RoleController;
use App\Http\Controllers\Api\Dashboard\DashboardController;

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});
// Protected routes-kiểm tra xác thực
Route::middleware('auth:api')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::get('/permissions', [AuthController::class, 'permissions']); // ✅ Đã thêm
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/refresh', [AuthController::class, 'refresh']);
        Route::post('/change-password', [AuthController::class, 'changePassword']);
    });

    // Dashboard routes
    Route::prefix('dashboard')->group(function () {
        Route::get('/', [DashboardController::class, 'index']);
        Route::get('/user', [DashboardController::class, 'getUserDashboard']);
    });
});
