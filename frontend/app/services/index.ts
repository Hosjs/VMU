/**
 * ============================================
 * SERVICES EXPORT - MODULE BASED
 * ============================================
 * Export services từ các modules nghiệp vụ
 *
 * Structure:
 * - api.service.ts: HTTP Client (core)
 * - auth.service.ts: Authentication
 * - Management/: Users, Roles
 * - Customer/: Customers, Vehicles
 * - Sales/: Orders, Services
 * - Financial/: Invoices, Payments, Settlements
 * - Inventory/: Products, Warehouses
 * - Partners/: Providers
 * - Reports/: Dashboard, Reports
 * - Common/: Badges, Notifications
 */

// ============================================
// CORE SERVICES (Infrastructure)
// ============================================
export * from './api.service';
export * from './auth.service';

// ============================================
// MODULE SERVICES (Business Logic)
// ============================================
export * from './Management';
export * from './Customer';
export * from './Sales';
export * from './Financial';
export * from './Inventory';
export * from './Partners';
export * from './Reports';
export * from './Common';
