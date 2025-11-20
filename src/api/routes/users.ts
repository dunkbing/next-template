import { Context, Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { getUserById, getUsersByTenant } from "@/app/actions/users";
import { getSessionFromContext } from "@/lib/session";
import { Variables } from "..";

// Create users router

// Middleware to require authentication
const requireAuth = async (c: Context, next: () => Promise<void>) => {
  const session = await getSessionFromContext(c);

  if (!session?.user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  c.set("user", session.user);
  return next();
};

const usersRoute = new Hono<{ Variables: Variables }>()
  // GET /users/me - Get current user profile
  .get("/me", async (c) => {
    const user = c.get("user");

    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userData = await getUserById(user.id);

    if (!userData) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json({
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        tenantId: userData.tenantId,
        roleId: userData.roleId,
        role: userData.role,
        customPermissions: userData.customPermissions,
      },
    });
  })
  // GET /users - Get all users in tenant
  .get("/", requireAuth, async (c) => {
    const user = c.get("user");

    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userData = await getUserById(user.id);

    if (!userData?.tenantId) {
      return c.json({ error: "No tenant associated" }, 400);
    }

    const result = await getUsersByTenant(userData.tenantId);

    if (!result.success) {
      return c.json({ error: result.error }, 500);
    }

    return c.json({
      users: result.users || [],
    });
  })
  // POST /users/update-profile - Update user profile
  .post(
    "/update-profile",
    requireAuth,
    zValidator(
      "json",
      z.object({
        name: z.string().min(1).optional(),
      }),
    ),
    async (c) => {
      const user = c.get("user");
      const body = c.req.valid("json");

      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      // Here you would update the user profile
      // For now, just return success
      return c.json({
        success: true,
        message: "Profile updated",
        name: body.name,
      });
    },
  );

export { usersRoute };
export type UsersRouteType = typeof usersRoute;
