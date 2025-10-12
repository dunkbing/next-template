"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";
import { i18n } from "@/lib/i18n/config";
import {
  type LoginUser,
  type RegisterUser,
} from "@/db/schema/users";
import { createRole, getAvailablePermissions } from "./roles";
import { createTenant, getTenantBySlug } from "./tenants";
import { createUser, getUser } from "./users";

export async function handleSignOut(formData: FormData) {
  const locale = (formData.get("locale") as string) || i18n.defaultLocale;
  await signOut({ redirectTo: `/${locale}` });
}

export async function login(data: LoginUser) {
  try {
    // const locale = data.locale || i18n.defaultLocale;
    await signIn("credentials", {
      // redirectTo: `/${locale}/dashboard`,
      email: data.email,
      password: data.password,
    });
    return { error: "" };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid credentials" };
    }
    throw error;
  }
}

export async function register(data: RegisterUser) {
  const { email, password, name, companyName } = data;
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
}
