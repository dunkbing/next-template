import { relations } from "drizzle-orm";
import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { roles } from "./roles";
import { user } from "./auth";

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
  users: many(user),
  roles: many(roles),
}));
