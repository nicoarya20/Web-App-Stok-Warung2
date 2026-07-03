import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { getMigrations } from "better-auth/db/migration";
import { auth } from "./auth";

const app = new Hono();

app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

const port = 3001;

const { runMigrations } = await getMigrations(auth.options);
await runMigrations();

serve({ fetch: app.fetch, port }, () => {
  console.log(`Auth server → http://localhost:${port}`);
});
