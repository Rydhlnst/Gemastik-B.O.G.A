"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
const MOCK_EVENTS: ActivityEvent[] = [
  {
    id: "EVT-001",
    type: "ESCROW_RELEASED",
    title: "Dana Escrow Dicairkan",
    subtitle: "PO-DEMO-099 · SPPG Bandung Barat",
    detail: "Multi-Sig 3/3 lengkap. Dana tahap 1 dikirim ke rekening BCA Anda.",
    amount: 4500000,
    timestamp: "2026-04-28T09:00:00.000Z",
    hash: "0x4fa3b1c9d8e2",
  },
  {
    id: "EVT-002",
    type: "SERAH_TERIMA",
    title: "Serah Terima Berhasil",
    subtitle: "PO-DEMO-099 · Logistik SPPG scan QR",
    detail: "Petugas logistik SPPG telah menscan barcode. Barang dinyatakan diterima.",
    timestamp: "2026-04-28T08:00:00.000Z",
    hash: "0x8bc12ef34a91",
  },
  {
    id: "EVT-003",
    type: "MULTISIG_PROGRESS",
    title: "Tanda Tangan Logistik",
    subtitle: "PO-DEMO-099 · Progress 1/3",
    detail: "Staf Logistik SPPG telah membubuhkan tanda tangan digital.",
    timestamp: "2026-04-28T07:30:00.000Z",
  },
  {
    id: "EVT-004",
    type: "PO_ACCEPTED",
    title: "Pesanan Dikonfirmasi Siap",
    subtitle: "PO-DEMO-099 · Beras Premium 250 kg",
    detail: "Anda mengkonfirmasi barang siap diambil. QR serah terima telah dibuat.",
    timestamp: "2026-04-28T07:00:00.000Z",
  },
  {
    id: "EVT-005",
    type: "PO_RECEIVED",
    title: "Pesanan Masuk dari SPPG",
    subtitle: "PO-DEMO-099 · SPPG Bandung Barat",
    detail: "Pesanan baru untuk 250 kg Beras Premium. Dana sudah dikunci di escrow DOKU.",
    amount: 4500000,
    timestamp: "2026-04-28T06:00:00.000Z",
  },
  {
    id: "EVT-006",
    type: "INBOUND",
    title: "Stok Masuk Dicatat",
    subtitle: "Telur Ayam Ras · 500 kg",
    detail: "Dari UD. Sumber Pangan, Gedebage. Hash nota dikunci ke blockchain.",
    timestamp: "2026-04-28T04:00:00.000Z",
    hash: "0x2de91ba77f43",
  },
  {
    id: "EVT-007",
    type: "KATALOG_ADDED",
    title: "Produk Ditambahkan ke Katalog",
    subtitle: "Telur Ayam Ras · Rp 28.800/kg",
    detail: "Produk baru berhasil masuk ke E-Katalog B.O.G.A.",
    timestamp: "2026-04-28T02:00:00.000Z",
  },
  {
    id: "EVT-008",
    type: "PO_REJECTED",
    title: "Pesanan Ditolak",
    subtitle: "PO-DEMO-088 · SPPG Cimahi Selatan",
    detail: "Anda menolak pesanan ini. Dana akan dikembalikan ke kas negara dalam 3×24 jam.",
    amount: 1200000,
    timestamp: "2026-04-27T08:00:00.000Z",
  },
  {
    id: "EVT-009",
    type: "INBOUND",
    title: "Stok Masuk Dicatat",
    subtitle: "Beras Premium · 1.000 kg",
    detail: "Dari Pasar Induk Gedebage, Bandung. Hash nota dikunci ke blockchain.",
    timestamp: "2026-04-27T04:00:00.000Z",
    hash: "0x9fa11cc28b07",
  },
  {
    id: "EVT-010",
    type: "KATALOG_ADDED",
    title: "Produk Ditambahkan ke Katalog",
    subtitle: "Beras Premium Cap Ramos · Rp 18.000/kg",
    detail: "Produk baru berhasil masuk ke E-Katalog B.O.G.A.",
    timestamp: "2026-04-26T10:00:00.000Z",
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

  const filtered = activeFilter === "all"
    ? MOCK_EVENTS
    : MOCK_EVENTS.filter(ev => FILTER_MAP[activeFilter].includes(ev.type));

  const grouped = groupByDate(filtered);

  const filters: { key: FilterKey; label: string; color?: string }[] = [
    { key: "all",      label: "Semua" },
    { key: "pesanan",  label: "Pesanan",  color: "#D97706" },
    { key: "stok",     label: "Stok",     color: "#1D4ED8" },
    { key: "keuangan", label: "Keuangan", color: G },
    { key: "katalog",  label: "Katalog",  color: "#0891B2" },
  ];

  /* Stats */
  const todayCount = MOCK_EVENTS.filter(ev => new Date(ev.timestamp).toDateString() === new Date().toDateString()).length;
  const pendingPO  = MOCK_EVENTS.filter(ev => ev.type === "PO_RECEIVED").length;
  const released   = MOCK_EVENTS.filter(ev => ev.type === "ESCROW_RELEASED").reduce((s, e) => s + (e.amount ?? 0), 0);

  return (
    <div className="min-h-svh bg-slate-50" data-role="vendor">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base font-extrabold text-slate-800 leading-none">Riwayat Aktivitas</h1>
              <p className="text-[11px] text-slate-400 mt-0.5">{todayCount} aktivitas hari ini</p>
            </div>
            <div className="w-9 h-9 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Filter size={14} className="text-slate-500" />
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar pb-0.5">
            {filters.map(f => {
              const active = activeFilter === f.key;
              return (
                <button key={f.key} onClick={() => setActiveFilter(f.key)}
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
            <p className="text-xs text-slate-400 mt-1">Belum ada riwayat di kategori ini.</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={activeFilter} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="space-y-5">
              {grouped.map(group => (
                <div key={group.label}>
                  {/* Date label */}
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{group.label}</p>
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-[9px] font-bold text-slate-300">{group.events.length} event</span>
                  </div>

                  {/* Events */}
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
      </div>
    </div>
  );
}
