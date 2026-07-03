import { X } from "lucide-react";
import { Barang, EnrichedBarang, JualForm, fmt } from "@/app/types";

interface SalesLoggerTabProps {
  barangs: Barang[];
  enriched: EnrichedBarang[];
  jualForm: JualForm;
  setJualForm: React.Dispatch<React.SetStateAction<JualForm>>;
  jualMsg: string | null;
  setJualMsg: (v: string | null) => void;
  handleJual: () => void;
}

export default function SalesLoggerTab({ barangs, enriched, jualForm, setJualForm, jualMsg, setJualMsg, handleJual }: SalesLoggerTabProps) {
  return (
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
                      <span className="font-semibold text-green-700">{fmt((b.hargaJual - b.hargaBeli) * qty)}</span>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          <button
            onClick={handleJual}
            disabled={!jualForm.barangId}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Catat Penjualan
          </button>

          {jualMsg && (
            <div className={`rounded-xl p-3 text-sm font-medium flex items-center justify-between ${jualMsg.startsWith("✓") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {jualMsg}
              <button onClick={() => setJualMsg(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
        <h3 className="font-display font-bold mb-3 text-sm text-muted-foreground uppercase tracking-wide">Barang Paling Laku</h3>
        <div className="space-y-2">
          {[...enriched].sort((a, b) => b.terjual - a.terjual).slice(0, 5).map((b, i) => (
            <div key={b.id} className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i === 0 ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>{i + 1}</span>
              <span className="flex-1 text-sm font-medium truncate min-w-0">{b.nama}</span>
              <span className="text-sm text-muted-foreground shrink-0">{b.terjual}x</span>
              <span className="text-sm font-semibold text-green-700 shrink-0">{fmt(b.keuntungan)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
