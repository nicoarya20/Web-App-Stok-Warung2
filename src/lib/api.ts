import type { Barang, Transaksi } from "@/app/types";

async function req<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error: string }).error || res.statusText);
  }
  return res.json() as Promise<T>;
}

export const api = {
  barang: {
    list: () => req<Barang[]>("/api/barang"),
    create: (data: Omit<Barang, "id">) =>
      req<Barang>("/api/barang", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Omit<Barang, "id">) =>
      req<Barang>(`/api/barang/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    restock: (id: number, qty: number) =>
      req<Barang>(`/api/barang/${id}/restock`, { method: "PATCH", body: JSON.stringify({ qty }) }),
    delete: (id: number) =>
      req<{ ok: boolean }>(`/api/barang/${id}`, { method: "DELETE" }),
  },
  transaksi: {
    list: () => req<Transaksi[]>("/api/transaksi"),
    create: (barangId: number, qty: number) =>
      req<Transaksi>("/api/transaksi", { method: "POST", body: JSON.stringify({ barangId, qty }) }),
  },
};
