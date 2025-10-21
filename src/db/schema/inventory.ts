import { relations } from "drizzle-orm";
import {
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { stores } from "./stores";
import { productVariants } from "./catalog";
import { users } from "./users";

export const suppliers = pgTable("suppliers", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  tenantId: integer("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  name: varchar({ length: 255 }).notNull(),
  contactName: varchar("contact_name", { length: 255 }),
  email: varchar({ length: 255 }),
  phone: varchar({ length: 50 }),
  address: text(),
  taxId: varchar("tax_id", { length: 100 }),
  notes: text(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const suppliersRelations = relations(suppliers, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [suppliers.tenantId],
    references: [tenants.id],
  }),
  purchaseOrders: many(purchaseOrders),
}));

export const stockItems = pgTable("stock_items", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  variantId: integer("variant_id")
    .notNull()
    .references(() => productVariants.id, { onDelete: "cascade" }),
  storeId: integer("store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),
  qtyOnHand: integer("qty_on_hand").notNull().default(0),
  qtyReserved: integer("qty_reserved").notNull().default(0),
  qtyAvailable: integer("qty_available").notNull().default(0), // qtyOnHand - qtyReserved
  reorderPoint: integer("reorder_point").notNull().default(0),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const stockItemsRelations = relations(stockItems, ({ one, many }) => ({
  variant: one(productVariants, {
    fields: [stockItems.variantId],
    references: [productVariants.id],
  }),
  store: one(stores, {
    fields: [stockItems.storeId],
    references: [stores.id],
  }),
  stockMoves: many(stockMoves),
}));

export const stockMoves = pgTable("stock_moves", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  variantId: integer("variant_id")
    .notNull()
    .references(() => productVariants.id, { onDelete: "restrict" }),
  fromStoreId: integer("from_store_id").references(() => stores.id, {
    onDelete: "restrict",
  }),
  toStoreId: integer("to_store_id").references(() => stores.id, {
    onDelete: "restrict",
  }),
  qty: integer().notNull(),
  reason: varchar({ length: 100 }).notNull(), // TRANSFER, ADJUSTMENT, SALE, PURCHASE, RETURN
  reference: varchar({ length: 255 }), // Sale ID, PO ID, etc.
  performedByUserId: integer("performed_by_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  notes: text(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const stockMovesRelations = relations(stockMoves, ({ one }) => ({
  variant: one(productVariants, {
    fields: [stockMoves.variantId],
    references: [productVariants.id],
  }),
  fromStore: one(stores, {
    fields: [stockMoves.fromStoreId],
    references: [stores.id],
  }),
  toStore: one(stores, {
    fields: [stockMoves.toStoreId],
    references: [stores.id],
  }),
  performedBy: one(users, {
    fields: [stockMoves.performedByUserId],
    references: [users.id],
  }),
}));

export const purchaseOrders = pgTable("purchase_orders", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  tenantId: integer("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  supplierId: integer("supplier_id")
    .notNull()
    .references(() => suppliers.id, { onDelete: "restrict" }),
  storeId: integer("store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),
  poNumber: varchar("po_number", { length: 100 }).notNull().unique(),
  status: varchar({ length: 50 }).notNull().default("DRAFT"), // DRAFT, SENT, RECEIVED, CANCELLED
  orderDate: timestamp("order_date", { mode: "date" }).notNull().defaultNow(),
  expectedDate: timestamp("expected_date", { mode: "date" }),
  receivedDate: timestamp("received_date", { mode: "date" }),
  subtotal: numeric({ precision: 12, scale: 2 }).notNull().default("0"),
  taxTotal: numeric("tax_total", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  shippingCost: numeric("shipping_cost", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  grandTotal: numeric("grand_total", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  notes: text(),
  createdByUserId: integer("created_by_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const purchaseOrdersRelations = relations(
  purchaseOrders,
  ({ one, many }) => ({
    tenant: one(tenants, {
      fields: [purchaseOrders.tenantId],
      references: [tenants.id],
    }),
    supplier: one(suppliers, {
      fields: [purchaseOrders.supplierId],
      references: [suppliers.id],
    }),
    store: one(stores, {
      fields: [purchaseOrders.storeId],
      references: [stores.id],
    }),
    createdBy: one(users, {
      fields: [purchaseOrders.createdByUserId],
      references: [users.id],
    }),
    items: many(purchaseOrderItems),
  }),
);

export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  purchaseOrderId: integer("purchase_order_id")
    .notNull()
    .references(() => purchaseOrders.id, { onDelete: "cascade" }),
  variantId: integer("variant_id")
    .notNull()
    .references(() => productVariants.id, { onDelete: "restrict" }),
  qty: integer().notNull(),
  cost: numeric({ precision: 12, scale: 2 }).notNull(),
  discount: numeric({ precision: 12, scale: 2 }).notNull().default("0"),
  lineTotal: numeric("line_total", { precision: 12, scale: 2 }).notNull(),
  receivedQty: integer("received_qty").notNull().default(0),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const purchaseOrderItemsRelations = relations(
  purchaseOrderItems,
  ({ one }) => ({
    purchaseOrder: one(purchaseOrders, {
      fields: [purchaseOrderItems.purchaseOrderId],
      references: [purchaseOrders.id],
    }),
    variant: one(productVariants, {
      fields: [purchaseOrderItems.variantId],
      references: [productVariants.id],
    }),
  }),
);

export type SelectSupplier = typeof suppliers.$inferSelect;
export type InsertSupplier = typeof suppliers.$inferInsert;

export type SelectStockItem = typeof stockItems.$inferSelect;
export type InsertStockItem = typeof stockItems.$inferInsert;

export type SelectStockMove = typeof stockMoves.$inferSelect;
export type InsertStockMove = typeof stockMoves.$inferInsert;

export type SelectPurchaseOrder = typeof purchaseOrders.$inferSelect;
export type InsertPurchaseOrder = typeof purchaseOrders.$inferInsert;

export type SelectPurchaseOrderItem = typeof purchaseOrderItems.$inferSelect;
export type InsertPurchaseOrderItem = typeof purchaseOrderItems.$inferInsert;
