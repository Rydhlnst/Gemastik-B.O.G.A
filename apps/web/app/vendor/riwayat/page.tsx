"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowDownToLine, ShoppingBag, Package, CheckCircle2,
  XCircle, ShieldCheck, Wallet, Tag, Filter,
  Clock, Hash, AlertTriangle,
} from "lucide-react";

/* ─── Constants ─── */
const G = "#065F46";
const G_LIGHT = "#D1FAE5";

/* ─── Types ─── */
type EventType =
  | "INBOUND"
  | "PO_RECEIVED"
  | "PO_ACCEPTED"
  | "PO_REJECTED"
  | "MULTISIG_PROGRESS"
  | "ESCROW_RELEASED"
  | "KATALOG_ADDED"
  | "KATALOG_REMOVED"
  | "SERAH_TERIMA";

interface ActivityEvent {
  id: string;
  type: EventType;
  title: string;
  subtitle: string;
  detail?: string;
  amount?: number;
  timestamp: string;
  hash?: string;
}

/* ─── Mock Data ─── */
/* ─── Mock Data ─── */
const MOCK_EVENTS: ActivityEvent[] = [
  // --- HALAMAN 1 (10 Data Terbaru) ---
  {
    id: "EVT-001", type: "ESCROW_RELEASED", title: "Dana Escrow Dicairkan", subtitle: "PO-DEMO-099 · SPPG Bandung Barat",
    detail: "Multi-Sig 3/3 lengkap. Dana tahap 1 dikirim ke rekening BCA Anda.", amount: 4500000,
    timestamp: new Date().toISOString(), hash: "0x4fa3b1c9d8e2",
  },
  {
    id: "EVT-002", type: "SERAH_TERIMA", title: "Serah Terima Berhasil", subtitle: "PO-DEMO-099 · Logistik SPPG scan QR",
    detail: "Petugas logistik SPPG telah menscan barcode. Barang dinyatakan diterima.",
    timestamp: new Date(Date.now() - 3600000).toISOString(), hash: "0x8bc12ef34a91",
  },
  {
    id: "EVT-003", type: "MULTISIG_PROGRESS", title: "Tanda Tangan Logistik", subtitle: "PO-DEMO-099 · Progress 1/3",
    detail: "Staf Logistik SPPG telah membubuhkan tanda tangan digital.",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "EVT-004", type: "PO_ACCEPTED", title: "Pesanan Dikonfirmasi Siap", subtitle: "PO-DEMO-099 · Beras Premium 250 kg",
    detail: "Anda mengkonfirmasi barang siap diambil. QR serah terima telah dibuat.",
    timestamp: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: "EVT-005", type: "PO_RECEIVED", title: "Pesanan Masuk dari SPPG", subtitle: "PO-DEMO-099 · SPPG Bandung Barat",
    detail: "Pesanan baru untuk 250 kg Beras Premium. Dana sudah dikunci di escrow.",
    amount: 4500000, timestamp: new Date(Date.now() - 28800000).toISOString(),
  },
  {
    id: "EVT-006", type: "INBOUND", title: "Stok Masuk Dicatat", subtitle: "Telur Ayam Ras · 500 kg",
    detail: "Dari UD. Sumber Pangan, Gedebage. Hash nota dikunci ke blockchain.",
    timestamp: new Date(Date.now() - 43200000).toISOString(), hash: "0x2de91ba77f43",
  },
  {
    id: "EVT-007", type: "KATALOG_ADDED", title: "Produk Ditambahkan", subtitle: "Telur Ayam Ras · Rp 28.800/kg",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "EVT-008", type: "PO_REJECTED", title: "Pesanan Ditolak", subtitle: "PO-DEMO-088 · SPPG Cimahi Selatan",
    detail: "Anda menolak pesanan ini karena kendala logistik internal.",
    amount: 1200000, timestamp: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "EVT-009", type: "INBOUND", title: "Stok Masuk Dicatat", subtitle: "Beras Premium · 1.000 kg",
    timestamp: new Date(Date.now() - 259200000).toISOString(), hash: "0x9fa11cc28b07",
  },
  {
    id: "EVT-010", type: "KATALOG_ADDED", title: "Produk Ditambahkan", subtitle: "Beras Premium Cap Ramos",
    timestamp: new Date(Date.now() - 345600000).toISOString(),
  },

  // --- HALAMAN 2 ---
  {
    id: "EVT-011", type: "ESCROW_RELEASED", title: "Pembayaran Selesai", subtitle: "PO-X-771 · SPPG Bekasi Utara",
    amount: 8200000, timestamp: new Date(Date.now() - 500000000).toISOString(),
  },
  {
    id: "EVT-012", type: "SERAH_TERIMA", title: "Barang Sampai Tujuan", subtitle: "PO-X-771 · SD Negeri 05 Bekasi",
    timestamp: new Date(Date.now() - 600000000).toISOString(),
  },
  {
    id: "EVT-013", type: "INBOUND", title: "Stok Masuk: Daging Sapi", subtitle: "450 kg · Halal Meat Store",
    timestamp: new Date(Date.now() - 700000000).toISOString(), hash: "0xBeefHash772",
  },
  {
    id: "EVT-014", type: "PO_ACCEPTED", title: "PO-X-771 Diterima", subtitle: "Daging Sapi 450 kg",
    timestamp: new Date(Date.now() - 800000000).toISOString(),
  },
  {
    id: "EVT-015", type: "PO_RECEIVED", title: "Pesanan Baru", subtitle: "PO-X-771 · SPPG Bekasi",
    amount: 8200000, timestamp: new Date(Date.now() - 900000000).toISOString(),
  },
  {
    id: "EVT-016", type: "INBOUND", title: "Stok Masuk: Sayur", subtitle: "1.200 ikat · Kelompok Tani",
    timestamp: new Date(Date.now() - 1000000000).toISOString(),
  },
  {
    id: "EVT-017", type: "KATALOG_ADDED", title: "Item Baru: Bayam", subtitle: "Rp 3.500/ikat",
    timestamp: new Date(Date.now() - 1100000000).toISOString(),
  },
  {
    id: "EVT-018", type: "ESCROW_RELEASED", title: "Dana Cair: PO-A-22", subtitle: "Tahap Final · 100%",
    amount: 15000000, timestamp: new Date(Date.now() - 1200000000).toISOString(),
  },
  {
    id: "EVT-019", type: "SERAH_TERIMA", title: "Distribusi Selesai", subtitle: "PO-A-22 · Wilayah Bogor",
    timestamp: new Date(Date.now() - 1300000000).toISOString(),
  },
  {
    id: "EVT-020", type: "INBOUND", title: "Stok Masuk: Ikan", subtitle: "300 kg · Muara Angke",
    timestamp: new Date(Date.now() - 1400000000).toISOString(),
  },

  // --- HALAMAN 3 ---
  {
    id: "EVT-021", type: "KATALOG_ADDED", title: "Update Harga", subtitle: "Minyak Goreng · Rp 14.500",
    timestamp: new Date(Date.now() - 2000000000).toISOString(),
  },
  {
    id: "EVT-022", type: "INBOUND", title: "Stok Masuk: Minyak", subtitle: "2.000 liter · Distributor",
    timestamp: new Date(Date.now() - 2500000000).toISOString(),
  },
  {
    id: "EVT-023", type: "PO_RECEIVED", title: "Pesanan Lama", subtitle: "PO-OLD-001",
    timestamp: new Date(Date.now() - 3000000000).toISOString(),
  },
  {
    id: "EVT-024", type: "KATALOG_REMOVED", title: "Produk Dihapus", subtitle: "Susu Basi · Expired",
    timestamp: new Date(Date.now() - 4000000000).toISOString(),
  },
  {
    id: "EVT-025", type: "INBOUND", title: "Aktivitas Awal", subtitle: "Beras · 5.000 kg",
    timestamp: new Date(Date.now() - 5000000000).toISOString(),
  },
];

