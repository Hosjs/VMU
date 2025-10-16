import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  // ============================================
  // PUBLIC ROUTES - No Layout
  // ============================================
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  route("products", "routes/products.tsx"),

  // ============================================
  // PROTECTED ROUTES - Shared MainLayout
  // Permission-based routing (kiểm tra quyền trong component)
  // ============================================
  layout("layouts/MainLayout.tsx", [
    // ============================================
    // DASHBOARD - Role-specific dashboards
    // ============================================
    route("dashboard", "routes/dashboard/index.tsx"),

    // ============================================
    // MANAGEMENT MODULE - Quản lý hệ thống
    // ============================================
    route("management", "routes/management/index.tsx"),
    route("management/users", "routes/management/users.tsx"),
    route("management/roles", "routes/management/roles.tsx"),

    // ============================================
    // CUSTOMERS MODULE - Khách hàng
    // ============================================
    route("customers", "routes/customers/index.tsx"),
    route("customers/list", "routes/customers/list.tsx"),
    route("customers/vehicles", "routes/customers/vehicles.tsx"),

    // ============================================
    // SALES MODULE - Bán hàng
    // ============================================
    route("sales", "routes/sales/index.tsx"),
    route("sales/orders", "routes/sales/orders.tsx"),
    route("sales/service-requests", "routes/sales/service-requests.tsx"),

    // ============================================
    // FINANCIAL MODULE - Tài chính
    // ============================================
    route("financial", "routes/financial/index.tsx"),
    route("financial/invoices", "routes/financial/invoices.tsx"),
    route("financial/payments", "routes/financial/payments.tsx"),
    route("financial/settlements", "routes/financial/settlements.tsx"),

    // ============================================
    // INVENTORY MODULE - Kho
    // ============================================
    route("inventory", "routes/inventory/index.tsx"),
    route("inventory/products", "routes/inventory/products.tsx"),
    route("inventory/warehouses", "routes/inventory/warehouses.tsx"),

    // ============================================
    // PARTNERS MODULE - Đối tác
    // ============================================
    route("partners", "routes/partners/index.tsx"),
    route("partners/providers", "routes/partners/providers.tsx"),

    // ============================================
    // REPORTS MODULE - Báo cáo
    // ============================================
    route("reports", "routes/reports/index.tsx"),
    route("reports/dashboard", "routes/reports/dashboard.tsx"),
  ]),
] satisfies RouteConfig;
