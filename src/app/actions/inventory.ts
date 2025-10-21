"use server";

import { db } from "@/db";
import {
  stockItems,
  stockMoves,
  suppliers,
  purchaseOrders,
  purchaseOrderItems,
  productVariants,
  type InsertStockItem,
  type InsertStockMove,
  type InsertSupplier,
  type InsertPurchaseOrder,
  type InsertPurchaseOrderItem,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import {
  abilityFromSession,
  type Actions,
  type Subjects,
} from "@/lib/casl/ability";
import { PERMISSIONS } from "@/lib/permissions";
import { eq, and, desc, lt, sql } from "drizzle-orm";
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

// ============= STOCK MANAGEMENT =============

export async function getStockLevel(variantId: number, storeId: number) {
  const authResult = await getAuthorizedSession(PERMISSIONS.INVENTORY_READ);
  if ("error" in authResult) return authResult;

  try {
    const stock = await db.query.stockItems.findFirst({
      where: and(
        eq(stockItems.variantId, variantId),
        eq(stockItems.storeId, storeId),
      ),
      with: {
        variant: {
          with: {
            product: true,
          },
        },
        store: true,
      },
    });

    if (!stock) {
      return { error: "Stock not found" } as const;
    }

    return { data: stock } as const;
  } catch (error) {
    console.error("Get stock level error:", error);
    return { error: "Failed to fetch stock level" } as const;
  }
}

export async function listStockByStore(storeId: number) {
  const authResult = await getAuthorizedSession(PERMISSIONS.INVENTORY_READ);
  if ("error" in authResult) return authResult;

  try {
    const result = await db.query.stockItems.findMany({
      where: eq(stockItems.storeId, storeId),
      with: {
        variant: {
          with: {
            product: true,
          },
        },
      },
      orderBy: [desc(stockItems.updatedAt)],
    });

    return { data: result } as const;
  } catch (error) {
    console.error("List stock error:", error);
    return { error: "Failed to fetch stock" } as const;
  }
}

export async function listLowStock(storeId: number, threshold?: number) {
  const authResult = await getAuthorizedSession(PERMISSIONS.INVENTORY_READ);
  if ("error" in authResult) return authResult;

  try {
    const result = await db.query.stockItems.findMany({
      where: eq(stockItems.storeId, storeId),
      with: {
        variant: {
          with: {
            product: true,
          },
        },
      },
    });

    // Filter by reorder point or custom threshold
    const lowStock = result.filter((item) => {
      const limit = threshold || item.reorderPoint;
      return item.qtyAvailable <= limit;
    });

    return { data: lowStock } as const;
  } catch (error) {
    console.error("List low stock error:", error);
    return { error: "Failed to fetch low stock" } as const;
  }
}

const adjustStockSchema = z.object({
  variantId: z.number().int().positive(),
  storeId: z.number().int().positive(),
  qty: z.number().int(),
  reason: z.string().min(1, "Reason is required"),
  notes: z.string().optional(),
});

export async function adjustStock(input: z.infer<typeof adjustStockSchema>) {
  const authResult = await getAuthorizedSession(PERMISSIONS.INVENTORY_ADJUST);
  if ("error" in authResult) return authResult;

  const validated = adjustStockSchema.safeParse(input);
  if (!validated.success) {
    return { error: validated.error.issues[0].message } as const;
  }

  try {
    await db.transaction(async (tx) => {
      // Get or create stock item
      const existingStock = await tx.query.stockItems.findFirst({
        where: and(
          eq(stockItems.variantId, validated.data.variantId),
          eq(stockItems.storeId, validated.data.storeId),
        ),
      });

      let newQty = validated.data.qty;
      if (existingStock) {
        newQty = existingStock.qtyOnHand + validated.data.qty;

        await tx
          .update(stockItems)
          .set({
            qtyOnHand: newQty,
            qtyAvailable: newQty - existingStock.qtyReserved,
            updatedAt: new Date(),
          })
          .where(eq(stockItems.id, existingStock.id));
      } else {
        await tx.insert(stockItems).values({
          variantId: validated.data.variantId,
          storeId: validated.data.storeId,
          qtyOnHand: validated.data.qty,
          qtyReserved: 0,
          qtyAvailable: validated.data.qty,
          reorderPoint: 0,
        });
      }

      // Record stock move
      await tx.insert(stockMoves).values({
        variantId: validated.data.variantId,
        toStoreId: validated.data.storeId,
        qty: validated.data.qty,
        reason: validated.data.reason,
        performedByUserId: authResult.userId,
        notes: validated.data.notes,
      });
    });

    return { success: true } as const;
  } catch (error) {
    console.error("Adjust stock error:", error);
    return { error: "Failed to adjust stock" } as const;
  }
}

const transferStockSchema = z.object({
  variantId: z.number().int().positive(),
  fromStoreId: z.number().int().positive(),
  toStoreId: z.number().int().positive(),
  qty: z.number().int().positive(),
  notes: z.string().optional(),
});

export async function transferStock(
  input: z.infer<typeof transferStockSchema>,
) {
  const authResult = await getAuthorizedSession(PERMISSIONS.INVENTORY_TRANSFER);
  if ("error" in authResult) return authResult;

  const validated = transferStockSchema.safeParse(input);
  if (!validated.success) {
    return { error: validated.error.issues[0].message } as const;
  }

  if (validated.data.fromStoreId === validated.data.toStoreId) {
    return { error: "Cannot transfer to the same store" } as const;
  }

  try {
    await db.transaction(async (tx) => {
      // Get source stock
      const fromStock = await tx.query.stockItems.findFirst({
        where: and(
          eq(stockItems.variantId, validated.data.variantId),
          eq(stockItems.storeId, validated.data.fromStoreId),
        ),
      });

      if (!fromStock || fromStock.qtyAvailable < validated.data.qty) {
        throw new Error("Insufficient stock");
      }

      // Update source store
      await tx
        .update(stockItems)
        .set({
          qtyOnHand: fromStock.qtyOnHand - validated.data.qty,
          qtyAvailable: fromStock.qtyAvailable - validated.data.qty,
          updatedAt: new Date(),
        })
        .where(eq(stockItems.id, fromStock.id));

      // Get or create destination stock
      const toStock = await tx.query.stockItems.findFirst({
        where: and(
          eq(stockItems.variantId, validated.data.variantId),
          eq(stockItems.storeId, validated.data.toStoreId),
        ),
      });

      if (toStock) {
        await tx
          .update(stockItems)
          .set({
            qtyOnHand: toStock.qtyOnHand + validated.data.qty,
            qtyAvailable: toStock.qtyAvailable + validated.data.qty,
            updatedAt: new Date(),
          })
          .where(eq(stockItems.id, toStock.id));
      } else {
        await tx.insert(stockItems).values({
          variantId: validated.data.variantId,
          storeId: validated.data.toStoreId,
          qtyOnHand: validated.data.qty,
          qtyReserved: 0,
          qtyAvailable: validated.data.qty,
          reorderPoint: 0,
        });
      }

      // Record stock move
      await tx.insert(stockMoves).values({
        variantId: validated.data.variantId,
        fromStoreId: validated.data.fromStoreId,
        toStoreId: validated.data.toStoreId,
        qty: validated.data.qty,
        reason: "TRANSFER",
        performedByUserId: authResult.userId,
        notes: validated.data.notes,
      });
    });

    return { success: true } as const;
  } catch (error) {
    console.error("Transfer stock error:", error);
    if (error instanceof Error && error.message === "Insufficient stock") {
      return { error: "Insufficient stock" } as const;
    }
    return { error: "Failed to transfer stock" } as const;
  }
}

// ============= SUPPLIERS =============

const supplierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  contactName: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  taxId: z.string().optional(),
  notes: z.string().optional(),
});

