"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Plus, Trash2, Package, Tag, Layers, Loader2,
  ChevronRight, X, TrendingUp, AlertTriangle, ImageIcon, Search, Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

/* ─── Constants ─── */
const API = "http://localhost:3001";
const G = "#065F46";
const G_LIGHT = "#D1FAE5";

/* ─── Catalog: Categories + Commodity List ─── */
const CATALOG = [
  {
    id: "KARBO", label: "Karbohidrat", emoji: "🌾",
    items: [
      { pihps_id: "PIHPS-BERAS",  name: "Beras Premium",   het: 15000,  unit: "kg" },
      { pihps_id: "PIHPS-BERAS",  name: "Beras Merah",     het: 15000,  unit: "kg" },
      { pihps_id: "PIHPS-BERAS",  name: "Beras Ketan",     het: 16000,  unit: "kg" },
      { pihps_id: "PIHPS-BERAS",  name: "Jagung Manis",    het: 8000,   unit: "kg" },
      { pihps_id: "PIHPS-BERAS",  name: "Ubi Jalar",       het: 6000,   unit: "kg" },
      { pihps_id: "PIHPS-BERAS",  name: "Singkong",        het: 5000,   unit: "kg" },
      { pihps_id: "PIHPS-BERAS",  name: "Oat / Gandum",    het: 25000,  unit: "kg" },
    ],
  },
  {
    id: "PROTEIN", label: "Protein", emoji: "🥚",
    items: [
      { pihps_id: "PIHPS-TELUR",  name: "Telur Ayam Ras",  het: 28000,  unit: "kg" },
      { pihps_id: "PIHPS-TELUR",  name: "Telur Bebek",     het: 32000,  unit: "kg" },
      { pihps_id: "PIHPS-TELUR",  name: "Telur Puyuh",     het: 40000,  unit: "kg" },
      { pihps_id: "PIHPS-DAGING", name: "Tempe",           het: 15000,  unit: "kg" },
      { pihps_id: "PIHPS-DAGING", name: "Tahu Putih",      het: 10000,  unit: "kg" },
      { pihps_id: "PIHPS-DAGING", name: "Kacang Hijau",    het: 20000,  unit: "kg" },
      { pihps_id: "PIHPS-DAGING", name: "Kacang Merah",    het: 22000,  unit: "kg" },
    ],
  },
  {
    id: "HEWANI", label: "Protein Hewani", emoji: "🥩",
    items: [
      { pihps_id: "PIHPS-DAGING", name: "Daging Sapi",     het: 120000, unit: "kg" },
      { pihps_id: "PIHPS-DAGING", name: "Daging Ayam",     het: 36000,  unit: "kg" },
      { pihps_id: "PIHPS-DAGING", name: "Daging Kambing",  het: 100000, unit: "kg" },
      { pihps_id: "PIHPS-DAGING", name: "Ikan Bandeng",    het: 32000,  unit: "kg" },
      { pihps_id: "PIHPS-DAGING", name: "Ikan Lele",       het: 24000,  unit: "kg" },
      { pihps_id: "PIHPS-DAGING", name: "Udang Segar",     het: 60000,  unit: "kg" },
    ],
  },
  {
    id: "SAYUR", label: "Sayuran", emoji: "🥦",
    items: [
      { pihps_id: "PIHPS-BERAS",  name: "Bayam",           het: 5000,   unit: "ikat" },
      { pihps_id: "PIHPS-BERAS",  name: "Kangkung",        het: 4000,   unit: "ikat" },
      { pihps_id: "PIHPS-BERAS",  name: "Brokoli",         het: 18000,  unit: "kg" },
      { pihps_id: "PIHPS-BERAS",  name: "Wortel",          het: 10000,  unit: "kg" },
      { pihps_id: "PIHPS-BERAS",  name: "Tomat",           het: 12000,  unit: "kg" },
      { pihps_id: "PIHPS-BERAS",  name: "Kentang",         het: 14000,  unit: "kg" },
    ],
  },
  {
    id: "BUAH", label: "Buah", emoji: "🍎",
    items: [
      { pihps_id: "PIHPS-BERAS",  name: "Pisang Cavendish", het: 12000, unit: "kg" },
      { pihps_id: "PIHPS-BERAS",  name: "Pepaya",           het: 8000,  unit: "kg" },
      { pihps_id: "PIHPS-BERAS",  name: "Jeruk Siam",       het: 20000, unit: "kg" },
      { pihps_id: "PIHPS-BERAS",  name: "Apel Malang",      het: 25000, unit: "kg" },
    ],
  },
];

