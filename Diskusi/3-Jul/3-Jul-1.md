# Diskusi & Plan — 3 Juli 2026

## Kondisi Proyek Saat Ini

- **Stack:** React + TypeScript + Vite + Tailwind CSS v4
- **Single-file SPA:** semua logika ada di `src/app/App.tsx` (~691 baris)
- **Data:** hanya di React state — **reset saat halaman di-refresh**
- **Fitur aktif:** Dashboard, Stok Barang, Catat Jual
- **Belum ada:** persistence, riwayat transaksi, export, restock

---

## Prioritas Utama

### 1. Persistensi Data (localStorage) — KRITIS
Data hilang setiap refresh. Ini masalah paling dasar untuk pengguna nyata.

**Rencana:**
- Wrap `useState<Barang[]>` di `App.tsx` dengan custom hook `useLocalStorage`
- Key: `stok-warung-barangs`
- Otomatis simpan setiap perubahan (via `useEffect`)

**Effort:** ~30 menit | **Impact:** sangat tinggi

---

### 2. Pemisahan Komponen (Refactor) — PENTING
`App.tsx` mendekati batas 800 baris (CLAUDE.md). Sudah waktunya split.

**Rencana split:**
```
src/app/components/
  DashboardTab.tsx      ← konten tab dashboard
  StockTableTab.tsx     ← tabel stok + filter
  SalesLoggerTab.tsx    ← form catat jual
  BarangModal.tsx       ← modal tambah/edit barang
```
State & handlers tetap di `App.tsx`, diteruskan via props.

**Effort:** ~1 jam | **Impact:** maintainability jangka panjang

---

### 3. Fitur Restock — MEDIUM
Saat ini tidak ada cara menambah stok barang yang sudah hampir habis tanpa edit manual.

**Rencana:**
- Tab "Stok Barang" → tombol `+Restock` per baris
- Input qty yang ditambahkan ke `stokAwal`
- Tampil di alert "Stok Menipis" sebagai aksi cepat

**Effort:** ~45 menit | **Impact:** tinggi untuk UX

---

### 4. Riwayat Transaksi — MEDIUM
Tidak ada log kapan dan apa yang terjual. Penting untuk rekap harian.

**Rencana:**
- Tambah state `transaksi: Transaksi[]` di samping `barangs`
- Setiap `handleJual()` push record `{ id, barangId, nama, qty, hargaJual, timestamp }`
- Tab baru "Riwayat" atau section di Dashboard
- Simpan ke localStorage juga

**Effort:** ~1.5 jam | **Impact:** tinggi

---

### 5. Export CSV — NICE TO HAVE
Untuk rekap mingguan/bulanan pemilik warung.

**Rencana:**
- Tombol "Export" di tab Stok Barang
- Generate CSV dari `enriched` data
- Download langsung via `<a>` tag (no backend)

**Effort:** ~30 menit | **Impact:** medium

---

## Urutan Pengerjaan yang Disarankan

| # | Task | Effort | Prioritas |
|---|------|--------|-----------|
| 1 | localStorage persistence | ~30 menit | KRITIS |
| 2 | Split komponen | ~1 jam | PENTING |
| 3 | Fitur Restock | ~45 menit | Medium |
| 4 | Riwayat Transaksi | ~1.5 jam | Medium |
| 5 | Export CSV | ~30 menit | Nice to have |

---

## Catatan Teknis

- Tailwind v4 — jangan buat `tailwind.config.js`, semua token di `src/styles/theme.css`
- Icon hanya dari `lucide-react`
- Tidak ada test suite — manual test via browser
- Gunakan `bun run dev` untuk dev server (http://localhost:5173)

---

## Pertanyaan Terbuka

- [ ] Apakah perlu multi-periode (misal: reset data tiap bulan)?
- [ ] Perlu fitur login/auth? Atau cukup single-user?
- [ ] Riwayat transaksi disimpan berapa lama?
- [ ] Apakah mau tambah kategori baru selain yang ada sekarang?
