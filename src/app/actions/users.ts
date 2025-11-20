"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema/auth";

export async function getUserByEmail(email: string) {
  return await db.query.user.findFirst({
    where: eq(user.email, email),
    with: {
      tenant: true,
      role: true,
    },
  });
}

export async function getUserById(id: string) {
  return await db.query.user.findFirst({
    where: eq(user.id, id),
    with: {
      tenant: true,
      role: true,
    },
  });
}

// Note: User creation is now handled by Better Auth
// Use auth.api.signUpEmail() to create users
// Then update with tenant/role info using auth.api.updateUser()

export async function updateUserPermissions(
  userId: string,
  customPermissions: string[],
) {
  try {
    const [updatedUser] = await db
      .update(user)
      .set({
        customPermissions: JSON.stringify(customPermissions),
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId))
      .returning();

    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Error updating user permissions:", error);
    return { success: false, error: "Failed to update user permissions" };
  }
}

export async function getUsersByTenant(tenantId: number) {
  try {
    const tenantUsers = await db.query.user.findMany({
      where: eq(user.tenantId, tenantId),
      with: {
        role: true,
      },
      orderBy: (user, { desc }) => [desc(user.createdAt)],
    });

    return { success: true, users: tenantUsers };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: "Failed to fetch users" };
  }
}

export async function updateUserRole(userId: string, roleId: number) {
  try {
    const [updatedUser] = await db
      .update(user)
      .set({
        roleId,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId))
      .returning();

    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { success: false, error: "Failed to update user role" };
  }
}

export async function deleteUser(userId: string) {
  try {
    await db.delete(user).where(eq(user.id, userId));

    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: "Failed to delete user" };
  }
}
