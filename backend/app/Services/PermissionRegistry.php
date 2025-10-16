<?php

namespace App\Services;

/**
 * Permission Registry Service
 * Quản lý tập trung tất cả permissions trong hệ thống
 * Mapping giữa permissions và roles để dễ quản lý
 */
class PermissionRegistry
{
    /**
     * Tất cả permissions có sẵn trong hệ thống
     * Format: resource.action
     */
    public const PERMISSIONS = [
        // User Management
        'users.view' => 'Xem danh sách người dùng',
        'users.create' => 'Tạo người dùng mới',
        'users.edit' => 'Chỉnh sửa người dùng',
        'users.delete' => 'Xóa người dùng',
        'users.activate' => 'Kích hoạt/vô hiệu hóa người dùng',

        // Role Management
        'roles.view' => 'Xem danh sách vai trò',
        'roles.create' => 'Tạo vai trò mới',
        'roles.edit' => 'Chỉnh sửa vai trò',
        'roles.delete' => 'Xóa vai trò',

        // Customer Management
        'customers.view' => 'Xem danh sách khách hàng',
        'customers.create' => 'Tạo khách hàng mới',
        'customers.edit' => 'Chỉnh sửa khách hàng',
        'customers.delete' => 'Xóa khách hàng',

        // Vehicle Management
        'vehicles.view' => 'Xem danh sách phương tiện',
        'vehicles.create' => 'Tạo phương tiện mới',
        'vehicles.edit' => 'Chỉnh sửa phương tiện',
        'vehicles.delete' => 'Xóa phương tiện',

        // Product Management
        'products.view' => 'Xem danh sách sản phẩm',
        'products.create' => 'Tạo sản phẩm mới',
        'products.edit' => 'Chỉnh sửa sản phẩm',
        'products.delete' => 'Xóa sản phẩm',

        // Service Management
        'services.view' => 'Xem danh sách dịch vụ',
        'services.create' => 'Tạo dịch vụ mới',
        'services.edit' => 'Chỉnh sửa dịch vụ',
        'services.delete' => 'Xóa dịch vụ',

        // Category Management
        'categories.view' => 'Xem danh mục',
        'categories.create' => 'Tạo danh mục',
        'categories.edit' => 'Chỉnh sửa danh mục',
        'categories.delete' => 'Xóa danh mục',

        // Order Management
        'orders.view' => 'Xem danh sách đơn hàng',
        'orders.create' => 'Tạo đơn hàng mới',
        'orders.edit' => 'Chỉnh sửa đơn hàng',
        'orders.delete' => 'Xóa đơn hàng',
        'orders.approve' => 'Phê duyệt đơn hàng',
        'orders.cancel' => 'Hủy đơn hàng',
        'orders.assign' => 'Phân công nhân viên',
        'orders.manage_all' => 'Quản lý tất cả đơn hàng',
        'orders.manage_own' => 'Quản lý đơn hàng được giao',

        // Invoice Management
        'invoices.view' => 'Xem danh sách hóa đơn',
        'invoices.create' => 'Tạo hóa đơn',
        'invoices.edit' => 'Chỉnh sửa hóa đơn',
        'invoices.delete' => 'Xóa hóa đơn',
        'invoices.approve' => 'Phê duyệt hóa đơn',
        'invoices.cancel' => 'Hủy hóa đơn',

        // Payment Management
        'payments.view' => 'Xem danh sách thanh toán',
        'payments.create' => 'Tạo thanh toán',
        'payments.edit' => 'Chỉnh sửa thanh toán',
        'payments.delete' => 'Xóa thanh toán',
        'payments.confirm' => 'Xác nhận thanh toán',
        'payments.verify' => 'Xác minh thanh toán',

        // Settlement Management
        'settlements.view' => 'Xem danh sách đối soát',
        'settlements.create' => 'Tạo đối soát',
        'settlements.edit' => 'Chỉnh sửa đối soát',
        'settlements.delete' => 'Xóa đối soát',
        'settlements.approve' => 'Phê duyệt đối soát',

        // Warehouse Management
        'warehouses.view' => 'Xem danh sách kho',
        'warehouses.create' => 'Tạo kho',
        'warehouses.edit' => 'Chỉnh sửa kho',
        'warehouses.delete' => 'Xóa kho',
        'warehouses.stocktake' => 'Kiểm kê kho',

        // Stock Management
        'stocks.view' => 'Xem tồn kho',
        'stocks.create' => 'Tạo phiếu xuất/nhập kho',
        'stocks.edit' => 'Chỉnh sửa phiếu xuất/nhập',
        'stocks.delete' => 'Xóa phiếu xuất/nhập',
        'stocks.transfer' => 'Chuyển kho',

        // Provider Management
        'providers.view' => 'Xem danh sách nhà cung cấp',
        'providers.create' => 'Tạo nhà cung cấp',
        'providers.edit' => 'Chỉnh sửa nhà cung cấp',
        'providers.delete' => 'Xóa nhà cung cấp',

        // Service Request Management
        'service_requests.view' => 'Xem yêu cầu dịch vụ',
        'service_requests.create' => 'Tạo yêu cầu dịch vụ',
        'service_requests.edit' => 'Chỉnh sửa yêu cầu',
        'service_requests.delete' => 'Xóa yêu cầu',
        'service_requests.approve' => 'Phê duyệt yêu cầu',
        'service_requests.assign' => 'Phân công yêu cầu',
        'service_requests.manage_all' => 'Quản lý tất cả yêu cầu',
        'service_requests.manage_own' => 'Quản lý yêu cầu được giao',

        // Reports
        'reports.view' => 'Xem báo cáo',
        'reports.export' => 'Xuất báo cáo',
        'reports.financial' => 'Báo cáo tài chính',
        'reports.inventory' => 'Báo cáo tồn kho',
        'reports.operations' => 'Báo cáo vận hành',

        // Dashboard
        'dashboard.view' => 'Xem dashboard',
        'dashboard.overview' => 'Tổng quan hệ thống',
        'dashboard.statistics' => 'Thống kê chi tiết',

        // Settings
        'settings.view' => 'Xem cài đặt',
        'settings.edit' => 'Chỉnh sửa cài đặt',
        'settings.system' => 'Cài đặt hệ thống',
    ];

