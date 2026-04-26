"use client"

import { useMemo, memo } from "react"
import { motion } from "framer-motion"

import { useDashboardFilter } from "./DashboardFilterContext"
import { getStatusPerJenjang, type JenjangStatusData } from "@/lib/mbgdummydata"

type SegKey = "delivered" | "on_transit" | "pending" | "gagal"

const SEG_CONFIG: Record<
  SegKey,
  { label: string; shape: string; color: string }
> = {
  delivered: {
    label: "Terkirim",
    shape: "●",
    color: "hsl(var(--status-success))",
  },
  on_transit: {
    label: "On-Transit",
    shape: "▲",
    color: "hsl(var(--status-info))",
  },
  pending: {
    label: "Pending",
    shape: "—",
    color: "hsl(var(--status-pending))",
  },
  gagal: {
    label: "Gagal",
    shape: "✕",
    color: "hsl(var(--status-danger))",
  },
}

function jenjangDot(jenjang: string) {
  if (jenjang === "SD") return "hsl(var(--status-warning))"
  if (jenjang === "SMP") return "hsl(var(--role-primary))"
  return "hsl(var(--status-pending))"
}

export const StatusPerJenjangChart = memo(function StatusPerJenjangChart() {
  const { filter } = useDashboardFilter()

  const allData: JenjangStatusData[] = useMemo(
    () =>
      getStatusPerJenjang(filter.periode).sort(
        (a, b) => a.completionPct - b.completionPct
      ),
    [filter.periode]
  )

  const data = useMemo(
    () =>
      filter.jenjang.length
        ? allData.filter((d) => filter.jenjang.includes(d.jenjang as any))
        : allData,
    [allData, filter.jenjang]
  )

  if (!data.length) return null

  return (
    <section className="bg-surface rounded-[var(--radius-lg)] border border-border p-5 shadow-card">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Status per Jenjang
          </p>
          <p className="mt-0.5 text-sm font-semibold text-foreground">
            Breakdown distribusi pengiriman
          </p>
        </div>

        <div className="flex items-center gap-3" aria-label="Legenda status">
          {(Object.keys(SEG_CONFIG) as SegKey[]).map((key) => (
            <div key={key} className="flex items-center gap-1">
              <span className="text-sm" style={{ color: SEG_CONFIG[key].color }} aria-hidden>
                {SEG_CONFIG[key].shape}
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                {SEG_CONFIG[key].label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4" role="list" aria-label="Status pengiriman per jenjang">
        {data.map((row) => {
          const segs: { key: SegKey; count: number }[] = [
            { key: "gagal", count: row.gagal },
            { key: "pending", count: row.pending },
            { key: "on_transit", count: row.on_transit },
            { key: "delivered", count: row.delivered },
          ]

          const completionOk = row.completionPct >= 80

          return (
            <div key={row.jenjang} className="flex items-center gap-4" role="listitem">
              <div className="flex items-center gap-2 w-16 shrink-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: jenjangDot(row.jenjang) }}
                  aria-hidden
                />
                <span className="text-sm font-semibold text-foreground">{row.jenjang}</span>
              </div>

              {row.total > 0 ? (
                <div
                  className="flex-1 flex h-7 rounded-[var(--radius-md)] overflow-hidden gap-px bg-muted/30 border border-border"
                  role="img"
                  aria-label={`${row.jenjang}: ${row.delivered} terkirim, ${row.on_transit} on-transit, ${row.pending} pending, ${row.gagal} gagal dari ${row.total} total`}
                >
                  {segs.map(({ key, count }) => {
                    if (count === 0) return null
                    const pct = (count / row.total) * 100
                    return (
                      <motion.div
                        key={key}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="h-full flex items-center justify-center"
                        style={{
                          background: SEG_CONFIG[key].color,
                          minWidth: pct > 8 ? undefined : 0,
                        }}
                        title={`${SEG_CONFIG[key].label}: ${count}`}
                      >
                        {pct > 14 && (
                          <span className="text-xs font-semibold text-white/90 mix-blend-overlay tabular-nums">
                            {count}
                          </span>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex-1 h-7 rounded-[var(--radius-md)] bg-muted/20 border border-border flex items-center px-3">
                  <span className="text-xs text-muted-foreground font-semibold">
                    Tidak ada data
                  </span>
                </div>
              )}

              <div className="w-24 shrink-0 text-right">
                <span
                  className={`text-xs font-semibold tabular-nums ${
                    completionOk ? "text-status-success" : "text-status-danger"
                  }`}
                  aria-label={`${row.completionPct}% selesai`}
                >
                  {completionOk ? "●" : "✕"} {row.completionPct}% selesai
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
})

