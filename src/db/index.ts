import { drizzle } from "drizzle-orm/bun-sql";
import { configs } from "@/lib/configs";
import { roles, rolesRelations } from "./schema/roles";
import { tenants, tenantsRelations } from "./schema/tenants";
import { users, usersRelations } from "./schema/users";

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
