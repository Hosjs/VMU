<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Dashboard\DashboardController;
use App\Http\Controllers\Api\MajorController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\EducationLevelController;
use App\Http\Controllers\Api\RoomController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// External API Proxy
Route::prefix('students')->group(function () {
    Route::get('/thac-sy', [StudentController::class, 'getThacSy']);
    Route::get('/by-code/{maHV}', [StudentController::class, 'getByCode']);
});

Route::get('/majors', [MajorController::class, 'index']);
Route::get('/majors/{maNganh}', [MajorController::class, 'show']);

Route::get('/rooms', [RoomController::class, 'index']);
Route::get('/rooms/{id}', [RoomController::class, 'show']);

Route::get('/education-levels', [EducationLevelController::class, 'index']);
Route::get('/education-levels/simple', [EducationLevelController::class, 'simple']);
Route::get('/education-levels/{ma}', [EducationLevelController::class, 'show']);

Route::middleware('auth:api')->group(function () {
    // Auth Management
    Route::prefix('auth')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::get('/permissions', [AuthController::class, 'permissions']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/refresh', [AuthController::class, 'refresh']);
        Route::post('/change-password', [AuthController::class, 'changePassword']);
    });

    // Dashboard
    Route::prefix('dashboard')->group(function () {
        Route::get('/', [DashboardController::class, 'index'])->middleware('permission:dashboard.view');
        Route::get('/user', [DashboardController::class, 'getUserDashboard']);
    });

    // Student Management
    Route::prefix('students')->group(function () {
        Route::get('/', [StudentController::class, 'index'])->middleware('permission:students.view');
        Route::post('/', [StudentController::class, 'store'])->middleware('permission:students.create');
        Route::get('/{maHV}', [StudentController::class, 'show'])->middleware('permission:students.view');
        Route::put('/{maHV}', [StudentController::class, 'update'])->middleware('permission:students.edit');
        Route::delete('/{maHV}', [StudentController::class, 'destroy'])->middleware('permission:students.delete');
    });
});