    /**
     * Permissions mặc định cho từng role
     */
    public const ROLE_PERMISSIONS = [
        'admin' => [
            // Admin có tất cả quyền (sẽ check trong code)
            '*'
        ],

        'manager' => [
            // Dashboard & Reports
            'dashboard.view',
            'dashboard.overview',
            'dashboard.statistics',
            'reports.view',
            'reports.export',
            'reports.operations',

            // User Management (limited)
            'users.view',
            'users.edit',

            // Customer & Vehicle
            'customers.*',
            'vehicles.*',

            // Orders - Full access
            'orders.*',
            'service_requests.*',

            // Products & Services
            'products.view',
            'products.edit',
            'services.view',
            'services.edit',

            // Invoices - View & approve
            'invoices.view',
            'invoices.approve',

            // Warehouse - View
            'warehouses.view',
            'stocks.view',
            'providers.view',
        ],

        'accountant' => [
            // Dashboard - Limited
            'dashboard.view',
            'dashboard.overview',

            // Financial Reports
            'reports.view',
            'reports.financial',

            // Orders - View only
            'orders.view',

            // Invoices - Full access
            'invoices.*',

            // Payments - Full access
            'payments.*',

            // Settlements - Full access
            'settlements.*',

            // Customers - View for invoicing
            'customers.view',

            // Products & Services - View for pricing
            'products.view',
            'services.view',
        ],

        'mechanic' => [
            // Dashboard - Basic
            'dashboard.view',

            // Orders - View own assigned
            'orders.view',
            'orders.manage_own',

            // Service Requests - Manage assigned
            'service_requests.view',
            'service_requests.manage_own',

            // Customers & Vehicles - View
            'customers.view',
            'vehicles.view',

            // Products - View for parts
            'products.view',

            // Services - View
            'services.view',

            // Warehouse - View stock
            'stocks.view',
        ],

        'employee' => [
            // Dashboard - Basic
            'dashboard.view',

            // Customers - Full access
            'customers.*',
            'vehicles.*',

            // Orders - Limited
            'orders.view',
            'orders.create',
            'orders.manage_own',

            // Service Requests
            'service_requests.view',
            'service_requests.create',
            'service_requests.manage_own',

            // Products & Services - View
            'products.view',
            'services.view',

            // Invoices - View
            'invoices.view',
        ],
    ];