/* ─── Event Config ─── */
const EVENT_CONFIG: Record<EventType, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  INBOUND:          { icon: ArrowDownToLine, color: "#1D4ED8", bg: "#EFF6FF", label: "Stok Masuk" },
  PO_RECEIVED:      { icon: ShoppingBag,     color: "#D97706", bg: "#FEF3C7", label: "Pesanan" },
  PO_ACCEPTED:      { icon: CheckCircle2,    color: G,         bg: G_LIGHT,   label: "Pesanan" },
  PO_REJECTED:      { icon: XCircle,         color: "#DC2626", bg: "#FEE2E2", label: "Pesanan" },
  MULTISIG_PROGRESS:{ icon: ShieldCheck,     color: "#7C3AED", bg: "#F5F3FF", label: "Multi-Sig" },
  ESCROW_RELEASED:  { icon: Wallet,          color: G,         bg: G_LIGHT,   label: "Keuangan" },
  KATALOG_ADDED:    { icon: Package,         color: "#0891B2", bg: "#ECFEFF", label: "Katalog" },
  KATALOG_REMOVED:  { icon: Package,         color: "#64748B", bg: "#F1F5F9", label: "Katalog" },
  SERAH_TERIMA:     { icon: CheckCircle2,    color: G,         bg: G_LIGHT,   label: "Logistik" },
};

