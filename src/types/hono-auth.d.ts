import type { DefaultSession } from "@auth/core/types";

declare module "@auth/core/types" {
  interface User {
    id: string;
    email: string;
    name?: string | null;
    tenantId: string;
    roleId: string;
    roleName?: string;
    permissions: string[];
  }

  interface Session extends DefaultSession {
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
