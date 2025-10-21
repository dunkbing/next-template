import { drizzle } from "drizzle-orm/bun-sql";
import { configs } from "@/lib/configs";
import { roles, rolesRelations } from "./schema/roles";
import { tenants, tenantsRelations } from "./schema/tenants";
import { users, usersRelations } from "./schema/users";
import { stores, storesRelations } from "./schema/stores";
import {
  categories,
  categoriesRelations,
  products,
  productsRelations,
  productVariants,
  productVariantsRelations,
} from "./schema/catalog";
import { customers, customersRelations } from "./schema/customers";
import {
  suppliers,
  suppliersRelations,
  stockItems,
  stockItemsRelations,
  stockMoves,
  stockMovesRelations,
  purchaseOrders,
  purchaseOrdersRelations,
  purchaseOrderItems,
  purchaseOrderItemsRelations,
} from "./schema/inventory";
import { registerSessions, registerSessionsRelations } from "./schema/register";
import {
  sales,
  salesRelations,
  saleItems,
  saleItemsRelations,
  payments,
  paymentsRelations,
  returns,
  returnsRelations,
} from "./schema/sales";

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
    stores,
    storesRelations,
    categories,
    categoriesRelations,
    products,
    productsRelations,
    productVariants,
    productVariantsRelations,
    customers,
    customersRelations,
    suppliers,
    suppliersRelations,
    stockItems,
    stockItemsRelations,
    stockMoves,
    stockMovesRelations,
    purchaseOrders,
    purchaseOrdersRelations,
    purchaseOrderItems,
    purchaseOrderItemsRelations,
    registerSessions,
    registerSessionsRelations,
    sales,
    salesRelations,
    saleItems,
    saleItemsRelations,
    payments,
    paymentsRelations,
    returns,
    returnsRelations,
  },
  logger: configs.nodeEnv === "development",
});
