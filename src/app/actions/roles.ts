"use server";

import { db } from "@/db";
import { roles } from "@/db/schema/roles";
import { eq } from "drizzle-orm";

export async function createRole(data: {
  tenantId: number;
  name: string;
  description?: string;
  permissions: string[];
}) {
  try {
    const [role] = await db
      .insert(roles)
      .values({
        tenantId: data.tenantId,
        name: data.name,
        description: data.description,
        permissions: data.permissions,
      })
      .returning();

    return { success: true, role };
  } catch (error) {
    console.error("Error creating role:", error);
    return { success: false, error: "Failed to create role" };
  }
}

export async function getRoleById(id: number) {
  try {
    const role = await db.query.roles.findFirst({
      where: eq(roles.id, id),
    });

    return { success: true, role };
  } catch (error) {
    console.error("Error fetching role:", error);
    return { success: false, error: "Failed to fetch role" };
  }
}

export async function getRolesByTenant(tenantId: number) {
  try {
    const tenantRoles = await db.query.roles.findMany({
      where: eq(roles.tenantId, tenantId),
      orderBy: (roles, { asc }) => [asc(roles.name)],
    });

    return { success: true, roles: tenantRoles };
  } catch (error) {
    console.error("Error fetching roles:", error);
    return { success: false, error: "Failed to fetch roles" };
  }
}

export async function updateRole(
  id: number,
  data: {
    name?: string;
    description?: string;
    permissions?: string[];
  },
) {
  try {
    const [role] = await db
      .update(roles)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(roles.id, id))
      .returning();

    return { success: true, role };
  } catch (error) {
    console.error("Error updating role:", error);
    return { success: false, error: "Failed to update role" };
  }
}

export async function deleteRole(id: number) {
  try {
    await db.delete(roles).where(eq(roles.id, id));

    return { success: true };
  } catch (error) {
    console.error("Error deleting role:", error);
    return { success: false, error: "Failed to delete role" };
  }
}

// Helper function to get available permissions
export async function getAvailablePermissions(): Promise<string[]> {
  return [
    // User permissions
    "create:User",
    "read:User",
    "update:User",
    "delete:User",
    "invite:User",
    // Tenant permissions
    "read:Tenant",
    "update:Tenant",
    // Role permissions
    "create:Role",
    "read:Role",
    "update:Role",
    "delete:Role",
    // Dashboard permissions
    "read:Dashboard",
    // Settings permissions
    "read:Settings",
    "update:Settings",
    // Manage all (admin)
    "manage:all",
  ];
}
