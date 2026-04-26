"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, Timer, AlertCircle, FileSearch, Route,
  Eye, Zap, TrendingDown, CheckCircle2, XCircle,
  ChevronDown, Clock, X, ArrowRight, User, Package,
  RotateCcw, BadgeCheck, Copy
} from "lucide-react";
import { ContextualMinimap, type MinimapEntity } from "@/components/goverment/ContextualMinimap";
import { VendorVerificationDropdown } from "@/components/goverment/VendorVerificationDropdown";
import { SppgReceivingDropdown } from "@/components/goverment/SppgReceivingDropdown";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────

type CaseStatus = "aktif" | "resolusi" | "selesai";
type RefundStatus = "ditinjau" | "siap_eksekusi" | "selesai";

interface ArbitraseCase {
  id: string;
  vendorNama: string;
  sekolahNama: string;
  deskripsi: string;
  dilaporkan: string;
  deadline: number; // jam tersisa
  status: CaseStatus;
  timeline: { waktu: string; aksi: string; oleh: string }[];
  vendor: { lat: number; lng: number };
  sekolah: { lat: number; lng: number };
  forHash: string;
}

interface RefundCase {
  id: string;
  vendorNama: string;
  nilaiRp: number;
  alasan: string;
  status: RefundStatus;
  reputasiPenurunan: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────

const ARBITRASE_CASES: ArbitraseCase[] = [
  {
    id: "ARB-001",
    vendorNama: "CV Food Hub Jabar",
    sekolahNama: "SDN 164 Karang Pawulang",
    deskripsi: "Pengiriman 460 porsi dilaporkan terlambat 3 jam. Sekolah menolak penandatanganan BAP.",
    dilaporkan: "13 Apr 2025, 08:42 WIB",
    deadline: 36,
    status: "aktif",
    timeline: [
      { waktu: "08:42", aksi: "Laporan diterima sistem", oleh: "Sistem" },
      { waktu: "09:15", aksi: "Notifikasi dikirim ke BGN", oleh: "Sistem" },
      { waktu: "10:00", aksi: "Vendor memberikan klarifikasi tertulis", oleh: "CV Food Hub Jabar" },
      { waktu: "11:30", aksi: "Dokumen foto pengiriman diunggah", oleh: "CV Food Hub Jabar" },
    ],
    vendor: { lat: -6.9550, lng: 107.5850 },
    sekolah: { lat: -6.9247, lng: 107.6321 },
    forHash: "a3f2b9c1d4e5...c91d",
  },
  {
    id: "ARB-002",
    vendorNama: "CV Food Hub Jabar",
    sekolahNama: "SMPN 5 Bandung",
    deskripsi: "Klaim jumlah porsi diterima berbeda dengan manifest pengiriman. Selisih 48 porsi.",
    dilaporkan: "12 Apr 2025, 14:20 WIB",
    deadline: 8,
    status: "aktif",
    timeline: [
      { waktu: "14:20", aksi: "Laporan diterima sistem", oleh: "Sistem" },
      { waktu: "15:00", aksi: "BGN mulai investigasi", oleh: "BGN" },
    ],
    vendor: { lat: -6.9550, lng: 107.5850 },
    sekolah: { lat: -6.9112, lng: 107.6125 },
    forHash: "f7a1e0b2c3d6...88fa",
  },
];

const REFUND_CASES: RefundCase[] = [
  {
    id: "REF-001",
    vendorNama: "CV Food Hub Jabar",
    nilaiRp: 4_200_000,
    alasan: "Pengiriman gagal — armada tidak tiba dalam batas waktu yang disepakati",
    status: "siap_eksekusi",
    reputasiPenurunan: 18,
  },
  {
    id: "REF-002",
    vendorNama: "CV Food Hub Jabar",
    nilaiRp: 720_000,
    alasan: "Selisih jumlah porsi — 48 porsi tidak terkonfirmasi penerimaan",
    status: "ditinjau",
    reputasiPenurunan: 5,
  },
];

// ─── Countdown ─────────────────────────────────────────────────────────────

function CountdownBar({ hoursLeft, totalHours = 48 }: { hoursLeft: number; totalHours?: number }) {
  const pct = (hoursLeft / totalHours) * 100;
  const color =
    hoursLeft <= 12
      ? "hsl(var(--status-danger))"
      : hoursLeft <= 24
      ? "hsl(var(--status-warning))"
      : "hsl(var(--role-primary))";
  const isUrgent = hoursLeft <= 12;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider">
        <span className="flex items-center gap-1 text-gray-500">
          <Timer className="w-3 h-3" /> Sisa Waktu BGN
        </span>
        <span style={{ color }} className={isUrgent ? "animate-pulse" : ""}>
          {hoursLeft}j tersisa
        </span>
      </div>
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8 }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

// ─── Refund Execution Modal ─────────────────────────────────────────────────

function RefundModal({
  refund,
  onClose,
  onExecute,
}: {
  refund: RefundCase;
  onClose: () => void;
  onExecute: (id: string, alasan: string) => void;
}) {
  const [step, setStep] = useState<"input" | "confirm">("input");
  const [alasan, setAlasan] = useState("");
  const [executing, setExecuting] = useState(false);
  const [done, setDone] = useState(false);

  const handleExecute = async () => {
    setExecuting(true);
    await new Promise(r => setTimeout(r, 1800));
    setExecuting(false);
    setDone(true);
    setTimeout(() => { onExecute(refund.id, alasan); onClose(); }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Eksekusi Refund</p>
            <h3 className="text-base font-black text-gray-900">{refund.id}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Summary */}
          <div className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">Vendor</p>
              <p className="text-sm font-black text-gray-900">{refund.vendorNama}</p>
            </div>
            <div className="w-px bg-gray-200" />
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">Nilai Refund</p>
              <p className="text-sm font-black text-red-600">
                Rp {refund.nilaiRp.toLocaleString("id-ID")}
              </p>
            </div>
          </div>

          {done ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-6 gap-3"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <p className="text-sm font-black text-gray-900">Refund Berhasil Dieksekusi</p>
              <div className="flex items-center gap-2 text-[10px] font-bold text-red-500">
                <TrendingDown className="w-3.5 h-3.5" />
                Reputasi vendor turun -{refund.reputasiPenurunan} poin
              </div>
            </motion.div>
          ) : step === "input" ? (
            <>
              <div>
                <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">
                  Alasan Eksekusi *
                </label>
                <textarea
                  value={alasan}
                  onChange={e => setAlasan(e.target.value)}
                  placeholder="Tulis alasan eksekusi refund secara ringkas..."
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-xs font-medium text-gray-700 placeholder:text-gray-300 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none"
                />
              </div>
              <button
                disabled={!alasan.trim()}
                onClick={() => setStep("confirm")}
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-gray-200 text-white text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" /> Lanjut ke Konfirmasi
              </button>
            </>
          ) : (
            <>
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl space-y-2">
                <p className="text-[10px] font-black text-red-700 uppercase tracking-wider">⚠ Konfirmasi Tindakan Ireversibel</p>
                <p className="text-xs text-red-600 font-medium">
                  Dana <strong>Rp {refund.nilaiRp.toLocaleString("id-ID")}</strong> akan dikembalikan ke kas negara. Reputasi vendor akan turun <strong>-{refund.reputasiPenurunan} poin</strong>. Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep("input")} className="flex-1 py-3 rounded-xl border border-gray-200 text-[10px] font-black text-gray-500 uppercase tracking-widest hover:bg-gray-50 transition-all">
                  Kembali
                </button>
                <button
                  onClick={handleExecute}
                  disabled={executing}
                  className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {executing ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  {executing ? "Memproses..." : "Eksekusi Refund"}
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function VerifikasiPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"arbitrase" | "refund">("arbitrase");
  const [expandedCase, setExpandedCase] = useState<string | null>(null);
  const [cases, setCases] = useState(ARBITRASE_CASES);
  const [refunds, setRefunds] = useState(REFUND_CASES);
  const [refundModal, setRefundModal] = useState<RefundCase | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const pendingCount = cases.filter(c => c.status === "aktif").length;
  const refundReady = refunds.filter(r => r.status === "siap_eksekusi").length;

  const handleCopyHash = (hash: string, id: string) => {
    navigator.clipboard.writeText(hash).catch(() => {});
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleRefundExecute = (id: string, alasan: string) => {
    setRefunds(prev => prev.map(r => r.id === id ? { ...r, status: "selesai" as RefundStatus } : r));
  };

  const getMinimapEntities = (c: ArbitraseCase): MinimapEntity[] => [
    { id: `vendor-${c.id}`, lat: c.vendor.lat, lng: c.vendor.lng, type: "vendor", label: c.vendorNama },
    { id: `school-${c.id}`, lat: c.sekolah.lat, lng: c.sekolah.lng, type: "school", label: c.sekolahNama },
    { id: `anomaly-${c.id}`, lat: (c.vendor.lat + c.sekolah.lat) / 2, lng: (c.vendor.lng + c.sekolah.lng) / 2, type: "anomaly", label: "Titik Sengketa" },
  ];

  return (
    <div className="min-h-full bg-background text-foreground">
      <div className="space-y-6 px-4 py-6 md:px-6 lg:px-8">
        <PageHeader
          title={
            <span className="inline-flex items-center gap-3">
              <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-role-primary text-white">
                <ShieldCheck className="size-5" />
              </span>
              <span>Verifikasi & Arbitrase</span>
            </span>
          }
          subtitle="Panel pengelolaan sengketa dan pengembalian kas negara."
          actions={
            <div className="flex flex-wrap items-center gap-2">
              {pendingCount > 0 ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-status-danger/25 bg-status-danger-bg px-4 py-2 text-xs font-medium uppercase tracking-wide text-status-danger">
                  <span className="size-2 rounded-full bg-status-danger" aria-hidden />
                  {pendingCount} sengketa aktif
                </span>
              ) : null}
              {refundReady > 0 ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-status-warning/25 bg-status-warning-bg px-4 py-2 text-xs font-medium uppercase tracking-wide text-status-warning">
                  <Zap className="size-4" aria-hidden />
                  {refundReady} siap dieksekusi
                </span>
              ) : null}
            </div>
          }
        />

      <VendorVerificationDropdown />
      <SppgReceivingDropdown />

      <div className="w-fit rounded-full border border-border bg-surface p-1 shadow-[var(--shadow-card)]">
        {([
          { key: "arbitrase", label: "Panel Arbitrase BGN", icon: ShieldCheck, badge: pendingCount },
          { key: "refund", label: "Kendali Refund", icon: RotateCcw, badge: refundReady },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab.key
                ? "bg-surface-raised text-foreground"
                : "text-muted-foreground hover:bg-surface-raised/70 hover:text-foreground"
            )}
          >
            <tab.icon className="size-4" />
            <span>{tab.label}</span>
            {tab.badge > 0 && (
              <span className="inline-flex size-5 items-center justify-center rounded-full bg-status-danger text-xs font-semibold text-white">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ─── Arbitrase Panel ─── */}
      <AnimatePresence mode="wait">
        {activeTab === "arbitrase" && (
          <motion.div
            key="arbitrase"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {cases.length === 0 ? (
              <div className="flex flex-col items-center py-24 bg-white rounded-3xl border border-gray-100">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-8 h-8 text-emerald-500" />
                </div>
                <p className="text-base font-black text-gray-800">Tidak ada sengketa aktif</p>
                <p className="text-xs text-gray-400 mt-1">Semua kasus telah diselesaikan</p>
              </div>
            ) : (
              cases.map(c => (
                <motion.div
                  key={c.id}
                  layout
                  className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  {/* Case Header */}
                  <button
                    onClick={() => setExpandedCase(expandedCase === c.id ? null : c.id)}
                    className="w-full px-6 py-5 flex items-start justify-between gap-4 text-left hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white flex-shrink-0 ${
                        c.deadline <= 12 ? "bg-red-500" : c.deadline <= 24 ? "bg-amber-500" : "bg-indigo-500"
                      }`}>
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{c.id}</span>
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${
                            c.status === "aktif" ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"
                          }`}>
                            {c.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-gray-900">{c.vendorNama}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{c.deskripsi}</p>
                        <p className="text-[9px] text-gray-400 mt-1">Dilaporkan: {c.dilaporkan}</p>
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform mt-1 ${expandedCase === c.id ? "rotate-180" : ""}`} />
                  </button>

                  {/* Countdown */}
                  <div className="px-6 pb-4">
                    <CountdownBar hoursLeft={c.deadline} />
                  </div>

                  {/* Expanded Detail */}
                  <AnimatePresence>
                    {expandedCase === c.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-gray-100"
                      >
                        <div className="p-6 space-y-5">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            {/* Timeline */}
                            <div>
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">
                                Timeline Aktivitas
                              </p>
                              <div className="space-y-2">
                                {c.timeline.map((t, i) => (
                                  <div key={i} className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center">
                                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-gray-700">{t.aksi}</p>
                                      <p className="text-[9px] text-gray-400">{t.waktu} WIB — {t.oleh}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Forensik + Minimap */}
                            <div className="space-y-4">
                              {/* Forensik Hash */}
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <FileSearch className="w-3.5 h-3.5 text-indigo-500" />
                                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                    Hash Forensik
                                  </p>
                                  <button
                                    onClick={() => router.push("/goverment/riwayat")}
                                    className="text-[8px] font-black text-indigo-500 hover:text-indigo-700 uppercase tracking-wider"
                                  >
                                    Lihat Riwayat →
                                  </button>
                                </div>
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 font-mono">
                                  <span className="flex-1 text-[10px] text-gray-700">{c.forHash}</span>
                                  <button
                                    onClick={() => handleCopyHash(c.forHash, c.id)}
                                    className="flex items-center gap-1 text-[8px] font-black text-gray-400 hover:text-indigo-600 transition-colors"
                                  >
                                    <Copy className="w-3 h-3" />
                                    {copiedHash === c.id ? "Disalin!" : "Salin"}
                                  </button>
                                </div>
                              </div>

                              {/* Route Minimap */}
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Route className="w-3.5 h-3.5 text-indigo-500" />
                                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                    Rute Pengiriman Sengketa
                                  </p>
                                </div>
                                <div className="relative">
                                  <ContextualMinimap
                                    entities={getMinimapEntities(c)}
                                    navigateTo="/goverment/pengawasan"
                                    navigateParams={{ case: c.id }}
                                    label={`Rute ${c.id}`}
                                    tooltipText="Klik untuk investigasi rute pengiriman di peta"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-3 pt-2 border-t border-gray-100">
                            <button
                              onClick={() => setCases(prev => prev.map(x => x.id === c.id ? { ...x, status: "resolusi" } : x))}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 text-[10px] font-black uppercase tracking-wider hover:border-gray-300 hover:bg-gray-50 transition-all"
                            >
                              <Eye className="w-3.5 h-3.5" /> Tinjau Dokumen
                            </button>
                            <button
                              onClick={() => setCases(prev => prev.map(x => x.id === c.id ? { ...x, status: "selesai" } : x))}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider transition-all shadow-md shadow-emerald-500/20"
                            >
                              <BadgeCheck className="w-4 h-4" /> Resolusi Selesai
                            </button>
                            <button
                              onClick={() => {
                                const refund = refunds.find(r => r.vendorNama === c.vendorNama && r.status === "siap_eksekusi");
                                if (refund) setRefundModal(refund);
                                else setActiveTab("refund");
                              }}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-wider transition-all shadow-md shadow-red-500/20"
                            >
                              <Zap className="w-4 h-4" /> Proses Refund
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {/* ─── Refund Panel ─── */}
        {activeTab === "refund" && (
          <motion.div
            key="refund"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Summary Bar */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Total Nilai Refund", value: `Rp ${refunds.reduce((a, r) => a + r.nilaiRp, 0).toLocaleString("id-ID")}`, color: "text-red-600" },
                { label: "Siap Dieksekusi", value: String(refunds.filter(r => r.status === "siap_eksekusi").length), color: "text-amber-600" },
                { label: "Selesai Hari Ini", value: String(refunds.filter(r => r.status === "selesai").length), color: "text-emerald-600" },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl border border-gray-100 px-5 py-4">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
                  <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Refund Cards */}
            {["siap_eksekusi", "ditinjau", "selesai"].map(statusGroup => {
              const groupRefunds = refunds.filter(r => r.status === statusGroup);
              if (groupRefunds.length === 0) return null;
              return (
                <div key={statusGroup}>
                  <div className="flex items-center gap-2 mb-3">
                    {statusGroup === "siap_eksekusi" && <Zap className="w-4 h-4 text-amber-500" />}
                    {statusGroup === "ditinjau" && <Eye className="w-4 h-4 text-blue-500" />}
                    {statusGroup === "selesai" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      {{ siap_eksekusi: "Siap Dieksekusi", ditinjau: "Sedang Ditinjau", selesai: "Selesai" }[statusGroup]}
                    </p>
                  </div>
                  <div className="space-y-3">
                    {groupRefunds.map(refund => (
                      <div
                        key={refund.id}
                        className={`bg-white rounded-2xl border shadow-sm p-5 flex items-start justify-between gap-4 ${
                          refund.status === "siap_eksekusi" ? "border-amber-200" : "border-gray-100"
                        }`}
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{refund.id}</span>
                          </div>
                          <p className="text-sm font-black text-gray-900">{refund.vendorNama}</p>
                          <p className="text-xs text-gray-500">{refund.alasan}</p>
                          <div className="flex items-center gap-3">
                            <span className="text-base font-black text-red-600">
                              Rp {refund.nilaiRp.toLocaleString("id-ID")}
                            </span>
                            <span className="flex items-center gap-1 text-[9px] font-bold text-red-400">
                              <TrendingDown className="w-3 h-3" />
                              -{refund.reputasiPenurunan} poin reputasi
                            </span>
                          </div>
                        </div>

                        {refund.status === "siap_eksekusi" && (
                          <button
                            onClick={() => setRefundModal(refund)}
                            className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-red-500/20"
                          >
                            <Zap className="w-4 h-4" /> Eksekusi
                          </button>
                        )}
                        {refund.status === "selesai" && (
                          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-600 text-[9px] font-black">
                            <CheckCircle2 className="w-4 h-4" /> Selesai
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Refund Modal */}
      <AnimatePresence>
        {refundModal && (
          <RefundModal
            refund={refundModal}
            onClose={() => setRefundModal(null)}
            onExecute={handleRefundExecute}
          />
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
