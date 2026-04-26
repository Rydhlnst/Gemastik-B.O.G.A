"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  History, Search, Lock, ShieldCheck, Copy, Filter,
  PlayCircle, ChevronDown, XCircle, CheckCircle2,
  FileText, Camera, FileSignature, Banknote, ExternalLink,
  Hash, Clock
} from "lucide-react";
import { SimplePagination } from "@/components/ui/SimplePagination";
import { ContextualMinimap, type MinimapEntity } from "@/components/goverment/ContextualMinimap";

// ─── Types ──────────────────────────────────────────────────────────────────

type BAPStatus = "terverifikasi" | "pending" | "dispute";
type DocType = "foto_pengiriman" | "bap" | "kontrak";
type MidtransStatus = "berhasil" | "gagal" | "pending";

interface BAPRecord {
  id: string;
  tanggal: string;
  vendorNama: string;
  sekolahNama: string;
  pihakTerlibat: string;
  status: BAPStatus;
  txHash: string;
  tandaTangan: string;
  timestamp: string;
  nilaiRp: number;
  route: { vendorLat: number; vendorLng: number; sekolahLat: number; sekolahLng: number };
}

interface ForensikDoc {
  id: string;
  nama: string;
  tipe: DocType;
  hash: string;
  ukuran: string;
  tanggal: string;
  bapId: string;
}

