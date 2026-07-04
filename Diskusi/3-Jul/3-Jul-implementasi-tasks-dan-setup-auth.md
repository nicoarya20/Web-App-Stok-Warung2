# Rangkuman Diskusi — 3 Juli 2026
## Implementasi Tasks & Setup Auth

---

## Yang Dikerjakan Hari Ini

### Task #1 — localStorage Persistence ✅
- Tambah custom hook `useLocalStorage<T>` di `App.tsx`
- `useState<Barang[]>(INITIAL_DATA)` diganti ke `useLocalStorage("stok-warung-barangs", INITIAL_DATA)`
- Data tidak hilang saat refresh

### Task #2 — Split Komponen ✅
`App.tsx` (~700 baris) dipecah menjadi:
- `src/app/types.ts` — semua shared types, constants (`Barang`, `Transaksi`, `KATEGORI_OPTIONS`, `fmt`, dll)
- `src/app/components/DashboardTab.tsx` — tab dashboard + `StatCard`
- `src/app/components/StockTableTab.tsx` — tabel stok + filter + sort
- `src/app/components/SalesLoggerTab.tsx` — form catat jual
- `src/app/components/BarangModal.tsx` — modal tambah/edit + modal hapus

`App.tsx` turun ke ~162 baris, hanya berisi state, handler, dan layout.

### Task #3 — Fitur Restock ✅
- Tombol `PackagePlus` di setiap baris tabel (mobile & desktop)
- Tombol restock di alert "Stok Menipis" di Dashboard (aksi cepat tanpa ganti tab)
- `RestockModal` di `BarangModal.tsx` — input qty, preview stok baru, tombol hijau
- Handler `handleRestock(id, qty)` menambah qty ke `stokAwal`

### Task #4 — Riwayat Transaksi ✅
- Interface `Transaksi { id, barangId, nama, qty, hargaJual, hargaBeli, timestamp }` di `types.ts`
- State `transaksi[]` pakai `useLocalStorage("stok-warung-transaksi", [])`
- `handleJual()` push record transaksi setiap kali berhasil catat jual
- Tab baru "Riwayat" dengan ikon `ClipboardList`
- `TransaksiTab.tsx` — filter periode (Hari Ini / 7 Hari / Semua), summary cards, mobile list + desktop table

### Task #5 — Export CSV ⏭️ Skip
Diputuskan tidak perlu karena ini project pribadi.

---

## Diskusi Database

### Masalah localStorage
- Hanya tersimpan di satu browser di satu device
- Hilang jika user hapus data browser
- Tidak sinkron antar device (HP ↔ laptop)

### Keputusan Arsitektur
- Butuh multi-device (HP + laptop + beberapa orang) → localStorage tidak cukup
- Rencana: **Supabase** untuk database (gratis, PostgreSQL)
- Hosting: **Vercel** (gratis)
- **Tidak perlu Prisma** — Supabase punya JS client sendiri, tidak butuh backend layer
- **Tidak perlu Railway** — Supabase IS the backend

---

## Setup Auth (Better Auth + Google OAuth)

### Stack Auth
- **Better Auth** — auth library TypeScript-native
- **Hono** — lightweight server untuk handle OAuth callbacks (port 3001)
- **SQLite lokal** (`better-sqlite3`) — database sementara sebelum migrasi ke Supabase
- **Vite proxy** — `/api/*` di-forward dari port 5173 ke port 3001

### Arsitektur Dev
```
Browser → Vite (5173) → proxy /api/* → Hono server (3001) → Google OAuth
```

### Role System
| Role | Deskripsi |
|---|---|
| `superadmin` | Email `nicoarya20@gmail.com`, otomatis set saat pertama login |
| `admin` | Bisa approve user |
| `user` | User approved |
| `pending` | Default semua user baru — redirect ke ProfilePage |

### File yang Dibuat
- `server/auth.ts` — Better Auth config (Google OAuth, SQLite, roles, databaseHooks untuk auto-superadmin)
- `server/index.ts` — Hono server entry point
- `src/lib/auth-client.ts` — Better Auth React client (pakai `adminClient` plugin)
- `src/app/components/LoginPage.tsx` — halaman login dengan tombol "Masuk dengan Google"
- `src/app/components/ProfilePage.tsx` — halaman untuk user `pending` (foto profil + "Menunggu persetujuan admin")

### File yang Diubah
- `vite.config.ts` — tambah proxy `/api → http://localhost:3001`
- `package.json` — update script `dev` pakai `concurrently` (Vite + Hono jalan bersamaan)
- `src/app/App.tsx` — tambah `useSession`, early return ke LoginPage/ProfilePage, avatar di header sebagai tombol logout

### Env Vars yang Perlu Ditambahkan ke `.env`
```env
BETTER_AUTH_SECRET=xLdH1vvR18lSB9TO+gyYJ7gsWiCwtdOG7ibQccvqYSA=
BETTER_AUTH_URL=http://localhost:5173
SUPERADMIN_EMAIL=nicoarya20@gmail.com
```
*(GOOGLE_CLIENT_ID dan GOOGLE_CLIENT_SECRET sudah ada sebelumnya)*

### Google Console
- Authorized redirect URI yang sudah di-set: `http://localhost:5173/api/auth/callback/google`

---

## Dependencies Baru
```
better-auth        — auth library
hono               — lightweight server
@hono/node-server  — Node.js adapter untuk Hono
better-sqlite3     — SQLite driver
dotenv             — load .env di server
concurrently       — jalankan Vite + Hono bersamaan (dev)
tsx                — run TypeScript langsung (dev server)
```

---

## Langkah Selanjutnya
- [ ] Jalankan `bun run dev` dan test flow login Google
- [ ] Test role system: login dengan `nicoarya20@gmail.com` → harus jadi superadmin
- [ ] Test user lain → harus masuk ke halaman ProfilePage (pending)
- [ ] Setelah auth beres → migrate data ke **Supabase**
- [ ] Update redirect URI di Google Console untuk domain production

---

## Preferensi User (dicatat untuk sesi berikutnya)
- Jangan auto-run build — selalu tanya dulu
- Jangan simpan memori tanpa izin eksplisit
