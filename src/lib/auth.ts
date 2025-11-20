import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      tenantId: {
        type: "number",
        required: false, // Not required during signup, but must be set immediately after
        input: false, // Don't allow user to set tenant during signup
      },
      roleId: {
        type: "number",
        required: false, // Not required during signup, but must be set immediately after
        input: false, // Don't allow user to set role during signup
      },
      customPermissions: {
        type: "string",
        required: false,
        defaultValue: "[]",
        input: false, // Don't allow user to set permissions during signup
      },
    },
  },
  plugins: [nextCookies()], // Handle cookies in server actions
});

export type Session = typeof auth.$Infer.Session;
