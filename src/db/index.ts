import { drizzle } from "drizzle-orm/bun-sql";
import { configs } from "@/lib/configs";
import { roles, rolesRelations } from "./schema/roles";
import { tenants, tenantsRelations } from "./schema/tenants";
import {
  user,
  userRelations,
  session,
  sessionRelations,
  account,
  accountRelations,
  verification,
} from "./schema/auth";

const client = new Bun.SQL(configs.databaseUrl);

export const db = drizzle({
  client,
  schema: {
    user,
    userRelations,
    session,
    sessionRelations,
    account,
    accountRelations,
    verification,
    tenants,
    tenantsRelations,
    roles,
    rolesRelations,
  },
  logger: configs.nodeEnv === "development",
});
