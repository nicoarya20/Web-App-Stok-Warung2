import { Hono } from "hono";
import { db } from "../db.js";

const SELECT = `id, nama, kategori,
  harga_beli AS "hargaBeli",
  harga_jual AS "hargaJual",
  stok_awal  AS "stokAwal",
  terjual`;

const app = new Hono();

app.get("/", async (c) => {
  const { rows } = await db.query(`SELECT ${SELECT} FROM barang ORDER BY nama`);
  return c.json(rows);
});

app.post("/", async (c) => {
  const { nama, kategori, hargaBeli, hargaJual, stokAwal, terjual } = await c.req.json();
  const { rows } = await db.query(
    `INSERT INTO barang (nama, kategori, harga_beli, harga_jual, stok_awal, terjual)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING ${SELECT}`,
    [nama, kategori, hargaBeli, hargaJual, stokAwal, terjual ?? 0]
  );
  return c.json(rows[0], 201);
});

app.put("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const { nama, kategori, hargaBeli, hargaJual, stokAwal, terjual } = await c.req.json();
  const { rows } = await db.query(
    `UPDATE barang SET nama=$1, kategori=$2, harga_beli=$3, harga_jual=$4, stok_awal=$5, terjual=$6
     WHERE id=$7 RETURNING ${SELECT}`,
    [nama, kategori, hargaBeli, hargaJual, stokAwal, terjual, id]
  );
  if (!rows[0]) return c.json({ error: "Not found" }, 404);
  return c.json(rows[0]);
});

app.patch("/:id/restock", async (c) => {
  const id = parseInt(c.req.param("id"));
  const { qty } = await c.req.json();
  const { rows } = await db.query(
    `UPDATE barang SET stok_awal = stok_awal + $1 WHERE id=$2 RETURNING ${SELECT}`,
    [qty, id]
  );
  if (!rows[0]) return c.json({ error: "Not found" }, 404);
  return c.json(rows[0]);
});

app.delete("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  await db.query("DELETE FROM barang WHERE id=$1", [id]);
  return c.json({ ok: true });
});

export default app;
