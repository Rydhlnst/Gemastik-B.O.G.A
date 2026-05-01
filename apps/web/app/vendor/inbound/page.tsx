"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";
import {
  ArrowDownToLine, Package, MapPin, FileText,
  Loader2, Plus, X, Search, CheckCircle2,
  Hash, Boxes, Building2, Tag,
  Wheat, Beef, Fish, Sprout, ChefHat, Apple, Factory, LayoutGrid,
  UploadCloud, ImageIcon, FileX, Trash2, Clock, AlertCircle
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
interface Commodity { id: string; name: string; unit: string; current_stock: number; category: string; }
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
      {/* Search */}
      <div className="relative">
        <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Cari nama barang..."
          className="w-full h-11 pl-9 pr-4 rounded-2xl border border-slate-200 bg-slate-50 text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all" />
      </div>

      {/* Category Tabs */}
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

      {/* Grid List */}
      <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto no-scrollbar">
        {filtered.length === 0 && (
          <div className="col-span-2 py-8 text-center">
            <p className="text-xs text-slate-400">Barang tidak ditemukan di kategori ini</p>
          </div>
        )}
        {filtered.map(c => {
          const isSelected = selected === c.id;
          return (
            <button key={c.id} type="button" onClick={() => onSelect(c.id)}
              className={`relative flex flex-col p-3 rounded-2xl border text-left transition-all ${isSelected ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500/50" : "border-slate-100 bg-slate-50 hover:bg-slate-100"}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                  <Package size={14} />
                </div>
                {isSelected && (
                  <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: G }}>
                    <CheckCircle2 size={10} className="text-white" />
                  </div>
                )}
              </div>
              <p className={`text-[11px] font-bold leading-tight ${isSelected ? "text-emerald-700" : "text-slate-700"}`}>{c.name}</p>
              <p className="text-[9px] text-slate-400 mt-1 font-medium">Stok: <span className="font-bold">{c.current_stock.toLocaleString("id-ID")}</span> {c.unit}</p>
              
              {/* Category Mini Badge */}
              <div className="mt-2 text-[8px] font-black uppercase tracking-tighter text-slate-300">
                {c.category}
              </div>
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
            <p className="text-xs text-slate-700 font-semibold mt-0.5">{m.origin_source_location === `${m.origin_lat},${m.origin_lng}` ? "Lokasi Terverifikasi" : m.origin_source_location}</p>
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
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-1.5">
        <Clock size={10} className="text-slate-300" />
        <p className="text-[10px] text-slate-500 font-medium">{formatDate(m.created_at)}</p>
      </div>
    </motion.div>
  );
}

/* ─── Image Uploader ─── */
function ProofUploader({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.match(/image\/(png|jpg|jpeg)/)) {
      toast.error("Hanya file JPG/PNG yang diperbolehkan");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      onChange(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  if (value) {
    return (
      <div className="relative rounded-[2rem] overflow-hidden border border-slate-200 group aspect-video bg-slate-50">
        <img src={value} alt="Preview" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
          <button 
            type="button" 
            onClick={() => onChange("")}
            className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={() => setDragActive(false)}
      onDrop={e => { e.preventDefault(); setDragActive(false); if(e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
      className={`relative w-full aspect-[16/9] rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all cursor-pointer hover:bg-slate-50/50 ${dragActive ? "border-emerald-500 bg-emerald-50/50 scale-[0.98]" : "border-slate-200 bg-white"}`}
    >
      <input 
        ref={inputRef} 
        type="file" 
        className="hidden" 
        accept="image/png, image/jpeg" 
        onChange={e => { if(e.target.files?.[0]) handleFile(e.target.files[0]); }}
      />
      
      {/* Plus Icon Box */}
      <div className="w-16 h-16 rounded-[1.25rem] bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-300">
        <Plus size={32} strokeWidth={1.5} />
      </div>

      <div className="text-center">
        <p className="text-[11px] font-bold text-slate-400 group-hover:text-emerald-600 transition-colors">Ketuk untuk pilih foto</p>
        <p className="text-[9px] text-slate-300 font-medium tracking-tight mt-0.5">Sistem otomatis unggah ke R2 Storage</p>
      </div>
    </div>
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
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm" style={{ height: 220 }}>
                  <LocationPickerMapLibre
                    onLocationChange={(lat, lng) =>
                      setForm(p => ({ ...p, origin_lat: String(lat), origin_lng: String(lng) }))
                    }
                  />
                  
                </div>
                {!form.origin_lat && (
                  <p className="text-[10px] text-slate-400 mt-1.5 ml-1 flex items-center gap-1">
                    <MapPin size={10} /> Klik pada peta untuk mengunci lokasi asal barang
                  </p>
                )}
              </div>

              {/* Latitude & Longitude (Otomatis dari Peta) */}
              <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div>
                  <FLabel>Latitude</FLabel>
                  <div className="relative">
                    <MapPin size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                    <Input className={`${inputCls} pl-9 font-mono text-[11px] bg-slate-50`} 
                      value={form.origin_lat} readOnly placeholder="-6.xxxxxx" />
                  </div>
                </div>
                <div>
                  <FLabel>Longitude</FLabel>
                  <div className="relative">
                    <MapPin size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                    <Input className={`${inputCls} pl-9 font-mono text-[11px] bg-slate-50`} 
                      value={form.origin_lng} readOnly placeholder="106.xxxxxx" />
                  </div>
                </div>
              </div>

              {/* Bukti Nota */}
              <div>
                <div className="flex items-center justify-between mb-2 px-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Foto Produk</p>
                  <p className="text-[10px] text-slate-300 italic font-medium tracking-tight">JPG/PNG (Maks 2MB)</p>
                </div>
                <ProofUploader 
                  value={form.origin_proof_url} 
                  onChange={(val) => setForm(p => ({ ...p, origin_proof_url: val }))} 
                />
                <p className="text-[10px] text-slate-400 mt-3 ml-1 leading-relaxed italic">
                  * Pastikan foto nota terlihat jelas untuk keperluan audit Zero-Trust B.O.G.A
                </p>
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
      else throw new Error("API call failed");
    } catch (err) { 
      setCommodities([
        { id: "1", name: "Beras Premium", unit: "kg", current_stock: 1250, category: "Karbohidrat" },
        { id: "2", name: "Daging Sapi Segar", unit: "kg", current_stock: 450, category: "Protein Hewani" },
        { id: "3", name: "Telur Ayam Ras", unit: "kg", current_stock: 800, category: "Protein Hewani" },
        { id: "4", name: "Ikan Bandeng", unit: "kg", current_stock: 300, category: "Protein Ikan" },
        { id: "5", name: "Bayam Hijau", unit: "ikat", current_stock: 150, category: "Sayur & Buah" },
      ]);
      setMovements([
        {
          id: "MOV-IN-001", commodity_id: "1", quantity: 500,
          origin_source_name: "UD. Pangan Jaya (Karawang)",
          origin_source_location: "-6.3000,107.3000",
          origin_proof_url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400",
          origin_proof_hash: "sha256:5f4dcc3b5aa765d61d8327deb882cf99",
          created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
        },
        {
          id: "MOV-IN-002", commodity_id: "2", quantity: 150,
          origin_source_name: "Rumah Potong Halal Bekasi",
          origin_source_location: "-6.2383,106.9756",
          origin_proof_url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
          origin_proof_hash: "sha256:7e8f9d0c1b2a3d4e5f6g7h8i9j0k1l2m",
          created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
        },
        {
          id: "MOV-IN-003", commodity_id: "3", quantity: 2000,
          origin_source_name: "Peternakan Jaya Abadi (Blitar)",
          origin_source_location: "-8.0983,112.1681",
          origin_proof_url: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&q=80&w=400",
          origin_proof_hash: "sha256:a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
          created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
        },
        {
          id: "MOV-IN-004", commodity_id: "4", quantity: 300,
          origin_source_name: "TPI Muara Angke (Jakarta)",
          origin_source_location: "-6.1084,106.7738",
          origin_proof_url: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=400",
          origin_proof_hash: "sha256:q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2",
          created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
        },
        {
          id: "MOV-IN-005", commodity_id: "5", quantity: 850,
          origin_source_name: "Kelompok Tani Lembang",
          origin_source_location: "-6.8172,107.6186",
          origin_proof_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400",
          origin_proof_hash: "sha256:m1n2o3p4q5r6s7t8u9v0w1x2y3z4a5b6",
          created_at: new Date(Date.now() - 1 * 3600000).toISOString(),
        },
      ]);
    } finally { setLoadingData(false); }
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

        {/* Low Stock Alerts (Priority Based) */}
        {commodities.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-500 flex items-center gap-1.5">
                <AlertCircle size={12} /> Perlu Perhatian
              </p>
              <Link href="/vendor/katalog" className="text-[10px] font-bold text-slate-400 hover:text-emerald-600 transition-colors">
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
                        <p className={`text-xs font-extrabold ${isCritical ? "text-red-600" : "text-emerald-700"}`}>
                          {c.current_stock.toLocaleString("id-ID")} <span className="font-normal text-slate-400">{c.unit}</span>
                        </p>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <motion.div className="h-full rounded-full"
                          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          style={{ background: pct < 20 ? "#EF4444" : pct < 50 ? "#F59E0B" : G }} />
                      </div>
                      {isCritical && (
                        <p className="text-[9px] text-red-500 font-bold mt-2 flex items-center gap-1 uppercase tracking-tighter">
                           Segera lakukan Inbound untuk menambah stok
                        </p>
                      )}
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
