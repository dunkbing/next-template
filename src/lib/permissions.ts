/**
 * POS System Permissions
 *
 * This file defines all available permissions in the system.
 * Permissions follow the pattern: action:resource
 */

export const PERMISSIONS = {
  // User Management
  USER_CREATE: "create:User",
  USER_READ: "read:User",
  USER_UPDATE: "update:User",
  USER_DELETE: "delete:User",
  USER_INVITE: "invite:User",

  // Tenant Management
  TENANT_READ: "read:Tenant",
  TENANT_UPDATE: "update:Tenant",

  // Role Management
  ROLE_CREATE: "create:Role",
  ROLE_READ: "read:Role",
  ROLE_UPDATE: "update:Role",
  ROLE_DELETE: "delete:Role",

  // Dashboard
  DASHBOARD_READ: "read:Dashboard",

  // Settings
  SETTINGS_READ: "read:Settings",
  SETTINGS_UPDATE: "update:Settings",

  // Admin
  MANAGE_ALL: "manage:all",

  // --- POS Specific Permissions ---

  // Catalog Management
  CATALOG_CREATE: "create:Catalog",
  CATALOG_READ: "read:Catalog",
  CATALOG_UPDATE: "update:Catalog",
  CATALOG_DELETE: "delete:Catalog",

  // Product Management
  PRODUCT_CREATE: "create:Product",
  PRODUCT_READ: "read:Product",
  PRODUCT_UPDATE: "update:Product",
  PRODUCT_DELETE: "delete:Product",

  // Category Management
  CATEGORY_CREATE: "create:Category",
  CATEGORY_READ: "read:Category",
  CATEGORY_UPDATE: "update:Category",
  CATEGORY_DELETE: "delete:Category",

  // Inventory Management
  INVENTORY_READ: "read:Inventory",
  INVENTORY_ADJUST: "adjust:Inventory",
  INVENTORY_TRANSFER: "transfer:Inventory",

  // Purchase Orders
  PO_CREATE: "create:PurchaseOrder",
  PO_READ: "read:PurchaseOrder",
  PO_UPDATE: "update:PurchaseOrder",
  PO_DELETE: "delete:PurchaseOrder",
  PO_RECEIVE: "receive:PurchaseOrder",

  // Store Management
  STORE_CREATE: "create:Store",
  STORE_READ: "read:Store",
  STORE_UPDATE: "update:Store",
  STORE_DELETE: "delete:Store",

  // Register/POS
  REGISTER_OPEN: "open:Register",
  REGISTER_CLOSE: "close:Register",
  REGISTER_READ: "read:Register",

  // Sales
  SALE_CREATE: "create:Sale",
  SALE_READ: "read:Sale",
  SALE_UPDATE: "update:Sale",
  SALE_DELETE: "delete:Sale",
  SALE_REFUND: "refund:Sale",

  // Customer Management
  CUSTOMER_CREATE: "create:Customer",
  CUSTOMER_READ: "read:Customer",
  CUSTOMER_UPDATE: "update:Customer",
  CUSTOMER_DELETE: "delete:Customer",

  // Supplier Management
  SUPPLIER_CREATE: "create:Supplier",
  SUPPLIER_READ: "read:Supplier",
  SUPPLIER_UPDATE: "update:Supplier",
  SUPPLIER_DELETE: "delete:Supplier",

  // Reports
  REPORT_SALES: "read:SalesReport",
  REPORT_INVENTORY: "read:InventoryReport",
  REPORT_FINANCIAL: "read:FinancialReport",
  REPORT_XZ: "read:XZReport",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * Predefined role templates with common permission sets
 */
export const ROLE_TEMPLATES = {
  OWNER: {
    name: "Owner",
    description: "Full system access",
    permissions: [PERMISSIONS.MANAGE_ALL],
  },
  ADMIN: {
    name: "Admin",
    description: "Administrative access to all modules",
    permissions: [
      PERMISSIONS.DASHBOARD_READ,
      PERMISSIONS.USER_CREATE,
      PERMISSIONS.USER_READ,
      PERMISSIONS.USER_UPDATE,
      PERMISSIONS.USER_DELETE,
      PERMISSIONS.ROLE_CREATE,
      PERMISSIONS.ROLE_READ,
      PERMISSIONS.ROLE_UPDATE,
      PERMISSIONS.ROLE_DELETE,
      PERMISSIONS.CATALOG_CREATE,
      PERMISSIONS.CATALOG_READ,
      PERMISSIONS.CATALOG_UPDATE,
      PERMISSIONS.CATALOG_DELETE,
      PERMISSIONS.INVENTORY_READ,
      PERMISSIONS.INVENTORY_ADJUST,
      PERMISSIONS.INVENTORY_TRANSFER,
      PERMISSIONS.PO_CREATE,
      PERMISSIONS.PO_READ,
      PERMISSIONS.PO_UPDATE,
      PERMISSIONS.PO_DELETE,
      PERMISSIONS.PO_RECEIVE,
      PERMISSIONS.STORE_CREATE,
      PERMISSIONS.STORE_READ,
      PERMISSIONS.STORE_UPDATE,
      PERMISSIONS.STORE_DELETE,
      PERMISSIONS.REGISTER_OPEN,
      PERMISSIONS.REGISTER_CLOSE,
      PERMISSIONS.REGISTER_READ,
      PERMISSIONS.SALE_CREATE,
      PERMISSIONS.SALE_READ,
      PERMISSIONS.SALE_UPDATE,
      PERMISSIONS.SALE_REFUND,
      PERMISSIONS.CUSTOMER_CREATE,
      PERMISSIONS.CUSTOMER_READ,
      PERMISSIONS.CUSTOMER_UPDATE,
      PERMISSIONS.CUSTOMER_DELETE,
      PERMISSIONS.SUPPLIER_CREATE,
      PERMISSIONS.SUPPLIER_READ,
      PERMISSIONS.SUPPLIER_UPDATE,
      PERMISSIONS.SUPPLIER_DELETE,
      PERMISSIONS.REPORT_SALES,
      PERMISSIONS.REPORT_INVENTORY,
      PERMISSIONS.REPORT_FINANCIAL,
      PERMISSIONS.REPORT_XZ,
      PERMISSIONS.SETTINGS_READ,
      PERMISSIONS.SETTINGS_UPDATE,
    ],
  },
  MANAGER: {
    name: "Manager",
    description: "Store manager with inventory and reporting access",
    permissions: [
      PERMISSIONS.DASHBOARD_READ,
      PERMISSIONS.CATALOG_READ,
      PERMISSIONS.CATALOG_UPDATE,
      PERMISSIONS.INVENTORY_READ,
      PERMISSIONS.INVENTORY_ADJUST,
      PERMISSIONS.INVENTORY_TRANSFER,
      PERMISSIONS.PO_CREATE,
      PERMISSIONS.PO_READ,
      PERMISSIONS.PO_UPDATE,
      PERMISSIONS.PO_RECEIVE,
      PERMISSIONS.REGISTER_OPEN,
      PERMISSIONS.REGISTER_CLOSE,
      PERMISSIONS.REGISTER_READ,
      PERMISSIONS.SALE_CREATE,
      PERMISSIONS.SALE_READ,
      PERMISSIONS.SALE_REFUND,
      PERMISSIONS.CUSTOMER_CREATE,
      PERMISSIONS.CUSTOMER_READ,
      PERMISSIONS.CUSTOMER_UPDATE,
      PERMISSIONS.REPORT_SALES,
      PERMISSIONS.REPORT_INVENTORY,
      PERMISSIONS.REPORT_XZ,
    ],
  },
  CASHIER: {
    name: "Cashier",
    description: "POS operations and basic customer management",
    permissions: [
      PERMISSIONS.DASHBOARD_READ,
      PERMISSIONS.PRODUCT_READ,
      PERMISSIONS.REGISTER_OPEN,
      PERMISSIONS.REGISTER_CLOSE,
      PERMISSIONS.SALE_CREATE,
      PERMISSIONS.SALE_READ,
      PERMISSIONS.CUSTOMER_CREATE,
      PERMISSIONS.CUSTOMER_READ,
    ],
  },
  WAREHOUSE: {
    name: "Warehouse Staff",
    description: "Inventory and purchase order management",
    permissions: [
      PERMISSIONS.DASHBOARD_READ,
      PERMISSIONS.CATALOG_READ,
      PERMISSIONS.INVENTORY_READ,
      PERMISSIONS.INVENTORY_ADJUST,
      PERMISSIONS.INVENTORY_TRANSFER,
      PERMISSIONS.PO_READ,
      PERMISSIONS.PO_RECEIVE,
      PERMISSIONS.SUPPLIER_READ,
    ],
  },
} as const;

/**
 * Get all available permissions as an array
 */
export function getAllPermissions(): Permission[] {
  return Object.values(PERMISSIONS);
}

/**
 * Get permissions for a specific role template
 */
export function getRolePermissions(
  role: keyof typeof ROLE_TEMPLATES,
): Permission[] {
  return [...ROLE_TEMPLATES[role].permissions];
}

/**
 * Check if a permission is valid
 */
export function isValidPermission(
  permission: string,
): permission is Permission {
  return Object.values(PERMISSIONS).includes(permission as Permission);
}
