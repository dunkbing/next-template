import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcrypt-ts";
import { authConfig } from "./auth.config";
import { getUser } from "./app/actions/users";
import { getUserPermissions } from "./lib/casl/ability";
import { RegisterUser } from "./db/schema/users";

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
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.tenantId = user.tenantId;
        token.roleId = user.roleId;
        token.roleName = user.roleName;
        token.permissions = user.permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.tenantId = token.tenantId as string;
        session.user.roleId = token.roleId as string;
        session.user.roleName = token.roleName as string;
        session.user.permissions = token.permissions as string[];
      }
      return session;
    },
  },
});

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = nextAuth;
