"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, CheckCircle2, QrCode, ShieldCheck, 
  AlertTriangle, ArrowRight, RefreshCcw, Package, 
  User, Building2, Wallet, Clock, Check, Hash, MapPin
} from "lucide-react";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

/* ─── Constants ─── */
const API = "http://localhost:3001";
const G = "#065F46";
const G_LIGHT = "#D1FAE5";

/* ─── Types ─── */
interface Vendor {
  id: string;
  business_name: string;
}

interface Commodity {
  id: string;
  name: string;
  harga: number;
  unit: string;
}

/* ─── Main Page ─── */
export default function SimulatorPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState("");
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [selectedComm, setSelectedComm] = useState("");
  const [qty, setQty] = useState(10);
  
  const [loading, setLoading] = useState(false);
  const [currentPO, setCurrentPO] = useState<any>(null);
  const [step, setStep] = useState(1); // 1: Create, 2: Process, 3: QC/Admin, 4: Done

  // Checklist states
  const [checklist, setChecklist] = useState({
    barcode: false,
    logistik: false,
    qc: false,
    admin: false
  });

  /* ─── Data Fetching ─── */
  useEffect(() => {
    // Load real vendors from API
    const loadVendors = async () => {
      try {
        const res = await fetch(`${API}/api/vendors`);
        const json = await res.json();
        if (json.status === "success") {
          setVendors(json.data || []);
        }
      } catch (e) {
        logger.error('Simulator', 'Gagal memuat daftar vendor', e);
      }
    };
    loadVendors();
  }, []);

  const fetchCommodities = useCallback(async (vId: string) => {
    try {
      const res = await fetch(`${API}/api/vendors/${vId}/commodities`);
      const json = await res.json();
      if (json.status === "success") setCommodities(json.data || []);
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (selectedVendor) fetchCommodities(selectedVendor);
  }, [selectedVendor, fetchCommodities]);

  /* ─── Actions ─── */
  const createTestOrder = async () => {
    if (!selectedVendor || !selectedComm) {
      toast.error("Pilih Vendor dan Barang dulu bro!");
      return;
    }
    setLoading(true);
    try {
      const comm = commodities.find(c => c.id === selectedComm);
      
      // Auto-Match SPPG based on Location (3201=Bogor, 3273=Bandung, default=Jakarta)
      let pembeliId = "ACC-GOV-31710001"; // Jakarta
      if (selectedVendor.includes("3201")) pembeliId = "ACC-GOV-32010001"; // Bogor

      const res = await fetch(`${API}/api/spk/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId: selectedVendor,
          pembeliId: pembeliId, // Pass regional SPPG
          items: [{ commodityId: selectedComm, quantity: qty, price: comm?.harga || 0 }]
        })
      });
      const json = await res.json();
      if (json.status === "success") {
        setCurrentPO({ 
          id: json.data.poId, 
          pembeliId, 
          vendorId: selectedVendor,
          totalHarga: json.data.totalHarga,
          status: "PENDING" 
        });
        setStep(2);
        toast.success(`Pesanan SPPG ${pembeliId.includes("3201") ? "Bogor" : "Pusat"} Berhasil Dibuat! 🚀`);
        console.log("✅ Simulator: Pesanan Dibuat", { id: json.data.poId, data: json.data });
        logger.info('Simulator', 'Test PO Created', { poId: json.data.poId, sppg: pembeliId });
      }
    } catch (error) {
      toast.error("Gagal buat pesanan.");
    } finally {
      setLoading(false);
    }
  };

  const simulateStage = async (stage: string) => {
    setLoading(true);
    try {
      // Simulate backend status updates
      let nextStatus = "";
      if (stage === "accept") nextStatus = "READY_FOR_PICKUP";
      if (stage === "pickup") nextStatus = "PROCESSED";
      if (stage === "complete") nextStatus = "COMPLETED";

      console.log(`🚀 Simulator: Mengupdate Tahap ${stage}...`, { id: currentPO?.id, status: nextStatus });
      const res = await fetch(`${API}/api/spk/${currentPO?.id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus })
      });
      
      const json = await res.json();
      if (json.status === "success") {
        setCurrentPO({ ...currentPO, status: nextStatus });
        toast.success(`Tahap ${stage} Berhasil! ✅`);
      }
    } catch (e) {
      toast.error("Gagal update tahap.");
    } finally {
      setLoading(false);
    }
  };

  const resetSimulator = () => {
    setCurrentPO(null);
    setStep(1);
    setChecklist({ barcode: false, logistik: false, qc: false, admin: false });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">B.O.G.A Simulator</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Pengujian End-to-End Alur SPPG → Vendor</p>
          </div>
          <button onClick={resetSimulator} className="p-2 bg-white rounded-2xl border border-slate-200 text-slate-400 hover:text-rose-500 transition-colors">
            <RefreshCcw size={20} />
          </button>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-8 px-2 overflow-x-auto no-scrollbar">
          {[
            { id: 1, label: "Buat Pesanan", icon: ShoppingBag },
            { id: 2, label: "Logistik & Barcode", icon: QrCode },
            { id: 3, label: "Validasi Multi-Sig", icon: ShieldCheck },
            { id: 4, label: "Selesai", icon: CheckCircle2 },
          ].map((s) => (
            <div key={s.id} className="flex items-center gap-2 shrink-0">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all ${step === s.id ? "bg-emerald-600 border-transparent text-white shadow-lg shadow-emerald-200" : "bg-white border-slate-200 text-slate-400"}`}>
                <s.icon size={16} />
                <span className="text-xs font-bold whitespace-nowrap">{s.label}</span>
              </div>
              {s.id < 4 && <ArrowRight size={14} className="text-slate-300" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Panel */}
          <div className="md:col-span-2 space-y-6">
            
            {/* STEP 1: CREATE */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <ShoppingBag size={20} />
                  </div>
                  Buat Pesanan Test
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-1 block">Pilih Vendor</label>
                    <select value={selectedVendor} onChange={e => setSelectedVendor(e.target.value)}
                      className="w-full h-12 px-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500/20 outline-none appearance-none">
                      <option value="">-- Pilih Vendor --</option>
                      {vendors.map(v => (
                        <option key={v.id} value={v.id}>
                          {v.id.includes("3273") ? "🏙️ [Bandung] " : v.id.includes("3201") ? "🌳 [Bogor] " : "🏛️ [Pusat] "}
                          {v.business_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-1 block">Pilih Barang</label>
                    <select value={selectedComm} onChange={e => setSelectedComm(e.target.value)}
                      className="w-full h-12 px-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500/20 outline-none appearance-none">
                      <option value="">-- Pilih Barang --</option>
                      {commodities.map(c => <option key={c.id} value={c.id}>{c.name} - Rp {c.harga.toLocaleString()}/{c.unit}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-1 block">Jumlah Pesanan</label>
                    <input type="number" value={qty} onChange={e => setQty(Number(e.target.value))}
                      className="w-full h-12 px-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500/20 outline-none" />
                  </div>

                  <button onClick={createTestOrder} disabled={loading}
                    className="w-full h-14 bg-emerald-600 rounded-3xl text-white font-black text-sm shadow-xl shadow-emerald-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4">
                    {loading ? "Memproses..." : "Buat Pesanan Sekarang 🚀"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: LOGISTICS */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                    <QrCode size={20} />
                  </div>
                  Tahap Logistik & Barcode
                </h2>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-widest">Checklist Logistik</p>
                    <div className="space-y-3">
                      {[
                        { key: "barcode", label: "Scan QR Serah Terima" },
                        { key: "logistik", label: "Verifikasi Lokasi Pickup" }
                      ].map(item => (
                        <label key={item.key} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 cursor-pointer hover:bg-emerald-50 transition-colors">
                          <input type="checkbox" checked={checklist[item.key as keyof typeof checklist]}
                            onChange={() => setChecklist({...checklist, [item.key]: !checklist[item.key as keyof typeof checklist]})}
                            className="w-5 h-5 rounded-lg border-slate-200 text-emerald-600 focus:ring-emerald-500" />
                          <span className="text-sm font-bold text-slate-700">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} className="flex-1 h-12 rounded-2xl border border-slate-200 text-slate-400 font-bold text-sm">Kembali</button>
                    <button onClick={() => {
                        if (checklist.barcode && checklist.logistik) {
                          simulateStage("pickup");
                          setStep(3);
                        } else {
                          toast.error("Check dulu semua bro!");
                        }
                      }}
                      className="flex-[2] h-12 bg-amber-500 rounded-2xl text-white font-black text-sm shadow-lg shadow-amber-100">
                      Lanjut ke Validasi ➔
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: QC & ADMIN */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                    <ShieldCheck size={20} />
                  </div>
                  Validasi Multi-Sig & QC
                </h2>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-widest">Persetujuan Pihak Berwenang</p>
                    <div className="space-y-3">
                      {[
                        { key: "qc", label: "Persetujuan Kualitas (QC)" },
                        { key: "admin", label: "Persetujuan Administrasi (Admin)" }
                      ].map(item => (
                        <label key={item.key} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 cursor-pointer hover:bg-purple-50 transition-colors">
                          <input type="checkbox" checked={checklist[item.key as keyof typeof checklist]}
                            onChange={() => setChecklist({...checklist, [item.key]: !checklist[item.key as keyof typeof checklist]})}
                            className="w-5 h-5 rounded-lg border-slate-200 text-purple-600 focus:ring-purple-500" />
                          <span className="text-sm font-bold text-slate-700">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* REVISION FEATURE */}
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100">
                    <p className="text-xs font-bold text-rose-600 mb-2 flex items-center gap-2">
                      <AlertTriangle size={14} /> FITUR REVISI
                    </p>
                    <p className="text-[10px] text-rose-500 leading-relaxed mb-4">
                      Gunakan ini jika QC menemukan barang tidak sesuai. Status akan dikembalikan ke VENDOR untuk penggantian barang.
                    </p>
                    <button onClick={() => {
                      toast.info("Simulasi Revisi: Mengembalikan ke Tahap Logistik...");
                      setStep(2);
                      setChecklist({...checklist, barcode: false, logistik: false});
                    }} className="w-full py-3 rounded-xl bg-white border border-rose-200 text-rose-600 text-[11px] font-black uppercase tracking-widest shadow-sm">
                      Kirim Revisi ke Vendor
                    </button>
                  </div>

                  <button onClick={() => {
                      if (checklist.qc && checklist.admin) {
                        simulateStage("complete");
                        setStep(4);
                      } else {
                        toast.error("QC dan Admin belum approve!");
                      }
                    }}
                    className="w-full h-14 bg-purple-600 rounded-3xl text-white font-black text-sm shadow-xl shadow-purple-100 mt-4">
                    Selesaikan Pesanan & Cairkan Escrow 💸
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: DONE */}
            {step === 4 && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[32px] p-12 border border-slate-100 shadow-xl text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6 text-emerald-600 shadow-lg shadow-emerald-50">
                  <CheckCircle2 size={40} />
                </div>
                <h2 className="text-2xl font-black text-slate-800 mb-2">Simulasi Berhasil!</h2>
                <p className="text-sm text-slate-500 mb-8">
                  Alur pesanan dari SPPG ke Vendor telah selesai 100% secara digital & terverifikasi.
                </p>
                <button onClick={resetSimulator} className="h-14 px-8 bg-slate-800 rounded-3xl text-white font-black text-sm active:scale-[0.98] transition-all">
                  Mulai Simulasi Baru
                </button>
              </motion.div>
            )}

          </div>

          {/* Sidebar: Detail Pesanan */}
          <div className="space-y-6">
            <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm sticky top-24">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Detail Pesanan Aktif</h3>
              
              {!currentPO ? (
                <div className="py-12 text-center text-slate-300">
                  <Package size={32} className="mx-auto mb-2 opacity-20" />
                  <p className="text-[10px] font-bold">Belum ada pesanan</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50">
                    <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-slate-400 border border-slate-100">
                      <Hash size={14} />
                    </div>
                    <div>
                      <p className="text-[8px] font-bold text-slate-400 uppercase">Order ID</p>
                      <p className="text-[11px] font-mono font-bold text-slate-700">{currentPO.id}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin size={12} className="text-slate-400" />
                      <p className="text-[10px] font-bold text-slate-600">
                        {currentPO.pembeliId.includes("3201") ? "SPPG KAB. BOGOR" : "SPPG PUSAT JAKARTA"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <User size={12} className="text-slate-400" />
                      <p className="text-[10px] font-bold text-slate-600 truncate">{currentPO.vendorId}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wallet size={12} className="text-slate-400" />
                      <p className="text-[10px] font-bold text-emerald-600">Rp {currentPO.totalHarga.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={12} className="text-slate-400" />
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{currentPO.status}</p>
                    </div>
                  </div>

                  {/* Live Progress Bar */}
                  <div className="pt-4 mt-4 border-t border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Progress Alur</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full ${step >= i ? "bg-emerald-500" : "bg-slate-100"}`} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Helper */}
            <div className="p-6 rounded-[32px] bg-slate-900 text-white shadow-xl shadow-slate-200">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Debug Info</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-500">API Port</span>
                  <span className="font-mono font-bold text-emerald-400">3001</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-500">Cookie Auth</span>
                  <span className="font-mono font-bold text-emerald-400">TRUE</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-500">Zero-Trust Bridge</span>
                  <span className="font-mono font-bold text-emerald-400">ACTIVE</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
