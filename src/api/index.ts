import { Hono } from "hono";
import { logger } from "hono/logger";
import { auth } from "@/lib/auth";
import { usersRoute } from "./routes/users";

// Define context types for Better Auth session
export type Variables = {
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
};

// Create the main Hono app with typed context
const app = new Hono<{ Variables: Variables }>();
app.use(logger());

// Global middleware to add session to context
app.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }

  c.set("user", session.user);
  c.set("session", session.session);
  return next();
});

// Health check endpoint (public)
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// Mount authenticated routes
app.route("/users", usersRoute);

// Export the app and its type for RPC
export default app;
export type AppType = typeof app;

if (require.main === module) {
  Bun.serve({
    fetch: app.fetch,
    port: 8080,
  });
}
