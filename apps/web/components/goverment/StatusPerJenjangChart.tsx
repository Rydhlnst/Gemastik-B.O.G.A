"use client"

import { useMemo, memo } from "react"
import { useDashboardFilter } from "./DashboardFilterContext"
import { getStatusPerJenjang, type JenjangStatusData } from "@/lib/mbgdummydata"
import { motion } from "framer-motion"

const SEG_CONFIG = {
  delivered:  { color: "#10b981", label: "Terkirim",   shape: "●" },
  on_transit: { color: "#f59e0b", label: "On-Transit",  shape: "▲" },
  pending:    { color: "#94a3b8", label: "Pending",     shape: "—" },
  gagal:      { color: "#ef4444", label: "Gagal",       shape: "✕" },
} as const

type SegKey = keyof typeof SEG_CONFIG

const JENJANG_COLOR: Record<string, string> = {
  SD: "#f43f5e",
  SMP: "#6366f1",
  SMA: "#64748b",
}

export const StatusPerJenjangChart = memo(function StatusPerJenjangChart() {
  const { filter } = useDashboardFilter()
  const allData: JenjangStatusData[] = useMemo(
    () => getStatusPerJenjang(filter.periode).sort((a, b) => a.completionPct - b.completionPct),
    [filter.periode]
  )
  // Apply global jenjang filter — show all if none selected
  const data = useMemo(
    () => filter.jenjang.length
      ? allData.filter((d) => filter.jenjang.includes(d.jenjang as any))
      : allData,
    [allData, filter.jenjang]
  )

  if (!data.length) return null

  const maxTotal = Math.max(...data.map((d) => d.total), 1)

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 mb-0.5">
            Status per Jenjang
          </p>
          <p className="text-xs font-bold text-slate-600">Breakdown distribusi pengiriman</p>
        </div>

        {/* Legend — shape + color (WCAG colorblind-safe) */}
        <div className="flex items-center gap-3" aria-label="Legenda status">
          {(Object.entries(SEG_CONFIG) as [SegKey, typeof SEG_CONFIG[SegKey]][]).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1">
              <span className="text-[11px]" style={{ color: cfg.color }} aria-hidden>{cfg.shape}</span>
              <span className="text-[8px] font-bold text-slate-500">{cfg.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4" role="list" aria-label="Status pengiriman per jenjang">
        {data.map((row) => {
          const segs: { key: SegKey; count: number }[] = [
            { key: "gagal",      count: row.gagal },
            { key: "pending",    count: row.pending },
            { key: "on_transit", count: row.on_transit },
            { key: "delivered",  count: row.delivered },
          ]
          const completionOk = row.completionPct >= 80

          return (
            <div key={row.jenjang} className="flex items-center gap-4" role="listitem">
              {/* Jenjang dot + label */}
              <div className="flex items-center gap-1.5 w-14 shrink-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: JENJANG_COLOR[row.jenjang] }}
                  aria-hidden
                />
                <span className="text-[10px] font-black text-slate-700">{row.jenjang}</span>
              </div>

              {/* Stacked bar */}
              {row.total > 0 ? (
                <div
                  className="flex-1 flex h-6 rounded-lg overflow-hidden gap-px bg-slate-50"
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
                        style={{ background: SEG_CONFIG[key].color, minWidth: pct > 8 ? undefined : 0 }}
                        title={`${SEG_CONFIG[key].label}: ${count}`}
                      >
                        {pct > 12 && (
                          <span className="text-[8px] font-black text-white mix-blend-overlay">
                            {count}
                          </span>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex-1 h-6 rounded-lg bg-slate-100 flex items-center px-2">
                  <span className="text-[9px] text-slate-400 font-bold">Tidak ada data</span>
                </div>
              )}

              {/* Completion % — anchored */}
              <div className="w-20 shrink-0 text-right">
                <span
                  className={`text-[11px] font-black ${completionOk ? "text-emerald-600" : "text-red-600"}`}
                  aria-label={`${row.completionPct}% selesai`}
                >
                  {completionOk ? "●" : "✕"} {row.completionPct}% selesai
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})
