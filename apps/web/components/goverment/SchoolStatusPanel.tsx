"use client"

import { useMemo, memo, useState, useDeferredValue, Fragment } from "react"
import { useRouter } from "next/navigation"
import { useDashboardFilter, useSchoolSearch } from "./DashboardFilterContext"
import {
  getSchoolTableData,
  getActivityLog,
  type SchoolTableRow,
  type SchoolDeliveryStatus,
  type ActivityLogItem,
} from "@/lib/mbgdummydata"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import {
  MapPin, AlertCircle, ChevronRight, CheckCircle2,
  Clock, HelpCircle, ArrowRight, Package, RefreshCw, Info, Check, ChevronLeft,
} from "lucide-react"

// ── Status config with shape + color (WCAG) ───────────────────────────────────

const STATUS_CFG: Record<SchoolDeliveryStatus, {
  label: string; dotClass: string; textClass: string; shape: string; bgClass: string; borderClass: string
}> = {
  sengketa:   { label: "Sengketa",   dotClass: "bg-orange-500 animate-pulse", textClass: "text-orange-700", shape: "✕", bgClass: "bg-orange-50",  borderClass: "border-orange-200" },
  gagal:      { label: "Gagal",      dotClass: "bg-red-500",                  textClass: "text-red-700",    shape: "✕", bgClass: "bg-red-50",     borderClass: "border-red-200" },
  on_transit: { label: "On-Transit", dotClass: "bg-amber-400",                textClass: "text-amber-700",  shape: "▲", bgClass: "bg-amber-50",   borderClass: "border-amber-200" },
  pending:    { label: "Pending",    dotClass: "bg-slate-400",                textClass: "text-slate-600",  shape: "—", bgClass: "bg-slate-50",   borderClass: "border-slate-200" },
  terkirim:   { label: "Terkirim",   dotClass: "bg-emerald-500",              textClass: "text-emerald-700",shape: "●", bgClass: "bg-emerald-50", borderClass: "border-emerald-200" },
}

// ── Activity type config ──────────────────────────────────────────────────────

const ACTIVITY_CFG: Record<ActivityLogItem["type"], { color: string; shape: string; needsAction: boolean }> = {
  success: { color: "#10b981", shape: "●", needsAction: false },
  warning: { color: "#f59e0b", shape: "▲", needsAction: true },
  refund:  { color: "#6366f1", shape: "◆", needsAction: false },
  info:    { color: "#06b6d4", shape: "—", needsAction: false },
}

// ── Porsi Mini-Bar ────────────────────────────────────────────────────────────

function PorsiBar({ received, target }: { received: number; target: number }) {
  const pct = target > 0 ? Math.min((received / target) * 100, 100) : 0
  const ok = pct >= 90
  return (
    <div className="flex items-center gap-1.5 min-w-[80px]" aria-label={`${received} dari ${target} porsi diterima`}>
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          className="h-full rounded-full"
          style={{ background: ok ? "#10b981" : pct >= 60 ? "#f59e0b" : "#ef4444" }}
          aria-hidden
        />
      </div>
      <span className="text-[9px] font-black text-slate-500 tabular-nums">{received}</span>
    </div>
  )
}

// ── Ketepatan Pill ──────────────────────────────────────────────────────────

function KetepatanPill({ menit }: { menit: number | null }) {
  if (menit === null) return <span className="text-[9px] text-slate-400">—</span>
  if (menit === 0) return <span className="text-[9px] font-black text-emerald-600">● Tepat</span>
  if (menit < 0)
    return <span className="text-[9px] font-black text-emerald-600">● {Math.abs(menit)} mnt lebih awal</span>
  if (menit <= 15)
    return <span className="text-[9px] font-black text-amber-600">▲ +{menit} mnt</span>
  return <span className="text-[9px] font-black text-red-600">✕ +{menit} mnt terlambat</span>
}

// ── Inline Detail Panel ───────────────────────────────────────────────────────

