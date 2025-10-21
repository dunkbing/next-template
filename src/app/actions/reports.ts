"use server";

import { db } from "@/db";
import {
  sales,
  saleItems,
  payments,
  registerSessions,
  stockItems,
  productVariants,
  products,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import {
  abilityFromSession,
  type Actions,
  type Subjects,
} from "@/lib/casl/ability";
import { PERMISSIONS } from "@/lib/permissions";
import { eq, and, desc, gte, lte, sql, count, sum } from "drizzle-orm";
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

// ============= SALES REPORTS =============

const salesSummarySchema = z.object({
  storeId: z.number().int().positive().optional(),
  dateFrom: z.date(),
  dateTo: z.date(),
});

export async function getSalesSummary(
  input: z.infer<typeof salesSummarySchema>,
) {
  const authResult = await getAuthorizedSession(PERMISSIONS.REPORT_SALES);
  if ("error" in authResult) return authResult;

  const validated = salesSummarySchema.safeParse(input);
  if (!validated.success) {
    return { error: validated.error.issues[0].message } as const;
  }

  try {
    // Get sales within date range
    const result = await db.query.sales.findMany({
      where: and(
        validated.data.storeId
          ? eq(sales.storeId, validated.data.storeId)
          : undefined,
        gte(sales.createdAt, validated.data.dateFrom),
        lte(sales.createdAt, validated.data.dateTo),
      ),
      with: {
        items: true,
        payments: true,
        store: true,
        cashier: true,
      },
    });

    // Calculate summary
    const totalSales = result.length;
    const totalRevenue = result.reduce(
      (sum, sale) => sum + Number.parseFloat(sale.grandTotal),
      0,
    );
    const totalDiscount = result.reduce(
      (sum, sale) => sum + Number.parseFloat(sale.discountTotal),
      0,
    );
    const totalTax = result.reduce(
      (sum, sale) => sum + Number.parseFloat(sale.taxTotal),
      0,
    );

    // Group by payment method
    const paymentBreakdown = result.reduce(
      (acc, sale) => {
        for (const payment of sale.payments) {
          if (!acc[payment.method]) {
            acc[payment.method] = 0;
          }
          acc[payment.method] += Number.parseFloat(payment.amount);
        }
        return acc;
      },
      {} as Record<string, number>,
    );

    // Group by day
    const dailyBreakdown = result.reduce(
      (acc, sale) => {
        const day = sale.createdAt.toISOString().split("T")[0];
        if (!acc[day]) {
          acc[day] = { count: 0, revenue: 0 };
        }
        acc[day].count++;
        acc[day].revenue += Number.parseFloat(sale.grandTotal);
        return acc;
      },
      {} as Record<string, { count: number; revenue: number }>,
    );

    return {
      data: {
        totalSales,
        totalRevenue,
        totalDiscount,
        totalTax,
        paymentBreakdown,
        dailyBreakdown,
        sales: result,
      },
    } as const;
  } catch (error) {
    console.error("Get sales summary error:", error);
    return { error: "Failed to fetch sales summary" } as const;
  }
}

export async function getXZReport(registerSessionId: number) {
  const authResult = await getAuthorizedSession(PERMISSIONS.REPORT_XZ);
  if ("error" in authResult) return authResult;

  try {
    const session = await db.query.registerSessions.findFirst({
      where: eq(registerSessions.id, registerSessionId),
      with: {
        store: true,
        openedBy: true,
        closedBy: true,
        sales: {
          with: {
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
        },
      },
    });

    if (!session) {
      return { error: "Register session not found" } as const;
    }

    // Calculate totals
    const totalSales = session.sales.length;
    const grossSales = session.sales.reduce(
      (sum, sale) => sum + Number.parseFloat(sale.subtotal),
      0,
    );
    const totalDiscount = session.sales.reduce(
      (sum, sale) => sum + Number.parseFloat(sale.discountTotal),
      0,
    );
    const totalTax = session.sales.reduce(
      (sum, sale) => sum + Number.parseFloat(sale.taxTotal),
      0,
    );
    const netSales = session.sales.reduce(
      (sum, sale) => sum + Number.parseFloat(sale.grandTotal),
      0,
    );

    // Payment breakdown
    const paymentBreakdown = session.sales.reduce(
      (acc, sale) => {
        for (const payment of sale.payments) {
          if (!acc[payment.method]) {
            acc[payment.method] = 0;
          }
          acc[payment.method] += Number.parseFloat(payment.amount);
        }
        return acc;
      },
      {} as Record<string, number>,
    );

    // Cash expected vs actual (if closed)
    const openingFloat = Number.parseFloat(session.openingFloat);
    const expectedCash = session.expectedCash
      ? Number.parseFloat(session.expectedCash)
      : null;
    const actualCash = session.actualCash
      ? Number.parseFloat(session.actualCash)
      : null;
    const discrepancy = session.discrepancy
      ? Number.parseFloat(session.discrepancy)
      : null;

    return {
      data: {
        session: {
          id: session.id,
          storeId: session.storeId,
          storeName: session.store.name,
          openedBy: session.openedBy.name,
          closedBy: session.closedBy?.name,
          openedAt: session.openedAt,
          closedAt: session.closedAt,
        },
        summary: {
          totalSales,
          grossSales,
          totalDiscount,
          totalTax,
          netSales,
          openingFloat,
          expectedCash,
          actualCash,
          discrepancy,
        },
        paymentBreakdown,
        sales: session.sales,
      },
    } as const;
  } catch (error) {
    console.error("Get X/Z report error:", error);
    return { error: "Failed to fetch X/Z report" } as const;
  }
}

export async function getTopProducts(params: {
  storeId?: number;
  dateFrom: Date;
  dateTo: Date;
  limit?: number;
}) {
  const authResult = await getAuthorizedSession(PERMISSIONS.REPORT_SALES);
  if ("error" in authResult) return authResult;

  try {
    // Get all sales in date range
    const salesData = await db.query.sales.findMany({
      where: and(
        params.storeId ? eq(sales.storeId, params.storeId) : undefined,
        gte(sales.createdAt, params.dateFrom),
        lte(sales.createdAt, params.dateTo),
      ),
      with: {
        items: {
          with: {
            variant: {
              with: {
                product: true,
              },
            },
          },
        },
      },
    });

    // Aggregate by product variant
    const productStats = new Map<
      number,
      {
        variantId: number;
        productName: string;
        variantName: string;
        qty: number;
        revenue: number;
      }
    >();

    for (const sale of salesData) {
      for (const item of sale.items) {
        const existing = productStats.get(item.variantId);
        const revenue =
          item.qty * Number.parseFloat(item.price) -
          Number.parseFloat(item.discount);

        if (existing) {
          existing.qty += item.qty;
          existing.revenue += revenue;
        } else {
          productStats.set(item.variantId, {
            variantId: item.variantId,
            productName: item.variant.product.name,
            variantName: item.variant.name,
            qty: item.qty,
            revenue,
          });
        }
      }
    }

    // Sort by quantity sold
    const topProducts = Array.from(productStats.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, params.limit || 10);

    return { data: topProducts } as const;
  } catch (error) {
    console.error("Get top products error:", error);
    return { error: "Failed to fetch top products" } as const;
  }
}

// ============= INVENTORY REPORTS =============

export async function getInventoryValuation(storeId?: number) {
  const authResult = await getAuthorizedSession(PERMISSIONS.REPORT_INVENTORY);
  if ("error" in authResult) return authResult;

  try {
    const stockData = await db.query.stockItems.findMany({
      where: storeId ? eq(stockItems.storeId, storeId) : undefined,
      with: {
        variant: {
          with: {
            product: true,
          },
        },
        store: true,
      },
    });

    // Calculate valuation
    let totalValue = 0;
    let totalItems = 0;
    const breakdown = stockData.map((stock) => {
      const costPerUnit = Number.parseFloat(stock.variant.cost);
      const value = stock.qtyOnHand * costPerUnit;
      totalValue += value;
      totalItems += stock.qtyOnHand;

      return {
        variantId: stock.variantId,
        productName: stock.variant.product.name,
        variantName: stock.variant.name,
        sku: stock.variant.sku,
        storeName: stock.store.name,
        qtyOnHand: stock.qtyOnHand,
        qtyReserved: stock.qtyReserved,
        qtyAvailable: stock.qtyAvailable,
        costPerUnit,
        totalValue: value,
      };
    });

    // Sort by total value desc
    breakdown.sort((a, b) => b.totalValue - a.totalValue);

    return {
      data: {
        totalValue,
        totalItems,
        uniqueProducts: breakdown.length,
        breakdown,
      },
    } as const;
  } catch (error) {
    console.error("Get inventory valuation error:", error);
    return { error: "Failed to fetch inventory valuation" } as const;
  }
}

export async function getLowStockReport(storeId: number) {
  const authResult = await getAuthorizedSession(PERMISSIONS.REPORT_INVENTORY);
  if ("error" in authResult) return authResult;

  try {
    const stockData = await db.query.stockItems.findMany({
      where: eq(stockItems.storeId, storeId),
      with: {
        variant: {
          with: {
            product: true,
          },
        },
        store: true,
      },
    });

    // Filter items at or below reorder point
    const lowStock = stockData
      .filter((stock) => stock.qtyAvailable <= stock.reorderPoint)
      .map((stock) => ({
        variantId: stock.variantId,
        productName: stock.variant.product.name,
        variantName: stock.variant.name,
        sku: stock.variant.sku,
        qtyAvailable: stock.qtyAvailable,
        reorderPoint: stock.reorderPoint,
        deficit: stock.reorderPoint - stock.qtyAvailable,
      }))
      .sort((a, b) => b.deficit - a.deficit);

    return { data: lowStock } as const;
  } catch (error) {
    console.error("Get low stock report error:", error);
    return { error: "Failed to fetch low stock report" } as const;
  }
}
