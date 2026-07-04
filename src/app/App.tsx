import { useState, useMemo, useEffect, useCallback } from "react";
import { Plus, Package, ShoppingCart, BarChart2, ClipboardList } from "lucide-react";
import { Barang, Kategori, FormState, JualForm, SortKey, Tab, Transaksi, EMPTY_FORM, fmt } from "@/app/types";
import { useSession, signOut } from "@/lib/auth-client";
import { api } from "@/lib/api";
import DashboardTab from "@/app/components/DashboardTab";
import StockTableTab from "@/app/components/StockTableTab";
import SalesLoggerTab from "@/app/components/SalesLoggerTab";
import TransaksiTab from "@/app/components/TransaksiTab";
import { BarangModal, DeleteConfirmModal, RestockModal } from "@/app/components/BarangModal";
import LoginPage from "@/app/components/LoginPage";
import ProfilePage from "@/app/components/ProfilePage";
import ProfileTab from "@/app/components/ProfileTab";

export default function App() {
  const { data: session, isPending: sessionLoading } = useSession();

  const [tab, setTab] = useState<Tab>("dashboard");
  const [barangs, setBarangs] = useState<Barang[]>([]);
  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState(true);
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
  const [restockTarget, setRestockTarget] = useState<Barang | null>(null);

  const fetchAll = useCallback(async () => {
    const [b, t] = await Promise.all([api.barang.list(), api.transaksi.list()]);
    setBarangs(b);
    setTransaksi(t);
  }, []);

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    fetchAll().finally(() => setLoading(false));
  }, [session, fetchAll]);

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

  async function handleSave() {
    const data = {
      nama: form.nama,
      kategori: form.kategori,
      hargaBeli: parseInt(form.hargaBeli) || 0,
      hargaJual: parseInt(form.hargaJual) || 0,
      stokAwal: parseInt(form.stokAwal) || 0,
      terjual: parseInt(form.terjual) || 0,
    };
    if (!data.nama.trim()) return;
    if (editId !== null) {
      await api.barang.update(editId, data);
    } else {
      await api.barang.create(data);
    }
    setShowModal(false);
    api.barang.list().then(setBarangs);
  }

  async function handleDelete(id: number) {
    await api.barang.delete(id);
    setDeleteConfirm(null);
    setBarangs((prev) => prev.filter((b) => b.id !== id));
  }

  async function handleRestock(id: number, qty: number) {
    const updated = await api.barang.restock(id, qty);
    setRestockTarget(null);
    setBarangs((prev) => prev.map((b) => (b.id === id ? updated : b)));
  }

  async function handleJual() {
    const id = parseInt(jualForm.barangId);
    const qty = parseInt(jualForm.qty) || 0;
    if (!id || qty <= 0) return;
    try {
      const t = await api.transaksi.create(id, qty);
      setTransaksi((prev) => [t, ...prev]);
      setBarangs((prev) => prev.map((b) => (b.id === id ? { ...b, terjual: b.terjual + qty } : b)));
      const b = barangs.find((x) => x.id === id);
      setJualMsg(`✓ Berhasil mencatat penjualan ${qty}x ${b?.nama} — ${fmt((b?.hargaJual ?? 0) * qty)}`);
      setJualForm({ barangId: "", qty: "1" });
    } catch (e: unknown) {
      setJualMsg(e instanceof Error ? e.message : "Terjadi kesalahan");
    }
  }

  const Spinner = () => (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (sessionLoading) return <Spinner />;
  if (!session) return <LoginPage />;

  const role = (session.user as { role?: string }).role;
  if (!role || role === "pending") return <ProfilePage user={session.user} />;

  if (loading) return <Spinner />;

  if (tab === "profile") {
    return (
      <ProfileTab
        user={session.user as { id: string; name: string; email: string; image?: string | null }}
        role={role}
        onBack={() => setTab("dashboard")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background font-body">
      <header className="bg-primary text-primary-foreground shadow-lg sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-accent rounded-lg p-1.5">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight font-display">Stok Warung</h1>
              <p className="text-xs opacity-75 leading-none">Kelola Jualan & Untung Rugi</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={openAdd}
              className="flex items-center gap-1.5 bg-accent text-accent-foreground px-2.5 sm:px-3 py-1.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" /><span className="hidden sm:inline">Tambah Barang</span>
            </button>
            {session.user.image ? (
              <img
                src={session.user.image}
                alt={session.user.name}
                onClick={() => setTab("profile")}
                className="w-8 h-8 rounded-full object-cover border-2 border-accent cursor-pointer hover:opacity-80 transition-opacity"
                title="Profil"
              />
            ) : (
              <button
                onClick={() => setTab("profile")}
                className="w-8 h-8 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center hover:opacity-80 transition-opacity"
                title="Profil"
              >
                {session.user.name.charAt(0).toUpperCase()}
              </button>
            )}
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-3 sm:px-4 flex gap-0.5 pb-0">
          {([["dashboard", "Dashboard", BarChart2], ["stok", "Stok Barang", Package], ["jual", "Catat Jual", ShoppingCart], ["riwayat", "Riwayat", ClipboardList]] as const).map(
            ([id, label, Icon]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${
                  tab === id
                    ? "bg-background text-primary"
                    : "text-primary-foreground/70 hover:text-primary-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            )
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {tab === "dashboard" && <DashboardTab stats={stats} enriched={enriched} chartData={chartData} onRestock={setRestockTarget} />}
        {tab === "stok" && (
          <StockTableTab
            filtered={filtered}
            search={search}
            setSearch={setSearch}
            filterKat={filterKat}
            setFilterKat={setFilterKat}
            sortKey={sortKey}
            sortAsc={sortAsc}
            handleSort={handleSort}
            openEdit={openEdit}
            onRestock={setRestockTarget}
            setDeleteConfirm={setDeleteConfirm}
          />
        )}
        {tab === "jual" && (
          <SalesLoggerTab
            barangs={barangs}
            enriched={enriched}
            jualForm={jualForm}
            setJualForm={setJualForm}
            jualMsg={jualMsg}
            setJualMsg={setJualMsg}
            handleJual={handleJual}
          />
        )}
        {tab === "riwayat" && <TransaksiTab transaksi={transaksi} />}
      </main>

      {showModal && (
        <BarangModal
          editId={editId}
          form={form}
          setForm={setForm}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}
      {deleteConfirm !== null && (
        <DeleteConfirmModal
          barang={barangs.find((b) => b.id === deleteConfirm)}
          onConfirm={() => handleDelete(deleteConfirm)}
          onClose={() => setDeleteConfirm(null)}
        />
      )}
      {restockTarget !== null && (
        <RestockModal
          barang={restockTarget}
          onConfirm={(qty) => handleRestock(restockTarget.id, qty)}
          onClose={() => setRestockTarget(null)}
        />
      )}
    </div>
  );
}
