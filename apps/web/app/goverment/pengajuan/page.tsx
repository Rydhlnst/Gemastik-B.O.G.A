"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, BadgeCheck, Wallet, Loader2, CheckCircle2,
  X, ChevronDown, ShieldX, AlertTriangle, Eye,
  Filter, ArrowRight, MapPin, Star, Clock, Building2
} from "lucide-react";
import { ContextualMinimap, type MinimapEntity } from "@/components/goverment/ContextualMinimap";

// ─── Types ──────────────────────────────────────────────────────────────────

type SBTStatus = "menunggu" | "disetujui" | "ditolak";
type SBTStep = "idle" | "processing" | "dompet" | "minting" | "done";

interface SBTApplication {
  id: string;
  vendorNama: string;
  kategori: "katering" | "logistik" | "supplier_bahan";
  pengajuanTanggal: string;
  alamat: string;
  lat: number;
  lng: number;
  sertifikasi: string[];
  kontak: string;
  status: SBTStatus;
  dokumenDibaca: boolean;
}

interface HETLog {
  id: string;
  vendorNama: string;
  komoditas: string;
  hargaDitawarkan: number;
  hargaHET: number;
  markup: number;
  wilayah: string;
  tanggal: string;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────

const SBT_APPLICATIONS: SBTApplication[] = [
  {
    id: "SBT-2025-041",
    vendorNama: "PT Nusantara Katering Prima",
    kategori: "katering",
    pengajuanTanggal: "13 Apr 2025",
    alamat: "Jl. Sudirman No. 88, Bandung",
    lat: -6.9200,
    lng: 107.6080,
    sertifikasi: ["Halal MUI", "BPOM", "ISO 22000"],
    kontak: "Budi Santoso",
    status: "menunggu",
    dokumenDibaca: false,
  },
  {
    id: "SBT-2025-040",
    vendorNama: "CV Berkah Logistik Jabar",
    kategori: "logistik",
    pengajuanTanggal: "12 Apr 2025",
    alamat: "Jl. Kiaracondong No. 45, Bandung",
    lat: -6.9350,
    lng: 107.6450,
    sertifikasi: ["ISO 9001"],
    kontak: "Sari Dewi",
    status: "menunggu",
    dokumenDibaca: false,
  },
  {
    id: "SBT-2025-038",
    vendorNama: "Agro Fresh Lembang",
    kategori: "supplier_bahan",
    pengajuanTanggal: "10 Apr 2025",
    alamat: "Jl. Raya Lembang No. 120, Lembang",
    lat: -6.8120,
    lng: 107.6150,
    sertifikasi: ["Halal MUI", "Organic Certified"],
    kontak: "Hendra Wijaya",
    status: "disetujui",
    dokumenDibaca: true,
  },
];

const HET_PRICES: Record<string, number> = {
  "Beras Premium": 16_000,
  "Ayam Broiler": 38_000,
  "Telur Ayam": 32_000,
  "Minyak Goreng": 17_000,
  "Daging Sapi": 135_000,
};

const HET_LOGS: HETLog[] = [
  { id: "HET-001", vendorNama: "CV Makmur Sejahtera", komoditas: "Beras Premium", hargaDitawarkan: 22_000, hargaHET: 16_000, markup: 37.5, wilayah: "Bandung Utara", tanggal: "13 Apr" },
  { id: "HET-002", vendorNama: "UD Sumber Makmur", komoditas: "Ayam Broiler", hargaDitawarkan: 47_000, hargaHET: 38_000, markup: 23.7, wilayah: "Bandung Selatan", tanggal: "13 Apr" },
  { id: "HET-003", vendorNama: "CV Berkah Pangan", komoditas: "Minyak Goreng", hargaDitawarkan: 19_500, hargaHET: 17_000, markup: 14.7, wilayah: "Bandung Barat", tanggal: "12 Apr" },
  { id: "HET-004", vendorNama: "PT Mega Food", komoditas: "Telur Ayam", hargaDitawarkan: 41_000, hargaHET: 32_000, markup: 28.1, wilayah: "Cimahi", tanggal: "12 Apr" },
];

// ─── SBT Step Progress ──────────────────────────────────────────────────────

const SBT_STEPS: { key: SBTStep; label: string; icon: React.ReactNode }[] = [
  { key: "processing", label: "Memproses", icon: <Loader2 className="w-4 h-4 animate-spin" /> },
  { key: "dompet", label: "Membuat Dompet", icon: <Wallet className="w-4 h-4" /> },
  { key: "minting", label: "Menerbitkan SBT", icon: <BadgeCheck className="w-4 h-4" /> },
  { key: "done", label: "Selesai", icon: <CheckCircle2 className="w-4 h-4" /> },
];

// ─── Confirmation Modal ──────────────────────────────────────────────────────

function ConfirmModal({
  app,
  onClose,
  onConfirm,
}: {
  app: SBTApplication;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [step, setStep] = useState<SBTStep>("idle");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const handleConfirm = async () => {
    const steps: SBTStep[] = ["processing", "dompet", "minting", "done"];
    for (let i = 0; i < steps.length; i++) {
      setStep(steps[i]);
      setCurrentStepIndex(i);
      await new Promise(r => setTimeout(r, 1200));
    }
    setTimeout(onConfirm, 800);
  };

  const isProcessing = step !== "idle";
  const isDone = step === "done";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Konfirmasi Penerbitan SBT</p>
            <h3 className="text-base font-black text-gray-900">{app.vendorNama}</h3>
          </div>
          {!isProcessing && (
            <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="p-6 space-y-5">
          {!isProcessing && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
              <p className="text-[10px] font-black text-amber-800 uppercase tracking-wider mb-1">⚠ Perhatian</p>
              <p className="text-xs text-amber-700">
                Tindakan ini akan menerbitkan SBT <strong>permanen</strong> untuk vendor <strong>{app.vendorNama}</strong>. Identitas digital ini tidak dapat dibatalkan setelah diterbitkan.
              </p>
            </div>
          )}

          {/* Step Progress */}
          {isProcessing && (
            <div className="space-y-3 py-4">
              {SBT_STEPS.map((s, i) => {
                const isActive = currentStepIndex === i;
                const isPast = currentStepIndex > i;
                return (
                  <div key={s.key} className={`flex items-center gap-3 transition-all ${isActive ? "opacity-100" : isPast ? "opacity-60" : "opacity-20"}`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isDone || isPast ? "bg-emerald-500 text-white" : isActive ? "bg-indigo-500 text-white" : "bg-gray-100 text-gray-400"
                    }`}>
                      {isPast || (isDone && i < SBT_STEPS.length - 1) ? <CheckCircle2 className="w-4 h-4" /> : s.icon}
                    </div>
                    <p className={`text-sm font-bold ${isActive ? "text-gray-900" : "text-gray-400"}`}>{s.label}</p>
                    {isActive && !isDone && <div className="ml-auto w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />}
                    {(isPast || (isDone && s.key === "done")) && <CheckCircle2 className="ml-auto w-4 h-4 text-emerald-500" />}
                  </div>
                );
              })}
            </div>
          )}

          {isDone ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-4 space-y-2"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                <BadgeCheck className="w-8 h-8 text-emerald-600" />
              </div>
              <p className="text-base font-black text-emerald-700">SBT Berhasil Diterbitkan!</p>
              <p className="text-xs text-gray-400">Vendor {app.vendorNama} kini memiliki identitas digital on-chain.</p>
            </motion.div>
          ) : !isProcessing ? (
            <button
              onClick={handleConfirm}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              <BadgeCheck className="w-4 h-4" /> Ya, Terbitkan SBT
            </button>
          ) : null}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Kategori Label ────────────────────────────────────────────────────────

const kategoriLabel: Record<SBTApplication["kategori"], string> = {
  katering: "Katering",
  logistik: "Logistik",
  supplier_bahan: "Supplier Bahan",
};

const kategoriColor: Record<SBTApplication["kategori"], string> = {
  katering: "bg-rose-50 text-rose-600 border-rose-100",
  logistik: "bg-indigo-50 text-indigo-600 border-indigo-100",
  supplier_bahan: "bg-emerald-50 text-emerald-600 border-emerald-100",
};

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function PengajuanPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"sbt" | "het">("sbt");
  const [applications, setApplications] = useState(SBT_APPLICATIONS);
  const [expandedApp, setExpandedApp] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<SBTApplication | null>(null);
  const [hetFilter, setHetFilter] = useState("SEMUA");
  const [newlyApproved, setNewlyApproved] = useState<string | null>(null);

  const pendingCount = applications.filter(a => a.status === "menunggu").length;
  const blockedToday = HET_LOGS.length;
  const highestMarkup = Math.max(...HET_LOGS.map(l => l.markup));

  const handleReadDoc = (id: string) => {
    setApplications(prev => prev.map(a => a.id === id ? { ...a, dokumenDibaca: true } : a));
  };

  const handleApprove = (app: SBTApplication) => {
    if (!app.dokumenDibaca) {
      handleReadDoc(app.id);
    }
    setConfirmModal(app);
  };

  const handleConfirmSBT = () => {
    if (!confirmModal) return;
    setApplications(prev => prev.map(a => a.id === confirmModal.id ? { ...a, status: "disetujui" } : a));
    setNewlyApproved(confirmModal.id);
    setConfirmModal(null);
    setTimeout(() => setNewlyApproved(null), 8000);
  };

  const handleReject = (id: string) => {
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status: "ditolak" } : a));
  };

  const filteredLogs = hetFilter === "SEMUA" ? HET_LOGS : HET_LOGS.filter(l => l.komoditas === hetFilter);

  const getVendorMinimap = (app: SBTApplication): MinimapEntity[] => [
    { id: app.id, lat: app.lat, lng: app.lng, type: "vendor", label: app.vendorNama },
  ];

  return (
    <div className="p-6 space-y-5 min-h-full bg-slate-50/50">

      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Pengajuan</h1>
            <p className="text-xs text-gray-400">Penerbitan identitas digital SBT & pemantauan filter harga HET</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wider">{pendingCount} Menunggu Review</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-2xl w-fit">
        {([
          { key: "sbt", label: "Penerbitan SBT", icon: BadgeCheck, badge: pendingCount },
          { key: "het", label: "Filter Harga HET", icon: ShieldX, badge: 0 },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`relative flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
              activeTab === tab.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
            {tab.badge > 0 && (
              <span className="w-4 h-4 rounded-full bg-indigo-500 text-white text-[8px] flex items-center justify-center">{tab.badge}</span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ─── SBT Panel ─── */}
        {activeTab === "sbt" && (
          <motion.div key="sbt" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">

            {applications.map(app => (
              <motion.div key={app.id} layout className={`bg-white rounded-3xl border shadow-sm overflow-hidden ${
                app.status === "menunggu" ? "border-indigo-100" : app.status === "disetujui" ? "border-emerald-100" : "border-red-100"
              }`}>

                {/* Card Header */}
                <button
                  onClick={() => { setExpandedApp(expandedApp === app.id ? null : app.id); handleReadDoc(app.id); }}
                  className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      app.status === "menunggu" ? "bg-indigo-50 text-indigo-600" : app.status === "disetujui" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                    }`}>
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{app.id}</span>
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${kategoriColor[app.kategori]}`}>
                          {kategoriLabel[app.kategori]}
                        </span>
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${
                          app.status === "menunggu" ? "bg-amber-100 text-amber-700" : app.status === "disetujui" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                        }`}>
                          {app.status === "menunggu" ? "Menunggu" : app.status === "disetujui" ? "Disetujui" : "Ditolak"}
                        </span>
                      </div>
                      <p className="text-sm font-black text-gray-900">{app.vendorNama}</p>
                      <p className="text-[10px] text-gray-400">{app.alamat} · {app.pengajuanTanggal}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!app.dokumenDibaca && app.status === "menunggu" && (
                      <span className="text-[8px] font-black text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">
                        Belum dibaca
                      </span>
                    )}
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedApp === app.id ? "rotate-180" : ""}`} />
                  </div>
                </button>

                {/* Expanded Detail */}
                <AnimatePresence>
                  {expandedApp === app.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-gray-100"
                    >
                      <div className="p-6 space-y-5">
                        <div className="grid grid-cols-2 gap-5">
                          {/* Details */}
                          <div className="space-y-4">
                            <div>
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Sertifikasi</p>
                              <div className="flex flex-wrap gap-1.5">
                                {app.sertifikasi.map(s => (
                                  <span key={s} className="flex items-center gap-1 text-[9px] font-black px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg">
                                    <Star className="w-2.5 h-2.5" /> {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Kontak PIC</p>
                              <p className="text-sm font-bold text-gray-700">{app.kontak}</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Lokasi Operasional</p>
                              <p className="text-xs text-gray-600">{app.alamat}</p>
                            </div>
                          </div>

                          {/* Minimap Gateway (shown after approval) */}
                          <div className="space-y-3">
                            {app.status === "disetujui" && (
                              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-emerald-500" /> Lokasi Vendor di Wilayah
                                </p>
                                <p className="text-[9px] text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100 mb-2">
                                  Vendor ini berada di wilayah <strong>Bandung</strong>. Klik untuk lihat cakupan wilayah.
                                </p>
                                <ContextualMinimap
                                  entities={getVendorMinimap(app)}
                                  navigateTo="/goverment/pengawasan"
                                  navigateParams={{ vendor: app.id }}
                                  label={`Lokasi ${app.vendorNama}`}
                                />
                              </motion.div>
                            )}
                            {app.status === "menunggu" && (
                              <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 min-h-[100px]">
                                <MapPin className="w-6 h-6 text-gray-300" />
                                <p className="text-[9px] text-gray-400 font-bold text-center">Minimap lokasi akan muncul setelah SBT disetujui</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        {app.status === "menunggu" && (
                          <div className="flex gap-3 pt-2 border-t border-gray-100">
                            <button
                              onClick={() => handleReject(app.id)}
                              className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-red-200 text-red-600 text-[10px] font-black uppercase tracking-wider hover:bg-red-50 transition-all"
                            >
                              <X className="w-4 h-4" /> Tolak Pengajuan
                            </button>
                            <button
                              disabled={!app.dokumenDibaca}
                              onClick={() => handleApprove(app)}
                              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-[10px] font-black uppercase tracking-wider transition-all shadow-md shadow-indigo-500/20 disabled:shadow-none"
                            >
                              <BadgeCheck className="w-4 h-4" />
                              {app.dokumenDibaca ? "Setujui & Terbitkan SBT" : "Baca Dokumen Dulu"}
                            </button>
                          </div>
                        )}

                        {app.status === "disetujui" && (
                          <div className="flex items-center gap-2 text-emerald-600 text-xs font-black pt-2 border-t border-gray-100">
                            <CheckCircle2 className="w-4 h-4" /> SBT telah diterbitkan on-chain
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ─── HET Panel ─── */}
        {activeTab === "het" && (
          <motion.div key="het" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldX className="w-3.5 h-3.5 text-red-500" />
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Diblokir Hari Ini</p>
                </div>
                <p className="text-2xl font-black text-red-600">{blockedToday}</p>
                <p className="text-[9px] text-gray-400 font-medium">penawaran ditolak</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Mark-up Tertinggi</p>
                </div>
                <p className="text-2xl font-black text-amber-600">{highestMarkup.toFixed(1)}%</p>
                <p className="text-[9px] text-gray-400 font-medium">di atas HET</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Harga HET Live</p>
                <p className="text-[9px] text-gray-500 font-medium">Sumber: PIHPS Nasional</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {Object.keys(HET_PRICES).slice(0, 3).map(k => (
                    <span key={k} className="text-[7px] font-black px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-md">{k}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* HET Prices Reference */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Referensi Harga HET Nasional</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {Object.entries(HET_PRICES).map(([name, price]) => (
                  <div key={name} className="text-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-tight mb-1">{name}</p>
                    <p className="text-sm font-black text-indigo-600 tabular-nums">Rp {price.toLocaleString("id-ID")}</p>
                    <p className="text-[7px] text-gray-400">/ kg</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Block Log Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-red-50/60">
                <div>
                  <p className="text-sm font-black text-gray-900">Log Pemblokiran</p>
                  <p className="text-[9px] text-red-400 font-medium">Penawaran yang melebihi batas HET</p>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-red-300" />
                  <div className="flex gap-1 bg-white/70 border border-red-100 p-1 rounded-xl">
                    {["SEMUA", ...Object.keys(HET_PRICES)].slice(0, 4).map(k => (
                      <button
                        key={k}
                        onClick={() => setHetFilter(k)}
                        className={`px-3 py-1 text-[8px] font-black rounded-lg transition-all ${hetFilter === k ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-gray-600"}`}
                      >
                        {k.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-50">
                {filteredLogs.map((log, i) => (
                  <div
                    key={log.id}
                    className="px-6 py-4 flex items-center gap-4 hover:bg-red-50/40 transition-colors"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
                      <ShieldX className="w-4 h-4 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-gray-900 truncate">{log.vendorNama}</p>
                      <p className="text-[9px] text-gray-400">{log.komoditas} · {log.wilayah} · {log.tanggal}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-black text-red-600">Rp {log.hargaDitawarkan.toLocaleString("id-ID")}</p>
                      <p className="text-[9px] text-gray-400">HET: Rp {log.hargaHET.toLocaleString("id-ID")}</p>
                    </div>
                    <div className={`flex-shrink-0 px-3 py-1 rounded-xl text-[10px] font-black ${
                      log.markup >= 30 ? "bg-red-100 text-red-700" : log.markup >= 20 ? "bg-amber-100 text-amber-700" : "bg-orange-100 text-orange-700"
                    }`}>
                      +{log.markup.toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Modal */}
      <AnimatePresence>
        {confirmModal && (
          <ConfirmModal app={confirmModal} onClose={() => setConfirmModal(null)} onConfirm={handleConfirmSBT} />
        )}
      </AnimatePresence>
    </div>
  );
}