// Helper: cari data item dari catalog berdasarkan nama
type CatalogItem = typeof CATALOG[0]["items"][0];
function findCatalogItem(name: string): CatalogItem | undefined {
  for (const cat of CATALOG) {
    const found = cat.items.find((i) => i.name === name);
    if (found) return found;
  }
}

// Helper: cari kategori dari pihps_id untuk tampilan kartu
function categoryFromPihpsId(pihps_id: string) {
  const catMap: Record<string, { label: string; emoji: string }> = {
    "PIHPS-BERAS":  { label: "Karbohidrat",   emoji: "🌾" },
    "PIHPS-TELUR":  { label: "Protein",        emoji: "🥚" },
    "PIHPS-DAGING": { label: "Protein Hewani", emoji: "🥩" },
  };
  return catMap[pihps_id] ?? { label: "Umum", emoji: "📦" };
}

const UNITS = ["kg", "liter", "butir", "ikat", "pcs", "gram", "karton"];

/* ─── Types ─── */
interface Commodity {
  id: string;
  name: string;
  price: number;
  unit: string;
  pihps_id: string;
  markup_percentage: number;
  is_markup: number;
  current_stock: number;
  is_active: number;
  photo_url?: string;
  description?: string;
  rating?: number;
  total_sold?: number;
}

/* ─── Deterministik rating dari ID (stabil, tidak random) ─── */
function mockRating(id: string): number {
  const n = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return Math.round(((n % 20) / 20) * 15 + 35) / 10; // 3.5 – 5.0
}
function mockSold(id: string): number {
  const n = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return ((n % 80) + 20) * 12; // 240 – 1200
}

/* ─── Star Rating ─── */
function StarRating({ value }: { value: number }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width={10} height={10} viewBox="0 0 24 24" fill="none">
          {i <= full ? (
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
              fill="#F59E0B" stroke="#F59E0B" strokeWidth={1.5} strokeLinejoin="round" />
          ) : i === full + 1 && half ? (
            <>
              <defs>
                <linearGradient id={`hg-${i}`}>
                  <stop offset="50%" stopColor="#F59E0B" />
                  <stop offset="50%" stopColor="#E2E8F0" />
                </linearGradient>
              </defs>
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                fill={`url(#hg-${i})`} stroke="#F59E0B" strokeWidth={1.5} strokeLinejoin="round" />
            </>
          ) : (
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
              fill="#E2E8F0" stroke="#E2E8F0" strokeWidth={1.5} strokeLinejoin="round" />
          )}
        </svg>
      ))}
    </div>
  );
}

interface FormState {
  name: string;
  pihps_id: string;
  price: string;
  unit: string;
  photo_url: string;
  description: string;
}

const EMPTY_FORM: FormState = {
  name: "", pihps_id: "PIHPS-BERAS", price: "", unit: "kg",
  photo_url: "", description: "",
};

/* ─── Input style ─── */
const inputCls =
  "h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm placeholder:text-slate-300 focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 transition-all";

function currency(v: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);
}

