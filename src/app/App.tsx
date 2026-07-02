import { useState, useMemo } from "react";
import { Plus, Package, TrendingUp, ShoppingCart, AlertTriangle, X, Edit2, Trash2, ChevronUp, ChevronDown, BarChart2, Search, Sun, Moon } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

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

const KATEGORI_OPTIONS: Kategori[] = ["Minuman", "Makanan", "Snack", "Sembako", "Rokok", "Lainnya"];

const KATEGORI_COLOR: Record<Kategori, string> = {
  Minuman: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/20 dark:border-blue-900/50",
  Makanan: "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 border border-orange-200/20 dark:border-orange-900/50",
  Snack: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300 border border-yellow-200/20 dark:border-yellow-900/50",
  Sembako: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300 border border-green-200/20 dark:border-green-900/50",
  Rokok: "bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200/20 dark:border-zinc-700/50",
  Lainnya: "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200/20 dark:border-purple-900/50",
};

const INITIAL_DATA: Barang[] = [
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

const fmt = (n: number) =>
  "Rp " + n.toLocaleString("id-ID");

type Tab = "dashboard" | "stok" | "jual";
type SortKey = keyof Barang | "sisaStok" | "keuntungan";

interface FormState {
  nama: string;
  kategori: Kategori;
  hargaBeli: string;
  hargaJual: string;
  stokAwal: string;
  terjual: string;
}

const EMPTY_FORM: FormState = {
  nama: "",
  kategori: "Makanan",
  hargaBeli: "",
  hargaJual: "",
  stokAwal: "",
  terjual: "0",
};

interface JualForm {
  barangId: string;
  qty: string;
}

export default function App() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [barangs, setBarangs] = useState<Barang[]>(INITIAL_DATA);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [jualForm, setJualForm] = useState<JualForm>({ barangId: "", qty: "1" });
  const [jualMsg, setJualMsg] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("nama");
  const [sortAsc, setSortAsc] = useState(true);
  const [filterKat, setFilterKat] = useState<Kategori | "Semua">("Semua");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("darkMode");
      if (saved !== null) {
        const isDark = saved === "true";
        if (isDark) document.documentElement.classList.add("dark");
        else document.documentElement.classList.remove("dark");
        return isDark;
      }
      const systemPrefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (systemPrefers) document.documentElement.classList.add("dark");
      return systemPrefers;
    }
    return false;
  });

  function toggleDarkMode() {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem("darkMode", String(next));
      if (next) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
      return next;
    });
  }

  const enriched = useMemo(
    () =>
      barangs.map((b) => ({
        ...b,
        sisaStok: b.stokAwal - b.terjual,
        keuntungan: (b.hargaJual - b.hargaBeli) * b.terjual,
      })),
    [barangs]
  );

  const filtered = useMemo(() => {
    let list = enriched;
    if (filterKat !== "Semua") list = list.filter((b) => b.kategori === filterKat);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((b) => b.nama.toLowerCase().includes(q));
    }
    list = [...list].sort((a, b) => {
      const av = a[sortKey as keyof typeof a] ?? 0;
      const bv = b[sortKey as keyof typeof b] ?? 0;
      if (typeof av === "string" && typeof bv === "string")
        return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortAsc ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return list;
  }, [enriched, filterKat, search, sortKey, sortAsc]);

  const stats = useMemo(() => {
    const totalModal = enriched.reduce((s, b) => s + b.hargaBeli * b.terjual, 0);
    const totalOmzet = enriched.reduce((s, b) => s + b.hargaJual * b.terjual, 0);
    const totalUntung = enriched.reduce((s, b) => s + b.keuntungan, 0);
    const totalItem = barangs.length;
    const lowStock = enriched.filter((b) => b.sisaStok <= 5).length;
    return { totalModal, totalOmzet, totalUntung, totalItem, lowStock };
  }, [enriched, barangs]);

  const chartData = useMemo(
    () =>
      [...enriched]
        .sort((a, b) => b.keuntungan - a.keuntungan)
        .slice(0, 7)
        .map((b) => ({ name: b.nama.split(" ").slice(0, 2).join(" "), untung: b.keuntungan, terjual: b.terjual })),
    [enriched]
  );

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((v) => !v);
    else { setSortKey(key); setSortAsc(true); }
  }

  function openAdd() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  function openEdit(b: Barang) {
    setEditId(b.id);
    setForm({
      nama: b.nama,
      kategori: b.kategori,
      hargaBeli: String(b.hargaBeli),
      hargaJual: String(b.hargaJual),
      stokAwal: String(b.stokAwal),
      terjual: String(b.terjual),
    });
    setShowModal(true);
  }

  function handleSave() {
    const hb = parseInt(form.hargaBeli) || 0;
    const hj = parseInt(form.hargaJual) || 0;
    const sa = parseInt(form.stokAwal) || 0;
    const tj = parseInt(form.terjual) || 0;
    if (!form.nama.trim()) return;
    if (editId !== null) {
      setBarangs((prev) =>
        prev.map((b) =>
          b.id === editId ? { ...b, nama: form.nama, kategori: form.kategori, hargaBeli: hb, hargaJual: hj, stokAwal: sa, terjual: tj } : b
        )
      );
    } else {
      const id = Math.max(0, ...barangs.map((b) => b.id)) + 1;
      setBarangs((prev) => [...prev, { id, nama: form.nama, kategori: form.kategori, hargaBeli: hb, hargaJual: hj, stokAwal: sa, terjual: tj }]);
    }
    setShowModal(false);
  }

  function handleDelete(id: number) {
    setBarangs((prev) => prev.filter((b) => b.id !== id));
    setDeleteConfirm(null);
  }

  function handleJual() {
    const id = parseInt(jualForm.barangId);
    const qty = parseInt(jualForm.qty) || 0;
    const b = barangs.find((x) => x.id === id);
    if (!b || qty <= 0) return;
    const sisa = b.stokAwal - b.terjual;
    if (qty > sisa) { setJualMsg(`Stok ${b.nama} hanya tersisa ${sisa}!`); return; }
    setBarangs((prev) => prev.map((x) => x.id === id ? { ...x, terjual: x.terjual + qty } : x));
    setJualMsg(`✓ Berhasil mencatat penjualan ${qty}x ${b.nama} — ${fmt(b.hargaJual * qty)}`);
    setJualForm({ barangId: "", qty: "1" });
  }

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (
      sortAsc ? <ChevronUp className="w-3 h-3 inline ml-0.5" /> : <ChevronDown className="w-3 h-3 inline ml-0.5" />
    ) : null;

  return (
    <div className="min-h-screen bg-background font-body">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-accent rounded-lg p-1.5">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight font-display">Stok Warung</h1>
              <p className="text-xs opacity-75 leading-none">Kelola Jualan & Untung Rugi</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-primary-foreground/90 hover:bg-primary-foreground/10 hover:text-primary-foreground transition-all cursor-pointer"
              title="Ganti Tema"
            >
              {darkMode ? <Sun className="w-5 h-5 text-accent" /> : <Moon className="w-5 h-5 text-accent" />}
            </button>
            <button
              onClick={openAdd}
              className="flex items-center gap-1.5 bg-accent text-accent-foreground px-3 py-1.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Tambah Barang
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-4 flex gap-0.5 pb-0">
          {([["dashboard", "Dashboard", BarChart2], ["stok", "Stok Barang", Package], ["jual", "Catat Jual", ShoppingCart]] as const).map(
            ([id, label, Icon]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${
                  tab === id
                    ? "bg-background text-primary"
                    : "text-primary-foreground/70 hover:text-primary-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            )
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">

        {/* ── DASHBOARD ── */}
        {tab === "dashboard" && (
          <div className="space-y-6">
            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard icon={<Package className="w-5 h-5" />} label="Total Item" value={String(stats.totalItem)} color="bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-100/50 dark:border-blue-900/40" />
              <StatCard icon={<ShoppingCart className="w-5 h-5" />} label="Total Omzet" value={fmt(stats.totalOmzet)} color="bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-300 border border-orange-100/50 dark:border-orange-900/40" />
              <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Total Untung" value={fmt(stats.totalUntung)} color="bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-300 border border-green-100/50 dark:border-green-900/40" sub={`Modal: ${fmt(stats.totalModal)}`} />
              <StatCard icon={<AlertTriangle className="w-5 h-5" />} label="Stok Menipis" value={String(stats.lowStock)} color="bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300 border border-red-100/50 dark:border-red-900/40" sub="≤ 5 pcs" warn={stats.lowStock > 0} />
            </div>

            {/* Low stock alert */}
            {stats.lowStock > 0 && (
              <div className="bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-900/30 rounded-xl p-4">
                <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Peringatan Stok Menipis
                </p>
                <div className="flex flex-wrap gap-2">
                  {enriched.filter((b) => b.sisaStok <= 5).map((b) => (
                    <span key={b.id} className="bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300 text-xs px-2.5 py-1 rounded-full font-medium">
                      {b.nama} — sisa {b.sisaStok}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Chart */}
            <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
              <h2 className="font-display font-bold text-foreground mb-4">Top 7 Keuntungan Per Barang</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}rb`} />
                  <Tooltip
                    formatter={(v: number, name: string) => [fmt(v), name === "untung" ? "Keuntungan" : "Terjual"]}
                    contentStyle={{ borderRadius: 10, border: "1px solid var(--border)", fontSize: 12, backgroundColor: "var(--card)", color: "var(--foreground)" }}
                  />
                  <Bar dataKey="untung" radius={[6, 6, 0, 0]}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? "#D63B1A" : i === 1 ? "#F5A623" : "#4CAF50"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Per-kategori summary */}
            <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
              <h2 className="font-display font-bold text-foreground mb-4">Ringkasan Per Kategori</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Kategori</th>
                      <th className="text-right py-2 pr-4 text-muted-foreground font-medium">Jml Item</th>
                      <th className="text-right py-2 pr-4 text-muted-foreground font-medium">Terjual</th>
                      <th className="text-right py-2 text-muted-foreground font-medium">Keuntungan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {KATEGORI_OPTIONS.map((kat) => {
                      const items = enriched.filter((b) => b.kategori === kat);
                      if (!items.length) return null;
                      const totalTerjual = items.reduce((s, b) => s + b.terjual, 0);
                      const totalUntung = items.reduce((s, b) => s + b.keuntungan, 0);
                      return (
                        <tr key={kat} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                          <td className="py-2.5 pr-4">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${KATEGORI_COLOR[kat]}`}>{kat}</span>
                          </td>
                          <td className="text-right py-2.5 pr-4 font-medium">{items.length}</td>
                          <td className="text-right py-2.5 pr-4">{totalTerjual} pcs</td>
                          <td className="text-right py-2.5 font-semibold text-green-700 dark:text-green-400">{fmt(totalUntung)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── STOK BARANG ── */}
        {tab === "stok" && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Cari nama barang..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-input-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {(["Semua", ...KATEGORI_OPTIONS] as const).map((k) => (
                  <button
                    key={k}
                    onClick={() => setFilterKat(k as Kategori | "Semua")}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                      filterKat === k
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-muted"
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-secondary/50 border-b border-border">
                      {([
                        ["nama", "Nama Barang"],
                        ["kategori", "Kategori"],
                        ["hargaBeli", "Harga Beli"],
                        ["hargaJual", "Harga Jual"],
                        ["stokAwal", "Stok Awal"],
                        ["terjual", "Terjual"],
                        ["sisaStok", "Sisa Stok"],
                        ["keuntungan", "Keuntungan"],
                      ] as [SortKey, string][]).map(([k, label]) => (
                        <th
                          key={k}
                          onClick={() => handleSort(k)}
                          className="text-left py-3 px-3 text-muted-foreground font-semibold cursor-pointer hover:text-foreground transition-colors whitespace-nowrap select-none"
                        >
                          {label} <SortIcon k={k} />
                        </th>
                      ))}
                      <th className="py-3 px-3 text-muted-foreground font-semibold text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((b) => (
                      <tr key={b.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                        <td className="py-3 px-3 font-medium">{b.nama}</td>
                        <td className="py-3 px-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${KATEGORI_COLOR[b.kategori]}`}>{b.kategori}</span>
                        </td>
                        <td className="py-3 px-3 text-muted-foreground">{fmt(b.hargaBeli)}</td>
                        <td className="py-3 px-3">{fmt(b.hargaJual)}</td>
                        <td className="py-3 px-3">{b.stokAwal}</td>
                        <td className="py-3 px-3 text-primary font-semibold">{b.terjual}</td>
                        <td className="py-3 px-3">
                          <span className={`font-bold ${b.sisaStok <= 5 ? "text-red-600 dark:text-red-400" : b.sisaStok <= 15 ? "text-yellow-600 dark:text-yellow-400" : "text-green-700 dark:text-green-400"}`}>
                            {b.sisaStok}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-green-700 dark:text-green-400">{fmt(b.keuntungan)}</td>
                        <td className="py-3 px-3">
                          <div className="flex gap-1.5 justify-center">
                            <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-950/40 text-blue-600 dark:text-blue-400 transition-colors">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setDeleteConfirm(b.id)} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/40 text-red-500 dark:text-red-400 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={9} className="text-center py-12 text-muted-foreground">
                          Tidak ada barang ditemukan
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {filtered.length > 0 && (
                    <tfoot>
                      <tr className="bg-secondary/40 border-t border-border font-semibold">
                        <td className="py-3 px-3 text-foreground" colSpan={2}>Total</td>
                        <td className="py-3 px-3 text-muted-foreground">{fmt(filtered.reduce((s, b) => s + b.hargaBeli * b.terjual, 0))}</td>
                        <td className="py-3 px-3">{fmt(filtered.reduce((s, b) => s + b.hargaJual * b.terjual, 0))}</td>
                        <td className="py-3 px-3">{filtered.reduce((s, b) => s + b.stokAwal, 0)}</td>
                        <td className="py-3 px-3 text-primary">{filtered.reduce((s, b) => s + b.terjual, 0)}</td>
                        <td className="py-3 px-3">{filtered.reduce((s, b) => s + b.sisaStok, 0)}</td>
                        <td className="py-3 px-3 text-green-700 dark:text-green-400">{fmt(filtered.reduce((s, b) => s + b.keuntungan, 0))}</td>
                        <td />
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── CATAT JUAL ── */}
        {tab === "jual" && (
          <div className="max-w-lg mx-auto space-y-4">
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <h2 className="font-display font-bold text-lg mb-5">Catat Penjualan</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Pilih Barang</label>
                  <select
                    value={jualForm.barangId}
                    onChange={(e) => setJualForm((f) => ({ ...f, barangId: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-input-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">-- Pilih barang --</option>
                    {barangs.map((b) => {
                      const sisa = b.stokAwal - b.terjual;
                      return (
                        <option key={b.id} value={b.id} disabled={sisa === 0}>
                          {b.nama} — sisa {sisa} — {fmt(b.hargaJual)}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Jumlah</label>
                  <input
                    type="number"
                    min="1"
                    value={jualForm.qty}
                    onChange={(e) => setJualForm((f) => ({ ...f, qty: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-input-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                {jualForm.barangId && (
                  <div className="bg-secondary rounded-xl p-4 space-y-1.5 text-sm">
                    {(() => {
                      const b = barangs.find((x) => x.id === parseInt(jualForm.barangId));
                      const qty = parseInt(jualForm.qty) || 0;
                      if (!b) return null;
                      return (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Harga jual</span>
                            <span className="font-medium">{fmt(b.hargaJual)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total pembayaran</span>
                            <span className="font-bold text-primary">{fmt(b.hargaJual * qty)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Keuntungan</span>
                            <span className="font-semibold text-green-700 dark:text-green-400">{fmt((b.hargaJual - b.hargaBeli) * qty)}</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

                <button
                  onClick={handleJual}
                  disabled={!jualForm.barangId}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Catat Penjualan
                </button>

                {jualMsg && (
                  <div className={`rounded-xl p-3 text-sm font-medium flex items-center justify-between ${jualMsg.startsWith("✓") ? "bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30" : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30"}`}>
                    {jualMsg}
                    <button onClick={() => setJualMsg(null)} className="cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Recent sales summary */}
            <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
              <h3 className="font-display font-bold mb-3 text-sm text-muted-foreground uppercase tracking-wide">Barang Paling Laku</h3>
              <div className="space-y-2">
                {[...enriched].sort((a, b) => b.terjual - a.terjual).slice(0, 5).map((b, i) => (
                  <div key={b.id} className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>{i + 1}</span>
                    <span className="flex-1 text-sm font-medium">{b.nama}</span>
                    <span className="text-sm text-muted-foreground">{b.terjual}x</span>
                    <span className="text-sm font-semibold text-green-700 dark:text-green-400">{fmt(b.keuntungan)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── MODAL TAMBAH/EDIT ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md border border-border" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="font-display font-bold text-base">{editId !== null ? "Edit Barang" : "Tambah Barang Baru"}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3.5">
              <Field label="Nama Barang">
                <input
                  value={form.nama}
                  onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))}
                  placeholder="cth: Indomie Goreng"
                  className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </Field>
              <Field label="Kategori">
                <select
                  value={form.kategori}
                  onChange={(e) => setForm((f) => ({ ...f, kategori: e.target.value as Kategori }))}
                  className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {KATEGORI_OPTIONS.map((k) => <option key={k}>{k}</option>)}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Harga Beli (Rp)">
                  <input type="number" value={form.hargaBeli} onChange={(e) => setForm((f) => ({ ...f, hargaBeli: e.target.value }))} placeholder="2500" className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </Field>
                <Field label="Harga Jual (Rp)">
                  <input type="number" value={form.hargaJual} onChange={(e) => setForm((f) => ({ ...f, hargaJual: e.target.value }))} placeholder="3500" className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </Field>
                <Field label="Stok Awal">
                  <input type="number" value={form.stokAwal} onChange={(e) => setForm((f) => ({ ...f, stokAwal: e.target.value }))} placeholder="100" className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </Field>
                <Field label="Sudah Terjual">
                  <input type="number" value={form.terjual} onChange={(e) => setForm((f) => ({ ...f, terjual: e.target.value }))} placeholder="0" className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </Field>
              </div>

              {form.hargaBeli && form.hargaJual && (
                <div className="bg-green-50 border border-green-200 dark:bg-green-950/20 dark:border-green-900/30 rounded-xl px-4 py-2.5 text-sm text-green-700 dark:text-green-400">
                  Margin per pcs: <strong>{fmt(parseInt(form.hargaJual || "0") - parseInt(form.hargaBeli || "0"))}</strong>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">Batal</button>
                <button onClick={handleSave} disabled={!form.nama.trim()} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40">
                  {editId !== null ? "Simpan Perubahan" : "Tambah Barang"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-sm border border-border p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="font-display font-bold mb-1.5">Hapus Barang?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {barangs.find((b) => b.id === deleteConfirm)?.nama} akan dihapus dari daftar.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">Batal</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90 transition-opacity">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color, sub, warn }: { icon: React.ReactNode; label: string; value: string; color: string; sub?: string; warn?: boolean }) {
  return (
    <div className={`bg-card rounded-2xl border border-border p-4 shadow-sm ${warn ? "border-red-200" : ""}`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2.5 ${color}`}>{icon}</div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="font-display font-bold text-base leading-tight">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground mb-1">{label}</label>
      {children}
    </div>
  );
}
