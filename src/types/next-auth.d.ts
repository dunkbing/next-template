import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name?: string | null;
    tenantId: string;
    roleId: string;
    roleName?: string;
    permissions: string[];
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      tenantId: string;
      roleId: string;
      roleName?: string;
      permissions: string[];
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    tenantId: string;
    roleId: string;
    roleName?: string;
    permissions: string[];
  }
}
