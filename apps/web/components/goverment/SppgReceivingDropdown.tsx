"use client"

import { useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  CheckCircle2,
  ChevronDown,
  Package,
  ShieldCheck,
  Star,
  XCircle,
} from "lucide-react"

import {
  deliveryList,
  sppgList,
  sppgSekolahList,
  vendorList,
  vendorSekolahList,
} from "@/lib/mbgdummydata"
import { cn } from "@/lib/utils"
import { StatusBadge } from "@/components/ui/status-badge"

type ReceiptCheck = "ok" | "warn" | "fail" | "na"

type ReceiptSummary = {
  vendorId: number
  vendorName: string
  sppgName: string
  deliveredCount: number
  lastDeliveryAt: string | null
  checks: {
    barang: ReceiptCheck
    kuantitas: ReceiptCheck
    kualitas: ReceiptCheck
  }
  mismatch: {
    qtyDiff: number
    withNotes: number
  }
}

function checkLabel(check: ReceiptCheck) {
  if (check === "ok") return { label: "Sesuai", icon: CheckCircle2, cls: "text-status-success" }
  if (check === "warn") return { label: "Perlu Tinjau", icon: XCircle, cls: "text-status-warning" }
  if (check === "fail") return { label: "Tidak Sesuai", icon: XCircle, cls: "text-status-danger" }
  return { label: "Belum Ada Data", icon: Package, cls: "text-status-pending" }
}

function overallStatus(summary: ReceiptSummary) {
  const { barang, kuantitas, kualitas } = summary.checks
  if (summary.deliveredCount === 0) return "MENUNGGU"
  if ([barang, kuantitas, kualitas].includes("fail")) return "PERLU_TINJAU"
  if ([barang, kuantitas, kualitas].includes("warn")) return "PERLU_TINJAU"
  return "LULUS"
}

function Pill({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-surface-raised px-3 py-1 text-xs font-medium uppercase tracking-widest text-muted-foreground",
        className
      )}
    >
      {children}
    </span>
  )
}

