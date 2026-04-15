"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, CheckCircle2, RotateCcw, BadgeCheck,
  ChevronDown, Clock, ArrowLeft, TrendingDown, FileSearch,
  Copy, Route, Zap, Package, User,
} from "lucide-react";
import { ContextualMinimap, type MinimapEntity } from "@/components/goverment/ContextualMinimap";

// ─── Types ─────────────────────────────────────────────────────────────────

type CaseStatus = "aktif" | "resolusi" | "selesai";
type RefundStatus = "ditinjau" | "siap_eksekusi" | "selesai";

interface CompletedArbitraseCase {
  id: string;
  vendorNama: string;
  sekolahNama: string;
  deskripsi: string;
  dilaporkan: string;
  diselesaikan: string;
  status: CaseStatus;
  resolusi: string;
  timeline: { waktu: string; aksi: string; oleh: string }[];
  vendor: { lat: number; lng: number };
  sekolah: { lat: number; lng: number };
  forHash: string;
}

interface CompletedRefundCase {
  id: string;
  vendorNama: string;
  nilaiRp: number;
  alasan: string;
  status: RefundStatus;
  reputasiPenurunan: number;
  tanggalEksekusi: string;
  dieksekusiOleh: string;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────

const COMPLETED_ARBITRASE: CompletedArbitraseCase[] = [
  {
    id: "ARB-098",
    vendorNama: "PT Nusantara Gizi",
    sekolahNama: "SDN 45 Sukajadi",
    deskripsi: "Klaim kualitas makanan tidak sesuai standar nutrisi MBG. Sekolah menolak penerimaan 320 porsi.",
    dilaporkan: "5 Apr 2025, 09:15 WIB",
    diselesaikan: "7 Apr 2025, 14:30 WIB",
    status: "selesai",
    resolusi: "Vendor diwajibkan mengganti 320 porsi dengan kualitas terverifikasi dalam 24 jam. Reputasi vendor -12 poin.",
    timeline: [
      { waktu: "09:15", aksi: "Laporan diterima sistem", oleh: "Sistem" },
      { waktu: "10:00", aksi: "BGN memulai investigasi", oleh: "BGN" },
      { waktu: "13:00", aksi: "Vendor memberikan klarifikasi dan dokumentasi", oleh: "PT Nusantara Gizi" },
      { waktu: "15:30", aksi: "Tim BGN validasi kualitas di lapangan", oleh: "BGN" },
      { waktu: "7 Apr 14:30", aksi: "Sengketa diselesaikan — penggantian porsi dikonfirmasi", oleh: "BGN" },
    ],
    vendor: { lat: -6.9100, lng: 107.5600 },
    sekolah: { lat: -6.8900, lng: 107.5750 },
    forHash: "b2d4f6a8c0e2...f912",
  },
  {
    id: "ARB-095",
    vendorNama: "CV Sahara Katering",
    sekolahNama: "SMAN 12 Bandung",
    deskripsi: "Keterlambatan pengiriman 2.5 jam — armada mengalami kerusakan mesin di perjalanan.",
    dilaporkan: "2 Apr 2025, 07:45 WIB",
    diselesaikan: "2 Apr 2025, 18:20 WIB",
    status: "selesai",
    resolusi: "Force majeure diterima. Vendor diberikan peringatan pertama. Tidak ada refund.",
    timeline: [
      { waktu: "07:45", aksi: "Laporan keterlambatan diterima", oleh: "SDN 12 Bandung" },
      { waktu: "08:30", aksi: "Vendor melaporkan kerusakan armada", oleh: "CV Sahara Katering" },
      { waktu: "10:00", aksi: "Bukti kerusakan dan dokumentasi dikirim", oleh: "CV Sahara Katering" },
      { waktu: "18:20", aksi: "Kasus ditutup — force majeure terverifikasi", oleh: "BGN" },
    ],
    vendor: { lat: -6.9300, lng: 107.6100 },
    sekolah: { lat: -6.9050, lng: 107.6200 },
    forHash: "e1c3a5b7d9f0...2c4e",
  },
  {
    id: "ARB-091",
    vendorNama: "UD Mitra Pangan Sejahtera",
    sekolahNama: "SMPN 22 Bandung",
    deskripsi: "Selisih 65 porsi antara manifest pengiriman dan penerimaan aktual sekolah.",
    dilaporkan: "28 Mar 2025, 11:00 WIB",
    diselesaikan: "30 Mar 2025, 09:45 WIB",
    status: "selesai",
    resolusi: "Refund Rp 975.000 dieksekusi. Reputasi vendor -8 poin. Audit bulanan dijadwalkan.",
    timeline: [
      { waktu: "11:00", aksi: "Laporan selisih porsi diterima", oleh: "SMPN 22 Bandung" },
      { waktu: "12:30", aksi: "BGN meminta rekonsiliasi data manifest", oleh: "BGN" },
      { waktu: "29 Mar 09:00", aksi: "Audit dokumen pengiriman selesai", oleh: "BGN" },
      { waktu: "30 Mar 09:45", aksi: "Refund dieksekusi — kasus ditutup", oleh: "BGN" },
    ],
    vendor: { lat: -6.9480, lng: 107.5720 },
    sekolah: { lat: -6.9380, lng: 107.5900 },
    forHash: "c9d1e3f5a7b8...4d6c",
  },
];

const COMPLETED_REFUNDS: CompletedRefundCase[] = [
  {
    id: "REF-089",
    vendorNama: "UD Mitra Pangan Sejahtera",
    nilaiRp: 975_000,
    alasan: "Selisih 65 porsi tidak terkonfirmasi penerimaan — ARB-091",
    status: "selesai",
    reputasiPenurunan: 8,
    tanggalEksekusi: "30 Mar 2025, 09:45 WIB",
    dieksekusiOleh: "Admin BGN - Bandung",
  },
  {
    id: "REF-085",
    vendorNama: "CV Andhika Food",
    nilaiRp: 2_100_000,
    alasan: "Pengiriman gagal total — tidak ada armada yang tiba pada hari H",
    status: "selesai",
    reputasiPenurunan: 25,
    tanggalEksekusi: "25 Mar 2025, 16:00 WIB",
    dieksekusiOleh: "Admin BGN - Bandung",
  },
  {
    id: "REF-081",
    vendorNama: "PT Maju Bersama Katering",
    nilaiRp: 540_000,
    alasan: "Kualitas makanan tidak memenuhi standar gizi MBG — dikembalikan sekolah",
    status: "selesai",
    reputasiPenurunan: 6,
    tanggalEksekusi: "18 Mar 2025, 11:30 WIB",
    dieksekusiOleh: "Admin BGN - Bandung",
  },
];

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function VerifikasiSelesaiPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"arbitrase" | "refund">("arbitrase");
  const [expandedCase, setExpandedCase] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleCopyHash = (hash: string, id: string) => {
    navigator.clipboard.writeText(hash).catch(() => {});
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const getMinimapEntities = (c: CompletedArbitraseCase): MinimapEntity[] => [
    { id: `vendor-${c.id}`, lat: c.vendor.lat, lng: c.vendor.lng, type: "vendor", label: c.vendorNama },
    { id: `school-${c.id}`, lat: c.sekolah.lat, lng: c.sekolah.lng, type: "school", label: c.sekolahNama },
    { id: `anomaly-${c.id}`, lat: (c.vendor.lat + c.sekolah.lat) / 2, lng: (c.vendor.lng + c.sekolah.lng) / 2, type: "anomaly", label: "Titik Sengketa" },
  ];

  const totalRefundValue = COMPLETED_REFUNDS.reduce((a, r) => a + r.nilaiRp, 0);

  return (
    <div className="p-6 space-y-5 min-h-full bg-slate-50/50">

      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/goverment/verifikasi")}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-all text-gray-500"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600">
            <BadgeCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Sudah Diverifikasi</h1>
            <p className="text-xs text-gray-400">Arsip kasus sengketa dan refund yang telah diselesaikan</p>
          </div>
        </div>

        {/* Stats badges */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wider">{COMPLETED_ARBITRASE.length} Kasus Selesai</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full">
            <RotateCcw className="w-3 h-3 text-blue-600" />
            <span className="text-[9px] font-black text-blue-600 uppercase tracking-wider">Rp {totalRefundValue.toLocaleString("id-ID")} Dikembalikan</span>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Kasus Diselesaikan", value: String(COMPLETED_ARBITRASE.length), color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Total Refund Dieksekusi", value: `Rp ${totalRefundValue.toLocaleString("id-ID")}`, color: "text-red-600", bg: "bg-red-50" },
          { label: "Refund Berhasil", value: String(COMPLETED_REFUNDS.length), color: "text-blue-600", bg: "bg-blue-50" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl border border-gray-100 px-5 py-4`}>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-2xl w-fit">
        {([
          { key: "arbitrase", label: "Arsip Arbitrase", icon: ShieldCheck, count: COMPLETED_ARBITRASE.length },
          { key: "refund", label: "Arsip Refund", icon: RotateCcw, count: COMPLETED_REFUNDS.length },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`relative flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
              activeTab === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
            <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[8px] flex items-center justify-center">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ─── Arbitrase Archive ─── */}
      <AnimatePresence mode="wait">
        {activeTab === "arbitrase" && (
          <motion.div
            key="arbitrase"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {COMPLETED_ARBITRASE.map(c => (
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
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white flex-shrink-0 bg-emerald-500">
                      <BadgeCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{c.id}</span>
                        <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600">
                          SELESAI
                        </span>
                      </div>
                      <p className="text-sm font-bold text-gray-900">{c.vendorNama}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{c.deskripsi}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-[9px] text-gray-400">Dilaporkan: {c.dilaporkan}</p>
                        <span className="text-[9px] text-gray-300">•</span>
                        <p className="text-[9px] text-emerald-500 font-bold">Selesai: {c.diselesaikan}</p>
                      </div>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform mt-1 ${expandedCase === c.id ? "rotate-180" : ""}`} />
                </button>

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

                        {/* Resolusi */}
                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3">
                          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Keputusan Resolusi</p>
                            <p className="text-xs text-emerald-800 font-medium">{c.resolusi}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                          {/* Timeline */}
                          <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">
                              Timeline Aktivitas
                            </p>
                            <div className="space-y-2">
                              {c.timeline.map((t, i) => (
                                <div key={i} className="flex items-start gap-3">
                                  <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
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
                                <FileSearch className="w-3.5 h-3.5 text-emerald-500" />
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                  Hash Forensik
                                </p>
                              </div>
                              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 font-mono">
                                <span className="flex-1 text-[10px] text-gray-700">{c.forHash}</span>
                                <button
                                  onClick={() => handleCopyHash(c.forHash, c.id)}
                                  className="flex items-center gap-1 text-[8px] font-black text-gray-400 hover:text-emerald-600 transition-colors"
                                >
                                  <Copy className="w-3 h-3" />
                                  {copiedHash === c.id ? "Disalin!" : "Salin"}
                                </button>
                              </div>
                            </div>

                            {/* Route Minimap */}
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Route className="w-3.5 h-3.5 text-emerald-500" />
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                  Rute Pengiriman
                                </p>
                              </div>
                              <ContextualMinimap
                                entities={getMinimapEntities(c)}
                                navigateTo="/goverment/pengawasan"
                                navigateParams={{ case: c.id }}
                                label={`Rute ${c.id}`}
                                tooltipText="Klik untuk melihat rute pengiriman di peta"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ─── Refund Archive ─── */}
        {activeTab === "refund" && (
          <motion.div
            key="refund"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            {COMPLETED_REFUNDS.map(refund => (
              <div
                key={refund.id}
                className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-5 flex items-start justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{refund.id}</span>
                    <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600">SELESAI</span>
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
                  <div className="flex items-center gap-3 pt-1 border-t border-gray-50">
                    <p className="text-[9px] text-gray-400">Dieksekusi: <span className="font-bold text-gray-500">{refund.tanggalEksekusi}</span></p>
                    <span className="text-[9px] text-gray-300">•</span>
                    <p className="text-[9px] text-gray-400">Oleh: <span className="font-bold text-gray-500">{refund.dieksekusiOleh}</span></p>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-600 text-[9px] font-black flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                  Selesai
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
