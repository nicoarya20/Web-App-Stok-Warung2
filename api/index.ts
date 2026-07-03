import "dotenv/config";
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { auth } from "../server/auth.js";

export const config = { runtime: "nodejs" };

const app = new Hono();
app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

const handler = handle(app);

export const GET = handler;
export const POST = handler;
