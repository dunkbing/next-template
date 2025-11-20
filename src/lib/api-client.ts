import { hc } from "hono/client";
import type { UsersRouteType } from "@/api/routes/users";

// Create typed RPC client for users route
export const userClient = hc<UsersRouteType>(
  `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/users`,
  {
    init: {
      credentials: "include", // Important: include cookies for authentication
    },
  },
);
