# Rangkuman Diskusi — 4 Juli 2026
## Migrate Data Barang & Transaksi: localStorage → Supabase

---

## Latar Belakang

Setelah deploy ke Vercel berhasil, ditemukan bahwa data barang dan transaksi masih disimpan di `localStorage` browser — bukan di database. Akibatnya data hilang kalau buka dari browser/device lain atau clear cache.

**Sebelum:**
```ts
const [barangs, setBarangs] = useLocalStorage<Barang[]>("stok-warung-barangs", INITIAL_DATA);
const [transaksi, setTransaksi] = useLocalStorage<Transaksi[]>("stok-warung-transaksi", []);
```

**Sesudah:** fetch ke API → data tersimpan di Supabase PostgreSQL.

---

## Analisis — Tabel yang Dibutuhkan

### Tabel `barang`
CRUD lengkap: Create (tambah barang), Read (StockTableTab, dropdown jual, dashboard), Update (edit + restock + catat jual), Delete.

### Tabel `transaksi`
Create (catat penjualan) + Read (TransaksiTab filter hari ini/7 hari/semua). Tidak ada Update/Delete — transaksi bersifat permanen.

**Tidak perlu tabel baru:** `sisaStok` dan `keuntungan` tetap derived di frontend.

---

## Yang Dikerjakan

### Step 1 — Buat tabel di Supabase SQL Editor ✅

```sql
CREATE TABLE barang (
  id         SERIAL PRIMARY KEY,
  nama       TEXT NOT NULL,
  kategori   TEXT NOT NULL DEFAULT 'Lainnya',
  harga_beli INTEGER NOT NULL DEFAULT 0,
  harga_jual INTEGER NOT NULL DEFAULT 0,
  stok_awal  INTEGER NOT NULL DEFAULT 0,
  terjual    INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE transaksi (
  id         SERIAL PRIMARY KEY,
  barang_id  INTEGER REFERENCES barang(id) ON DELETE SET NULL,
  nama       TEXT NOT NULL,
  qty        INTEGER NOT NULL,
  harga_jual INTEGER NOT NULL,
  harga_beli INTEGER NOT NULL,
  timestamp  BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

> Kedua tabel sudah ada karena `server/index.ts` menjalankan `CREATE TABLE IF NOT EXISTS` otomatis saat dev server pertama kali jalan.

> `ON DELETE SET NULL` pada `barang_id`: kalau barang dihapus, riwayat transaksi tetap ada, hanya `barang_id`-nya jadi NULL.

> Supabase meminta konfirmasi RLS saat run query → pilih **"Run without RLS"** karena kita akses DB via server sendiri (bukan Supabase JS client).

---

### Step 2 — `server/db.ts` (baru) ✅

Extract `pg Pool` ke file terpisah supaya bisa dipakai bersama oleh `auth.ts` dan route-route baru.

```ts
import pg from "pg";
const { Pool, types } = pg;

// Parse bigint (OID 20) sebagai JS number — aman untuk nilai timestamp kita
types.setTypeParser(20, (val: string) => parseInt(val, 10));

export const db = new Pool({ connectionString: process.env.DATABASE_URL });
```

> `types.setTypeParser(20, ...)` diperlukan karena `pg` library mengembalikan kolom `BIGINT` sebagai string by default. Kolom `timestamp` di tabel transaksi adalah BIGINT.

---

### Step 3 — `server/routes/barang.ts` (baru) ✅

| Method | Path | Fungsi |
|---|---|---|
| GET | `/api/barang` | List semua barang |
| POST | `/api/barang` | Tambah barang baru |
| PUT | `/api/barang/:id` | Edit semua field barang |
| PATCH | `/api/barang/:id/restock` | `stok_awal += qty` |
| DELETE | `/api/barang/:id` | Hapus barang |

Semua query pakai SQL alias untuk konversi snake_case → camelCase:
```sql
harga_beli AS "hargaBeli", harga_jual AS "hargaJual", stok_awal AS "stokAwal"
```

---

### Step 4 — `server/routes/transaksi.ts` (baru) ✅

| Method | Path | Fungsi |
|---|---|---|
| GET | `/api/transaksi` | List semua transaksi |
| POST | `/api/transaksi` | Catat jual (atomic) |

Endpoint `POST /api/transaksi` bersifat **atomic** menggunakan SQL transaction:
1. `SELECT ... FOR UPDATE` — lock baris barang
2. Cek stok tersedia
3. `UPDATE barang SET terjual = terjual + qty`
4. `INSERT INTO transaksi`
5. `COMMIT` (atau `ROLLBACK` kalau ada error)

---

### Step 5 — Update file yang sudah ada ✅

**`server/auth.ts`** — hapus Pool sendiri, import dari `db.ts`

**`server/index.ts`** — mount route baru + `CREATE TABLE IF NOT EXISTS` untuk dev

**`api/index.ts`** — tambah route baru + export HTTP method tambahan:
```ts
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
```

---

### Step 6 — `src/lib/api.ts` (baru) ✅

Frontend API client dengan typed functions:

```ts
export const api = {
  barang: {
    list, create, update, restock, delete
  },
  transaksi: {
    list, create
  },
};
```

---

### Step 7 — `src/app/App.tsx` ✅

**Dihapus:** `useLocalStorage` hook + `INITIAL_DATA`

**Ditambah:**
- `useState<Barang[]>([])` dan `useState<Transaksi[]>([])`
- `fetchAll()` dengan `Promise.all` load barang + transaksi paralel
- `useEffect` trigger fetch saat session tersedia
- `loading` state dengan spinner
- Semua handler (`handleSave`, `handleDelete`, `handleRestock`, `handleJual`) dijadikan `async` dan memanggil `api.*`

**`handleJual`** sekarang optimistic update:
```ts
const t = await api.transaksi.create(id, qty);
setTransaksi((prev) => [t, ...prev]);        // tambah ke state lokal
setBarangs((prev) => prev.map(...));          // update terjual lokal
```

---

## File yang Diubah/Dibuat

| File | Status | Perubahan |
|---|---|---|
| `server/db.ts` | Baru | Shared pg Pool + bigint parser |
| `server/routes/barang.ts` | Baru | CRUD endpoints barang |
| `server/routes/transaksi.ts` | Baru | List + atomic catat jual |
| `server/auth.ts` | Diubah | Import db dari db.ts |
| `server/index.ts` | Diubah | Mount routes + CREATE TABLE |
| `api/index.ts` | Diubah | Mount routes + PUT/PATCH/DELETE exports |
| `src/lib/api.ts` | Baru | Typed frontend API client |
| `src/app/App.tsx` | Diubah | Ganti useLocalStorage → API fetch |

---

## Langkah Selanjutnya

- [ ] Verifikasi CRUD barang berfungsi di Vercel (tambah, edit, hapus, restock)
- [ ] Verifikasi catat penjualan tersimpan ke Supabase
- [ ] Verifikasi data persists lintas browser/device
