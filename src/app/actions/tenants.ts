"use server";

import { db } from "@/db";
import { tenants } from "@/db/schema/tenants";
import { eq } from "drizzle-orm";

export async function createTenant(data: { name: string; slug: string }) {
  try {
    const [tenant] = await db
      .insert(tenants)
      .values({
        name: data.name,
        slug: data.slug,
      })
      .returning();

    return { success: true, tenant };
  } catch (error) {
    console.error("Error creating tenant:", error);
    return { success: false, error: "Failed to create tenant" };
  }
}

export async function getTenantById(id: number) {
  try {
    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.id, id),
    });

    return { success: true, tenant };
  } catch (error) {
    console.error("Error fetching tenant:", error);
    return { success: false, error: "Failed to fetch tenant" };
  }
}

export async function getTenantBySlug(slug: string) {
  try {
    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.slug, slug),
    });

    return { success: true, tenant };
  } catch (error) {
    console.error("Error fetching tenant:", error);
    return { success: false, error: "Failed to fetch tenant" };
  }
}

export async function updateTenant(
  id: number,
  data: { name?: string; slug?: string },
) {
  try {
    const [tenant] = await db
      .update(tenants)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, id))
      .returning();

    return { success: true, tenant };
  } catch (error) {
    console.error("Error updating tenant:", error);
    return { success: false, error: "Failed to update tenant" };
  }
}

export async function getAllTenants() {
  try {
    const allTenants = await db.query.tenants.findMany({
      orderBy: (tenants, { desc }) => [desc(tenants.createdAt)],
    });

    return { success: true, tenants: allTenants };
  } catch (error) {
    console.error("Error fetching tenants:", error);
    return { success: false, error: "Failed to fetch tenants" };
  }
}
