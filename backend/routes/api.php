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
use App\Http\Controllers\Api\GradeProxyController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\TrainingController;
use App\Http\Controllers\Api\ClassController;
use App\Http\Controllers\Api\GradeManagementController;
use App\Http\Controllers\Api\SubjectController;
use App\Http\Controllers\Api\AcademicYearController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

Route::prefix('students')->group(function () {
    Route::get('/thac-sy', [StudentController::class, 'getThacSy']);
    Route::get('/by-code/{maHV}', [StudentController::class, 'getByCode']);
    Route::get('/test', [StudentController::class, 'index']); // Public test route
});

Route::get('/majors', [MajorController::class, 'index']);
Route::get('/majors/{id}', [MajorController::class, 'show']);

// Academic Years Routes (Public - for year selection)
Route::get('/academic-years', [AcademicYearController::class, 'index']);
Route::get('/academic-years/active', [AcademicYearController::class, 'getActiveYears']);
Route::post('/academic-years', [AcademicYearController::class, 'store']);
Route::delete('/academic-years/{id}', [AcademicYearController::class, 'destroy']);


// Roles Routes (Public - for dropdowns)
Route::get('/roles', [RoleController::class, 'index']);
Route::get('/roles/{id}', [RoleController::class, 'show']);

// Rooms/Classes Routes (Public)
Route::prefix('class-management')->group(function () {
    Route::get('/thac-sy', [RoomController::class, 'getThacSy']);
    Route::get('/', [RoomController::class, 'index']);
    Route::get('/{id}', [RoomController::class, 'show']);
});

// Major-Subjects Routes (Public)
Route::get('/major-subjects', [MajorSubjectController::class, 'index']);
Route::get('/major-subjects/{id}', [MajorSubjectController::class, 'show']);
Route::get('/major-subjects/available-subjects/{majorId}', [MajorSubjectController::class, 'getAvailableSubjects']);
Route::post('/major-subjects', [MajorSubjectController::class, 'store']);
Route::post('/major-subjects/bulk-assign', [MajorSubjectController::class, 'bulkAssign']);
Route::delete('/major-subjects/{id}', [MajorSubjectController::class, 'destroy']);

// Courses (Kỳ học) Routes (Public)
Route::get('/courses', [CourseController::class, 'index']);
Route::get('/courses/simple', [CourseController::class, 'simple']);
Route::get('/courses/{id}', [CourseController::class, 'show']);
Route::post('/courses', [CourseController::class, 'store']);
Route::put('/courses/{id}', [CourseController::class, 'update']);
Route::delete('/courses/{id}', [CourseController::class, 'destroy']);
Route::post('/courses/create-classes', [CourseController::class, 'createClasses']);

Route::get('/trinh-do-dao-tao', [EducationLevelController::class, 'simple']);
Route::get('/education-levels', [EducationLevelController::class, 'index']);
Route::get('/education-levels/{id}', [EducationLevelController::class, 'show']);

Route::prefix('subjects')->group(function () {
    Route::get('/', [SubjectController::class, 'index']);
    Route::get('/by-major', [SubjectController::class, 'getSubjectsByMajorAndYear']);
    Route::get('/{subjectId}/students', [SubjectController::class, 'getEnrolledStudents']);
    Route::get('/available-students', [SubjectController::class, 'getAvailableStudents']);
    Route::post('/', [SubjectController::class, 'store']);
    Route::put('/{id}', [SubjectController::class, 'update']);
    Route::delete('/{id}', [SubjectController::class, 'destroy']);
    Route::post('/enroll', [SubjectController::class, 'enrollStudent']);
    Route::post('/bulk-enroll', [SubjectController::class, 'bulkEnrollStudents']);
    Route::delete('/unenroll/{enrollmentId}', [SubjectController::class, 'unenrollStudent']);
    Route::post('/bulk-unenroll', [SubjectController::class, 'bulkUnenrollStudents']);
});

// Public Classes (Lop) Routes
Route::get('/classes', [ClassController::class, 'index']);
Route::get('/classes/simple', [ClassController::class, 'simple']);
Route::get('/classes/{id}', [ClassController::class, 'show']);
Route::get('/classes/{id}/students', [ClassController::class, 'getStudents']);

Route::prefix('grades')->group(function () {
    Route::get('/', [GradeController::class, 'getGradesByMaHV']);
    Route::get('/grouped', [GradeController::class, 'getGradesGrouped']);

    // Proxy for external API (bypass CORS)
    Route::get('/external', [GradeProxyController::class, 'getGradesByMaHV']);
    Route::get('/external/health', [GradeProxyController::class, 'checkApiHealth']);
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

    // User Management
    Route::prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index'])->middleware('permission:users.view');
        Route::get('/profile/{id}', [UserController::class, 'profile'])->middleware('permission:users.view');
        Route::get('/{id}', [UserController::class, 'show'])->middleware('permission:users.view');
        Route::post('/', [UserController::class, 'store'])->middleware('permission:users.create');
        Route::put('/{id}', [UserController::class, 'update'])->middleware('permission:users.edit');
        Route::delete('/{id}', [UserController::class, 'destroy'])->middleware('permission:users.delete');

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
        Route::get('/', [LecturerController::class, 'index'])->middleware('permission:teachers.view');
        Route::post('/', [LecturerController::class, 'store'])->middleware('permission:teachers.create');
        Route::get('/{id}', [LecturerController::class, 'show'])->middleware('permission:teachers.view');
        Route::put('/{id}', [LecturerController::class, 'update'])->middleware('permission:teachers.edit');
        Route::delete('/{id}', [LecturerController::class, 'destroy'])->middleware('permission:teachers.delete');
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

    Route::prefix('education-levels')->group(function () {
        Route::post('/', [EducationLevelController::class, 'store'])->middleware('permission:education_levels.create');
        Route::put('/{id}', [EducationLevelController::class, 'update'])->middleware('permission:education_levels.edit');
        Route::delete('/{id}', [EducationLevelController::class, 'destroy'])->middleware('permission:education_levels.delete');
    });
});
