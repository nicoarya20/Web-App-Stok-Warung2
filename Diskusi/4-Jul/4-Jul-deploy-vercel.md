# Rangkuman Diskusi — 4 Juli 2026
## Deploy ke Vercel

---

## Yang Dikerjakan

### Step 1 — Buat `api/index.ts` (Vercel Serverless Function) ✅

File ini menggantikan `server/index.ts` untuk production di Vercel.

```ts
// api/index.ts
import "dotenv/config";
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { auth } from "../server/auth.js"; // wajib pakai .js (ESM nodenext)

export const config = { runtime: "nodejs" }; // wajib — pg tidak support Edge runtime

const app = new Hono();
app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

const handler = handle(app);
export const GET = handler;
export const POST = handler;
```

> **Catatan:** Migrations tidak dijalankan di sini — tabel sudah ada di Supabase dari sesi sebelumnya.

---

### Step 2 — Buat `vercel.json` ✅

```json
{
  "buildCommand": "vite build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api" }
  ]
}
```

Rewrite ini yang membuat semua request `/api/auth/**` diarahkan ke satu serverless function.

---

### Step 3 — Hapus `better-sqlite3` dari `package.json` ✅

Dihapus karena sudah tidak dipakai (migrasi ke pg) dan bisa menyebabkan build error di Vercel (native addon yang butuh `node-gyp`).

- `better-sqlite3`
- `@types/better-sqlite3`

---

### Step 4 — Commit & Push ke GitHub ✅

Branch dibuat: `feat/vercel-deploy`, lalu di-merge ke `main`.

---

### Step 5 — Set Env Vars di Vercel Dashboard ✅

| Key | Keterangan |
|---|---|
| `DATABASE_URL` | Transaction pooler Supabase (port **6543**) |
| `BETTER_AUTH_URL` | `https://web-app-stok-warung2.vercel.app` |
| `BETTER_AUTH_SECRET` | Sama dengan di local `.env` |
| `GOOGLE_CLIENT_ID` | Dari Google Console |
| `GOOGLE_CLIENT_SECRET` | Dari Google Console |
| `SUPERADMIN_EMAIL` | Email superadmin |

---

### Step 6 — Update Google Console ✅

Di **Google Cloud Console → Credentials → OAuth 2.0 Client**:

- **Authorized redirect URIs:** tambah `https://web-app-stok-warung2.vercel.app/api/auth/callback/google`
- **Authorized JavaScript origins:** tambah `https://web-app-stok-warung2.vercel.app` dan `http://localhost:5173`
- **OAuth consent screen:** ubah dari Testing → **In production**

---

## Debug yang Ditemukan

### Bug 1 — `TS2835: Relative import paths need explicit file extensions`

**Error:**
```
api/index.ts(4,22): error TS2835: Relative import paths need explicit file extensions
```

**Root cause:** Vercel compile dengan `moduleResolution: nodenext`, ESM import wajib pakai ekstensi `.js` meski file aslinya `.ts`.

**Fix:** Ganti import dari `"../server/auth"` → `"../server/auth.js"`

---

### Bug 2 — `default export returned a Response` (WARN)

**Error:**
```
WARN: default export returned a `Response`. The default-export signature is `(req, res) => void`
```

**Root cause:** Vercel Node.js runtime expect named exports, bukan `default export`.

**Fix:** Ganti dari:
```ts
export default handle(app);
```
Ke:
```ts
const handler = handle(app);
export const GET = handler;
export const POST = handler;
```

---

### Bug 3 — `Error 401: invalid_client` dari Google OAuth

**Error:** "The OAuth client was not found."

**Root cause:** `GOOGLE_CLIENT_ID` di Vercel env vars tersimpan dengan tanda kutip literal di dalam nilainya. Terdeteksi dari Network tab DevTools — URL redirect ke Google mengandung `client_id=%22275303727436-...` (`%22` = URL-encoded tanda kutip `"`).

**Fix:** Edit env var `GOOGLE_CLIENT_ID` di Vercel dashboard → hapus semua karakter → ketik ulang nilainya tanpa tanda kutip → Redeploy.

> **Pelajaran:** Jangan copy-paste env var dari file `.env` yang formatnya `KEY="value"` — Vercel dashboard tidak strip tanda kutip otomatis. Selalu paste nilai-nya saja, tanpa tanda kutip.

---

## File yang Diubah/Dibuat

| File | Perubahan |
|---|---|
| `api/index.ts` | Baru — Vercel serverless function dengan Hono + named exports |
| `vercel.json` | Baru — build config dan rewrite rules |
| `package.json` | Hapus `better-sqlite3` dan `@types/better-sqlite3` |

---

## Langkah Selanjutnya

- [ ] Verifikasi login Google berhasil di production setelah fix env var `GOOGLE_CLIENT_ID`
- [ ] Test fitur-fitur app di Vercel (stok, transaksi, dashboard)
