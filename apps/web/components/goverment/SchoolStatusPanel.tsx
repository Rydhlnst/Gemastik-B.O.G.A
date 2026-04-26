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
import { Input } from "@/components/ui/input"
import {
  MapPin, AlertCircle, ChevronRight, CheckCircle2,
  Clock, HelpCircle, ArrowRight, Package, RefreshCw, Info, Check, ChevronLeft,
} from "lucide-react"

// ── Status config with shape + color (WCAG) ───────────────────────────────────

const STATUS_CFG: Record<SchoolDeliveryStatus, {
  label: string; dotClass: string; textClass: string; shape: string; bgClass: string; borderClass: string
}> = {
  sengketa:   { label: "Sengketa",   dotClass: "bg-status-warning animate-pulse", textClass: "text-status-warning", shape: "✕", bgClass: "bg-status-warning-bg",  borderClass: "border-status-warning/25" },
  gagal:      { label: "Gagal",      dotClass: "bg-status-danger",               textClass: "text-status-danger",  shape: "✕", bgClass: "bg-status-danger-bg",   borderClass: "border-status-danger/25" },
  on_transit: { label: "On-Transit", dotClass: "bg-status-info",                 textClass: "text-status-info",    shape: "▲", bgClass: "bg-status-info-bg",     borderClass: "border-status-info/25" },
  pending:    { label: "Pending",    dotClass: "bg-status-pending",              textClass: "text-status-pending", shape: "—", bgClass: "bg-status-pending-bg",  borderClass: "border-status-pending/25" },
  terkirim:   { label: "Terkirim",   dotClass: "bg-status-success",              textClass: "text-status-success", shape: "●", bgClass: "bg-status-success-bg",  borderClass: "border-status-success/25" },
}

// ── Activity type config ──────────────────────────────────────────────────────

const ACTIVITY_CFG: Record<ActivityLogItem["type"], { color: string; shape: string; needsAction: boolean }> = {
  success: { color: "hsl(var(--status-success))", shape: "●", needsAction: false },
  warning: { color: "hsl(var(--status-warning))", shape: "▲", needsAction: true },
  refund:  { color: "hsl(var(--role-primary))", shape: "◆", needsAction: false },
  info:    { color: "hsl(var(--status-info))", shape: "—", needsAction: false },
}

// ── Porsi Mini-Bar ────────────────────────────────────────────────────────────

function PorsiBar({ received, target }: { received: number; target: number }) {
  const pct = target > 0 ? Math.min((received / target) * 100, 100) : 0
  const ok = pct >= 90
  return (
    <div className="flex items-center gap-1.5 min-w-[80px]" aria-label={`${received} dari ${target} porsi diterima`}>
      <div className="flex-1 h-1.5 bg-muted/30 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          className="h-full rounded-full"
          style={{
            background: ok
              ? "hsl(var(--status-success))"
              : pct >= 60
              ? "hsl(var(--status-warning))"
              : "hsl(var(--status-danger))",
          }}
          aria-hidden
        />
      </div>
      <span className="text-xs font-semibold text-muted-foreground tabular-nums">{received}</span>
    </div>
  )
}

// ── Ketepatan Pill ──────────────────────────────────────────────────────────