/* ─── Product Card ─── */
function ProductCard({ item, onDelete }: { item: Commodity; onDelete: () => void }) {
  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }} transition={{ duration: 0.2 }}
      className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm shadow-black/[0.04] active:scale-[0.98] transition-transform">
      {/* Photo */}
      <div className="relative h-36 bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center overflow-hidden">
        {item.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.photo_url} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-300">
            <ImageIcon size={28} />
            <span className="text-[10px] font-semibold">Belum ada foto</span>
          </div>
        )}
        {/* Markup badge */}
        {item.is_markup === 1 && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full shadow">
            <TrendingUp size={9} /> +{item.markup_percentage.toFixed(0)}% HET
          </div>
        )}
        <button onClick={onDelete}
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shadow">
          <Trash2 size={13} />
        </button>
      </div>

      {/* Info */}
      <div className="p-3.5">
        <p className="text-sm font-bold text-slate-800 leading-tight truncate">{item.name}</p>
        <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
          {(() => { const c = categoryFromPihpsId(item.pihps_id); return `${c.emoji} ${c.label}`; })()}
        </p>

        {/* Rating & Sold */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <StarRating value={item.rating ?? mockRating(item.id)} />
            <span className="text-[10px] font-bold text-amber-500">
              {(item.rating ?? mockRating(item.id)).toFixed(1)}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            {(item.total_sold ?? mockSold(item.id)).toLocaleString("id-ID")} terjual
          </span>
        </div>

        <div className="flex items-end justify-between mt-2.5">
          <div>
            <p className="text-base font-extrabold leading-none" style={{ color: G }}>
              {currency(item.price)}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">per {item.unit}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-700">{item.current_stock.toLocaleString("id-ID")}</p>
            <p className="text-[10px] text-slate-400">{item.unit} tersedia</p>
          </div>
        </div>

        {/* HET info */}
        {(() => {
          // Cari HET: coba exact name dulu, fallback ke pihps_id
          const allItems = CATALOG.flatMap(c => c.items);
          const byName = allItems.find(i => i.name === item.name);
          const byPihps = allItems.filter(i => i.pihps_id === item.pihps_id);
          const het = byName?.het ?? (byPihps.length > 0 ? Math.min(...byPihps.map(i => i.het)) : null);
          if (!het) return null;
          return (
            <div className={`mt-2.5 rounded-xl px-3 py-1.5 flex items-center justify-between ${item.is_markup ? "bg-amber-50" : "bg-emerald-50"}`}>
              <span className={`text-[9px] font-bold uppercase tracking-wider ${item.is_markup ? "text-amber-500" : "text-emerald-600"}`}>
                {item.is_markup ? <AlertTriangle size={8} className="inline mr-1" /> : null}
                HET {currency(het)}/{item.unit}
              </span>
              {item.is_markup
                ? <span className="text-[9px] font-black text-amber-500">Markup</span>
                : <span className="text-[9px] font-black text-emerald-600">✓ Wajar</span>
              }
            </div>
          );
        })()}
      </div>
    </motion.div>
  );
}

