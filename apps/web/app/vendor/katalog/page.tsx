"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Plus, Trash2, Package, Tag, Layers, Loader2,
  ChevronRight, X, TrendingUp, AlertTriangle, ImageIcon, Search, Check,
  SlidersHorizontal, ShoppingBag, Star,
  Wheat, Beef, Fish, Sprout, ChefHat, Apple, Factory, LayoutGrid,
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
      { pihps_id: "PIHPS-BERAS",  name: "Beras Premium",      het: 15500,  unit: "kg" },
      { pihps_id: "PIHPS-BERAS",  name: "Beras Medium",       het: 13500,  unit: "kg" },
      { pihps_id: "PIHPS-TEPUNG", name: "Tepung Terigu",      het: 12000,  unit: "kg" },
    ],
  },
  {
    id: "HEWANI", label: "Protein Hewani", emoji: "🥩",
    items: [
      { pihps_id: "PIHPS-DAGING", name: "Daging Sapi Segar",  het: 135000, unit: "kg" },
      { pihps_id: "PIHPS-AYAM",   name: "Daging Ayam Ras",    het: 37000,  unit: "kg" },
      { pihps_id: "PIHPS-TELUR",  name: "Telur Ayam Ras",     het: 29000,  unit: "kg" },
    ],
  },
  {
    id: "IKAN", label: "Protein Ikan", emoji: "🐟",
    items: [
      { pihps_id: "PIHPS-IKAN",   name: "Ikan Bandeng",       het: 35000,  unit: "kg" },
      { pihps_id: "PIHPS-IKAN",   name: "Ikan Kembung",       het: 40000,  unit: "kg" },
      { pihps_id: "PIHPS-IKAN",   name: "Ikan Tongkol/Tuna",  het: 38000,  unit: "kg" },
    ],
  },
  {
    id: "NABATI", label: "Protein Nabati", emoji: "🫘",
    items: [
      { pihps_id: "PIHPS-KEDELAI", name: "Kedelai Impor",      het: 12000,  unit: "kg" },
      { pihps_id: "PIHPS-KEDELAI", name: "Tempe Kedelai",     het: 15000,  unit: "kg" },
      { pihps_id: "PIHPS-KEDELAI", name: "Tahu Putih",        het: 11000,  unit: "kg" },
    ],
  },
  {
    id: "BUMBU", label: "Bumbu", emoji: "🌶️",
    items: [
      { pihps_id: "PIHPS-BAWANG", name: "Bawang Merah",       het: 35000,  unit: "kg" },
      { pihps_id: "PIHPS-CABAI",  name: "Cabai Merah Besar",  het: 45000,  unit: "kg" },
      { pihps_id: "PIHPS-CABAI",  name: "Cabai Rawit Merah",  het: 55000,  unit: "kg" },
    ],
  },
  {
    id: "HORTI", label: "Sayur & Buah", emoji: "🥦",
    items: [
      { pihps_id: "PIHPS-SAYUR",  name: "Bayam Hijau",        het: 5000,   unit: "ikat" },
      { pihps_id: "PIHPS-SAYUR",  name: "Kangkung Segar",     het: 4000,   unit: "ikat" },
      { pihps_id: "PIHPS-BUAH",   name: "Pisang Ambon",       het: 25000,  unit: "sisir" },
      { pihps_id: "PIHPS-BUAH",   name: "Jeruk Lokal",        het: 30000,  unit: "kg" },
    ],
  },
  {
    id: "INDUSTRI", label: "Industri", emoji: "🏭",
    items: [
      { pihps_id: "PIHPS-GULA",   name: "Gula Pasir",         het: 16000,  unit: "kg" },
      { pihps_id: "PIHPS-MINYAK", name: "Minyak Goreng Curah", het: 15500,  unit: "liter" },
      { pihps_id: "PIHPS-MINYAK", name: "Minyak Goreng Kemasan",het: 18000,  unit: "liter" },
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
    "PIHPS-BERAS":   { label: "Karbohidrat",   emoji: "🌾" },
    "PIHPS-TEPUNG":  { label: "Karbohidrat",   emoji: "🌾" },
    "PIHPS-DAGING":  { label: "Protein Hewani", emoji: "🥩" },
    "PIHPS-AYAM":    { label: "Protein Hewani", emoji: "🍗" },
    "PIHPS-TELUR":   { label: "Protein Hewani", emoji: "🥚" },
    "PIHPS-IKAN":    { label: "Protein Ikan",   emoji: "🐟" },
    "PIHPS-KEDELAI": { label: "Protein Nabati", emoji: "🫘" },
    "PIHPS-BAWANG":  { label: "Bumbu",          emoji: "🧅" },
    "PIHPS-CABAI":   { label: "Bumbu",          emoji: "🌶️" },
    "PIHPS-SAYUR":   { label: "Sayur & Buah",   emoji: "🥬" },
    "PIHPS-BUAH":    { label: "Sayur & Buah",   emoji: "🍎" },
    "PIHPS-GULA":    { label: "Industri",       emoji: "🍯" },
    "PIHPS-MINYAK":  { label: "Industri",       emoji: "🍯" },
  };
  return catMap[pihps_id] ?? { label: "Umum", emoji: "📦" };
}

