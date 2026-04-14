"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  PieChart, Medal, SlidersHorizontal, MapPin, TrendingUp,
  TrendingDown, Star, Download, CalendarRange, Loader2,
  CheckCircle2, FileText, BarChart3, X, AlertCircle
} from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, AreaChart, Area, XAxis, Tooltip,
  BarChart, Bar, Cell
} from "recharts";

// ─── Types & Data ───────────────────────────────────────────────────────────

interface VendorRating {
  id: number;
  nama: string;
  kategori: string;
  skor: number;
  previousSkor: number;
  onTimeRate: number;
  totalPengiriman: number;
  pelanggaran: number;
  lat: number;
  lng: number;
  radarData: { subject: string; value: number }[];
  trendData: { week: string; skor: number }[];
}

const VENDOR_RANKINGS: VendorRating[] = [
  {
    id: 1, nama: "Katering Pasundan Berkah", kategori: "Katering",
    skor: 97.4, previousSkor: 96.1, onTimeRate: 97.4, totalPengiriman: 512, pelanggaran: 0,
    lat: -6.9380, lng: 107.6250,
    radarData: [
      { subject: "Ketepatan", value: 97 }, { subject: "Kualitas", value: 96 },
      { subject: "Kepatuhan", value: 100 }, { subject: "Dokumen", value: 98 }, { subject: "Respon", value: 95 },
    ],
    trendData: [
      { week: "W1", skor: 94 }, { week: "W2", skor: 95.5 }, { week: "W3", skor: 96.1 },
      { week: "W4", skor: 97.4 },
    ],
  },
  {
    id: 2, nama: "CV Katering Bandung Juara", kategori: "Katering",
    skor: 96.2, previousSkor: 97.8, onTimeRate: 98.2, totalPengiriman: 442, pelanggaran: 1,
    lat: -6.8850, lng: 107.6130,
    radarData: [
      { subject: "Ketepatan", value: 98 }, { subject: "Kualitas", value: 97 },
      { subject: "Kepatuhan", value: 95 }, { subject: "Dokumen", value: 94 }, { subject: "Respon", value: 97 },
    ],
    trendData: [
      { week: "W1", skor: 98.2 }, { week: "W2", skor: 97.8 }, { week: "W3", skor: 97.8 },
      { week: "W4", skor: 96.2 },
    ],
  },
  {
    id: 3, nama: "Logistik Parahyangan Express", kategori: "Logistik",
    skor: 94.1, previousSkor: 93.5, onTimeRate: 98.8, totalPengiriman: 312, pelanggaran: 0,
    lat: -6.8980, lng: 107.5950,
    radarData: [
      { subject: "Ketepatan", value: 99 }, { subject: "Kualitas", value: 90 },
      { subject: "Kepatuhan", value: 95 }, { subject: "Dokumen", value: 93 }, { subject: "Respon", value: 96 },
    ],
    trendData: [
      { week: "W1", skor: 92 }, { week: "W2", skor: 93 }, { week: "W3", skor: 93.5 },
      { week: "W4", skor: 94.1 },
    ],
  },
  {
    id: 4, nama: "PT Gizi Priangan Utama", kategori: "Katering",
    skor: 91.5, previousSkor: 92.0, onTimeRate: 96.1, totalPengiriman: 215, pelanggaran: 1,
    lat: -6.9450, lng: 107.6320,
    radarData: [
      { subject: "Ketepatan", value: 96 }, { subject: "Kualitas", value: 89 },
      { subject: "Kepatuhan", value: 93 }, { subject: "Dokumen", value: 90 }, { subject: "Respon", value: 88 },
    ],
    trendData: [
      { week: "W1", skor: 93 }, { week: "W2", skor: 92.5 }, { week: "W3", skor: 92 },
      { week: "W4", skor: 91.5 },
    ],
  },
  {
    id: 5, nama: "Agro Lembang Segar", kategori: "Supplier Bahan",
    skor: 88.3, previousSkor: 87.0, onTimeRate: 93.4, totalPengiriman: 167, pelanggaran: 0,
    lat: -6.8150, lng: 107.6180,
    radarData: [
      { subject: "Ketepatan", value: 93 }, { subject: "Kualitas", value: 92 },
      { subject: "Kepatuhan", value: 88 }, { subject: "Dokumen", value: 83 }, { subject: "Respon", value: 85 },
    ],
    trendData: [
      { week: "W1", skor: 85 }, { week: "W2", skor: 86 }, { week: "W3", skor: 87 },
      { week: "W4", skor: 88.3 },
    ],
  },
  {
    id: 6, nama: "CV Food Hub Jabar", kategori: "Katering",
    skor: 54.2, previousSkor: 72.3, onTimeRate: 72.3, totalPengiriman: 45, pelanggaran: 4,
    lat: -6.9550, lng: 107.5850,
    radarData: [
      { subject: "Ketepatan", value: 55 }, { subject: "Kualitas", value: 60 },
      { subject: "Kepatuhan", value: 48 }, { subject: "Dokumen", value: 52 }, { subject: "Respon", value: 57 },
    ],
    trendData: [
      { week: "W1", skor: 72 }, { week: "W2", skor: 68 }, { week: "W3", skor: 60 },
      { week: "W4", skor: 54.2 },
    ],
  },
];

