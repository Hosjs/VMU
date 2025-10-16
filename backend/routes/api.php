<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

// Management (Quản lý hệ thống)
use App\Http\Controllers\Api\Management\Users\UserController;
use App\Http\Controllers\Api\Management\Roles\RoleController;

// Customer (Khách hàng)
use App\Http\Controllers\Api\Customer\CustomerController;
use App\Http\Controllers\Api\Customer\VehicleController;

// Sales (Bán hàng)
use App\Http\Controllers\Api\Sales\OrderController;
use App\Http\Controllers\Api\Sales\ServiceRequestController;

// Financial (Tài chính)
use App\Http\Controllers\Api\Financial\InvoiceController;
use App\Http\Controllers\Api\Financial\PaymentController;
use App\Http\Controllers\Api\Financial\SettlementController;

// Inventory (Kho)
use App\Http\Controllers\Api\Inventory\ProductController;
use App\Http\Controllers\Api\Inventory\WarehouseController;

// Partners (Đối tác)
use App\Http\Controllers\Api\Partners\ProviderController;
use App\Http\Controllers\Api\Partners\PartnerVehicleHandoverController;

// Reports (Báo cáo)
use App\Http\Controllers\Api\Reports\DashboardController;

// Common
use App\Http\Controllers\Api\Common\BadgeController;
use App\Http\Controllers\NotificationController;

/*
|--------------------------------------------------------------------------
| API Routes - Permission-Based Structure
|--------------------------------------------------------------------------
| Cấu trúc mới: Routes theo nghiệp vụ, permissions kiểm soát truy cập
*/