export function SppgReceivingDropdown() {
  const [expandedKey, setExpandedKey] = useState<string | null>(null)
  const [vendorFilter, setVendorFilter] = useState<string>("")

  const receiptSummaries = useMemo((): ReceiptSummary[] => {
    const summaries: ReceiptSummary[] = []

    for (const sppg of sppgList) {
      const vendor = vendorList.find((v) => v.id === sppg.vendor_id)
      if (!vendor) continue

      const servedSchoolIds = new Set(
        sppgSekolahList.filter((s) => s.sppg_id === sppg.id).map((s) => s.sekolah_id)
      )

      const relations = vendorSekolahList.filter(
        (vs) => servedSchoolIds.has(vs.sekolah_id) && vs.vendor_id === vendor.id
      )

      const deliveries = deliveryList
        .filter((d) => relations.some((r) => r.id === d.vendor_sekolah_id))
        .slice()
        .sort((a, b) => (a.tanggal < b.tanggal ? 1 : -1))

      const delivered = deliveries.filter((d) => d.status === "delivered")
      const deliveredCount = delivered.length

      const qtyDiff = delivered.reduce(
        (acc, d) => acc + Math.max(0, (d.porsi_dikirim ?? 0) - (d.porsi_diterima ?? 0)),
        0
      )
      const withNotes = delivered.filter((d) => Boolean(d.catatan)).length

      const barang: ReceiptCheck = deliveredCount > 0 ? "ok" : "na"
      const kuantitas: ReceiptCheck =
        deliveredCount === 0 ? "na" : qtyDiff > 0 ? "fail" : "ok"
      const kualitas: ReceiptCheck =
        deliveredCount === 0 ? "na" : withNotes > 0 ? "warn" : "ok"

      summaries.push({
        vendorId: vendor.id,
        vendorName: vendor.nama,
        sppgName: sppg.nama,
        deliveredCount,
        lastDeliveryAt: deliveries[0]?.tanggal ?? null,
        checks: { barang, kuantitas, kualitas },
        mismatch: { qtyDiff, withNotes },
      })
    }

    return summaries.sort((a, b) => a.sppgName.localeCompare(b.sppgName))
  }, [])

  const vendorsInUse = useMemo(() => {
    const unique = new Map<number, { id: number; nama: string }>()
    for (const s of receiptSummaries) unique.set(s.vendorId, { id: s.vendorId, nama: s.vendorName })
    return Array.from(unique.values()).sort((a, b) => a.nama.localeCompare(b.nama))
  }, [receiptSummaries])

  const filtered = useMemo(() => {
    if (!vendorFilter) return receiptSummaries
    const id = Number(vendorFilter)
    return receiptSummaries.filter((s) => s.vendorId === id)
  }, [receiptSummaries, vendorFilter])

  const counts = useMemo(() => {
    const base = { total: filtered.length, lulus: 0, tinjau: 0, pending: 0 }
    for (const it of filtered) {
      const status = overallStatus(it)
      if (status === "LULUS") base.lulus += 1
      else if (status === "MENUNGGU") base.pending += 1
      else base.tinjau += 1
    }
    return base
  }, [filtered])

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow-card)]">
      <div className="flex flex-col gap-4 border-b border-border px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-role-accent/15 text-role-badge">
            <ShieldCheck className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Penerimaan SPPG
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-foreground">
              Cek barang, kualitas, dan kuantitas
            </p>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Ringkasan penerimaan berdasarkan vendor yang digunakan SPPG (demo dari data delivery).
              Item dengan catatan atau selisih porsi otomatis ditandai untuk tinjau.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-full border border-border bg-surface-raised px-3 py-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Vendor
            </span>
            <select
              value={vendorFilter}
              onChange={(e) => setVendorFilter(e.target.value)}
              className="h-8 rounded-[var(--radius-md)] border border-border bg-surface px-3 text-sm font-medium text-foreground outline-none transition focus-visible:ring-[3px] focus-visible:ring-ring/35"
              aria-label="Filter vendor"
            >
              <option value="">Semua</option>
              {vendorsInUse.map((v) => (
                <option key={v.id} value={String(v.id)}>
                  {v.nama}
                </option>
              ))}
            </select>
          </div>

          <Pill>
            Total <span className="ml-2 text-foreground">{counts.total}</span>
          </Pill>
          <Pill className="bg-status-warning-bg text-status-warning border-status-warning/25">
            Tinjau <span className="ml-2 text-status-warning">{counts.tinjau}</span>
          </Pill>
          <Pill className="bg-status-success-bg text-status-success border-status-success/25">
            Sesuai <span className="ml-2 text-status-success">{counts.lulus}</span>
          </Pill>
        </div>
      </div>

      <div className="divide-y divide-border">
        {filtered.map((s, idx) => {
          const key = `${s.sppgName}-${s.vendorId}-${idx}`
          const isExpanded = expandedKey === key
          const status = overallStatus(s)

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="bg-surface"
            >
              <button
                onClick={() => setExpandedKey(isExpanded ? null : key)}
                aria-expanded={isExpanded}
                className={cn(
                  "w-full px-5 py-4 text-left transition-colors sm:px-6",
                  "hover:bg-surface-raised/60"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {s.vendorName}
                      </p>
                      <Pill>{s.sppgName}</Pill>
                      <StatusBadge status={status} />
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-4">
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Package className="size-4 text-role-badge" aria-hidden />
                        {s.deliveredCount > 0
                          ? `${s.deliveredCount} manifest terkirim`
                          : "Belum ada manifest terkirim"}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="size-4 text-status-warning" aria-hidden />
                        {s.mismatch.withNotes > 0
                          ? `${s.mismatch.withNotes} catatan kualitas`
                          : "Tanpa catatan kualitas"}
                      </span>
                      {s.mismatch.qtyDiff > 0 ? (
                        <span className="flex items-center gap-1 text-sm text-status-danger">
                          <XCircle className="size-4" aria-hidden />
                          Selisih {s.mismatch.qtyDiff} porsi
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <ChevronDown
                    className={cn(
                      "mt-1 size-5 shrink-0 text-muted-foreground transition-transform",
                      isExpanded && "rotate-180"
                    )}
                    aria-hidden
                  />
                </div>
              </button>

              <AnimatePresence>
                {isExpanded ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-1 sm:px-6">
                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                        {(
                          [
                            { key: "barang", label: "Barang diterima" as const },
                            { key: "kuantitas", label: "Kuantitas sesuai" as const },
                            { key: "kualitas", label: "Kualitas sesuai" as const },
                          ] as const
                        ).map((it) => {
                          const cfg = checkLabel(s.checks[it.key])
                          const Icon = cfg.icon
                          return (
                            <div
                              key={it.key}
                              className="rounded-xl border border-border bg-surface-raised p-4"
                            >
                              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                {it.label}
                              </p>
                              <div className="mt-2 flex items-center gap-2">
                                <Icon className={cn("size-4", cfg.cls)} aria-hidden />
                                <p className={cn("text-sm font-semibold", cfg.cls)}>
                                  {cfg.label}
                                </p>
                              </div>
                              {it.key === "kuantitas" && s.mismatch.qtyDiff > 0 ? (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  Selisih total:{" "}
                                  <span className="font-semibold text-status-danger tabular-nums">
                                    {s.mismatch.qtyDiff}
                                  </span>{" "}
                                  porsi
                                </p>
                              ) : null}
                              {it.key === "kualitas" && s.mismatch.withNotes > 0 ? (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  Manifest dengan catatan:{" "}
                                  <span className="font-semibold tabular-nums">
                                    {s.mismatch.withNotes}
                                  </span>
                                </p>
                              ) : null}
                            </div>
                          )
                        })}
                      </div>

                      <div className="mt-4 rounded-xl border border-border bg-surface p-4">
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                          Delivery terakhir
                        </p>
                        <p className="mt-1 text-sm font-semibold text-foreground tabular-nums">
                          {s.lastDeliveryAt ?? "—"}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Data ini bersifat demo dan mengambil agregasi dari `deliveryList`.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

