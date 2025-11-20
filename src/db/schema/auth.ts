import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { roles } from "./roles";
import { tenants } from "./tenants";

// Better Auth User table with custom fields for tenantId, roleId, customPermissions
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  // Custom fields for multi-tenancy and RBAC
  // These are nullable to allow user creation, but should be set immediately after signup
  tenantId: integer("tenant_id").references(() => tenants.id, {
    onDelete: "cascade",
  }),
  roleId: integer("role_id").references(() => roles.id, {
    onDelete: "restrict",
  }),
  customPermissions: text("custom_permissions").notNull().default("[]"),
});

export const userRelations = relations(user, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [user.tenantId],
    references: [tenants.id],
  }),
  role: one(roles, {
    fields: [user.roleId],
    references: [roles.id],
  }),
  sessions: many(session),
  accounts: many(account),
}));

// Better Auth Session table
export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

// Better Auth Account table (stores passwords and OAuth tokens)
export const account = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: "date" }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
    mode: "date",
  }),
  scope: text("scope"),
  idToken: text("id_token"),
  password: text("password"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

// Better Auth Verification table (for email verification, password reset, etc.)
export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export type SelectUser = typeof user.$inferSelect;
export type InsertUser = typeof user.$inferInsert;
export type SelectSession = typeof session.$inferSelect;
export type SelectAccount = typeof account.$inferSelect;

// Type for user with role populated
import type { SelectRole } from "./roles";
export type UserWithRole = SelectUser & {
  role?: SelectRole | null;
};

// Schema types for authentication
import { z } from "zod";

export const loginUserSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});
export type LoginUser = z.infer<typeof loginUserSchema>;

export const registerUserSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
  name: z.string().min(1, "Name is required"),
  companyName: z.string().min(1, "Company name is required"),
});
export type RegisterUser = z.infer<typeof registerUserSchema>;
