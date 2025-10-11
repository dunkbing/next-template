import { compare } from "bcrypt-ts";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getUser } from "@/app/actions/users";
import type { RegisterUser } from "@/db/schema";
import { getUserPermissions } from "../casl/ability";
import { authCallbacks } from "./callbacks";
import { authConfig } from "./config";

export const credentials = Credentials({
  async authorize(credentials) {
    const { email, password } = credentials as RegisterUser;
    const user = await getUser(email);
    if (!user) return null;

    const passwordsMatch = await compare(password, user.password);
    if (!passwordsMatch) return null;

    const rolePermissions = user.role?.permissions || [];
    const customPermissions = user.customPermissions || [];
    const permissions = getUserPermissions(rolePermissions, customPermissions);

    return {
      id: user.id.toString(),
      email: user.email,
      name: user.name,
      tenantId: user.tenantId.toString(),
      roleId: user.roleId.toString(),
      roleName: user.role?.name,
      permissions,
    };
  },
});

export const nextAuth = NextAuth({
  ...authConfig,
  providers: [credentials],
  callbacks: {
    authorized: authConfig.callbacks.authorized,
    ...authCallbacks,
  },
});

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = nextAuth;
