import { Hono } from "hono";
import { db } from "../db.js";

const SELECT_T = `id, barang_id AS "barangId", nama, qty,
  harga_jual AS "hargaJual",
  harga_beli AS "hargaBeli",
  timestamp`;

const app = new Hono();

app.get("/", async (c) => {
  const { rows } = await db.query(
    `SELECT ${SELECT_T} FROM transaksi ORDER BY timestamp DESC`
  );
  return c.json(rows);
});

// Catat jual — atomic: update barang.terjual + insert transaksi
app.post("/", async (c) => {
  const { barangId, qty } = await c.req.json();
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const { rows: [b] } = await client.query(
      `SELECT id, nama,
        harga_jual AS "hargaJual",
        harga_beli AS "hargaBeli",
        stok_awal  AS "stokAwal",
        terjual
       FROM barang WHERE id=$1 FOR UPDATE`,
      [barangId]
    );
    if (!b) {
      await client.query("ROLLBACK");
      return c.json({ error: "Barang tidak ditemukan" }, 404);
    }

    const sisa = b.stokAwal - b.terjual;
    if (qty > sisa) {
      await client.query("ROLLBACK");
      return c.json({ error: `Stok ${b.nama} hanya tersisa ${sisa}` }, 400);
    }

    await client.query(
      "UPDATE barang SET terjual = terjual + $1 WHERE id=$2",
      [qty, barangId]
    );

    const { rows: [t] } = await client.query(
      `INSERT INTO transaksi (barang_id, nama, qty, harga_jual, harga_beli, timestamp)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING ${SELECT_T}`,
      [barangId, b.nama, qty, b.hargaJual, b.hargaBeli, Date.now()]
    );

    await client.query("COMMIT");
    return c.json(t, 201);
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
});

export default app;
