# Rangkuman Diskusi — 4 Juli 2026
## Migrate Database: SQLite → Supabase (PostgreSQL)

---

## Yang Dikerjakan

### Step 1 — Install PostgreSQL Adapter ✅

```bash
bun add pg
bun add -d @types/pg
```

---

### Step 2 — Update `server/auth.ts` ✅

**Sebelum (SQLite):**
```ts
import Database from "better-sqlite3";
const db = new Database("./local.db");
```

**Sesudah (PostgreSQL):**
```ts
import { Pool } from "pg";
const db = new Pool({ connectionString: process.env.DATABASE_URL });
```

**databaseHooks** juga diupdate — SQLite pakai sync API, pg pakai async:

```ts
// Sebelum (SQLite):
db.prepare("UPDATE user SET role = ? WHERE id = ?").run("superadmin", user.id);

// Sesudah (pg):
await db.query('UPDATE "user" SET role = $1 WHERE id = $2', ["superadmin", user.id]);
```

> **Catatan:** Nama tabel `user` harus di-quote (`"user"`) karena `user` adalah reserved word di PostgreSQL.

---

### Step 3 — Update `.env` ✅

Tambahkan `DATABASE_URL` dengan connection string Supabase:

```env
DATABASE_URL=postgresql://postgres.zbtiayttkxeajcozkkgz:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
```

---

### Step 4 — `server/index.ts` tidak perlu diubah ✅

`getMigrations` + `runMigrations()` yang sudah ada otomatis berjalan terhadap PostgreSQL — semua tabel (`user`, `session`, `account`, `verification`) dibuat otomatis di Supabase saat server pertama kali start.

---

## Debug — `ENOTFOUND db.zbtiayttkxeajcozkkgz.supabase.co` ✅

**Error:**
```
Error: getaddrinfo ENOTFOUND db.zbtiayttkxeajcozkkgz.supabase.co
```

**Root cause:** Supabase **Direct connection** pakai IPv6 by default. Jaringan lokal yang IPv4-only tidak bisa resolve hostname-nya.

**Fix:** Ganti ke **Session pooler** (bukan Direct connection) di Supabase dashboard → Settings → Database → Connection string.

- Direct connection: `db.{ref}.supabase.co:5432` → IPv6 only
- Session pooler: `aws-1-ap-southeast-1.pooler.supabase.com:5432` → IPv4 compatible ✅

---

## Hasil Akhir

- Server connect ke Supabase tanpa error
- Tabel Better Auth terbuat otomatis di Supabase
- Google OAuth login berhasil, data user masuk ke Supabase

---

## File yang Diubah

| File | Perubahan |
|---|---|
| `server/auth.ts` | Ganti `better-sqlite3` → `pg Pool`, update query syntax di `databaseHooks` |
| `.env` | Tambah `DATABASE_URL` dengan Session pooler Supabase |

---

## Langkah Selanjutnya

- [ ] Deploy ke Vercel
- [ ] Set env vars di Vercel dashboard
- [ ] Ganti `DATABASE_URL` ke Transaction pooler (port 6543) untuk Vercel
- [ ] Update redirect URI Google Console ke domain Vercel
