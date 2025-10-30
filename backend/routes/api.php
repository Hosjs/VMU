<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Dashboard\DashboardController;
use App\Http\Controllers\Api\MajorController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\EducationLevelController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\ClassAssignmentController;
use App\Http\Controllers\Api\GradeController;
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

// Rooms - Route cụ thể phải đứng TRƯỚC route với parameter
Route::get('/rooms/thac-sy', [RoomController::class, 'getThacSy']);
Route::get('/rooms', [RoomController::class, 'index']);
Route::get('/rooms/{id}', [RoomController::class, 'show']);

// Class Assignments (Phân lớp học viên) - Routes have been moved and consolidated below

Route::get("/courses",[CourseController::class, 'index']);
Route::get("/courses/{id}",[CourseController::class, 'show']);

Route::get('/trinh-do-dao-tao', [EducationLevelController::class, 'simple']);
Route::get('/education-levels', [EducationLevelController::class, 'index']);
Route::get('/education-levels/{id}', [EducationLevelController::class, 'show']);

Route::prefix('grades')->group(function () {
    Route::get('/', [GradeController::class, 'getGradesByMaHV']);
});

// Consolidated Class Assignments Routes
Route::prefix('class-assignments')->group(function () {
    // Public routes
    Route::get('/', [ClassAssignmentController::class, 'index']);
    Route::get('/{id}', [ClassAssignmentController::class, 'show']);

    // Protected routes
    Route::middleware('auth:api')->group(function () {
        Route::post('/', [ClassAssignmentController::class, 'store'])->middleware('permission:class_assignments.create');
        Route::put('/{id}', [ClassAssignmentController::class, 'update'])->middleware('permission:class_assignments.edit');
        Route::delete('/{id}', [ClassAssignmentController::class, 'destroy'])->middleware('permission:class_assignments.delete');
        Route::post('/bulk', [ClassAssignmentController::class, 'bulkAssign'])->middleware('permission:class_assignments.create');
        Route::post('/bulk-remove', [ClassAssignmentController::class, 'bulkRemove'])->middleware('permission:class_assignments.delete');
    });
});

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

    Route::prefix('education-levels')->group(function () {
        Route::post('/', [EducationLevelController::class, 'store'])->middleware('permission:education_levels.create');
        Route::put('/{id}', [EducationLevelController::class, 'update'])->middleware('permission:education_levels.edit');
        Route::delete('/{id}', [EducationLevelController::class, 'destroy'])->middleware('permission:education_levels.delete');
    });
});
