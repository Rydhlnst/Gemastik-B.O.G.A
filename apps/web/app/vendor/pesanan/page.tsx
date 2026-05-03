"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  CheckCircle2, XCircle, Clock, Tag, Loader2,
  ShieldCheck, ShieldAlert, Hash, Package, Check,
  RefreshCw, AlertTriangle, ScanLine, ChevronDown, ChevronUp,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { logger } from "@/lib/logger";

/* ─── Constants ─── */
const API = "http://localhost:3001";
const G = "#065F46";
const G_LIGHT = "#D1FAE5";

import { getPOTab, type PO, type POItem, type Signatures, type Tab } from "@/lib/pesanan";

/* ─── Mock demo data ─── */
const MOCK_POS: PO[] = [
  {
    purchaseOrderId: "PO-2024-001",
    sppgId: "SDN 01 Menteng",
    orderDate: new Date(Date.now() - 1 * 3600000).toISOString(),
    financials: { totalAmount: 10200000, escrowStatus: "ESCROW_HOLD", signatures: { qc: "PENDING", admin: "PENDING", logistik: "PENDING" } },
    items: [
      { item_name: "Beras Premium Cap Ramos", quantity: 250, unit: "kg", price_at_purchase: 18000, subtotal: 4500000 },
      { item_name: "Telur Ayam Ras", quantity: 50, unit: "kg", price_at_purchase: 28000, subtotal: 1400000 },
      { item_name: "Daging Ayam Ras Segar", quantity: 100, unit: "kg", price_at_purchase: 30000, subtotal: 3000000 },
      { item_name: "Cabai Merah Besar", quantity: 10, unit: "kg", price_at_purchase: 50000, subtotal: 500000 },
      { item_name: "Minyak Goreng Kita 1L", quantity: 50, unit: "liter", price_at_purchase: 16000, subtotal: 800000 },
    ],
  },
  {
    purchaseOrderId: "PO-2024-002",
    sppgId: "SMPN 2 Jakarta",
    orderDate: new Date(Date.now() - 40 * 3600000).toISOString(),
    financials: { totalAmount: 2880000, escrowStatus: "READY_FOR_PICKUP", signatures: { qc: "PENDING", admin: "PENDING", logistik: "PENDING" } },
    items: [{ item_name: "Telur Ayam Ras", quantity: 100, unit: "kg", price_at_purchase: 28800, subtotal: 2880000 }],
    pickup_pin: "847291",
  },
  {
    purchaseOrderId: "PO-2024-003",
    sppgId: "SMA 70 Jakarta",
    orderDate: new Date(Date.now() - 60 * 3600000).toISOString(),
    // Skenario: Tahap 1 Selesai (QR Hilang), sedang proses Tahap 2 (Multi-Sig)
    financials: { totalAmount: 6750000, escrowStatus: "VALIDATING", signatures: { qc: "SIGNED", admin: "SIGNED", logistik: "SIGNED" } },
    items: [{ item_name: "Daging Sapi Segar", quantity: 50, unit: "kg", price_at_purchase: 135000, subtotal: 6750000 }],
  },
  {
    purchaseOrderId: "PO-2024-004",
    sppgId: "TK Pembina Pusat",
    orderDate: new Date(Date.now() - 48 * 3600000).toISOString(),
    financials: { totalAmount: 1200000, escrowStatus: "ESCROW_HOLD", signatures: { qc: "PENDING", admin: "PENDING", logistik: "PENDING" } },
    items: [{ item_name: "Daging Ayam Ras", quantity: 40, unit: "kg", price_at_purchase: 30000, subtotal: 1200000 }],
    vendor_status: "REJECTED",
  },
  {
    purchaseOrderId: "PO-2024-005",
    sppgId: "SDN 05 Pagi",
    orderDate: new Date(Date.now() - 30 * 60000).toISOString(),
    financials: { totalAmount: 1750000, escrowStatus: "ESCROW_HOLD", signatures: { qc: "PENDING", admin: "PENDING", logistik: "PENDING" } },
    items: [{ item_name: "Ikan Bandeng Tanpa Duri", quantity: 50, unit: "kg", price_at_purchase: 35000, subtotal: 1750000 }],
  },
  {
    purchaseOrderId: "PO-2024-006",
    sppgId: "SDN 03 Menteng",
    orderDate: new Date(Date.now() - 5 * 3600000).toISOString(),
    financials: { totalAmount: 1250000, escrowStatus: "REVISION", signatures: { qc: "REVISION", admin: "PENDING", logistik: "SIGNED" } },
    items: [
      { item_name: "Bayam Hijau Segar", quantity: 50, unit: "ikat", price_at_purchase: 5000, subtotal: 250000 },
      { item_name: "Jeruk Lokal Medan", quantity: 30, unit: "kg", price_at_purchase: 30000, subtotal: 900000 },
    ],
    revision_note: "Ditemukan 2 ikat bayam yang sudah layu dan jeruk ada yang busuk sekitar 3-4 biji. Mohon segera kirimkan penggantian barang yang segar.",
  },
  {
    purchaseOrderId: "PO-2024-007",
    sppgId: "SDN 04 Pagi",
    orderDate: new Date(Date.now() - 2 * 3600000).toISOString(),
    financials: { totalAmount: 3500000, escrowStatus: "REVISION", signatures: { qc: "PENDING", admin: "PENDING", logistik: "REVISION" } },
    items: [{ item_name: "Ikan Kembung Segar", quantity: 100, unit: "kg", price_at_purchase: 35000, subtotal: 3500000 }],
    revision_note: "Logistik: Jumlah karung ikan tidak sesuai. Tertera 10 box, hanya diterima 9 box. Mohon kirimkan 1 box susulan.",
  },
  {
    purchaseOrderId: "PO-2024-008",
    sppgId: "SMPN 5 Jakarta",
    orderDate: new Date(Date.now() - 8 * 3600000).toISOString(),
    financials: { totalAmount: 2200000, escrowStatus: "REVISION", signatures: { qc: "SIGNED", admin: "REVISION", logistik: "SIGNED" } },
    items: [{ item_name: "Tepung Terigu Segitiga", quantity: 200, unit: "kg", price_at_purchase: 11000, subtotal: 2200000 }],
    revision_note: "Admin: Scan faktur pajak tidak terbaca (buram). Mohon unggah ulang dokumen yang lebih jelas/high-res.",
  },
  {
    purchaseOrderId: "PO-2024-009",
    sppgId: "SDN 12 Kebayoran",
    orderDate: new Date(Date.now() - 80 * 3600000).toISOString(),
    financials: { totalAmount: 5400000, escrowStatus: "EXPIRED", signatures: { qc: "PENDING", admin: "PENDING", logistik: "SIGNED" } },
    items: [{ item_name: "Ayam Potong Broiler", quantity: 150, unit: "kg", price_at_purchase: 36000, subtotal: 5400000 }],
  },
];