interface MidtransLog {
  id: string;
  tanggal: string;
  vendor: string;
  nominal: number;
  status: MidtransStatus;
  txId: string;
  timestamp: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────

const BAP_RECORDS: BAPRecord[] = [
  {
    id: "BAP-2025-0413-001",
    tanggal: "13 Apr 2025",
    vendorNama: "CV Katering Bandung Juara",
    sekolahNama: "SMAN 3 Bandung",
    pihakTerlibat: "CV Katering Bandung Juara · SMAN 3 Bandung · BGN",
    status: "terverifikasi",
    txHash: "0x7f3a9b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0",
    tandaTangan: "0x4c8f...a91e",
    timestamp: "13 Apr 2025 · 06:45:32 WIB",
    nilaiRp: 10_200_000,
    route: { vendorLat: -6.8850, vendorLng: 107.6130, sekolahLat: -6.9135, sekolahLng: 107.6186 },
  },
  {
    id: "BAP-2025-0413-002",
    tanggal: "13 Apr 2025",
    vendorNama: "Katering Pasundan Berkah",
    sekolahNama: "SMPN 2 Bandung",
    pihakTerlibat: "Katering Pasundan Berkah · SMPN 2 Bandung · BGN",
    status: "terverifikasi",
    txHash: "0xa1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456",
    tandaTangan: "0x9d2a...b33f",
    timestamp: "13 Apr 2025 · 06:55:12 WIB",
    nilaiRp: 4_800_000,
    route: { vendorLat: -6.9380, vendorLng: 107.6250, sekolahLat: -6.9104, sekolahLng: 107.6141 },
  },
  {
    id: "BAP-2025-0412-001",
    tanggal: "12 Apr 2025",
    vendorNama: "CV Food Hub Jabar",
    sekolahNama: "SDN 164 Karang Pawulang",
    pihakTerlibat: "CV Food Hub Jabar · SDN 164 · BGN",
    status: "dispute",
    txHash: "0xb9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9",
    tandaTangan: "0x7b1c...e44a",
    timestamp: "12 Apr 2025 · 08:22:41 WIB",
    nilaiRp: 6_900_000,
    route: { vendorLat: -6.9550, vendorLng: 107.5850, sekolahLat: -6.9247, sekolahLng: 107.6321 },
  },
  {
    id: "BAP-2025-0411-001",
    tanggal: "11 Apr 2025",
    vendorNama: "PT Gizi Priangan Utama",
    sekolahNama: "SMPN 5 Bandung",
    pihakTerlibat: "PT Gizi Priangan Utama · SMPN 5 Bandung · BGN",
    status: "terverifikasi",
    txHash: "0xc0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0",
    tandaTangan: "0x2e4b...f78c",
    timestamp: "11 Apr 2025 · 07:10:05 WIB",
    nilaiRp: 4_350_000,
    route: { vendorLat: -6.9450, vendorLng: 107.6320, sekolahLat: -6.9112, sekolahLng: 107.6125 },
  },
  {
    id: "BAP-2025-0410-001",
    tanggal: "10 Apr 2025",
    vendorNama: "CV Katering Bandung Juara",
    sekolahNama: "SDN 061 Cirengel",
    pihakTerlibat: "CV Katering Bandung Juara · SDN 061 Cirengel · BGN",
    status: "terverifikasi",
    txHash: "0xd1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1",
    tandaTangan: "0x5f3d...c12b",
    timestamp: "10 Apr 2025 · 06:38:50 WIB",
    nilaiRp: 6_150_000,
    route: { vendorLat: -6.8850, vendorLng: 107.6130, sekolahLat: -6.9015, sekolahLng: 107.6112 },
  },
  {
    id: "BAP-2025-0409-001",
    tanggal: "09 Apr 2025",
    vendorNama: "Katering Pasundan Berkah",
    sekolahNama: "SMAN 20 Bandung",
    pihakTerlibat: "Katering Pasundan Berkah · SMAN 20 Bandung · BGN",
    status: "terverifikasi",
    txHash: "0xe2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2",
    tandaTangan: "0x8a1e...d90f",
    timestamp: "09 Apr 2025 · 06:50:22 WIB",
    nilaiRp: 12_300_000,
    route: { vendorLat: -6.9380, vendorLng: 107.6250, sekolahLat: -6.9078, sekolahLng: 107.6212 },
  },
];

const FORENSIK_DOCS: ForensikDoc[] = [
  { id: "DOC-001", nama: "Foto Pengiriman SMAN 3 Bandung", tipe: "foto_pengiriman", hash: "a3f2b9c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1", ukuran: "2.4 MB", tanggal: "13 Apr 2025", bapId: "BAP-2025-0413-001" },
  { id: "DOC-002", nama: "BAP Pengiriman Apr 13 – SMAN 3", tipe: "bap", hash: "b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5", ukuran: "145 KB", tanggal: "13 Apr 2025", bapId: "BAP-2025-0413-001" },
  { id: "DOC-003", nama: "Kontrak Vendor – CV Katering BDJ", tipe: "kontrak", hash: "c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6", ukuran: "380 KB", tanggal: "01 Feb 2025", bapId: "BAP-2025-0413-001" },
  { id: "DOC-004", nama: "Foto Pengiriman SMPN 2 Bandung", tipe: "foto_pengiriman", hash: "d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7", ukuran: "1.8 MB", tanggal: "13 Apr 2025", bapId: "BAP-2025-0413-002" },
  { id: "DOC-005", nama: "Foto Pengiriman SDN 164 – Sengketa", tipe: "foto_pengiriman", hash: "e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8", ukuran: "3.1 MB", tanggal: "12 Apr 2025", bapId: "BAP-2025-0412-001" },
  { id: "DOC-006", nama: "BAP Sengketa – SDN 164", tipe: "bap", hash: "f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9", ukuran: "210 KB", tanggal: "12 Apr 2025", bapId: "BAP-2025-0412-001" },
];

const MIDTRANS_LOGS: MidtransLog[] = [
  { id: "MDT-001", tanggal: "13 Apr 2025", vendor: "CV Katering Bandung Juara", nominal: 10_200_000, status: "berhasil", txId: "TXN-BDG-0413-9928", timestamp: "13 Apr 2025 · 14:00:05 WIB" },
  { id: "MDT-002", tanggal: "13 Apr 2025", vendor: "Katering Pasundan Berkah", nominal: 4_800_000, status: "berhasil", txId: "TXN-BDG-0413-9929", timestamp: "13 Apr 2025 · 14:00:08 WIB" },
  { id: "MDT-003", tanggal: "12 Apr 2025", vendor: "CV Food Hub Jabar", nominal: 6_900_000, status: "gagal", txId: "TXN-BDG-0412-9901", timestamp: "12 Apr 2025 · 14:00:45 WIB" },
  { id: "MDT-004", tanggal: "11 Apr 2025", vendor: "PT Gizi Priangan Utama", nominal: 4_350_000, status: "berhasil", txId: "TXN-BDG-0411-9870", timestamp: "11 Apr 2025 · 14:01:12 WIB" },
  { id: "MDT-005", tanggal: "10 Apr 2025", vendor: "CV Katering Bandung Juara", nominal: 6_150_000, status: "berhasil", txId: "TXN-BDG-0410-9841", timestamp: "10 Apr 2025 · 14:00:30 WIB" },
  { id: "MDT-006", tanggal: "09 Apr 2025", vendor: "Katering Pasundan Berkah", nominal: 12_300_000, status: "pending", txId: "TXN-BDG-0409-9810", timestamp: "09 Apr 2025 · 14:00:55 WIB" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────

const truncateHash = (h: string) => `${h.slice(0, 6)}...${h.slice(-4)}`;

const docTypeIcon: Record<DocType, React.ReactNode> = {
  foto_pengiriman: <Camera className="w-4 h-4" />,
  bap: <FileSignature className="w-4 h-4" />,
  kontrak: <FileText className="w-4 h-4" />,
};

const docTypeLabel: Record<DocType, string> = {
  foto_pengiriman: "Foto Pengiriman",
  bap: "BAP",
  kontrak: "Kontrak",
};

const ITEMS_PER_PAGE = 4;

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function RiwayatPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"bap" | "forensik" | "midtrans">("bap");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedBap, setExpandedBap] = useState<string | null>(null);
  const [docFilter, setDocFilter] = useState<DocType | "semua">("semua");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [verifiedId, setVerifiedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [midtransDetail, setMidtransDetail] = useState<MidtransLog | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleVerifyHash = (id: string) => {
    setVerifiedId(id);
    setTimeout(() => setVerifiedId(null), 3000);
  };

  const filteredBAP = useMemo(() =>
    BAP_RECORDS.filter(b =>
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.vendorNama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.sekolahNama.toLowerCase().includes(searchQuery.toLowerCase())
    ), [searchQuery]);

  const paginatedBAP = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBAP.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBAP, currentPage]);

