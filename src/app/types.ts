export type Kategori = "Minuman" | "Makanan" | "Snack" | "Sembako" | "Rokok" | "Lainnya";

export interface Barang {
  id: number;
  nama: string;
  kategori: Kategori;
  hargaBeli: number;
  hargaJual: number;
  stokAwal: number;
  terjual: number;
}

export type EnrichedBarang = Barang & { sisaStok: number; keuntungan: number };

export type SortKey = keyof Barang | "sisaStok" | "keuntungan";
export type Tab = "dashboard" | "stok" | "jual" | "riwayat";

export interface Transaksi {
  id: number;
  barangId: number;
  nama: string;
  qty: number;
  hargaJual: number;
  hargaBeli: number;
  timestamp: number;
}

export interface FormState {
  nama: string;
  kategori: Kategori;
  hargaBeli: string;
  hargaJual: string;
  stokAwal: string;
  terjual: string;
}

export interface JualForm {
  barangId: string;
  qty: string;
}

export const KATEGORI_OPTIONS: Kategori[] = ["Minuman", "Makanan", "Snack", "Sembako", "Rokok", "Lainnya"];

export const KATEGORI_COLOR: Record<Kategori, string> = {
  Minuman: "bg-blue-100 text-blue-700",
  Makanan: "bg-orange-100 text-orange-700",
  Snack: "bg-yellow-100 text-yellow-700",
  Sembako: "bg-green-100 text-green-700",
  Rokok: "bg-gray-100 text-gray-700",
  Lainnya: "bg-purple-100 text-purple-700",
};

export const INITIAL_DATA: Barang[] = [
  { id: 1, nama: "Indomie Goreng", kategori: "Makanan", hargaBeli: 2500, hargaJual: 3500, stokAwal: 100, terjual: 45 },
  { id: 2, nama: "Aqua 600ml", kategori: "Minuman", hargaBeli: 1500, hargaJual: 2500, stokAwal: 80, terjual: 52 },
  { id: 3, nama: "Teh Botol Sosro", kategori: "Minuman", hargaBeli: 3500, hargaJual: 5000, stokAwal: 60, terjual: 38 },
  { id: 4, nama: "Kopi Torabika Sachet", kategori: "Minuman", hargaBeli: 1000, hargaJual: 2000, stokAwal: 200, terjual: 95 },
  { id: 5, nama: "Rokok Sampoerna Mild", kategori: "Rokok", hargaBeli: 20000, hargaJual: 25000, stokAwal: 30, terjual: 18 },
  { id: 6, nama: "Chitato Rasa Sapi Panggang", kategori: "Snack", hargaBeli: 8000, hargaJual: 12000, stokAwal: 24, terjual: 14 },
  { id: 7, nama: "Pocari Sweat 350ml", kategori: "Minuman", hargaBeli: 5000, hargaJual: 7500, stokAwal: 36, terjual: 22 },
  { id: 8, nama: "Minyak Goreng 1L", kategori: "Sembako", hargaBeli: 15000, hargaJual: 18000, stokAwal: 15, terjual: 6 },
  { id: 9, nama: "Gula Pasir 1kg", kategori: "Sembako", hargaBeli: 14000, hargaJual: 17000, stokAwal: 10, terjual: 4 },
  { id: 10, nama: "Sabun Lifebuoy Batang", kategori: "Lainnya", hargaBeli: 3000, hargaJual: 5000, stokAwal: 20, terjual: 9 },
  { id: 11, nama: "Beng-Beng Wafer", kategori: "Snack", hargaBeli: 2000, hargaJual: 3000, stokAwal: 5, terjual: 3 },
  { id: 12, nama: "Pop Ice Sachet", kategori: "Minuman", hargaBeli: 500, hargaJual: 1000, stokAwal: 150, terjual: 70 },
];

export const EMPTY_FORM: FormState = {
  nama: "",
  kategori: "Makanan",
  hargaBeli: "",
  hargaJual: "",
  stokAwal: "",
  terjual: "0",
};

export const fmt = (n: number) => "Rp " + n.toLocaleString("id-ID");