/* ─── Helpers ─── */
function currency(v: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);
}
function timeAgo(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 3600) return `${Math.floor(s / 60)} mnt lalu`;
  if (s < 86400) return `${Math.floor(s / 3600)} jam lalu`;
  return `${Math.floor(s / 86400)} hari lalu`;
}

/* ─── Deadline Bar (72h Zero-Trust Protocol) ─── */
function DeadlineBar({ orderDate }: { orderDate: string }) {
  const [timeLeft, setTimeLeft] = useState(0);
  const totalDuration = 72 * 3600 * 1000; // 72 jam

  useEffect(() => {
    const calc = () => {
      const start = new Date(orderDate).getTime();
      const end = start + totalDuration;
      const rem = end - Date.now();
      setTimeLeft(Math.max(0, rem));
    };
    calc();
    const iv = setInterval(calc, 1000);
    return () => clearInterval(iv);
  }, [orderDate, totalDuration]);

  if (timeLeft <= 0) {
    return (
      <div className="px-4 py-2 bg-red-50 border-b border-red-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <AlertTriangle size={12} className="text-red-600" />
          <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Waktu Validasi Habis</span>
        </div>
        <span className="text-[10px] font-black text-red-600 uppercase">Kadaluarsa</span>
      </div>
    );
  }

  const pct = (timeLeft / totalDuration) * 100;
  const h = Math.floor(timeLeft / 3600000);
  const m = Math.floor((timeLeft % 3600000) / 60000);
  const s = Math.floor((timeLeft % 60000) / 1000);

  let color = "#10B981"; // Green
  if (pct < 30) color = "#EF4444"; // Red
  else if (pct < 60) color = "#F59E0B"; // Amber

  return (
    <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <Clock size={10} style={{ color }} />
          <span className="text-[9px] font-black uppercase tracking-wider" style={{ color }}>
            Batas Validasi Escrow
          </span>
        </div>
        <span className="text-[10px] font-mono font-bold" style={{ color }}>
          {h}j {m}m {s}s
        </span>
      </div>
      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }} 
          animate={{ width: `${pct}%` }} 
          transition={{ duration: 0.5 }}
          className="h-full" 
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