  const filteredDocs = useMemo(() =>
    FORENSIK_DOCS.filter(d => docFilter === "semua" || d.tipe === docFilter),
    [docFilter]);

  const midtransTotal = MIDTRANS_LOGS.reduce((a, l) => a + (l.status === "berhasil" ? l.nominal : 0), 0);
  const midtransBerhasil = MIDTRANS_LOGS.filter(l => l.status === "berhasil").length;
  const midtransGagal = MIDTRANS_LOGS.filter(l => l.status === "gagal").length;

  const getBapMinimap = (bap: BAPRecord): MinimapEntity[] => [
    { id: `v-${bap.id}`, lat: bap.route.vendorLat, lng: bap.route.vendorLng, type: "vendor", label: bap.vendorNama },
    { id: `s-${bap.id}`, lat: bap.route.sekolahLat, lng: bap.route.sekolahLng, type: "school", label: bap.sekolahNama },
  ];

  return (
    <div className="p-6 space-y-5 min-h-full bg-slate-50/50">

      {/* Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600">
          <History className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Riwayat & Forensik</h1>
          <p className="text-xs text-gray-400">Block explorer, lacak bukti kriptografis, dan log pencairan dana</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-2xl w-fit">
        {([
          { key: "bap", label: "BOGA Block Explorer", icon: Hash },
          { key: "forensik", label: "Bukti Forensik", icon: ShieldCheck },
          { key: "midtrans", label: "Log Midtrans", icon: Banknote },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setCurrentPage(1); }}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
              activeTab === tab.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── BAP Block Explorer ── */}
        {activeTab === "bap" && (
          <motion.div key="bap" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Cari ID BAP, nama vendor atau SPPG..."
                className="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-11 pr-4 text-xs font-medium text-gray-700 placeholder:text-gray-300 focus:ring-2 focus:ring-emerald-500/20 outline-none shadow-sm"
              />
            </div>

            {/* BAP List */}
            <div className="space-y-3">
              {paginatedBAP.map(bap => (
                <motion.div key={bap.id} layout className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <button
                    onClick={() => setExpandedBap(expandedBap === bap.id ? null : bap.id)}
                    className="w-full px-6 py-4 flex items-center gap-4 text-left hover:bg-gray-50/50 transition-colors"
                  >
                    {/* Status Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center ${
                      bap.status === "terverifikasi" ? "bg-emerald-50 text-emerald-600" :
                      bap.status === "dispute" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                    }`}>
                      {bap.status === "terverifikasi" ? <Lock className="w-5 h-5" /> :
                       bap.status === "dispute" ? <XCircle className="w-5 h-5" /> :
                       <Clock className="w-5 h-5" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{bap.id}</span>
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${
                          bap.status === "terverifikasi" ? "bg-emerald-100 text-emerald-700" :
                          bap.status === "dispute" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {bap.status === "terverifikasi" ? "✓ On-Chain" : bap.status === "dispute" ? "Sengketa" : "Pending"}
                        </span>
                      </div>
                      <p className="text-sm font-black text-gray-900 truncate">{bap.vendorNama}</p>
                      <p className="text-[10px] text-gray-400 truncate">{bap.pihakTerlibat}</p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-black text-gray-900 tabular-nums">
                        Rp {bap.nilaiRp.toLocaleString("id-ID")}
                      </p>
                      <p className="text-[9px] text-gray-400">{bap.tanggal}</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${expandedBap === bap.id ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {expandedBap === bap.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-gray-100"
                      >
                        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Hash Info */}
                          <div className="space-y-4">
                            <div>
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                <Hash className="w-3 h-3" /> Hash Transaksi On-Chain
                              </p>
                              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 font-mono">
                                <span className="flex-1 text-[9px] text-gray-600 truncate">{truncateHash(bap.txHash)}</span>
                                <button
                                  onClick={() => handleCopy(bap.txHash, `hash-${bap.id}`)}
                                  className="flex items-center gap-1 text-[8px] font-black text-gray-400 hover:text-emerald-600 transition-colors flex-shrink-0"
                                >
                                  <Copy className="w-3 h-3" />
                                  {copiedId === `hash-${bap.id}` ? "✓ Disalin" : "Salin"}
                                </button>
                              </div>
                            </div>
                            <div>
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                Tanda Tangan Kriptografis
                              </p>
                              <p className="font-mono text-[10px] text-gray-600 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                {bap.tandaTangan}
                              </p>
                            </div>
                            <div>
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Timestamp</p>
                              <p className="text-xs font-bold text-gray-700">{bap.timestamp}</p>
                            </div>
                            {bap.status === "terverifikasi" && (
                              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-700 text-[10px] font-black">
                                <Lock className="w-3.5 h-3.5" />
                                Terverifikasi On-Chain — Data tidak dapat dimanipulasi
                              </div>
                            )}
                          </div>

                          {/* Route Minimap + Actions */}
                          <div className="space-y-4">
                            <div>
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                Rute Pengiriman
                              </p>
                              <ContextualMinimap
                                entities={getBapMinimap(bap)}
                                navigateTo="/goverment/pengawasan"
                                navigateParams={{ replay: bap.id, tanggal: bap.tanggal }}
                                label={`Rute ${bap.id}`}
                              />
                            </div>
                            <button
                              onClick={() => router.push(`/goverment/pengawasan?replay=${bap.id}`)}
                              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                              <PlayCircle className="w-4 h-4" />
                              Putar Ulang Rute Supir
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-center">
              <SimplePagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredBAP.length / ITEMS_PER_PAGE)}
                onPageChange={setCurrentPage}
              />
            </div>
          </motion.div>
        )}

        {/* ── Forensik ── */}
        {activeTab === "forensik" && (
          <motion.div key="forensik" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl">
                {([
                  { key: "semua", label: "Semua" },
                  { key: "foto_pengiriman", label: "Foto" },
                  { key: "bap", label: "BAP" },
                  { key: "kontrak", label: "Kontrak" },
                ] as const).map(f => (
                  <button
                    key={f.key}
                    onClick={() => setDocFilter(f.key)}
                    className={`px-4 py-1.5 text-[9px] font-black rounded-lg transition-all ${
                      docFilter === f.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <p className="text-sm font-black text-gray-900">Dokumen Terverifikasi</p>
                <p className="text-[9px] font-bold text-gray-400">{filteredDocs.length} dokumen</p>
              </div>
              <div className="divide-y divide-gray-50">
                {filteredDocs.map(doc => (
                  <div key={doc.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                    {/* Doc icon */}
                    <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${
                      doc.tipe === "foto_pengiriman" ? "bg-blue-50 text-blue-600" :
                      doc.tipe === "bap" ? "bg-violet-50 text-violet-600" : "bg-amber-50 text-amber-600"
                    }`}>
                      {docTypeIcon[doc.tipe]}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-gray-900 truncate">{doc.nama}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[8px] font-black text-gray-400 uppercase">{docTypeLabel[doc.tipe]}</span>
                        <span className="text-[8px] text-gray-300">·</span>
                        <span className="text-[8px] text-gray-400">{doc.ukuran}</span>
                        <span className="text-[8px] text-gray-300">·</span>
                        <span className="text-[8px] text-gray-400">{doc.tanggal}</span>
                      </div>
                    </div>

                    {/* Hash */}
                    <div className="flex items-center gap-2 font-mono px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 flex-shrink-0">
                      <span className="text-[9px] text-gray-500">{truncateHash(doc.hash)}</span>
                      <button
                        onClick={() => handleCopy(doc.hash, `doc-${doc.id}`)}
                        className="text-gray-300 hover:text-emerald-600 transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Verify */}
                    <button
                      onClick={() => handleVerifyHash(doc.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex-shrink-0 ${
                        verifiedId === doc.id
                          ? "bg-emerald-500 text-white"
                          : "border border-gray-200 text-gray-500 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50"
                      }`}
                    >
                      <ShieldCheck className="w-3 h-3" />
                      {verifiedId === doc.id ? "✓ Valid" : "Verifikasi"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Midtrans Log ── */}
        {activeTab === "midtrans" && (
          <motion.div key="midtrans" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Total Dicairkan", value: `Rp ${midtransTotal.toLocaleString("id-ID")}`, color: "text-emerald-600" },
                { label: "Berhasil", value: String(midtransBerhasil), color: "text-emerald-600" },
                { label: "Gagal", value: String(midtransGagal), color: "text-red-600" },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl border border-gray-100 px-5 py-4">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
                  <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <p className="text-sm font-black text-gray-900">Log Pencairan Dana</p>
              </div>
              <div className="divide-y divide-gray-50">
                {MIDTRANS_LOGS.map(log => (
                  <button
                    key={log.id}
                    onClick={() => setMidtransDetail(midtransDetail?.id === log.id ? null : log)}
                    className={`w-full px-6 py-4 flex items-center gap-4 text-left hover:bg-gray-50/50 transition-all ${
                      log.status === "gagal" ? "bg-red-50/40 border-l-2 border-red-400" : ""
                    }`}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${
                      log.status === "berhasil" ? "bg-emerald-50 text-emerald-600" :
                      log.status === "gagal" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                    }`}>
                      {log.status === "berhasil" ? <CheckCircle2 className="w-4 h-4" /> :
                       log.status === "gagal" ? <XCircle className="w-4 h-4" /> :
                       <Clock className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-gray-900">{log.vendor}</p>
                      <p className="text-[9px] text-gray-400 font-mono">{log.txId}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-black tabular-nums ${
                        log.status === "gagal" ? "text-red-600 line-through" : "text-gray-900"
                      }`}>
                        Rp {log.nominal.toLocaleString("id-ID")}
                      </p>
                      <p className="text-[9px] text-gray-400">{log.tanggal}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
              {midtransDetail && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
                  onClick={() => setMidtransDetail(null)}
                >
                  <motion.div
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 40, opacity: 0 }}
                    onClick={e => e.stopPropagation()}
                    className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
                  >
                    <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                      <p className="text-sm font-black text-gray-900">Detail Transaksi</p>
                      <button onClick={() => setMidtransDetail(null)} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-6 space-y-4">
                      {[
                        { label: "ID Transaksi", value: midtransDetail.txId, mono: true },
                        { label: "Vendor", value: midtransDetail.vendor },
                        { label: "Nominal", value: `Rp ${midtransDetail.nominal.toLocaleString("id-ID")}` },
                        { label: "Status", value: midtransDetail.status.toUpperCase() },
                        { label: "Timestamp", value: midtransDetail.timestamp },
                      ].map(item => (
                        <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{item.label}</p>
                          <p className={`text-xs font-black text-gray-900 ${item.mono ? "font-mono" : ""}`}>{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