export async function createSupplier(input: z.infer<typeof supplierSchema>) {
  const authResult = await getAuthorizedSession(PERMISSIONS.SUPPLIER_CREATE);
  if ("error" in authResult) return authResult;

  const validated = supplierSchema.safeParse(input);
  if (!validated.success) {
    return { error: validated.error.issues[0].message } as const;
  }

  try {
    const [supplier] = await db
      .insert(suppliers)
      .values({
        tenantId: authResult.tenantId,
        ...validated.data,
        email: validated.data.email || null,
      })
      .returning();

    return { data: supplier } as const;
  } catch (error) {
    console.error("Create supplier error:", error);
    return { error: "Failed to create supplier" } as const;
  }
}

export async function listSuppliers() {
  const authResult = await getAuthorizedSession(PERMISSIONS.SUPPLIER_READ);
  if ("error" in authResult) return authResult;

  try {
    const result = await db.query.suppliers.findMany({
      where: eq(suppliers.tenantId, authResult.tenantId),
      orderBy: [desc(suppliers.createdAt)],
    });

    return { data: result } as const;
  } catch (error) {
    console.error("List suppliers error:", error);
    return { error: "Failed to fetch suppliers" } as const;
  }
}

export async function updateSupplier(
  id: number,
  input: Partial<z.infer<typeof supplierSchema>>,
) {
  const authResult = await getAuthorizedSession(PERMISSIONS.SUPPLIER_UPDATE);
  if ("error" in authResult) return authResult;

  try {
    const [supplier] = await db
      .update(suppliers)
      .set({ ...input, updatedAt: new Date() })
      .where(
        and(eq(suppliers.id, id), eq(suppliers.tenantId, authResult.tenantId)),
      )
      .returning();

    if (!supplier) {
      return { error: "Supplier not found" } as const;
    }

    return { data: supplier } as const;
  } catch (error) {
    console.error("Update supplier error:", error);
    return { error: "Failed to update supplier" } as const;
  }
}

