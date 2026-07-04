import "dotenv/config";
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { auth } from "../server/auth.js";
import barangRoutes from "../server/routes/barang.js";
import transaksiRoutes from "../server/routes/transaksi.js";

export const config = { runtime: "nodejs" };

const app = new Hono();
app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));
app.route("/api/barang", barangRoutes);
app.route("/api/transaksi", transaksiRoutes);

const handler = handle(app);
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