/* ─── CategoryPicker ─── */
function CategoryPicker({
  selectedName, onSelect,
}: {
  selectedName: string;
  onSelect: (name: string, pihps_id: string, unit: string, het: number) => void;
}) {
  const [activeTab, setActiveTab] = useState(CATALOG[0].id);
  const [search, setSearch] = useState("");

  const activeCategory = CATALOG.find((c) => c.id === activeTab)!;
  const filtered = search.trim()
    ? CATALOG.flatMap((c) => c.items).filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
    : activeCategory.items;

  return (
    <div className="space-y-3">
      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
        {CATALOG.map((cat) => (
          <button key={cat.id} type="button"
            onClick={() => { setActiveTab(cat.id); setSearch(""); }}
            className={`flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === cat.id && !search
                ? "text-white shadow" : "bg-slate-100 text-slate-500"
            }`}
            style={activeTab === cat.id && !search ? { background: "#065F46" } : {}}>
            <span>{cat.emoji}</span> {cat.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama komoditas..."
          className="w-full h-11 pl-9 pr-4 rounded-2xl border border-slate-200 bg-slate-50 text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
        />
      </div>

      {/* Item List */}
      <div className="space-y-1 max-h-52 overflow-y-auto no-scrollbar">
        {filtered.length === 0 && (
          <p className="text-center text-xs text-slate-400 py-6">Komoditas tidak ditemukan</p>
        )}
        {filtered.map((item) => {
          const isSelected = selectedName === item.name;
          return (
            <button key={item.name} type="button"
              onClick={() => onSelect(item.name, item.pihps_id, item.unit, item.het)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border text-left transition-all ${
                isSelected ? "border-emerald-500 bg-emerald-50" : "border-transparent bg-slate-50 hover:bg-slate-100"
              }`}>
              <div>
                <p className={`text-sm font-semibold ${isSelected ? "text-emerald-700" : "text-slate-700"}`}>
                  {item.name}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  HET {currency(item.het)} / {item.unit}
                </p>
              </div>
              {isSelected && (
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: "#065F46" }}>
                  <Check size={11} className="text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Bottom Sheet ─── */
function AddSheet({ open, onClose, onAdded, vendorId }: {
  open: boolean; onClose: () => void; onAdded: () => void; vendorId: string;
}) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  const set = (k: keyof FormState, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const selectedCatalogItem = findCatalogItem(form.name);
  const priceNum = parseFloat(form.price) || 0;
  const isMarkup = selectedCatalogItem && priceNum > selectedCatalogItem.het;
  const markupPct = isMarkup && selectedCatalogItem
    ? (((priceNum - selectedCatalogItem.het) / selectedCatalogItem.het) * 100).toFixed(1)
    : null;

  const handleSubmit = async () => {
    if (!form.name || !form.price) { toast.error("Nama dan harga wajib diisi."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/vendors/${vendorId}/commodities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendor_id: vendorId,
          pihps_id: form.pihps_id,
          name: form.name,
          price: priceNum,
          unit: form.unit,
        }),
      });
      const json = await res.json();
      if (json.status === "success") {
        toast.success(`${form.name} berhasil ditambahkan!`);
        setForm(EMPTY_FORM);
        onAdded();
        onClose();
      } else {
        toast.error(json.message || "Gagal menambahkan barang.");
      }
    } catch {
      toast.error("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />

          {/* Sheet */}
          <motion.div key="sheet"
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            className="fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-[2rem] shadow-2xl max-h-[92svh] overflow-y-auto">

            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-slate-200" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-800">Tambah Barang</h3>
                <p className="text-xs text-slate-400">Lengkapi detail produk Anda</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                <X size={15} />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-5 space-y-4 pb-8">
              {/* Foto URL */}
              <div>
                <Label htmlFor="photo_url" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">
                  Foto Produk (URL)
                </Label>
                {form.photo_url && (
                  <div className="mb-2 h-32 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.photo_url} alt="preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  </div>
                )}
                <div className="flex gap-2">
                  <Input id="photo_url" className={`${inputCls} flex-1`} value={form.photo_url}
                    onChange={(e) => set("photo_url", e.target.value)} placeholder="https://r2.boga.id/foto.jpg" />
                  <div className="h-12 w-12 shrink-0 rounded-2xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-slate-300 cursor-pointer hover:border-emerald-400 hover:text-emerald-400 transition-all">
                    <ImageIcon size={16} />
                  </div>
                </div>
              </div>

              {/* Nama */}
              <div>
                <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">Nama Produk</Label>
                <Input id="name" className={inputCls} value={form.name}
                  onChange={(e) => set("name", e.target.value)} placeholder="Beras Premium Cap Ramos" />
              </div>

              {/* Kategori & Komoditas Picker */}
              <div>
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">
                  Jenis Komoditas
                </Label>
                <CategoryPicker
                  selectedName={form.name}
                  onSelect={(name, pihps_id, unit, het) => {
                    setForm((p) => ({
                      ...p,
                      name,
                      pihps_id,
                      unit,
                      // auto-fill harga dengan HET sebagai default
                      price: p.price || String(het),
                    }));
                  }}
                />
              </div>

              {/* Nama kustom (boleh diubah setelah pilih dari list) */}
              <div>
                <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">
                  Nama Produk Kustom
                </Label>
                <Input id="name" className={inputCls} value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Pilih dari list di atas, atau ketik manual..." />
              </div>

              {/* Harga + Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="price" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">Harga (Rp)</Label>
                  <Input id="price" type="number" className={inputCls} value={form.price}
                    onChange={(e) => set("price", e.target.value)} placeholder="15000" />
                </div>
                <div>
                  <Label htmlFor="unit" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">Satuan</Label>
                  <select id="unit" value={form.unit} onChange={(e) => set("unit", e.target.value)}
                    className={`w-full ${inputCls} appearance-none`}>
                    {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              {/* Markup warning */}
              <AnimatePresence>
                {isMarkup && markupPct && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 flex gap-3">
                    <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-amber-700">Harga di atas HET ({markupPct}% markup)</p>
                      <p className="text-[11px] text-amber-600 mt-0.5 leading-relaxed">
                        Produk ini akan ditandai markup dan terlihat oleh Pemerintah sebagai monitoring harga.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <button onClick={handleSubmit} disabled={loading}
                className="w-full h-12 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 disabled:opacity-60 active:scale-[0.98] transition-all"
                style={{ background: G }}>
                {loading
                  ? <><Loader2 size={16} className="animate-spin" /> Menyimpan...</>
                  : <><Plus size={16} /> Tambahkan ke Katalog</>}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Main Page ─── */
export default function VendorKatalogPage() {
  const [items, setItems] = useState<Commodity[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [vendorId, setVendorId] = useState("ACC-VEN-5E1FD92B"); // TODO: ganti dari session

  const fetchItems = useCallback(async () => {
    if (!vendorId) return;
    try {
      const res = await fetch(`${API}/api/vendors/${vendorId}/commodities`);
      const json = await res.json();
      if (json.status === "success") setItems(json.data ?? []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [vendorId]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleDelete = async (id: string) => {
    toast("Hapus barang ini?", {
      action: {
        label: "Hapus",
        onClick: async () => {
          setItems((prev) => prev.filter((i) => i.id !== id));
          toast.success("Barang dihapus dari katalog.");
          // TODO: connect DELETE API when ready
        },
      },
    });
  };

  const activeItems = items.filter((i) => i.is_active);
  const markupCount = activeItems.filter((i) => i.is_markup).length;

  return (
    <div className="min-h-svh bg-slate-50" data-role="vendor">
      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-base font-extrabold text-slate-800 leading-none">Katalog Saya</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {activeItems.length} produk aktif
              {markupCount > 0 && <> · <span className="text-amber-500 font-semibold">{markupCount} markup HET</span></>}
            </p>
          </div>
          <button onClick={() => setSheetOpen(true)}
            className="flex items-center gap-1.5 h-9 px-4 rounded-2xl text-xs font-bold text-white shadow shadow-emerald-200 active:scale-[0.97] transition-all"
            style={{ background: G }}>
            <Plus size={14} /> Tambah
          </button>
        </div>
      </div>

      {/* ── Vendor ID (dev helper) ── */}
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
          <Tag size={13} className="text-slate-300 shrink-0" />
          <Input value={vendorId} onChange={(e) => setVendorId(e.target.value)}
            placeholder="Masukkan Vendor ID..." onBlur={fetchItems}
            className="border-0 h-7 p-0 text-xs font-mono text-slate-500 bg-transparent focus-visible:ring-0 shadow-none" />
          <button onClick={fetchItems} className="text-[10px] font-bold px-2 py-1 rounded-lg shrink-0" style={{ color: G, background: G_LIGHT }}>
            Muat
          </button>
        </div>
      </div>

      {/* ── Stats Strip ── */}
      <div className="max-w-2xl mx-auto px-4 mt-3 grid grid-cols-3 gap-2">
        {[
          { icon: Package, label: "Produk", value: activeItems.length, color: G },
          { icon: Layers, label: "Total Stok", value: activeItems.reduce((a, b) => a + b.current_stock, 0).toLocaleString("id-ID"), color: "#1D4ED8" },
          { icon: TrendingUp, label: "Markup", value: markupCount, color: "#D97706" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-100 p-3 shadow-sm">
            <Icon size={14} style={{ color }} />
            <p className="text-base font-extrabold text-slate-800 mt-1 leading-none">{value}</p>
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Product Grid ── */}
      <div className="max-w-2xl mx-auto px-4 py-4 pb-24">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-56 rounded-3xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : activeItems.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center px-8">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4" style={{ background: G_LIGHT }}>
              <Package size={28} style={{ color: G }} />
            </div>
            <h3 className="text-base font-extrabold text-slate-700">Katalog Masih Kosong</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Mulai tambahkan produk yang ingin Anda jual ke SPPG. Harga akan dibandingkan otomatis dengan HET pemerintah.
            </p>
            <button onClick={() => setSheetOpen(true)}
              className="mt-5 flex items-center gap-2 h-11 px-5 rounded-2xl text-sm font-bold text-white shadow-lg shadow-emerald-200 active:scale-[0.97] transition-all"
              style={{ background: G }}>
              <Plus size={15} /> Tambah Produk Pertama
            </button>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-2 gap-3">
            <AnimatePresence>
              {activeItems.map((item) => (
                <ProductCard key={item.id} item={item} onDelete={() => handleDelete(item.id)} />
              ))}
            </AnimatePresence>
            {/* Add more card */}
            <motion.button layout onClick={() => setSheetOpen(true)}
              className="h-full min-h-[200px] rounded-3xl border-2 border-dashed border-slate-200 bg-white flex flex-col items-center justify-center gap-2 text-slate-300 hover:border-emerald-400 hover:text-emerald-400 transition-all active:scale-[0.97]">
              <div className="w-10 h-10 rounded-2xl border-2 border-current flex items-center justify-center">
                <Plus size={18} />
              </div>
              <span className="text-[11px] font-bold">Tambah Produk</span>
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* ── Breadcrumb hint ── */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30">
        <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full border border-slate-100 shadow">
          <ChevronRight size={10} /> Produk di sini otomatis muncul di E-Katalog SPPG
        </div>
      </div>

      {/* ── Add Sheet ── */}
      <AddSheet open={sheetOpen} onClose={() => setSheetOpen(false)} onAdded={fetchItems} vendorId={vendorId} />
    </div>
  );
}