function KetepatanPill({ menit }: { menit: number | null }) {
  if (menit === null) return <span className="text-xs text-muted-foreground">—</span>
  if (menit === 0) return <span className="text-xs font-semibold text-status-success">● Tepat</span>
  if (menit < 0)
    return <span className="text-xs font-semibold text-status-success">● {Math.abs(menit)} mnt lebih awal</span>
  if (menit <= 15)
    return <span className="text-xs font-semibold text-status-warning">▲ +{menit} mnt</span>
  return <span className="text-xs font-semibold text-status-danger">✕ +{menit} mnt terlambat</span>
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
        <div className={cn("rounded-[var(--radius-lg)] border p-4 flex flex-col gap-3", cfg.bgClass, cfg.borderClass)}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-foreground">{row.nama}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{row.kecamatan}, {row.kota} · Vendor: {row.vendorNama}</p>
            </div>
            <span
              className={cn("text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1", cfg.textClass, cfg.bgClass, "border", cfg.borderClass)}
              aria-label={`Status: ${cfg.label}`}
            >
              {cfg.shape} {cfg.label}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">Porsi Diterima</p>
              <p className="text-sm font-semibold text-foreground tabular-nums">
                {row.porsiDiterima.toLocaleString()} <span className="text-xs text-muted-foreground">/ {row.porsiTarget.toLocaleString()}</span>
              </p>
              <div className="w-full h-1.5 bg-muted/30 rounded-full mt-1 overflow-hidden">
                <div className="h-full rounded-full bg-role-primary" style={{ width: `${pct}%` }} aria-hidden />
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">Jam Tiba</p>
              <p className="text-sm font-semibold text-foreground tabular-nums">{row.jamTiba}</p>
              <p className="text-xs text-muted-foreground">target {row.jamTarget}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">Selisih</p>
              <KetepatanPill menit={row.selisihMenit} />
            </div>
          </div>

          {row.catatan && (
            <p className="text-xs text-muted-foreground bg-surface/70 rounded-[var(--radius-md)] px-3 py-2 border border-border">
              ℹ {row.catatan}
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/goverment/pengawasan?school=${row.id}`)}
              aria-label={`Lihat ${row.nama} di peta pengawasan`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-md)] bg-role-primary text-white text-xs font-semibold hover:bg-role-primary-hover transition-colors"
            >
              <MapPin className="w-4 h-4" aria-hidden /> Lihat di Peta
            </button>
            {row.status === "sengketa" && (
              <button
                onClick={() => router.push(`/goverment/verifikasi?case=${row.id}`)}
                aria-label={`Tangani sengketa ${row.nama}`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-md)] bg-status-warning text-white text-xs font-semibold hover:opacity-90 transition-colors"
              >
                <AlertCircle className="w-4 h-4" aria-hidden /> Tangani Sengketa
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
        <p className="text-xs text-muted-foreground ml-auto">{filtered.length} sekolah ditemukan</p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-border">
        <table className="w-full" aria-label="Tabel status sekolah MBG">
          <thead>
            <tr className="border-b border-border bg-surface-raised">
              {["Sekolah", "Jenjang", "Status", "Porsi", "Ketepatan", "Aksi"].map((h) => (
                <th key={h} className="px-3 py-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  Tidak ada data sekolah
                </td>
              </tr>
            )}
            {paginated.map((row) => {
              const cfg = STATUS_CFG[row.status]
              const isExpanded = expandedId === row.id
              return (
                <Fragment key={row.id}>
                  <tr className="border-b border-border hover:bg-muted/20 transition-colors">
                    {/* Nama — klik untuk expand */}
                    <td className="px-3 py-3">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : row.id)}
                        aria-expanded={isExpanded}
                        aria-controls={`detail-${row.id}`}
                        className="text-sm font-semibold text-foreground hover:text-role-primary transition-colors text-left flex items-center gap-1.5"
                      >
                        <ChevronRight
                          className={cn("w-4 h-4 text-muted-foreground transition-transform shrink-0", isExpanded && "rotate-90")}
                          aria-hidden
                        />
                        <span className="truncate">{row.nama}</span>
                      </button>
                    </td>
                    {/* Jenjang */}
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center rounded-full border border-border bg-surface-raised px-2.5 py-0.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                        {row.jenjang}
                      </span>
                    </td>
                    {/* Status — shape + color */}
                    <td className="px-3 py-3">
                      <span className={cn("text-xs font-semibold flex items-center gap-2", cfg.textClass)}>
                        <span className={cn("w-2 h-2 rounded-full inline-block", cfg.dotClass)} aria-hidden />
                        {cfg.shape} {cfg.label}
                      </span>
                    </td>
                    {/* Porsi mini-bar */}
                    <td className="px-3 py-3">
                      <PorsiBar received={row.porsiDiterima} target={row.porsiTarget} />
                    </td>
                    {/* Ketepatan */}
                    <td className="px-3 py-3">
                      <KetepatanPill menit={row.selisihMenit} />
                    </td>
                    {/* Aksi */}
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => router.push(`/goverment/pengawasan?school=${row.id}`)}
                          aria-label={`Lihat ${row.nama} di peta`}
                          className="h-8 w-8 rounded-[var(--radius-md)] flex items-center justify-center text-muted-foreground hover:text-role-primary hover:bg-muted/30 transition-colors"
                        >
                          <MapPin className="w-4 h-4" aria-hidden />
                        </button>
                        {row.status === "sengketa" && (
                          <button
                            onClick={() => router.push(`/goverment/verifikasi?case=${row.id}`)}
                            aria-label={`Tangani sengketa ${row.nama}`}
                            className="h-8 w-8 rounded-[var(--radius-md)] flex items-center justify-center text-status-danger hover:bg-status-danger-bg transition-colors"
                          >
                            <AlertCircle className="w-4 h-4" aria-hidden />
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
            className="w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/30 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden />
          </button>
          <span className="text-xs font-semibold text-muted-foreground tabular-nums">{page} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            aria-label="Halaman berikutnya"
            className="w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/30 disabled:opacity-30 transition-colors"
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
            className="flex items-start gap-2 text-left hover:bg-muted/30 rounded-[var(--radius-md)] px-2 py-1.5 transition-colors group"
          >
            {/* Timeline dot + connector */}
            <div className="flex flex-col items-center shrink-0 mt-0.5">
              <span
                className="text-sm leading-none"
                style={{ color: cfg.color }}
                aria-hidden
              >
                {cfg.shape}
              </span>
              {cfg.needsAction && (
                <span className="w-1.5 h-1.5 rounded-full bg-status-danger mt-0.5" aria-label="Butuh tindakan" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground leading-snug group-hover:text-role-primary transition-colors">
                {item.message}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.timeLabel}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-role-primary transition-colors shrink-0 mt-1" aria-hidden />
          </button>
        )
      })}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="Halaman log sebelumnya"
            className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
          >
            ← Lama
          </button>
          <span className="text-xs text-muted-foreground tabular-nums">{page}/{totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            aria-label="Halaman log berikutnya"
            className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
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
    <div className="bg-surface rounded-[var(--radius-lg)] border border-border p-5 shadow-card">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {tab === "sekolah" ? "Status Sekolah MBG" : "Log Aktivitas Sistem"}
          </p>
          <p className="mt-0.5 text-sm font-semibold text-foreground">
            {tab === "sekolah" ? "Monitoring penerimaan & ketepatan" : "Peristiwa operasional terbaru"}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {tab === "sekolah" && (
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari sekolah..."
              aria-label="Cari sekolah"
              className="h-9 w-44"
            />
          )}
          <div className="flex rounded-[var(--radius-lg)] bg-surface-raised p-0.5 border border-border">
            {(["sekolah", "log"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                aria-pressed={tab === t}
                className={cn(
                  "px-3 py-1 text-xs font-semibold rounded-[var(--radius-md)] transition-colors capitalize",
                  tab === t
                    ? "bg-surface text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
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
