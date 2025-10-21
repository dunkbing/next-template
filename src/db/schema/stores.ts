import { relations } from "drizzle-orm";
import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { stockItems } from "./inventory";
import { registerSessions } from "./register";
import { sales } from "./sales";

export const stores = pgTable("stores", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  tenantId: integer("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  name: varchar({ length: 255 }).notNull(),
  code: varchar({ length: 50 }).notNull().unique(),
  address: varchar({ length: 500 }),
  phone: varchar({ length: 50 }),
  timezone: varchar({ length: 50 }).notNull().default("UTC"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const storesRelations = relations(stores, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [stores.tenantId],
    references: [tenants.id],
  }),
  stockItems: many(stockItems),
  registerSessions: many(registerSessions),
  sales: many(sales),
}));

export type SelectStore = typeof stores.$inferSelect;
export type InsertStore = typeof stores.$inferInsert;
