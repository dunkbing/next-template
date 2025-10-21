import {
  AbilityBuilder,
  createMongoAbility,
  type MongoAbility,
} from "@casl/ability";
import type { Session } from "next-auth";

// Define your application resources/subjects
export type Subjects =
  | "User"
  | "Tenant"
  | "Role"
  | "Dashboard"
  | "Settings"
  | "Catalog"
  | "Product"
  | "Category"
  | "Inventory"
  | "PurchaseOrder"
  | "Store"
  | "Register"
  | "Sale"
  | "Customer"
  | "Supplier"
  | "SalesReport"
  | "InventoryReport"
  | "FinancialReport"
  | "XZReport"
  | "all";

// Define actions that can be performed
export type Actions =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "manage" // can do everything
  | "invite" // custom action for inviting users
  | "adjust" // for inventory adjustments
  | "transfer" // for inventory transfers
  | "receive" // for receiving purchase orders
  | "open" // for opening register
  | "close" // for closing register
  | "refund"; // for refunding sales

// Define the Ability type
export type AppAbility = MongoAbility<[Actions, Subjects]>;

// Define ability builder function
export function defineAbilityFor(permissions: string[]): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  // Parse permissions and define abilities
  for (const permission of permissions) {
    const [action, subject] = permission.split(":");
    if (action && subject) {
      can(action as Actions, subject as Subjects);
    }
  }

  return build();
}

// Helper to get user permissions (role permissions + custom permissions)
export function getUserPermissions(
  rolePermissions: string[],
  customPermissions: string[],
): string[] {
  // Merge role permissions with custom permissions
  // Custom permissions override role permissions
  const allPermissions = new Set([...rolePermissions, ...customPermissions]);
  return Array.from(allPermissions);
}

// Helper to build ability from session
export function abilityFromSession(session: Session): AppAbility {
  const permissions = session.user?.permissions || [];
  return defineAbilityFor(permissions);
}
