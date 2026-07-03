import { ChevronDown, ChevronUp, Edit2, PackagePlus, Search, Trash2 } from "lucide-react";
import { Barang, EnrichedBarang, KATEGORI_COLOR, KATEGORI_OPTIONS, SortKey, Kategori, fmt } from "@/app/types";

interface StockTableTabProps {
  filtered: EnrichedBarang[];
  search: string;
  setSearch: (v: string) => void;
  filterKat: Kategori | "Semua";
  setFilterKat: (v: Kategori | "Semua") => void;
  sortKey: SortKey;
  sortAsc: boolean;
  handleSort: (key: SortKey) => void;
  openEdit: (b: Barang) => void;
  onRestock: (b: Barang) => void;
  setDeleteConfirm: (id: number) => void;
}

export default function StockTableTab({
  filtered,
  search,
  setSearch,
  filterKat,
  setFilterKat,
  sortKey,
  sortAsc,
  handleSort,
  openEdit,
  onRestock,
  setDeleteConfirm,
}: StockTableTabProps) {
  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (
      sortAsc ? <ChevronUp className="w-3 h-3 inline ml-0.5" /> : <ChevronDown className="w-3 h-3 inline ml-0.5" />
    ) : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
        <div className="relative sm:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari nama barang..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-input-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
          {(["Semua", ...KATEGORI_OPTIONS] as const).map((k) => (
            <button
              key={k}
              onClick={() => setFilterKat(k as Kategori | "Semua")}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors shrink-0 ${
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

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {filtered.map((b) => (
          <div key={b.id} className="bg-card rounded-xl border border-border p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0 mr-2">
                <p className="font-semibold text-sm leading-tight mb-1.5">{b.nama}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${KATEGORI_COLOR[b.kategori]}`}>{b.kategori}</span>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button onClick={() => onRestock(b)} className="p-1.5 rounded-lg hover:bg-green-100 text-green-600 transition-colors" title="Restock">
                  <PackagePlus className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setDeleteConfirm(b.id)} className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-x-3 gap-y-2.5 text-xs">
              <div>
                <p className="text-muted-foreground mb-0.5">Harga Beli</p>
                <p className="font-medium">{fmt(b.hargaBeli)}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-0.5">Harga Jual</p>
                <p className="font-medium">{fmt(b.hargaJual)}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-0.5">Terjual</p>
                <p className="font-semibold text-primary">{b.terjual} pcs</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-0.5">Stok Awal</p>
                <p className="font-medium">{b.stokAwal}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-0.5">Sisa Stok</p>
                <p className={`font-bold ${b.sisaStok <= 5 ? "text-red-600" : b.sisaStok <= 15 ? "text-yellow-600" : "text-green-700"}`}>{b.sisaStok}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-0.5">Keuntungan</p>
                <p className="font-semibold text-green-700">{fmt(b.keuntungan)}</p>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">Tidak ada barang ditemukan</div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
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
                    <span className={`font-bold ${b.sisaStok <= 5 ? "text-red-600" : b.sisaStok <= 15 ? "text-yellow-600" : "text-green-700"}`}>
                      {b.sisaStok}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-green-700">{fmt(b.keuntungan)}</td>
                  <td className="py-3 px-3">
                    <div className="flex gap-1.5 justify-center">
                      <button onClick={() => onRestock(b)} className="p-1.5 rounded-lg hover:bg-green-100 text-green-600 transition-colors" title="Restock">
                        <PackagePlus className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteConfirm(b.id)} className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-colors">
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
                  <td className="py-3 px-3 text-green-700">{fmt(filtered.reduce((s, b) => s + b.keuntungan, 0))}</td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
