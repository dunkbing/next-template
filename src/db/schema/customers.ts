import { relations } from "drizzle-orm";
import {
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { sales } from "./sales";

export const customers = pgTable("customers", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  tenantId: integer("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }),
  phone: varchar({ length: 50 }),
  address: text(),
  barcode: varchar({ length: 100 }).unique(), // For customer card scanning
  loyaltyPoints: integer("loyalty_points").notNull().default(0),
  tags: text().$type<string[]>(), // JSON array of tags
  notes: text(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const customersRelations = relations(customers, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [customers.tenantId],
    references: [tenants.id],
  }),
  sales: many(sales),
}));

export type SelectCustomer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;
