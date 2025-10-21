"use server";

import { db } from "@/db";
import {
  registerSessions,
  sales,
  saleItems,
  payments,
  returns,
  stockItems,
  type InsertRegisterSession,
  type InsertSale,
  type InsertSaleItem,
  type InsertPayment,
  type InsertReturn,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import {
  abilityFromSession,
  type Actions,
  type Subjects,
} from "@/lib/casl/ability";
import { PERMISSIONS } from "@/lib/permissions";
import { eq, and, desc, isNull, gte, lte, sql } from "drizzle-orm";
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

// ============= REGISTER MANAGEMENT =============

const openRegisterSchema = z.object({
  storeId: z.number().int().positive(),
  openingFloat: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
});

export async function openRegister(input: z.infer<typeof openRegisterSchema>) {
  const authResult = await getAuthorizedSession(PERMISSIONS.REGISTER_OPEN);
  if ("error" in authResult) return authResult;

  const validated = openRegisterSchema.safeParse(input);
  if (!validated.success) {
    return { error: validated.error.issues[0].message } as const;
  }

  try {
    // Check if there's already an open session for this store
    const existingSession = await db.query.registerSessions.findFirst({
      where: and(
        eq(registerSessions.storeId, validated.data.storeId),
        isNull(registerSessions.closedAt),
      ),
    });

    if (existingSession) {
      return { error: "Register already open for this store" } as const;
    }

    const [registerSession] = await db
      .insert(registerSessions)
      .values({
        storeId: validated.data.storeId,
        openedByUserId: authResult.userId,
        openingFloat: validated.data.openingFloat,
      })
      .returning();

    return { data: registerSession } as const;
  } catch (error) {
    console.error("Open register error:", error);
    return { error: "Failed to open register" } as const;
  }
}

const closeRegisterSchema = z.object({
  sessionId: z.number().int().positive(),
  actualCash: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
  notes: z.string().optional(),
});

export async function closeRegister(
  input: z.infer<typeof closeRegisterSchema>,
) {
  const authResult = await getAuthorizedSession(PERMISSIONS.REGISTER_CLOSE);
  if ("error" in authResult) return authResult;

  const validated = closeRegisterSchema.safeParse(input);
  if (!validated.success) {
    return { error: validated.error.issues[0].message } as const;
  }

  try {
    // Get the session with sales
    const session = await db.query.registerSessions.findFirst({
      where: eq(registerSessions.id, validated.data.sessionId),
      with: {
        sales: {
          with: {
            payments: true,
          },
        },
      },
    });

    if (!session) {
      return { error: "Register session not found" } as const;
    }

    if (session.closedAt) {
      return { error: "Register already closed" } as const;
    }

    // Calculate expected cash
    const openingFloat = Number.parseFloat(session.openingFloat);
    const cashPayments = session.sales.reduce((sum, sale) => {
      const cash = sale.payments
        .filter((p) => p.method === "CASH")
        .reduce((s, p) => s + Number.parseFloat(p.amount), 0);
      return sum + cash;
    }, 0);

    const expectedCash = openingFloat + cashPayments;
    const actualCash = Number.parseFloat(validated.data.actualCash);
    const discrepancy = actualCash - expectedCash;

    const [closedSession] = await db
      .update(registerSessions)
      .set({
        closedAt: new Date(),
        closedByUserId: authResult.userId,
        expectedCash: expectedCash.toString(),
        actualCash: validated.data.actualCash,
        discrepancy: discrepancy.toString(),
        notes: validated.data.notes,
        updatedAt: new Date(),
      })
      .where(eq(registerSessions.id, validated.data.sessionId))
      .returning();

    return {
      data: {
        ...closedSession,
        expectedCash,
        actualCash,
        discrepancy,
      },
    } as const;
  } catch (error) {
    console.error("Close register error:", error);
    return { error: "Failed to close register" } as const;
  }
}

export async function getCurrentSession(storeId: number) {
  const authResult = await getAuthorizedSession(PERMISSIONS.REGISTER_READ);
  if ("error" in authResult) return authResult;

  try {
    const session = await db.query.registerSessions.findFirst({
      where: and(
        eq(registerSessions.storeId, storeId),
        isNull(registerSessions.closedAt),
      ),
      with: {
        openedBy: true,
        store: true,
      },
    });

    if (!session) {
      return { error: "No open register session" } as const;
    }

    return { data: session } as const;
  } catch (error) {
    console.error("Get current session error:", error);
    return { error: "Failed to fetch register session" } as const;
  }
}

// ============= SALES =============

const saleItemSchema = z.object({
  variantId: z.number().int().positive(),
  qty: z.number().int().positive(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  discount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid discount format")
    .default("0"),
  tax: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid tax format")
    .default("0"),
});

const paymentSchema = z.object({
  method: z.enum(["CASH", "CARD", "QR", "VOUCHER", "BANK_TRANSFER"]),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
  externalRef: z.string().optional(),
  notes: z.string().optional(),
});

const createSaleSchema = z.object({
  storeId: z.number().int().positive(),
  registerSessionId: z.number().int().positive(),
  customerId: z.number().int().positive().optional(),
  items: z.array(saleItemSchema).min(1, "At least one item is required"),
  payments: z.array(paymentSchema).min(1, "At least one payment is required"),
  notes: z.string().optional(),
});

export async function createSale(input: z.infer<typeof createSaleSchema>) {
  const authResult = await getAuthorizedSession(PERMISSIONS.SALE_CREATE);
  if ("error" in authResult) return authResult;

  const validated = createSaleSchema.safeParse(input);
  if (!validated.success) {
    return { error: validated.error.issues[0].message } as const;
  }

  try {
    // Calculate totals
    let subtotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;

    for (const item of validated.data.items) {
      const itemSubtotal = item.qty * Number.parseFloat(item.price);
      const itemDiscount = Number.parseFloat(item.discount);
      const itemTax = Number.parseFloat(item.tax);

      subtotal += itemSubtotal;
      discountTotal += itemDiscount;
      taxTotal += itemTax;
    }

    const grandTotal = subtotal - discountTotal + taxTotal;

    // Verify payment total
    const paidTotal = validated.data.payments.reduce(
      (sum, p) => sum + Number.parseFloat(p.amount),
      0,
    );

    if (Math.abs(paidTotal - grandTotal) > 0.01) {
      return { error: "Payment total does not match sale total" } as const;
    }

    const result = await db.transaction(async (tx) => {
      // Create sale
      const [sale] = await tx
        .insert(sales)
        .values({
          storeId: validated.data.storeId,
          registerSessionId: validated.data.registerSessionId,
          cashierId: authResult.userId,
          customerId: validated.data.customerId,
          status: "PAID",
          subtotal: subtotal.toString(),
          taxTotal: taxTotal.toString(),
          discountTotal: discountTotal.toString(),
          grandTotal: grandTotal.toString(),
          notes: validated.data.notes,
        })
        .returning();

      // Create sale items and update stock
      for (const item of validated.data.items) {
        const lineTotal =
          item.qty * Number.parseFloat(item.price) -
          Number.parseFloat(item.discount) +
          Number.parseFloat(item.tax);

        await tx.insert(saleItems).values({
          saleId: sale.id,
          variantId: item.variantId,
          qty: item.qty,
          price: item.price,
          discount: item.discount,
          tax: item.tax,
          lineTotal: lineTotal.toString(),
        });

        // Update stock
        const stock = await tx.query.stockItems.findFirst({
          where: and(
            eq(stockItems.variantId, item.variantId),
            eq(stockItems.storeId, validated.data.storeId),
          ),
        });

        if (stock) {
          const newQtyOnHand = stock.qtyOnHand - item.qty;
          const newQtyAvailable = stock.qtyAvailable - item.qty;

          if (newQtyOnHand < 0) {
            throw new Error(`Insufficient stock for variant ${item.variantId}`);
          }

          await tx
            .update(stockItems)
            .set({
              qtyOnHand: newQtyOnHand,
              qtyAvailable: newQtyAvailable,
              updatedAt: new Date(),
            })
            .where(eq(stockItems.id, stock.id));
        }
      }

      // Create payments
      for (const payment of validated.data.payments) {
        await tx.insert(payments).values({
          saleId: sale.id,
          method: payment.method,
          amount: payment.amount,
          externalRef: payment.externalRef,
          notes: payment.notes,
        });
      }

      return sale;
    });

    return { data: result } as const;
  } catch (error) {
    console.error("Create sale error:", error);
    if (
      error instanceof Error &&
      error.message.includes("Insufficient stock")
    ) {
      return { error: error.message } as const;
    }
    return { error: "Failed to create sale" } as const;
  }
}

export async function getSale(id: number) {
  const authResult = await getAuthorizedSession(PERMISSIONS.SALE_READ);
  if ("error" in authResult) return authResult;

  try {
    const sale = await db.query.sales.findFirst({
      where: eq(sales.id, id),
      with: {
        store: true,
        cashier: true,
        customer: true,
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
        returns: true,
      },
    });

    if (!sale) {
      return { error: "Sale not found" } as const;
    }

    return { data: sale } as const;
  } catch (error) {
    console.error("Get sale error:", error);
    return { error: "Failed to fetch sale" } as const;
  }
}

export async function listSales(params?: {
  storeId?: number;
  dateFrom?: Date;
  dateTo?: Date;
  customerId?: number;
}) {
  const authResult = await getAuthorizedSession(PERMISSIONS.SALE_READ);
  if ("error" in authResult) return authResult;

  try {
    const result = await db.query.sales.findMany({
      with: {
        store: true,
        cashier: true,
        customer: true,
        items: {
          with: {
            variant: true,
          },
        },
        payments: true,
      },
      orderBy: [desc(sales.createdAt)],
      limit: 100,
    });

    // Filter results
    let filtered = result;
    if (params?.storeId) {
      filtered = filtered.filter((s) => s.storeId === params.storeId);
    }
    if (params?.customerId) {
      filtered = filtered.filter((s) => s.customerId === params.customerId);
    }
    if (params?.dateFrom) {
      filtered = filtered.filter((s) => s.createdAt >= params.dateFrom!);
    }
    if (params?.dateTo) {
      filtered = filtered.filter((s) => s.createdAt <= params.dateTo!);
    }

    return { data: filtered } as const;
  } catch (error) {
    console.error("List sales error:", error);
    return { error: "Failed to fetch sales" } as const;
  }
}

const refundSaleSchema = z.object({
  saleId: z.number().int().positive(),
  reason: z.string().min(1, "Reason is required"),
  refundMethod: z.enum(["CASH", "CARD", "QR", "VOUCHER", "BANK_TRANSFER"]),
  refundAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
  notes: z.string().optional(),
});

export async function refundSale(input: z.infer<typeof refundSaleSchema>) {
  const authResult = await getAuthorizedSession(PERMISSIONS.SALE_REFUND);
  if ("error" in authResult) return authResult;

  const validated = refundSaleSchema.safeParse(input);
  if (!validated.success) {
    return { error: validated.error.issues[0].message } as const;
  }

  try {
    const result = await db.transaction(async (tx) => {
      // Get sale with items
      const sale = await tx.query.sales.findFirst({
        where: eq(sales.id, validated.data.saleId),
        with: {
          items: true,
        },
      });

      if (!sale) {
        throw new Error("Sale not found");
      }

      if (sale.status === "REFUNDED") {
        throw new Error("Sale already refunded");
      }

      // Create return record
      const [returnRecord] = await tx
        .insert(returns)
        .values({
          saleId: validated.data.saleId,
          processedByUserId: authResult.userId,
          reason: validated.data.reason,
          refundMethod: validated.data.refundMethod,
          refundAmount: validated.data.refundAmount,
          notes: validated.data.notes,
        })
        .returning();

      // Update sale status
      const isFullRefund =
        Number.parseFloat(validated.data.refundAmount) >=
        Number.parseFloat(sale.grandTotal) - 0.01;

      await tx
        .update(sales)
        .set({
          status: isFullRefund ? "REFUNDED" : "PARTIAL_REFUND",
          updatedAt: new Date(),
        })
        .where(eq(sales.id, validated.data.saleId));

      // Restore stock (for full refunds)
      if (isFullRefund) {
        for (const item of sale.items) {
          const stock = await tx.query.stockItems.findFirst({
            where: and(
              eq(stockItems.variantId, item.variantId),
              eq(stockItems.storeId, sale.storeId),
            ),
          });

          if (stock) {
            await tx
              .update(stockItems)
              .set({
                qtyOnHand: stock.qtyOnHand + item.qty,
                qtyAvailable: stock.qtyAvailable + item.qty,
                updatedAt: new Date(),
              })
              .where(eq(stockItems.id, stock.id));
          }
        }
      }

      return returnRecord;
    });

    return { data: result } as const;
  } catch (error) {
    console.error("Refund sale error:", error);
    if (error instanceof Error) {
      return { error: error.message } as const;
    }
    return { error: "Failed to refund sale" } as const;
  }
}
