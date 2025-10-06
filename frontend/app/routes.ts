import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // Public routes
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  route("services", "routes/services.tsx"),
  route("products", "routes/products.tsx"),
  route("about", "routes/about.tsx"),
  route("contact", "routes/contact.tsx"),

  // Protected: General dashboard (all authenticated users)
  route("dashboard", "routes/dashboard/index.tsx"),
  
  // Protected: Admin routes
  route("admin", "routes/admin/layout.tsx", [
    route("dashboard", "routes/admin/dashboard.tsx"),
    route("users", "routes/admin/users.tsx"),
    route("roles", "routes/admin/roles.tsx"),
    route("settings", "routes/admin/settings.tsx"),
  ]),
  
  // Protected: Manager routes
  route("manager", "routes/manager/layout.tsx", [
    route("dashboard", "routes/manager/dashboard.tsx"),
    route("orders", "routes/manager/orders.tsx"),
    route("customers", "routes/manager/customers.tsx"),
    route("inventory", "routes/manager/inventory.tsx"),
    route("reports", "routes/manager/reports.tsx"),
  ]),
  
  // Protected: Accountant routes
  route("accountant", "routes/accountant/layout.tsx", [
    route("dashboard", "routes/accountant/dashboard.tsx"),
    route("invoices", "routes/accountant/invoices.tsx"),
    route("payments", "routes/accountant/payments.tsx"),
    route("settlements", "routes/accountant/settlements.tsx"),
    route("reports", "routes/accountant/reports.tsx"),
  ]),
  
  // Protected: Mechanic routes
  route("mechanic", "routes/mechanic/layout.tsx", [
    route("dashboard", "routes/mechanic/dashboard.tsx"),
    route("work-orders", "routes/mechanic/work-orders.tsx"),
    route("service-requests", "routes/mechanic/service-requests.tsx"),
  ]),
  
  // Protected: Employee routes
  route("employee", "routes/employee/layout.tsx", [
    route("dashboard", "routes/employee/dashboard.tsx"),
    route("tasks", "routes/employee/tasks.tsx"),
    route("customers", "routes/employee/customers.tsx"),
  ]),
] satisfies RouteConfig;