function DetailPanel({ row, onClose }: { row: SchoolTableRow; onClose: () => void }) {
  const router = useRouter()
  const cfg = STATUS_CFG[row.status]
  const pct = row.porsiTarget > 0 ? Math.round((row.porsiDiterima / row.porsiTarget) * 100) : 0

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <td colSpan={6} className="px-4 pb-3">
        <div className={cn("rounded-xl border p-4 flex flex-col gap-3", cfg.bgClass, cfg.borderClass)}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-black text-slate-700">{row.nama}</p>
              <p className="text-[9px] text-slate-400 mt-0.5">{row.kecamatan}, {row.kota} · Vendor: {row.vendorNama}</p>
            </div>
            <span
              className={cn("text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1", cfg.textClass, cfg.bgClass, "border", cfg.borderClass)}
              aria-label={`Status: ${cfg.label}`}
            >
              {cfg.shape} {cfg.label}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-[8px] text-slate-400 font-bold uppercase">Porsi Diterima</p>
              <p className="text-sm font-black text-slate-800">{row.porsiDiterima.toLocaleString()} <span className="text-[9px] text-slate-400">/ {row.porsiTarget.toLocaleString()}</span></p>
              <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                <div className="h-full rounded-full bg-indigo-400" style={{ width: `${pct}%` }} aria-hidden />
              </div>
            </div>
            <div>
              <p className="text-[8px] text-slate-400 font-bold uppercase">Jam Tiba</p>
              <p className="text-sm font-black text-slate-800">{row.jamTiba}</p>
              <p className="text-[9px] text-slate-400">target {row.jamTarget}</p>
            </div>
            <div>
              <p className="text-[8px] text-slate-400 font-bold uppercase">Selisih</p>
              <KetepatanPill menit={row.selisihMenit} />
            </div>
          </div>

          {row.catatan && (
            <p className="text-[9px] text-slate-500 bg-white/60 rounded-lg px-3 py-2 border border-slate-200">
              ℹ {row.catatan}
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/goverment/pengawasan?school=${row.id}`)}
              aria-label={`Lihat ${row.nama} di peta pengawasan`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-[9px] font-black hover:bg-indigo-700 transition-all"
            >
              <MapPin className="w-3 h-3" aria-hidden /> Lihat di Peta
            </button>
            {row.status === "sengketa" && (
              <button
                onClick={() => router.push(`/goverment/verifikasi?case=${row.id}`)}
                aria-label={`Tangani sengketa ${row.nama}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 text-white text-[9px] font-black hover:bg-orange-600 transition-all animate-pulse"
              >
                <AlertCircle className="w-3 h-3" aria-hidden /> Tangani Sengketa
              </button>
            )}
          </div>
        </div>
      </td>
    </motion.tr>
  )
}

// ── School Table ──────────────────────────────────────────────────────────────

const ROWS_PER_PAGE = 10

function SchoolTable() {
  const { filter } = useDashboardFilter()
  const { query } = useSchoolSearch()
  const deferredQuery = useDeferredValue(query)
  const router = useRouter()

  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [page, setPage] = useState(1)

  const allData = useMemo(
    () => getSchoolTableData(filter.periode, filter.jenjang.length ? filter.jenjang : undefined),
    [filter.periode, filter.jenjang]
  )

  const filtered = useMemo(() => {
    const q = deferredQuery.toLowerCase()
    return allData.filter(
      (r) => !q || r.nama.toLowerCase().includes(q) || r.kecamatan.toLowerCase().includes(q)
    )
  }, [allData, deferredQuery])

  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE)

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <p className="text-[9px] text-slate-400 ml-auto">{filtered.length} sekolah ditemukan</p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full" aria-label="Tabel status sekolah MBG">
          <thead>
            <tr className="border-b border-slate-100">
              {["Sekolah", "Jenjang", "Status", "Porsi", "Ketepatan", "Aksi"].map((h) => (
                <th key={h} className="px-3 py-2 text-[8px] font-black uppercase tracking-widest text-slate-400 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-[11px] text-slate-400">
                  Tidak ada data sekolah
                </td>
              </tr>
            )}
            {paginated.map((row) => {
              const cfg = STATUS_CFG[row.status]
              const isExpanded = expandedId === row.id
              return (
                <Fragment key={row.id}>
                  <tr
                    className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors"
                  >
                    {/* Nama — klik untuk expand */}
                    <td className="px-3 py-2.5">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : row.id)}
                        aria-expanded={isExpanded}
                        aria-controls={`detail-${row.id}`}
                        className="text-[11px] font-bold text-slate-700 hover:text-indigo-600 transition-colors text-left flex items-center gap-1"
                      >
                        <ChevronRight
                          className={cn("w-3 h-3 text-slate-300 transition-transform shrink-0", isExpanded && "rotate-90")}
                          aria-hidden
                        />
                        {row.nama}
                      </button>
                    </td>
                    {/* Jenjang */}
                    <td className="px-3 py-2.5">
                      <span className={cn(
                        "text-[9px] font-black px-1.5 py-0.5 rounded-md",
                        row.jenjang === "SD" ? "bg-rose-100 text-rose-700" :
                        row.jenjang === "SMP" ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-700"
                      )}>
                        {row.jenjang}
                      </span>
                    </td>
                    {/* Status — shape + color */}
                    <td className="px-3 py-2.5">
                      <span className={cn("text-[9px] font-black flex items-center gap-1", cfg.textClass)}>
                        <span className={cn("w-2 h-2 rounded-full inline-block", cfg.dotClass)} aria-hidden />
                        {cfg.shape} {cfg.label}
                      </span>
                    </td>
                    {/* Porsi mini-bar */}
                    <td className="px-3 py-2.5">
                      <PorsiBar received={row.porsiDiterima} target={row.porsiTarget} />
                    </td>
                    {/* Ketepatan */}
                    <td className="px-3 py-2.5">
                      <KetepatanPill menit={row.selisihMenit} />
                    </td>
                    {/* Aksi */}
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => router.push(`/goverment/pengawasan?school=${row.id}`)}
                          aria-label={`Lihat ${row.nama} di peta`}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                        >
                          <MapPin className="w-3.5 h-3.5" aria-hidden />
                        </button>
                        {row.status === "sengketa" && (
                          <button
                            onClick={() => router.push(`/goverment/verifikasi?case=${row.id}`)}
                            aria-label={`Tangani sengketa ${row.nama}`}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 transition-all animate-pulse"
                          >
                            <AlertCircle className="w-3.5 h-3.5" aria-hidden />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {/* Inline Detail Panel */}
                  <AnimatePresence>
                    {isExpanded && (
                      <DetailPanel key={`detail-${row.id}`} row={row} onClose={() => setExpandedId(null)} />
                    )}
                  </AnimatePresence>
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="Halaman sebelumnya"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 transition-all"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden />
          </button>
          <span className="text-[10px] font-black text-slate-500">{page} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            aria-label="Halaman berikutnya"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 transition-all"
          >
            <ChevronRight className="w-4 h-4" aria-hidden />
          </button>
        </div>
      )}
    </div>
  )
}

