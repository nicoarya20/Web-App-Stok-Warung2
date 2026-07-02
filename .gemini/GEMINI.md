# Stok Warung Web Application — Gemini Context Guide

Dokumen ini ditujukan sebagai panduan komprehensif bagi AI (seperti Gemini) dan developer untuk memahami struktur proyek, arsitektur, dan cara kerja dari aplikasi **Stok Warung Web Application**.

---

## 1. Ringkasan Proyek (Project Overview)
Aplikasi **Stok Warung** adalah aplikasi berbasis web satu halaman (Single Page Application) yang digunakan untuk mengelola inventaris stok barang, mencatat transaksi penjualan secara instan, serta memantau statistik omzet dan profit (keuntungan/kerugian) pada warung kelontong atau toko kecil.

Proyek ini dibangun dari desain Figma menggunakan alat **Figma Make**, yang menghasilkan bundel kode React dengan Tailwind CSS v4 dan komponen-komponen UI modular (Shadcn UI).

---

## 2. Fitur Utama (Key Features)

### 📊 A. Dashboard Bisnis
Menyajikan statistik penting secara visual untuk memantau performa warung:
- **Kartu Ringkasan (Stat Cards):**
  - **Total Item:** Jumlah jenis produk yang terdaftar.
  - **Total Omzet:** Total pendapatan dari seluruh barang terjual (`hargaJual * terjual`).
  - **Total Untung:** Total laba bersih (`keuntungan`) beserta informasi total modal.
  - **Stok Menipis:** Indikator jumlah barang dengan sisa stok $\le 5$ unit.
- **Peringatan Stok Menipis (Low Stock Alert):** Banner merah dinamis yang memunculkan daftar barang dengan stok kritis agar pemilik segera melakukan restock.
- **Grafik Batang (Recharts Bar Chart):** Visualisasi interaktif "Top 7 Keuntungan Per Barang" untuk melihat produk mana yang menyumbang keuntungan bersih terbesar.
- **Ringkasan Per Kategori:** Tabel agregasi yang menampilkan jumlah produk, kuantitas terjual, dan total keuntungan berdasarkan masing-masing kategori barang.

### 📦 B. Stok Barang (Inventory Management)
Tabel inventaris interaktif untuk melacak dan mengelola data barang:
- **Pencarian & Penyaringan:** Cari produk berdasarkan nama, atau filter berdasarkan kategori (Minuman, Makanan, Snack, Sembako, Rokok, Lainnya).
- **Pengurutan Kolom (Sorting):** Klik pada header kolom untuk mengurutkan data (Ascending/Descending) berdasarkan nama barang, kategori, harga, sisa stok, atau keuntungan.
- **Aksi CRUD Lengkap:**
  - **Tambah/Edit Barang:** Popup form dengan validasi nama dan pratinjau margin keuntungan instan per barang.
  - **Hapus Barang:** Dialog konfirmasi sebelum menghapus barang dari basis data lokal.
- **Footer Akumulasi:** Baris terbawah tabel otomatis menghitung total harga beli, total harga jual, total stok awal, total terjual, sisa stok, dan total keuntungan dari barang-barang yang sedang difilter.

### 🛒 C. Catat Penjualan (Sales Logger)
Formulir khusus untuk mempercepat input transaksi penjualan:
- **Dropdown Pintar:** Hanya menampilkan barang yang masih memiliki sisa stok. Barang yang habis otomatis dinonaktifkan (`disabled`).
- **Pratinjau Instan:** Menampilkan detail harga jual, kalkulasi total pembayaran, dan laba bersih sebelum transaksi dicatat.
- **Pencatatan Cepat:** Menambah jumlah terjual (`terjual`) secara dinamis setelah menekan tombol "Catat Penjualan".
- **Daftar Barang Terlaris:** Menampilkan 5 produk dengan jumlah penjualan tertinggi.

---

