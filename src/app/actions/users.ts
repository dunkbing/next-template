"use server";

import { genSaltSync, hashSync } from "bcrypt-ts";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema/users";

export async function getUser(email: string) {
  return await db.query.users.findFirst({
    where: eq(users.email, email),
    with: {
      tenant: true,
      role: true,
    },
  });
}

export async function getUserById(id: number) {
  return await db.query.users.findFirst({
    where: eq(users.id, id),
    with: {
      tenant: true,
      role: true,
    },
  });
}

export async function createUser(data: {
  email: string;
  password: string;
  tenantId: number;
  roleId: number;
  name?: string;
  customPermissions?: string[];
}) {
  const salt = genSaltSync(10);
  const hash = hashSync(data.password, salt);

  const [user] = await db
    .insert(users)
    .values({
      email: data.email,
      password: hash,
      tenantId: data.tenantId,
      roleId: data.roleId,
      name: data.name,
      customPermissions: data.customPermissions || [],
    })
    .returning();

  return user;
}

export async function updateUserPermissions(
  userId: number,
  customPermissions: string[],
) {
  try {
    const [user] = await db
      .update(users)
      .set({
        customPermissions,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    return { success: true, user };
  } catch (error) {
    console.error("Error updating user permissions:", error);
    return { success: false, error: "Failed to update user permissions" };
  }
}

export async function getUsersByTenant(tenantId: number) {
  try {
    const tenantUsers = await db.query.users.findMany({
      where: eq(users.tenantId, tenantId),
      with: {
        role: true,
      },
      orderBy: (users, { desc }) => [desc(users.createdAt)],
    });

    return { success: true, users: tenantUsers };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: "Failed to fetch users" };
  }
}

export async function updateUserRole(userId: number, roleId: number) {
  try {
    const [user] = await db
      .update(users)
      .set({
        roleId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    return { success: true, user };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { success: false, error: "Failed to update user role" };
  }
}

export async function deleteUser(userId: number) {
  try {
    await db.delete(users).where(eq(users.id, userId));

    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: "Failed to delete user" };
  }
}
