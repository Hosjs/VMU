<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Dashboard\DashboardController;
use App\Http\Controllers\Api\MajorController;
use App\Http\Controllers\Api\MajorSubjectController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\LecturerController;
use App\Http\Controllers\Api\EducationLevelController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\ClassAssignmentController;
use App\Http\Controllers\Api\GradeController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\TrainingController;
use App\Http\Controllers\Api\TeachingAssignmentController;
use App\Http\Controllers\Api\ClassController;
use App\Http\Controllers\Api\GradeManagementController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

Route::prefix('students')->group(function () {
    Route::get('/thac-sy', [StudentController::class, 'getThacSy']);
    Route::get('/by-code/{maHV}', [StudentController::class, 'getByCode']);
});

Route::get('/majors', [MajorController::class, 'index']);
Route::get('/majors/{id}', [MajorController::class, 'show']);

Route::get('/lecturers', [LecturerController::class, 'index']);
Route::get('/lecturers/{id}', [LecturerController::class, 'show']);

// Rooms/Classes Routes (Public)
Route::get('/rooms/thac-sy', [RoomController::class, 'getThacSy']);
Route::get('/rooms', [RoomController::class, 'index']);

// Major-Subjects Routes (Public)
Route::get('/major-subjects', [MajorSubjectController::class, 'index']);
Route::get('/major-subjects/{id}', [MajorSubjectController::class, 'show']);
Route::get('/major-subjects/available-subjects/{majorId}', [MajorSubjectController::class, 'getAvailableSubjects']);

Route::get("/courses/{id}",[CourseController::class, 'show']);

Route::get('/trinh-do-dao-tao', [EducationLevelController::class, 'simple']);
Route::get('/education-levels', [EducationLevelController::class, 'index']);
Route::get('/education-levels/{id}', [EducationLevelController::class, 'show']);

// Public Classes (Lop) Routes
Route::get('/classes', [ClassController::class, 'index']);
Route::get('/classes/simple', [ClassController::class, 'simple']);
Route::get('/classes/{id}', [ClassController::class, 'show']);
Route::get('/classes/{id}/students', [ClassController::class, 'getStudents']);

Route::prefix('grades')->group(function () {
    Route::get('/', [GradeController::class, 'getGradesByMaHV']);
    Route::get('/grouped', [GradeController::class, 'getGradesGrouped']);
});