export async function deleteSupplier(id: number) {
  const authResult = await getAuthorizedSession(PERMISSIONS.SUPPLIER_DELETE);
  if ("error" in authResult) return authResult;

  try {
    await db
      .delete(suppliers)
      .where(
        and(eq(suppliers.id, id), eq(suppliers.tenantId, authResult.tenantId)),
      );

    return { success: true } as const;
  } catch (error) {
    console.error("Delete supplier error:", error);
    return { error: "Failed to delete supplier" } as const;
  }
}

// ============= PURCHASE ORDERS =============

const poItemSchema = z.object({
  variantId: z.number().int().positive(),
  qty: z.number().int().positive(),
  cost: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid cost format"),
  discount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid discount format")
    .default("0"),
});

const createPOSchema = z.object({
  supplierId: z.number().int().positive(),
  storeId: z.number().int().positive(),
  poNumber: z.string().min(1, "PO number is required"),
  expectedDate: z.date().optional(),
  items: z.array(poItemSchema).min(1, "At least one item is required"),
  shippingCost: z.string().default("0"),
  taxTotal: z.string().default("0"),
  notes: z.string().optional(),
});

export async function createPurchaseOrder(
  input: z.infer<typeof createPOSchema>,
) {
  const authResult = await getAuthorizedSession(PERMISSIONS.PO_CREATE);
  if ("error" in authResult) return authResult;

  const validated = createPOSchema.safeParse(input);
  if (!validated.success) {
    return { error: validated.error.issues[0].message } as const;
  }

  try {
    // Check if PO number already exists
    const existingPO = await db.query.purchaseOrders.findFirst({
      where: eq(purchaseOrders.poNumber, validated.data.poNumber),
    });

    if (existingPO) {
      return { error: "PO number already exists" } as const;
    }

    const result = await db.transaction(async (tx) => {
      // Calculate subtotal
      let subtotal = 0;
      for (const item of validated.data.items) {
        const itemTotal =
          item.qty * Number.parseFloat(item.cost) -
          Number.parseFloat(item.discount);
        subtotal += itemTotal;
      }

      const grandTotal =
        subtotal +
        Number.parseFloat(validated.data.shippingCost) +
        Number.parseFloat(validated.data.taxTotal);

      // Create PO
      const [po] = await tx
        .insert(purchaseOrders)
        .values({
          tenantId: authResult.tenantId,
          supplierId: validated.data.supplierId,
          storeId: validated.data.storeId,
          poNumber: validated.data.poNumber,
          status: "DRAFT",
          expectedDate: validated.data.expectedDate,
          subtotal: subtotal.toString(),
          taxTotal: validated.data.taxTotal,
          shippingCost: validated.data.shippingCost,
          grandTotal: grandTotal.toString(),
          notes: validated.data.notes,
          createdByUserId: authResult.userId,
        })
        .returning();

      // Create PO items
      for (const item of validated.data.items) {
        const lineTotal =
          item.qty * Number.parseFloat(item.cost) -
          Number.parseFloat(item.discount);

        await tx.insert(purchaseOrderItems).values({
          purchaseOrderId: po.id,
          variantId: item.variantId,
          qty: item.qty,
          cost: item.cost,
          discount: item.discount,
          lineTotal: lineTotal.toString(),
          receivedQty: 0,
        });
      }

      return po;
    });

    return { data: result } as const;
  } catch (error) {
    console.error("Create purchase order error:", error);
    return { error: "Failed to create purchase order" } as const;
  }
}