const MEDAL_COLORS = ["#f59e0b", "#94a3b8", "#b45309"];

// ─── Export Modal ────────────────────────────────────────────────────────────

function ExportModal({ onClose }: { onClose: () => void }) {
  const [rentang, setRentang] = useState<"mingguan" | "bulanan">("mingguan");
  const [cakupan, setCakupan] = useState<"logistik" | "anggaran" | "keduanya">("keduanya");
  const [format, setFormat] = useState<"pdf" | "csv">("pdf");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const transaksiCount = rentang === "mingguan" ? 28 : 112;
  const dateRange = rentang === "mingguan" ? "07 – 13 Apr 2025" : "Mar – Apr 2025";

  const handleDownload = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setLoading(false);
    setDone(true);
    setTimeout(onClose, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Unduh Laporan Otomatis</p>
            <h3 className="text-base font-black text-gray-900">Konfigurasi Laporan</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          {done ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <p className="text-sm font-black text-emerald-700">Laporan Berhasil Diunduh!</p>
            </div>
          ) : (
            <>
              {/* Rentang */}
              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                  <CalendarRange className="w-3 h-3 inline mr-1" /> Rentang Waktu
                </label>
                <div className="flex gap-2">
                  {(["mingguan", "bulanan"] as const).map(r => (
                    <button key={r} onClick={() => setRentang(r)}
                      className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 transition-all ${rentang === r ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-gray-100 text-gray-400 hover:border-gray-200"}`}
                    >{r}</button>
                  ))}
                </div>
              </div>

              {/* Cakupan */}
              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                  <BarChart3 className="w-3 h-3 inline mr-1" /> Cakupan Data
                </label>
                <div className="flex gap-2">
                  {(["logistik", "anggaran", "keduanya"] as const).map(c => (
                    <button key={c} onClick={() => setCakupan(c)}
                      className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 transition-all ${cakupan === c ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-gray-100 text-gray-400"}`}
                    >{c}</button>
                  ))}
                </div>
              </div>

              {/* Format */}
              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                  <FileText className="w-3 h-3 inline mr-1" /> Format File
                </label>
                <div className="flex gap-2">
                  {(["pdf", "csv"] as const).map(f => (
                    <button key={f} onClick={() => setFormat(f)}
                      className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 transition-all ${format === f ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-gray-100 text-gray-400"}`}
                    >
                      {f === "pdf" ? "📄 PDF — Presentasi" : "📊 CSV — Analisis"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-gray-600 font-medium">
                Laporan ini mencakup{" "}
                <strong className="text-gray-900">{transaksiCount} transaksi</strong> dari{" "}
                <strong className="text-gray-900">{dateRange}</strong>.
                Cakupan: <strong className="text-gray-900">{cakupan}</strong>. Format:{" "}
                <strong className="text-gray-900">{format.toUpperCase()}</strong>.
              </div>

              <button
                onClick={handleDownload}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyiapkan...</>
                  : <><Download className="w-4 h-4" /> Unduh Laporan</>
                }
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Vendor Detail Panel ────────────────────────────────────────────────────

function VendorDetailPanel({ vendor, onClose }: { vendor: VendorRating; onClose: () => void }) {
  const router = useRouter();
  const delta = vendor.skor - vendor.previousSkor;
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
      className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden"
    >
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <div>
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Profil Reputasi</p>
          <h3 className="text-sm font-black text-gray-900">{vendor.nama}</h3>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* Skor */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Skor Reputasi</p>
            <p className={`text-3xl font-black tabular-nums ${vendor.skor >= 90 ? "text-emerald-600" : vendor.skor >= 70 ? "text-amber-600" : "text-red-600"}`}>
              {vendor.skor}
            </p>
          </div>
          <div className={`flex items-center gap-1 text-sm font-black ${delta >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            {delta >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {delta >= 0 ? "+" : ""}{delta.toFixed(1)}
          </div>
        </div>

        {/* Radar */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={vendor.radarData}>
              <PolarGrid stroke="#f1f5f9" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fontWeight: 700, fill: "#94a3b8" }} />
              <Radar name="Skor" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "On-Time", value: `${vendor.onTimeRate}%`, color: "text-emerald-600" },
            { label: "Pengiriman", value: String(vendor.totalPengiriman), color: "text-indigo-600" },
            { label: "Pelanggaran", value: String(vendor.pelanggaran), color: vendor.pelanggaran > 0 ? "text-red-600" : "text-emerald-600" },
          ].map(s => (
            <div key={s.label} className="text-center py-3 bg-gray-50 rounded-xl border border-gray-100">
              <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
              <p className="text-[7px] font-black text-gray-400 uppercase">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Trend */}
        <div>
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Tren Skor (4 Minggu)</p>
          <div className="h-20">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={vendor.trendData}>
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="week" hide />
                <Tooltip contentStyle={{ fontSize: 10, fontWeight: 700, borderRadius: 8, border: "1px solid #f1f5f9" }} />
                <Area type="monotone" dataKey="skor" stroke="#6366f1" strokeWidth={2} fill="url(#trendGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MapPin Gateway */}
        <button
          onClick={() => router.push(`/goverment/pengawasan?vendor=${vendor.id}`)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest transition-all"
        >
          <MapPin className="w-4 h-4" /> Lihat Armada Aktif Vendor Ini
        </button>

        {vendor.pelanggaran > 0 && (
          <button
            onClick={() => router.push("/goverment/verifikasi")}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 text-red-600 text-[10px] font-black uppercase tracking-wider hover:bg-red-50 transition-all"
          >
            <AlertCircle className="w-3.5 h-3.5" /> Lihat Catatan Pelanggaran
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function StatistikPage() {
  const router = useRouter();
  const [filterKategori, setFilterKategori] = useState("SEMUA");
  const [selectedVendor, setSelectedVendor] = useState<VendorRating | null>(null);
  const [showExport, setShowExport] = useState(false);

  const filteredVendors = useMemo(() =>
    VENDOR_RANKINGS.filter(v =>
      filterKategori === "SEMUA" || v.kategori === filterKategori
    ).sort((a, b) => b.skor - a.skor),
    [filterKategori]);

  const categories = ["SEMUA", ...Array.from(new Set(VENDOR_RANKINGS.map(v => v.kategori)))];

  return (
    <div className="p-6 space-y-5 min-h-full bg-slate-50/50">

      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-500">
            <PieChart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Statistik & Reputasi</h1>
            <p className="text-xs text-gray-400">Papan peringkat vendor dan unduh laporan otomatis</p>
          </div>
        </div>
        <button
          onClick={() => setShowExport(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-indigo-500/20"
        >
          <Download className="w-4 h-4" /> Unduh Laporan
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <SlidersHorizontal className="w-4 h-4 text-gray-400" />
        <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => { setFilterKategori(c); setSelectedVendor(null); }}
              className={`px-4 py-1.5 text-[9px] font-black rounded-lg transition-all uppercase tracking-wider ${
                filterKategori === c ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
              }`}
            >
              {c === "SEMUA" ? "Semua" : c}
            </button>
          ))}
        </div>
      </div>

      {/* Main Layout: Leaderboard + Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Leaderboard */}
        <div className={`space-y-3 ${selectedVendor ? "lg:col-span-3" : "lg:col-span-5"}`}>
          {/* Bar Chart Overview */}
          {!selectedVendor && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Skor Reputasi Semua Vendor</p>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredVendors} onClick={d => d?.activePayload && setSelectedVendor(filteredVendors.find(v => v.nama === d?.activePayload?.[0]?.payload?.nama) || null)}>
                    <XAxis dataKey="nama" hide />
                    <Tooltip
                      contentStyle={{ fontSize: 10, fontWeight: 700, borderRadius: 8 }}
                      formatter={(val: number) => [`${val}`, "Skor"]}
                    />
                    <Bar dataKey="skor" radius={[6, 6, 0, 0]} cursor="pointer">
                      {filteredVendors.map((v, i) => (
                        <Cell key={v.id} fill={v.skor >= 90 ? "#10b981" : v.skor >= 70 ? "#f59e0b" : "#ef4444"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Rankings List */}
          {filteredVendors.map((vendor, index) => {
            const rank = index + 1;
            const delta = vendor.skor - vendor.previousSkor;
            const isTop3 = rank <= 3;
            return (
              <motion.button
                key={vendor.id}
                layoutId={`vendor-${vendor.id}`}
                onClick={() => setSelectedVendor(selectedVendor?.id === vendor.id ? null : vendor)}
                className={`w-full text-left bg-white rounded-2xl border shadow-sm px-5 py-4 flex items-center gap-4 hover:shadow-md transition-all ${
                  selectedVendor?.id === vendor.id
                    ? "border-indigo-200 ring-2 ring-indigo-500/10"
                    : "border-gray-100"
                }`}
              >
                {/* Rank */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm ${
                  rank === 1 ? "bg-amber-100 text-amber-700" :
                  rank === 2 ? "bg-gray-100 text-gray-600" :
                  rank === 3 ? "bg-orange-100 text-orange-700" : "bg-slate-50 text-slate-500"
                }`}>
                  {isTop3 ? <Medal className="w-5 h-5" style={{ color: MEDAL_COLORS[rank - 1] }} /> : rank}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-black text-gray-900 truncate">{vendor.nama}</p>
                    <span className="text-[8px] font-black px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full flex-shrink-0">
                      {vendor.kategori}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] text-gray-400 font-medium">{vendor.totalPengiriman} pengiriman</span>
                    {vendor.pelanggaran > 0 && (
                      <span className="text-[8px] font-black text-red-500 flex items-center gap-0.5">
                        <AlertCircle className="w-2.5 h-2.5" /> {vendor.pelanggaran} pelanggaran
                      </span>
                    )}
                  </div>
                </div>

                {/* Score + Trend */}
                <div className="text-right flex-shrink-0">
                  <p className={`text-xl font-black tabular-nums ${
                    vendor.skor >= 90 ? "text-emerald-600" : vendor.skor >= 70 ? "text-amber-600" : "text-red-600"
                  }`}>
                    {vendor.skor}
                  </p>
                  <span className={`text-[9px] font-black flex items-center gap-0.5 justify-end ${delta >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                    {delta >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {delta >= 0 ? "+" : ""}{delta.toFixed(1)}
                  </span>
                </div>

                {/* MapPin */}
                <div
                  onClick={e => { e.stopPropagation(); router.push(`/goverment/pengawasan?vendor=${vendor.id}`); }}
                  className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                  title="Lihat di peta"
                >
                  <MapPin className="w-4 h-4" />
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Detail Panel */}
        <AnimatePresence>
          {selectedVendor && (
            <div className="lg:col-span-2">
              <VendorDetailPanel vendor={selectedVendor} onClose={() => setSelectedVendor(null)} />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Export Modal */}
      <AnimatePresence>
        {showExport && <ExportModal onClose={() => setShowExport(false)} />}
      </AnimatePresence>
    </div>
  );
}
