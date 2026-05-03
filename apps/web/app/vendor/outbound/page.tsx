"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";
import {
  ArrowUpToLine, Package, MapPin, FileText,
  Loader2, Plus, X, Search, CheckCircle2,
  Hash, Boxes, Building2, Tag,
  Wheat, Beef, Fish, Sprout, ChefHat, Apple, Factory, LayoutGrid,
  UploadCloud, ImageIcon, FileX, Trash2, Clock, Truck, AlertCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import LocationPickerMapLibre from "@/components/ui/LocationPickerMapLibre";
import { logger } from "@/lib/logger";

/* ─── Constants ─── */
const API = "http://localhost:3001";
const O_COLOR = "#1D4ED8"; // Biru untuk Outbound
const O_LIGHT = "#DBEAFE";

/* ─── Types ─── */
interface Commodity { id: string; name: string; unit: string; current_stock: number; category: string; }
interface Movement {
  id: string; 
  commodity_id: string; 
  commodity_name: string;
  quantity: number;
  reason: string;
  reference_id: string;
  note: string;
  created_at: string;
}

/* ─── Helpers ─── */
const inputCls = "h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm placeholder:text-slate-300 focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500 transition-all shadow-sm shadow-black/[0.03]";

function FLabel({ children }: { children: React.ReactNode }) {
  return <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-0.5">{children}</span>;
}

function truncateHash(h: string) {
  return h ? `${h.slice(0, 10)}...${h.slice(-6)}` : "—";
}

function formatDate(s: string) {
  const d = new Date(s);
  const date = d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  return `${date} • ${time}`;
}

/* ─── Commodity Picker ─── */
const CAT_DATA = [
  { id: "Semua", label: "Semua", icon: LayoutGrid, color: "#1E293B" },
  { id: "Karbohidrat", label: "Karbohidrat", icon: Wheat, color: "#F59E0B" },
  { id: "Protein Hewani", label: "Protein Hewani", icon: Beef, color: "#EF4444" },
  { id: "Protein Ikan", label: "Protein Ikan", icon: Fish, color: "#3B82F6" },
  { id: "Protein Nabati", label: "Protein Nabati", icon: Sprout, color: "#10B981" },
  { id: "Bumbu", label: "Bumbu", icon: ChefHat, color: "#F97316" },
  { id: "Sayur & Buah", label: "Sayur & Buah", icon: Apple, color: "#84CC16" },
  { id: "Industri", label: "Industri", icon: Factory, color: "#64748B" },
];

function CommodityPicker({ commodities, selected, onSelect }: {
  commodities: Commodity[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("Semua");

  const filtered = commodities.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCat === "Semua" || c.category === activeCat;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Cari nama barang..."
          className="w-full h-11 pl-9 pr-4 rounded-2xl border border-slate-200 bg-slate-50 text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all" />
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {CAT_DATA.map(cat => {
          const Icon = cat.icon;
          const isActive = activeCat === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCat(cat.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border ${isActive ? "text-white shadow-sm border-transparent" : "bg-white border-slate-200 text-slate-500"}`}
              style={isActive ? { backgroundColor: cat.color } : {}}
            >
              <Icon size={12} className={isActive ? "text-white" : "text-slate-400"} />
              {cat.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto no-scrollbar">
        {filtered.map(c => {
          const isSelected = selected === c.id;
          return (
            <button key={c.id} type="button" onClick={() => onSelect(c.id)}
              className={`relative flex flex-col p-3 rounded-2xl border text-left transition-all ${isSelected ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500/50" : "border-slate-100 bg-slate-50 hover:bg-slate-100"}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                  <Package size={14} />
                </div>
                {isSelected && (
                  <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: O_COLOR }}>
                    <CheckCircle2 size={10} className="text-white" />
                  </div>
                )}
              </div>
              <p className={`text-[11px] font-bold leading-tight ${isSelected ? "text-blue-700" : "text-slate-700"}`}>{c.name}</p>
              <p className="text-[9px] text-slate-400 mt-1 font-medium">Stok: <span className="font-bold">{c.current_stock.toLocaleString("id-ID")}</span> {c.unit}</p>
              <div className="mt-2 text-[8px] font-black uppercase tracking-tighter text-slate-300">{c.category}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Outbound History Card ─── */
function MovementCard({ m, commodities }: { m: Movement; commodities: Commodity[] }) {
  const commodity = commodities.find(c => c.id === m.commodity_id);
  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: O_LIGHT }}>
            <ArrowUpToLine size={13} style={{ color: O_COLOR }} />
          </div>
          <div>
            <p className="text-xs font-extrabold text-slate-700">{commodity?.name ?? m.commodity_id}</p>
            <p className="text-[10px] text-slate-400 font-mono">{m.id}</p>
          </div>
        </div>
        <Badge className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: "#FEE2E2", color: "#EF4444" }}>
          -{m.quantity.toLocaleString("id-ID")} {commodity?.unit ?? "unit"}
        </Badge>
      </div>

      <div className="px-4 py-3 space-y-2">
        <div className="flex items-start gap-2.5">
          <AlertCircle size={12} className="text-slate-300 mt-0.5 shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alasan Pengeluaran</p>
            <Badge variant="outline" className="text-[9px] font-black mt-1 uppercase">
              {m.reason.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        {m.reference_id && (
          <div className="flex items-start gap-2.5">
            <FileText size={12} className="text-slate-300 mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Referensi Pesanan</p>
              <p className="text-xs text-slate-700 font-semibold mt-0.5">{m.reference_id}</p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-2.5">
          <FileText size={12} className="text-slate-300 mt-0.5 shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Keterangan / Catatan</p>
            <p className="text-xs text-slate-600 font-medium mt-0.5">{m.note || "Tidak ada catatan"}</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <Hash size={12} className="text-slate-300 mt-0.5 shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hash Verifikasi Digital</p>
            <p className="text-[10px] text-slate-600 font-mono mt-0.5 break-all">{truncateHash(m.proof_hash)}</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-1.5">
        <Clock size={10} className="text-slate-300" />
        <p className="text-[10px] text-slate-500 font-medium">{formatDate(m.created_at)}</p>
      </div>
    </motion.div>
  );
}

/* ─── Main Page ─── */
export default function VendorOutboundPage() {
  const [vendorId, setVendorId] = useState<string>("");
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const id = document.cookie.split("; ").find(row => row.startsWith("boga_vendor_id="))?.split("=")[1];
    if (id) {
      setVendorId(id);
    } else {
      setLoadingData(false);
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!vendorId) return;
    setLoadingData(true);
    try {
      // 1. Fetch Commodities
      const resC = await fetch(`${API}/api/vendors/${vendorId}/commodities`);
      const jsonC = await resC.json();
      if (jsonC.status === "success") setCommodities(jsonC.data ?? []);

      // 2. Fetch Outbound Movements
      const resM = await fetch(`${API}/api/inventory/vendors/${vendorId}/outbound`);
      const jsonM = await resM.json();
      if (jsonM.status === "success") setMovements(jsonM.data ?? []);

    } catch (error) {
      logger.error('VendorOutbound', 'Gagal memuat data dari server', error);
      toast.error("Gagal sinkronisasi data.");
    } finally { 
      setLoadingData(false); 
    }
  }, [vendorId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="min-h-svh bg-slate-50" data-role="vendor">
      {/* ── Header ── */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-base font-extrabold text-slate-800 leading-none">Stok Keluar</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">Riwayat distribusi ke unit pelayanan</p>
          </div>
          <div className="w-9 h-9 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Truck size={18} />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6 pb-24">
        {/* Outbound Stats — 3 Cards like Screenshot */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Package, label: "Komoditas Terpengaruh", value: new Set(movements.map(m => m.commodity_id)).size, color: O_COLOR },
            { icon: ArrowUpToLine, label: "Total Transaksi", value: movements.length, color: "#4F46E5" },
            { icon: AlertCircle, label: "Kasus Khusus", value: movements.filter(m => m.reason !== 'PO_FULFILLMENT').length, color: "#7C3AED" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 p-3 shadow-sm">
              <Icon size={14} style={{ color }} />
              <p className="text-base font-extrabold text-slate-800 mt-1 leading-none">{value}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{label}</p>
            </div>
          ))}
        </div>

        {/* Total Distribution Banner */}
        <div className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Terdistribusi</p>
            <div className="flex items-end gap-1.5">
              <p className="text-3xl font-black text-slate-800 leading-none">
                {movements.reduce((a, b) => a + b.quantity, 0).toLocaleString("id-ID")}
              </p>
              <p className="text-xs font-bold text-slate-400 pb-0.5">Unit Terkirim</p>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Truck size={24} />
          </div>
        </div>

        {/* Low Stock Alerts (Priority Based) */}
        {commodities.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-500 flex items-center gap-1.5">
                <AlertCircle size={12} /> Perlu Perhatian
              </p>
              <Link href="/vendor/katalog" className="text-[10px] font-bold text-slate-400 hover:text-blue-600 transition-colors">
                Lihat Katalog
              </Link>
            </div>
            <div className="space-y-2">
              {commodities
                .sort((a, b) => (a.current_stock / 2000) - (b.current_stock / 2000))
                .slice(0, 4)
                .map(c => {
                  const pct = Math.min(100, (c.current_stock / 2000) * 100);
                  const isCritical = pct < 20;
                  return (
                    <div key={c.id} className={`bg-white rounded-2xl border px-4 py-3 shadow-sm transition-all ${isCritical ? "border-red-100 bg-red-50/30" : "border-slate-100"}`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-sm font-bold text-slate-700">{c.name}</p>
                        <p className={`text-xs font-extrabold ${isCritical ? "text-red-600" : "text-blue-600"}`}>
                          {c.current_stock.toLocaleString("id-ID")} <span className="font-normal text-slate-400">{c.unit}</span>
                        </p>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <motion.div className="h-full rounded-full"
                          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          style={{ background: pct < 20 ? "#EF4444" : pct < 50 ? "#F59E0B" : "#3B82F6" }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Movement History */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Riwayat Pengiriman (Outbound)</p>
          <div className="space-y-3">
            <AnimatePresence>
              {movements.map(m => <MovementCard key={m.id} m={m} commodities={commodities} />)}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
