"use server";

import { db } from "@/db";
import { customers, type InsertCustomer } from "@/db/schema";
import { auth } from "@/lib/auth";
import {
  abilityFromSession,
  type Actions,
  type Subjects,
} from "@/lib/casl/ability";
import { PERMISSIONS } from "@/lib/permissions";
import { eq, and, desc, or, like } from "drizzle-orm";
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

// ============= CUSTOMERS =============

const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  barcode: z.string().optional(),
  loyaltyPoints: z.number().int().default(0),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export async function createCustomer(input: z.infer<typeof customerSchema>) {
  const authResult = await getAuthorizedSession(PERMISSIONS.CUSTOMER_CREATE);
  if ("error" in authResult) return authResult;

  const validated = customerSchema.safeParse(input);
  if (!validated.success) {
    return { error: validated.error.issues[0].message } as const;
  }

  try {
    // Check if barcode already exists (if provided)
    if (validated.data.barcode) {
      const existingBarcode = await db.query.customers.findFirst({
        where: eq(customers.barcode, validated.data.barcode),
      });

      if (existingBarcode) {
        return { error: "Barcode already exists" } as const;
      }
    }

    const [customer] = await db
      .insert(customers)
      .values({
        tenantId: authResult.tenantId,
        ...validated.data,
        email: validated.data.email || null,
      })
      .returning();

    return { data: customer } as const;
  } catch (error) {
    console.error("Create customer error:", error);
    return { error: "Failed to create customer" } as const;
  }
}

export async function listCustomers(params?: { search?: string }) {
  const authResult = await getAuthorizedSession(PERMISSIONS.CUSTOMER_READ);
  if ("error" in authResult) return authResult;

  try {
    const result = await db.query.customers.findMany({
      where: eq(customers.tenantId, authResult.tenantId),
      orderBy: [desc(customers.createdAt)],
    });

    // Filter by search term if provided
    let filtered = result;
    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.phone?.toLowerCase().includes(searchLower) ||
          c.email?.toLowerCase().includes(searchLower),
      );
    }

    return { data: filtered } as const;
  } catch (error) {
    console.error("List customers error:", error);
    return { error: "Failed to fetch customers" } as const;
  }
}

export async function findCustomer(search: string) {
  const authResult = await getAuthorizedSession(PERMISSIONS.CUSTOMER_READ);
  if ("error" in authResult) return authResult;

  if (!search || search.length < 2) {
    return { error: "Search term too short" } as const;
  }

  try {
    // Search by phone, email, barcode, or name
    const result = await db.query.customers.findMany({
      where: and(eq(customers.tenantId, authResult.tenantId)),
      limit: 10,
    });

    const searchLower = search.toLowerCase();
    const filtered = result.filter(
      (c) =>
        c.phone?.toLowerCase().includes(searchLower) ||
        c.email?.toLowerCase().includes(searchLower) ||
        c.barcode?.toLowerCase().includes(searchLower) ||
        c.name.toLowerCase().includes(searchLower),
    );

    return { data: filtered } as const;
  } catch (error) {
    console.error("Find customer error:", error);
    return { error: "Failed to find customer" } as const;
  }
}

export async function getCustomer(id: number) {
  const authResult = await getAuthorizedSession(PERMISSIONS.CUSTOMER_READ);
  if ("error" in authResult) return authResult;

  try {
    const customer = await db.query.customers.findFirst({
      where: and(
        eq(customers.id, id),
        eq(customers.tenantId, authResult.tenantId),
      ),
      with: {
        sales: {
          orderBy: (sales, { desc }) => [desc(sales.createdAt)],
          limit: 10,
        },
      },
    });

    if (!customer) {
      return { error: "Customer not found" } as const;
    }

    return { data: customer } as const;
  } catch (error) {
    console.error("Get customer error:", error);
    return { error: "Failed to fetch customer" } as const;
  }
}

export async function updateCustomer(
  id: number,
  input: Partial<z.infer<typeof customerSchema>>,
) {
  const authResult = await getAuthorizedSession(PERMISSIONS.CUSTOMER_UPDATE);
  if ("error" in authResult) return authResult;

  try {
    const [customer] = await db
      .update(customers)
      .set({ ...input, updatedAt: new Date() })
      .where(
        and(eq(customers.id, id), eq(customers.tenantId, authResult.tenantId)),
      )
      .returning();

    if (!customer) {
      return { error: "Customer not found" } as const;
    }

    return { data: customer } as const;
  } catch (error) {
    console.error("Update customer error:", error);
    return { error: "Failed to update customer" } as const;
  }
}

export async function updateLoyaltyPoints(id: number, points: number) {
  const authResult = await getAuthorizedSession(PERMISSIONS.CUSTOMER_UPDATE);
  if ("error" in authResult) return authResult;

  try {
    const customer = await db.query.customers.findFirst({
      where: and(
        eq(customers.id, id),
        eq(customers.tenantId, authResult.tenantId),
      ),
    });

    if (!customer) {
      return { error: "Customer not found" } as const;
    }

    const [updated] = await db
      .update(customers)
      .set({
        loyaltyPoints: customer.loyaltyPoints + points,
        updatedAt: new Date(),
      })
      .where(eq(customers.id, id))
      .returning();

    return { data: updated } as const;
  } catch (error) {
    console.error("Update loyalty points error:", error);
    return { error: "Failed to update loyalty points" } as const;
  }
}

export async function deleteCustomer(id: number) {
  const authResult = await getAuthorizedSession(PERMISSIONS.CUSTOMER_DELETE);
  if ("error" in authResult) return authResult;

  try {
    await db
      .delete(customers)
      .where(
        and(eq(customers.id, id), eq(customers.tenantId, authResult.tenantId)),
      );

    return { success: true } as const;
  } catch (error) {
    console.error("Delete customer error:", error);
    return { error: "Failed to delete customer" } as const;
  }
}
