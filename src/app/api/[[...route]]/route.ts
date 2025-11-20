import { handle } from "hono/vercel";
import api from "@/api";
import { Hono } from "hono";

const app = new Hono();
app.route("/api", api);

const handlers = handle(app);

export const GET = handlers;
export const POST = handlers;
export const PUT = handlers;
export const PATCH = handlers;
export const DELETE = handlers;