    /**
     * Permissions theo module để dễ quản lý
     */
    public const MODULES = [
        'users' => ['view', 'create', 'edit', 'delete', 'activate'],
        'roles' => ['view', 'create', 'edit', 'delete'],
        'customers' => ['view', 'create', 'edit', 'delete'],
        'vehicles' => ['view', 'create', 'edit', 'delete'],
        'products' => ['view', 'create', 'edit', 'delete'],
        'services' => ['view', 'create', 'edit', 'delete'],
        'categories' => ['view', 'create', 'edit', 'delete'],
        'orders' => ['view', 'create', 'edit', 'delete', 'approve', 'cancel', 'assign', 'manage_all', 'manage_own'],
        'invoices' => ['view', 'create', 'edit', 'delete', 'approve', 'cancel'],
        'payments' => ['view', 'create', 'edit', 'delete', 'confirm', 'verify'],
        'settlements' => ['view', 'create', 'edit', 'delete', 'approve'],
        'warehouses' => ['view', 'create', 'edit', 'delete', 'stocktake'],
        'stocks' => ['view', 'create', 'edit', 'delete', 'transfer'],
        'providers' => ['view', 'create', 'edit', 'delete'],
        'service_requests' => ['view', 'create', 'edit', 'delete', 'approve', 'assign', 'manage_all', 'manage_own'],
        'reports' => ['view', 'export', 'financial', 'inventory', 'operations'],
        'dashboard' => ['view', 'overview', 'statistics'],
        'settings' => ['view', 'edit', 'system'],
    ];

    /**
     * Lấy tất cả permissions
     */
    public static function getAllPermissions(): array
    {
        return self::PERMISSIONS;
    }

    /**
     * Lấy permissions theo role
     */
    public static function getPermissionsByRole(string $roleName): array
    {
        return self::ROLE_PERMISSIONS[$roleName] ?? [];
    }

    /**
     * Expand wildcard permissions
     * Ví dụ: 'users.*' => ['users.view', 'users.create', 'users.edit', 'users.delete']
     */
    public static function expandWildcardPermissions(array $permissions): array
    {
        $expanded = [];

        foreach ($permissions as $permission) {
            if ($permission === '*') {
                // All permissions
                $expanded = array_merge($expanded, array_keys(self::PERMISSIONS));
            } elseif (str_ends_with($permission, '.*')) {
                // Module wildcard
                $module = substr($permission, 0, -2);
                if (isset(self::MODULES[$module])) {
                    foreach (self::MODULES[$module] as $action) {
                        $expanded[] = "{$module}.{$action}";
                    }
                }
            } else {
                $expanded[] = $permission;
            }
        }

        return array_unique($expanded);
    }

    /**
     * Validate permission format
     */
    public static function isValidPermission(string $permission): bool
    {
        // Wildcard
        if ($permission === '*' || str_ends_with($permission, '.*')) {
            return true;
        }

        // Check if exists in registry
        return isset(self::PERMISSIONS[$permission]);
    }

    /**
     * Lấy danh sách modules
     */
    public static function getModules(): array
    {
        return array_keys(self::MODULES);
    }

    /**
     * Lấy actions của một module
     */
    public static function getModuleActions(string $module): array
    {
        return self::MODULES[$module] ?? [];
    }
}

