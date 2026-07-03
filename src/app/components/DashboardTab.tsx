import { AlertTriangle, Package, PackagePlus, ShoppingCart, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Barang, EnrichedBarang, KATEGORI_COLOR, KATEGORI_OPTIONS, fmt } from "@/app/types";

interface Stats {
  totalModal: number;
  totalOmzet: number;
  totalUntung: number;
  totalItem: number;
  lowStock: number;
}

interface DashboardTabProps {
  stats: Stats;
  enriched: EnrichedBarang[];
  chartData: { name: string; untung: number; terjual: number }[];
  onRestock: (b: Barang) => void;
}

export default function DashboardTab({ stats, enriched, chartData, onRestock }: DashboardTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={<Package className="w-5 h-5" />} label="Total Item" value={String(stats.totalItem)} color="bg-blue-50 text-blue-600" />
        <StatCard icon={<ShoppingCart className="w-5 h-5" />} label="Total Omzet" value={fmt(stats.totalOmzet)} color="bg-orange-50 text-orange-600" />
        <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Total Untung" value={fmt(stats.totalUntung)} color="bg-green-50 text-green-600" sub={`Modal: ${fmt(stats.totalModal)}`} />
        <StatCard icon={<AlertTriangle className="w-5 h-5" />} label="Stok Menipis" value={String(stats.lowStock)} color="bg-red-50 text-red-600" sub="≤ 5 pcs" warn={stats.lowStock > 0} />
      </div>

      {stats.lowStock > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" /> Peringatan Stok Menipis
          </p>
          <div className="flex flex-wrap gap-2">
            {enriched.filter((b) => b.sisaStok <= 5).map((b) => (
              <div key={b.id} className="flex items-center gap-1.5 bg-red-100 text-red-700 text-xs px-2.5 py-1 rounded-full font-medium">
                <span>{b.nama} — sisa {b.sisaStok}</span>
                <button onClick={() => onRestock(b)} className="hover:text-red-900 transition-colors" title="Restock">
                  <PackagePlus className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
        <h2 className="font-display font-bold text-foreground mb-4">Top 7 Keuntungan Per Barang</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}rb`} />
            <Tooltip
              formatter={(v: number, name: string) => [fmt(v), name === "untung" ? "Keuntungan" : "Terjual"]}
              contentStyle={{ borderRadius: 10, border: "1px solid var(--border)", fontSize: 12 }}
            />
            <Bar dataKey="untung" radius={[6, 6, 0, 0]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={i === 0 ? "#D63B1A" : i === 1 ? "#F5A623" : "#4CAF50"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

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
                    <td className="text-right py-2.5 font-semibold text-green-700">{fmt(totalUntung)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
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
