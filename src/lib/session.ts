import { Context } from "hono";
import { auth } from "./auth";

export async function getSessionFromContext(c: Context) {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });
  return session;
}
