import { Hono } from "hono";
import { handle } from "hono/vercel";
import { zValidator } from "@hono/zod-validator";
import { registerUserSchema } from "@/db/schema";
import { initAuthConfig, verifyAuth } from "@hono/auth-js";
import { credentials } from "@/lib/auth";
import { honoAuthCallbacks } from "@/lib/auth/callbacks";

const app = new Hono().basePath("/api");

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// Initialize Auth.js configuration for Hono - use the same callbacks as NextAuth
app.use(
  "*",
  initAuthConfig((c) => {
    return {
      secret: process.env.AUTH_SECRET,
      providers: [credentials],
      ...honoAuthCallbacks,
    };
  }),
);

// protect endpoints - require authentication
app.use(verifyAuth());

app.get("/current", async (c) => {
  const auth = c.get("authUser");
  const user = auth.session.user;
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  return c.json(user, 200);
});

app.post("/users", zValidator("json", registerUserSchema), async (c) => {
  const auth = c.get("authUser");

  // User is authenticated, get their session data
  const session = auth.session;
  if (!session?.user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const data = c.req.valid("json");

  // Here you would typically save to database
  // For now, just return the validated data with user context
  return c.json(
    {
      success: true,
      data: {
        id: Math.random().toString(36).substring(7),
        ...data,
        createdAt: new Date().toISOString(),
        createdBy: session.user.email,
      },
    },
    201,
  );
});

app.get("/users", (c) => {
  const auth = c.get("authUser");
  const session = auth.session;
  console.log({ auth });

  if (!session?.user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // Return user info from session
  return c.json({
    user: session.user,
    // tenantId: session.user.tenantId,
    // permissions: session.user.permissions,
  });
});

// Export handlers for different HTTP methods
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
