# Rangkuman Diskusi — 4 Juli 2026
## Profile Page & Role System

---

## Latar Belakang

Sebelumnya klik avatar di header langsung memanggil `signOut()`. User ingin ada halaman profile yang proper — tampilannya beda tergantung role: user biasa hanya lihat profil, admin bisa kelola akun.

---

## Klarifikasi Role System

Ada 4 role di database, tapi dari sisi UX hanya 3 yang "aktif":

| Role di DB | Label di UI | Keterangan |
|---|---|---|
| `pending` | — | Default saat pertama login. Tidak bisa akses app, tampil halaman tunggu. |
| `user` | **Kasir** | Sudah di-approve. Bisa akses seluruh fitur app. |
| `admin` | Admin | Bisa approve akun pending → jadi Kasir. |
| `superadmin` | Superadmin | Bisa promote Kasir → Admin. |

> `"kasir"` bukan role tersendiri di database — hanya label display untuk `role = "user"`.

**Flow user baru:**
1. Login pertama → role otomatis `pending` (dari `defaultRole: "pending"` di `server/auth.ts`)
2. Tampil halaman "Menunggu persetujuan admin"
3. Admin approve → role berubah ke `user` → bisa akses app

**Akun Superadmin:** `nicoarya20@gmail.com` — dikonfirmasi sudah `superadmin` di Supabase. Role di-set otomatis saat pertama daftar via `databaseHooks` di `server/auth.ts` yang cek `SUPERADMIN_EMAIL` env var.

---

## Yang Dikerjakan

### Step 1 — `src/app/types.ts` ✅

Tambah `"profile"` ke type `Tab`:

```ts
export type Tab = "dashboard" | "stok" | "jual" | "riwayat" | "profile";
```

---

### Step 2 — `src/app/components/ProfileTab.tsx` (baru) ✅

Komponen full-screen profile page untuk user yang sudah approved (role: `user`, `admin`, `superadmin`).

**Tampilan per role:**

| Role | Konten |
|---|---|
| `user` (Kasir) | Avatar, nama, email, badge "Kasir", tombol Keluar |
| `admin` | Sama + section **"Kelola Akun"** → daftar pending users + tombol Approve |
| `superadmin` | Sama seperti admin + section **"Semua Kasir"** → tombol Jadikan Admin per user |

**Teknis:**
- Pakai `authClient.admin.listUsers()` dan `authClient.admin.setRole()` langsung dari frontend — tidak perlu endpoint baru karena `better-auth` admin plugin handle auth check-nya sendiri
- Optimistic update: setelah approve/promote, user langsung hilang dari list tanpa perlu refetch
- `actionLoading` state per user ID supaya tombol yang loading tidak block tombol lain

---

### Step 3 — `src/app/App.tsx` ✅

Dua perubahan:

1. **Klik avatar** — dari `signOut()` menjadi `setTab("profile")`
2. **Early return** — sebelum render app utama, cek apakah `tab === "profile"`:

```tsx
if (tab === "profile") {
  return (
    <ProfileTab
      user={session.user}
      role={role}
      onBack={() => setTab("dashboard")}
    />
  );
}
```

> Profile page bersifat full-screen (tanpa header/nav app) sama seperti pending page. Tombol "Kembali" mengembalikan ke Dashboard.

---

## File yang Diubah/Dibuat

| File | Status | Perubahan |
|---|---|---|
| `src/app/types.ts` | Diubah | Tambah `"profile"` ke type `Tab` |
| `src/app/components/ProfileTab.tsx` | Baru | Full-screen profile page untuk semua role |
| `src/app/App.tsx` | Diubah | Klik avatar → profile tab, tambah early return |

---

## Langkah Selanjutnya

- [ ] Verifikasi profile page tampil benar untuk role Kasir
- [ ] Verifikasi admin bisa approve user pending → user bisa akses app
- [ ] Verifikasi superadmin bisa promote Kasir → Admin
- [ ] Verifikasi data persist setelah approve (user tidak perlu login ulang)
