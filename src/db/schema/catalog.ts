import { relations } from "drizzle-orm";
import { z } from "zod";
import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { SelectStockItem, stockItems } from "./inventory";
import { saleItems } from "./sales";
import { createInsertSchema } from "drizzle-zod";

export const categories = pgTable("categories", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  tenantId: integer("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  parentId: integer("parent_id"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [categories.tenantId],
    references: [tenants.id],
  }),
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
  }),
  children: many(categories),
  products: many(products),
}));

export const products = pgTable("products", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  tenantId: integer("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  categoryId: integer("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  s3Keys: jsonb("s3_keys").$type<string[]>().default([]),
  taxClass: varchar("tax_class", { length: 50 }).notNull().default("standard"),
  trackStock: boolean("track_stock").notNull().default(true),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const insertProductSchema = createInsertSchema(products, {
  tenantId: z.number().optional(),
}).omit({
  createdAt: true,
  updatedAt: true,
});

export const productsRelations = relations(products, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [products.tenantId],
    references: [tenants.id],
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  variants: many(productVariants),
}));

export const productVariants = pgTable("product_variants", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  sku: varchar({ length: 100 }).notNull().unique(),
  barcode: varchar({ length: 100 }).unique(),
  name: varchar({ length: 255 }).notNull(), // e.g., "Red - XL"
  attributesJson: text("attributes_json"), // JSON: { "color": "Red", "size": "XL" }
  price: numeric({ precision: 12, scale: 2 }).notNull(),
  cost: numeric({ precision: 12, scale: 2 }).notNull().default("0"),
  status: varchar({ length: 50 }).notNull().default("active"), // active, inactive, discontinued
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const productVariantsRelations = relations(
  productVariants,
  ({ one, many }) => ({
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.id],
    }),
    stockItems: many(stockItems),
    saleItems: many(saleItems),
  }),
);

export type SelectCategory = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

export type SelectProduct = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type SelectProductVariant = typeof productVariants.$inferSelect;
export type InsertProductVariant = typeof productVariants.$inferInsert;
export type ProductVariantWithRelations = SelectProductVariant & {
  stockItems?: SelectStockItem[];
};

export type ProductWithRelations = SelectProduct & {
  images?: { key: string; url: string }[];
  category?: SelectCategory | null;
  variants?: ProductVariantWithRelations[];
};