type FilterKey = "all" | "pesanan" | "stok" | "keuangan" | "katalog";

const FILTER_MAP: Record<FilterKey, EventType[]> = {
  all:      [],
  pesanan:  ["PO_RECEIVED", "PO_ACCEPTED", "PO_REJECTED", "SERAH_TERIMA", "MULTISIG_PROGRESS"],
  stok:     ["INBOUND"],
  keuangan: ["ESCROW_RELEASED"],
  katalog:  ["KATALOG_ADDED", "KATALOG_REMOVED"],
};

/* ─── Helpers ─── */
function currency(v: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);
}

function formatTime(ts: string) {
  const d = new Date(ts);
  const now = Date.now();
  const diff = now - d.getTime();
  if (diff < 60000) return "Baru saja";
  if (diff < 3600000) return `${Math.floor(diff / 60000)} mnt lalu`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} jam lalu`;
  if (diff < 172800000) return "Kemarin · " + d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }) + " · " + d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function truncateHash(h: string) {
  return `${h.slice(0, 8)}...${h.slice(-4)}`;
}

/* ─── Group by date ─── */
function groupByDate(events: ActivityEvent[]) {
  const groups: { label: string; events: ActivityEvent[] }[] = [];
  const map = new Map<string, ActivityEvent[]>();

  for (const ev of events) {
    const d = new Date(ev.timestamp);
    const now = new Date();
    let label: string;
    if (d.toDateString() === now.toDateString()) label = "Hari Ini";
    else {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      if (d.toDateString() === yesterday.toDateString()) label = "Kemarin";
      else label = d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" });
    }

    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(ev);
  }

  map.forEach((evs, label) => groups.push({ label, events: evs }));
  return groups;
}

/* ─── Activity Item ─── */
function ActivityItem({ ev, isLast }: { ev: ActivityEvent; isLast: boolean }) {
  const cfg = EVENT_CONFIG[ev.type];
  const Icon = cfg.icon;

  return (
    <div className="flex gap-3">
      {/* Timeline line */}
      <div className="flex flex-col items-center">
        <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
          style={{ background: cfg.bg }}>
          <Icon size={16} style={{ color: cfg.color }} />
        </div>
        {!isLast && <div className="w-px flex-1 mt-1 mb-0" style={{ background: "#E2E8F0", minHeight: 20 }} />}
      </div>

      {/* Content */}
      <div className={`flex-1 pb-4 ${isLast ? "" : ""}`}>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-3.5 py-3">
            {/* Header row */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-extrabold text-slate-800 leading-tight">{ev.title}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">{ev.subtitle}</p>
              </div>
              <span className="shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-full border"
                style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.bg }}>
                {cfg.label}
              </span>
            </div>

            {/* Detail */}
            {ev.detail && (
              <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">{ev.detail}</p>
            )}

            {/* Amount */}
            {ev.amount && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1"
                style={{ background: cfg.bg }}>
                <Wallet size={10} style={{ color: cfg.color }} />
                <p className="text-[10px] font-extrabold" style={{ color: cfg.color }}>
                  {currency(ev.amount)}
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-50">
              <div className="flex items-center gap-1 text-slate-400">
                <Clock size={9} />
                <p className="text-[9px] font-medium" suppressHydrationWarning>{formatTime(ev.timestamp)}</p>
              </div>
              {ev.hash && (
                <div className="flex items-center gap-1">
                  <Hash size={9} className="text-slate-300" />
                  <p className="text-[9px] font-mono text-slate-400">{truncateHash(ev.hash)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function VendorRiwayatPage() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Date Filter State (Default: Last 3 months)
  const today = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(today.getMonth() - 3);

  const [startDate, setStartDate] = useState(threeMonthsAgo.toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split("T")[0]);

  // Handle Date Change with 3-month limit validation
  const handleDateChange = (type: "start" | "end", value: string) => {
    const s = new Date(type === "start" ? value : startDate);
    const e = new Date(type === "end" ? value : endDate);
    const diffTime = Math.abs(e.getTime() - s.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 90) {
      toast.warning("Rentang maksimal adalah 3 bulan. Tanggal disesuaikan otomatis.");
      if (type === "start") {
        const newEnd = new Date(s);
        newEnd.setMonth(s.getMonth() + 3);
        setEndDate(newEnd.toISOString().split("T")[0]);
        setStartDate(value);
      } else {
        const newStart = new Date(e);
        newStart.setMonth(e.getMonth() - 3);
        setStartDate(newStart.toISOString().split("T")[0]);
        setEndDate(value);
      }
    } else {
      if (type === "start") setStartDate(value);
      else setEndDate(value);
    }
    setCurrentPage(1); // Reset to page 1 on filter change
  };

  // 1. Filter by Category & Date Range
  const filtered = MOCK_EVENTS.filter(ev => {
    const matchCat = activeFilter === "all" || FILTER_MAP[activeFilter].includes(ev.type);
    const evDate = new Date(ev.timestamp);
    const sDate = new Date(startDate);
    const eDate = new Date(endDate);
    eDate.setHours(23, 59, 59); // End of day
    const matchDate = evDate >= sDate && evDate <= eDate;
    return matchCat && matchDate;
  });

  // 2. Pagination Logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const grouped = groupByDate(paginatedData);

  const filters: { key: FilterKey; label: string; color?: string }[] = [
    { key: "all",      label: "Semua" },
    { key: "pesanan",  label: "Pesanan",  color: "#D97706" },
    { key: "stok",     label: "Stok",     color: "#1D4ED8" },
    { key: "keuangan", label: "Keuangan", color: G },
    { key: "katalog",  label: "Katalog",  color: "#0891B2" },
  ];

  const todayCount = MOCK_EVENTS.filter(ev => new Date(ev.timestamp).toDateString() === new Date().toDateString()).length;
  const pendingPO  = MOCK_EVENTS.filter(ev => ev.type === "PO_RECEIVED").length;
  const released   = MOCK_EVENTS.filter(ev => ev.type === "ESCROW_RELEASED").reduce((s, e) => s + (e.amount ?? 0), 0);

  return (
    <div className="min-h-svh bg-slate-50" data-role="vendor">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-base font-extrabold text-slate-800 leading-none">Riwayat Aktivitas</h1>
              <p className="text-[11px] text-slate-400 mt-0.5">{filtered.length} riwayat ditemukan</p>
            </div>
            <div className="w-9 h-9 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
              <Clock size={16} />
            </div>
          </div>

          {/* Date Range Picker */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1">
              <p className="text-[9px] font-bold text-slate-400 uppercase mb-1 ml-1">Dari</p>
              <input type="date" value={startDate} onChange={e => handleDateChange("start", e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-slate-100 bg-slate-50 text-[11px] font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            </div>
            <div className="flex-1">
              <p className="text-[9px] font-bold text-slate-400 uppercase mb-1 ml-1">Sampai</p>
              <input type="date" value={endDate} onChange={e => handleDateChange("end", e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-slate-100 bg-slate-50 text-[11px] font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
            {filters.map(f => {
              const active = activeFilter === f.key;
              return (
                <button key={f.key} onClick={() => { setActiveFilter(f.key); setCurrentPage(1); }}
                  className={`shrink-0 h-7 px-3 rounded-full text-xs font-bold transition-all border ${active ? "text-white border-transparent shadow" : "bg-white border-slate-200 text-slate-500"}`}
                  style={active ? { background: f.color ?? "#1E293B" } : {}}>
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-5 pb-24">
        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Hari Ini",     value: `${todayCount} event`,  color: "#1E293B" },
            { label: "PO Masuk",     value: `${pendingPO} pesanan`, color: "#D97706" },
            { label: "Dana Cair",    value: released > 0 ? `Rp ${(released/1e6).toFixed(1)}Jt` : "—", color: G },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-3 shadow-sm">
              <p className="text-sm font-extrabold leading-none" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[10px] text-slate-400 mt-1 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Timeline */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center px-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: G_LIGHT }}>
              <AlertTriangle size={22} style={{ color: G }} />
            </div>
            <p className="text-sm font-bold text-slate-600">Tidak Ada Aktivitas</p>
            <p className="text-xs text-slate-400 mt-1">Ganti rentang tanggal atau kategori filter.</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={activeFilter + startDate + endDate + currentPage} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="space-y-5">
              {grouped.map(group => (
                <div key={group.label}>
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{group.label}</p>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>
                  <div>
                    {group.events.map((ev, idx) => (
                      <ActivityItem key={ev.id} ev={ev} isLast={idx === group.events.length - 1} />
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Pagination Buttons */}
        {totalPages > 1 && (
          <div className="flex flex-wrap justify-center items-center gap-1.5 pt-4 pb-8">
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              const active = currentPage === p;
              return (
                <button
                  key={p}
                  onClick={() => {
                    setCurrentPage(p);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${active ? "bg-[#1E293B] text-white shadow-lg" : "bg-white text-slate-400 border border-slate-200 hover:border-slate-300"}`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