## 3. Tech Stack & Dependensi
Aplikasi ini berjalan dengan ekosistem modern:
* **Framework Utama:** [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **Build Tool & Dev Server:** [Vite 6](https://vite.dev/)
* **CSS Framework:** [Tailwind CSS v4](https://tailwindcss.com/) (menggunakan `@tailwindcss/vite` untuk integrasi build compiler super cepat)
* **Pustaka Grafik:** [Recharts 2.15](https://recharts.org/)
* **Koleksi Ikon:** [Lucide React](https://lucide.dev/)
* **Komponen UI:** Shadcn UI (berbasis [Radix UI](https://www.radix-ui.com/))
* **Package Managers:** Mendukung `bun`, `pnpm`, dan `npm` (memiliki file `bun.lock` dan `pnpm-workspace.yaml`).

---

## 4. Struktur Direktori & Berkas Utama

```text
Stok Warung Web Application/
├── .gemini/
│   └── GEMINI.md                    # File panduan ini
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── figma/
│   │   │   │   └── ImageWithFallback.tsx  # Fallback gambar rusak/gagal load
│   │   │   └── ui/                  # Komponen visual Shadcn UI (Button, Card, Input, dll.)
│   │   └── App.tsx                  # Logika utama aplikasi, state, & layout halaman
│   ├── imports/
│   │   └── desain-baru.png          # Referensi visual desain baru
│   ├── styles/
│   │   ├── index.css                # Berkas entri gaya utama (import fonts, tailwind, & theme)
│   │   ├── fonts.css                # Mengimpor Google Fonts (Nunito & Plus Jakarta Sans)
│   │   ├── theme.css                # Skema warna, font default, & variabel tema Tailwind v4
│   │   ├── globals.css              # Custom styling global (kosong secara default)
│   │   └── tailwind.css             # Konfigurasi directive Tailwind CSS v4 & tw-animate-css
│   └── main.tsx                     # Entrypoint React DOM render
├── default_shadcn_theme.css         # Salinan konfigurasi theme default
├── package.json                     # Konfigurasi script build, dev, dan daftar dependencies
├── vite.config.ts                   # Konfigurasi plugin Vite & alias resolver path (@)
└── README.md                        # Instruksi dasar untuk menjalankan aplikasi
```

---

## 5. Struktur Data & Logika Bisnis

### Model Data Barang (`Barang`)
Data barang dikelola dalam satu state array di `App.tsx`:
```typescript
type Kategori = "Minuman" | "Makanan" | "Snack" | "Sembako" | "Rokok" | "Lainnya";

interface Barang {
  id: number;
  nama: string;
  kategori: Kategori;
  hargaBeli: number;
  hargaJual: number;
  stokAwal: number;
  terjual: number;
}
```

### Properti Terkalkulasi (Calculated Properties)
Ketika merender tabel dan menghitung statistik, aplikasi memperkaya model data dengan properti berikut secara dinamis melalui `useMemo` demi performa optimal:
1. **Sisa Stok:** `sisaStok = stokAwal - terjual`
2. **Keuntungan Bersih:** `keuntungan = (hargaJual - hargaBeli) * terjual`

---

## 6. Desain & Skema Warna
Desain menggunakan pendekatan modern dengan warna-warna hangat bertema warung kelontong tradisional yang premium. Pengaturan variabel CSS didefinisikan pada [theme.css](file:///Users/lukman/Downloads/Stok%20Warung%20Web%20Application/src/styles/theme.css):
* **Latar Belakang (Background):** Krem lembut (`#FFF8F0`)
* **Teks Utama (Foreground):** Cokelat tua gelap (`#2D1810`)
* **Warna Utama (Primary):** Merah bata/terakota hangat (`#D63B1A`)
* **Warna Sekunder:** Krem cerah (`#FDE8DB`)
* **Warna Aksen:** Oranye cerah (`#F5A623`)
* **Tipografi:** 
  - Header / Tampilan Judul (`font-display`): `Nunito`
  - Teks Utama / Body (`font-body`): `Plus Jakarta Sans`

---

## 7. Instruksi Menjalankan Aplikasi (Run Guide)

Untuk menjalankan proyek ini secara lokal, pastikan Node.js terinstal, lalu jalankan salah satu opsi di bawah ini pada terminal:

### Opsi A (Menggunakan Bun - Direkomendasikan karena lockfile tersedia)
```bash
bun install
bun run dev
```

### Opsi B (Menggunakan Pnpm)
```bash
pnpm install
pnpm dev
```

### Opsi C (Menggunakan Npm)
```bash
npm install
npm run dev
```

Server lokal akan berjalan di `http://localhost:5173`. Untuk membuild versi produksi:
```bash
npm run build
```

---

## 8. Panduan Tambahan untuk AI / Agent Coding
Jika Anda melakukan modifikasi pada kode program ini, harap ikuti aturan berikut:
1. **Kompatibilitas Tailwind v4:** Jangan gunakan skema konfigurasi Tailwind v3 (`tailwind.config.js`). Penyesuaian tema, utility class, dan layer dasar harus dilakukan di `src/styles/theme.css` or `src/styles/tailwind.css` menggunakan sintaksis Tailwind v4.
2. **Pustaka Ikon:** Gunakan ikon dari `lucide-react` yang sudah diimpor di `App.tsx` atau tambahkan ikon baru dari modul yang sama jika diperlukan.
3. **Pemisahan Komponen:** Jika `App.tsx` dirasa sudah terlalu besar (> 800 baris), pisahkan komponen tab (seperti `DashboardTab`, `StockTableTab`, dan `SalesLoggerTab`) ke berkas terpisah di dalam `src/app/components/` dengan tetap menjaga kerapihan import.
4. **Keamanan Data:** Aplikasi saat ini menyimpan data di memori React State (akan ter-reset saat reload). Jika ingin menambahkan fitur penyimpanan persisten, Anda bisa memigrasikannya ke `localStorage` dengan membalut `useState` di `App.tsx`.
