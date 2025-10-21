import { relations } from "drizzle-orm";
import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { roles } from "./roles";
import { users } from "./users";
import { stores } from "./stores";
import { categories, products } from "./catalog";
import { customers } from "./customers";
import { suppliers, purchaseOrders } from "./inventory";

export const tenants = pgTable("tenants", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  slug: varchar({ length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export type SelectTenant = typeof tenants.$inferSelect;
export type InsertTenant = typeof tenants.$inferInsert;

export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  roles: many(roles),
  stores: many(stores),
  categories: many(categories),
  products: many(products),
  customers: many(customers),
  suppliers: many(suppliers),
  purchaseOrders: many(purchaseOrders),
}));