export async function listPurchaseOrders(params?: {
  status?: string;
  storeId?: number;
}) {
  const authResult = await getAuthorizedSession(PERMISSIONS.PO_READ);
  if ("error" in authResult) return authResult;

  try {
    const result = await db.query.purchaseOrders.findMany({
      where: eq(purchaseOrders.tenantId, authResult.tenantId),
      with: {
        supplier: true,
        store: true,
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
      orderBy: [desc(purchaseOrders.createdAt)],
    });

    // Filter by status or storeId if provided
    let filtered = result;
    if (params?.status) {
      filtered = filtered.filter((po) => po.status === params.status);
    }
    if (params?.storeId) {
      filtered = filtered.filter((po) => po.storeId === params.storeId);
    }

    return { data: filtered } as const;
  } catch (error) {
    console.error("List purchase orders error:", error);
    return { error: "Failed to fetch purchase orders" } as const;
  }
}

export async function getPurchaseOrder(id: number) {
  const authResult = await getAuthorizedSession(PERMISSIONS.PO_READ);
  if ("error" in authResult) return authResult;

  try {
    const po = await db.query.purchaseOrders.findFirst({
      where: and(
        eq(purchaseOrders.id, id),
        eq(purchaseOrders.tenantId, authResult.tenantId),
      ),
      with: {
        supplier: true,
        store: true,
        createdBy: true,
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

    if (!po) {
      return { error: "Purchase order not found" } as const;
    }

    return { data: po } as const;
  } catch (error) {
    console.error("Get purchase order error:", error);
    return { error: "Failed to fetch purchase order" } as const;
  }
}

const receivePOSchema = z.object({
  poId: z.number().int().positive(),
  receivedItems: z.array(
    z.object({
      itemId: z.number().int().positive(),
      receivedQty: z.number().int().positive(),
    }),
  ),
});

export async function receivePurchaseOrder(
  input: z.infer<typeof receivePOSchema>,
) {
  const authResult = await getAuthorizedSession(PERMISSIONS.PO_RECEIVE);
  if ("error" in authResult) return authResult;

  const validated = receivePOSchema.safeParse(input);
  if (!validated.success) {
    return { error: validated.error.issues[0].message } as const;
  }

  try {
    await db.transaction(async (tx) => {
      // Get PO
      const po = await tx.query.purchaseOrders.findFirst({
        where: and(
          eq(purchaseOrders.id, validated.data.poId),
          eq(purchaseOrders.tenantId, authResult.tenantId),
        ),
        with: {
          items: true,
        },
      });

      if (!po) {
        throw new Error("Purchase order not found");
      }

      // Update each item's received quantity and stock
      for (const receivedItem of validated.data.receivedItems) {
        const poItem = po.items.find((i) => i.id === receivedItem.itemId);
        if (!poItem) {
          throw new Error(`Item ${receivedItem.itemId} not found in PO`);
        }

        // Update PO item
        await tx
          .update(purchaseOrderItems)
          .set({
            receivedQty: poItem.receivedQty + receivedItem.receivedQty,
          })
          .where(eq(purchaseOrderItems.id, receivedItem.itemId));

        // Update stock
        const existingStock = await tx.query.stockItems.findFirst({
          where: and(
            eq(stockItems.variantId, poItem.variantId),
            eq(stockItems.storeId, po.storeId),
          ),
        });

        if (existingStock) {
          await tx
            .update(stockItems)
            .set({
              qtyOnHand: existingStock.qtyOnHand + receivedItem.receivedQty,
              qtyAvailable:
                existingStock.qtyAvailable + receivedItem.receivedQty,
              updatedAt: new Date(),
            })
            .where(eq(stockItems.id, existingStock.id));
        } else {
          await tx.insert(stockItems).values({
            variantId: poItem.variantId,
            storeId: po.storeId,
            qtyOnHand: receivedItem.receivedQty,
            qtyReserved: 0,
            qtyAvailable: receivedItem.receivedQty,
            reorderPoint: 0,
          });
        }

        // Record stock move
        await tx.insert(stockMoves).values({
          variantId: poItem.variantId,
          toStoreId: po.storeId,
          qty: receivedItem.receivedQty,
          reason: "PURCHASE",
          reference: `PO-${po.poNumber}`,
          performedByUserId: authResult.userId,
        });
      }

      // Check if all items are fully received
      const updatedItems = await tx.query.purchaseOrderItems.findMany({
        where: eq(purchaseOrderItems.purchaseOrderId, validated.data.poId),
      });

      const allReceived = updatedItems.every(
        (item) => item.receivedQty >= item.qty,
      );

      // Update PO status
      await tx
        .update(purchaseOrders)
        .set({
          status: allReceived ? "RECEIVED" : "SENT",
          receivedDate: allReceived ? new Date() : null,
          updatedAt: new Date(),
        })
        .where(eq(purchaseOrders.id, validated.data.poId));
    });

    return { success: true } as const;
  } catch (error) {
    console.error("Receive purchase order error:", error);
    if (error instanceof Error) {
      return { error: error.message } as const;
    }
    return { error: "Failed to receive purchase order" } as const;
  }
}

export async function updatePurchaseOrder(
  id: number,
  input: {
    status?: string;
    expectedDate?: Date;
    notes?: string;
  },
) {
  const authResult = await getAuthorizedSession(PERMISSIONS.PO_UPDATE);
  if ("error" in authResult) return authResult;

  try {
    const [po] = await db
      .update(purchaseOrders)
      .set({ ...input, updatedAt: new Date() })
      .where(
        and(
          eq(purchaseOrders.id, id),
          eq(purchaseOrders.tenantId, authResult.tenantId),
        ),
      )
      .returning();

    if (!po) {
      return { error: "Purchase order not found" } as const;
    }

    return { data: po } as const;
  } catch (error) {
    console.error("Update purchase order error:", error);
    return { error: "Failed to update purchase order" } as const;
  }
}
