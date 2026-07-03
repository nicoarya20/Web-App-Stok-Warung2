import { useMemo, useState } from "react";
import { ClipboardList } from "lucide-react";
import { Transaksi, fmt } from "@/app/types";

type Period = "today" | "week" | "all";

interface TransaksiTabProps {
  transaksi: Transaksi[];
}

export default function TransaksiTab({ transaksi }: TransaksiTabProps) {
  const [period, setPeriod] = useState<Period>("today");

  const filtered = useMemo(() => {
    const now = Date.now();
    const sorted = [...transaksi].sort((a, b) => b.timestamp - a.timestamp);
    if (period === "today") {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      return sorted.filter((t) => t.timestamp >= startOfDay.getTime());
    }
    if (period === "week") return sorted.filter((t) => t.timestamp >= now - 7 * 86400000);
    return sorted;
  }, [transaksi, period]);

  const summary = useMemo(() => ({
    count: filtered.length,
    totalItem: filtered.reduce((s, t) => s + t.qty, 0),
    totalOmzet: filtered.reduce((s, t) => s + t.hargaJual * t.qty, 0),
    totalUntung: filtered.reduce((s, t) => s + (t.hargaJual - t.hargaBeli) * t.qty, 0),
  }), [filtered]);

  function formatTime(ts: number) {
    return new Date(ts).toLocaleString("id-ID", {
      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
    });
  }

  const periodLabel = period === "today" ? " hari ini" : period === "week" ? " 7 hari terakhir" : "";

  return (
    <div className="space-y-4">
      {/* Period filter */}
      <div className="flex gap-2">
        {([["today", "Hari Ini"], ["week", "7 Hari"], ["all", "Semua"]] as [Period, string][]).map(([p, label]) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              period === p ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card rounded-xl border border-border p-3 shadow-sm text-center">
          <p className="text-xs text-muted-foreground mb-1">Transaksi</p>
          <p className="font-display font-bold text-xl">{summary.count}</p>
          <p className="text-xs text-muted-foreground">{summary.totalItem} item</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-3 shadow-sm text-center">
          <p className="text-xs text-muted-foreground mb-1">Total Omzet</p>
          <p className="font-display font-bold text-sm leading-snug">{fmt(summary.totalOmzet)}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-3 shadow-sm text-center">
          <p className="text-xs text-muted-foreground mb-1">Keuntungan</p>
          <p className="font-display font-bold text-sm leading-snug text-green-700">{fmt(summary.totalUntung)}</p>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center shadow-sm">
          <ClipboardList className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Belum ada transaksi{periodLabel}</p>
          <p className="text-xs text-muted-foreground mt-1">Catat penjualan di tab "Catat Jual"</p>
        </div>
      ) : (
        <>
          {/* Mobile list */}
          <div className="md:hidden space-y-2">
            {filtered.map((t) => (
              <div key={t.id} className="bg-card rounded-xl border border-border px-4 py-3 shadow-sm flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">{t.nama}</p>
                  <p className="text-xs text-muted-foreground">{formatTime(t.timestamp)}</p>
                </div>
                <span className="text-xs bg-secondary px-2 py-0.5 rounded-full font-medium shrink-0">{t.qty}x</span>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-primary">{fmt(t.hargaJual * t.qty)}</p>
                  <p className="text-xs text-green-700 font-medium">+{fmt((t.hargaJual - t.hargaBeli) * t.qty)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary/50 border-b border-border">
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Waktu</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Barang</th>
                  <th className="text-right py-3 px-4 text-muted-foreground font-semibold">Qty</th>
                  <th className="text-right py-3 px-4 text-muted-foreground font-semibold">Harga Jual</th>
                  <th className="text-right py-3 px-4 text-muted-foreground font-semibold">Total</th>
                  <th className="text-right py-3 px-4 text-muted-foreground font-semibold">Keuntungan</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                    <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">{formatTime(t.timestamp)}</td>
                    <td className="py-3 px-4 font-medium">{t.nama}</td>
                    <td className="py-3 px-4 text-right">{t.qty}</td>
                    <td className="py-3 px-4 text-right text-muted-foreground">{fmt(t.hargaJual)}</td>
                    <td className="py-3 px-4 text-right font-semibold text-primary">{fmt(t.hargaJual * t.qty)}</td>
                    <td className="py-3 px-4 text-right font-semibold text-green-700">{fmt((t.hargaJual - t.hargaBeli) * t.qty)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-secondary/40 border-t border-border font-semibold">
                  <td className="py-3 px-4 text-foreground" colSpan={4}>
                    Total — {summary.count} transaksi, {summary.totalItem} item
                  </td>
                  <td className="py-3 px-4 text-right text-primary">{fmt(summary.totalOmzet)}</td>
                  <td className="py-3 px-4 text-right text-green-700">{fmt(summary.totalUntung)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
