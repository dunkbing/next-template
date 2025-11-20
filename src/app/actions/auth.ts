"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user, account } from "@/db/schema/auth";
import { roles } from "@/db/schema/roles";
import { tenants } from "@/db/schema/tenants";
import { auth } from "@/lib/auth";
import { i18n } from "@/lib/i18n/config";
import { type LoginUser, type RegisterUser } from "@/db/schema/auth";
import { getAvailablePermissions } from "./roles";
import { getTenantBySlug } from "./tenants";
import { getUserByEmail } from "./users";

export async function handleSignOut(formData: FormData) {
  const locale = (formData.get("locale") as string) || i18n.defaultLocale;

  // Clear Better Auth session cookie
  const cookieStore = await cookies();
  cookieStore.delete("better-auth.session_token");

  redirect(`/${locale}`);
}

export async function login(data: LoginUser) {
  try {
    const result = await auth.api.signInEmail({
      body: {
        email: data.email,
        password: data.password,
      },
    });

    if (!result) {
      return { error: "Invalid credentials" };
    }

    return { error: "" };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Invalid credentials" };
  }
}

export async function register(data: RegisterUser) {
  const { email, password, name, companyName } = data;
  const companySlug = companyName.toLowerCase().replace(/\s+/g, "-");

  let createdTenant: typeof tenants.$inferSelect | null = null;
  let createdRole: typeof roles.$inferSelect | null = null;
  let createdUserId: string | null = null;

  try {
    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return { error: "User with this email already exists" };
    }

    // Check if tenant already exists
    const existingTenant = await getTenantBySlug(companySlug);
    if (existingTenant.tenant) {
      return { error: "Company with this name already exists" };
    }

    // Step 1: Create tenant
    const [tenant] = await db
      .insert(tenants)
      .values({
        name: companyName,
        slug: companySlug,
      })
      .returning();

    if (!tenant) {
      throw new Error("Failed to create tenant");
    }
    createdTenant = tenant;

    // Step 2: Create default admin role with all permissions
    const allPermissions = await getAvailablePermissions();
    const [role] = await db
      .insert(roles)
      .values({
        tenantId: tenant.id,
        name: "Admin",
        description: "Administrator with full access",
        permissions: allPermissions,
      })
      .returning();

    if (!role) {
      throw new Error("Failed to create admin role");
    }
    createdRole = role;

    // Step 3: Use Better Auth API to create user with account (handles password hashing)
    const signUpResult = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });

    if (!signUpResult?.user) {
      throw new Error("Failed to create user account");
    }
    createdUserId = signUpResult.user.id;

    // Step 4: Update user with tenant and role information
    await db
      .update(user)
      .set({
        tenantId: tenant.id,
        roleId: role.id,
        customPermissions: "[]",
      })
      .where(eq(user.id, signUpResult.user.id));

    return { error: "" };
  } catch (error) {
    console.error("Registration error:", error);

    // Rollback: Clean up in reverse order
    try {
      // Delete account and user if created (Better Auth creates both)
      if (createdUserId) {
        // Delete account first (has foreign key to user)
        await db.delete(account).where(eq(account.userId, createdUserId));
        // Then delete user
        await db.delete(user).where(eq(user.id, createdUserId));
      }

      // Delete role if created
      if (createdRole) {
        await db.delete(roles).where(eq(roles.id, createdRole.id));
      }

      // Delete tenant if created
      if (createdTenant) {
        await db.delete(tenants).where(eq(tenants.id, createdTenant.id));
      }
    } catch (rollbackError) {
      console.error("Rollback error:", rollbackError);
    }

    return { error: "Failed to register. Please try again." };
  }
}
