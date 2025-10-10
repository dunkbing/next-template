"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { createUser, getUser } from "./users";
import { createTenant, getTenantBySlug } from "./tenants";
import { createRole, getAvailablePermissions } from "./roles";

export async function handleSignOut() {
  await signOut({ redirectTo: "/" });
}

export async function login(_prevState: { error: string }, formData: FormData) {
  try {
    await signIn("credentials", {
      redirectTo: "/dashboard",
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });
    return { error: "" };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid credentials" };
    }
    throw error;
  }
}

export async function register(
  _prevState: { error: string },
  formData: FormData,
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  const companyName = formData.get("companyName") as string;
  const companySlug = companyName.toLowerCase().replace(/\s+/g, "-");

  // Check if user already exists
  const existingUser = await getUser(email);
  if (existingUser) {
    return { error: "User with this email already exists" };
  }

  // Check if tenant already exists
  const existingTenant = await getTenantBySlug(companySlug);
  if (existingTenant.tenant) {
    return { error: "Company with this name already exists" };
  }

  // Create tenant
  const tenantResult = await createTenant({
    name: companyName,
    slug: companySlug,
  });

  if (!tenantResult.success || !tenantResult.tenant) {
    return { error: "Failed to create company" };
  }

  // Create default admin role with all permissions
  const allPermissions = await getAvailablePermissions();
  const roleResult = await createRole({
    tenantId: tenantResult.tenant.id,
    name: "Admin",
    description: "Administrator with full access",
    permissions: allPermissions,
  });

  if (!roleResult.success || !roleResult.role) {
    return { error: "Failed to create admin role" };
  }

  // Create user with admin role
  await createUser({
    email,
    password,
    name,
    tenantId: tenantResult.tenant.id,
    roleId: roleResult.role.id,
    customPermissions: [],
  });

  redirect("/login");
}
