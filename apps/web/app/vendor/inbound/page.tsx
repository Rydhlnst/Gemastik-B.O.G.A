"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowDownToLine, Package, MapPin, FileText,
  Loader2, Plus, X, Search, CheckCircle2,
  Hash, Boxes, Building2, Tag,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import LocationPickerMapLibre from "@/components/ui/LocationPickerMapLibre";

/* ─── Constants ─── */
const API = "http://localhost:3001";
const G = "#065F46";
const G_LIGHT = "#D1FAE5";

/* ─── Types ─── */
interface Commodity { id: string; name: string; unit: string; current_stock: number; }
interface Movement {
  id: string; commodity_id: string; quantity: number;
  origin_source_name: string; origin_source_location: string;
  origin_proof_url: string; origin_proof_hash: string;
  created_at: string;
}
interface FormState {
  commodity_id: string;
  quantity: string;
  origin_source_name: string;
  origin_lat: string;
  origin_lng: string;
  origin_proof_url: string;
}

const EMPTY: FormState = {
  commodity_id: "", quantity: "",
  origin_source_name: "", origin_lat: "", origin_lng: "", origin_proof_url: "",
};

/* ─── Helpers ─── */
const inputCls = "h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm placeholder:text-slate-300 focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 transition-all shadow-sm shadow-black/[0.03]";

function FLabel({ children }: { children: React.ReactNode }) {
  return <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-0.5">{children}</span>;
}

