import { relations } from "drizzle-orm";
import {
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { stores } from "./stores";
import { users } from "./users";
import { sales } from "./sales";

export const registerSessions = pgTable("register_sessions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  storeId: integer("store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),
  openedByUserId: integer("opened_by_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  closedByUserId: integer("closed_by_user_id").references(() => users.id, {
    onDelete: "restrict",
  }),
  openedAt: timestamp("opened_at", { mode: "date" }).notNull().defaultNow(),
  closedAt: timestamp("closed_at", { mode: "date" }),
  openingFloat: numeric("opening_float", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  expectedCash: numeric("expected_cash", { precision: 12, scale: 2 }),
  actualCash: numeric("actual_cash", { precision: 12, scale: 2 }),
  discrepancy: numeric({ precision: 12, scale: 2 }),
  notes: text(), // For close-out notes
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const registerSessionsRelations = relations(
  registerSessions,
  ({ one, many }) => ({
    store: one(stores, {
      fields: [registerSessions.storeId],
      references: [stores.id],
    }),
    openedBy: one(users, {
      fields: [registerSessions.openedByUserId],
      references: [users.id],
    }),
    closedBy: one(users, {
      fields: [registerSessions.closedByUserId],
      references: [users.id],
    }),
    sales: many(sales),
  }),
);

export type SelectRegisterSession = typeof registerSessions.$inferSelect;
export type InsertRegisterSession = typeof registerSessions.$inferInsert;
