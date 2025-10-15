<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\Admin\RoleController;
use App\Http\Controllers\Api\Admin\CustomerController;
use App\Http\Controllers\Api\Admin\ServiceController;
use App\Http\Controllers\Api\Admin\ProductController;
use App\Http\Controllers\Api\Admin\OrderController;
use App\Http\Controllers\Api\Admin\WarehouseController;
use App\Http\Controllers\Api\Admin\ProviderController;
use App\Http\Controllers\Api\Admin\CategoryController;
use App\Http\Controllers\Api\Admin\InvoiceController;
use App\Http\Controllers\Api\Admin\PaymentController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\BadgeController;
use App\Http\Controllers\NotificationController;

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
        Route::get('/permissions', [AuthController::class, 'permissions'])->name('api.auth.permissions');
        Route::post('/logout', [AuthController::class, 'logout'])->name('api.auth.logout');
        Route::post('/refresh', [AuthController::class, 'refresh'])->name('api.auth.refresh');
        Route::post('/change-password', [AuthController::class, 'changePassword'])->name('api.auth.change-password');
    });

    // =====================
    // NOTIFICATIONS ROUTES
    // =====================
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::get('/unread-count', [NotificationController::class, 'unreadCount']);
        Route::post('/{id}/mark-as-read', [NotificationController::class, 'markAsRead']);
        Route::post('/mark-all-as-read', [NotificationController::class, 'markAllAsRead']);
        Route::delete('/{id}', [NotificationController::class, 'destroy']);
        Route::get('/stream', [NotificationController::class, 'stream']); // SSE endpoint
    });

    // =====================
    // BADGE COUNTS ROUTES
    // =====================
    Route::prefix('badges')->group(function () {
        Route::get('/counts', [BadgeController::class, 'getCounts']);
        Route::get('/count/{type}', [BadgeController::class, 'getCount']);
    });

    // =====================
    // ADMIN ROUTES
    // =====================
    Route::prefix('admin')->group(function () {

        // Dashboard & Reports
        Route::get('/dashboard/overview', [DashboardController::class, 'overview']);
        Route::get('/dashboard/revenue-report', [DashboardController::class, 'revenueReport']);
        Route::get('/dashboard/profit-report', [DashboardController::class, 'profitReport']);
        Route::get('/dashboard/top-customers', [DashboardController::class, 'topCustomers']);
        Route::get('/dashboard/top-services', [DashboardController::class, 'topServices']);
        Route::get('/dashboard/top-products', [DashboardController::class, 'topProducts']);

        // Users Management
        Route::get('/users/departments', [UserController::class, 'departments']);
        Route::get('/users/positions', [UserController::class, 'positions']);
        Route::get('/users/statistics', [UserController::class, 'statistics']);
        Route::get('/users/statuses', [UserController::class, 'statuses']);
        Route::post('/users/{id}/activate', [UserController::class, 'activate']);
        Route::apiResource('users', UserController::class);

        // Roles Management
        Route::get('/roles/permissions', [RoleController::class, 'getPermissions']);
        Route::get('/roles/statistics', [RoleController::class, 'statistics']);
        Route::apiResource('roles', RoleController::class);

        // Customers Management
        Route::apiResource('customers', CustomerController::class);
        Route::get('/customers/statistics', [CustomerController::class, 'statistics']);

        // Services Management
        Route::apiResource('services', ServiceController::class);
        Route::get('/services/statistics', [ServiceController::class, 'statistics']);

        // Products Management
        Route::apiResource('products', ProductController::class);
        Route::get('/products/statistics', [ProductController::class, 'statistics']);
        Route::get('/products/low-stock', [ProductController::class, 'lowStock']);

        // Categories Management
        Route::apiResource('categories', CategoryController::class);
        Route::post('/categories/update-order', [CategoryController::class, 'updateOrder']);

        // Orders Management
        Route::apiResource('orders', OrderController::class)->only(['index', 'show']);
        Route::post('/orders/{id}/update-status', [OrderController::class, 'updateStatus']);
        Route::post('/orders/{id}/update-payment-status', [OrderController::class, 'updatePaymentStatus']);
        Route::post('/orders/{id}/assign-staff', [OrderController::class, 'assignStaff']);
        Route::post('/orders/{id}/cancel', [OrderController::class, 'cancel']);
        Route::get('/orders/statistics', [OrderController::class, 'statistics']);

        // Warehouses Management
        Route::apiResource('warehouses', WarehouseController::class);
        Route::get('/warehouses/{id}/stocks', [WarehouseController::class, 'stocks']);
        Route::post('/warehouses/{id}/stocktake', [WarehouseController::class, 'stocktake']);
        Route::get('/warehouses/statistics', [WarehouseController::class, 'statistics']);

        // Providers Management
        Route::apiResource('providers', ProviderController::class);
        Route::post('/providers/{id}/update-rating', [ProviderController::class, 'updateRating']);
        Route::get('/providers/statistics', [ProviderController::class, 'statistics']);

        // Invoices Management
        Route::apiResource('invoices', InvoiceController::class)->only(['index', 'show']);
        Route::post('/invoices/{id}/update-status', [InvoiceController::class, 'updateStatus']);
        Route::post('/invoices/{id}/cancel', [InvoiceController::class, 'cancel']);
        Route::get('/invoices/statistics', [InvoiceController::class, 'statistics']);

        // Payments Management
        Route::apiResource('payments', PaymentController::class)->only(['index', 'show']);
        Route::post('/payments/{id}/confirm', [PaymentController::class, 'confirm']);
        Route::post('/payments/{id}/cancel', [PaymentController::class, 'cancel']);
        Route::get('/payments/statistics', [PaymentController::class, 'statistics']);

        // Partner Vehicle Handovers Management
        Route::prefix('partner-vehicle-handovers')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\Admin\PartnerVehicleHandoverController::class, 'index']);
            Route::post('/', [\App\Http\Controllers\Api\Admin\PartnerVehicleHandoverController::class, 'store']);
            Route::get('/{id}', [\App\Http\Controllers\Api\Admin\PartnerVehicleHandoverController::class, 'show']);
            Route::put('/{id}', [\App\Http\Controllers\Api\Admin\PartnerVehicleHandoverController::class, 'update']);
            Route::delete('/{id}', [\App\Http\Controllers\Api\Admin\PartnerVehicleHandoverController::class, 'destroy']);
            Route::post('/{id}/acknowledge', [\App\Http\Controllers\Api\Admin\PartnerVehicleHandoverController::class, 'acknowledge']);
        });

        // Settlements Management
        Route::prefix('settlements')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\Admin\SettlementController::class, 'index']);
            Route::post('/', [\App\Http\Controllers\Api\Admin\SettlementController::class, 'store']);
            Route::get('/{id}', [\App\Http\Controllers\Api\Admin\SettlementController::class, 'show']);
            Route::put('/{id}', [\App\Http\Controllers\Api\Admin\SettlementController::class, 'update']);
            Route::delete('/{id}', [\App\Http\Controllers\Api\Admin\SettlementController::class, 'destroy']);
            Route::post('/{id}/approve', [\App\Http\Controllers\Api\Admin\SettlementController::class, 'approve']);
        });
    });
});
