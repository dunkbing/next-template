"use server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { sales, saleItems, payments } from "@/db/schema";
import { and, eq, desc, gte, lte, sql } from "drizzle-orm";

// Get all sales for tenant with filters
export async function listSales(filters?: {
  status?: string;
  storeId?: number;
  customerId?: number;
  dateFrom?: Date;
  dateTo?: Date;
}) {
  const session = await auth();
  if (!session?.user?.tenantId) {
    return { error: "Unauthorized" };
  }

  try {
    const tenantId = Number.parseInt(session.user.tenantId);

    // First get all sales with store info
    const storesResult = await db.query.stores.findMany({
      where: (stores, { eq }) => eq(stores.tenantId, tenantId),
    });

    const storeIds = storesResult.map((s) => s.id);

    const conditions = [sql`${sales.storeId} IN ${storeIds}`];

    if (filters?.status) {
      conditions.push(eq(sales.status, filters.status));
    }
    if (filters?.storeId) {
      conditions.push(eq(sales.storeId, filters.storeId));
    }
    if (filters?.customerId) {
      conditions.push(eq(sales.customerId, filters.customerId));
    }
    if (filters?.dateFrom) {
      conditions.push(gte(sales.createdAt, filters.dateFrom));
    }
    if (filters?.dateTo) {
      conditions.push(lte(sales.createdAt, filters.dateTo));
    }

    const salesList = await db.query.sales.findMany({
      where: and(...conditions),
      with: {
        customer: true,
        store: true,
        cashier: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          with: {
            variant: {
              with: {
                product: true,
              },
            },
          },
        },
        payments: true,
      },
      orderBy: [desc(sales.createdAt)],
    });

    return { sales: salesList };
  } catch (error) {
    console.error("Failed to list sales:", error);
    return { error: "Failed to load sales" };
  }
}

// Get a single sale by ID
export async function getSale(saleId: number) {
  const session = await auth();
  if (!session?.user?.tenantId) {
    return { error: "Unauthorized" };
  }

  try {
    const tenantId = Number.parseInt(session.user.tenantId);

    const sale = await db.query.sales.findFirst({
      where: eq(sales.id, saleId),
      with: {
        customer: true,
        store: true,
        cashier: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        registerSession: true,
        items: {
          with: {
            variant: {
              with: {
                product: true,
              },
            },
          },
        },
        payments: true,
        returns: {
          with: {
            processedBy: {
              columns: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!sale) {
      return { error: "Sale not found" };
    }

    // Verify the sale belongs to user's tenant
    const storeResult = await db.query.stores.findFirst({
      where: (stores, { and, eq }) =>
        and(eq(stores.id, sale.storeId), eq(stores.tenantId, tenantId)),
    });

    if (!storeResult) {
      return { error: "Unauthorized" };
    }

    return { sale };
  } catch (error) {
    console.error("Failed to get sale:", error);
    return { error: "Failed to load sale" };
  }
}

// Get sales statistics
export async function getSalesStats(filters?: {
  dateFrom?: Date;
  dateTo?: Date;
  storeId?: number;
}) {
  const session = await auth();
  if (!session?.user?.tenantId) {
    return { error: "Unauthorized" };
  }

  try {
    const tenantId = Number.parseInt(session.user.tenantId);

    // Get all stores for this tenant
    const storesResult = await db.query.stores.findMany({
      where: (stores, { eq }) => eq(stores.tenantId, tenantId),
    });

    const storeIds = storesResult.map((s) => s.id);
    const conditions = [sql`${sales.storeId} IN ${storeIds}`];

    if (filters?.storeId) {
      conditions.push(eq(sales.storeId, filters.storeId));
    }
    if (filters?.dateFrom) {
      conditions.push(gte(sales.createdAt, filters.dateFrom));
    }
    if (filters?.dateTo) {
      conditions.push(lte(sales.createdAt, filters.dateTo));
    }

    const stats = await db
      .select({
        totalSales: sql<number>`COUNT(*)::int`,
        totalRevenue: sql<string>`COALESCE(SUM(${sales.grandTotal}), 0)`,
        paidSales: sql<number>`COUNT(*) FILTER (WHERE ${sales.status} = 'PAID')::int`,
        refundedSales: sql<number>`COUNT(*) FILTER (WHERE ${sales.status} = 'REFUNDED')::int`,
        averageOrderValue: sql<string>`COALESCE(AVG(${sales.grandTotal}), 0)`,
      })
      .from(sales)
      .where(and(...conditions));

    return { stats: stats[0] };
  } catch (error) {
    console.error("Failed to get sales stats:", error);
    return { error: "Failed to load sales statistics" };
  }
}