// =====================
// PUBLIC AUTH ROUTES
// =====================
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// =====================
// PROTECTED ROUTES
// =====================
Route::middleware('auth:api')->group(function () {

    // Auth
    Route::prefix('auth')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::get('/permissions', [AuthController::class, 'permissions']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/refresh', [AuthController::class, 'refresh']);
        Route::post('/change-password', [AuthController::class, 'changePassword']);
    });

    // Notifications
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::get('/unread-count', [NotificationController::class, 'unreadCount']);
        Route::post('/{id}/mark-as-read', [NotificationController::class, 'markAsRead']);
        Route::post('/mark-all-as-read', [NotificationController::class, 'markAllAsRead']);
        Route::delete('/{id}', [NotificationController::class, 'destroy']);
    });

    // Badge Counts
    Route::get('/badges/counts', [BadgeController::class, 'getCounts']);

    // =====================
    // MANAGEMENT - Quản lý hệ thống
    // =====================
    Route::prefix('management')->group(function () {

        // Users
        Route::middleware('permission:users.view')->group(function () {
            Route::get('/users', [UserController::class, 'index']);
            Route::get('/users/departments', [UserController::class, 'departments']);
            Route::get('/users/positions', [UserController::class, 'positions']);
            Route::get('/users/statistics', [UserController::class, 'statistics']);
            Route::get('/users/{id}', [UserController::class, 'show']);
        });
        Route::post('/users', [UserController::class, 'store'])->middleware('permission:users.create');
        Route::put('/users/{id}', [UserController::class, 'update'])->middleware('permission:users.edit');
        Route::delete('/users/{id}', [UserController::class, 'destroy'])->middleware('permission:users.delete');
        Route::post('/users/{id}/activate', [UserController::class, 'activate'])->middleware('permission:users.activate');

        // Roles
        Route::middleware('permission:roles.view')->group(function () {
            Route::get('/roles', [RoleController::class, 'index']);
            Route::get('/roles/{id}', [RoleController::class, 'show']);
        });
        Route::post('/roles', [RoleController::class, 'store'])->middleware('permission:roles.create');
        Route::put('/roles/{id}', [RoleController::class, 'update'])->middleware('permission:roles.edit');
        Route::delete('/roles/{id}', [RoleController::class, 'destroy'])->middleware('permission:roles.delete');
    });

    // =====================
    // CUSTOMERS - Khách hàng
    // =====================
    Route::prefix('customers')->group(function () {
        Route::get('/', [CustomerController::class, 'index'])->middleware('permission:customers.view');
        Route::get('/statistics', [CustomerController::class, 'statistics'])->middleware('permission:customers.view');
        Route::get('/{id}', [CustomerController::class, 'show'])->middleware('permission:customers.view');
        Route::post('/', [CustomerController::class, 'store'])->middleware('permission:customers.create');
        Route::put('/{id}', [CustomerController::class, 'update'])->middleware('permission:customers.edit');
        Route::delete('/{id}', [CustomerController::class, 'destroy'])->middleware('permission:customers.delete');
    });

    // Vehicles
    Route::prefix('vehicles')->group(function () {
        Route::get('/', [VehicleController::class, 'index'])->middleware('permission:vehicles.view');
        Route::get('/{id}', [VehicleController::class, 'show'])->middleware('permission:vehicles.view');
        Route::post('/', [VehicleController::class, 'store'])->middleware('permission:vehicles.create');
        Route::put('/{id}', [VehicleController::class, 'update'])->middleware('permission:vehicles.edit');
        Route::delete('/{id}', [VehicleController::class, 'destroy'])->middleware('permission:vehicles.delete');
    });

    // =====================
    // SALES - Bán hàng
    // =====================
    Route::prefix('sales')->group(function () {

        // Orders
        Route::middleware('permission:orders.view')->group(function () {
            Route::get('/orders', [OrderController::class, 'index']);
            Route::get('/orders/statistics', [OrderController::class, 'statistics']);
            Route::get('/orders/{id}', [OrderController::class, 'show']);
        });
        Route::post('/orders/{id}/status', [OrderController::class, 'updateStatus'])
            ->middleware('permission:orders.edit,orders.approve');
        Route::post('/orders/{id}/assign', [OrderController::class, 'assignStaff'])
            ->middleware('permission:orders.assign');
        Route::post('/orders/{id}/cancel', [OrderController::class, 'cancel'])
            ->middleware('permission:orders.cancel');
    });

    // =====================
    // FINANCIAL - Tài chính
    // =====================
    Route::prefix('financial')->group(function () {

        // Invoices
        Route::middleware('permission:invoices.view')->group(function () {
            Route::get('/invoices', [InvoiceController::class, 'index']);
            Route::get('/invoices/statistics', [InvoiceController::class, 'statistics']);
            Route::get('/invoices/{id}', [InvoiceController::class, 'show']);
        });
        Route::post('/invoices/{id}/status', [InvoiceController::class, 'updateStatus'])
            ->middleware('permission:invoices.edit,invoices.approve');
        Route::post('/invoices/{id}/cancel', [InvoiceController::class, 'cancel'])
            ->middleware('permission:invoices.cancel');

        // Payments
        Route::middleware('permission:payments.view')->group(function () {
            Route::get('/payments', [PaymentController::class, 'index']);
            Route::get('/payments/statistics', [PaymentController::class, 'statistics']);
            Route::get('/payments/{id}', [PaymentController::class, 'show']);
        });
        Route::post('/payments/{id}/confirm', [PaymentController::class, 'confirm'])
            ->middleware('permission:payments.confirm');
        Route::post('/payments/{id}/cancel', [PaymentController::class, 'cancel'])
            ->middleware('permission:payments.edit');

        // Settlements
        Route::middleware('permission:settlements.view')->group(function () {
            Route::get('/settlements', [SettlementController::class, 'index']);
            Route::get('/settlements/{id}', [SettlementController::class, 'show']);
        });
        Route::post('/settlements', [SettlementController::class, 'store'])
            ->middleware('permission:settlements.create');
        Route::post('/settlements/{id}/approve', [SettlementController::class, 'approve'])
            ->middleware('permission:settlements.approve');
    });

    // =====================
    // INVENTORY - Kho
    // =====================
    Route::prefix('inventory')->group(function () {

        // Products
        Route::middleware('permission:products.view')->group(function () {
            Route::get('/products', [ProductController::class, 'index']);
            Route::get('/products/low-stock', [ProductController::class, 'lowStock']);
            Route::get('/products/{id}', [ProductController::class, 'show']);
        });
        Route::post('/products', [ProductController::class, 'store'])->middleware('permission:products.create');
        Route::put('/products/{id}', [ProductController::class, 'update'])->middleware('permission:products.edit');
        Route::delete('/products/{id}', [ProductController::class, 'destroy'])->middleware('permission:products.delete');

        // Warehouses
        Route::middleware('permission:warehouses.view')->group(function () {
            Route::get('/warehouses', [WarehouseController::class, 'index']);
            Route::get('/warehouses/{id}', [WarehouseController::class, 'show']);
        });
        Route::post('/warehouses', [WarehouseController::class, 'store'])->middleware('permission:warehouses.create');
        Route::put('/warehouses/{id}', [WarehouseController::class, 'update'])->middleware('permission:warehouses.edit');
    });

    // =====================
    // REPORTS - Báo cáo & Dashboard
    // =====================
    Route::prefix('reports')->group(function () {
        Route::get('/dashboard/overview', [DashboardController::class, 'overview'])
            ->middleware('permission:dashboard.view');
        Route::get('/revenue', [DashboardController::class, 'revenueReport'])
            ->middleware('permission:reports.financial');
        Route::get('/profit', [DashboardController::class, 'profitReport'])
            ->middleware('permission:reports.financial');
        Route::get('/top-customers', [DashboardController::class, 'topCustomers'])
            ->middleware('permission:dashboard.view');
    });

    // =====================
    // PARTNERS - Đối tác
    // =====================
    Route::prefix('partners')->group(function () {

        // Providers
        Route::middleware('permission:providers.view')->group(function () {
            Route::get('/providers', [ProviderController::class, 'index']);
            Route::get('/providers/statistics', [ProviderController::class, 'statistics']);
            Route::get('/providers/{id}', [ProviderController::class, 'show']);
        });
        Route::post('/providers', [ProviderController::class, 'store'])->middleware('permission:providers.create');
        Route::put('/providers/{id}', [ProviderController::class, 'update'])->middleware('permission:providers.edit');
        Route::delete('/providers/{id}', [ProviderController::class, 'destroy'])->middleware('permission:providers.delete');
        Route::post('/providers/{id}/update-rating', [ProviderController::class, 'updateRating'])
            ->middleware('permission:providers.edit');

        // Partner Vehicle Handovers
        Route::middleware('permission:orders.view')->group(function () {
            Route::get('/vehicle-handovers', [PartnerVehicleHandoverController::class, 'index']);
            Route::get('/vehicle-handovers/{id}', [PartnerVehicleHandoverController::class, 'show']);
        });
        Route::post('/vehicle-handovers', [PartnerVehicleHandoverController::class, 'store'])
            ->middleware('permission:orders.edit');
        Route::put('/vehicle-handovers/{id}', [PartnerVehicleHandoverController::class, 'update'])
            ->middleware('permission:orders.edit');
        Route::delete('/vehicle-handovers/{id}', [PartnerVehicleHandoverController::class, 'destroy'])
            ->middleware('permission:orders.delete');
        Route::post('/vehicle-handovers/{id}/acknowledge', [PartnerVehicleHandoverController::class, 'acknowledge'])
            ->middleware('permission:orders.edit');
    });
});