function truncateHash(h: string) {
  return h ? `${h.slice(0, 10)}...${h.slice(-6)}` : "—";
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

/* ─── Commodity Picker ─── */
function CommodityPicker({ commodities, selected, onSelect }: {
  commodities: Commodity[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const filtered = commodities.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="space-y-2">
      <div className="relative">
        <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Cari nama barang..."
          className="w-full h-11 pl-9 pr-4 rounded-2xl border border-slate-200 bg-slate-50 text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all" />
      </div>
      <div className="space-y-1 max-h-44 overflow-y-auto no-scrollbar">
        {filtered.length === 0 && (
          <p className="text-center text-xs text-slate-400 py-5">Tidak ada barang ditemukan</p>
        )}
        {filtered.map(c => {
          const isSelected = selected === c.id;
          return (
            <button key={c.id} type="button" onClick={() => onSelect(c.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border text-left transition-all ${isSelected ? "border-emerald-500 bg-emerald-50" : "border-transparent bg-slate-50 hover:bg-slate-100"}`}>
              <div>
                <p className={`text-sm font-semibold ${isSelected ? "text-emerald-700" : "text-slate-700"}`}>{c.name}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Stok saat ini: <span className="font-bold">{c.current_stock.toLocaleString("id-ID")} {c.unit}</span></p>
              </div>
              {isSelected && (
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: G }}>
                  <CheckCircle2 size={11} className="text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Movement History Card ─── */
function MovementCard({ m, commodities }: { m: Movement; commodities: Commodity[] }) {
  const commodity = commodities.find(c => c.id === m.commodity_id);
  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: G_LIGHT }}>
            <ArrowDownToLine size={13} style={{ color: G }} />
          </div>
          <div>
            <p className="text-xs font-extrabold text-slate-700">{commodity?.name ?? m.commodity_id}</p>
            <p className="text-[10px] text-slate-400 font-mono">{m.id}</p>
          </div>
        </div>
        <Badge className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: G_LIGHT, color: G }}>
          +{m.quantity.toLocaleString("id-ID")} {commodity?.unit ?? "unit"}
        </Badge>
      </div>

      {/* Details */}
      <div className="px-4 py-3 space-y-2">
        <div className="flex items-start gap-2.5">
          <Building2 size={12} className="text-slate-300 mt-0.5 shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sumber Barang</p>
            <p className="text-xs text-slate-700 font-semibold mt-0.5">{m.origin_source_name}</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <MapPin size={12} className="text-slate-300 mt-0.5 shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lokasi Asal</p>
            {(() => {
              const parts = m.origin_source_location?.split(",");
              if (parts?.length === 2) {
                const [lat, lng] = parts;
                return (
                  <a
                    href={`https://maps.google.com/?q=${lat},${lng}`}
                    target="_blank" rel="noreferrer"
                    className="text-xs font-semibold mt-0.5 flex items-center gap-1"
                    style={{ color: "#1D4ED8" }}>
                    <MapPin size={10} /> {parseFloat(lat).toFixed(5)}, {parseFloat(lng).toFixed(5)}
                  </a>
                );
              }
              return <p className="text-xs text-slate-700 font-semibold mt-0.5">{m.origin_source_location}</p>;
            })()}
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <Hash size={12} className="text-slate-300 mt-0.5 shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Zero-Trust Hash Nota</p>
            <p className="text-[10px] text-slate-600 font-mono mt-0.5 break-all">{truncateHash(m.origin_proof_hash)}</p>
          </div>
        </div>
        {m.origin_proof_url && (
          <a href={m.origin_proof_url} target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 text-[10px] font-bold mt-1 transition-colors"
            style={{ color: G }}>
            <FileText size={11} /> Lihat Bukti Nota
          </a>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
        <p className="text-[10px] text-slate-400">{formatDate(m.created_at)}</p>
      </div>
    </motion.div>
  );
}

/* ─── Add Sheet ─── */
function AddInboundSheet({ open, onClose, vendorId, commodities, onAdded }: {
  open: boolean; onClose: () => void; vendorId: string;
  commodities: Commodity[]; onAdded: () => void;
}) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(false);
  const set = (k: keyof FormState, v: string) => setForm(p => ({ ...p, [k]: v }));

  const selectedCommodity = commodities.find(c => c.id === form.commodity_id);

  const handleSubmit = async () => {
    if (!form.commodity_id) { toast.error("Pilih barang terlebih dahulu."); return; }
    if (!form.quantity || Number(form.quantity) <= 0) { toast.error("Jumlah stok harus lebih dari 0."); return; }
    if (!form.origin_source_name) { toast.error("Nama sumber/supplier wajib diisi."); return; }
    if (!form.origin_lat || !form.origin_lng) { toast.error("Pilih lokasi asal di peta."); return; }
    if (!form.origin_proof_url) { toast.error("Bukti nota pembayaran wajib dilampirkan."); return; }

    setLoading(true);
    const t = toast.loading("Mencatat stok masuk...");
    try {
      const res = await fetch(`${API}/api/vendors/${vendorId}/inbound`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendor_id: vendorId,
          commodity_id: form.commodity_id,
          quantity: Number(form.quantity),
          origin_source_name: form.origin_source_name,
          origin_source_location: `${form.origin_lat},${form.origin_lng}`,
          origin_proof_url: form.origin_proof_url,
        }),
      });
      const json = await res.json();
      toast.dismiss(t);
      if (json.status === "success") {
        toast.success("Stok berhasil dicatat! Hash nota dikunci.");
        setForm(EMPTY);
        onAdded();
        onClose();
      } else {
        toast.error(json.message ?? "Gagal mencatat stok.");
      }
    } catch {
      toast.dismiss(t);
      toast.error("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
          <motion.div key="sh"
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            className="fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-[2rem] shadow-2xl max-h-[93svh] overflow-y-auto">

            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-slate-200" />
            </div>

            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-800">Catat Stok Masuk</h3>
                <p className="text-xs text-slate-400">Semua data dibuktikan dengan Zero-Trust Hash</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                <X size={15} />
              </button>
            </div>

            <div className="px-5 py-5 space-y-5 pb-8">
              {/* Pilih Barang */}
              <div>
                <FLabel>Pilih Barang</FLabel>
                <CommodityPicker commodities={commodities} selected={form.commodity_id} onSelect={id => set("commodity_id", id)} />
                {selectedCommodity && (
                  <div className="mt-2 flex items-center gap-2 rounded-2xl px-3 py-2.5 border" style={{ borderColor: "#A7F3D0", background: G_LIGHT }}>
                    <Boxes size={14} style={{ color: G }} />
                    <p className="text-xs font-bold" style={{ color: G }}>
                      Stok sekarang: {selectedCommodity.current_stock.toLocaleString("id-ID")} {selectedCommodity.unit}
                    </p>
                  </div>
                )}
              </div>

              {/* Jumlah */}
              <div>
                <FLabel>Jumlah Stok Masuk {selectedCommodity ? `(${selectedCommodity.unit})` : ""}</FLabel>
                <Input type="number" className={inputCls} value={form.quantity}
                  onChange={e => set("quantity", e.target.value)} placeholder="500" />
                {selectedCommodity && form.quantity && Number(form.quantity) > 0 && (
                  <p className="text-[10px] text-emerald-600 mt-1 ml-1 font-semibold">
                    Stok akan menjadi: {(selectedCommodity.current_stock + Number(form.quantity)).toLocaleString("id-ID")} {selectedCommodity.unit}
                  </p>
                )}
              </div>

              {/* Sumber Barang */}
              <div>
                <FLabel>Nama Sumber / Supplier</FLabel>
                <Input className={inputCls} value={form.origin_source_name}
                  onChange={e => set("origin_source_name", e.target.value)}
                  placeholder="UD. Sumber Pangan / Pasar Induk Gedebage" />
              </div>

              {/* Lokasi Asal — Map Picker */}
              <div>
                <FLabel>Lokasi Asal Barang (Pilih di Peta)</FLabel>
                <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm" style={{ height: 220 }}>
                  <LocationPickerMapLibre
                    onLocationChange={(lat, lng) =>
                      setForm(p => ({ ...p, origin_lat: String(lat), origin_lng: String(lng) }))
                    }
                  />
                </div>
                {form.origin_lat && form.origin_lng ? (
                  <div className="mt-2 flex items-center gap-2 rounded-2xl px-3 py-2 border border-emerald-100 bg-emerald-50">
                    <MapPin size={12} className="text-emerald-500 shrink-0" />
                    <p className="text-[11px] font-bold text-emerald-700">
                      {parseFloat(form.origin_lat).toFixed(6)}, {parseFloat(form.origin_lng).toFixed(6)}
                    </p>
                    <button type="button" onClick={() => setForm(p => ({ ...p, origin_lat: "", origin_lng: "" }))}
                      className="ml-auto text-slate-400 hover:text-slate-600">
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400 mt-1.5 ml-1">Klik pada peta untuk menentukan koordinat lokasi asal barang</p>
                )}
              </div>

              {/* Bukti Nota */}
              <div>
                <FLabel>URL Bukti Nota Pembayaran (R2)</FLabel>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <FileText size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                    <Input className={`${inputCls} pl-9`} value={form.origin_proof_url}
                      onChange={e => set("origin_proof_url", e.target.value)}
                      placeholder="https://r2.boga.id/nota/..." />
                  </div>
                </div>
                {form.origin_proof_url && (
                  <div className="mt-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2 flex items-start gap-2">
                    <Hash size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-emerald-700 leading-relaxed">
                      SHA-256 hash akan dikalkulasi otomatis dan dikunci ke <strong>Blockchain B.O.G.A</strong> saat submit.
                    </p>
                  </div>
                )}
              </div>

              {/* Submit */}
              <button onClick={handleSubmit} disabled={loading}
                className="w-full h-12 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 disabled:opacity-60 active:scale-[0.98] transition-all"
                style={{ background: G }}>
                {loading
                  ? <><Loader2 size={16} className="animate-spin" /> Mencatat...</>
                  : <><ArrowDownToLine size={16} /> Catat Stok Masuk</>}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Main Page ─── */
export default function VendorInboundPage() {
  const [vendorId, setVendorId] = useState("ACC-VEN-5E1FD92B");
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!vendorId) return;
    setLoadingData(true);
    try {
      const [comRes] = await Promise.all([
        fetch(`${API}/api/vendors/${vendorId}/commodities`),
      ]);
      const comJson = await comRes.json();
      if (comJson.status === "success") setCommodities(comJson.data ?? []);
      // NOTE: movements history endpoint TBD
      setMovements([]);
    } catch { /* silent */ }
    finally { setLoadingData(false); }
  }, [vendorId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalInbound = movements.reduce((a, m) => a + m.quantity, 0);

  return (
    <div className="min-h-svh bg-slate-50" data-role="vendor">
      {/* ── Header ── */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-base font-extrabold text-slate-800 leading-none">Stok Masuk</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">{commodities.length} barang terdaftar</p>
          </div>
          <button onClick={() => setSheetOpen(true)}
            className="flex items-center gap-1.5 h-9 px-4 rounded-2xl text-xs font-bold text-white shadow shadow-emerald-200 active:scale-[0.97] transition-all"
            style={{ background: G }}>
            <Plus size={14} /> Catat Inbound
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4 pb-24">
        {/* Vendor ID helper */}
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
          <Tag size={13} className="text-slate-300 shrink-0" />
          <Input value={vendorId} onChange={e => setVendorId(e.target.value)}
            placeholder="Vendor ID..." onBlur={fetchData}
            className="border-0 h-7 p-0 text-xs font-mono text-slate-500 bg-transparent focus-visible:ring-0 shadow-none" />
          <button onClick={fetchData} className="text-[10px] font-bold px-2 py-1 rounded-lg shrink-0"
            style={{ color: G, background: G_LIGHT }}>Muat</button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Package, label: "Barang", value: commodities.length, color: G },
            { icon: ArrowDownToLine, label: "Inbound", value: movements.length, color: "#1D4ED8" },
            { icon: Boxes, label: "Total Unit", value: totalInbound.toLocaleString("id-ID"), color: "#7C3AED" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 p-3 shadow-sm">
              <Icon size={14} style={{ color }} />
              <p className="text-base font-extrabold text-slate-800 mt-1 leading-none">{value}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{label}</p>
            </div>
          ))}
        </div>

        {/* Stock Overview */}
        {commodities.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Stok Saat Ini</p>
            <div className="space-y-2">
              {commodities.map(c => {
                const pct = Math.min(100, (c.current_stock / 2000) * 100);
                return (
                  <div key={c.id} className="bg-white rounded-2xl border border-slate-100 px-4 py-3 shadow-sm">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-sm font-bold text-slate-700">{c.name}</p>
                      <p className="text-xs font-extrabold" style={{ color: G }}>
                        {c.current_stock.toLocaleString("id-ID")} <span className="font-normal text-slate-400">{c.unit}</span>
                      </p>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <motion.div className="h-full rounded-full"
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        style={{ background: pct < 20 ? "#EF4444" : pct < 50 ? "#F59E0B" : G }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Movement History */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Riwayat Inbound</p>
          {loadingData ? (
            <div className="space-y-3">
              {[1, 2].map(i => <div key={i} className="h-36 rounded-3xl bg-slate-100 animate-pulse" />)}
            </div>
          ) : movements.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center px-8">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: G_LIGHT }}>
                <ArrowDownToLine size={24} style={{ color: G }} />
              </div>
              <p className="text-sm font-bold text-slate-600">Belum Ada Riwayat</p>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Catat stok masuk pertama Anda. Setiap inbound akan dibuktikan dengan hash kriptografis.
              </p>
              <button onClick={() => setSheetOpen(true)}
                className="mt-4 flex items-center gap-2 h-10 px-5 rounded-2xl text-xs font-bold text-white shadow-lg shadow-emerald-200 active:scale-[0.97] transition-all"
                style={{ background: G }}>
                <Plus size={14} /> Catat Sekarang
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {movements.map(m => <MovementCard key={m.id} m={m} commodities={commodities} />)}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Sheet */}
      <AddInboundSheet
        open={sheetOpen} onClose={() => setSheetOpen(false)}
        vendorId={vendorId} commodities={commodities} onAdded={fetchData}
      />
    </div>
  );
}
