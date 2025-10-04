import { users, usersRelations } from "./schema/users";
import { tenants, tenantsRelations } from "./schema/tenants";
import { roles, rolesRelations } from "./schema/roles";
import { configs } from "@/lib/configs";
import { drizzle } from "drizzle-orm/bun-sql";

const client = new Bun.SQL(configs.databaseUrl);

export const db = drizzle({
  client,
  schema: {
    users,
    usersRelations,
    tenants,
    tenantsRelations,
    roles,
    rolesRelations,
  },
  logger: configs.nodeEnv === "development",
});
