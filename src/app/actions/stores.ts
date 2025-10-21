"use server";

import { db } from "@/db";
import { stores, type InsertStore } from "@/db/schema";
import { auth } from "@/lib/auth";
import {
  abilityFromSession,
  type Actions,
  type Subjects,
} from "@/lib/casl/ability";
import { PERMISSIONS } from "@/lib/permissions";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";

/**
 * Get session and verify permissions
 */
async function getAuthorizedSession(permission: string) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized" } as const;
  }

  const ability = abilityFromSession(session);
  const [action, subject] = permission.split(":") as [Actions, Subjects];

  if (!ability.can(action, subject)) {
    return { error: "Forbidden" } as const;
  }

  const tenantId = Number.parseInt(session.user.tenantId);
  const userId = Number.parseInt(session.user.id);

  return { session, tenantId, userId };
}

// ============= STORES =============

const storeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  address: z.string().optional(),
  phone: z.string().optional(),
  timezone: z.string().default("UTC"),
});

export async function createStore(input: z.infer<typeof storeSchema>) {
  const authResult = await getAuthorizedSession(PERMISSIONS.STORE_CREATE);
  if ("error" in authResult) return authResult;

  const validated = storeSchema.safeParse(input);
  if (!validated.success) {
    return { error: validated.error.issues[0].message } as const;
  }

  try {
    // Check if store code already exists
    const existingStore = await db.query.stores.findFirst({
      where: eq(stores.code, validated.data.code),
    });

    if (existingStore) {
      return { error: "Store code already exists" } as const;
    }

    const [store] = await db
      .insert(stores)
      .values({
        tenantId: authResult.tenantId,
        ...validated.data,
      })
      .returning();

    return { data: store } as const;
  } catch (error) {
    console.error("Create store error:", error);
    return { error: "Failed to create store" } as const;
  }
}

export async function listStores() {
  const authResult = await getAuthorizedSession(PERMISSIONS.STORE_READ);
  if ("error" in authResult) return authResult;

  try {
    const result = await db.query.stores.findMany({
      where: eq(stores.tenantId, authResult.tenantId),
      orderBy: [desc(stores.createdAt)],
    });

    return { data: result } as const;
  } catch (error) {
    console.error("List stores error:", error);
    return { error: "Failed to fetch stores" } as const;
  }
}

export async function getStore(id: number) {
  const authResult = await getAuthorizedSession(PERMISSIONS.STORE_READ);
  if ("error" in authResult) return authResult;

  try {
    const store = await db.query.stores.findFirst({
      where: and(eq(stores.id, id), eq(stores.tenantId, authResult.tenantId)),
    });

    if (!store) {
      return { error: "Store not found" } as const;
    }

    return { data: store } as const;
  } catch (error) {
    console.error("Get store error:", error);
    return { error: "Failed to fetch store" } as const;
  }
}

export async function updateStore(
  id: number,
  input: Partial<z.infer<typeof storeSchema>>,
) {
  const authResult = await getAuthorizedSession(PERMISSIONS.STORE_UPDATE);
  if ("error" in authResult) return authResult;

  try {
    const [store] = await db
      .update(stores)
      .set({ ...input, updatedAt: new Date() })
      .where(and(eq(stores.id, id), eq(stores.tenantId, authResult.tenantId)))
      .returning();

    if (!store) {
      return { error: "Store not found" } as const;
    }

    return { data: store } as const;
  } catch (error) {
    console.error("Update store error:", error);
    return { error: "Failed to update store" } as const;
  }
}

export async function deleteStore(id: number) {
  const authResult = await getAuthorizedSession(PERMISSIONS.STORE_DELETE);
  if ("error" in authResult) return authResult;

  try {
    await db
      .delete(stores)
      .where(and(eq(stores.id, id), eq(stores.tenantId, authResult.tenantId)));

    return { success: true } as const;
  } catch (error) {
    console.error("Delete store error:", error);
    return { error: "Failed to delete store" } as const;
  }
}