const UNITS = ["Kg", "Liter", "Butir", "Ikat", "Karung", "Karton", "Botol", "Gram", "Pcs"];

const CAT_DATA = [
  { id: "ALL", label: "Semua", icon: LayoutGrid, color: "#1E293B" },
  { id: "KARBO", label: "Karbohidrat", icon: Wheat, color: "#F59E0B" },
  { id: "HEWANI", label: "Protein Hewani", icon: Beef, color: "#EF4444" },
  { id: "IKAN", label: "Protein Ikan", icon: Fish, color: "#3B82F6" },
  { id: "NABATI", label: "Protein Nabati", icon: Sprout, color: "#10B981" },
  { id: "BUMBU", label: "Bumbu", icon: ChefHat, color: "#F97316" },
  { id: "HORTI", label: "Sayur & Buah", icon: Apple, color: "#84CC16" },
  { id: "INDUSTRI", label: "Industri", icon: Factory, color: "#64748B" },
];

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
  name: "", pihps_id: "PIHPS-BERAS", price: "", unit: "Kg",
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
  const [isExpanded, setIsExpanded] = useState(false);
  const rating = item.rating || mockRating(item.id);
  const bgClass = rating >= 4.5 
    ? "bg-gradient-to-b from-white to-amber-50/50 border-amber-100/50 shadow-amber-50" 
    : rating >= 4.0 
      ? "bg-gradient-to-b from-white to-emerald-50/30 border-emerald-100/30" 
      : "bg-white border-slate-100";

  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }} transition={{ duration: 0.2 }}
      className={`group relative rounded-3xl border shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col ${bgClass}`}>
      
      {/* Photo Section */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={item.photo_url || `https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=60&w=400`} 
          alt={item.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=60&w=400";
          }}
        />
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
            <>
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
              
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-center gap-1.5 py-2 mt-1 rounded-xl text-[9px] font-bold text-slate-400 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all">
                {isExpanded ? <X size={10} /> : <Search size={10} />}
                {isExpanded ? "Sembunyikan Deskripsi" : "Lihat Deskripsi Produk"}
              </button>
            </>
          );
        })()}
        {/* Expandable Description Area */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="pt-3 mt-3 border-t border-dashed border-slate-100">
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                  {item.description || "Tidak ada deskripsi untuk produk ini."}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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

  const activeCategory = CATALOG.find((c) => c.id === activeTab) || CATALOG[0];
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
    // 1. Validasi Semua Parameter Wajib
    if (!form.name.trim()) return toast.error("Nama produk wajib diisi!");
    if (!form.pihps_id) return toast.error("Jenis komoditas wajib dipilih!");
    if (!form.description.trim()) return toast.error("Deskripsi produk wajib diisi!");
    if (!form.price || Number(form.price) <= 0) return toast.error("Harga harus lebih dari Rp 0!");
    if (!form.unit) return toast.error("Satuan produk wajib dipilih!");
    if (!form.photo_url) return toast.error("Foto produk wajib diunggah!");

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/vendors/${vendorId}/commodities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          is_active: 1,
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
              {/* Upload Foto Produk */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
                    Foto Produk
                  </Label>
                  <span className="text-[9px] text-slate-400 font-medium italic">JPG/PNG (Maks 2MB)</span>
                </div>
                
                <input
                  type="file"
                  id="photo-upload"
                  accept="image/png, image/jpeg"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    // Validasi ukuran
                    if (file.size > 2 * 1024 * 1024) {
                      toast.error("Ukuran file terlalu besar (Maks 2MB)");
                      return;
                    }

                    setLoading(true);
                    // Simulasi Upload ke R2
                    toast.loading("Mengunggah ke R2...");
                    await new Promise(r => setTimeout(r, 1500)); // Simulasi delay
                    
                    const mockR2Url = `https://r2.boga.id/uploads/${Date.now()}-${file.name}`;
                    set("photo_url", mockR2Url);
                    
                    toast.dismiss();
                    toast.success("Foto berhasil diunggah!");
                    setLoading(false);
                  }}
                />

                {form.photo_url ? (
                  <div className="group relative h-40 rounded-3xl overflow-hidden border-2 border-emerald-100 shadow-inner bg-slate-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.photo_url} alt="preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <label htmlFor="photo-upload" className="h-10 px-4 rounded-xl bg-white text-xs font-bold text-slate-700 flex items-center gap-2 cursor-pointer active:scale-95 transition-transform shadow-lg">
                        <ImageIcon size={14} /> Ganti Foto
                      </label>
                      <button onClick={() => set("photo_url", "")} className="h-10 w-10 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label htmlFor="photo-upload" 
                    className="flex flex-col items-center justify-center h-40 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all cursor-pointer group">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-300 group-hover:text-emerald-500 group-hover:scale-110 transition-all">
                      <Plus size={20} />
                    </div>
                    <p className="text-[11px] font-bold text-slate-400 mt-3 group-hover:text-emerald-600">Ketuk untuk pilih foto</p>
                    <p className="text-[9px] text-slate-300 mt-1">Sistem otomatis unggah ke R2 Storage</p>
                  </label>
                )}
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

              {/* Deskripsi Produk */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <Label htmlFor="description" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
                    Deskripsi Produk
                  </Label>
                  <span className={`text-[9px] font-bold ${form.description.length >= 500 ? "text-red-500" : "text-slate-400"}`}>
                    {form.description.length}/500
                  </span>
                </div>
                <textarea
                  id="description"
                  value={form.description}
                  maxLength={500}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Jelaskan detail produk Anda (contoh: Beras organik kualitas premium, stok baru, tanpa pemutih...)"
                  className="w-full min-h-[120px] rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300 resize-none leading-relaxed font-medium"
                />
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

/* ─── Mock Data (20 Items with Stable Photos) ─── */
const MOCK_ITEMS: Commodity[] = [
  { 
    id: "PROD-001", name: "Beras Premium Cap Ramos", price: 15500, unit: "Kg", pihps_id: "PIHPS-BERAS", 
    markup_percentage: 0, is_markup: 0, current_stock: 2500, is_active: 1, rating: 4.9, total_sold: 4500,
    photo_url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400",
    description: "Beras kualitas super dari petani Karawang. Tekstur pulen, putih alami tanpa pemutih. Cocok untuk konsumsi harian keluarga dan usaha katering."
  },
  { 
    id: "PROD-002", name: "Daging Sapi Has Luar", price: 135000, unit: "Kg", pihps_id: "PIHPS-DAGING", 
    markup_percentage: 0, is_markup: 0, current_stock: 150, is_active: 1, rating: 4.8, total_sold: 420,
    photo_url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    description: "Daging sapi bagian Sirloin segar. Lemak tipis di bagian pinggir memberikan rasa gurih saat dimasak. Stok melimpah untuk kebutuhan industri."
  },
  { 
    id: "PROD-003", name: "Telur Ayam Ras Papan", price: 29000, unit: "Kg", pihps_id: "PIHPS-TELUR", 
    markup_percentage: 0, is_markup: 0, current_stock: 850, is_active: 1, rating: 4.7, total_sold: 3200,
    photo_url: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&q=80&w=400",
    description: "Telur ayam ras segar grade A. Kulit cokelat tebal, tidak mudah pecah. Hasil peternakan lokal dengan pakan organik."
  },
  { 
    id: "PROD-004", name: "Cabai Rawit Setan Merah", price: 85000, unit: "Kg", pihps_id: "PIHPS-CABAI", 
    markup_percentage: 54.5, is_markup: 1, current_stock: 15, is_active: 1, rating: 3.9, total_sold: 850,
    photo_url: "https://images.unsplash.com/photo-1588253524671-c703418ca97c?auto=format&fit=crop&q=80&w=400",
    description: "Cabai rawit merah super pedas. Kondisi segar, petikan pagi hari. Stok terbatas karena faktor cuaca."
  },
  { 
    id: "PROD-005", name: "Ikan Bandeng Juwana", price: 35000, unit: "Kg", pihps_id: "PIHPS-IKAN", 
    markup_percentage: 0, is_markup: 0, current_stock: 120, is_active: 1, rating: 4.9, total_sold: 640,
    photo_url: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=400",
    description: "Ikan bandeng segar asli Juwana. Daging tebal dan gurih, minimal bau tanah. Ukuran 3-4 ekor per kg."
  },
  { 
    id: "PROD-006", name: "Bawang Merah Brebes", price: 42000, unit: "Kg", pihps_id: "PIHPS-BAWANG", 
    markup_percentage: 20, is_markup: 1, current_stock: 500, is_active: 1, rating: 4.5, total_sold: 1500,
    photo_url: "https://images.unsplash.com/photo-1580145617544-bc71f2f3ee61?auto=format&fit=crop&q=80&w=400",
    description: "Bawang merah asli Brebes. Ukuran sedang merata, aroma sangat kuat dan warna merah pekat. Kondisi sudah kering jemur."
  },
  { 
    id: "PROD-007", name: "Tahu Putih Sutra Kediri", price: 11000, unit: "Kg", pihps_id: "PIHPS-KEDELAI", 
    markup_percentage: 0, is_markup: 0, current_stock: 200, is_active: 1, rating: 4.8, total_sold: 950,
    photo_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400",
    description: "Tahu putih khas Kediri yang terkenal sangat lembut. Diproduksi harian tanpa bahan pengawet formalin."
  },
  { 
    id: "PROD-008", name: "Minyak Goreng Kita 1L", price: 15500, unit: "Liter", pihps_id: "PIHPS-MINYAK", 
    markup_percentage: 0, is_markup: 0, current_stock: 5000, is_active: 1, rating: 4.4, total_sold: 12000,
    photo_url: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=400",
    description: "Minyak goreng program pemerintah. Kualitas bening, jernih, dan tidak cepat hitam. Harga tetap sesuai subsidi pemerintah."
  },
  { 
    id: "PROD-009", name: "Gula Pasir Putih Gulaku", price: 16000, unit: "Kg", pihps_id: "PIHPS-GULA", 
    markup_percentage: 0, is_markup: 0, current_stock: 1200, is_active: 1, rating: 4.7, total_sold: 5600,
    photo_url: "https://images.unsplash.com/photo-1581441363689-1f3c3c414635?auto=format&fit=crop&q=80&w=400",
    description: "Gula pasir putih kristal kualitas premium. Manis alami, butiran halus dan bersih."
  },
  { 
    id: "PROD-010", name: "Daging Ayam Ras Segar", price: 37000, unit: "Kg", pihps_id: "PIHPS-AYAM", 
    markup_percentage: 0, is_markup: 0, current_stock: 450, is_active: 1, rating: 4.6, total_sold: 4200,
    photo_url: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=400",
    description: "Daging ayam potong segar, dipotong setiap dini hari. Tanpa bahan pengawet dan hormon tambahan."
  },
  { 
    id: "PROD-011", name: "Beras Medium Cianjur", price: 13500, unit: "Kg", pihps_id: "PIHPS-BERAS", 
    markup_percentage: 0, is_markup: 0, current_stock: 8, is_active: 1, rating: 4.2, total_sold: 1800,
    photo_url: "https://images.unsplash.com/photo-1590333746438-2834503f6700?auto=format&fit=crop&q=80&w=400",
    description: "Beras medium harga ekonomis dengan rasa tetap enak. Cocok untuk operasional harian. Stok sedang menipis."
  },
  { 
    id: "PROD-012", name: "Ikan Kembung Banjar", price: 40000, unit: "Kg", pihps_id: "PIHPS-IKAN", 
    markup_percentage: 0, is_markup: 0, current_stock: 65, is_active: 1, rating: 3.5, total_sold: 300,
    photo_url: "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&q=80&w=400",
    description: "Ikan kembung Banjar kondisi beku segar (frozen). Nutrisi tinggi omega-3, baik untuk pertumbuhan anak sekolah."
  },
  { 
    id: "PROD-013", name: "Tempe Kedelai Mendoan", price: 15000, unit: "Kg", pihps_id: "PIHPS-KEDELAI", 
    markup_percentage: 0, is_markup: 0, current_stock: 150, is_active: 1, rating: 4.9, total_sold: 1100,
    photo_url: "https://images.unsplash.com/photo-1589907730532-799d81d65457?auto=format&fit=crop&q=80&w=400",
    description: "Tempe kedelai murni tanpa campuran jagung. Fermentasi sempurna, rasa gurih khas tempe tradisional."
  },
  { 
    id: "PROD-014", name: "Tepung Terigu Segitiga Biru", price: 12000, unit: "Kg", pihps_id: "PIHPS-TEPUNG", 
    markup_percentage: 0, is_markup: 0, current_stock: 3000, is_active: 1, rating: 4.8, total_sold: 8900,
    photo_url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400",
    description: "Tepung terigu protein sedang serbaguna. Cocok untuk membuat berbagai macam kue, gorengan, dan mie."
  },
  { 
    id: "PROD-015", name: "Ikan Tongkol Hitam", price: 38000, unit: "Kg", pihps_id: "PIHPS-IKAN", 
    markup_percentage: 0, is_markup: 0, current_stock: 90, is_active: 1, rating: 4.1, total_sold: 550,
    photo_url: "https://images.unsplash.com/photo-1534940892017-d23b4b74a8db?auto=format&fit=crop&q=80&w=400",
    description: "Ikan tongkol hitam segar hasil tangkapan nelayan lokal. Daging padat dan tidak gatal saat dikonsumsi."
  },
  { 
    id: "PROD-016", name: "Minyak Goreng Fortune 2L", price: 42000, unit: "Liter", pihps_id: "PIHPS-MINYAK", 
    markup_percentage: 16.6, is_markup: 1, current_stock: 450, is_active: 1, rating: 4.6, total_sold: 1200,
    photo_url: "https://images.unsplash.com/photo-1523910350361-90412354784a?auto=format&fit=crop&q=80&w=400",
    description: "Minyak goreng kemasan pouch isi 2 liter. Kualitas premium, melalui dua kali penyaringan. Harga pasar sedang naik."
  },
  { 
    id: "PROD-017", name: "Kedelai Impor Pilihan", price: 12000, unit: "Kg", pihps_id: "PIHPS-KEDELAI", 
    markup_percentage: 0, is_markup: 0, current_stock: 12000, is_active: 1, rating: 4.3, total_sold: 250,
    photo_url: "https://images.unsplash.com/photo-1582234372722-50d7ccc30e5a?auto=format&fit=crop&q=80&w=400",
    description: "Biji kedelai impor Amerika grade 1. Butiran besar dan bersih. Cocok untuk bahan baku berkualitas."
  },
  { 
    id: "PROD-020", name: "Daging Sapi Wagyu MB9", price: 450000, unit: "Kg", pihps_id: "PIHPS-DAGING", 
    markup_percentage: 233, is_markup: 1, current_stock: 25, is_active: 1, rating: 4.9, total_sold: 15,
    photo_url: "https://images.unsplash.com/photo-1546241072-48010ad28c2c?auto=format&fit=crop&q=80&w=400",
    description: "Daging sapi wagyu dengan marbling sangat tinggi. Rasa lumer di mulut. Produk mewah untuk segmentasi khusus."
  },
  { 
    id: "PROD-019", name: "Cabai Merah Keriting", price: 45000, unit: "Kg", pihps_id: "PIHPS-CABAI", 
    markup_percentage: 0, is_markup: 0, current_stock: 40, is_active: 1, rating: 4.4, total_sold: 880,
    photo_url: "https://images.unsplash.com/photo-1518977676601-b53f02bad67b?auto=format&fit=crop&q=80&w=400",
    description: "Cabai merah keriting segar tanpa ulat. Warna merah menyala merata. Cocok untuk bumbu dasar masakan."
  },
  { 
    id: "PROD-018", name: "Gula Pasir Kristal 1kg", price: 15000, unit: "Kg", pihps_id: "PIHPS-GULA", 
    markup_percentage: 0, is_markup: 0, current_stock: 2000, is_active: 1, rating: 4.6, total_sold: 3400,
    photo_url: "https://images.unsplash.com/photo-1622321481546-f94d93026725?auto=format&fit=crop&q=80&w=400",
    description: "Gula pasir kristal putih bersih. Manis murni tebu pilihan. Stok melimpah untuk kebutuhan rumah tangga."
  },
];

/* ─── Filter Sheet ─── */
function FilterSheet({
  open, onClose, sortBy, setSortBy, categoryFilter, setCategoryFilter
}: {
  open: boolean; onClose: () => void;
  sortBy: string; setSortBy: (v: string) => void;
  categoryFilter: string; setCategoryFilter: (v: string) => void;
}) {
  const sortOptions = [
    { id: "stock-desc", label: "Stok Terbanyak", icon: Layers },
    { id: "stock-asc", label: "Stok Tersedikit", icon: Layers },
    { id: "sold-desc", label: "Paling Laku", icon: ShoppingBag },
    { id: "sold-asc", label: "Kurang Laku", icon: ShoppingBag },
    { id: "rating-desc", label: "Kualitas Terbaik (Rating)", icon: Star },
    { id: "rating-asc", label: "Kualitas Terendah", icon: Star },
    { id: "price-desc", label: "Harga Tertinggi", icon: Tag },
    { id: "price-asc", label: "Harga Terendah", icon: Tag },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" />
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            className="fixed bottom-0 inset-x-0 z-[70] bg-white rounded-t-[2rem] shadow-2xl overflow-hidden pb-8">
            
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-slate-200" />
            </div>

            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-800">Filter & Sortir</h3>
              <button onClick={onClose} className="text-xs font-bold text-emerald-600">Selesai</button>
            </div>

            <div className="p-6 space-y-6 max-h-[70svh] overflow-y-auto no-scrollbar">
              {/* Sort By */}
              <div>
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 block">Urutkan Berdasarkan</Label>
                <div className="grid grid-cols-2 gap-2">
                  {sortOptions.map((opt) => (
                    <button key={opt.id} onClick={() => setSortBy(opt.id)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl border text-left transition-all ${
                        sortBy === opt.id ? "border-emerald-500 bg-emerald-50" : "border-slate-100 bg-slate-50"
                      }`}>
                      <opt.icon size={12} className={sortBy === opt.id ? "text-emerald-600" : "text-slate-400"} />
                      <span className={`text-[11px] font-bold ${sortBy === opt.id ? "text-emerald-700" : "text-slate-600"}`}>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 block">Filter Kategori</Label>
                <div className="grid grid-cols-2 gap-2">
                  {CAT_DATA.map((cat) => {
                    const Icon = cat.icon;
                    const isActive = categoryFilter === cat.id;
                    return (
                      <button key={cat.id} onClick={() => setCategoryFilter(cat.id)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl border text-left transition-all ${
                          isActive ? "text-white shadow-lg border-transparent" : "border-slate-100 bg-slate-50 text-slate-500"
                        }`}
                        style={isActive ? { backgroundColor: cat.color, boxShadow: `0 8px 20px -6px ${cat.color}60` } : {}}>
                        <Icon size={12} className={isActive ? "text-white" : "text-slate-400"} />
                        <span className={`text-[11px] font-bold ${isActive ? "text-white" : "text-slate-600"}`}>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button onClick={onClose} className="w-full h-12 rounded-2xl text-sm font-bold shadow-lg shadow-emerald-100 mt-4" style={{ background: G }}>
                Terapkan Filter
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Main Page ─── */
export default function VendorKatalogPage() {
  const [items, setItems] = useState<Commodity[]>(MOCK_ITEMS);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [vendorId, setVendorId] = useState("ACC-VEN-5E1FD92B");

  // Search & Filter States
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("stock-desc");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const fetchItems = useCallback(async () => {
    if (!vendorId) return;
    try {
      const res = await fetch(`${API}/api/vendors/${vendorId}/commodities`);
      const json = await res.json();
      if (json.status === "success") {
        setItems(json.data && json.data.length > 0 ? json.data : MOCK_ITEMS);
      }
    } catch { setItems(MOCK_ITEMS); }
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
        },
      },
    });
  };

  // Logic: Filtering & Sorting
  const filteredItems = items
    .filter((item) => {
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory = 
        categoryFilter === "ALL" || 
        (categoryFilter === "KARBO" && (item.pihps_id === "PIHPS-BERAS" || item.pihps_id === "PIHPS-TEPUNG")) ||
        (categoryFilter === "HEWANI" && (item.pihps_id === "PIHPS-DAGING" || item.pihps_id === "PIHPS-AYAM" || item.pihps_id === "PIHPS-TELUR")) ||
        (categoryFilter === "IKAN" && item.pihps_id === "PIHPS-IKAN") ||
        (categoryFilter === "NABATI" && item.pihps_id === "PIHPS-KEDELAI") ||
        (categoryFilter === "BUMBU" && (item.pihps_id === "PIHPS-BAWANG" || item.pihps_id === "PIHPS-CABAI")) ||
        (categoryFilter === "HORTI" && (item.pihps_id === "PIHPS-SAYUR" || item.pihps_id === "PIHPS-BUAH")) ||
        (categoryFilter === "INDUSTRI" && (item.pihps_id === "PIHPS-MINYAK" || item.pihps_id === "PIHPS-GULA"));
      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      if (sortBy === "stock-desc") return b.current_stock - a.current_stock;
      if (sortBy === "stock-asc") return a.current_stock - b.current_stock;
      if (sortBy === "sold-desc") return (b.total_sold || 0) - (a.total_sold || 0);
      if (sortBy === "sold-asc") return (a.total_sold || 0) - (b.total_sold || 0);
      if (sortBy === "rating-desc") return (b.rating || 0) - (a.rating || 0);
      if (sortBy === "rating-asc") return (a.rating || 0) - (b.rating || 0);
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "price-asc") return a.price - b.price;
      return 0;
    });

  const markupCount = filteredItems.filter((i) => i.is_markup).length;

  return (
    <div className="min-h-svh bg-slate-50" data-role="vendor">
      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-base font-extrabold text-slate-800 leading-none">Manajemen Katalog Produk</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {filteredItems.length} barang terdaftar dalam inventori
            </p>
          </div>
          <button onClick={() => setSheetOpen(true)}
            className="flex items-center gap-1.5 h-9 px-4 rounded-2xl text-xs font-bold text-white shadow shadow-emerald-200 active:scale-[0.97] transition-all"
            style={{ background: G }}>
            <Plus size={14} /> Tambah
          </button>
        </div>
      </div>

      {/* ── Search & Filter Bar ── */}
      <div className="max-w-2xl mx-auto px-4 pt-4 flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan nama atau kategori..."
            className="w-full h-11 pl-9 pr-4 rounded-2xl border border-slate-200 bg-white text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all shadow-sm"
          />
        </div>
        <button onClick={() => setFilterOpen(true)}
          className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm">
          <SlidersHorizontal size={16} />
        </button>
      </div>

      {/* ── Category Horizontal Tabs (Consistency with Inbound) ── */}
      <div className="max-w-2xl mx-auto px-4 mt-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {CAT_DATA.map(cat => {
            const Icon = cat.icon;
            const isActive = categoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(cat.id)}
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[10px] font-bold transition-all border ${isActive ? "text-white shadow-sm border-transparent" : "bg-white border-slate-200 text-slate-500"}`}
                style={isActive ? { backgroundColor: cat.color } : {}}
              >
                <Icon size={12} className={isActive ? "text-white" : "text-slate-400"} />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Stats Strip ── */}
      <div className="max-w-2xl mx-auto px-4 mt-3 grid grid-cols-3 gap-2">
        {[
          { icon: Package, label: "Total Inventori", value: filteredItems.length, color: G },
          { icon: Layers, label: "Akumulasi Stok", value: filteredItems.reduce((a, b) => a + b.current_stock, 0).toLocaleString("id-ID"), color: "#1D4ED8" },
          { icon: TrendingUp, label: "Audit Markup HET", value: markupCount, color: "#D97706" },
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
        ) : filteredItems.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center px-8">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4" style={{ background: G_LIGHT }}>
              <Package size={28} style={{ color: G }} />
            </div>
            <h3 className="text-base font-extrabold text-slate-700">Produk Tidak Ditemukan</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Coba sesuaikan kata kunci pencarian atau filter yang Anda gunakan.
            </p>
            <button onClick={() => { setSearch(""); setCategoryFilter("ALL"); }}
              className="mt-5 text-sm font-bold text-emerald-600">
              Reset Filter
            </button>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-2 gap-3">
            <AnimatePresence>
              {filteredItems.map((item) => (
                <ProductCard key={item.id} item={item} onDelete={() => handleDelete(item.id)} />
              ))}
            </AnimatePresence>
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
          <ChevronRight size={10} /> Produk terverifikasi otomatis muncul pada E-Katalog Nasional SPPG
        </div>
      </div>

      {/* ── Add Sheet ── */}
      <AddSheet open={sheetOpen} onClose={() => setSheetOpen(false)} onAdded={fetchItems} vendorId={vendorId} />

      {/* ── Filter Sheet ── */}
      <FilterSheet 
        open={filterOpen} onClose={() => setFilterOpen(false)}
        sortBy={sortBy} setSortBy={setSortBy}
        categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
      />
    </div>
  );
}