// Grade Management Routes (for teachers/admin)
Route::prefix('grade-management')->group(function () {
    Route::get('/majors', [GradeManagementController::class, 'getMajorsWithYears']);
    Route::get('/all-classes', [GradeManagementController::class, 'getAllClassesWithInfo']);
    Route::get('/classes', [GradeManagementController::class, 'getClassesByMajorAndYear']);
    Route::get('/classes/{classId}/students', [GradeManagementController::class, 'getStudentsWithGrades']);

    Route::middleware('auth:api')->group(function () {
        Route::post('/grades', [GradeManagementController::class, 'updateGrade'])->middleware('permission:grades.create');
        Route::post('/grades/bulk', [GradeManagementController::class, 'bulkUpdateGrades'])->middleware('permission:grades.create');
        Route::delete('/grades/{gradeId}', [GradeManagementController::class, 'deleteGrade'])->middleware('permission:grades.delete');
    });
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

    // User Profile
    Route::prefix('users')->group(function () {
        Route::get('/profile/{id}', [UserController::class, 'profile'])->middleware('permission:users.view');

        Route::prefix('roles')->group(function () {
            Route::get('/', [RoleController::class, 'index'])->middleware('permission:roles.view');
            Route::get('/permissions', [RoleController::class, 'getPermissions'])->middleware('permission:roles.view');
            Route::get('/{id}', [RoleController::class, 'show'])->middleware('permission:roles.view');
            Route::post('/', [RoleController::class, 'store'])->middleware('permission:roles.create');
            Route::put('/{id}', [RoleController::class, 'update'])->middleware('permission:roles.edit');
            Route::delete('/{id}', [RoleController::class, 'destroy'])->middleware('permission:roles.delete');
            Route::post('/{id}/permissions', [RoleController::class, 'updatePermissions'])->middleware('permission:roles.edit');
            Route::post('/assign', [RoleController::class, 'assignRole'])->middleware('permission:roles.edit');
        });
    });
    // Dashboard
    Route::prefix('dashboard')->group(function () {
        Route::get('/', [DashboardController::class, 'index'])->middleware('permission:dashboard.view');
        Route::get('/user', [DashboardController::class, 'getUserDashboard']);
    });

    // Major Management (Protected)
    Route::prefix('majors')->group(function () {
        Route::post('/', [MajorController::class, 'store'])->middleware('permission:majors.create');
        Route::put('/{id}', [MajorController::class, 'update'])->middleware('permission:majors.edit');
        Route::delete('/{id}', [MajorController::class, 'destroy'])->middleware('permission:majors.delete');
        Route::get('/{id}/subjects', [MajorController::class, 'getSubjects'])->middleware('permission:majors.view');
    });

    // Student Management
    Route::prefix('students')->group(function () {
        Route::get('/', [StudentController::class, 'index'])->middleware('permission:students.view');
        Route::post('/', [StudentController::class, 'store'])->middleware('permission:students.create');
        Route::get('/{maHV}', [StudentController::class, 'show'])->middleware('permission:students.view');
        Route::put('/{maHV}', [StudentController::class, 'update'])->middleware('permission:students.edit');
        Route::delete('/{maHV}', [StudentController::class, 'destroy'])->middleware('permission:students.delete');
    });
    // Lecturer Management
    Route::prefix('lecturers')->group(function () {
        Route::get('/', [LecturerController::class, 'index'])->middleware('permission:lecturers.view');
        Route::post('/', [LecturerController::class, 'store'])->middleware('permission:lecturers.create');
        Route::get('/{id}', [LecturerController::class, 'show'])->middleware('permission:lecturers.view');
        Route::put('/{id}', [LecturerController::class, 'update'])->middleware('permission:lecturers.edit');
        Route::delete('/{id}', [LecturerController::class, 'destroy'])->middleware('permission:lecturers.delete');
    });


    // Training Management
    Route::prefix('training')->group(function () {
        Route::get('/course-registrations', [TrainingController::class, 'getCourseRegistrations'])
            ->middleware('permission:training.view');
        Route::get('/study-plans', [TrainingController::class, 'getStudyPlans'])
            ->middleware('permission:training.view');
        Route::get('/education-types', [TrainingController::class, 'getEducationTypes'])
            ->middleware('permission:training.view');
        Route::get('/available-years', [TrainingController::class, 'getAvailableYears'])
            ->middleware('permission:training.view');
    });

    // Teaching Assignments Management
    Route::prefix('teaching-assignments')->group(function () {
        Route::get('/', [TeachingAssignmentController::class, 'index']);
        Route::get('/{id}', [TeachingAssignmentController::class, 'show']);
        Route::post('/', [TeachingAssignmentController::class, 'store']);
        Route::put('/{id}', [TeachingAssignmentController::class, 'update']);
        Route::delete('/{id}', [TeachingAssignmentController::class, 'destroy']);
        Route::get('/lecturer/{lecturerId}/schedule', [TeachingAssignmentController::class, 'lecturerSchedule']);
        Route::post('/check-conflict', [TeachingAssignmentController::class, 'checkConflict']);
    });

    Route::prefix('education-levels')->group(function () {
        Route::post('/', [EducationLevelController::class, 'store'])->middleware('permission:education_levels.create');
        Route::put('/{id}', [EducationLevelController::class, 'update'])->middleware('permission:education_levels.edit');
        Route::delete('/{id}', [EducationLevelController::class, 'destroy'])->middleware('permission:education_levels.delete');
    });
});
