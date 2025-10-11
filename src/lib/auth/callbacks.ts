import type { AuthConfig } from "@auth/core/types";
import type { Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";

// Shared implementation logic
function populateTokenFromUser(token: JWT, user: User) {
  token.id = user.id;
  token.tenantId = user.tenantId;
  token.roleId = user.roleId;
  token.roleName = user.roleName;
  token.permissions = user.permissions;
}

function populateSessionFromToken(session: Session, token: JWT) {
  if (session.user) {
    session.user.id = token.id as string;
    session.user.tenantId = token.tenantId as string;
    session.user.roleId = token.roleId as string;
    session.user.roleName = token.roleName as string;
    session.user.permissions = token.permissions as string[];
  }
}

// NextAuth callbacks
export const authCallbacks = {
  async jwt({ token, user }: { token: JWT; user?: User }) {
    if (user) {
      populateTokenFromUser(token, user);
    }
    return token;
  },
  async session({ session, token }: { session: Session; token: JWT }) {
    if (token) {
      populateSessionFromToken(session, token);
    }
    return session;
  },
};

// Hono/Auth.js callbacks - using loose parameter types for compatibility
export const honoAuthCallbacks: Pick<AuthConfig, "callbacks"> = {
  callbacks: {
    async jwt(params) {
      const { token, user } = params;
      if (user) {
        populateTokenFromUser(token as JWT, user as User);
      }
      return token;
    },
    async session(params) {
      const { session, token } = params;
      if (token) {
        populateSessionFromToken(session as Session, token as JWT);
      }
      return session;
    },
  },
};
