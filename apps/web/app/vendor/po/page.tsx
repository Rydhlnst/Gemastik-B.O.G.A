"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  CheckCircle2, XCircle, Clock, Tag, Loader2,
  ShieldCheck, ShieldAlert, Hash, Package,
  ChevronRight, RefreshCw, AlertTriangle,
} from "lucide-react";
import { Input } from "@/components/ui/input";

/* ─── Constants ─── */
const API = "http://localhost:3001";
const G = "#065F46";
const G_LIGHT = "#D1FAE5";

/* ─── Types ─── */
interface POItem { item_name: string; quantity: number; unit: string; price_at_purchase: number; subtotal: number; }
interface Signatures { qc: "SIGNED" | "PENDING"; admin: "SIGNED" | "PENDING"; logistik: "SIGNED" | "PENDING"; }
interface PO {
  purchaseOrderId: string;
  sppgId: string;
  orderDate: string;
  financials: { totalAmount: number; escrowStatus: string; signatures: Signatures };
  items: POItem[];
  // frontend-added
  pickup_pin?: string;
  vendor_status?: "REJECTED";
}

/* ─── Mock demo data ─── */
const MOCK_POS: PO[] = [
  {
    purchaseOrderId: "PO-DEMO-001",
    sppgId: "SPPG-BANDUNG-01",
    orderDate: new Date(Date.now() - 2 * 3600000).toISOString(),
    financials: { totalAmount: 4500000, escrowStatus: "ESCROW_HOLD", signatures: { qc: "PENDING", admin: "PENDING", logistik: "PENDING" } },
    items: [{ item_name: "Beras Premium Cap Ramos", quantity: 250, unit: "kg", price_at_purchase: 18000, subtotal: 4500000 }],
  },
  {
    purchaseOrderId: "PO-DEMO-002",
    sppgId: "SPPG-CIMAHI-03",
    orderDate: new Date(Date.now() - 5 * 3600000).toISOString(),
    financials: { totalAmount: 2880000, escrowStatus: "READY_FOR_PICKUP", signatures: { qc: "SIGNED", admin: "PENDING", logistik: "PENDING" } },
    items: [{ item_name: "Telur Ayam Ras", quantity: 100, unit: "kg", price_at_purchase: 28800, subtotal: 2880000 }],
    pickup_pin: "847291",
  },
  {
    purchaseOrderId: "PO-DEMO-003",
    sppgId: "SPPG-LEMBANG-02",
    orderDate: new Date(Date.now() - 24 * 3600000).toISOString(),
    financials: { totalAmount: 1200000, escrowStatus: "ESCROW_HOLD", signatures: { qc: "PENDING", admin: "PENDING", logistik: "PENDING" } },
    items: [{ item_name: "Daging Ayam", quantity: 40, unit: "kg", price_at_purchase: 30000, subtotal: 1200000 }],
    vendor_status: "REJECTED",
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

type Tab = "all" | "pending" | "scan" | "rejected";

function poTab(po: PO): Tab {
  if (po.vendor_status === "REJECTED") return "rejected";
  if (po.financials.escrowStatus === "READY_FOR_PICKUP") return "scan";
  return "pending";
}

/* ─── PIN Display ─── */
function PinDisplay({ pin }: { pin: string }) {
  return (
    <div className="rounded-3xl border-2 border-dashed p-5 flex flex-col items-center gap-3" style={{ borderColor: G }}>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">PIN Serah Terima</p>
      <div className="flex gap-2">
        {pin.split("").map((d, i) => (
          <div key={i} className="w-10 h-12 rounded-2xl flex items-center justify-center text-xl font-black shadow-sm border" style={{ background: G_LIGHT, color: G, borderColor: "#A7F3D0" }}>
            {d}
          </div>
        ))}
      </div>
      <p className="text-[10px] text-slate-400 text-center leading-relaxed">
        Tunjukkan PIN ini kepada petugas logistik SPPG saat penjemputan barang
      </p>
    </div>
  );
}

/* ─── Multi-Sig Badge ─── */
function SigBadge({ label, status }: { label: string; status: "SIGNED" | "PENDING" }) {
  const signed = status === "SIGNED";
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-bold border ${signed ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
      {signed ? <ShieldCheck size={10} /> : <ShieldAlert size={10} />}
      {label}
    </div>
  );
}

/* ─── PO Card ─── */
function POCard({ po, onAccept, onReject, accepting }: {
  po: PO;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  accepting: string | null;
}) {
  const tab = poTab(po);
  const sigs = po.financials.signatures;
  const sigCount = [sigs.qc, sigs.admin, sigs.logistik].filter(s => s === "SIGNED").length;

  const statusConfig = {
    pending: { label: "Menunggu Keputusan", color: "#D97706", bg: "#FEF3C7", icon: Clock },
    scan: { label: "Menunggu Scan SPPG", color: G, bg: G_LIGHT, icon: CheckCircle2 },
    rejected: { label: "Ditolak", color: "#DC2626", bg: "#FEE2E2", icon: XCircle },
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

      {/* Items */}
      <div className="px-4 py-3 space-y-1.5">
        {po.items.map((it, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package size={12} className="text-slate-300 shrink-0" />
              <p className="text-xs font-semibold text-slate-700">{it.item_name}</p>
            </div>
            <p className="text-xs text-slate-500 shrink-0">{it.quantity} {it.unit}</p>
          </div>
        ))}
      </div>

      {/* Financials */}
      <div className="px-4 pb-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-slate-400 font-medium">Total Dana Escrow</p>
          <p className="text-sm font-extrabold" style={{ color: G }}>{currency(po.financials.totalAmount)}</p>
        </div>
        <div className="flex items-center gap-1 rounded-xl bg-slate-50 border border-slate-100 px-2 py-1.5">
          <Hash size={10} className="text-slate-400" />
          <p className="text-[10px] font-bold text-slate-500">Escrow Terkunci</p>
        </div>
      </div>

      {/* Multi-Sig Progress — only for scan state */}
      {tab === "scan" && (
        <div className="px-4 pb-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Multi-Signature ({sigCount}/3)</p>
          <div className="flex gap-1.5">
            <SigBadge label="QC" status={sigs.qc} />
            <SigBadge label="Admin" status={sigs.admin} />
            <SigBadge label="Logistik" status={sigs.logistik} />
          </div>
          {sigCount === 3 && (
            <div className="mt-2 rounded-2xl bg-emerald-50 border border-emerald-200 px-3 py-2 flex items-center gap-2">
              <ShieldCheck size={12} className="text-emerald-600" />
              <p className="text-[10px] font-bold text-emerald-700">Multi-Sig Lengkap — Dana siap dicairkan ke rekening Anda!</p>
            </div>
          )}
        </div>
      )}

      {/* PIN Display */}
      {tab === "scan" && po.pickup_pin && (
        <div className="px-4 pb-4">
          <PinDisplay pin={po.pickup_pin} />
        </div>
      )}

      {/* Actions — only for pending */}
      {tab === "pending" && (
        <div className="px-4 pb-4 grid grid-cols-2 gap-2">
          <button onClick={() => onReject(po.purchaseOrderId)}
            className="h-11 rounded-2xl border-2 border-red-100 bg-red-50 text-xs font-bold text-red-500 flex items-center justify-center gap-1.5 active:scale-[0.97] transition-all">
            <XCircle size={14} /> Tolak PO
          </button>
          <button onClick={() => onAccept(po.purchaseOrderId)}
            disabled={accepting === po.purchaseOrderId}
            className="h-11 rounded-2xl text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow shadow-emerald-200 active:scale-[0.97] transition-all disabled:opacity-60"
            style={{ background: G }}>
            {accepting === po.purchaseOrderId
              ? <><Loader2 size={13} className="animate-spin" /> Memproses...</>
              : <><CheckCircle2 size={13} /> Konfirmasi Siap</>}
          </button>
        </div>
      )}

      {/* Rejected note */}
      {tab === "rejected" && (
        <div className="px-4 pb-4">
          <div className="rounded-2xl bg-red-50 border border-red-100 px-3 py-2.5 flex items-start gap-2">
            <AlertTriangle size={12} className="text-red-400 mt-0.5 shrink-0" />
            <p className="text-[10px] text-red-600 leading-relaxed">
              PO ini telah Anda tolak. Dana escrow DOKU akan dikembalikan ke kas SPPG dalam 3×24 jam.
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ─── Main Page ─── */
export default function VendorPOPage() {
  const [vendorId, setVendorId] = useState("ACC-VEN-5E1FD92B");
  const [pos, setPos] = useState<PO[]>(MOCK_POS);
  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("all");

  const fetchPOs = useCallback(async () => {
    if (!vendorId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/spk/vendor/${vendorId}`);
      const json = await res.json();
      if (json.status === "success" && json.data.length > 0) setPos(json.data);
      else setPos(MOCK_POS); // fallback demo
    } catch { setPos(MOCK_POS); }
    finally { setLoading(false); }
  }, [vendorId]);

  useEffect(() => { fetchPOs(); }, [fetchPOs]);

  const handleAccept = async (poId: string) => {
    setAccepting(poId);
    try {
      const res = await fetch(`${API}/api/spk/${poId}/ready-for-pickup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId }),
      });
      const json = await res.json();
      if (json.status === "success") {
        toast.success("Barang dikonfirmasi siap! PIN serah terima telah dibuat.");
        setPos(prev => prev.map(p =>
          p.purchaseOrderId === poId
            ? { ...p, financials: { ...p.financials, escrowStatus: "READY_FOR_PICKUP" }, pickup_pin: json.data.pickupPin }
            : p
        ));
      } else toast.error(json.message);
    } catch {
      // demo fallback
      const pin = String(Math.floor(100000 + Math.random() * 900000));
      setPos(prev => prev.map(p =>
        p.purchaseOrderId === poId
          ? { ...p, financials: { ...p.financials, escrowStatus: "READY_FOR_PICKUP" }, pickup_pin: pin }
          : p
      ));
      toast.success("(Demo) Barang dikonfirmasi! PIN: " + pin);
    } finally { setAccepting(null); }
  };

  const handleReject = (poId: string) => {
    toast("Tolak PO ini?", {
      action: {
        label: "Ya, Tolak",
        onClick: () => {
          setPos(prev => prev.map(p =>
            p.purchaseOrderId === poId ? { ...p, vendor_status: "REJECTED" } : p
          ));
          toast.success("PO berhasil ditolak.");
        },
      },
    });
  };

  const tabs: { key: Tab; label: string; color?: string }[] = [
    { key: "all", label: "Semua" },
    { key: "pending", label: "Menunggu", color: "#D97706" },
    { key: "scan", label: "Menunggu Scan", color: G },
    { key: "rejected", label: "Ditolak", color: "#DC2626" },
  ];

  const filtered = activeTab === "all" ? pos : pos.filter(p => poTab(p) === activeTab);
  const counts = {
    all: pos.length,
    pending: pos.filter(p => poTab(p) === "pending").length,
    scan: pos.filter(p => poTab(p) === "scan").length,
    rejected: pos.filter(p => poTab(p) === "rejected").length,
  };

  return (
    <div className="min-h-svh bg-slate-50" data-role="vendor">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-base font-extrabold text-slate-800 leading-none">Purchase Order</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">{counts.pending} menunggu keputusan Anda</p>
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
            { label: "Masuk", value: counts.all, color: "#1E293B" },
            { label: "Menunggu", value: counts.pending, color: "#D97706" },
            { label: "Aktif Scan", value: counts.scan, color: G },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-3 shadow-sm">
              <p className="text-base font-extrabold leading-none" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[10px] text-slate-400 mt-1 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* PO List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => <div key={i} className="h-48 rounded-3xl bg-slate-100 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center px-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: G_LIGHT }}>
              <CheckCircle2 size={24} style={{ color: G }} />
            </div>
            <p className="text-sm font-bold text-slate-600">Tidak Ada PO</p>
            <p className="text-xs text-slate-400 mt-1">Belum ada Purchase Order di kategori ini.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filtered.map(po => (
                <POCard key={po.purchaseOrderId} po={po}
                  onAccept={handleAccept} onReject={handleReject} accepting={accepting} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
