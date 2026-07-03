import { useState } from "react";
import { X, Trash2, PackagePlus } from "lucide-react";
import { Barang, FormState, Kategori, KATEGORI_OPTIONS, fmt } from "@/app/types";

interface BarangModalProps {
  editId: number | null;
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  onSave: () => void;
  onClose: () => void;
}

export function BarangModal({ editId, form, setForm, onSave, onClose }: BarangModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md border border-border max-h-[90dvh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-display font-bold text-base">{editId !== null ? "Edit Barang" : "Tambah Barang Baru"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
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
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-sm text-green-700">
              Margin per pcs: <strong>{fmt(parseInt(form.hargaJual || "0") - parseInt(form.hargaBeli || "0"))}</strong>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">Batal</button>
            <button onClick={onSave} disabled={!form.nama.trim()} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40">
              {editId !== null ? "Simpan Perubahan" : "Tambah Barang"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DeleteConfirmModalProps {
  barang: Barang | undefined;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteConfirmModal({ barang, onConfirm, onClose }: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-sm border border-border p-6 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Trash2 className="w-5 h-5 text-red-500" />
        </div>
        <h3 className="font-display font-bold mb-1.5">Hapus Barang?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {barang?.nama} akan dihapus dari daftar.
        </p>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">Batal</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90 transition-opacity">Hapus</button>
        </div>
      </div>
    </div>
  );
}

interface RestockModalProps {
  barang: Barang;
  onConfirm: (qty: number) => void;
  onClose: () => void;
}

export function RestockModal({ barang, onConfirm, onClose }: RestockModalProps) {
  const [qty, setQty] = useState("1");
  const sisaStok = barang.stokAwal - barang.terjual;
  const added = parseInt(qty) || 0;

  function handleSubmit() {
    if (added <= 0) return;
    onConfirm(added);
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-sm border border-border p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <PackagePlus className="w-4 h-4 text-green-600" />
            </div>
            <h3 className="font-display font-bold">Tambah Stok</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm font-semibold mb-0.5">{barang.nama}</p>
        <p className="text-xs text-muted-foreground mb-4">Sisa stok saat ini: <span className="font-semibold text-foreground">{sisaStok}</span></p>
        <div className="space-y-3">
          <Field label="Jumlah Stok Ditambah">
            <input
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              autoFocus
              className="w-full px-3 py-2.5 bg-input-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </Field>
          {added > 0 && (
            <p className="text-xs text-muted-foreground">
              Stok baru setelah restock: <span className="font-semibold text-green-700">{sisaStok + added}</span>
            </p>
          )}
          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">Batal</button>
            <button onClick={handleSubmit} disabled={added <= 0} className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40">
              Tambah Stok
            </button>
          </div>
        </div>
      </div>
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