// ── Activity Log ──────────────────────────────────────────────────────────────

const ACT_PAGE = 10

function ActivityLog() {
  const router = useRouter()
  const logs = useMemo(() => getActivityLog(), [])
  const [page, setPage] = useState(1)
  const paginated = logs.slice((page - 1) * ACT_PAGE, page * ACT_PAGE)
  const totalPages = Math.ceil(logs.length / ACT_PAGE)

  return (
    <div className="flex flex-col gap-1" role="feed" aria-label="Log aktivitas sistem">
      {paginated.map((item) => {
        const cfg = ACTIVITY_CFG[item.type]
        return (
          <button
            key={item.id}
            onClick={() => router.push(item.href)}
            aria-label={`${item.message} — ${item.timeLabel}. Klik untuk lihat detail`}
            className="flex items-start gap-2 text-left hover:bg-slate-50 rounded-lg px-2 py-1.5 transition-all group"
          >
            {/* Timeline dot + connector */}
            <div className="flex flex-col items-center shrink-0 mt-0.5">
              <span
                className="text-[11px] leading-none"
                style={{ color: cfg.color }}
                aria-hidden
              >
                {cfg.shape}
              </span>
              {cfg.needsAction && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-0.5" aria-label="Butuh tindakan" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-slate-700 leading-snug group-hover:text-indigo-600 transition-colors">
                {item.message}
              </p>
              <p className="text-[8px] text-slate-400 mt-0.5">{item.timeLabel}</p>
            </div>
            <ArrowRight className="w-3 h-3 text-slate-200 group-hover:text-indigo-400 transition-colors shrink-0 mt-1" aria-hidden />
          </button>
        )
      })}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="Halaman log sebelumnya"
            className="text-[9px] text-slate-400 hover:text-slate-700 disabled:opacity-30"
          >
            ← Lama
          </button>
          <span className="text-[9px] text-slate-400">{page}/{totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            aria-label="Halaman log berikutnya"
            className="text-[9px] text-slate-400 hover:text-slate-700 disabled:opacity-30"
          >
            Baru →
          </button>
        </div>
      )}
    </div>
  )
}

// ── Main Panel ────────────────────────────────────────────────────────────────

export function SchoolStatusPanel() {
  const { query, setQuery } = useSchoolSearch()
  const [tab, setTab] = useState<"sekolah" | "log">("sekolah")

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
          {tab === "sekolah" ? "Status Sekolah MBG" : "Log Aktivitas Sistem"}
        </p>
        <div className="flex items-center gap-2">
          {tab === "sekolah" && (
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari sekolah..."
              aria-label="Cari sekolah"
              className="text-[10px] px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-indigo-300 w-40"
            />
          )}
          <div className="flex rounded-xl bg-slate-100 p-0.5">
            {(["sekolah", "log"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                aria-pressed={tab === t}
                className={cn(
                  "px-3 py-1 text-[9px] font-black rounded-lg transition-all capitalize",
                  tab === t ? "bg-white text-slate-700 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                {t === "sekolah" ? "Sekolah" : "Log"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      {tab === "sekolah" ? (
        <SchoolTable />
      ) : (
        <ActivityLog />
      )}
    </div>
  )
}
