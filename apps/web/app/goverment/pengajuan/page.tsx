"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, BadgeCheck, Wallet, Loader2, CheckCircle2,
  X, ChevronDown, ShieldX, AlertTriangle, Eye, EyeOff,
  Filter, MapPin, Star, Clock, Building2, Download, User,
  Phone, Mail, CreditCard, Home, Calendar,
} from "lucide-react";
import { VendorLocationMap } from "@/components/goverment/VendorLocationMap";

// ─── Types ───────────────────────────────────────────────────────────────────

type SBTStatus = "menunggu" | "disetujui" | "ditolak";
type SBTStep = "idle" | "processing" | "dompet" | "minting" | "done";

/** Full sertifikasi catalogue — badge + optional dokumen file */
interface SertifikasiItem {
  nama: string;
  /** filename or URL — null = belum upload */
  berkas: string | null;
}

/** PIC (Person In Charge) profile — connect to API later */
interface PICProfile {
  nama: string;
  ttl: string | null;       // TODO: connect to API
  domisili: string | null;  // TODO: connect to API
  hp: string | null;        // TODO: connect to API
  email: string | null;     // TODO: connect to API
  rekening: string | null;  // TODO: connect to API — stored masked
}

interface SBTApplication {
  id: string;
  vendorNama: string;
  kategori: "katering" | "logistik" | "supplier_bahan";
  pengajuanTanggal: string;
  alamat: string;
  lat: number;
  lng: number;
  sertifikasi: SertifikasiItem[];
  pic: PICProfile;
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

// ─── Mock Data ────────────────────────────────────────────────────────────────

const SBT_APPLICATIONS: SBTApplication[] = [
  {
    id: "SBT-2025-041",
    vendorNama: "PT Nusantara Katering Prima",
    kategori: "katering",
    pengajuanTanggal: "13 Apr 2025",
    alamat: "Jl. Sudirman No. 88, Bandung",
    lat: -6.9200,
    lng: 107.6080,
    sertifikasi: [
      { nama: "Halal MUI",                     berkas: "halal-mui-2025.pdf" },
      { nama: "BPOM",                           berkas: "bpom-reg-2025.pdf" },
      { nama: "ISO 22000",                      berkas: "iso22000-cert.pdf" },
      { nama: "NPWP",                           berkas: "npwp-vendor.pdf" },
      { nama: "NIB",                            berkas: null },
      { nama: "SLHS (Dinkes)",                  berkas: null },
      { nama: "Sertifikat Penjamah Makanan",    berkas: "sertifikat-penjamah.pdf" },
    ],
    pic: {
      nama: "Budi Santoso",
      ttl: "Bandung, 14 Maret 1985",      // TODO: connect to API
      domisili: "Jl. Cibeunying No. 12, Bandung", // TODO: connect to API
      hp: "0812-3456-7890",               // TODO: connect to API
      email: "budi.santoso@nusantara.id", // TODO: connect to API
      rekening: "1234567891234",          // TODO: connect to API
    },
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
    sertifikasi: [
      { nama: "ISO 9001",                       berkas: "iso9001-cert.pdf" },
      { nama: "NPWP",                           berkas: "npwp-berkah.pdf" },
      { nama: "NIB",                            berkas: "nib-berkah.pdf" },
      { nama: "SLHS (Dinkes)",                  berkas: null },
      { nama: "Sertifikat Penjamah Makanan",    berkas: null },
    ],
    pic: {
      nama: "Sari Dewi",
      ttl: null,   // TODO: connect to API
      domisili: null, // TODO: connect to API
      hp: "0821-9988-7766", // TODO: connect to API
      email: null, // TODO: connect to API
      rekening: null, // TODO: connect to API
    },
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
    sertifikasi: [
      { nama: "Halal MUI",                     berkas: "halal-agro.pdf" },
      { nama: "Organic Certified",             berkas: "organic-cert.pdf" },
      { nama: "NPWP",                          berkas: "npwp-agro.pdf" },
      { nama: "NIB",                           berkas: "nib-agro.pdf" },
      { nama: "SLHS (Dinkes)",                 berkas: "slhs-agro.pdf" },
      { nama: "Sertifikat Penjamah Makanan",   berkas: null },
    ],
    pic: {
      nama: "Hendra Wijaya",
      ttl: "Lembang, 22 Juli 1979",        // TODO: connect to API
      domisili: "Jl. Raya Lembang No. 120", // TODO: connect to API
      hp: "0819-1234-5678",                // TODO: connect to API
      email: "hendra@agrofresh.id",        // TODO: connect to API
      rekening: "9876543212345",           // TODO: connect to API
    },
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
  { id: "HET-001", vendorNama: "CV Makmur Sejahtera",  komoditas: "Beras Premium", hargaDitawarkan: 22_000, hargaHET: 16_000, markup: 37.5, wilayah: "Bandung Utara",   tanggal: "13 Apr" },
  { id: "HET-002", vendorNama: "UD Sumber Makmur",     komoditas: "Ayam Broiler",  hargaDitawarkan: 47_000, hargaHET: 38_000, markup: 23.7, wilayah: "Bandung Selatan", tanggal: "13 Apr" },
  { id: "HET-003", vendorNama: "CV Berkah Pangan",     komoditas: "Minyak Goreng", hargaDitawarkan: 19_500, hargaHET: 17_000, markup: 14.7, wilayah: "Bandung Barat",   tanggal: "12 Apr" },
  { id: "HET-004", vendorNama: "PT Mega Food",         komoditas: "Telur Ayam",    hargaDitawarkan: 41_000, hargaHET: 32_000, markup: 28.1, wilayah: "Cimahi",          tanggal: "12 Apr" },
];

// ─── SBT Step Progress ────────────────────────────────────────────────────────

const SBT_STEPS: { key: SBTStep; label: string; icon: React.ReactNode }[] = [
  { key: "processing", label: "Memproses",        icon: <Loader2 className="w-4 h-4 animate-spin" /> },
  { key: "dompet",     label: "Membuat Dompet",   icon: <Wallet className="w-4 h-4" /> },
  { key: "minting",    label: "Menerbitkan SBT",  icon: <BadgeCheck className="w-4 h-4" /> },
  { key: "done",       label: "Selesai",           icon: <CheckCircle2 className="w-4 h-4" /> },
];

// ─── Sertifikasi Badge — with gradient hover/active ─────────────────────────

function SertBadge({
  item,
  onClick,
}: {
  item: SertifikasiItem;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const gradientStyle: React.CSSProperties =
    pressed
      ? { background: "linear-gradient(135deg,#4f46e5,#0891b2)", color: "white", borderColor: "transparent" }
      : hovered
      ? { background: "linear-gradient(135deg,#6366f1,#06b6d4)", color: "white", borderColor: "transparent" }
      : {};

  const baseClass = !hovered && !pressed
    ? item.berkas
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : "bg-gray-50 text-gray-400 border-gray-200"
    : "";

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={gradientStyle}
      className={`flex items-center gap-1 text-[9px] font-black px-2.5 py-1 rounded-lg border transition-transform hover:scale-105 active:scale-95 ${baseClass}`}
      title={item.berkas ? "Klik untuk download berkas" : "Berkas belum tersedia"}
    >
      <Star className="w-2.5 h-2.5 flex-shrink-0" />
      {item.nama}
    </button>
  );
}

// ─── Sertifikasi Doc Modal ────────────────────────────────────────────────────

function SertifikasiDocModal({
  item,
  onClose,
}: {
  item: SertifikasiItem;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 16 }}
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-3.5 h-3.5 text-emerald-500" />
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              Dokumen Sertifikasi
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-base font-black text-gray-900">{item.nama}</p>

          {item.berkas ? (
            <>
              <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-emerald-800 truncate">{item.berkas}</p>
                  <p className="text-[8px] text-emerald-500">Berkas tersedia</p>
                </div>
              </div>
              <button
                onClick={() => alert(`Download: ${item.berkas}`)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-indigo-500/20"
              >
                <Download className="w-4 h-4" />
                Download Berkas
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <FileText className="w-8 h-8 text-gray-300" />
              <p className="text-[10px] font-bold text-gray-400 text-center">
                Berkas belum tersedia
              </p>
              <p className="text-[9px] text-gray-300 text-center">
                Vendor belum mengupload dokumen ini
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── PIC Profile Card ─────────────────────────────────────────────────────────

function PICProfileCard({ pic }: { pic: PICProfile }) {
  const [showRekening, setShowRekening] = useState(false);

  const maskedRekening = pic.rekening
    ? "•••• •••• " + pic.rekening.slice(-4)
    : null;

  const rows: { icon: React.ReactNode; label: string; value: string | null }[] = [
    { icon: <Calendar className="w-3 h-3" />,    label: "TTL",         value: pic.ttl },
    { icon: <Home className="w-3 h-3" />,        label: "Domisili",    value: pic.domisili },
    { icon: <Phone className="w-3 h-3" />,       label: "No. HP",      value: pic.hp },
    { icon: <Mail className="w-3 h-3" />,        label: "Email",       value: pic.email },
  ];

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden">
      {/* Avatar + name */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-50 to-slate-50 border-b border-gray-100">
        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 border-2 border-white shadow-sm">
          <User className="w-5 h-5 text-indigo-500" />
        </div>
        <div>
          <p className="text-sm font-black text-gray-900">{pic.nama}</p>
          <p className="text-[8px] font-bold text-indigo-400 uppercase tracking-wider">Person In Charge</p>
        </div>
      </div>

      {/* Detail rows */}
      <div className="divide-y divide-gray-50">
        {rows.map(({ icon, label, value }) => (
          <div key={label} className="flex items-center gap-3 px-4 py-2.5">
            <span className="text-gray-300 flex-shrink-0">{icon}</span>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider w-16 flex-shrink-0">{label}</span>
            <span className="text-[10px] font-semibold text-gray-700 truncate">
              {value ?? <span className="text-gray-300">—</span>}
            </span>
          </div>
        ))}

        {/* No. Rekening — masked */}
        <div className="flex items-center gap-3 px-4 py-2.5">
          <span className="text-gray-300 flex-shrink-0"><CreditCard className="w-3 h-3" /></span>
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider w-16 flex-shrink-0">Rekening</span>
          <span className="text-[10px] font-semibold text-gray-700 flex-1 tabular-nums">
            {pic.rekening
              ? (showRekening ? pic.rekening.replace(/(.{4})/g, "$1 ").trim() : maskedRekening)
              : <span className="text-gray-300">—</span>
            }
          </span>
          {pic.rekening && (
            <button
              onClick={() => setShowRekening(v => !v)}
              className="flex items-center gap-1 text-[8px] font-black text-indigo-400 hover:text-indigo-600 flex-shrink-0 transition-colors"
              aria-label={showRekening ? "Sembunyikan rekening" : "Tampilkan rekening"}
            >
              {showRekening
                ? <><EyeOff className="w-3 h-3" /> Sembunyikan</>
                : <><Eye className="w-3 h-3" /> Tampilkan</>
              }
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Confirmation Modal ───────────────────────────────────────────────────────

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

// ─── Kategori Label ───────────────────────────────────────────────────────────

const kategoriLabel: Record<SBTApplication["kategori"], string> = {
  katering: "Katering",
  logistik: "Logistik",
  supplier_bahan: "Supplier Bahan",
};

const kategoriColor: Record<SBTApplication["kategori"], string> = {
  katering:        "bg-rose-50 text-rose-600 border-rose-100",
  logistik:        "bg-indigo-50 text-indigo-600 border-indigo-100",
  supplier_bahan:  "bg-emerald-50 text-emerald-600 border-emerald-100",
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PengajuanPage() {
  const router = useRouter();
  const [applications, setApplications] = useState(SBT_APPLICATIONS);
  const [expandedApp, setExpandedApp] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<SBTApplication | null>(null);
  const [newlyApproved, setNewlyApproved] = useState<string | null>(null);
  // Sertifikasi doc modal
  const [sertDocModal, setSertDocModal] = useState<SertifikasiItem | null>(null);

  const pendingCount = applications.filter(a => a.status === "menunggu").length;
  const blockedToday = HET_LOGS.length;
  const highestMarkup = Math.max(...HET_LOGS.map(l => l.markup));

  const handleReadDoc = (id: string) => {
    setApplications(prev => prev.map(a => a.id === id ? { ...a, dokumenDibaca: true } : a));
  };

  const handleApprove = (app: SBTApplication) => {
    if (!app.dokumenDibaca) handleReadDoc(app.id);
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
            <p className="text-xs text-gray-400">Daftar pengajuan penerbitan identitas digital SBT Vendor</p>
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



      <AnimatePresence mode="wait">

        {/* ─── SBT Panel ─── */}
          <motion.div key="sbt" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">

            {applications.map(app => (
              <motion.div key={app.id} layout className={`bg-white rounded-3xl border shadow-sm overflow-hidden transition-all duration-500 ${
                app.status === "disetujui" ? "opacity-50 grayscale" : ""
              } ${
                app.status === "menunggu" ? "border-indigo-100" : app.status === "disetujui" ? "border-emerald-100" : "border-red-100"
              }`}>

                {/* Card Header */}
                <button
                  onClick={() => { setExpandedApp(expandedApp === app.id ? null : app.id); handleReadDoc(app.id); }}
                  className="group w-full px-6 py-5 flex items-center justify-between gap-4 text-left hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-indigo-500 group-hover:to-cyan-500 group-hover:text-white group-active:from-indigo-600 group-active:to-cyan-600 group-hover:shadow-md group-hover:shadow-indigo-500/20 ${
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

                          {/* ── Left column: Sertifikasi + Kontak PIC + Lokasi ── */}
                          <div className="space-y-5">

                            {/* Sertifikasi */}
                            <div>
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Sertifikasi</p>
                              <div className="flex flex-wrap gap-1.5">
                                {app.sertifikasi.map(s => (
                                  <SertBadge
                                    key={s.nama}
                                    item={s}
                                    onClick={() => setSertDocModal(s)}
                                  />
                                ))}
                              </div>
                              <p className="text-[8px] text-slate-400 mt-1.5">Klik badge untuk lihat & download berkas</p>
                            </div>

                            {/* Kontak PIC */}
                            <div>
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Kontak PIC</p>
                              <PICProfileCard pic={app.pic} />
                            </div>

                            {/* Lokasi Operasional */}
                            <div>
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Lokasi Operasional</p>
                              <div className="flex items-start gap-1.5">
                                <MapPin className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-gray-600">{app.alamat}</p>
                              </div>
                            </div>
                          </div>

                          {/* ── Right column: MapLibre vendor location ── */}
                          <div className="space-y-3">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-indigo-400" /> Lokasi Vendor di Wilayah
                            </p>
                            <VendorLocationMap
                              alamat={app.alamat}
                              vendorNama={app.vendorNama}
                              lat={app.lat}
                              lng={app.lng}
                              height={260}
                            />
                          </div>
                        </div>

                        {/* Action Buttons */}
                        {app.status === "menunggu" && (
                          <div className="flex gap-3 pt-2 border-t border-gray-100 justify-end">
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
      </AnimatePresence>

      {/* Confirm SBT Modal */}
      <AnimatePresence>
        {confirmModal && (
          <ConfirmModal app={confirmModal} onClose={() => setConfirmModal(null)} onConfirm={handleConfirmSBT} />
        )}
      </AnimatePresence>

      {/* Sertifikasi Doc Modal */}
      <AnimatePresence>
        {sertDocModal && (
          <SertifikasiDocModal item={sertDocModal} onClose={() => setSertDocModal(null)} />
        )}
      </AnimatePresence>

    </div>
  );
}
