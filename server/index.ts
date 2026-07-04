import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { getMigrations } from "better-auth/db/migration";
import { auth } from "./auth.js";
import { db } from "./db.js";
import barangRoutes from "./routes/barang.js";
import transaksiRoutes from "./routes/transaksi.js";

const app = new Hono();

app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));
app.route("/api/barang", barangRoutes);
app.route("/api/transaksi", transaksiRoutes);

// Create app tables if not exists (dev convenience — for prod run SQL in Supabase)
await db.query(`
  CREATE TABLE IF NOT EXISTS barang (
    id         SERIAL PRIMARY KEY,
    nama       TEXT NOT NULL,
    kategori   TEXT NOT NULL DEFAULT 'Lainnya',
    harga_beli INTEGER NOT NULL DEFAULT 0,
    harga_jual INTEGER NOT NULL DEFAULT 0,
    stok_awal  INTEGER NOT NULL DEFAULT 0,
    terjual    INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )
`);

await db.query(`
  CREATE TABLE IF NOT EXISTS transaksi (
    id         SERIAL PRIMARY KEY,
    barang_id  INTEGER REFERENCES barang(id) ON DELETE SET NULL,
    nama       TEXT NOT NULL,
    qty        INTEGER NOT NULL,
    harga_jual INTEGER NOT NULL,
    harga_beli INTEGER NOT NULL,
    timestamp  BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )
`);

const { runMigrations } = await getMigrations(auth.options);
await runMigrations();

serve({ fetch: app.fetch, port: 3001 }, () => {
  console.log("Auth server → http://localhost:3001");
});
