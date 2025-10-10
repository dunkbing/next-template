import {
  integer,
  jsonb,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { tenants } from "./tenants";
import { roles, SelectRole } from "./roles";

export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  tenantId: integer("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  roleId: integer("role_id")
    .notNull()
    .references(() => roles.id, { onDelete: "restrict" }),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  name: varchar({ length: 255 }),
  customPermissions: jsonb("custom_permissions")
    .$type<string[]>()
    .notNull()
    .default([]),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  customPermissions: true,
  createdAt: true,
  updatedAt: true,
});

export const registerUserSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "password is required"),
});
export type RegisterUser = z.infer<typeof registerUserSchema>;

export const usersRelations = relations(users, ({ one }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
}));

export type SelectUser = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type UserWithRole = SelectUser & {
  role?: SelectRole | null;
};