// Logic moved to @/lib/pesanan.ts
const poTab = getPOTab;

/* ─── QR Code Display ─── */
function QRCodeDisplay({ pin, poId }: { pin: string; poId: string }) {
  const qrData = encodeURIComponent(`BOGA:PICKUP:${poId}:${pin}`);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${qrData}&size=200x200&format=png&margin=12&color=065F46&bgcolor=ffffff`;

  return (
    <div className="rounded-3xl border-2 p-5 flex flex-col items-center gap-3" style={{ borderColor: G, background: G_LIGHT + "60" }}>
      <div className="flex items-center gap-2">
        <ScanLine size={14} style={{ color: G }} />
        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: G }}>Barcode Serah Terima</p>
      </div>

      {/* QR Code Image */}
      <div className="rounded-2xl bg-white p-3 shadow-sm border border-emerald-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrUrl} alt="QR Code Serah Terima" width={160} height={160}
          className="block" />
      </div>

      <div className="text-center space-y-1">
        <p className="text-[11px] font-bold text-slate-600">Scan QR ini untuk konfirmasi serah terima</p>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          Petugas logistik SPPG harus mengarahkan kamera ke kode ini saat penjemputan barang
        </p>
      </div>

      {/* ID Reference */}
      <div className="w-full rounded-xl bg-white border border-emerald-100 px-3 py-2 flex items-center justify-between">
        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Ref. ID</span>
        <span className="text-[10px] font-mono font-bold text-slate-600">{poId}</span>
      </div>
    </div>
  );
}

/* ─── Multi-Sig Badge ─── */
function SigBadge({ label, status }: { label: string; status: "SIGNED" | "PENDING" | "REVISION" }) {
  if (status === "SIGNED") {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-bold border bg-emerald-50 border-emerald-200 text-emerald-700">
        <ShieldCheck size={10} /> {label}
      </div>
    );
  }
  if (status === "REVISION") {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-bold border bg-amber-50 border-amber-200 text-amber-700">
        <AlertTriangle size={10} /> {label}
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-bold border bg-slate-50 border-slate-200 text-slate-400">
      <ShieldAlert size={10} /> {label}
    </div>
  );
}

/* ─── Pesanan Card ─── */
function PesananCard({ po, onAccept, onReject, accepting }: {
  po: PO; onAccept: (id: string) => void; onReject: (id: string) => void; accepting: string | null;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isHandoverDone = po.financials.signatures.logistik === "SIGNED";
  const tab = poTab(po);
  const sigs = po.financials.signatures;
  const sigCount = [sigs.qc, sigs.admin, sigs.logistik].filter(s => s === "SIGNED").length;

  const statusConfig = {
    pending: { label: "Menunggu Konfirmasi", color: "#D97706", bg: "#FEF3C7", icon: Clock },
    scan: { 
      label: po.financials.escrowStatus === "REVISION" ? "Perlu Revisi" : "Proses Distribusi", 
      color: po.financials.escrowStatus === "REVISION" ? "#D97706" : G, 
      bg: po.financials.escrowStatus === "REVISION" ? "#FEF3C7" : G_LIGHT, 
      icon: po.financials.escrowStatus === "REVISION" ? AlertTriangle : RefreshCw 
    },
    expired: { label: "Waktu Habis", color: "#B91C1C", bg: "#FEE2E2", icon: XCircle },
    completed: { label: "Selesai", color: G, bg: G_LIGHT, icon: CheckCircle2 },
    rejected: { label: "Dibatalkan/Ditolak", color: "#DC2626", bg: "#FEE2E2", icon: XCircle },
    all: { label: "", color: "", bg: "", icon: Clock },
  }[tab];

  const Icon = statusConfig.icon;

  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
      className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50">
        <div>
          <p className="text-xs font-extrabold text-slate-700 font-mono">{po.purchaseOrderId}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{po.sppgId} · {timeAgo(po.orderDate)}</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider"
          style={{ background: statusConfig.bg, color: statusConfig.color }}>
          <Icon size={10} />
          {statusConfig.label}
        </div>
      </div>

      {/* Deadline Bar for active distribution orders only — Hide if all signatures are complete */}
      {tab === "scan" && sigCount < 3 && <DeadlineBar orderDate={po.orderDate} />}

      {/* Expired Warning Banner */}
      {po.financials.escrowStatus === "EXPIRED" && (
        <div className="px-4 py-3 bg-red-50 border-b border-red-100">
          <div className="flex items-start gap-2">
            <XCircle size={14} className="text-red-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] font-black text-red-700 uppercase tracking-wider">Protokol Zero-Trust Dipicu</p>
              <p className="text-[9px] text-red-600 leading-relaxed mt-0.5 font-medium">
                Batas waktu validasi 72 jam telah terlampaui. Dana escrow otomatis ditarik kembali ke Kas Negara melalui sistem DOKU. Hubungi pihak SPPG untuk instruksi lebih lanjut.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Items */}
      <div className="px-4 py-3 border-b border-slate-50">
        <motion.div 
          initial={false}
          animate={{ height: "auto" }}
          className="overflow-hidden space-y-2"
        >
          {(isExpanded ? po.items : po.items.slice(0, 2)).map((it, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Package size={12} className="text-slate-300 shrink-0" />
                <p className="text-xs font-semibold text-slate-700">{it.item_name}</p>
              </div>
              <p className="text-xs text-slate-500 shrink-0">{it.quantity} {it.unit}</p>
            </motion.div>
          ))}
        </motion.div>

        {po.items.length > 2 && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-center gap-1 mt-3 py-1 rounded-xl bg-slate-50 text-[10px] font-bold text-slate-500 active:scale-95 transition-all border border-slate-100/50"
          >
            {isExpanded ? (
              <><ChevronUp size={12} /> Sembunyikan Rincian</>
            ) : (
              <><ChevronDown size={12} /> Lihat +{po.items.length - 2} Produk Lainnya</>
            )}
          </button>
        )}
      </div>

      {/* Financials */}
      <div className="px-4 pb-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-slate-400 font-medium">Total Dana Escrow</p>
          <p className="text-sm font-extrabold" style={{ color: G }}>{currency(po.financials.totalAmount)}</p>
        </div>
        <div className="flex items-center gap-1 rounded-xl bg-slate-50 border border-slate-100 px-2 py-1.5">
          <Hash size={10} className="text-slate-400" />
          <p className="text-[10px] font-bold text-slate-500">Escrow Terkunci (DOKU Gateway)</p>
        </div>
      </div>

      {/* ── Step 1: Serah Terima Fisik (Scan QR) ── */}
      {tab === "scan" && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0" 
              style={{ background: isHandoverDone ? "#10B981" : G }}>
              {isHandoverDone ? <Check size={10} /> : "1"}
            </div>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${isHandoverDone ? "text-emerald-600" : "text-slate-600"}`}>
              {isHandoverDone ? "Serah Terima Fisik Selesai" : "Serah Terima Barang"}
            </p>
          </div>
          {!isHandoverDone && (
            <div className="rounded-2xl bg-slate-50 border border-slate-100 px-3 py-2.5">
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Petugas logistik SPPG datang ke lokasi Anda dan <span className="font-bold text-slate-700">scan QR Code</span> di bawah sebagai bukti penerimaan barang secara fisik.
              </p>
            </div>
          )}
        </div>
      )}

      {/* QR Code — Only show if not handed over yet */}
      {tab === "scan" && po.pickup_pin && !isHandoverDone && (
        <div className="px-4 pb-4">
          <QRCodeDisplay pin={po.pickup_pin} poId={po.purchaseOrderId} />
        </div>
      )}

      {/* ── Step 2: Multi-Signature SPPG (setelah barang tiba di dapur) ── */}
      {tab === "scan" && (
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0" 
              style={{ background: sigCount === 3 ? "#10B981" : (po.financials.escrowStatus === "REVISION" ? "#F59E0B" : (po.financials.escrowStatus === "VALIDATING" ? G : "#94A3B8")) }}>
              {sigCount === 3 ? <Check size={10} /> : "2"}
            </div>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${sigCount === 3 ? "text-emerald-600" : (po.financials.escrowStatus === "REVISION" ? "text-amber-600" : (po.financials.escrowStatus === "VALIDATING" ? "text-slate-600" : "text-slate-400"))}`}>
              {sigCount === 3 ? "Validasi Internal Selesai" : "Validasi Internal SPPG"}
            </p>
          </div>
          <div className={`rounded-2xl border px-3 py-3 space-y-2 ${po.financials.escrowStatus === "REVISION" ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-100"}`}>
            {po.financials.escrowStatus === "REVISION" ? (
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={12} className="text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-amber-700 leading-relaxed font-bold">
                    REVISI DIPERLUKAN: QC menemukan ketidaksesuaian pada barang yang diterima.
                  </p>
                </div>
                <div className="bg-white/60 rounded-xl p-2 border border-amber-100">
                  <p className="text-[10px] text-amber-600 italic leading-relaxed">
                    "{po.revision_note}"
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Dilakukan di dapur umum SPPG — 3 staf menandatangani secara digital untuk mencairkan dana escrow ke rekening Anda.
              </p>
            )}
            <div className="flex gap-1.5 pt-1">
              <SigBadge label="Logistik" status={po.financials.signatures.logistik} />
              <SigBadge label="QC" status={po.financials.signatures.qc} />
              <SigBadge label="Admin" status={po.financials.signatures.admin} />
            </div>
            {sigCount === 3 && (
              <div className="mt-1 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 flex items-center gap-2">
                <ShieldCheck size={11} className="text-emerald-600" />
                <p className="text-[10px] font-bold text-emerald-700">Multi-Sig lengkap — Dana escrow siap dicairkan ke rekening Anda!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions — pending only */}
      {tab === "pending" && (
        <div className="px-4 pb-4 grid grid-cols-2 gap-2">
          <button onClick={() => onReject(po.purchaseOrderId)}
            className="h-11 rounded-2xl border-2 border-red-100 bg-red-50 text-xs font-bold text-red-500 flex items-center justify-center gap-1.5 active:scale-[0.97] transition-all">
            <XCircle size={14} /> Tolak
          </button>
          <button onClick={() => onAccept(po.purchaseOrderId)}
            disabled={accepting === po.purchaseOrderId}
            className="h-11 rounded-2xl text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow shadow-emerald-200 active:scale-[0.97] transition-all disabled:opacity-60"
            style={{ background: G }}>
            {accepting === po.purchaseOrderId
              ? <><Loader2 size={13} className="animate-spin" /> Memproses...</>
              : <><CheckCircle2 size={13} /> Terima & Siapkan</>}
          </button>
        </div>
      )}

      {/* Rejected note */}
      {tab === "rejected" && (
        <div className="px-4 pb-4">
          <div className="rounded-2xl bg-red-50 border border-red-100 px-3 py-2.5 flex items-start gap-2">
            <AlertTriangle size={12} className="text-red-400 mt-0.5 shrink-0" />
            <p className="text-[10px] text-red-600 leading-relaxed">
              Pesanan ini telah dibatalkan. Dana escrow akan dikembalikan ke Kas Negara dalam 3×24 jam sesuai protokol mitigasi Zero-Trust B.O.G.A.
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ─── Main Page ─── */
export default function VendorPesananPage() {
  const [vendorId, setVendorId] = useState<string>("");
  const [pos, setPos] = useState<PO[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("all");

  useEffect(() => {
    const id = document.cookie.split("; ").find(row => row.startsWith("boga_vendor_id="))?.split("=")[1];
    if (id) {
      setVendorId(id);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchPOs = useCallback(async () => {
    if (!vendorId) return;
    logger.info('VendorPesanan', 'Memulai pengambilan data pesanan SPPG...', { vendorId });
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/spk/vendor/${vendorId}`);
      const json = await res.json();
      if (json.status === "success") {
        setPos(json.data || []);
        logger.debug('VendorPesanan', 'Data pesanan berhasil dimuat dari server', { count: json.data?.length });
      }
    } catch (error) { 
      logger.error('VendorPesanan', 'Gagal mengambil data pesanan', error);
      toast.error("Gagal sinkronisasi data pesanan.");
    }
    finally { setLoading(false); }
  }, [vendorId]);

  useEffect(() => { fetchPOs(); }, [fetchPOs]);

  const handleAccept = async (poId: string) => {
    logger.info('VendorPesanan', 'Vendor mengonfirmasi pesanan (Accept)', { poId });
    setAccepting(poId);
    try {
      const res = await fetch(`${API}/api/spk/${poId}/ready-for-pickup`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId }),
      });
      const json = await res.json();
      if (json.status === "success") {
        logger.info('VendorPesanan', 'Pesanan berhasil dikonfirmasi ke server', { poId, pin: json.data.pickupPin });
        toast.success("Pesanan dikonfirmasi! PIN serah terima telah dibuat.");
        setPos(prev => prev.map(p =>
          p.purchaseOrderId === poId
            ? { ...p, financials: { ...p.financials, escrowStatus: "READY_FOR_PICKUP" }, pickup_pin: json.data.pickupPin }
            : p
        ));
      } else {
        logger.error('VendorPesanan', 'Server menolak konfirmasi pesanan', json.message);
        toast.error(json.message);
      }
    } catch (error) {
      logger.warn('VendorPesanan', 'Gagal koneksi ke server, menggunakan mode simulasi (Demo)', error);
      const pin = String(Math.floor(100000 + Math.random() * 900000));
      setPos(prev => prev.map(p =>
        p.purchaseOrderId === poId
          ? { ...p, financials: { ...p.financials, escrowStatus: "READY_FOR_PICKUP" }, pickup_pin: pin }
          : p
      ));
      toast.success("(Demo) Pesanan diterima! PIN: " + pin);
    } finally { setAccepting(null); }
  };

  const handleReject = (poId: string) => {
    logger.warn('VendorPesanan', 'Vendor memicu pembatalan pesanan (Reject)', { poId });
    toast("Tolak pesanan ini?", {
      action: {
        label: "Ya, Tolak",
        onClick: async () => {
          logger.info('VendorPesanan', 'Mengirim permintaan penolakan ke server...', { poId });
          try {
            const res = await fetch(`${API}/api/spk/${poId}/reject`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ vendorId }),
            });
            const json = await res.json();
            if (json.status === "success") {
              logger.info('VendorPesanan', 'Pesanan resmi ditolak oleh vendor', { poId });
              setPos(prev => prev.map(p =>
                p.purchaseOrderId === poId ? { ...p, vendor_status: "REJECTED" } : p
              ));
              toast.success("Pesanan berhasil ditolak.");
            } else {
              logger.error('VendorPesanan', 'Gagal menolak pesanan di server', json.message);
              toast.error(json.message);
            }
          } catch (error) {
            logger.error('VendorPesanan', 'Koneksi gagal saat menolak pesanan', error);
            toast.error("Gagal koneksi ke server.");
          }
        },
      },
    });
  };

  const tabs: { key: Tab; label: string; color?: string }[] = [
    { key: "all", label: "Semua" },
    { key: "pending", label: "Menunggu", color: "#D97706" },
    { key: "scan", label: "Proses", color: "#3B82F6" },
    { key: "completed", label: "Selesai", color: G },
    { key: "expired", label: "Telat", color: "#B91C1C" },
    { key: "rejected", label: "Batal", color: "#DC2626" },
  ];

  const counts = {
    all: pos.length,
    pending: pos.filter(p => poTab(p) === "pending").length,
    scan: pos.filter(p => poTab(p) === "scan").length,
    completed: pos.filter(p => poTab(p) === "completed").length,
    expired: pos.filter(p => poTab(p) === "expired").length,
    rejected: pos.filter(p => poTab(p) === "rejected").length,
  };

  const filtered = activeTab === "all" ? pos : pos.filter(p => poTab(p) === activeTab);

  return (
    <div className="min-h-svh bg-slate-50" data-role="vendor">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-base font-extrabold text-slate-800 leading-none">Manajemen Pesanan & Logistik</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">{counts.pending} pesanan baru memerlukan validasi Anda</p>
          </div>
          <button onClick={fetchPOs} disabled={loading}
            className="w-9 h-9 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 active:scale-[0.95] transition-all">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-2xl mx-auto px-4 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
          {tabs.map(t => {
            const active = activeTab === t.key;
            return (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-1.5 shrink-0 h-8 px-3 rounded-full text-xs font-bold transition-all border ${active ? "text-white border-transparent shadow" : "bg-white border-slate-200 text-slate-500"}`}
                style={active ? { background: t.color ?? "#1E293B" } : {}}>
                {t.label}
                {counts[t.key] > 0 && (
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${active ? "bg-white/30" : "bg-slate-100"}`}>
                    {counts[t.key]}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4 pb-24">
        {/* Vendor ID */}
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
          <Tag size={13} className="text-slate-300 shrink-0" />
          <Input value={vendorId} onChange={e => setVendorId(e.target.value)}
            placeholder="Vendor ID..." onBlur={fetchPOs}
            className="border-0 h-7 p-0 text-xs font-mono text-slate-500 bg-transparent focus-visible:ring-0 shadow-none" />
          <button onClick={fetchPOs} className="text-[10px] font-bold px-2 py-1 rounded-lg shrink-0"
            style={{ color: G, background: G_LIGHT }}>Muat</button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Total Transaksi", value: counts.all, color: "#1E293B" },
            { label: "Menunggu Validasi", value: counts.pending, color: "#D97706" },
            { label: "Siap Distribusi", value: counts.scan, color: G },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-3 shadow-sm">
              <p className="text-base font-extrabold leading-none" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[10px] text-slate-400 mt-1 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => <div key={i} className="h-48 rounded-3xl bg-slate-100 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center px-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: G_LIGHT }}>
              <CheckCircle2 size={24} style={{ color: G }} />
            </div>
            <p className="text-sm font-bold text-slate-600">Tidak Ada Pesanan</p>
            <p className="text-xs text-slate-400 mt-1">Belum ada pesanan di kategori ini.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filtered.map(po => (
                <PesananCard key={po.purchaseOrderId} po={po}
                  onAccept={handleAccept} onReject={handleReject} accepting={accepting} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
