import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  // Public routes - KHÔNG có layout
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  route("products", "routes/products.tsx"),

  // Protected routes - TẤT CẢ dùng CHUNG 1 layout từ app/layouts
  layout("layouts/MainLayout.tsx", [
    // General dashboard - redirect logic
    route("dashboard", "routes/dashboard/_layout.tsx", [
      index("routes/dashboard/index.tsx"),
    ]),

    // Admin routes
    route("admin/dashboard", "routes/admin/dashboard.tsx"),
    route("admin/users", "routes/admin/users.tsx"),
    route("admin/customers", "routes/admin/customers.tsx"),
    route("admin/products", "routes/admin/products.tsx"),
    route("admin/services", "routes/admin/services.tsx"),
    route("admin/orders", "routes/admin/orders.tsx"),
    route("admin/invoices", "routes/admin/invoices.tsx"),
    route("admin/payments", "routes/admin/payments.tsx"),
    route("admin/roles", "routes/admin/roles.tsx"),
    route("admin/settings", "routes/admin/settings.tsx"),
    route("admin/warehouses", "routes/admin/warehouses.tsx"),
    route("admin/providers", "routes/admin/providers.tsx"),
    route("admin/vehicles", "routes/admin/vehicles.tsx"),
    route("admin/vehicle-handovers", "routes/admin/vehicle-handovers.tsx"),
    route("admin/stocks", "routes/admin/stocks.tsx"),
    route("admin/stock-transfers", "routes/admin/stock-transfers.tsx"),
    route("admin/settlements", "routes/admin/settlements.tsx"),
    route("admin/service-requests", "routes/admin/service-requests.tsx"),
    route("admin/reports", "routes/admin/reports.tsx"),

    // Manager routes
    route("manager/dashboard", "routes/manager/dashboard.tsx"),
    route("manager/orders", "routes/manager/orders.tsx"),
    route("manager/customers", "routes/manager/customers.tsx"),
    route("manager/inventory", "routes/manager/inventory.tsx"),
    route("manager/reports", "routes/manager/reports.tsx"),

    // Accountant routes
    route("accountant/dashboard", "routes/accountant/dashboard.tsx"),
    route("accountant/invoices", "routes/accountant/invoices.tsx"),
    route("accountant/payments", "routes/accountant/payments.tsx"),
    route("accountant/settlements", "routes/accountant/settlements.tsx"),
    route("accountant/reports", "routes/accountant/reports.tsx"),

    // Mechanic routes
    route("mechanic/dashboard", "routes/mechanic/dashboard.tsx"),
    route("mechanic/work-orders", "routes/mechanic/work-orders.tsx"),
    route("mechanic/service-requests", "routes/mechanic/service-requests.tsx"),

    // Employee routes
    route("employee/dashboard", "routes/employee/dashboard.tsx"),
    route("employee/tasks", "routes/employee/tasks.tsx"),

    // Common routes (tất cả users có thể truy cập)
    //route("profile", "routes/profile.tsx"),
    //route("settings", "routes/settings.tsx"),
  ]),
] satisfies RouteConfig;
